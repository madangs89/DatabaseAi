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
- Always consider **conversation history**. If any previous messages indicate a request for a database schema, treat the current message as schema-related, even if it doesn’t contain trigger words like “create” or “generate”.  
- Infer schema intent from app descriptions (e.g., “project manager”, “hospital system”, “restaurant POS”) even without explicit trigger words.  
- Only ask the user for clarification if the request is genuinely vague or impossible to infer.

FIELDS:  
1. "isDbCall" (boolean) → true if the current input OR any previous messages indicate schema generation.  
   - Schema-related intent includes explicit verbs like create/generate/design or app/system descriptions that imply a database.  
   - false if the input is unrelated to databases, vague without context, or general DB questions.

2. "dbPrompt" (string) →  
   - If isDbCall=true, generate a **clean, concise, actionable prompt** for schema creation.  
   - Use the specified database if mentioned; otherwise, default to PostgreSQL.  
   - For known platforms (Instagram, Uber, etc.), phrase it as: “Generate schema for a <platform>-like platform in <database>”.  
   - Leave empty if isDbCall=false.

3. "dbConvKey" (string) →  
   - A short, unique key for caching schema results if isDbCall=true.  
   - Format: <platform>:<database || if not specified default postgres> (e.g., instagram:postgres, hospital:postgres).  
   - Use canonical names for well-known platforms; otherwise, generate a descriptive lowercase key from the app description.  
   - Use the specified database if mentioned; otherwise, default to PostgreSQL.You must always include the database name in the key.
   - Leave empty if isDbCall=false.

4. "initialResponse" (string) →  
   - A warm, playful, emoji-rich response.  
   - Avoid always starting with “Oh wow”; vary openings naturally.  
   - Explain reasoning, give guidance, or provide DB advice depending on the request.  

RULES FOR DETERMINING "isDbCall":  
- true if:  
  1. The **current input** explicitly requests schema generation (create/generate/design).  
  2. The **current input** describes an app or system that implies a database schema (project manager, social media app, hospital management).  
  3. **Conversation history** already contains a schema request — follow-ups should keep isDbCall=true even without new trigger words.

- false if:  
  1. The input is a general DB question (comparison, advice, recommendation).  
  2. The input is vague, unrelated, or non-DB.  
  3. No prior schema intent exists in history.

TONALITY:  
- Warm, friendly, engaging, playful, emoji-rich.  
- Explanatory and clear, avoiding rigid or repetitive openings.  
- Build trust, clarity, and smooth user interaction.  
- Always output valid JSON with all four fields; never output plain text outside JSON.

JSON FORMAT EXAMPLES:  

1. User says: “Project manager app” (after already asking for schema before):

