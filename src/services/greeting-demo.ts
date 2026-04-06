import { Composable, preload, EventEnvelope } from 'mercury-composable';

/**
 * Style 2: a function invoked from a YAML event flow (resources/flows/greetings.yml).
 * The flow has already extracted input.path_parameter.user into a field called "user",
 * so this function just reads it from its input map.
 */
export class GreetingDemo implements Composable {

    @preload('greeting.demo', 10)
    initialize(): Composable {
        return this;
    }

    async handleEvent(evt: EventEnvelope) {
        const body = (evt.getBody() ?? {}) as Record<string, unknown>;
        return {
            user: body['user'] ?? 'world',
            message: 'Welcome',
            style: 'flow',
            time: new Date().toISOString()
        };
    }
}
