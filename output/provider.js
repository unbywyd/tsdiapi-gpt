import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import OpenAI from "openai";
import { plainToInstance } from "class-transformer";
function expandSchema(schema, definitions) {
    if (!schema)
        return schema;
    if (schema.$ref) {
        const refName = schema.$ref.replace("#/components/schemas/", "");
        return expandSchema(definitions[refName], definitions);
    }
    if (schema.type === "array" && schema.items) {
        schema.items = expandSchema(schema.items, definitions);
    }
    if (schema.properties) {
        Object.keys(schema.properties).forEach((key) => {
            schema.properties[key] = expandSchema(schema.properties[key], definitions);
        });
    }
    return schema;
}
export class GPTProvider {
    openai;
    config;
    logger;
    constructor() {
    }
    init(config, logger) {
        if (!config.apiKey) {
            throw new Error("❌ OpenAI API key is required.");
        }
        this.logger = logger;
        this.config = config;
        this.openai = new OpenAI({ apiKey: config.apiKey });
    }
    async jsonDTO(prompt, dtoClass, model) {
        const schemas = validationMetadatasToSchemas();
        const jsonSchema = schemas[dtoClass.name];
        if (!jsonSchema) {
            console.error(`❌ Failed to generate JSON Schema for ${dtoClass.name}`);
            return null;
        }
        const expandedSchema = expandSchema(jsonSchema, schemas);
        try {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const response = await openai.chat.completions.create({
                model: model || this.config.model,
                messages: [{ role: "user", content: prompt }],
                response_format: {
                    type: "json_schema", json_schema: {
                        name: dtoClass.name,
                        schema: expandedSchema,
                    }
                },
            });
            try {
                const usage = response.usage;
                const message = response.choices[0]?.message;
                const rawData = JSON.parse(message?.content || "{}");
                return {
                    message: message,
                    usage,
                    result: plainToInstance(dtoClass, rawData),
                };
            }
            catch (e) {
            }
        }
        catch (error) {
            console.error("❌ GPT JSON Parsing Error:", error);
            return null;
        }
    }
    async chat(prompt, model) {
        if (!this.openai) {
            console.error("❌ OpenAI is not initialized. Please call init() first.");
            return null;
        }
        try {
            const response = await this.openai.chat.completions.create({
                model: model || this.config.model,
                messages: [{ role: "user", content: prompt }],
            });
            const message = response.choices[0]?.message;
            return {
                message: message,
                usage: response.usage,
                result: message?.content,
            };
        }
        catch (error) {
            console.error("❌ GPT Chat Error:", error);
            return null;
        }
    }
    async chatString(prompt, model) {
        if (!this.openai) {
            console.error("❌ OpenAI is not initialized. Please call init() first.");
            return;
        }
        const response = await this.openai.chat.completions.create({
            model: model || this.config.model,
            messages: [{ role: "user", content: prompt }],
        });
        return response.choices[0]?.message?.content || "";
    }
    async JsonString(prompt, jsonSchema, model) {
        if (!this.openai) {
            console.error("❌ OpenAI is not initialized. Please call init() first.");
            return null;
        }
        try {
            const response = await this.openai.chat.completions.create({
                model: model || this.config.model,
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_schema", json_schema: jsonSchema },
            });
            return JSON.parse(response.choices[0]?.message?.content || "{}");
        }
        catch (error) {
            console.error("❌ GPT JSON Parsing Error:", error);
            return null;
        }
    }
}
//# sourceMappingURL=provider.js.map