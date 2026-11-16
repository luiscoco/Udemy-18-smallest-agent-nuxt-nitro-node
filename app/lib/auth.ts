// Same-origin calls; hosted access control is configured at the server boundary.
export const authorizedFetch = (url: string, options?: RequestInit) => fetch(url, {...options, credentials:'same-origin'});
