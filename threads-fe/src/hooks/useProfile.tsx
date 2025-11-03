import { useEffect, useRef, useCallback, startTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import socketService from "@/services/socket/socket.service";

export function useProfileRealtime(
  me?: { id?: string },
  profileId?: string,
  token?: string
) {
  const qc = useQueryClient();
  const socketRef = useRef<any>(null);
  const joinedRef = useRef<string | null>(null);

  const handleProfileUpdate = useCallback(
    ({ profile: updatedProfile }: any) => {
      if (!updatedProfile?.id) return;
      startTransition(() => {
        qc.setQueryData(["me"], (old: any) => {
          if (!old?.data?.id || old.data.id !== updatedProfile.id) return old;
          return { ...old, data: { ...(old.data ?? {}), ...updatedProfile } };
        });
        if (profileId && profileId === updatedProfile.id) {
          qc.setQueryData(["profile", profileId], (old: any) => ({
            ...(old ?? {}),
            ...updatedProfile,
          }));
        }
      });
    },
    [profileId, qc]
  );

  useEffect(() => {
    if (!me?.id) return;

    const existingSocket = socketService.getRealtimeSocket();
    if (existingSocket?.connected) {
      socketRef.current = existingSocket;
      return;
    }

    if (!socketRef.current) {
      const s = socketService.initRealtimeSocket(me.id, token, {
        profileId: profileId || "",
      });
      socketRef.current = s;

      s.on("connect", () => {});
      s.on("disconnect", () => {});
      s.on("connect_error", (err: any) =>
        console.error("Realtime connect_error:", err?.message || err)
      );
      s.on("profile.updated", handleProfileUpdate);
    }

    return () => {
      const s = socketRef.current;
      if (!s) return;
      s.off("profile.updated", handleProfileUpdate);
      s.off("connect");
      s.off("disconnect");
      s.off("connect_error");

      socketRef.current = null;
      joinedRef.current = null;
    };
  }, [me?.id, token]);

  useEffect(() => {
    const s = socketRef.current;
    if (!s || !profileId) return;
    if (joinedRef.current !== profileId) {
      s.emit("profile.join", { id: profileId });
      joinedRef.current = profileId;
    }
  }, [profileId]);
}
