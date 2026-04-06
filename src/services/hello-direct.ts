import { Composable, preload, EventEnvelope, AsyncHttpRequest } from 'mercury-composable';

/**
 * Style 1: a function called directly from a REST endpoint declared in rest.yaml.
 * The function receives the raw AsyncHttpRequest and reads the {name} path parameter itself.
 */
export class HelloDirect implements Composable {

    @preload('hello.direct', 10)
    initialize(): Composable {
        return this;
    }

    async handleEvent(evt: EventEnvelope) {
        const req = new AsyncHttpRequest(evt.getBody() as object);
        const name = req.getPathParameter('name') ?? 'world';
        return {
            message: `Hello, ${name}!`,
            style: 'direct'
        };
    }
}
