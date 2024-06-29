/**
 * Returns the fullname of a character.
 * @param {object} char Character model or object
 * @returns {string} Full name.
 */
export default function fullname(char: {
  name: string;
  surname: string;
}): string {
  return (char && (char.name + ' ' + char.surname).trim()) || '';
}
