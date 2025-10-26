package hub

import (
	"encoding/json"
	"log"
	"realtime-service/internal/event"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 64 << 10
)

type Client struct {
	hub       *Hub
	conn      *websocket.Conn
	userID    uuid.UUID
	channels  map[uuid.UUID]bool
	send      chan []byte
	closeOnce sync.Once
}

func NewClient(hub *Hub, conn *websocket.Conn, userID uuid.UUID) *Client {
	return &Client{
		hub:      hub,
		conn:     conn,
		userID:   userID,
		channels: make(map[uuid.UUID]bool),
		send:     make(chan []byte, 256),
	}
}

func (c *Client) close() {
	c.closeOnce.Do(func() {
		if err := c.conn.Close(); err != nil {
			log.Printf("Error closing connection: %v", err)
		}
	})
}

func (c *Client) ReadPump() {
	defer func() {
		c.hub.unregister <- c
		c.close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	if err := c.conn.SetReadDeadline(time.Now().Add(pongWait)); err != nil {
		log.Printf("Error setting read deadline: %v", err)
		return
	}
	c.conn.SetPongHandler(func(string) error {
		return c.conn.SetReadDeadline(time.Now().Add(pongWait))
	})

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		event := &event.Event{}
		if err := json.Unmarshal(message, event); err != nil {
			log.Printf("Error unmarshaling message to event: %v", err)
			continue
		}

		c.hub.handleEvent(event)

	}
}

func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			if err := c.conn.SetWriteDeadline(time.Now().Add(writeWait)); err != nil {
				log.Printf("Error setting write deadline: %v", err)
				return
			}
			if !ok {
				if err := c.conn.WriteMessage(websocket.CloseMessage, []byte{}); err != nil {
					log.Printf("Error writing close message: %v", err)
				}
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			if _, err := w.Write(message); err != nil {
				log.Printf("Error writing message: %v", err)
				return
			}

			n := len(c.send)
			for i := 0; i < n; i++ {
				if _, err := w.Write([]byte{'\n'}); err != nil {
					log.Printf("Error writing newline: %v", err)
					return
				}
				if _, err := w.Write(<-c.send); err != nil {
					log.Printf("Error writing queued message: %v", err)
					return
				}
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			if err := c.conn.SetWriteDeadline(time.Now().Add(writeWait)); err != nil {
				log.Printf("Error setting write deadline: %v", err)
				return
			}
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
