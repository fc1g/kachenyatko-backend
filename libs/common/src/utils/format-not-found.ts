export function formatNotFound(
  entity: string,
  where: string,
  value: unknown,
): string {
  return `${entity} not found. Where ${where}: ${JSON.stringify(value)}`;
}
