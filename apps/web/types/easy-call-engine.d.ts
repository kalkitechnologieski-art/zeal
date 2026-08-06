declare module '@puspendra/easy-call-engine' {
  export interface EasyCallOptions {
    signalingServer?: string;
    token?: string;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Error) => void;
  }

  export class EasyCall {
    constructor(options: EasyCallOptions);
    startCall(consultantId: string): Promise<void>;
    endCall(): Promise<void>;
    mute(): void;
    unmute(): void;
    isMuted(): boolean;
  }
}
