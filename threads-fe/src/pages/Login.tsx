import { useForm } from "react-hook-form";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import banner from "../assets/banner.webp";
import { ChevronRight } from "lucide-react";
import type { LoginDto } from "../interfaces/auth/login.interface";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const redirect = searchParams.get("redirect") || "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginDto>({
    defaultValues: { identifier: "", password: "" },
    mode: "onSubmit",
  });

  const onSubmit = async (data: LoginDto) => {
    try {
      await login.mutateAsync({ loginDto: data });
      navigate(redirect, { replace: true });
    } catch (e: any) {
      const raw =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Login failed. Please try again.";
      const msg = Array.isArray(raw) ? raw.join(", ") : String(raw);
      console.error(msg);
    }
  };

  const loginWithGoogle = () => {
    const base = import.meta.env.VITE_CALLBACK_URL || "";
    window.location.href = `${base}?redirect=${encodeURIComponent(redirect)}`;
  };

  const toPath = location.pathname + location.search + location.hash;

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
          Log in with your Threads account
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Identifier */}
          <div className="m-3">
            <input
              type="text"
              className={`w-full px-3 py-4 border rounded-xl bg-gray-100 focus:outline-gray-200 ${
                errors.identifier ? "border-red-400" : "border-gray-100"
              }`}
              placeholder="Username or email"
              {...register("identifier", {
                required: "Username or email is required",
                minLength: { value: 3, message: "At least 3 characters" },
              })}
              autoComplete="username"
              aria-invalid={!!errors.identifier}
            />
            {errors.identifier && (
              <p className="mt-1 text-sm text-red-500">
                {errors.identifier.message}
              </p>
            )}
          </div>

          {/* Password + Forgot */}
          <div className="m-3">
            <input
              type="password"
              className={`w-full px-3 py-4 border rounded-xl bg-gray-100 focus:outline-gray-200 ${
                errors.password ? "border-red-400" : "border-gray-100"
              }`}
              placeholder="Password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "At least 6 characters" },
              })}
              autoComplete="current-password"
              aria-invalid={!!errors.password}
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.password ? (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              ) : (
                <span />
              )}
              <Link
                tabIndex={-1}
                to={`/forgot?redirect=${encodeURIComponent(toPath)}`}
                className="text-sm text-gray-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30 rounded px-1"
                aria-label="Forgot your password? Reset it"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Submit */}
          <div className="m-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-3 py-4 border border-black rounded-xl bg-black text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing in..." : "Login"}
            </button>
          </div>

          <div className="m-3">
            <div className="flex items-center justify-between text-sm">
              <Link
                to={`/register?redirect=${encodeURIComponent(redirect)}`}
                className="text-gray-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30 rounded"
              >
                Don’t have an account?{" "}
                <span className="font-medium">Sign up</span>
              </Link>
            </div>
          </div>
        </form>

        {/* Divider */}
        <div className="m-3 flex items-center justify-center gap-4">
          <div className="border border-gray-400 w-8" />
          <div className="text-gray-400">or</div>
          <div className="border border-gray-400 w-8" />
        </div>

        {/* Login with Google */}
        <div className="m-3">
          <div className="w-full px-3 py-4 border border-gray-200 rounded-xl active:scale-95">
            <button
              type="button"
              onClick={loginWithGoogle}
              className="flex items-center justify-between cursor-pointer w-full"
            >
              {/* Google logo */}
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="w-12 h-12"
                aria-hidden
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>

              <div>
                <span className="text-lg text-gray-700">
                  Continue with Google
                </span>
              </div>

              <div>
                <ChevronRight className="text-gray-400" size={25} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
