/* eslint-disable @typescript-eslint/no-explicit-any */
export const extractCapturedFields = (
  source: Record<string, any>,
  configValue: string | undefined,
): Record<string, any> => {
  if (!configValue || typeof configValue !== 'string') return {};

  const keys = configValue
    .split(',')
    .map(k => k.trim())
    .filter(Boolean);
  const result: Record<string, any> = {};

  for (const key of keys) {
    const value = findNestedCapturedFields(source, key);

    if (value !== undefined) result[key] = value;
  }

  return result;
};

export const findNestedCapturedFields = (
  obj: Record<string, any>,
  path: string,
): any => {
  return path.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return acc[part];
    }

    return undefined;
  }, obj);
};
