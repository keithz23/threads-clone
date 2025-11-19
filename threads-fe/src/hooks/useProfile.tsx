import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocketContext } from "@/contexts/SocketContext";

export function useProfileRealtime(me?: { id?: string }, profileId?: string) {
  const qc = useQueryClient();
  const { realtimeSocket, isConnected } = useSocketContext();

  const handleProfileUpdate = useCallback(
    async ({ profile: updatedProfile }: any) => {
      if (!updatedProfile?.id) return;

      await qc.invalidateQueries({
        queryKey: ["profile"],
        refetchType: "active",
      });

      if (me?.id === updatedProfile.id) {
        await qc.invalidateQueries({ queryKey: ["me"] });
      }
    },
    [profileId, me?.id, qc]
  );

  useEffect(() => {
    if (!realtimeSocket || !me?.id) {
      return;
    }

    realtimeSocket.on("profile:updated", handleProfileUpdate);

    return () => {
      realtimeSocket.off("profile:updated", handleProfileUpdate);
    };
  }, [realtimeSocket, me?.id, handleProfileUpdate]);

  return {
    isConnected,
  };
}
