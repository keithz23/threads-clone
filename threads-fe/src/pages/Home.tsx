import Sidebar from "../components/Sidebar";
import icon from "../../public/logo.ico";
import { Heart, MessageCircle, Repeat, Send } from "lucide-react";

export default function Home() {
  return (
    <div className="grid grid-cols-1 md:[grid-template-columns:80px_1fr_220px] min-h-screen">
      {/* Left */}
      <aside className="contents md:block">
        <Sidebar />
      </aside>

      {/* Middle */}
      <main className="col-span-1 flex flex-col h-screen md:h-screen overflow-hidden">
        <div className="w-full p-4 flex-shrink-0 hidden md:flex">
          <div className="flex items-center justify-center w-full">
            <span className="font-semibold text-xl">Home</span>
          </div>
        </div>

        <div
          className="
            w-full md:w-1/3 flex-1 md:border border-gray-300
            rounded-none md:rounded-3xl mx-auto
            h-full overflow-y-auto custom-scroll
          "
        >
          {Array.from({ length: 12 }).map((_, idx) => (
            <div
              key={idx}
              className="flex p-5 gap-x-3 border-b border-gray-200 w-full"
            >
              <div>
                <img src={icon} className="rounded-full w-10 h-10" alt="" />
              </div>
              <div className="flex-1">
                <ul className="space-y-3">
                  <li className="font-medium">lichngaytot</li>
                  <li>
                    Số phận định sẵn: 4 con giáp mang mệnh PHÚ BÀ, đệ nhất kiếm
                  </li>
                  <li>
                    <div className="flex gap-x-5">
                      <Heart size={18} />
                      <MessageCircle size={18} />
                      <Repeat size={18} />
                      <Send size={18} />
                    </div>
                  </li>
                </ul>
              </div>
              <div>...</div>
            </div>
          ))}
        </div>
      </main>

      {/* Right */}
      <div className="hidden md:flex justify-end items-start p-4">
        <button className="py-2 px-4 border rounded-xl bg-black text-white">
          Login
        </button>
      </div>
    </div>
  );
}
