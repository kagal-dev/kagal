// kagal-ssh-proxy is an SSH ProxyCommand helper for connecting
// to agents via the Kagal control plane.
//
// Self-contained Go binary — no external dependencies
// (websocat, curl, jq, etc.). Handles HTTP, WebSocket,
// and TLS natively via Go's standard library.
//
// Flow:
//  1. Strips the kagal- prefix from the hostname to derive
//     the agent ID
//  2. Posts an ssh_open task to the Worker API (mTLS with
//     the operator cert)
//  3. Polls the task status until the agent connects
//  4. Opens a WebSocket to /agents/:id/tunnel?role=operator
//     (mTLS)
//  5. Splices stdin/stdout <-> WebSocket binary frames
//
// Usage:
//
//	# One-time setup
//	kagal-ssh-proxy --init \
//	    --server https://fleet.example.com/kagal \
//	    --cert ~/.kagal/operator.crt \
//	    --key ~/.kagal/operator.key
//
//	# Then: ssh kagal-<agent-id>
//	ssh kagal-agent-001
//
// SSH config:
//
//	Host kagal-*
//	    ProxyCommand kagal-ssh-proxy %h
//	    User root
package main

func main() {
	// TODO: implement
}
