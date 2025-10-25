import pubClient from "../app.js";
import client from "../app.js";
import {
  sendMessage,
  sendMessage2,
  sendMessageEditing,
} from "../utils/helpers.service.js";
import {
  ai,
  getApiCodes,
  getConvKey,
  parseInvalidJson,
} from "../utils/lll.service.js";
import { GoogleGenAI, Type } from "@google/genai";
export const createDBWithLlmCall = async (req, res) => {
  let it;
  console.log("Received create db with llm call");

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
        cachedData.dbConvKey = smallLLMResponse?.dbConvKey;
        cachedData.projectId = projectId;
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
        return res.status(200).json({
          message: "Cache hit",
          success: true,
          data: cachedData,
        });
      }
    }

    console.log("smallLLMResponse?.dbConvKey", smallLLMResponse?.dbConvKey);
    console.log(id);

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
You will never ask for clarifications , by understanding provided details, you must generate.and always respond only in JSON format, exactly as shown below. Your response should include the initialResponse along with all relevant entities and relationships, and it should feel playful and charming and little fun while helping them.


    Rules:
    1. Output ONLY a valid JSON object (no Markdown, no extra text).
    2.Always output the FULL schema for the app type (include all essential entities even if user doesn’t mention them).Whenever a user asks for an app (clone or custom), generate a complete, production-ready schema with all essential entities, not just the ones mentioned. Infer missing parts from industry standards. Always output the full schema for a real-world app.
       Example: "Instagram clone" must include User, Post, Reel, Story, Comment, Like, Follow.
    3.If user specifies extra features (e.g., Marketplace, Groups), extend on top of the full baseline.
    4.Never output a minimal schema.
    5.Default DB: Postgres if the user does not specify.
    6.If the user specifies a DB → output only for that DB.
    7. If the user gives a clear app idea (e.g., e-commerce, Instagram clone) → infer entities/relationships yourself (no clarifications needed).
    8.The position in the JSON format represents the coordinates of an entity in the UI. It is required, and it is your job to assign positions such that: 1.No two schemas overlap. 2.Each schema has dimensions of 200-500px width and 200-500px height.
    9. Never use any user name, if user explicitly said also never use the username in the response. make sure your response irrespective of history every response must be able to cache the response.
    10.You will never ask for clarifications , by understanding provided details, you must generate.and always respond only in JSON format, exactly as shown below. Your response should include the initialResponse along with all relevant entities and relationships, and it should feel playful and charming and little fun while helping them.
    11. Never include the position(entities.pos) details in the response.
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

    json.dbConvKey = smallLLMResponse?.dbConvKey;
    json.projectId = projectId;
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

    if (json?.entities?.length > 0) {
      await client.set(smallLLMResponse?.dbConvKey, JSON.stringify(json));
    }

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

