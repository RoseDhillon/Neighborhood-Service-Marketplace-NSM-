import { HttpInterceptorFn } from "@angular/common/http"

// Attach credentials (session cookie) to every request
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const cloned = req.clone({ withCredentials: true })
  return next(cloned)
}
