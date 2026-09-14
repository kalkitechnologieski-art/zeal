"use client";

import {
  Room,
  RoomEvent,
  Track,
  ConnectionState,
  type TrackPublication,
  type RemoteTrackPublication,
  type LocalTrackPublication,
  type RemoteParticipant,
  type Participant,
} from "livekit-client";

// ─── Public types ─────────────────────────────────────────────────────────

export interface CallParticipant {
  identity: string;
  name: string;
  isLocal: boolean;
  isSpeaking: boolean;
  audioTrack: Track | null;
  videoTrack: Track | null;
  audioEnabled: boolean;
  videoEnabled: boolean;
}

export interface ConnectOptions {
  wsUrl: string;
  token: string;
  audio?: boolean;
  video?: boolean;
}

export type CallState =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "failed";

// ─── Room factory ─────────────────────────────────────────────────────────

export function createCallRoom(): Room {
  return new Room({
    adaptiveStream: true,
    dynacast: true,
    disconnectOnPageLeave: true,
    videoCaptureDefaults: {
      resolution: { width: 1280, height: 720, frameRate: 30 },
    },
  });
}

// ─── Connect ──────────────────────────────────────────────────────────────

export async function connectCallRoom(
  room: Room,
  options: ConnectOptions,
): Promise<void> {
  await room.connect(options.wsUrl, options.token, { autoSubscribe: true });

  if (options.audio !== false) {
    try {
      await room.localParticipant.setMicrophoneEnabled(true);
    } catch {
      /* permission denied — session continues without mic */
    }
  }

  if (options.video === true) {
    try {
      await room.localParticipant.setCameraEnabled(true);
    } catch {
      /* permission denied — session continues without camera */
    }
  }
}

// ─── Participant snapshot ─────────────────────────────────────────────────

function publicationTrack(pub: TrackPublication | undefined): Track | null {
  return pub?.track ?? null;
}

function buildParticipant(p: Participant, isLocal: boolean): CallParticipant {
  const audioPub: TrackPublication | undefined =
    Array.from(p.audioTrackPublications.values())[0];
  const videoPub: TrackPublication | undefined =
    Array.from(p.videoTrackPublications.values())[0];

  return {
    identity: p.identity,
    name: p.name || p.identity,
    isLocal,
    isSpeaking: p.isSpeaking,
    audioTrack: publicationTrack(audioPub),
    videoTrack: publicationTrack(videoPub),
    audioEnabled: audioPub ? !audioPub.isMuted : false,
    videoEnabled: videoPub ? !videoPub.isMuted : false,
  };
}

export function snapshotParticipants(room: Room): CallParticipant[] {
  const list: CallParticipant[] = [buildParticipant(room.localParticipant, true)];
  room.remoteParticipants.forEach((p: RemoteParticipant) => {
    list.push(buildParticipant(p, false));
  });
  return list;
}

// ─── Event subscription ───────────────────────────────────────────────────

export interface RoomSubscribers {
  onParticipants: (cb: (list: CallParticipant[]) => void) => () => void;
  onState: (cb: (state: CallState) => void) => () => void;
}

function stateFromConnection(s: ConnectionState): CallState {
  switch (s) {
    case ConnectionState.Connected:    return "connected";
    case ConnectionState.Connecting:   return "connecting";
    case ConnectionState.Reconnecting: return "reconnecting";
    case ConnectionState.Disconnected: return "disconnected";
    default:                           return "idle";
  }
}

// LiveKit's `Room.on` is a generic overloaded method — passing a runtime
// event name makes TS resolve the handler parameter to `never`. The cast
// below bridges that limitation. The callback ignores all event arguments
// and reads state directly from the room, so the type is irrelevant at
// runtime. This is the only place in the file where a cast is used.
type LooseOn = (event: RoomEvent, cb: () => void) => void;

export function subscribeToRoom(room: Room): RoomSubscribers {
  const participantListeners = new Set<(list: CallParticipant[]) => void>();
  const stateListeners = new Set<(s: CallState) => void>();

  const emitParticipants = () => {
    const snap = snapshotParticipants(room);
    for (const cb of participantListeners) {
      try {
        cb(snap);
      } catch (e) {
        console.warn("[LiveKit] participant cb error", e);
      }
    }
  };

  const emitState = (s: CallState) => {
    for (const cb of stateListeners) {
      try {
        cb(s);
      } catch (e) {
        console.warn("[LiveKit] state cb error", e);
      }
    }
  };

  const on: LooseOn = room.on.bind(room) as unknown as LooseOn;

  const participantEvents: RoomEvent[] = [
    RoomEvent.ParticipantConnected,
    RoomEvent.ParticipantDisconnected,
    RoomEvent.TrackSubscribed,
    RoomEvent.TrackUnsubscribed,
    RoomEvent.TrackMuted,
    RoomEvent.TrackUnmuted,
    RoomEvent.LocalTrackPublished,
    RoomEvent.LocalTrackUnpublished,
    RoomEvent.ActiveSpeakersChanged,
  ];
  for (const ev of participantEvents) {
    on(ev, emitParticipants);
  }

  room.on(RoomEvent.ConnectionStateChanged, (s: ConnectionState) => {
    emitState(stateFromConnection(s));
  });
  room.on(RoomEvent.Disconnected, () => emitState("disconnected"));
  room.on(RoomEvent.Reconnecting, () => emitState("reconnecting"));
  room.on(RoomEvent.Reconnected, () => emitState("connected"));

  return {
    onParticipants: (cb) => {
      participantListeners.add(cb);
      cb(snapshotParticipants(room));
      return () => {
        participantListeners.delete(cb);
      };
    },
    onState: (cb) => {
      stateListeners.add(cb);
      cb(stateFromConnection(room.state));
      return () => {
        stateListeners.delete(cb);
      };
    },
  };
}

// ─── Track attachment ─────────────────────────────────────────────────────

export function attachTrack(track: Track, container: HTMLElement): HTMLMediaElement {
  const element = track.attach();
  element.style.width = "100%";
  element.style.height = "100%";
  element.style.objectFit = "cover";
  element.style.borderRadius = "0.75rem";
  container.appendChild(element);
  return element;
}

export function detachTrack(track: Track, element: HTMLMediaElement): void {
  try {
    track.detach(element);
  } catch {
    /* already detached */
  }
  try {
    element.remove();
  } catch {
    /* already removed */
  }
}

// Silence unused-import warnings for the subtype types — they document the
// relationship between the base class and the derived ones.
export type { TrackPublication, LocalTrackPublication, RemoteTrackPublication };

