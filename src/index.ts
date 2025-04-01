import "reflect-metadata";
import type { AppContext, AppPlugin } from "@tsdiapi/server";
import { GPTProvider, GptResponse } from "./provider.js";
import type { FastifyInstance } from "fastify";

let gptProvider: GPTProvider | null = null;

export type PluginOptions = {
    apiKey?: string;
    model?: string;
};

declare module "fastify" {
    interface FastifyInstance {
        gpt: GPTProvider;
    }
}


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
        const logger = ctx.fastify.log;
        if (gptProvider) {
            logger.warn("⚠ GPT Plugin is already initialized. Skipping re-initialization.");
            return;
        }

        this.context = ctx;
        const config = ctx.projectConfig;

        this.config.apiKey = config.get('OPENAI_API_KEY', this.config.apiKey) as string;
        this.config.model = config.get('OPENAI_MODEL_ID', this.config.model || defaultConfig.model) as string;

        if (!this.config.apiKey) {
            throw new Error("❌ GPT Plugin is missing an API key.");
        }

        this.provider.init(this.config);
        gptProvider = this.provider;

        ctx.fastify.decorate("gpt", this.provider);
    }
}

export function useGPTProvider(): GPTProvider {
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