import Sidebar from "../components/navigate/Sidebar";
import { type JSX } from "react";
import Home from "./Home";
import Search from "./Search";
import Activity from "./Activity";
import Profile from "./Profile";
import Messages from "./Messages";
import { useLocation, useParams } from "react-router-dom";
import { pathToTab, type TabKey } from "@/utils/tabPathMap";
import { MobileHeader } from "@/components/navigate/MobileHeader";
import { MobileBottomNav } from "@/components/navigate/MobileBottomNav";
import { useHashtag } from "@/hooks/useHashtag";

export default function Dashboard() {
  const { allHashtags } = useHashtag();
  const { pathname } = useLocation();
  const { handle } = useParams();
  const activeTab = pathToTab(pathname) as TabKey;
  const isMessages = activeTab === "messages";
  const hashtagNames = allHashtags.data || [];
  const headerTitle =
    activeTab === "profile"
      ? handle
        ? `${handle}`
        : "Profile"
      : activeTab.charAt(0).toUpperCase() + activeTab.slice(1);

  const tabContent: Record<Exclude<TabKey, "messages">, JSX.Element> = {
    home: <Home />,
    search: <Search />,
    activity: <Activity />,
    profile: <Profile />,
  };

  return (
    <div className="flex min-h-screen flex-col">
      <MobileHeader />

      <div
        className={`
          grid flex-1
          ${
            isMessages
              ? "grid-cols-1 md:grid-cols-[80px_1fr]"
              : "grid-cols-1 md:grid-cols-[80px_1fr_220px]"
          }
        `}
      >
        {/* Desktop Sidebar */}
        <aside className="hidden md:block">
          <Sidebar allHashtags={hashtagNames} />
        </aside>

        {/* Main */}
        <main className="col-span-1 flex flex-col h-[100dvh] overflow-hidden">
          {/* Desktop header */}
          {!isMessages && (
            <div className="hidden md:flex w-full p-4 flex-shrink-0 items-center justify-center">
              <span className="font-semibold text-xl">{headerTitle}</span>
            </div>
          )}

          {isMessages ? (
            <Messages />
          ) : (
            tabContent[activeTab as Exclude<TabKey, "messages">]
          )}
        </main>
      </div>

      <MobileBottomNav allHashtags={hashtagNames} />
    </div>
  );
}
