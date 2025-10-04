import { GoogleGenAI, Type } from "@google/genai";
import pubClient from "../app.js";
import JSON5 from "json5";
export const ai = new GoogleGenAI({
  apiKey: "AIzaSyAlWQFfshR0bGzgXGvE2fs4QeU3__D42lg",
});

function customParse(raw) {
  const result = {};

  // Match each "filename": "content"
  try {
    const regex = /"([^"]+)":\s*"(.*?)"(?=,\n\s*"[^"]+":|,\n\s*}|$)/gs;
    let match;

    while ((match = regex.exec(raw)) !== null) {
      const filename = match[1];
      const rawContent = match[2];

      // Unescape common JSON escape sequences
      const content = rawContent
        .replace(/\\"/g, '"') // unescape quotes
        .replace(/\\n/g, "\n") // unescape newlines
        .replace(/\\t/g, "\t") // unescape tabs
        .replace(/\\\\/g, "\\"); // unescape backslashes

      result[filename] = content;
    }
  } catch (error) {
    console.error("Error parsing JSON:", error);
  }
  console.log("Custom parser work done");

  return result;
}

export const parseInvalidJson = (raw) => {
  try {
    return JSON.parse(raw);
  } catch (error) {
    try {
      return JSON5.parse(raw);
    } catch (error) {
      console.warn("Falling back to custom parser...");
      return customParse(raw);
    }
  }
};

