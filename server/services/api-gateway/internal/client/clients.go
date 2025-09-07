package client

import (
	"fmt"

	pb "chat-app-proto/gen/user"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type Clients struct {
	User pb.UserServiceClient
	conns []*grpc.ClientConn
}

type ClientConfig struct {
	UserServiceAddr string
}

func NewClients(config ClientConfig) (*Clients, error) {
	clients := &Clients{
		conns: make([]*grpc.ClientConn, 0),
	}

	userConn, err := clients.newConnection(config.UserServiceAddr)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to user service: %w", err)
	}

	clients.User = pb.NewUserServiceClient(userConn)

	return clients, nil
}

func (c *Clients) newConnection(addr string) (*grpc.ClientConn, error) {
	conn, err := grpc.NewClient(
		addr,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	)
	if err != nil {
		return nil, err
	}

	c.conns = append(c.conns, conn)
	return conn, nil
}

func (c *Clients) Close() error {
	for _, conn := range c.conns {
		if err := conn.Close(); err != nil {
			return err
		}
	}
	return nil
}
