package main

import (
	"api-gateway/internal/client"
	"api-gateway/internal/router"
	"log"
)

func main() {
	clientConfig := client.ClientConfig{
		UserServiceAddr: "localhost:50051",
	}

	clients, err := client.NewClients(clientConfig)
	if err != nil {
		log.Fatal("Failed to initialize clients: ", err)
	}
	defer clients.Close()

	e := router.NewRouter(clients)

	log.Println("API Gateway starting on port 8000")
	if err := e.Start(":8000"); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}
