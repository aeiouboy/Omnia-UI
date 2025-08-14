import {
  Module,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';

import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { B3InjectEncoding, B3Propagator } from '@opentelemetry/propagator-b3';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OpenTelemetryModule } from 'nestjs-otel';

import {
  httpInstrumentationHook,
  kafkaInstrumentationHook,
} from './instrumentation-hooks';

const otelSDK = new NodeSDK({
  autoDetectResources: true,
  contextManager: new AsyncLocalStorageContextManager(),
  textMapPropagator: new CompositePropagator({
    propagators: [
      new W3CTraceContextPropagator(),
      new W3CBaggagePropagator(),
      new B3Propagator(),
      new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER }),
    ],
  }),
  instrumentations: [
    getNodeAutoInstrumentations(),
    httpInstrumentationHook(),
    kafkaInstrumentationHook(),
  ],
});

export function startTracing(): void {
  otelSDK.start();
}

export function shutdownTracing(): Promise<void> {
  return otelSDK.shutdown();
}

@Module({
  imports: [
    OpenTelemetryModule.forRoot({
      metrics: {
        hostMetrics: true,
        apiMetrics: {
          enable: true,
          ignoreRoutes: ['/health'],
          ignoreUndefinedRoutes: true,
          prefix: '',
        },
      },
    }),
  ],
})
export class TracingModule implements OnApplicationBootstrap, OnModuleDestroy {
  onApplicationBootstrap(): void {
    startTracing();
  }

  async onModuleDestroy(): Promise<void> {
    await shutdownTracing();
  }
}
