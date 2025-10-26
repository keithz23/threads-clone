import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AuthService } from "../services/auth/auth.service";
import type { LoginDto } from "../interfaces/auth/login.interface";
import type { RegisterDto } from "../interfaces/auth/register.interface";

function extractErrMsg(err: unknown): string {
  const anyErr = err as any;
  const raw =
    anyErr?.response?.data?.message ||
    anyErr?.message ||
    "Something went wrong.";
  return Array.isArray(raw) ? raw.join(", ") : String(raw);
}

export function useAuth() {
  const qc = useQueryClient();

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const { data } = await AuthService.me();
        return data;
      } catch (e: any) {
        if (e?.response?.status === 401) {
          return null;
        }
        throw e;
      }
    },
    retry: false,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
  });

  const login = useMutation({
    mutationFn: async ({ loginDto }: { loginDto: LoginDto }) => {
      return AuthService.login(loginDto);
    },
    onSuccess: async () => {
      toast.dismiss();
      await qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Logged in successfully.");
    },
    onError: (err) => {
      toast.dismiss();
      toast.error(extractErrMsg(err));
    },
  });

  const signup = useMutation({
    mutationFn: async ({ registerDto }: { registerDto: RegisterDto }) => {
      return AuthService.register(registerDto);
    },
    onSuccess: async () => {
      toast.dismiss();
      await qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Account created. You can sign in now.");
    },
    onError: (err) => {
      toast.dismiss();
      toast.error(extractErrMsg(err));
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      return AuthService.logout();
    },
    onSuccess: () => {
      toast.dismiss();
      qc.setQueryData(["me"], null);
      toast.success("Logged out.");
    },
    onError: (err) => {
      toast.dismiss();
      toast.error(extractErrMsg(err));
    },
  });

  return {
    user: meQuery.data,
    isLoading: meQuery.isLoading,
    isAuthenticated: !!meQuery.data,
    refetchMe: meQuery.refetch,
    error: meQuery.error,
    login,
    signup,
    logout,
  };
}
