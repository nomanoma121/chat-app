package middleware

import (
	"net/http"

	"github.com/go-chi/jwtauth/v5"
)

type Paths map[string]bool

type Config struct {
	Skip Paths
}

func JWTAuthorizer(ja *jwtauth.JWTAuth, config Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if config.Skip[r.URL.Path] {
				next.ServeHTTP(w, r)
				return
			}
			token, err := jwtauth.VerifyRequest(ja, r, jwtauth.TokenFromHeader)

			if err != nil {
				http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
				return
			}
			ctx := jwtauth.NewContext(r.Context(), token, nil)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
