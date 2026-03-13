// kagal is the reference agent for the Kagal fleet management
// platform, built on pkg/agent.
package main

import (
	"context"
	"log"
	"os"
	"os/signal"

	"kagal.dev/pkg/agent"
)

func main() {
	a := agent.New(agent.Config{
		ServerURL: "https://fleet.example.com/kagal",
		AgentID:   "agent-001",
		TLS:       nil, // TODO: loadTLS()
		StateDir:  "/var/lib/kagal",
		OnQuarantine: func(reason, code string) {
			log.Printf("quarantined: %s (claim: %s)", reason, code)
		},
	})

	a.RegisterTask("ssh_open",
		agent.SSHHandler("127.0.0.1:22"))

	a.SetStatusFunc(func() map[string]any {
		return map[string]any{
			"version": "0.0.0",
		}
	})

	ctx, stop := signal.NotifyContext(
		context.Background(), os.Interrupt,
	)
	defer stop()

	if err := a.Run(ctx); err != nil {
		log.Fatal(err)
	}
}
