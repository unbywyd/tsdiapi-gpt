import "reflect-metadata";
import type { AppContext, AppPlugin } from "@tsdiapi/server";
import { GPTProvider } from "./provider";
export type PluginOptions = {
    apiKey?: string;
    model?: string;
};
declare class App implements AppPlugin {
    name: string;
    config: PluginOptions;
    context: AppContext;
    provider: GPTProvider;
    constructor(config?: PluginOptions);
    onInit(ctx: AppContext): Promise<void>;
}
export declare function getGPTProvider(): GPTProvider;
export { GPTProvider };
export default function createPlugin(config?: PluginOptions): App;
//# sourceMappingURL=index.d.ts.map