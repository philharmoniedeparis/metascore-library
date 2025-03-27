/**
 * Capitalize the first letter of a given string.
 */
export function capitalizeFirstLetter(str: string) {
  return str ? str[0].toUpperCase() + str.slice(1) : "";
}
