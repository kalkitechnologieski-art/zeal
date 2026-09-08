export const ws = {
  to: (room: string) => ({
    emit: (event: string, data: any) => {
      console.log(`[WS Stub] Emitting to ${room}: ${event}`, data);
    },
  }),
  emit: (event: string, data: any) => {
    console.log(`[WS Stub] Emitting globally: ${event}`, data);
  },
};
