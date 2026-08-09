import { AccessToken } from 'livekit-server-sdk';

export function generateToken(
  roomName: string,
  participantName: string,
  canPublish = true,
  canSubscribe = true
): string {
  const apiKey = process.env.LIVEKIT_API_KEY!;
  const apiSecret = process.env.LIVEKIT_API_SECRET!;

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
    ttl: 3600, // 1 hour
  });
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish,
    canSubscribe,
  });
  return at.toJwt();
}
