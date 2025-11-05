import Sidebar from "../components/Sidebar";
import { type JSX } from "react";
import Home from "./Home";
import Search from "./Search";
import Activity from "./Activity";
import Profile from "./Profile";
import { useActive } from "../hooks/useActive";
import Messages from "./Messages";

type TabKey = "home" | "search" | "activity" | "profile" | "messages";

export default function Dashboard() {
  const activeTab = useActive((s) => s.activeTab) as TabKey;
  const isMessages = activeTab === "messages";

  const containerClass =
    "grid grid-cols-1 min-h-[100dvh] " +
    (isMessages
      ? "md:[grid-template-columns:80px_1fr]"
      : "md:[grid-template-columns:80px_1fr_220px]");

  const tabContent: Record<Exclude<TabKey, "messages">, JSX.Element> = {
    home: <Home />,
    search: <Search />,
    activity: <Activity />,
    profile: <Profile />,
  };

  return (
    <div className={containerClass}>
      <aside className={isMessages ? "hidden md:block" : "contents md:block"}>
        <Sidebar />
      </aside>

      {/* Middle */}
      <main className="col-span-1 flex flex-col h-[100dvh] overflow-hidden">
        {/* Header */}
        {!isMessages && (
          <div className="w-full p-4 flex-shrink-0 hidden md:flex">
            <div className="flex items-center justify-center w-full">
              <span className="font-semibold text-xl">
                {activeTab.charAt(0).toLocaleUpperCase() + activeTab.slice(1)}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        {isMessages ? (
          <Messages />
        ) : (
          tabContent[activeTab as Exclude<TabKey, "messages">]
        )}
      </main>
    </div>
  );
}
