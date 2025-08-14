export class ObjectHelpers {
  static isEmptyObject(obj: unknown): boolean {
    return (
      obj === null ||
      obj === undefined ||
      (typeof obj === 'object' &&
        !Array.isArray(obj) &&
        Object.keys(obj).length === 0)
    );
  }
}