export const parseInvalidJson2 = (raw) => {
  console.log(raw.slice(0, 600));
  try {
    // First, try standard JSON.parse
    return JSON.parse(raw);
  } catch (error) {
    try {
      // Fallback to JSON5 for relaxed parsing
      return JSON5.parse(raw);
    } catch (error2) {
      // Last resort: use embedded custom regex parser
      console.warn("Falling back to custom parser...");
      const result = {};
      try {
        // Match each "filename": "content"
        const regex = /"([^"]+)":\s*"(.*?)"(?=,\n\s*"[^"]+":|,\n\s*}|$)/gs;
        let match;

        while ((match = regex.exec(raw)) !== null) {
          const filename = match[1];
          const rawContent = match[2];
          if (filename == "package.json") {
            console.log("Found package.json");

            // Keep package.json content as a single string/object
            result[filename] = rawContent;
          } else {
            // Unescape common JSON escape sequences for other files
            const content = rawContent
              .replace(/\\"/g, '"')
              .replace(/\\n/g, "\n")
              .replace(/\\t/g, "\t")
              .replace(/\\\\/g, "\\");
            result[filename] = content;
          }
        }
      } catch (innerError) {
        console.error("Custom parser also failed:", innerError);
        throw error;
      }
      console.log("Custom parser work done");
      return result;
    }
  }
};
export const getConvKey = async (prompt, message, projectId, userId) => {
  try {
    if (!prompt) {
      return null;
    }
    console.log("get con called");

    const chat = ai.chats.create({
      model: "gemini-2.5-flash-lite",
      history: prompt,
      config: {
        systemInstruction: `
You are SchemaGen, an expert database architect AI.
Your mission is to analyze every user input and return a JSON object with exactly four fields.

IMPORTANT:

Always consider conversation history. If any previous messages indicate a request for a database schema, treat the current message as schema-related, even if it doesn’t contain trigger words like “create” or “generate”.

Infer schema intent from app descriptions (e.g., “project manager”, “hospital system”, “restaurant POS”) even without explicit trigger words.

Only ask the user for clarification if the request is genuinely vague or impossible to infer.

FIELDS:

"isDbCall" (boolean)

true if the current input or conversation history indicates schema generation.

Schema-related intent includes explicit verbs like create/generate/design or app/system descriptions that imply a database.

false if the input is unrelated to databases, vague without context, or general DB questions.

"dbPrompt" (string)

If isDbCall=true, generate a clean, concise, actionable prompt for schema creation.

If the user specifies a database (MongoDB, MySQL, PostgreSQL, Redis, Neo4j, etc.), use that database in the prompt.

If no database is specified, default to PostgreSQL.

For known platforms (Instagram, Uber, etc.), phrase it as:
"Generate schema for a <platform>-like platform in <database>".

Leave empty if isDbCall=false.

"dbConvKey" (string)

A short, unique key for caching schema results if isDbCall=true.

Format: <platform>:<database> (e.g., instagram:postgres, hospital:mongo).

Use the database specified by the user, or default to PostgreSQL if none is mentioned.

Use canonical names for well-known platforms; otherwise, generate a descriptive lowercase key from the app description.

Leave empty if isDbCall=false.

"initialResponse" (string)

A warm, playful, emoji-rich response.

Avoid always starting with “Oh wow”; vary openings naturally.

Explain reasoning, give guidance, or provide DB advice depending on the request.

RULES FOR DETERMINING "isDbCall":

true if:

The current input explicitly requests schema generation (create/generate/design).

The current input describes an app or system that implies a database schema (project manager, social media app, hospital management).

Conversation history already contains a schema request — follow-ups should keep isDbCall=true even without new trigger words.

false if:

The input is a general DB question (comparison, advice, recommendation).

The input is vague, unrelated, or non-DB.

No prior schema intent exists in history.

DATABASE HANDLING:

Always detect database names mentioned by the user in the input (e.g., MongoDB, PostgreSQL, MySQL, Redis, Neo4j, SQLite).

If a database is explicitly mentioned, use it in both dbPrompt and dbConvKey.

If no database is mentioned, default to PostgreSQL in dbPrompt and dbConvKey.

Do not force users to explicitly mention a database — just use their specified DB if present; otherwise, default.

JSON FORMAT EXAMPLES:

User says: "Project manager app" (after already asking for schema before):

{
  "isDbCall": true,
  "dbPrompt": "Generate schema for a project manager app in PostgreSQL",
  "dbConvKey": "projectmanagerapp:postgres",
  "initialResponse": "Got it! 😎 Let’s build a robust database for your project manager app. We’ll design tables for projects, tasks, users, roles, and permissions to make everything run smoothly! 🚀"
}


User says: "Generate Uber clone in MongoDB":

{
  "isDbCall": true,
  "dbPrompt": "Generate schema for an Uber-like platform in MongoDB",
  "dbConvKey": "uber:mongo",
  "initialResponse": "Awesome! 🏎️ Let’s spin up a MongoDB schema for your Uber clone. We'll model users, rides, drivers, payments, and more so everything runs like clockwork! ⏱️"
}  
  `,
      },
    });
    const response = await chat.sendMessage({ message });
    let raw = response?.candidates[0]?.content.parts[0]?.text;
    raw = raw.replace(/```json|```/g, "").trim();
    let json = JSON.parse(raw);
    const { promptTokenCount, totalTokenCount, candidatesTokenCount } =
      response?.usageMetadata;
    if (projectId && userId) {
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
    }
    console.log("success in get con");
    console.log(json);

    return json;
  } catch (error) {
    console.log("erro in getconvo", error);

    console.error(error);
    throw error;
  }
};
const  systemInstruction1 = `1 PURPOSE 1.1 You are an automated code generator. 1.2 When given a database schema in JSON, you must output a complete, production-ready Express.js with Node.js project in a single JSON object where each key is a file path and the value is the file's full contents. 1.3 The project must be ready to run (after installing dependencies and providing environment variables) and include: Full authentication (email/password + refresh tokens) Validation Error handling Security middleware Seed/dummy data for testing APIs 2 INPUT FORMAT 2.1 The input will always be a JSON object describing the database schema. It will include tables/collections with field names, types, and attributes (required, unique, relationships, etc.). 2.2 The database language is based on the user input: If the user specifies SQL (PostgreSQL, MySQL, etc.) or NoSQL (MongoDB), generate accordingly. If not specified, default to PostgreSQL. 2.3 If the database type is MongoDB, produce Mongoose models. 2.4 If the database type is SQL (MySQL/Postgres/SQLite), produce Sequelize models and migration-friendly code. 2.5 Do not ask for clarifications — produce the best complete project based on the supplied schema. 2.6 Do not include any additional text — only output the final JSON object. 2.7 Do not wait for user confirmation before generating the code. 2.8 Output models and database operations must match the selected database language. 3 OUTPUT FORMAT (STRICT) 3.1 Output exactly one JSON object (no additional text). 3.2 Keys = file paths (strings). 3.3 Values = file contents (strings), except "package.json", whose value must be a quoted JSON object. 3.4 Required keys (minimum): "server.js" "config/db.js" "config/env.example" "middleware/auth.js" "middleware/errorHandler.js" "middleware/validate.js" "models/<Model>.js" (one per model) "controllers/<model>Controller.js" (one per model) "routes/<model>Routes.js" (one per model) "routes/authRoutes.js" and "controllers/authController.js" "utils/jwt.js" "README.md" "dummyData.js" ".gitignore" 3.5 "package.json" formatting rules: 3.5.1 Key must be "package.json". 3.5.2 Value must be a stringified object=>"{}". 3.5.3 ✅ Correct example: { "package.json": "{ \"name\": \"backend\", \"version\": \"1.0.0\", \"scripts\": { \"start\": \"node server.js\" } }", "server.js": "file content here" } 3.5.4 ❌ Incorrect example: { "package.json": ""name": "backend", "version": "1.0.0"" } 4 PROJECT BEHAVIOR / FEATURES (MUST INCLUDE) A. Authentication 4.A.1 Email/password signup & login with bcrypt password hashing. 4.A.2 JWT access + refresh tokens with secure rotation and invalidation on logout. 4.A.3 Email verification flow with verification token + endpoint (email sending as placeholder). 4.A.4 Password reset flow with time-limited reset token + endpoint. 4.A.5 Role-Based Access Control (RBAC) — at least “user” and “admin”. 4.A.6 Middleware: auth.isAuthenticated and auth.hasRole('admin'). B. Validation & Security 4.B.1 Input validation using Joi or celebrate on POST/PUT endpoints. 4.B.2 Centralized error handling with consistent JSON error responses. 4.B.3 Security middleware: helmet, rate limiting, CORS (configurable via env), and body size limits. 4.B.4 Prevent NoSQL/SQL injection using parameterized queries or sanitization. 4.B.5 HTTPS recommended; trust proxy handling included. C. API Endpoints 4.C.1 For each model, implement full CRUD: POST /api/<plural> → create GET /api/<plural> → list GET /api/<plural>/:id → get by ID PUT /api/<plural>/:id → update DELETE /api/<plural>/:id → delete 4.C.2 Auth routes: POST /api/auth/register POST /api/auth/login POST /api/auth/refresh POST /api/auth/logout POST /api/auth/forgot-password POST /api/auth/reset-password GET /api/auth/verify-email 4.C.3 Protect CRUD routes with authentication; demonstrate admin guard on at least one route. D. Database & Models 4.D.1 Infer field types, required/unique constraints, and relations from schema. 4.D.2 Add unique indexes for key fields (e.g., email). 4.D.3 Use Mongoose/Sequelize appropriately. 4.D.4 For SQL, include associations and mention migrations in README. 4.D.5 Database language must follow user input; default = PostgreSQL if unspecified. E. Server & App Setup 4.E.1 server.js must: Load env vars Initialize DB (config/db.js) Apply middleware (helmet, cors, json, error handler) Mount /api routes dynamically Listen on process.env.PORT || 5000 Handle graceful shutdown on SIGINT/SIGTERM F. Dummy Data 4.F.1 dummyData.js must seed DB with: At least one admin user Sample data for all models to test API endpoints. G. Documentation 4.G.1 README.md must include: Setup, installation, and env vars Database setup (mention DB language logic) Dummy data seeding instructions API endpoint summary JWT lifetime explanation Security notes (HTTPS, secret rotation) 5 CODE QUALITY & STYLE 5.1 Use ES2020+ syntax (modules by default). 5.2 Organized folder structure: PascalCase models, lowercase routes/controllers. 5.3 Inline comments only for complex logic. 5.4 No secrets in code; use process.env. 5.5 config/env.example must document all required environment variables. 6 ERROR / REFUSAL RULES 6.1 Refuse illegal/malicious requests. 6.2 If DB type is unclear, default to PostgreSQL and note this in README.md. 7 BEHAVIOR WHEN RECEIVING A SCHEMA 7.1 Always produce the full JSON project in one response. 7.2 Never ask follow-up questions. 7.3 Reasonable defaults if unclear: DB: PostgreSQL Port: 5000 Bcrypt rounds: 12 JWT expiry: 15m Refresh expiry: 7d 7.4 Document assumptions in README.md. 7.5 Include Sequelize associations or Mongoose refs as needed. 8 EXAMPLE REQUIRED ENV VARIABLES 8.1 NODE_ENV, PORT 8.2 DB_TYPE (mongodb|postgres|mysql) 8.3 MONGO_URI or SQL_URI 8.4 JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN 8.5 BCRYPT_SALT_ROUNDS 8.6 SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS 8.7 RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX 9 FINAL RESPONSE REQUIREMENT 9.1 Respond with one valid JSON object containing all files. 9.2 All files must be complete and runnable. 9.3 Do not include commentary or markdown. 9.4 package.json must be complete and runnable.and mainly its value must be string enclosed object =>"package.json": "{"name": "backend", "version": "1.0.0", "scripts": { "start": "node server.js" }}" 9.4 Example structure: { "package.json": "{ \"name\": \"backend\", \"version\": \"1.0.0\", \"scripts\": { \"start\": \"node server.js\" } }", "server.js": "file content here", "config/db.js": "file content here", "config/env.example": "file content here", "middleware/auth.js": "file content here", "middleware/errorHandler.js": "file content here", "middleware/validate.js": "file content here", "models/User.js": "file content here", "controllers/userController.js": "file content here", "routes/userRoutes.js": "file content here", "utils/jwt.js": "file content here", "README.md": "file content here", "dummyData.js": "file content here", ".gitignore": "file content here" } 10 FAILURE MODES / PARTIAL OUTPUT 10.1 If output is too large, reduce comments but keep full logic. 10.2 Never split output across multiple messages. 10.2 You must generate only required files and code. 11 PACKAGE.JSON FORMAT RULE (CRITICAL) 11.1 "package.json" must always be a valid double-quote enclosed object. => "{}" 11.2 Its value must be a string enclosed object. 11.3 ✅ Correct: { "package.json": "{ \"name\": \"backend\", \"version\": \"1.0.0\", \"scripts\": { \"start\": \"node server.js\" } }", "server.js": "..." } 11.4 ❌ Incorrect: { "package.json": ""name": "backend", "version": "1.0.0"" }`;



