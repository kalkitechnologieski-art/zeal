export const ws = {
  to: (room: string) => ({
    emit: (event: string, data: unknown) => {
      console.debug(`[WS Stub] Emitting to ${room}: ${event}`, data);
    },
  }),
  emit: (event: string, data: unknown) => {
    console.debug(`[WS Stub] Emitting globally: ${event}`, data);
  },
};
