import { Composable, preload, EventEnvelope, AsyncHttpRequest } from 'mercury-composable';

/**
 * Direct style: proxies https://dummyjson.com/quotes/{id} and returns the upstream
 * JSON exactly as received.
 */
export class QuoteDirect implements Composable {

    @preload('quote.direct', 10)
    initialize(): Composable {
        return this;
    }

    async handleEvent(evt: EventEnvelope): Promise<object> {
        const req = new AsyncHttpRequest(evt.getBody() as object);
        const id = req.getPathParameter('id') ?? '1';
        const res = await fetch(`https://dummyjson.com/quotes/${encodeURIComponent(id)}`);
        return (await res.json()) as object;
    }
}