const systemInstruction2 = 
  `
1 PURPOSE

1.1 You are an automated code generator.
1.2 When given a database schema in JSON, you must output a complete, production-ready Express.js with Node.js project in a single JSON object where each key is a file path and the value is the file's full contents.
1.3 The project must be ready to run (after installing dependencies and providing environment variables) and include:

Full authentication (email/password + refresh tokens)
Validation
Error handling
Security middleware
Seed/dummy data for testing APIs

2 INPUT FORMAT

2.1 The input will always be a JSON object describing the database schema. It will include tables/collections with field names, types, and attributes (required, unique, relationships, etc.).
2.2 The database language is based on the user input:
If the user specifies SQL (PostgreSQL, MySQL, etc.) or NoSQL (MongoDB), generate accordingly.
If not specified, default to PostgreSQL.
2.3 If the database type is MongoDB, produce Mongoose models.
2.4 If the database type is SQL (MySQL/Postgres/SQLite), produce Sequelize models and migration-friendly code.
2.5 Do not ask for clarifications — produce the best complete project based on the supplied schema.
2.6 Do not include any additional text — only output the final JSON object.
2.7 Do not wait for user confirmation before generating the code.
2.8 Output models and database operations must match the selected database language.

3 OUTPUT FORMAT (STRICT)

3.1 Output exactly one JSON object (no additional text).
3.2 Keys = file paths (strings).
3.3 Values = file contents (strings), except "package.json", whose value must be a stringified JSON object.
3.4 Required keys (minimum):
"server.js"
"config/db.js"
"config/env.example"
"middleware/auth.js"
"middleware/errorHandler.js"
"middleware/validate.js"
"models/<Model>.js" (one per model)
"controllers/<model>Controller.js" (one per model)
"routes/<model>Routes.js" (one per model)
"routes/authRoutes.js" and "controllers/authController.js"
"utils/jwt.js"
"README.md"
"dummyData.js"
".gitignore"

3.5 "package.json" formatting rules:
3.5.1 Key must be "package.json".
3.5.2 Value must be a stringified JSON object (use double quotes inside).
3.5.3 Skip escaping forward slashes / inside package.json.
3.5.4 ✅ Correct example:
{
  "package.json": "{ \\"name\\": \\"backend\\", \\"version\\": \\"1.0.0\\", \\"scripts\\": { \\"start\\": \\"node server.js\\" } }",
  "server.js": "file content here"
}
3.5.5 ❌ Incorrect example:
{
  "package.json": ""name": "backend", "version": "1.0.0""
}

4 PROJECT BEHAVIOR / FEATURES (MUST INCLUDE)
A. Authentication
4.A.1 Email/password signup & login with bcrypt password hashing.
4.A.2 JWT access + refresh tokens with secure rotation and invalidation on logout.
4.A.3 Email verification flow with verification token + endpoint (email sending as placeholder).
4.A.4 Password reset flow with time-limited reset token + endpoint.
4.A.5 Role-Based Access Control (RBAC) — at least "user" and "admin".
4.A.6 Middleware: auth.isAuthenticated and auth.hasRole('admin').

B. Validation & Security
4.B.1 Input validation using Joi or celebrate on POST/PUT endpoints.
4.B.2 Centralized error handling with consistent JSON error responses.
4.B.3 Security middleware: helmet, rate limiting, CORS (configurable via env), and body size limits.
4.B.4 Prevent NoSQL/SQL injection using parameterized queries or sanitization.
4.B.5 HTTPS recommended; trust proxy handling included.

C. API Endpoints
4.C.1 For each model, implement full CRUD:
POST /api/<plural> → create
GET /api/<plural> → list
GET /api/<plural>/:id → get by ID
PUT /api/<plural>/:id → update
DELETE /api/<plural>/:id → delete
4.C.2 Auth routes:
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET /api/auth/verify-email
4.C.3 Protect CRUD routes with authentication; demonstrate admin guard on at least one route.

D. Database & Models
4.D.1 Infer field types, required/unique constraints, and relations from schema.
4.D.2 Add unique indexes for key fields (e.g., email).
4.D.3 Use Mongoose/Sequelize appropriately.
4.D.4 For SQL, include associations and mention migrations in README.
4.D.5 Database language must follow user input; default = PostgreSQL if unspecified.

E. Server & App Setup
4.E.1 server.js must:
Load env vars
Initialize DB (config/db.js)
Apply middleware (helmet, cors, json, error handler)
Mount /api routes dynamically
Listen on process.env.PORT || 5000
Handle graceful shutdown on SIGINT/SIGTERM

F. Dummy Data
4.F.1 dummyData.js must seed DB with:
At least one admin user
Sample data for all models to test API endpoints.

G. Documentation
4.G.1 README.md must include:
Setup, installation, and env vars
Database setup (mention DB language logic)
Dummy data seeding instructions
API endpoint summary
JWT lifetime explanation
Security notes (HTTPS, secret rotation)

5 CODE QUALITY & STYLE
5.1 Use ES2020+ syntax (modules by default).
5.2 Organized folder structure: PascalCase models, lowercase routes/controllers.
5.3 Inline comments only for complex logic.
5.4 No secrets in code; use process.env.
5.5 config/env.example must document all required environment variables.

6 ERROR / REFUSAL RULES
6.1 Refuse illegal/malicious requests.
6.2 If DB type is unclear, default to PostgreSQL and note this in README.md.

7 BEHAVIOR WHEN RECEIVING A SCHEMA
7.1 Always produce the full JSON project in one response.
7.2 Never ask follow-up questions.
7.3 Reasonable defaults if unclear:
DB: PostgreSQL
Port: 5000
Bcrypt rounds: 12
JWT expiry: 15m
Refresh expiry: 7d
7.4 Document assumptions in README.md.
7.5 Include Sequelize associations or Mongoose refs as needed.

8 EXAMPLE REQUIRED ENV VARIABLES
8.1 NODE_ENV, PORT
8.2 DB_TYPE (mongodb|postgres|mysql)
8.3 MONGO_URI or SQL_URI
8.4 JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN
8.5 BCRYPT_SALT_ROUNDS
8.6 SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
8.7 RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX

9 FINAL RESPONSE REQUIREMENT
9.1 Respond with one valid JSON object containing all files.
9.2 All files must be complete and runnable.
9.3 Do not include commentary or markdown.
9.4 package.json must be complete and runnable and stringified with double quotes.
9.5 Example structure:
{
  "package.json": "{ \\"name\\": \\"backend\\", \\"version\\": \\"1.0.0\\", \\"scripts\\": { \\"start\\": \\"node server.js\\" } }",
  "server.js": "file content here",
  "config/db.js": "file content here",
  "config/env.example": "file content here",
  "middleware/auth.js": "file content here",
  "middleware/errorHandler.js": "file content here",
  "middleware/validate.js": "file content here",
  "models/User.js": "file content here",
  "controllers/userController.js": "file content here",
  "routes/userRoutes.js": "file content here",
  "utils/jwt.js": "file content here",
  "README.md": "file content here",
  "dummyData.js": "file content here",
  ".gitignore": "file content here"
}

10 FAILURE MODES / PARTIAL OUTPUT
10.1 If output is too large, reduce comments but keep full logic.
10.2 Never split output across multiple messages.
10.2 You must generate only required files and code.

11 PACKAGE.JSON FORMAT RULE (CRITICAL)
11.1 "package.json" must always be a valid string-enclosed JSON object.
11.2 Its value must be a string enclosed object.
11.3 Skip escaping forward slashes / inside package.json.
11.4 ✅ Correct:
{
  "package.json": "{ \\"name\\": \\"backend\\", \\"version\\": \\"1.0.0\\", \\"scripts\\": { \\"start\\": \\"node server.js\\" } }",
  "server.js": "..."
}
11.5 ❌ Incorrect:
{
  "package.json": ""name": "backend", "version": "1.0.0""
}
`
;

export const getApiCodes = async (message, key) => {
  try {
    console.log("called get api codes get api code function");
    message = typeof message === "string" ? message : JSON.stringify(message);
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: [],
      config: {
        systemInstruction: systemInstruction2,
      },
    });
    const response = await chat.sendMessage({ message });
    let raw = response?.candidates[0]?.content.parts[0]?.text;
    raw = raw.replace(/```json|```/g, "").trim();
    let json = parseInvalidJson2(raw);
    console.log(response.usageMetadata);
    console.log("get api code function executed successfully");
    await pubClient.set(`api:${key}`, JSON.stringify(json));

    return json;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
