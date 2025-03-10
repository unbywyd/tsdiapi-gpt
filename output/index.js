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
export function getGPTProvider() {
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