import pubClient from "../app.js";
import client from "../app.js";
import { sendMessage, sendMessage2 } from "../utils/helpers.service.js";
import {
  ai,
  getApiCodes,
  getConvKey,
  parseInvalidJson,
} from "../utils/lll.service.js";
import { GoogleGenAI, Type } from "@google/genai";
export const createDBWithLlmCall = async (req, res) => {
  let it;
  try {
    const { prompt, message, projectId } = req.body;
    const userId = req.user?._id;
    pubClient.publish("userChat", JSON.stringify({ message, projectId }));
    console.log(prompt, message, userId);
    if (!prompt)
      return res
        .status(400)
        .json({ message: "Prompt is required", success: false });
    const smallLLMResponse = await getConvKey(
      prompt,
      message,
      projectId,
      userId
    );

    if (smallLLMResponse?.initialResponse) {
      pubClient.publish(
        "smallLLMResponse",
        JSON.stringify({
          message: smallLLMResponse?.initialResponse,
          projectId,
          userId,
        })
      );
    }
    if (smallLLMResponse?.isDbCall === false) {
      smallLLMResponse.entities = [];
      smallLLMResponse.relationships = [];
      smallLLMResponse.finalExplanation = "";
      smallLLMResponse.migrationPlan = "";
      return res.json({
        data: smallLLMResponse,
        success: true,
        dbConvKey: smallLLMResponse?.dbConvKey,
        projectId: projectId,
      });
    }
    let id = await pubClient.hGet("onlineUsers", userId);
    id = JSON.parse(id);
    if (id) {
      var { socketId } = id;
      if (smallLLMResponse?.initialResponse) {
        sendMessage2(socketId, smallLLMResponse?.initialResponse, projectId);
      }
    }
    if (smallLLMResponse?.isDbCall === true && smallLLMResponse?.dbConvKey) {
      let cachedData = await client.get(smallLLMResponse.dbConvKey);
      if (cachedData) {
        cachedData = JSON.parse(cachedData);
        console.log("Cache hit");
        pubClient.publish(
          "apiCode",
          JSON.stringify({
            data: cachedData,
            projectId,
            userId,
            dbConvKey: smallLLMResponse.dbConvKey,
          })
        );
        pubClient.publish(
          "fullLLMResponse",
          JSON.stringify({
            data: cachedData,
            projectId,
            userId,
          })
        );
        cachedData.dbConvKey = smallLLMResponse?.dbConvKey;
        cachedData.projectId = projectId;
        return res.status(200).json({
          message: "Cache hit",
          success: true,
          data: cachedData,
        });
      }
    }

    console.log("smallLLMResponse?.dbConvKey", smallLLMResponse?.dbConvKey);

    if (id) {
      let index = 0;
      console.log("socketId", socketId);
      console.log("projectId", projectId);

      sendMessage(socketId, index++, projectId);
      it = setInterval(() => {
        sendMessage(socketId, index++, projectId);
      }, 5000);
    }

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: [],
      config: {
        systemInstruction: `You are SchemaGen, an expert database architect AI.
    Task:
    Convert user requirements into a strict JSON schema.
 IMPORTANT: Always respond in EXACTLY this JSON format. 
Never respond in plain text. If clarification is needed, put it inside "initialResponse" as text, but still return a valid JSON object.
Must place 3 schema in the same layer(eg: first layer => user => post => comment => like =>reel)
Must, arrange entities logically according to their relationships (e.g., place central entities in the middle and group closely related entities around them (eg: user have relationship with post, post have relationship with comment so place user at center others at the Surrounding area)) to make the ERD easier to read
There must be a 120px gap between schemas (both horizontally and vertically) and each schema node have height of 250-500px and width of 250-500px. 

    Rules:
    1. Output ONLY a valid JSON object (no Markdown, no extra text).
    2.Always output the FULL schema for the app type (include all essential entities even if user doesn’t mention them).Whenever a user asks for an app (clone or custom), generate a complete, production-ready schema with all essential entities, not just the ones mentioned. Infer missing parts from industry standards. Always output the full schema for a real-world app.
       Example: "Instagram clone" must include User, Post, Reel, Story, Comment, Like, Follow.
    3.If user specifies extra features (e.g., Marketplace, Groups), extend on top of the full baseline.
    4.Never output a minimal schema.
    5.Default DB: Postgres if the user does not specify.
    6.If the user specifies a DB → output only for that DB.
    7. If the user gives a clear app idea (e.g., e-commerce, Instagram clone) → infer entities/relationships yourself (no clarifications needed).
    8. If the user is vague, ask clarifying questions in a friendly, simple,little playful , natural and humble way. Keep it clear, approachable, and engaging, and always respond only in JSON format, exactly as shown below. Your response should include the initialResponse along with all relevant entities and relationships, and it should feel playful and charming and little fun while helping them.
    9. If the user asks to generate schemas for more than one database at the same time (e.g., "create Uber database in MongoDB and Postgres") → ask them to choose only one database before proceeding.
    10.The position in the JSON format represents the coordinates of an entity in the UI. It is required, and it is your job to assign positions such that: 1.No two schemas overlap. 2.Each schema has dimensions of 200-500px width and 200-500px height.
    11. Never use any user name, if user explicitly said also never use the username in the response. make sure your response irrespective of history every response must be able to cache the response.
    12. Never include the position(entities.pos) details in the response.
    JSON format:
    {
      "initialResponse": "string -- Initial response from AI.It must be below 50 words. Just tell what u are going to do. here no need to express any feelings. Note: Fields under 'entities' are general, human-readable so developers can understand them irrespective of DB. Actual database-specific implementation is in the 'schemas' section. only give text in this field",
      "entities": [
        {
          "name": "string",
          "description": "string",
          "fields": [
            {
              "name": "string",
              "primaryKey": true|false, // only if needed
              "type": "string",
              "required": true|false,
              "unique": true|false,
              "reference": "EntityName" | null
            }
         ],
         "pos": { x: number, y: number },
        "code":"string -- (postgres:Sequelize model code for Postgres,mysql:Sequelize model code for MySQL , mongodb:Mongoose Schema code for MongoDB , dynamodb: AWS DynamoDB table definition code (Node.js) , neo4j:Neo4j Cypher CREATE statements (Node.js or Cypher console))  ready to copy-paste"
        }
      ],
      "relationships": [
        {
          "source": "string",
          "target": "string",
          "type": "one-to-one | one-to-many | many-to-many",
          "description": "string"
        }
      ],
    "finalExplanation": " A step-by-step Max 500 words(in 500 words only u have to explain completely) explanation of the schema u designed and how it is useful for the app. Use numbered steps and numbered points. This must be included in every response. If no code is written, just send an empty string; otherwise, provide the full details. Note:Never give any coding part here. Only give text in this field",
      "migrationPlan": "string -- step-by-step SQL migration if schema updated"
    }
    Rules for code(Inside entities.code):
    1. Always provide fully working code, not just plain JSON or SQL strings.
    2. Use idiomatic code for each database (e.g., Mongoose for MongoDB, Sequelize for Postgres/MySQL).
    3. Include a basic example with at least a User and Post model.
    4. Ensure the code is ready to copy and paste into a project without modifications.
    5. Provide the code for user specified Database only (e.g., Postgres, MySQL, MongoDB, DynamoDB, Neo4j) if not specified default to Postgres.
    6. After completing the code, add two line spaces do this for all entities:
    `,
      },
    });
    const response = await chat.sendMessage({
      message: smallLLMResponse?.dbPrompt,
    });
    if (it) {
      clearInterval(it);
    }

    let raw = response?.candidates[0]?.content.parts[0]?.text;
    raw = raw.replace(/```json|```/g, "").trim();
    let json = parseInvalidJson(raw);
    const { promptTokenCount, totalTokenCount, candidatesTokenCount } =
      response?.usageMetadata;
    pubClient.publish(
      "token",
      JSON.stringify({
        projectId,
        userId,
        promptTokens: promptTokenCount,
        totalTokens: totalTokenCount,
        completionTokens: candidatesTokenCount,
      })
    );
    pubClient.publish(
      "apiCode",
      JSON.stringify({
        data: json,
        projectId,
        userId,
        dbConvKey: smallLLMResponse.dbConvKey,
      })
    );
    pubClient.publish(
      "fullLLMResponse",
      JSON.stringify({
        data: json,
        projectId,
        userId,
      })
    );
    await client.set(smallLLMResponse?.dbConvKey, JSON.stringify(json));
    json.dbConvKey = smallLLMResponse?.dbConvKey;
    json.projectId = projectId;
    return res.json({
      data: json,
      token: response.usageMetadata,
      success: true,
    });
  } catch (error) {
    if (it) {
      clearInterval(it);
    }

    const { projectId } = req.body;

    const userId = req.user?._id;
    pubClient.publish(
      "apiError",
      JSON.stringify({
        projectId,
        userId: req.user._id,
        text: "Sorry for the inconvenience, Our Model is overLoaded please try again later",
      })
    );
    let id = await pubClient.hGet("onlineUsers", userId);
    id = JSON.parse(id);
    const { socketId } = id;
    sendMessage2(
      socketId,
      "Something went wrong ,Sorry for the inconvenience Please try again later",
      projectId,
      true
    );
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error in main" + error, success: false });
  }
};
export const suggestionModel = async (req, res) => {
  console.log("hit the suggestion route");
  try {
    const { title, description } = req.body;
    if (!title) {
      return res
        .status(400)
        .json({ message: "Title is required", success: false });
    }

    const chat = ai.chats.create({
      model: "gemini-2.5-flash-lite",
      history: [],
      config: {
        systemInstruction: `
You are DBDescGen, an expert AI that generates concise, database-focused project descriptions.

Task:

Generate a short, clear, maximum 70-word description of the database for any app or project. Focus on key entities, relationships, and core database functionality. Include core entities even if the user does not explicitly mention them. Prioritize real-world, production-ready design.

Rules:

Respond in JSON format ONLY.

Output only one field: "description".

Include key entities required for production (e.g., Admin, User, Post, Comment, Order, Product, Payment, etc., depending on app type).

Do not include full schema, fields, or modules.

Be concise, professional, and database-focused.

Include the title of the project/app in the response.

If the user specifies a database (MongoDB, MySQL, PostgreSQL, Redis, Neo4j, etc.), mention it in the description.

If no database is specified, default to PostgreSQL.

Limit output to maximum 70 words.

JSON Format Example:

User says: "Social media app using MongoDB":

{
  "description": "Database for 'Social Media App' using MongoDB, including key entities: Admin, User, Post, Comment, Like, Follow, Story, Reel, Hashtag, Notifications. Designed for core database functionality, scalability, and performance in a real-world production environment."
}


User says: "E-commerce platform" (no DB specified):

{
  "description": "Database for 'E-Commerce Platform' using PostgreSQL, including key entities: Admin, User, Product, Category, Cart, Order, Payment, Shipment, Review, Inventory, Wishlist. Designed for core database functionality, relationships, and scalable production-ready performance."
}


    `,
      },
    });

    const response = await chat.sendMessage({
      message: `title: ${title} + " " + description: ${description}`,
    });
    let raw = response?.candidates[0]?.content.parts[0]?.text;
    raw = raw.replace(/```json|```/g, "").trim();
    let json = JSON.parse(raw);
    return res.json({
      data: json,
      token: response.usageMetadata,
      success: true,
      message: "Description generated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
export const PromptGenerator = async (req, res) => {
  console.log("hit the prompt route");
  try {
    const { title, description } = req.body;
    if (!title) {
      return res
        .status(400)
        .json({ message: "Title is required", success: false });
    }

    const chat = ai.chats.create({
      model: "gemini-2.5-flash-lite",
      history: [],
      config: {
        systemInstruction: `
     You are DBDescGen, an expert AI that generates concise, production-ready database-focused project prompts for any app or project.

Task:

Generate a short, clear, maximum 100-word description of the database. Focus on all essential entities required for a production-ready system. Include core entities even if the user does not mention them. Prioritize entities based on real-world app standards.

Rules:

Respond in JSON format ONLY.

Output only one field: "prompt".

Include all production-required entities (e.g., Admin, User, Post, Comment, Like, Follow, Story, Reel, Hashtag, Notifications, etc., depending on app type). Do not omit important entities for brevity.

Be concise, professional, database-focused, and human-readable.

Include the title of the project/app in the response.

If the user explicitly specifies a database (MongoDB, MySQL, PostgreSQL, Redis, Neo4j, etc.), include that database language in the description.

If no database is mentioned, default to PostgreSQL.

No need to include relationships or fields, only entities in the description.

JSON Format Example:

User says: "Social media app using MongoDB":

{
  "prompt": "Create a database for 'Social Media App' using MongoDB. Include all essential entities for production: Admin, User, Post, Comment, Like, Follow, Story, Reel, Hashtag, Notifications, Messages, Media, Settings, Reports. Ensure the design supports scalability, performance, and real-world app requirements."
}


User says: "E-commerce platform" (no DB specified):

{
  "prompt": "Create a database for 'E-Commerce Platform' using PostgreSQL. Include all essential entities for production: Admin, User, Product, Category, Cart, Order, Payment, Shipment, Review, Inventory, Coupons, Wishlist, Notifications, Analytics. Ensure the design supports scalability, performance, and real-world app requirements."
}

    `,
      },
    });

    const response = await chat.sendMessage({
      message: `title: ${title} + " " + description: ${description}`,
    });
    let raw = response?.candidates[0]?.content.parts[0]?.text;
    raw = raw.replace(/```json|```/g, "").trim();
    let json = JSON.parse(raw);
    return res.json({
      data: json,
      token: response.usageMetadata,
      success: true,
      message: "Prompt generated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
