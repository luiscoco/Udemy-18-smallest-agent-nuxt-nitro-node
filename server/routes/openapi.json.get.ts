import {defineEventHandler} from 'h3';
function schema() {
  const requestBody = { required: true, content: { 'application/json': { schema: { type: 'object', required: ['prompt'], properties: { prompt: { type: 'string', minLength: 1, maxLength: 4000, description: 'Trimmed before validation.' } } } } } };
  const result = { type: 'object', properties: { result: { type: 'string' }, num_turns: { type: 'integer' }, duration_ms: { type: 'integer' }, total_cost_usd: { type: ['number', 'null'] }, is_error: { type: 'boolean' } } };
  return Response.json({ openapi: '3.1.0', info: { title: 'The Smallest Agent · Nuxt + Nitro + Node.js', version: '1.0.0' }, paths: {
    '/api/health': { get: { tags: ['Health'], summary: 'Server readiness and API key presence only', responses: { 200: { description: 'Ready', content: { 'application/json': { schema: { type: 'object', properties: { status: { const: 'ok' }, api_key_configured: { type: 'boolean' } } } } } }, 500: { description: 'Invalid server configuration' } } } },
    '/api/agent/query': { post: { tags: ['Agent'], summary: 'Return final normalized SDK result', requestBody, responses: { 200: { description: 'Result', content: { 'application/json': { schema: result } } }, 400: { description: 'Malformed JSON' }, 403: { description: 'Foreign origin' }, 413: { description: 'Body too large' }, 415: { description: 'Unsupported content type' }, 422: { description: 'Invalid prompt' }, 503: { description: 'Key missing' }, 502: { description: 'SDK failure' } } } },
    '/api/agent/stream': { post: { tags: ['Agent'], summary: 'SSE message events followed by done, or safe error events', requestBody, responses: { 200: { description: 'SSE stream', content: { 'text/event-stream': { schema: { type: 'string' } } } }, 400: { description: 'Malformed JSON' }, 403: { description: 'Foreign origin' }, 413: { description: 'Body too large' }, 415: { description: 'Unsupported content type' }, 422: { description: 'Invalid prompt' } } } },
  } });
}

export default defineEventHandler(()=>schema());
