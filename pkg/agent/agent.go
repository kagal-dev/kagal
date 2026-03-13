// Package agent provides the Kagal agent-side library.
//
// The agent maintains a persistent WebSocket connection
// to a Kagal-enabled Cloudflare Worker, handles nonce
// rotation, task dispatch, status reporting, and
// automatic reconnection with exponential backoff.
//
// Consumers create an [Agent] with [New], register task
// handlers via [Agent.RegisterTask], and call
// [Agent.Run] to block until the context is cancelled.
package agent

import (
	"context"
	"crypto/tls"
	"io"
	"log"
)

// Config configures the Kagal agent.
type Config struct {
	// ServerURL is the base URL of the Kagal-enabled
	// Worker.
	// e.g., "https://fleet.example.com/kagal"
	ServerURL string

	// AgentID is this agent's unique identifier.
	// Must match the CN in the agent certificate.
	AgentID string

	// TLS configures mTLS. Must include the agent's
	// client certificate.
	TLS *tls.Config

	// StateDir is where the agent persists nonce and
	// registration state.
	// Default: /var/lib/kagal/
	StateDir string

	// SSHAddr is the local SSH server address to splice
	// for SSH tunnels.
	// Default: "127.0.0.1:22"
	SSHAddr string

	// StatusInterval is how often to send status
	// messages (seconds).
	// Default: 300
	StatusInterval int

	// PingInterval is how often to send WebSocket pings
	// (seconds).
	// Default: 30
	PingInterval int

	// Logger for the agent. Default: log.Default()
	Logger *log.Logger

	// OnQuarantine is called when the server
	// quarantines this agent.
	OnQuarantine func(reason string, claimCode string)
}

// TaskHandler processes a task and returns a result.
type TaskHandler func(
	ctx context.Context,
	params map[string]any,
) (map[string]any, error)

// Agent is a Kagal agent client.
type Agent struct {
	cfg    Config
	tasks  map[string]TaskHandler
	status func() map[string]any
}

// New creates a new Kagal agent.
func New(cfg Config) *Agent {
	return &Agent{
		cfg:   cfg,
		tasks: make(map[string]TaskHandler),
	}
}

// RegisterTask registers a handler for a task action.
func (a *Agent) RegisterTask(
	action string, handler TaskHandler,
) {
	a.tasks[action] = handler
}

// SetStatusFunc sets a function that returns the
// current agent status. Called every StatusInterval
// seconds and on server request.
func (a *Agent) SetStatusFunc(fn func() map[string]any) {
	a.status = fn
}

// Run starts the agent. Blocks until ctx is cancelled.
// Handles registration, WebSocket connection,
// reconnection with backoff, nonce rotation, task
// dispatch, and status reporting.
func (a *Agent) Run(_ context.Context) error {
	// TODO: implement
	return nil
}

// SSHHandler returns a TaskHandler that opens an SSH
// tunnel to the given local address.
func SSHHandler(_ string) TaskHandler {
	return func(_ context.Context, _ map[string]any) (map[string]any, error) {
		// TODO: implement
		return nil, nil
	}
}

// FirmwareHandler returns a TaskHandler that downloads
// and applies firmware via a pre-signed URL provided
// by the server.
func FirmwareHandler(
	_ func(path string) error,
) TaskHandler {
	return func(_ context.Context, _ map[string]any) (map[string]any, error) {
		// TODO: implement
		return nil, nil
	}
}

// BackupHandler returns a TaskHandler that creates and
// uploads a backup via a pre-signed URL provided by the
// server.
func BackupHandler(
	_ func() (io.Reader, error),
) TaskHandler {
	return func(_ context.Context, _ map[string]any) (map[string]any, error) {
		// TODO: implement
		return nil, nil
	}
}
