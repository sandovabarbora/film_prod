// src/hooks/useRealtime.ts
// TODO: Implement WebSocket connection

export const useRealtime = () => {
  return {
    isConnected: false,
    connect: () => console.log('WebSocket connect'),
    disconnect: () => console.log('WebSocket disconnect'),
    sendMessage: (message: string) => console.log('Send:', message),
  };
};
