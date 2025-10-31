import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import banner from "../assets/banner.webp";
import { useAuth } from "../hooks/useAuth";
import type { ResetPasswordDto } from "../interfaces/auth/reset-password.interface";
import { useMemo } from "react";

type FormValues = { newPassword: string; confirmPassword: string };

export default function ResetPassword() {
  const { reset } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";
  const redirect = searchParams.get("redirect") || "/";

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { newPassword: "", confirmPassword: "" },
    mode: "onSubmit",
  });

  const newPassword = watch("newPassword");
  const submitting = isSubmitting || reset.isPending;

  const tokenMissing = useMemo(() => token.length === 0, [token]);

  const onSubmit = async (data: FormValues) => {
    if (data.newPassword !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "validate",
        message: "Passwords do not match",
      });
      return;
    }
    try {
      const payload: ResetPasswordDto = {
        token,
        newPassword: data.newPassword,
      };
      await reset.mutateAsync({ resetPasswordDto: payload });
      navigate("/login?reset=1", {
        replace: true,
        state: { from: location, redirect },
      });
    } catch (e: any) {
      const raw =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Reset password failed. Please try again.";
      const msg = Array.isArray(raw) ? raw.join(", ") : String(raw);
      // setError("newPassword", { type: "server", message: msg });
      console.error(msg);
    }
  };

  return (
    <div className="w-full">
      {/* Top decorative banner */}
      <div className="relative h-40 sm:h-52 md:h-64 lg:h-72 bg-white overflow-hidden">
        <img
          src={banner}
          alt="banner"
          className="pointer-events-none select-none absolute top-[-20%] w-[160vw] md:w-[130vw] lg:w-[100vw] object-cover"
        />
      </div>

      <div className="mx-auto max-w-md px-4">
        <h1 className="font-semibold text-lg text-center">
          Reset your Threads account password
        </h1>

        {tokenMissing && (
          <div className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            Reset link is invalid or missing a token. Please use the link from
            your email.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-2">
          {/* New Password */}
          <div className="m-3">
            <div className="relative">
              <input
                type="password"
                className={`w-full px-3 py-4 border rounded-xl bg-gray-100 focus:outline-gray-200 ${
                  errors.newPassword ? "border-red-400" : "border-gray-100"
                }`}
                placeholder="New password"
                {...register("newPassword", {
                  required: "New password is required",
                  minLength: { value: 8, message: "At least 8 characters" },
                })}
                autoComplete="new-password"
                aria-invalid={!!errors.newPassword}
              />
            </div>
            <div className="mt-1">
              {errors.newPassword && (
                <p className="text-sm text-red-500">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="m-3">
            <input
              type="password"
              className={`w-full px-3 py-4 border rounded-xl bg-gray-100 focus:outline-gray-200 ${
                errors.confirmPassword ? "border-red-400" : "border-gray-100"
              }`}
              placeholder="Confirm new password"
              {...register("confirmPassword", {
                required: "Confirm password is required",
                validate: (v) => v === newPassword || "Passwords do not match",
                minLength: { value: 8, message: "At least 8 characters" },
              })}
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
            />
            <div className="mt-1">
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="m-3">
            <button
              type="submit"
              disabled={submitting || tokenMissing}
              className="w-full px-3 py-4 border border-black rounded-xl bg-black text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
