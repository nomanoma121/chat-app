package hub

import (
	"sync"

	"github.com/google/uuid"
)

type SubscriptionManager struct {
	ChannelSubs map[uuid.UUID]map[*Client]bool
	mu          sync.RWMutex
}

func NewSubscriptionManager() *SubscriptionManager {
	return &SubscriptionManager{
		ChannelSubs: make(map[uuid.UUID]map[*Client]bool),
	}
}

func (sm *SubscriptionManager) SubscribeChannel(client *Client, channelID uuid.UUID) {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	if sm.ChannelSubs[channelID] == nil {
		sm.ChannelSubs[channelID] = make(map[*Client]bool)
	}
	sm.ChannelSubs[channelID][client] = true
	client.channels[channelID] = true
}

func (sm *SubscriptionManager) UnsubscribeChannel(client *Client, channelID uuid.UUID) {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	if subs, ok := sm.ChannelSubs[channelID]; ok {
		if _, exists := subs[client]; exists {
			delete(subs, client)
			if len(subs) == 0 {
				delete(sm.ChannelSubs, channelID)
			}
		}
	}
	delete(client.channels, channelID)
}

func (sm *SubscriptionManager) UnsubscribeAll(client *Client) {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	for channelID := range client.channels {
		if clients, ok := sm.ChannelSubs[channelID]; ok {
			if _, exists := clients[client]; exists {
				delete(clients, client)
				if len(clients) == 0 {
					delete(sm.ChannelSubs, channelID)
				}
			}
		}
	}
}

func (sm *SubscriptionManager) GetSubscribers(channelID uuid.UUID) map[*Client]bool {
	sm.mu.RLock()
	defer sm.mu.RUnlock()
	
	return sm.ChannelSubs[channelID]
}
