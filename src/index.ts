import "reflect-metadata";
import type { AppContext, AppPlugin } from "@tsdiapi/server";
import { GPTProvider, GptResponse } from "./provider.js";

let gptProvider: GPTProvider | null = null;

export type PluginOptions = {
    apiKey?: string;
    model?: string;
};

const defaultConfig: PluginOptions = {
    apiKey: "",
    model: "gpt-4o-mini",
}

class App implements AppPlugin {
    name = 'tsdiapi-gpt';
    config: PluginOptions;
    context: AppContext;
    provider: GPTProvider;
    constructor(config?: PluginOptions) {
        this.config = { ...defaultConfig, ...config };
        this.provider = new GPTProvider();
    }
    async onInit(ctx: AppContext) {
        if (gptProvider) {
            ctx.logger.warn("⚠ GPT Plugin is already initialized. Skipping re-initialization.");
            return;
        }

        this.context = ctx;
        const appConfig = ctx.config.appConfig || {};

        this.config.apiKey = this.config.apiKey || appConfig["OPENAI_API_KEY"];
        this.config.model = this.config.model || appConfig["OPENAI_MODEL_ID"] || "gpt-4o";

        if (!this.config.apiKey) {
            throw new Error("❌ GPT Plugin is missing an API key.");
        }

        this.provider.init(this.config, ctx.logger);
        gptProvider = this.provider;

        ctx.logger.info("✅ GPT Plugin initialized.");
    }
}

export function getGPTProvider(): GPTProvider {
    if (!gptProvider) {
        throw new Error("❌ GPT Plugin is not initialized. Use createPlugin() first.");
    }
    return gptProvider;
}

export { GPTProvider };

export type { GptResponse };

export default function createPlugin(config?: PluginOptions) {
    return new App(config);
}