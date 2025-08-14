import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import type { Instrumentation } from '@opentelemetry/instrumentation';

export function httpInstrumentationHook(): Instrumentation[] {
  return getNodeAutoInstrumentations({
    '@opentelemetry/instrumentation-http': {
      enabled: true,
      ignoreIncomingRequestHook: req => req.url === '/health',
    },
  });
}
