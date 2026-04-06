import { Logger } from 'mercury-composable';
import { ComposableLoader } from './composable-loader.js';

const log = Logger.getInstance();

async function main() {
    await ComposableLoader.initialize();
    log.info('hello-world-nodejs started');
}

main();
