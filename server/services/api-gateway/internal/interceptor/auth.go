package interceptor

import (
	"context"
	"fmt"

	"github.com/go-chi/jwtauth/v5"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
)

func JWTToMetadata() grpc.UnaryClientInterceptor {
	return func(ctx context.Context, method string, req, reply interface{}, cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
		_, claims, err := jwtauth.FromContext(ctx)
		if err != nil {
			return invoker(ctx, method, req, reply, cc, opts...)
		}

		pairs := []string{}

		if userID, ok := claims["user_id"].(string); ok {
			pairs = append(pairs, "user_id", userID)
		}

		if exp, ok := claims["exp"].(float64); ok {
			pairs = append(pairs, "exp", fmt.Sprintf("%.0f", exp))
		}

		if iat, ok := claims["iat"].(float64); ok {
			pairs = append(pairs, "iat", fmt.Sprintf("%.0f", iat))
		}

		if len(pairs) > 0 {
			md := metadata.Pairs(pairs...)
			ctx = metadata.NewOutgoingContext(ctx, md)
		}

		return invoker(ctx, method, req, reply, cc, opts...)
	}
}
