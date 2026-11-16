# HRMS-Implementation

## Admin backend requests with Axios

The admin app has an Axios client at `admin/src/services/api/api.js`.
Import it in an admin service when adding a backend request.

The default backend URL is `http://localhost:3000`. To change it, copy that
admin's `.env.example` to `.env`, edit `VITE_API_URL`, and restart Vite. Use the
backend's root URL; add endpoint paths in the service. Vite exposes `VITE_`
variables to the browser, so never put passwords or secrets in them.

For example, from `src/services/auth/authService.js`:

```js
import api from '../api/api.js'

export async function checkBackendHealth() {
  const response = await api.get('/health')
  return response.data
}
```

Use `api.post('/path', input)`, `api.put('/path', input)`, or
`api.delete('/path')` for other requests once those endpoints exist.
Pass only the input needed by the endpoint, rather than the local demo state.

Requests time out after 10 seconds. Axios rejects HTTP errors, network failures,
and timeouts. Handle them in the calling form or page; `error.response` contains
the server's status and response body when the server replied. Keep the original
error available for debugging, and avoid logging passwords or tokens.

This adds the request client. Existing demo services still need to be connected
as their backend endpoints are implemented. The current server endpoint is
`GET /health`. Authentication headers or cookies can be configured once the
backend login contract is defined.
