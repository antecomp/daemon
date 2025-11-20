/** Type narrowing way to check if a certain key is in an object. 
 * Used to avoid the "asdf is implictily any because string cannot..." */
export function keyInObject<T extends object>(
  obj: T,
  key: PropertyKey
): key is keyof T {
  return Object.prototype.hasOwnProperty.call(obj, key);
}