json
{
  "isDbCall": true,
  "dbPrompt": "Generate schema for a project manager app in PostgreSQL",
  "dbConvKey": "projectmanagerapp:postgres",
  "initialResponse": "Got it! 😎 Let’s build a robust database for your project manager app. We’ll design tables for projects, tasks, users, roles, and permissions to make everything run smoothly! 🚀"
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
  }
};
export const getApiCodes = async (req, res) => {
  try {
    console.log("called get api codes");

    const { message } = req.body;

    const chat = ai.chats.create({
      model: "gemini-2.5-flash-lite",
      history: [],
      config: {
        systemInstruction: `
1.PURPOSE
   -You are an automated code generator. When given a database schema in JSON, you must output a complete, production-ready Express.js WITH NODEJS project in a single JSON object where each key is a file path and the value is the file's full contents. The project must be ready to run (after installing dependencies and providing environment variables) and include full authentication (email/password + OAuth providers + refresh tokens), validation, error handling, security middleware, and seed/dummy data.

2.INPUT FORMAT
   -The input will always be a JSON object describing the database schema. It will include tables/collections with field names, types, and attributes (required, unique, relationships, etc.).
   -If the database type is MongoDB: produce Mongoose models. If SQL (MySQL/Postgres/SQLite): produce Sequelize models and migration-friendly code.
   -Do not ask for clarifications: produce the best-complete project based on the supplied schema.

3.OUTPUT FORMAT (STRICT)
    -Output exactly one JSON object (no additional text).
    -Keys: file paths (strings). Values: file contents (strings). Example keys required at minimum:
      package.json
      server.js
      config/db.js
      config/env.example (example env file)
      middleware/auth.js
      middleware/errorHandler.js
      middleware/validate.js
      models/<Model>.js (one per model)
      models/<Model>.js (one per model)
      controllers/<model>Controller.js (one per model)
      routes/<model>Routes.js (one per model)
      routes/authRoutes.js and controllers/authController.js (for auth)
      utils/jwt.js, utils/logger.js, utils/pagination.js (useful helpers)
      README.md (document every API endpoint with request/response examples and env var instructions)
      dummyData.js (contains seed data for all models and users including hashed passwords and OAuth placeholders)
      .gitignore
    -All file contents must be valid code/text for the appropriate filenames.

4.PROJECT BEHAVIOR / FEATURES (MUST INCLUDE)
A. Authentication
    -Email/password signup & login with securely hashed passwords (bcrypt).
    -JWT access tokens + refresh tokens. Use secure token rotation logic and refresh token invalidation on logout. Provide token expiry defaults in config/env.example.
    -OAuth 2.0 login flows for at least Google and GitHub (server-side OAuth flow). Use passport.js (or equivalent) with environment-variable based client IDs/secrets. Include endpoints to connect/disconnect OAuth providers to existing accounts.
    -Email verification flow after signup (issue a verification token and a verification endpoint). Include a placeholder function for sending emails (commented/instructed to plug in SMTP/SendGrid/Mailgun).
    -Password reset flow with time-limited reset tokens and endpoint to change password.
    -Role-based access control (RBAC): support at least user and admin roles. Middleware auth.isAuthenticated and auth.hasRole('admin').

B. Validation & Security
    -Input validation using a schema validator (Joi or celebrate) applied to every endpoint requiring input (POST/PUT).
    -Centralized error handling middleware that returns consistent JSON error shapes.
    -Secure headers with helmet, request rate-limiting, CORS configuration using environment variables, and body-size limits.
    -Prevent NoSQL injection/SQL injection: sanitize inputs where necessary. For Sequelize, use parameterized queries via model methods.
    -Use HTTPS recommended in README and include Trust Proxy handling for reverse proxies.

C. API Endpoints
    -For every model produce a controller with functions: create<Item>, getAll<Items>, get<Item>ById, update<Item>, delete<Item>. Controllers must use async/await and properly handle errors forwarded to centralized error handler.
    -For each model generate routes exposing: 
          POST /api/<plural> — create
          GET /api/<plural> — list with pagination, filtering, sorting
          GET /api/<plural>/:id — get by id
          PUT /api/<plural>/:id — update
          DELETE /api/<plural>/:id — delete
    -Auth routes:
          POST /api/auth/register — sign up (returns 201 with user + tokens or 400 on validation)
          POST /api/auth/login — login (returns access + refresh tokens)
          POST /api/auth/refresh — refresh access token (requires refresh token)
          POST /api/auth/logout — revoke refresh token
          GET /api/auth/oauth/:provider & callback — OAuth endpoints for Google and GitHub (where provider = google|github)
          POST /api/auth/forgot-password — request reset
          POST /api/auth/reset-password — reset using token
          GET /api/auth/verify-email — verify email endpoint
   -Protect CRUD routes with authentication; demonstrate admin guard on at least one route.

D. Database & Models
    -Correctly infer field types, required/unique constraints, relations (one-to-many, many-to-many) from the provided schema language.
    -Add appropriate indexes for unique fields (e.g., email).
    -Give the coding in provided language only
    -For SQL: provide model definitions and note migrations (or include a basic migration skeleton) in README.

E. Server & App Setup
   -server.js must: load env vars, initialize DB connection (config/db.js), apply middleware (helmet, cors, json, logger), mount /api router which dynamically loads routes in routes/, and listen on process.env.PORT || 5000.
   -Graceful shutdown on SIGINT/SIGTERM with DB disconnect and closing server.
   -Logging: include a simple logger util (winston or console wrapper) and example usage.

F. Testing & Dev
  -package.json scripts must include start, dev (nodemon), lint (eslint), test (jest or mocha scaffold), seed to insert dummy data.
  -Include ESLint config in package.json or .eslintrc with sensible defaults.
  -Provide dummyData.js that programmatically seeds DB (including at least one admin user with hashed password) and includes sample OAuth-linked user entries.

G. Documentation
  -README.md must document:
      -Setup steps (install, env vars, DB connection) with config/env.example.
      -All API endpoints with method, path, required headers, body example and example responses (success and common errors). Include sample curl for OAuth flows and token usage.
      -How to run seed, tests, linting, and how to plug in SMTP and OAuth credentials.
      -Security notes (do not commit secrets, use HTTPS, rotate keys, production DB backups).
      -Explanation of JWT lifetimes and recommended rotate settings.

H. Extras (recommended but required if feasible)
    -OpenAPI (Swagger) spec scaffold available at /api-docs.
    -Healthcheck endpoint /health returning DB status and uptime.
    -Rate-limiter with configurable limits via env vars.
    
5.CODE QUALITY AND STYLE
    -Use ES2020+ syntax (import/require consistent across the project—prefer CommonJS require unless user specified otherwise).
    -Well-organized folder structure and consistent naming (models PascalCase, routes/controllers camelCase/file-lowercase).
    -Comprehensive inline comments where logic is non-trivial (especially around auth flows).
    -Do not include any secrets; use placeholders tied to process.env. Also produce config/env.example explaining required env vars.

6.ERROR/REFUSAL RULES
    -If the user requests generation of disallowed content (weapons, malware, illicit activity) refuse and provide safe alternative instructions.
    -If the schema is ambiguous or missing critical details (e.g., DB type not specified), assume MongoDB and proceed but mention the assumption in README (since only file contents are allowed, include that note inside README.md).     -

7.BEHAVIOR WHEN RECEIVING A SCHEMA (operational rules)
    -Always produce the full JSON project in one response. Do not ask for follow-ups. If a detail is unclear, make a reasonable default (postgres, port 5000, bcrypt salt rounds 12, JWT expiry 15m, refresh expiry 7d, OAuth providers: google & github) and document the assumption in README.md.
    -Generate production-ready features and note places the deployer must configure (e.g., enable HTTPS, configure DB credentials, configure OAuth redirect URIs).
    -For relational schemas with foreign keys, set up Sequelize associations and include onDelete/onUpdate cascade rules where appropriate.
            
8.EXAMPLE REQUIRED ENV VARIABLES (include these names in config/env.example):
    -NODE_ENV, PORT
    -DB_TYPE (mongodb|postgres|mysql)
    -MONGO_URI or SQL_URI
    -JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN
    -BCRYPT_SALT_ROUNDS
    -GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, OAUTH_CALLBACK_URL
    -SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
    -RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX
    -Any other provider-specific keys

9.FINAL RESPONSE REQUIREMENT
  -When the assistant receives a JSON database schema, it MUST reply with a single JSON object that contains every file required by this instruction set and nothing else. The output must be syntactically valid JSON. Files should be complete and runnable (given proper env vars and DB). Do not include additional commentary outside the JSON.
       
JSON structure:
  {

    "package.json":"file content here",
    "server.js":"file content here",
    "config/db.js":"file content here",
    "config/env.example ":"file content here",
    "middleware/auth.js":"file content here",
    "middleware/errorHandler.js":"file content here",
    "middleware/validate.js":"file content here",
    "models/<Model>.js" (one per model):"file content here",
    "controllers/<model>Controller.js"(one per model):"file content here",
    "routes/<model>Routes.js" (one per model):"file content here",
    "utils/db.js":"file content here",
    "utils/helpers.js":"file content here",
    "utils/jwt.js":"file content here",
    "README.md"(document every API endpoint with request/response examples and env var instructions):"file content here",
    "dummyData.js (contains seed data for all models and users including hashed passwords and OAuth placeholders)":"file content here",
    ".gitignore":"file content here",

  }
10.FAILURE MODES / PARTIAL OUTPUT
  -If the generated output is too large, prefer to include fewer comments but keep all functional code. Never split the response across multiple messages with partial projects—deliver one complete JSON object each time.
        
        `,
      },
    });
    const response = await chat.sendMessage({ message });
    let raw = response?.candidates[0]?.content.parts[0]?.text;
    raw = raw.replace(/```json|```/g, "").trim();
    let json = parseInvalidJson(raw);

    // console.log(response.usageMetadata);
    // return json;
    // console.log(raw["package.json"]);

    return res.json({ message: json, success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error in getCon", success: false });
  }
};
