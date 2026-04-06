import fs from 'fs';
import { fileURLToPath } from 'url';
import { AppConfig, Platform, RestAutomation, EventScriptEngine, Logger } from 'mercury-composable';
import { HelloDirect } from './services/hello-direct.js';
import { GreetingDemo } from './services/greeting-demo.js';
import { QuoteDirect } from './services/quote-direct.js';

const log = Logger.getInstance();

function getRootFolder(): string {
    const folder = fileURLToPath(new URL('.', import.meta.url));
    const filePath = folder.includes('\\') ? folder.replaceAll('\\', '/') : folder;
    const colon = filePath.indexOf(':');
    return colon === 1 ? filePath.substring(colon + 1) : filePath;
}

/**
 * Hand-written equivalent of the file that the Mercury preloader normally generates
 * from src/resources/templates/preload.template. Kept verbose on purpose so the wiring
 * is obvious. A production app would generate this with a class scanner instead.
 */
export class ComposableLoader {
    private static loaded = false;

    static async initialize(): Promise<void> {
        if (ComposableLoader.loaded) {
            return;
        }
        ComposableLoader.loaded = true;
        try {
            const resourcePath = getRootFolder() + 'resources';
            if (!fs.existsSync(resourcePath) || !fs.statSync(resourcePath).isDirectory()) {
                throw new Error(`Missing resources folder: ${resourcePath}`);
            }

            // 1. Load application.yml + child configs
            const config = AppConfig.getInstance(resourcePath);

            // 2. Register user functions with the event system
            const platform = Platform.getInstance();
            // Style 1 — direct REST -> function
            platform.register('hello.direct', new HelloDirect().initialize(), 10);
            // Style 2 — flow task invoked from flows/greetings.yml
            platform.register('greeting.demo', new GreetingDemo().initialize(), 10);
            // Direct REST -> dummyjson quote proxy
            platform.register('quote.direct', new QuoteDirect().initialize(), 10);

            // 3. Compile YAML flows and start the Event Script engine
            const engine = new EventScriptEngine();
            await engine.start();

            // 4. Optionally start the built-in REST automation server
            if (config.getProperty('rest.automation') === 'true') {
                await RestAutomation.getInstance().start();
            }

            // 5. Keep the process alive
            platform.runForever();
            await platform.getReady();
        } catch (e) {
            log.error(`Unable to preload - ${(e as Error).message}`);
        }
    }
}
