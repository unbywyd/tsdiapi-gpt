import OpenAI from "openai";
import { PluginOptions } from ".";
import { AppContext } from "@tsdiapi/server";
export type GptResponse<T> = {
    result: T;
    usage: OpenAI.Completions.CompletionUsage;
    message: OpenAI.Chat.Completions.ChatCompletionMessage;
};
export declare class GPTProvider {
    openai: OpenAI;
    private config;
    logger: AppContext['logger'];
    constructor();
    init(config: PluginOptions, logger: AppContext['logger']): void;
    jsonDTO<T>(prompt: string, dtoClass: new () => T, model?: string): Promise<GptResponse<T> | null>;
    chat(prompt: string, model?: string): Promise<GptResponse<string> | null>;
    chatString(prompt: string, model?: string): Promise<string>;
    JsonString<T>(prompt: string, jsonSchema: any, model?: string): Promise<T | null>;
}
//# sourceMappingURL=provider.d.ts.map