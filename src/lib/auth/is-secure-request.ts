// One rule for the `secure` flag of session cookies, used by the proxy and by
// Server Actions: the request came over HTTPS, either as the URL says or, behind
// a proxy such as Vercel's, as `x-forwarded-proto` says.
export function isSecureRequest(headers: Headers, url?: URL): boolean {
  return (
    headers.get("x-forwarded-proto") === "https" || url?.protocol === "https:"
  );
}
