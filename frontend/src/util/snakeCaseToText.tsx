/*
 * Replace underscores with capital letters and spaces
 */
export function snakeCaseToText (text: string): string {
  return text
    .replace(/^[a-z]/, (match) => match.toUpperCase())
    .replace(/_([a-z])/g, (_, match) => ` ${match.toUpperCase()}`)
}
