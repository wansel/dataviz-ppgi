export function sortByKey<T>(array: T[], key: keyof T): T[] {
  return array.sort((a, b) => (a[key]! > b[key]! ? -1 : 1));
}