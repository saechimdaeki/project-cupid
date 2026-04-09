/** Storage path가 아니라 이미 브라우저에서 쓸 수 있는 URL인지 */
export function isDirectImageUrl(value: string | null | undefined) {
  return Boolean(
    value && (value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://")),
  );
}
