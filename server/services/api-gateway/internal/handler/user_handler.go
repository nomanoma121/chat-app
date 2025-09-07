package handler

import (
	"api-gateway/internal/client"
	userPb "chat-app-proto/gen/user"
	"net/http"

	"github.com/labstack/echo/v4"
)

type UserHandler struct {
	clients *client.Clients
}

func NewUserHandler(clients *client.Clients) *UserHandler {
	return &UserHandler{clients: clients}
}

type CreateUserRequest struct {
	DisplayId string `json:"display_id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	Bio       string `json:"bio"`
	IconUrl   string `json:"icon_url"`
}

type UserResponse struct {
	Id        string `json:"id"`
	DisplayId string `json:"display_id"`
	Name      string `json:"name"`
	Bio       string `json:"bio"`
	IconUrl   string `json:"icon_url"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

func (h *UserHandler) Register(c echo.Context) error {
	var req CreateUserRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(400, map[string]string{"error": "Invalid request"})
	}

	pbReq := &userPb.RegisterRequest{
		DisplayId: req.DisplayId,
		Name:      req.Name,
		Email:     req.Email,
		Password:  req.Password,
		Bio:       req.Bio,
		IconUrl:   req.IconUrl,
	}

	pbRes, err := h.clients.User.Register(c.Request().Context(), pbReq)
	if err != nil {
		return c.JSON(500, map[string]string{"error": "Failed to create user"})
	}

	res := UserResponse{
		Id:        pbRes.User.Id,
		DisplayId: pbRes.User.DisplayId,
		Name:      pbRes.User.Name,
		Bio:       pbRes.User.Bio,
		IconUrl:   pbRes.User.IconUrl,
		CreatedAt: pbRes.User.CreatedAt.AsTime().Format("2006-01-02 15:04:05"),
		UpdatedAt: pbRes.User.UpdatedAt.AsTime().Format("2006-01-02 15:04:05"),
	}

	return c.JSON(201, res)
}

func (h *UserHandler) GetUser(c echo.Context) error {
	userId := c.Param("id")
	if userId == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "User ID is required")
	}

	pbReq := &userPb.GetUserByIDRequest{
		Id: userId,
	}

	pbRes, err := h.clients.User.GetUserByID(c.Request().Context(), pbReq)
	if err != nil {
		return c.JSON(500, map[string]string{"error": "Failed to get user"})
	}

	res := UserResponse{
		Id:        pbRes.User.Id,
		DisplayId: pbRes.User.DisplayId,
		Name:      pbRes.User.Name,
		Bio:       pbRes.User.Bio,
		IconUrl:   pbRes.User.IconUrl,
		CreatedAt: pbRes.User.CreatedAt.AsTime().Format("2006-01-02 15:04:05"),
		UpdatedAt: pbRes.User.UpdatedAt.AsTime().Format("2006-01-02 15:04:05"),
	}

	return c.JSON(http.StatusOK, res)
}
