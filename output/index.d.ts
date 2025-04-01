import "reflect-metadata";
import type { AppContext, AppPlugin } from "@tsdiapi/server";
import { GPTProvider, GptResponse } from "./provider.js";
export type PluginOptions = {
    apiKey?: string;
    model?: string;
};
declare module "fastify" {
    interface FastifyInstance {
        gpt: GPTProvider;
    }
}
declare class App implements AppPlugin {
    name: string;
    config: PluginOptions;
    context: AppContext;
    provider: GPTProvider;
    constructor(config?: PluginOptions);
    onInit(ctx: AppContext): Promise<void>;
}
export declare function useGPTProvider(): GPTProvider;
export { GPTProvider };
export type { GptResponse };
export default function createPlugin(config?: PluginOptions): App;
//# sourceMappingURL=index.d.ts.map