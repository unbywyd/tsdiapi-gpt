import { OpenAI } from "openai";
import { Value } from '@sinclair/typebox/value';
export class GPTProvider {
    openai;
    config;
    constructor() {
    }
    init(config) {
        if (!config.apiKey) {
            throw new Error("❌ OpenAI API key is required.");
        }
        this.config = config;
        this.openai = new OpenAI({ apiKey: config.apiKey });
    }
    async jsonDTO(prompt, schema, model) {
        const useModel = model || this.config.model;
        if (!this.openai) {
            console.error("❌ OpenAI is not initialized. Please call init() first.");
            return null;
        }
        try {
            const response = await this.openai.chat.completions.create({
                model: useModel,
                messages: [{ role: "user", content: prompt }],
                response_format: {
                    type: "json_schema",
                    json_schema: {
                        name: "Schema",
                        schema: schema,
                    },
                },
            });
            const usage = response.usage;
            const message = response.choices[0]?.message;
            const rawData = JSON.parse(message?.content || "{}");
            const result = Value.Cast(schema, rawData);
            return {
                message,
                usage,
                result,
                model: useModel,
            };
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
        const useModel = model || this.config.model;
        try {
            const response = await this.openai.chat.completions.create({
                model: useModel,
                messages: [{ role: "user", content: prompt }],
            });
            const message = response.choices[0]?.message;
            return {
                message: message,
                usage: response.usage,
                result: message?.content,
                model: useModel,
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