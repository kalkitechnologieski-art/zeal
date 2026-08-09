// Lazy‑load LiveKit SDK to avoid build‑time errors if env vars are missing
let AccessToken: any = null;

async function getAccessToken() {
  if (!AccessToken) {
    const module = await import('livekit-server-sdk');
    AccessToken = module.AccessToken;
  }
  return AccessToken;
}

function getEnvVars() {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_WS_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    throw new Error(
      'LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_WS_URL must be set in environment'
    );
  }
  return { apiKey, apiSecret, wsUrl };
}

export async function generateMeetingLink(bookingId: string): Promise<string> {
  const { wsUrl } = getEnvVars();
  const roomName = `booking-${bookingId}`;
  return `${wsUrl}/rooms/${roomName}`;
}

export async function generateToken(roomName: string, participantIdentity: string): Promise<string> {
  const { apiKey, apiSecret } = getEnvVars();
  const AccessTokenClass = await getAccessToken();

  const at = new AccessTokenClass(apiKey, apiSecret, {
    identity: participantIdentity,
    ttl: 3600,
  });
  at.addGrant({ roomJoin: true, room: roomName });
  return at.toJwt();
}
