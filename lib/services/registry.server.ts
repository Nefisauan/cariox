import 'server-only';
import { createServiceHandlers } from './handlers';
// No vendor adapter is selected, even if someone adds a random API key.
// Connect an owner-approved provider here after authentication, validation,
// rate limiting, receipt authorization, and durable idempotency have been tested.
export const serviceHandlers = createServiceHandlers();
