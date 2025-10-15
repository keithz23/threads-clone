import banner from "../assets/banner.webp";
import { ChevronRight } from "lucide-react";

export default function Login() {
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
        <h1 className="font-semibold text-lg">
          Log in with your Threads account
        </h1>

        <form action="">
          <div className="m-3">
            <input
              type="text"
              className="w-full px-3 py-4 border border-gray-100 rounded-xl bg-gray-100 focus:outline-gray-200"
              placeholder="Username, phone, email"
            />
          </div>
          <div className="m-3">
            <input
              type="password"
              className="w-full px-3 py-4 border border-gray-100 rounded-xl bg-gray-100 focus:outline-gray-200"
              placeholder="Password"
            />
          </div>
          <div className="m-3">
            <button className="w-full px-3 py-4 border border-black rounded-xl bg-black text-white cursor-pointer">
              Login
            </button>
          </div>

          <div className="m-3">
            <a href="#" className="text-gray-400">
              Forgot password?
            </a>
          </div>
        </form>

        {/* Divider */}
        <div className="m-3 flex items-center justify-center gap-4">
          <div className="border border-gray-400 w-8"></div>
          <div className="text-gray-400">or</div>
          <div className="border border-gray-400 w-8"></div>
        </div>

        {/* Login with Google */}
        <div className="m-3">
          <div className="w-full px-3 py-4 border border-gray-200 rounded-xl">
            <button className="flex items-center justify-between cursor-pointer w-full">
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="20 20"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                style={{ display: "block" }}
                className="w-12 h-12"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                ></path>
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                ></path>
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                ></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>

              {/* Text Continue with Google */}
              <div>
                <span className="text-lg text-gray-150">
                  Continue with Google
                </span>
              </div>

              {/* Chevron-right */}
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
