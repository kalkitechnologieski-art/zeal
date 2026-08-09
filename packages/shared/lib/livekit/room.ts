import { AccessToken } from 'livekit-server-sdk';
import { AppError } from '../errors';

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const wsUrl = process.env.LIVEKIT_WS_URL;

if (!apiKey || !apiSecret || !wsUrl) {
  throw new Error('LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_WS_URL must be set');
}

export async function generateMeetingLink(bookingId: string): Promise<string> {
  const roomName = `booking-${bookingId}`;
  return `${wsUrl}/rooms/${roomName}`;
}

export async function generateToken(roomName: string, participantIdentity: string): Promise<string> {
  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantIdentity,
    ttl: 3600,
  });
  at.addGrant({ roomJoin: true, room: roomName });
  return at.toJwt();
}
