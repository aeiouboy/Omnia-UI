export class ArrayHelpers {
  static isEmptyArray(arr: unknown): boolean {
    return (
      arr === null ||
      arr === undefined ||
      (Array.isArray(arr) && arr.length === 0)
    );
  }
}
