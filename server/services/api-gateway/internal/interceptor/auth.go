package interceptor

import (
	"context"

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

		if userID, ok := claims["user_id"].(string); ok {
			md := metadata.Pairs("user_id", userID)
			ctx = metadata.NewOutgoingContext(ctx, md)
		}

		return invoker(ctx, method, req, reply, cc, opts...)
	}
}