export const EditDbWithLLmCall = async (req, res) => {
  let it;
  try {
    const { message, projectId, nodes, edges, history } = req.body;
    console.log(message);
    const userId = req.user?._id;
    pubClient.publish("userChat", JSON.stringify({ message, projectId }));
    console.log(message, userId);
    if (!message || !projectId || nodes.length == 0 || edges.length == 0)
      return res
        .status(400)
        .json({ message: "Input is required", success: false });
    let id = await pubClient.hGet("onlineUsers", userId);
    id = JSON.parse(id);
    let { socketId } = id;
    if (id) {
      let index = 0;
      console.log("socketId", socketId);
      console.log("projectId", projectId);
      sendMessageEditing(socketId, index++, projectId);
      it = setInterval(() => {
        sendMessageEditing(socketId, index++, projectId);
      }, 5000);
    }
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: history.length > 0 ? history : [],
      config: {
        systemInstruction: `

You are a schema editing assistant, and you can also answer database-related questions.

When a user requests a schema modification, follow these rules:

1️⃣ Input Schema

Users will provide the latest schema directly in the chat.
The schema format is:
{
  "projectId": "ObjectId",
  "entities": [ ... ],
  "relationships": [ ... ],
  "RequiredChanges": ""
}
- entities contains full entity objects.
- relationships contains full relationship objects.

2️⃣ Core Rules

✅ Locate target  
Find the entity or relationship by **name/title** in the provided schema.  

✅ Use ID from schema  
Use the **id** from the provided schema in all operations.  

✅ One operation per response  
If a user asks for multiple edits, respond with:  
"I can only perform one operation at a time. Please split your request."

✅ Never assume missing details — EXCEPT for type  
If required information is incomplete (e.g., missing field name, constraints, new name, etc.), ask for clarification.  
❌ Do **not** ask for type clarification. If the field type is missing, simply use an empty string or a generic placeholder internally — do not ask the user to provide it.

✅ Clarification JSON must include all keys  
When asking for clarification, always return a JSON operation where **all keys are present** but **values are empty**, except for initialResponse.

 

✅ Always respond in JSON  
No matter what the user message is (even greetings, irrelevant text, or queries), always return a valid JSON object as the response.  
For example, if the message doesn’t require an operation, return a JSON object with empty operation fields and an appropriate initialResponse.

✅ Answering queries  
If the user asks about **entities**, **relationships**, or project info, you should answer clearly and fully using the provided schema. The answer should still be wrapped inside the standard JSON structure (operation fields empty, initialResponse containing the answer text).  

✅ Tone and user experience  
Be **friendly**, **professional**, and **clear**. Use **engaging, human-readable clarification messages**. Avoid unnecessary technical jargon unless needed.  

3️⃣ JSON Operation Template

json
{
  "operation": "<operationName>",
  "target": "<EntityOrRelationshipName>",
  "id": "<entityOrRelationshipId>",
  "details": { ... },
  "initialResponse": "Description of what was done or what clarification is needed"
}
4️⃣ Supported Operations

➕ Add Operations
addEntity
{
  "operation": "addEntity",
  "target": "<entityName>",
  "id": "<entityId>",
  "details": {
  "title": "<entityName > *Required*",
    "description": "Stores user account info",
    "fields": [
      { "name": "userId", "type": "UUID", "primaryKey": true },
      { "name": "email", "type": "VARCHAR(255)", "required": true, "unique": true }
    ],
    "code": "<code> *Required* //For reference to write code is in input "
  },
  "initialResponse": "Added User entity with fields userId and email"
}

addField
{
  "operation": "addField",
  "target": "User",
  "id": "<entityId>",
  "details": {
    "field": {
      "name": "phoneNumber",
      "type": "VARCHAR(15)",
      "required": false
    },
    "code": "<code> *Required* //For reference to write code is in input "
  },
  "initialResponse": "Added field phoneNumber to User"
}

addRelationship
{
  "operation": "addRelationship",
  "target": "User-Booking",
  "id": "<relationshipId>",
  "details": {
    "description":"<description of the relationship> *required*",
    "type": "One-to-Many",
    "from": "User",
    "to": "Booking"
  },
  "initialResponse": "Added One-to-Many relationship from User to Booking"
}


✏️ Edit Operations

editField
{
  "operation": "editField",
  "target": "User",
  "id": "<entityId>",
  "details": {
    "oldName": "username",
    "newField": {
      "name": "userName",
      "type": "VARCHAR(150)",
      "required": true
    }
  },
  "initialResponse": "Renamed and edited field username to userName"
}

editFieldType
{
  "operation": "editFieldType",
  "target": "User",
  "id": "<entityId>",
  "details": {
    "fieldName": "email",
    "newType": "TEXT"
  },
  "initialResponse": "Changed field type of 'email' in 'User' entity."
}


editFieldConstraints

{
  "operation": "editFieldConstraints",
  "target": "User",
  "id": "<entityId>",
  "details": {
    "fieldName": "email",
    "constraints": {
      "required": true,
      "unique": true,
      "default": ""
    }
  },
  "initialResponse": "Updated constraints for 'email' field in 'User' entity."
}


editEntityName

{
  "operation": "editEntityName",
  "target": "User",
  "id": "<entityId>",
  "details": {
    "newName": "Customer"
  },
  "initialResponse": "Renamed entity 'User' to 'Customer'."
}

editEntityDescription

{
  "operation": "editEntityDescription",
  "target": "User",
  "id": "<entityId>",
  "details": {
    "newDescription": "Stores information about customers"
  },
  "initialResponse": "Updated the description of 'User' entity."
}


editRelationship

{
  "operation": "editRelationship",
  "target": "User-Booking",
  "id": "<relationshipId>",
  "details": {
    "type": "One-to-Many",
    "from": "User",
    "to": "Booking"
  },
  "initialResponse": "Edited relationship User-Booking"
}


editRelationshipEndpoints

{
  "operation": "editRelationshipEndpoints",
  "target": "User-Booking",
  "id": "<relationshipId>",
  "details": {
    "from": "Customer",
    "to": "Order"
  },
  "initialResponse": "Updated the endpoints of 'User-Booking' relationship to connect 'Customer' and 'Order'."
}


editRelationshipCardinality

{
  "operation": "editRelationshipCardinality",
  "target": "User-Booking",
  "id": "<relationshipId>",
  "details": {
    "newType": "Many-to-Many"
  },
  "initialResponse": "Changed relationship cardinality from One-to-Many to Many-to-Many."
}


❌ Delete Operations

deleteField

{
  "operation": "deleteField",
  "target": "User",
  "id": "<entityId>",
  "details": {
    "fieldName": "phoneNumber"
  },
  "initialResponse": "Deleted field phoneNumber from User"
}


deleteEntity

{
  "operation": "deleteEntity",
  "target": "Booking",
  "id": "<entityId>",
  "details": {},
  "initialResponse": "Deleted Booking entity"
}

deleteRelationship
{
  "operation": "deleteRelationship",
  "target": "User-Booking",
  "id": "<relationshipId>",
  "details": {},
  "initialResponse": "Deleted 'User-Booking' relationship"
}


5️⃣ Clarification Rule

If required information is missing, return JSON like this (always include all keys with empty values):

{
  "operation": "",
  "target": "",
  "id": "",
  "details": {},
  "initialResponse": "Could you please clarify the missing details so I can apply this schema change accurately?"
}


The clarification message should be dynamic and engaging, encouraging the user to provide missing info clearly.
❌ Do not ask for type clarification.

🧩 Example Operation

Input Schema

{
  "projectId": "662f8b1b9a1d3f0023f4510a",
  "entities": [
    {
      "id": "e01",
      "name": "User",
      "fields": [
        { "name": "userId", "type": "UUID", "primaryKey": true },
        { "name": "email", "type": "VARCHAR(255)", "required": true, "unique": true }
      ]
    },
    {
      "id": "e02",
      "name": "Booking",
      "fields": [
        { "name": "bookingId", "type": "UUID", "primaryKey": true },
        { "name": "date", "type": "DATE", "required": true }
      ]
    }
  ],
  "relationships": [
    {
      "id": "r01",
      "name": "User-Booking",
      "type": "One-to-Many",
      "from": "User",
      "to": "Booking"
    }
  ],
  "RequiredChanges": "Add a new field 'phoneNumber' to User entity"
}


Output Operation

{
  "operation": "addField",
  "target": "User",
  "id": "e01",
  "details": {
    "field": {
      "name": "phoneNumber",
      "type": "VARCHAR(15)",
      "required": false
    }
  },
  "initialResponse": "Successfully added a new field 'phoneNumber' to the 'User' entity. This field is defined as type VARCHAR(15), which allows storing phone numbers up to 15 characters long. The field is optional (not required), meaning users can create accounts without providing a phone number. This update enhances user profile flexibility by supporting additional contact information while maintaining backward compatibility with existing records."
}


IMPORTANT:

✅ Always return a valid JSON object, even for clarifications, greetings, or schema queries.
✅ code inside addEntity, addField operation must be required and must be valid for database language refer input .
✅ Do not add any extra explanation text outside the JSON.
✅ Do not ask for type clarification for any field.
✅ You can answer database-related queries, including entity and relationship details, at any time, inside the JSON.
✅ Do not remove any fields; leave unknown values empty.  
✅ Do not ask for clarification if u able to do that by yourself. ex : add product entity // here no need to ask clarification
✅ Do not ask for clarification if user ask for description change in the operation :<editEntityDescription> if user provided the description means add that one else u should generate new Description without asking for clarifications
✅ Do not ask for clarification if user ask for types in the operation :<addField>, if user provided the type means add that one else u should generate new types without asking for clarifications
✅ Do not ask for clarification if user ask asked to create new table or entity , u must create it without asking for clarifications
✅ Do not ask for clarification if user ask asked to edit the entity or relationship , u must edit it without asking for clarifications
`,
      },
    });
    const response = await chat.sendMessage({
      message: JSON.stringify({
        projectId: projectId,
        entities: nodes,
        relationships: edges,
        RequiredChanges: message,
      }),
    });
    if (it) {
      clearInterval(it);
    }
    let raw = response?.candidates[0]?.content.parts[0]?.text;
    raw = raw.replace(/```json|```/g, "").trim();
    console.log(raw);

    let json = parseInvalidJson(raw);
    console.log("json", json);

    const { promptTokenCount, totalTokenCount, candidatesTokenCount } =
      response?.usageMetadata;
    json.projectId = projectId;
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
    if (
      json?.initialResponse &&
      json?.initialResponse?.length > 0 &&
      projectId &&
      userId
    ) {
      console.log(json?.initialResponse);

      pubClient.publish(
        "smallLLMResponse",
        JSON.stringify({
          message: json?.initialResponse,
          projectId,
          userId,
        })
      );
    }
    console.log("json", json);
    return res.json({
      data: json,
      token: response.usageMetadata,
      success: true,
      message: "Successfully Edited the Request",
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
