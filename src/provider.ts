import { OpenAI } from "openai";
import type { PluginOptions } from "./index.js";
import { TSchema, Static } from "@sinclair/typebox";
import { Value } from '@sinclair/typebox/value';

export type GptResponse<T> = {
    result: T,
    usage: OpenAI.Completions.CompletionUsage,
    message: OpenAI.Chat.Completions.ChatCompletionMessage,
    model?: string,
}

export class GPTProvider {
    public openai: OpenAI;
    private config: PluginOptions;
    constructor() {
    }

    init(config: PluginOptions) {
        if (!config.apiKey) {
            throw new Error("❌ OpenAI API key is required.");
        }
        this.config = config;
        this.openai = new OpenAI({ apiKey: config.apiKey });
    }

    async jsonDTO<T extends TSchema>(
        prompt: string,
        schema: T,
        model?: string
    ): Promise<GptResponse<Static<T>> | null> {
        const useModel = model || this.config.model!;
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
                        schema: schema as any,
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
        } catch (error) {
            console.error("❌ GPT JSON Parsing Error:", error);
            return null;
        }
    }

    async chat(prompt: string, model?: string): Promise<GptResponse<string> | null> {
        if (!this.openai) {
            console.error("❌ OpenAI is not initialized. Please call init() first.");
            return null;
        }
        const useModel = model || this.config.model!;
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
            }
        } catch (error) {
            console.error("❌ GPT Chat Error:", error);
            return null;
        }
    }

    async chatString(prompt: string, model?: string): Promise<string> {
        if (!this.openai) {
            console.error("❌ OpenAI is not initialized. Please call init() first.");
            return
        }
        const response = await this.openai.chat.completions.create({
            model: model || this.config.model!,
            messages: [{ role: "user", content: prompt }],
        });

        return response.choices[0]?.message?.content || "";
    }

    async JsonString<T>(prompt: string, jsonSchema: any, model?: string): Promise<T | null> {
        if (!this.openai) {
            console.error("❌ OpenAI is not initialized. Please call init() first.");
            return null;
        }
        try {
            const response = await this.openai.chat.completions.create({
                model: model || this.config.model!,
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_schema", json_schema: jsonSchema },
            });

            return JSON.parse(response.choices[0]?.message?.content || "{}") as T;
        } catch (error) {
            console.error("❌ GPT JSON Parsing Error:", error);
            return null;
        }
    }
}
