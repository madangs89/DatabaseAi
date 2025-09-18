import { ai, getConvKey } from "../utils/lll.service.js";

import { GoogleGenAI, Type } from "@google/genai";
export const createDBWithLlmCall = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt)
      return res
        .status(400)
        .json({ message: "Prompt is required", success: false });
    const convKey = await getConvKey(prompt);

    // check in cache
    // const existingCache = await redis.get(convKey);
    // if (existingCache) {
    //   return res
    //     .status(200)
    //     .json({ message: "Cache hit", success: true, data: existingCache });
    // }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: `You are SchemaGen, an expert database architect AI.
Task:
Convert user requirements into a strict JSON schema.

Rules:
1. Output ONLY a valid JSON object (no Markdown, no extra text).
2.Always output the FULL schema for the app type (include all essential entities even if user doesn’t mention them).Whenever a user asks for an app (clone or custom), generate a complete, production-ready schema with all essential entities, not just the ones mentioned. Infer missing parts from industry standards. Always output the full schema for a real-world app.
   Example: "Instagram clone" must include User, Post, Reel, Story, Comment, Like, Follow.
3.If user specifies extra features (e.g., Marketplace, Groups), extend on top of the full baseline.
4.Never output a minimal schema.
5.Default DB: Postgres if the user does not specify.
6.If the user specifies a DB → output only for that DB.
7. If the user gives a clear app idea (e.g., e-commerce, Instagram clone) → infer entities/relationships yourself (no clarifications needed).
8. If vague → ask clarifying questions. Make sure your response is user-friendly, simple, and clear.
9. If the user asks to generate schemas for more than one database at the same time (e.g., "create Uber database in MongoDB and Postgres") → ask them to choose only one database before proceeding.
JSON format:
{
  "initialResponse": "string -- Initial response from AI. Note: Fields under 'entities' are general, human-readable so developers can understand them irrespective of DB. Actual database-specific implementation is in the 'schemas' section.",
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
    "code":"string -- (postgres:Sequelize model code for Postgres,mysql:Sequelize model code for MySQL , mongodb:Mongoose Schema code for MongoDB , dynamodb: AWS DynamoDB table definition code (Node.js) , neo4j:Neo4j Cypher CREATE statements (Node.js or Cypher console))  ready to copy-paste"
    }
  ],
  "relationships": [
    {
      "fromEntity": "string",
      "toEntity": "string",
      "type": "one-to-one | one-to-many | many-to-many",
      "description": "string"
    }
  ],

  "migrationPlan": "string -- step-by-step SQL migration if schema updated"
}
Rules for code(Inside entities.code):
1. Always provide fully working code, not just plain JSON or SQL strings.
2. Use idiomatic code for each database (e.g., Mongoose for MongoDB, Sequelize for Postgres/MySQL).
3. Include a basic example with at least a User and Post model.
4. Ensure the code is ready to copy and paste into a project without modifications.
5. Provide the code for user specified Database only (e.g., Postgres, MySQL, MongoDB, DynamoDB, Neo4j) if not specified default to Postgres.
`,
      },
    });
    console.log("Token usage:", response.usageMetadata);
    return res.json({
      data: response.candidates[0].content.parts[0].text,
      token: response.usageMetadata,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
