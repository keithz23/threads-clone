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
          return {
            ...old,
            data: { ...(old.data ?? {}), ...updatedProfile },
          };
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
    if (!me?.id || !profileId) return;

    let socket = socketRef.current;
    if (!socket) {
      socket = socketService.initRealtimeSocket(me.id, token, { profileId });
      socketRef.current = socket;

      // Log & basic lifecycle
      const onConnect = () => {
        if (joinedRef.current !== profileId) {
          socket.emit("profile.join", { id: profileId });
          joinedRef.current = profileId;
        }
      };
      const onDisconnect = () => {};
      const onConnectError = (err: any) => {
        console.error("Realtime connect_error:", err?.message || err);
      };

      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
      socket.on("connect_error", onConnectError);

      socket.on("profile.updated", handleProfileUpdate);

      return () => {
        socket.off("profile.updated", handleProfileUpdate);
        socket.off("connect");
        socket.off("disconnect");
        socket.off("connect_error");
        socketRef.current = null;
        joinedRef.current = null;
      };
    } else {
      if (joinedRef.current !== profileId) {
        socket.emit("profile.join", { id: profileId });
        joinedRef.current = profileId;
      }

      socket.off("profile.updated", handleProfileUpdate);
      socket.on("profile.updated", handleProfileUpdate);

      return () => {
        socket.off("profile.updated", handleProfileUpdate);
      };
    }
  }, [me?.id, profileId, token, handleProfileUpdate]);
}
