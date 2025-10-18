import Sidebar from "../components/Sidebar";
import { type JSX } from "react";
import Home from "./Home";
import Search from "./Search";
import Activity from "./Activity";
import Profile from "./Profile";
import { useActive } from "../hooks/useActive";

type TabKey = "house" | "search" | "activity" | "profile";

export default function Dashboard() {
  const [activeTabRaw] = useActive();
  const activeTab = activeTabRaw as TabKey;

  const tabContent: Record<TabKey, JSX.Element> = {
    house: <Home />,
    search: <Search />,
    activity: <Activity />,
    profile: <Profile />,
  };

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

        {tabContent[activeTab]}
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
