import { AppConfigService } from 'src/core/config/services';

type MaskingStrategyType =
  | 'confidential'
  | 'id-card'
  | 'api-key'
  | 'phone'
  | 'credit-card'
  | 'email'
  | 'default';

type MaskingStrategy = (value: string) => string;

interface MaskingConfig {
  fields: string[];
  strategy: MaskingStrategyType;
  paths?: string[];
}

const MASK = '*';
const MAX_PATH_LEN = 100;
const maskConfidential = (value: string): string =>
  value.includes(' ') ? `${value.split(' ')[0]} [REDACTED]` : '[REDACTED]';
const maskIdCard = (value: string): string => {
  const digit = value.replace(/\D/g, '');

  return digit.length && digit.length > 4
    ? `${digit[0]}${MASK.repeat(digit.length - 4)}${digit.slice(-3)}`
    : '';
};
const maskApiKey = (value: string): string => MASK.repeat(value.length);
const maskPhone = (value: string): string => {
  const digit = value.replace(/\D/g, '');

  return digit.length && digit.length > 4
    ? `${digit.slice(0, 2)}${MASK.repeat(digit.length - 4)}${digit.slice(-2)}`
    : '';
};
const maskCreditCard = (value: string): string => {
  const parts = value.split('-');
  const last = parts.pop();

  return `${parts.map(part => MASK.repeat(part.length)).join('-')}-${last}`;
};
const maskEmail = (value: string): string => {
  const [local, domain] = value.split('@');

  if (local.length && local.length > 2) {
    if (!domain) return `${local[0]}${MASK.repeat(local.length - 1)}`;

    const [name, ...rest] = domain.split('.');
    const masked =
      name.length && name.length > 2
        ? `${name[0]}${MASK.repeat(name.length - 2)}${name.slice(-1)}`
        : MASK.repeat(name.length);

    return `${local[0]}${MASK.repeat(local.length - 1)}@${[masked, ...rest].join('.')}`;
  }
};
const maskDefault = (value: string): string =>
  value.length && value.length > 2
    ? `${value[0]}${MASK.repeat(value.length - 2)}${value[value.length - 1]}`
    : `${MASK.repeat(value.length)}`;
const STRATEGIES: Record<MaskingStrategyType, MaskingStrategy> = {
  confidential: maskConfidential,
  'id-card': maskIdCard,
  'api-key': maskApiKey,
  phone: maskPhone,
  'credit-card': maskCreditCard,
  email: maskEmail,
  default: maskDefault,
};

export const sensitiveData = {
  mask: maskSensitiveData,
};

async function getMaskingConfigs(
  config?: AppConfigService,
): Promise<Record<string, MaskingConfig>> {
  const map: Record<
    string,
    { env: string; pathsEnv: string; strategy: MaskingStrategyType }
  > = {
    confidential: {
      env: 'MASKING_CONFIDENTIAL',
      pathsEnv: 'MASKING_CONFIDENTIAL_PATHS',
      strategy: 'confidential',
    },
    'id-card': {
      env: 'MASKING_IDENTITY_CARD',
      pathsEnv: 'MASKING_IDENTITY_CARD_PATHS',
      strategy: 'id-card',
    },
    'api-key': {
      env: 'MASKING_API_KEY',
      pathsEnv: 'MASKING_API_KEY_PATHS',
      strategy: 'api-key',
    },
    phone: {
      env: 'MASKING_PHONE_NUMBER',
      pathsEnv: 'MASKING_PHONE_NUMBER_PATHS',
      strategy: 'phone',
    },
    'credit-card': {
      env: 'MASKING_CREDIT_CARD',
      pathsEnv: 'MASKING_CREDIT_CARD_PATHS',
      strategy: 'credit-card',
    },
    email: {
      env: 'MASKING_EMAIL',
      pathsEnv: 'MASKING_EMAIL_PATHS',
      strategy: 'email',
    },
    default: {
      env: 'MASKING_DEFAULT',
      pathsEnv: 'MASKING_DEFAULT_PATHS',
      strategy: 'default',
    },
  };
  const configs: Record<string, MaskingConfig> = {};

  for (const [key, { env, pathsEnv, strategy }] of Object.entries(map)) {
    const fields =
      (await config?.get(env))?.split(',').map(field => field.trim()) || [];
    const paths =
      (await config?.get(pathsEnv))?.split(',').map(path => path.trim()) || [];

    if (fields.length || paths.length) {
      configs[key] = { fields, paths, strategy };
    }
  }

  return configs;
}

function isPathMatch(path: string, pattern: string): boolean {
  const pathSegments = path.split('.');
  const patternSegments = pattern.split('.');

  if (
    pathSegments.length !== patternSegments.length &&
    !patternSegments.includes('*')
  )
    return false;

  return patternSegments.every(
    (patternSegment, i) =>
      patternSegment === '*' ||
      patternSegment === pathSegments[i] ||
      (patternSegment.startsWith('[') && patternSegment.endsWith(']')),
  );
}

function findStrategy(
  key: string,
  path: string,
  configs: Record<string, MaskingConfig>,
): MaskingStrategyType | undefined {
  for (const config of Object.values(configs)) {
    if (config.paths?.some(pattern => isPathMatch(path, pattern)))
      return config.strategy;
  }

  for (const config of Object.values(configs)) {
    if (
      config.fields.some(field =>
        key.toLowerCase().includes(field.toLowerCase()),
      )
    ) {
      return config.strategy;
    }
  }

  return undefined;
}

async function maskSensitiveData(
  data: unknown,
  config?: AppConfigService,
  path = '',
): Promise<unknown> {
  if (!data || typeof data !== 'object') return data;

  const confs = await getMaskingConfigs(config);

  if (Array.isArray(data)) {
    return Promise.all(
      data.map((value, i) => maskSensitiveData(value, config, `${path}[${i}]`)),
    );
  }

  const result: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(data)) {
    const newPath = path ? `${path}.${key}` : key;

    if (newPath.length > MAX_PATH_LEN) {
      // Skip paths that are too long to prevent infinite recursion
      result[key] = val;
      continue;
    }

    const strategy = findStrategy(key, newPath, confs);

    if (strategy && typeof val === 'string') {
      result[key] = STRATEGIES[strategy](val);
    } else if (val && typeof val === 'object') {
      result[key] = await maskSensitiveData(val, config, newPath);
    } else {
      result[key] = val;
    }
  }

  return result;
}
