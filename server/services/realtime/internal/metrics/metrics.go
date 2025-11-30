package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

type WebSocketMetrics struct {
	ActiveConnections prometheus.Gauge
	TotalConnections  prometheus.Counter
	MessageSent       prometheus.Counter
	MessageReceived   prometheus.Counter

	collectors []prometheus.Collector
}

func NewWebSocketMetrics() *WebSocketMetrics {
	m := &WebSocketMetrics{
		ActiveConnections: promauto.NewGauge(prometheus.GaugeOpts{
			Name: "websocket_active_connections",
			Help: "Number of active WebSocket connections",
		}),
		TotalConnections: promauto.NewCounter(prometheus.CounterOpts{
			Name: "websocket_total_connections",
			Help: "Total number of WebSocket connections established",
		}),
		MessageSent: promauto.NewCounter(prometheus.CounterOpts{
			Name: "websocket_messages_sent_total",
			Help: "Total number of messages sent to clients",
		}),
		MessageReceived: promauto.NewCounter(prometheus.CounterOpts{
			Name: "websocket_messages_received_total",
			Help: "Total number of messages received from Redis Pub/Sub",
		}),
	}

	m.collectors = []prometheus.Collector{
		m.ActiveConnections,
		m.TotalConnections,
		m.MessageSent,
		m.MessageReceived,
	}

	return m
}

func (m *WebSocketMetrics) Collect(ch chan<- prometheus.Metric) {
	for _, collector := range m.collectors {
		collector.Collect(ch)
	}
}

func (m *WebSocketMetrics) Describe(ch chan<- *prometheus.Desc) {
	for _, collector := range m.collectors {
		collector.Describe(ch)
	}
}

var _ prometheus.Collector = (*WebSocketMetrics)(nil)
