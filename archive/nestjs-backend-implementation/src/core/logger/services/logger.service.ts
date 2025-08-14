import { Injectable, Logger as NestLogger, OnModuleInit } from '@nestjs/common';

import dayjs from 'dayjs';
import { Logger, createLogger, format, transports } from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import LogstashTransport from 'winston-logstash/lib/winston-logstash-latest';

import { AppConfigService } from 'src/core/config/services';

@Injectable()
export class LoggerService implements OnModuleInit {
  private logger: Logger;
  private appName: string;
  private readonly nestLogger = new NestLogger(LoggerService.name);
  private readonly transportList: (
    | transports.StreamTransportInstance
    | ElasticsearchTransport
    | LogstashTransport
  )[] = [];

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly logLevel: string,
    private readonly logTransport: string,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.initialize();
  }

  private shouldLog(level: string): boolean {
    const hierarchy = {
      debug: ['debug', 'info', 'warn', 'error'],
      info: ['info', 'warn', 'error'],
      warn: ['warn', 'error'],
      error: ['error'],
    };
    const allowedLevels = hierarchy[this.logLevel] ?? ['error'];

    return allowedLevels.includes(level);
  }

  private initializeConsoleTransport(logTransports: string[]): void {
    if (!logTransports.includes('console')) return;

    this.transportList.push(
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.timestamp(),
          format.printf(
            ({
              timestamp,
              context,
              exception,
              code,
              message,
              grpc,
              level,
              stack,
            }) => {
              const formattedTimestamp = dayjs(
                timestamp as string | number | Date,
              )
                .tz('Asia/Bangkok')
                .format('YYYY-MM-DD HH:mm:ss.SSS');

              code =
                grpc && typeof grpc === 'object' && 'status' in grpc
                  ? grpc.status
                  : code;

              let logMessage =
                `[${formattedTimestamp || ''}] ${String(level) || ''} - ` +
                (context ? `[${context as string}]` : '') +
                (code ? `[${code as string}]` : '') +
                (exception ? `[${exception as string}]` : '') +
                ` ${(message as string).trim()}`;

              if (stack) {
                logMessage += `\n${stack as string}`;
              }

              return logMessage;
            },
          ),
        ),
      }),
    );
    this.nestLogger.log('Console transport added.');
  }

  private async initializeElasticsearchTransport(
    logTransports: string[],
  ): Promise<void> {
    const elasticsearchUrl =
      await this.appConfigService.get('ELASTICSEARCH_URL');

    if (!elasticsearchUrl || !logTransports.includes('elasticsearch')) return;

    this.transportList.push(
      new ElasticsearchTransport({
        level: this.logLevel,
        clientOpts: { node: elasticsearchUrl },
        indexPrefix: await this.appConfigService.get(
          'ELASTICSEARCH_INDEX_PETTERN',
        ),
      }),
    );
    this.nestLogger.log('Elasticsearch transport initialized');
    this.nestLogger.log(`Elasticsearch transport URL: ${elasticsearchUrl}`);
  }

  private async initializeLogstashTransport(
    logTransports: string[],
  ): Promise<void> {
    const [logstashHost, logstashPort, appName] = await Promise.all([
      this.appConfigService.get('LOGSTASH_HOST'),
      this.appConfigService.get('LOGSTASH_PORT'),
      this.appConfigService.get('APP_NAME', 'unknown'),
    ]);

    if (!logstashHost || !logstashPort || !logTransports.includes('logstash'))
      return;

    this.transportList.push(
      new LogstashTransport({
        host: logstashHost,
        port: parseInt(logstashPort, 10),
        node_name: appName,
        level: this.logLevel,
        retryInterval: 5000,
        maxRetries: 5,
      }),
    );
    this.nestLogger.log('Logstash transport initialized');
    this.nestLogger.log(
      `Logstash transport URL: ${logstashHost}:${logstashPort}`,
    );
  }

  private initializeDefaultTransport(): void {
    if (this.transportList.length > 0) return;

    this.transportList.push(
      new transports.Console({
        format: format.combine(format.timestamp(), format.json()),
      }),
    );
    this.nestLogger.warn(
      'No transports configured. Defaulting to console transport.',
    );
  }

  async initialize(): Promise<void> {
    const logTransports = this.logTransport
      .toLowerCase()
      .split(',')
      .map(t => t.trim());

    this.appName = await this.appConfigService.get('APP_NAME', 'unknown');

    await Promise.all([
      this.initializeConsoleTransport(logTransports),
      this.initializeElasticsearchTransport(logTransports),
      this.initializeLogstashTransport(logTransports),
    ]);

    this.initializeDefaultTransport();

    this.logger = createLogger({
      level: this.logLevel,
      transports: this.transportList,
      exitOnError: false,
    });

    this.logger.on('error', error => {
      this.nestLogger.error(error);
    });

    this.nestLogger.log(`Logger initialized with level: [${this.logLevel}]`);
    this.nestLogger.log(
      `Logger initialized with ${this.transportList.length} transport(s): [${this.transportList.map(t => t.constructor.name).join(', ')}]`,
    );
  }

  log(
    level: string,
    message: string,
    context?: string,
    details?: Record<string, unknown>,
  ): void {
    if (this.shouldLog(level)) {
      delete details?.errorMessage;

      const logDetails: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
        '@metadata': {
          app_name: this.appName,
          function: context.toLowerCase(),
        },
        ...details,
      };

      this.logger.log(level, message, { context, ...logDetails });
    }
  }

  debug(
    message: string,
    context?: string,
    details?: Record<string, unknown>,
  ): void {
    this.log('debug', message, context, details);
  }

  info(
    message: string,
    context?: string,
    details?: Record<string, unknown>,
  ): void {
    this.log('info', message, context, details);
  }

  warn(
    message: string,
    context?: string,
    details?: Record<string, unknown>,
  ): void {
    this.log('warn', message, context, details);
  }

  error(
    message: string,
    context?: string,
    details?: Record<string, unknown>,
  ): void {
    this.log('error', message, context, details);
  }
}
