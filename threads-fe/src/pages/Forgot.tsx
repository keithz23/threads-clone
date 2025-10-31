import { useForm } from "react-hook-form";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import banner from "../assets/banner.webp";
import { useAuth } from "../hooks/useAuth";
import type { ForgotPasswordDto } from "../interfaces/auth/forgot-password.interface";

type FormValues = { email: string };

export default function Forgot() {
  const { forgot } = useAuth(); // <-- dùng forgot thay vì login
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const redirect = searchParams.get("redirect") || "/";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { email: "" },
    mode: "onSubmit",
  });

  const submitting = isSubmitting || forgot?.isPending;

  const onSubmit = async (data: ForgotPasswordDto) => {
    try {
      await forgot.mutateAsync({ forgotPasswordDto: data });
      navigate(`/login?email_sent=1&redirect=${encodeURIComponent(redirect)}`, {
        replace: true,
        state: { from: location },
      });
    } catch (e: any) {
      const raw =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Failed to send the reset email. Please try again.";
      const msg = Array.isArray(raw) ? raw.join(", ") : String(raw);
      setError("email", { type: "server", message: msg });
      console.error(msg);
    }
  };

  return (
    <div className="w-full">
      {/* Top decorative banner like Threads */}
      <div className="relative h-40 sm:h-52 md:h-64 lg:h-72 bg-white">
        <img
          src={banner}
          alt="banner"
          className="
            pointer-events-none select-none
            absolute
            top-[-20%]
            w-[160vw] md:w-[130vw] lg:w-[100vw]
            object-cover
          "
        />
      </div>

      <div className="mx-auto max-w-md px-4">
        <h1 className="font-semibold text-lg text-center">
          Forgot your password?
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter the email associated with your account. We’ll send you a link to
          reset your password.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Email */}
          <div className="m-3">
            <input
              type="email"
              className={`w-full px-3 py-4 border rounded-xl bg-gray-100 focus:outline-gray-200 ${
                errors.email ? "border-red-400" : "border-gray-100"
              }`}
              placeholder="Email address"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email",
                },
              })}
              autoComplete="email"
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="m-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-3 py-4 border border-black rounded-xl bg-black text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Sending..." : "Send reset link"}
            </button>
          </div>

          {/* Back to login / Sign up */}
          <div className="m-3 flex items-center justify-between text-sm">
            <Link
              to={`/login?redirect=${encodeURIComponent(redirect)}`}
              className="text-gray-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30 rounded px-1"
            >
              Back to login
            </Link>
            <Link
              to={`/register?redirect=${encodeURIComponent(redirect)}`}
              className="text-gray-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30 rounded px-1"
            >
              Don’t have an account?{" "}
              <span className="font-medium">Sign up</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
