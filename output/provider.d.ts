import { OpenAI } from "openai";
import type { PluginOptions } from "./index.js";
import { TSchema, Static } from "@sinclair/typebox";
export type GptResponse<T> = {
    result: T;
    usage: OpenAI.Completions.CompletionUsage;
    message: OpenAI.Chat.Completions.ChatCompletionMessage;
    model?: string;
};
export declare class GPTProvider {
    openai: OpenAI;
    private config;
    constructor();
    init(config: PluginOptions): void;
    jsonDTO<T extends TSchema>(prompt: string, schema: T, model?: string): Promise<GptResponse<Static<T>> | null>;
    chat(prompt: string, model?: string): Promise<GptResponse<string> | null>;
    chatString(prompt: string, model?: string): Promise<string>;
    JsonString<T>(prompt: string, jsonSchema: any, model?: string): Promise<T | null>;
}
//# sourceMappingURL=provider.d.ts.map