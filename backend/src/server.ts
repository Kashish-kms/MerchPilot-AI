import Fastify from 'fastify';
import cors from '@fastify/cors';
import { z } from 'zod';

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

const salesSchema = z.object({ productId: z.string().default('demo-product'), history: z.array(z.object({ date: z.string(), units: z.number().nonnegative() })).default([]) });
app.get('/health', async () => ({ ok: true, service: 'merchpilot-api' }));

app.post('/api/forecast', async (request, reply) => {
  const input = salesSchema.safeParse(request.body);
  if (!input.success) return reply.code(400).send({ error: input.error.flatten() });
  const history = input.data.history;
  const baseline = history.length ? history.reduce((sum, row) => sum + row.units, 0) / history.length : 4;
  const forecast = Array.from({ length: 30 }, (_, index) => ({
    date: new Date(Date.now() + (index + 1) * 86400000).toISOString().slice(0, 10),
    demand: Math.max(0, Math.round(baseline * (1 + Math.sin(index / 4) * 0.12))),
    lower: Math.max(0, Math.round(baseline * 0.75)),
    upper: Math.round(baseline * 1.3)
  }));
  return { productId: input.data.productId, model: 'chronos-bolt-mock', zeroShot: history.length === 0, forecast };
});

app.post('/api/scrub', async (request) => {
  const rows = Array.isArray(request.body) ? request.body as Record<string, unknown>[] : [];
  const seen = new Set<string>(); const warnings: string[] = []; const clean: Record<string, unknown>[] = [];
  for (const row of rows) {
    const name = String(row.name ?? row.product_name ?? '').trim().replace(/\s+/g, ' ');
    const normalized = { ...row, name };
    const key = JSON.stringify(normalized);
    if (seen.has(key)) continue;
    seen.add(key); if (!row.price) warnings.push(`Missing price for ${name || 'unnamed product'}`); clean.push(normalized);
  }
  return { rows: clean, duplicatesRemoved: rows.length - clean.length, warnings };
});

app.post('/api/support/message', async (request) => {
  const body = z.object({ message: z.string(), turns: z.number().default(0) }).parse(request.body);
  const escalation = /angry|broken|fraud|cancel/i.test(body.message) || body.turns >= 3;
  return { escalated: escalation, sentiment: escalation ? 'negative' : 'neutral', summary: escalation ? `Customer needs help with: ${body.message.slice(0, 100)}` : undefined, reply: escalation ? 'I’m connecting you with a merchant specialist now.' : 'I can help check an order status. Please share your order number.' };
});

app.post('/api/payments/proposals', async (request) => ({ status: 'pending', proposal: request.body, consentToken: `consent_${crypto.randomUUID()}` }));
app.post('/api/payments/proposals/:id/approve', async (request) => ({ id: (request.params as { id: string }).id, status: 'approved', approvedAt: new Date().toISOString() }));

app.listen({ port: Number(process.env.PORT ?? 4000), host: '0.0.0.0' }).catch((error) => { app.log.error(error); process.exit(1); });
