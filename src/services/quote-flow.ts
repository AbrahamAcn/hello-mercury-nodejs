import { Composable, preload, EventEnvelope } from 'mercury-composable';

/**
 * Flow style: called from resources/flows/quotes.yml. The flow extracts
 * input.path_parameter.id into a field called "id", so this function reads
 * that from its input map and proxies https://dummyjson.com/quotes/{id}.
 */
export class QuoteFlow implements Composable {

    @preload('quote.flow', 10)
    initialize(): Composable {
        return this;
    }

    async handleEvent(evt: EventEnvelope): Promise<object> {
        const body = (evt.getBody() ?? {}) as Record<string, unknown>;
        const id = (body['id'] as string | number | undefined) ?? '1';
        const res = await fetch(`https://dummyjson.com/quotes/${encodeURIComponent(String(id))}`);
        return (await res.json()) as object;
    }
}
