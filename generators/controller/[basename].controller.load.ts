import { PrismaClient } from "@generated/prisma/index.js";
import { Type } from "@sinclair/typebox";
import { useGPTProvider } from "@tsdiapi/gpt";
import { usePrisma } from "@tsdiapi/prisma";
import { AppContext, response400, addSchema } from "@tsdiapi/server";
import { readFileSafe } from "fsesm";
import path from "node:path";

const optimazedSchema = (schema: string) => {
  return schema.replace(/^[\s\S]*?model[\s\S]*?}/, "");
};

const schema = Type.Object({
  sql: Type.String(),
  prismaModelName: Type.String(),
  requestError: Type.Optional(Type.String()),
  params: Type.Array(Type.Any()),
});

export default function PrismaAiModule({ useRoute, appDir }: AppContext): void {
  const gpt = useGPTProvider();

  // Схемы для маршрута /db-statistics
  const DbStatisticsBodySchema = addSchema(Type.Object({
    request: Type.String(),
    language: Type.String(),
  }, { $id: 'GPTDbStatisticsBodySchema' }));

  const DbStatisticsResponseSchema = addSchema(Type.Object({
    response: Type.Any({
      default: {},
    }),
    requestError: Type.Optional(Type.String()),
    description: Type.String(),
  }, { $id: 'GPTDbStatisticsResponseSchema' }));

  const DbStatisticsErrorSchema = addSchema(Type.Object({
    error: Type.String(),
  }, { $id: 'GPTDbStatisticsErrorSchema' }));

  // Схемы для маршрута /generate-text
  const GenerateTextBodySchema = addSchema(Type.Object({
    request: Type.String(),
    language: Type.String(),
    context: Type.String()
  }, { $id: 'GPTGenerateTextBodySchema' }));

  const GenerateTextResponseSchema = addSchema(Type.Object({
    response: Type.String(),
  }, { $id: 'GPTGenerateTextResponseSchema' }));

  // Схемы для маршрута /generate-html
  const GenerateHtmlBodySchema = addSchema(Type.Object({
    request: Type.String(),
    language: Type.String(),
    context: Type.String()
  }, { $id: 'GPTGenerateHtmlBodySchema' }));

  const GenerateHtmlResponseSchema = addSchema(Type.Object({
    response: Type.String(),
  }, { $id: 'GPTGenerateHtmlResponseSchema' }));

  // Схемы для маршрута /generate-page
  const GeneratePageBodySchema = addSchema(Type.Object({
    subject: Type.String(),
    request: Type.String(),
    language: Type.String(),
    context: Type.String()
  }, { $id: 'GPTGeneratePageBodySchema' }));

  const GeneratePageResponseSchema = addSchema(Type.Object({
    response: Type.String(),
  }, { $id: 'GPTGeneratePageResponseSchema' }));

  // Схемы для маршрута /generate-template
  const GenerateTemplateBodySchema = addSchema(Type.Object({
    request: Type.String(),
    language: Type.String(),
    keywords: Type.Array(Type.String()),
    context: Type.String()
  }, { $id: 'GPTGenerateTemplateBodySchema' }));

  const GenerateTemplateResponseSchema = addSchema(Type.Object({
    response: Type.String(),
  }, { $id: 'GPTGenerateTemplateResponseSchema' }));
  useRoute("ai")
    .post("/db-statistics")
    .body(DbStatisticsBodySchema)
    .code(200, DbStatisticsResponseSchema)
    .code(400, DbStatisticsErrorSchema)
    .handler(async (req, res) => {
      const { request, language } = req.body;

      // Read Prisma schema
      const prismaSchemaPath = path.join(appDir, "../prisma", "schema.prisma");
      const schemaContent = await readFileSafe(prismaSchemaPath, "utf-8");

      const currentDate = new Date().toISOString();
      const systemPrompt = `You are a professional SQL and Prisma ORM assistant. 
Your task is to analyze the user's request: "${request}" and create a valid SQL query for Prisma's $queryRawUnsafe.
Current date and time (ISO format): ${currentDate}
First, carefully review the provided Prisma schema: ${optimazedSchema(
        schemaContent
      )}
Important rules:
1. Generate ONLY SELECT queries - no INSERT, UPDATE, DELETE, DROP, ALTER, etc.
2. Use proper SQL syntax with correct table and column names from the schema
4. Include ORDER BY clauses to sort results meaningfully
5. Table and column names MUST match exactly as they appear in the schema (case-sensitive)
6. Always use double quotes for table and column names to preserve case: "User" not user, "ema
il" not email
8. If the request is invalid or unclear, set requestError with explanation and leave sql empty
9. For date comparisons, use the current date provided above
10. Always return requestError if the request seems unclear or might
 be unsafe
11. NEVER include any SQL injection attempts or dangerous operations
12. If the request asks for any data modification, return requestError explaining that only SELECT queries are allowed
13. For COUNT queries, always cast the result to INTEGER: CAST(COUNT(*) AS INTEGER) as "count"
14. For language-specific character searches:
    - Use PostgreSQL's regex operator ~ for character range searches
    - For Cyrillic characters: use ~ '[а-яА-ЯёЁ]'
    - For Hebrew characters: use ~ '[\u0590-\u05FF]'
    - For Arabic characters: use ~ '[\u0600-\u06FF]'
    - For Chinese characters: use ~ '[\u4E00-\u9FFF]'
    - For Japanese characters: use ~ '[\u3040-\u309F\u30A0-\u30FF]'
    - For Korean characters: use ~ '[\uAC00-\uD7AF\u1100-\u11FF]'
    - Avoid using SIMILAR TO or multiple LIKE conditions with OR
    - Always use proper Unicode ranges for character sets
15. For text searches and comparisons:
    - Always use ILIKE instead of = for case-insensitive text matching
    - Use ILIKE with wildcards for partial matches: ILIKE '%text%'
    - For category or type searches, use ILIKE in subqueries
    - Example: SELECT * FROM "Item" WHERE "categoryId" IN (SELECT "id" FROM "Category" WHERE "name" ILIKE '%tv%')
    - For exact ID matches, keep using = operator
    - For numeric comparisons, keep using =, >, <, etc.

Example valid responses:
1. For "find active users over 18":
{"sql":"SELECT * FROM \"User\" WHERE \"status\" ILIKE 'active' AND \"age\" > 18","prismaModelName":"User","requestError":"","params":[]}

2. For "find users with email containing @gmail.com":
{"sql":"SELECT * FROM \"User\" WHERE \"email\" ILIKE '%@gmail.com%'","prismaModelName":"User","requestError":"","params":[]}

3. For "find posts created in the last 24 hours":
{"sql":"SELECT * FROM \"Post\" WHERE \"createdAt\" >= '${new Date(
        Date.now() - 24 * 60 * 60 * 1000
      ).toISOString()}'","prismaModelName":"Post","requestError":"","params":[]}

4. For "find users with no email":
{"sql":"SELECT * FROM \"User\" WHERE \"email\" IS NULL","prismaModelName":"User","requestError":"","params":[]}

5. For "count active users":
{"sql":"SELECT CAST(COUNT(*) AS INTEGER) as \"count\" FROM \"User\" WHERE \"status\" ILIKE 'active'","prismaModelName":"User","requestError":"","params":[]}

6. For "find products in TV category":
{"sql":"SELECT * FROM \"Item\" WHERE \"categoryId\" IN (SELECT \"id\" FROM \"Category\" WHERE \"name\" ILIKE '%tv%')","prismaModelName":"Item","requestError":"","params":[]}

7. For invalid request "find users with non-existent field":
{"sql":"","prismaModelName":"User","requestError":"Field does not exist in the schema","params":[]}

8. For invalid request "delete all users":
{"sql":"","prismaModelName":"User","requestError":"Only SELECT queries are allowed","params":[]}

Your response must strictly follow this JSON structure. If the request is invalid, set requestError with explanation and leave sql empty.`;
      const response = await gpt.jsonDTO(systemPrompt, schema);

      if (!response.result) {
        return response400(`Response from AI is invalid`);
      }

      const { sql, requestError } = response.result;
      if (requestError) {
        return {
          status: 200,
          data: {
            response: [],
            requestError,
            description: "",
          },
        };
      }
      if (!sql.trim().toLowerCase().startsWith("select")) {
        return {
          status: 200,
          data: {
            response: [],
            requestError: "Only SELECT queries are allowed",
            description: "",
          },
        };
      }

      // Generate description for the query results
      const descriptionPrompt = `You are a data visualization assistant for an administrative panel.
            Your task is to create a concise, informative description of what this SQL query does and what data it returns.
            SQL Query:
            ${sql}
            User's original request:
            ${request}
            Important rules:
            1. Create a short, clear description (1-2 sentences)
            2. User ${language} language
            2. Focus on what the data represents
            3. Use professional but accessible language
            4. Avoid technical SQL terms
            5. Make it suitable for a data visualization label
            6. Keep it under 100 characters if possible
            
            Example format:
            Active users count over the last 30 days
            Products in Electronics category with price above $100
            Total sales by region for current month`;

      const description = await gpt.chat(descriptionPrompt);
      const prisma = usePrisma<PrismaClient>();
      try {
        const data = await prisma.$queryRawUnsafe(sql);
        // Convert BigInt to Number if present in the result
        const processedData = JSON.parse(
          JSON.stringify(data, (_, value) =>
            typeof value === "bigint" ? Number(value) : value
          )
        );

        //  

        return {
          status: 200,
          data: {
            response: processedData,
            requestError: response.result?.requestError,
            description: description.result,
          },
        };
      } catch (e) {
        console.error(e);
        const errorPrompt = `You are a professional SQL and Prisma ORM assistant. 
      Your task is to analyze this SQL error and provide a clear, human-readable explanation.
      SQL Query that caused the error:
      ${sql}
      Error details:
      ${e}
      Please provide a clear explanation of what went wrong and how to fix it. Focus on:
      1. What exactly caused the error
      2. What might be wrong with the query
      3. How to fix it
      4. Any best practices that were violated
      Your response should be in a simple, non-technical language that any developer can understand.`;
        const errorResponse = await gpt.jsonDTO(
          errorPrompt,
          Type.Object({
            explanation: Type.String(),
          })
        );
        return {
          status: 200,
          data: {
            response: [],
            requestError: errorResponse.result?.explanation || `Error: ${e}`,
            description: description.result,
          },
        };
      }
    })
    .build();

  useRoute("ai")
    .post("/generate-text")
    .body(GenerateTextBodySchema)
    .code(200, GenerateTextResponseSchema)
    .handler(async (req, res) => {
      const { request, language, context } = req.body;

      const systemPrompt = `You are a text generation assistant for an administrative panel. 
Your task is to generate clean, unformatted text responses in ${language} language for the user's request ${request}.

Important rules:
1. Return ONLY plain text without any formatting
2. No HTML tags, markdown, or other markup
3. No introductory phrases or explanations
4. No additional context or commentary
5. Just the direct answer to the request
6. Keep the response concise and to the point

About current project: ${context}.
Language: ${language}`;

      const response = await gpt.chat(systemPrompt);
      return {
        status: 200,
        data: {
          response: response.result,
        },
      };
    })
    .build();

  useRoute("ai")
    .post("/generate-html")
    .body(GenerateHtmlBodySchema)
    .code(200, GenerateHtmlResponseSchema)
    .handler(async (req, res) => {
      const { request, language, context } = req.body;
      const systemPrompt = `You are an HTML generation assistant for an administrative panel.
Your task is to generate clean, valid HTML code based on the user's request in ${language} language.

User request: ${request}
Language of response: ${language}
About current project: ${context}.

Important rules:
1. Return ONLY valid HTML fragment code without CSS and JavaScript
2. Do not include DOCTYPE, html, head, body, or any wrapper tags
3. Use semantic HTML5 elements where appropriate
4. Ensure proper nesting and closing of tags
5. Use proper indentation for readability
6. Follow HTML best practices and standards
7. No JavaScript code
8. No inline styles and CSS
9. Keep the HTML structure clean and maintainable

# Example of correct response format:
<div>
    <h2>Welcome to Our Platform</h2>
    <p>You're on the right path. We offer you a unique experience with our system.</p>
</div>
`;

      const response = await gpt.chat(systemPrompt);

      return {
        status: 200,
        data: {
          response: response.result,
        },
      };
    })
    .build();

  useRoute("ai")
    .post("/generate-page")
    .body(GeneratePageBodySchema)
    .code(200, GeneratePageResponseSchema)
    .handler(async (req, res) => {
      const { subject, request, language, context } = req.body;

      const systemPrompt = `You are a page generation assistant for an administrative panel.
Your task is to generate a complete page in ${language} language based on the subject and description provided.

Subject: ${subject}
Description: ${request}
Language: ${language}
About current project: ${context}.

Important rules:
1. Generate a page in ${language} language!
2. Return ONLY the main content without HTML, HEAD, BODY tags
3. Do not include DOCTYPE, html, head, body, or any wrapper tags
4. Do not wrap the response in markdown code blocks or backticks
5. Use semantic HTML5 elements for the content
6. Structure the content logically based on the description
7. Include necessary sections and components
8. Use proper heading hierarchy (h1, h2, etc.)
9. Add appropriate form elements if needed
10. Include necessary input fields and buttons
11. Add proper labels and placeholders
12. Ensure the content is accessible and user-friendly
13. Keep the code clean and well-structured
14. No JavaScript code
15. No inline styles and CSS
16. Return the content as a plain string without any wrapping or formatting

Example of correct response format:
<header>
    <h1>Welcome to Our Platform</h1>
</header>
<section>
    <h2>What to Expect</h2>
    <p>You're on the right path. We offer you a unique experience with our system.</p>
    <ul>
        <li>Easy and intuitive interface</li>
        <li>Support at every step</li>
        <li>Many useful learning resources</li>
    </ul>
</section>
Generate content that matches the subject and follows the description provided.`;

      const response = await gpt.chat(systemPrompt);

      return {
        status: 200,
        data: {
          response: response.result,
        },
      };
    })
    .build();

  useRoute("ai")
    .post("/generate-template")
    .body(GenerateTemplateBodySchema)
    .code(200, GenerateTemplateResponseSchema)
    .handler(async (req, res) => {
      const { request, language, keywords, context } = req.body;

      const systemPrompt = `You are a Handlebars template generation assistant.
Your task is to generate a clean Handlebars template in ${language} language based on the request and provided keywords.

Request: ${request}
Language of response: ${language}
Keywords to use: ${keywords.join(", ")}
About current project: ${context}.

Important rules:
1. Generate ONLY Handlebars template syntax without any markdown or code block wrapping
2. Use the provided keywords with proper Handlebars syntax: {{keyword}}
3. For nested objects use dot notation: {{object.key}}
4. For arrays use {{#each}} helper
5. For conditionals use {{#if}} helper
6. Keep the template clean and readable
7. No HTML tags or formatting
8. No JavaScript code
9. Use proper Handlebars helpers where needed
10. Include comments explaining complex logic
11. Make sure all provided keywords are used appropriately
12. Follow Handlebars best practices
13. Return the template as a plain string without any wrapping or formatting
14. Do not use markdown code blocks or backticks
15. Do not add any additional text or explanations

Example of correct response format:
{{#if title}}
  {{title}}
{{else}}
  Default Title
{{/if}}

{{#each items}}
  {{name}}
{{/each}}

Generate a template that matches the request and properly uses all provided keywords.`;
      const response = await gpt.chat(systemPrompt);

      return {
        status: 200,
        data: {
          response: response.result,
        },
      };
    })
    .build();
}
