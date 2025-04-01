import "reflect-metadata";
import { GPTProvider } from "./provider.js";
let gptProvider = null;
const defaultConfig = {
    apiKey: "",
    model: "gpt-4o-mini",
};
class App {
    name = 'tsdiapi-gpt';
    config;
    context;
    provider;
    constructor(config) {
        this.config = { ...defaultConfig, ...config };
        this.provider = new GPTProvider();
    }
    async onInit(ctx) {
        const logger = ctx.fastify.log;
        if (gptProvider) {
            logger.warn("⚠ GPT Plugin is already initialized. Skipping re-initialization.");
            return;
        }
        this.context = ctx;
        const config = ctx.projectConfig;
        this.config.apiKey = config.get('OPENAI_API_KEY', this.config.apiKey);
        this.config.model = config.get('OPENAI_MODEL_ID', this.config.model || defaultConfig.model);
        if (!this.config.apiKey) {
            throw new Error("❌ GPT Plugin is missing an API key.");
        }
        this.provider.init(this.config);
        gptProvider = this.provider;
        ctx.fastify.decorate("gpt", this.provider);
    }
}
export function useGPTProvider() {
    if (!gptProvider) {
        throw new Error("❌ GPT Plugin is not initialized. Use createPlugin() first.");
    }
    return gptProvider;
}
export { GPTProvider };
export default function createPlugin(config) {
    return new App(config);
}
//# sourceMappingURL=index.js.map