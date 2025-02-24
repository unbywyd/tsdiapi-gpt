import OpenAI from "openai";
import { PluginOptions } from ".";
import { AppContext } from "@tsdiapi/server";
export declare class GPTProvider {
    openai: OpenAI;
    private config;
    logger: AppContext['logger'];
    constructor();
    init(config: PluginOptions, logger: AppContext['logger']): void;
    jsonDTO<T>(prompt: string, dtoClass: new () => T, model?: string): Promise<T | null>;
    chatString(prompt: string, model?: string): Promise<string>;
    JsonString<T>(prompt: string, jsonSchema: any, model?: string): Promise<T | null>;
}
//# sourceMappingURL=provider.d.ts.map