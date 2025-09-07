package router

import (
	"api-gateway/internal/client"
	"api-gateway/internal/handler"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func NewRouter(clients *client.Clients) *echo.Echo {
	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	userHandler := handler.NewUserHandler(clients)

	api := e.Group("/api")
	
	auth := api.Group("/auth")
	{
		auth.POST("/register", userHandler.Register)
	}
	
	users := api.Group("/users")
	{
		users.GET("/:id", userHandler.GetUser)
	}

	return e
}
