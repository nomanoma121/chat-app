package hub

type SubscriptionManager struct {
	ChannelSubs map[string]map[*Client]bool
}

func NewSubscriptionManager() *SubscriptionManager {
	return &SubscriptionManager{
		ChannelSubs: make(map[string]map[*Client]bool),
	}
}

func (sm *SubscriptionManager) SubscribeChannel(client *Client, channelID string) {
	if sm.ChannelSubs[channelID] == nil {
		sm.ChannelSubs[channelID] = make(map[*Client]bool)
	}
	sm.ChannelSubs[channelID][client] = true
	client.channels[channelID] = true
}

func (sm *SubscriptionManager) UnsubscribeChannel(client *Client, channelID string) {
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

func (sm *SubscriptionManager) GetSubscribers(channelID string) map[*Client]bool {
	return sm.ChannelSubs[channelID]
}

