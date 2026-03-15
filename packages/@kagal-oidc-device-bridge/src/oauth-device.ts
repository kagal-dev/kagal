export class DeviceFlowService {
  constructor(
    private kv: KVNamespace,
    private config: {
      jwtSecret: string
      idpClientID: string
      idpClientSecret: string
      idpTokenEndpoint: string
      idpUserinfoEndpoint: string
      redirectURI: string
    },
  ) {}

  // 1. START: Generate codes and save "pending" state
  async initiate(clientID: string) {
    const deviceCode = crypto.randomUUID();
    const userCode = this.generateReadableCode();

    // Map user_code -> device_code for the lookup page
    await this.kv.put(`user_code:${userCode}`, deviceCode, { expirationTtl: 600 });

    // Create the session
    await this.kv.put(`session:${deviceCode}`, JSON.stringify({
      status: 'pending',
      client_id: clientID,
    }), { expirationTtl: 600 });

    return { device_code: deviceCode, user_code: userCode, expires_in: 600, interval: 5 };
  }

  // 2. EXCHANGE: The "Bridge" logic
  // Takes the IDP's code and updates the device session
  async finalizeWithIDP(deviceCode: string, idpAuthCode: string) {
    // Exchange Auth Code for Access Token from Google/Okta
    const tokenResponse = await fetch(this.config.idpTokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: idpAuthCode,
        client_id: this.config.idpClientID,
        client_secret: this.config.idpClientSecret,
        redirect_uri: this.config.redirectURI,
      }),
    });

    const tokens = await tokenResponse.json() as Record<string, unknown>;
    if (!tokenResponse.ok) throw new Error('IDP_EXCHANGE_FAILED');

    // Get User Profile (optional, but good for 'sub' claim)
    const userResponse = await fetch(this.config.idpUserinfoEndpoint, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const user = await userResponse.json() as Record<string, unknown>;

    // Update KV to 'approved'
    const sessionString = await this.kv.get(`session:${deviceCode}`);
    if (!sessionString) throw new Error('SESSION_EXPIRED');

    const session = JSON.parse(sessionString);
    session.status = 'approved';
    session.user_id = user.id || user.sub; // Map IDP ID to our internal session

    await this.kv.put(`session:${deviceCode}`, JSON.stringify(session), { expirationTtl: 300 });
  }

  // 3. POLL: Check status and return your internal JWT
  async poll(deviceCode: string) {
    const sessionString = await this.kv.get(`session:${deviceCode}`);
    if (!sessionString) return { error: 'expired_token' };

    const session = JSON.parse(sessionString);
    if (session.status === 'pending') return { error: 'authorization_pending' };

    // Use a lightweight JWT library here (like 'hono/jwt' or 'jose')
    // and sign using this.config.jwtSecret
    return {
      access_token: 'YOUR_SIGNED_JWT', // sign({ sub: session.user_id })
      token_type: 'Bearer',
    };
  }

  private generateReadableCode() {
    return Math.random().toString(36).slice(2, 6).toUpperCase() + '-' +
      Math.random().toString(36).slice(2, 6).toUpperCase();
  }
}
