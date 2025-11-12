import { makeTabs } from "@/constants/tabs/sidebarTab";
import useNotificationsFromProvider from "@/hooks/useNotifications";
import { useLocation, useNavigate } from "react-router-dom";
import { pathToTab, tabToPath, type TabKey } from "@/utils/tabPathMap";
import ThreadsPostDialog from "./ThreadsPostDialog";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export function MobileBottomNav() {
  const { user } = useAuth();
  const { notifications } = useNotificationsFromProvider();
  const [showPostDialog, setShowPostDialog] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeTab = pathToTab(pathname);
  const tabs = makeTabs(notifications);
  const handle = user?.data?.username;

  const onPlus = () => {
    setShowPostDialog(true);
  };

  const go = (tab: TabKey) => navigate(tabToPath(tab, handle));

  return (
    <>
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur z-40">
        <ul className="flex items-center justify-around py-2">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                aria-label={String(tab.name)}
                onClick={() =>
                  tab.name === "plus" ? onPlus() : go(tab.name as TabKey)
                }
                className={`p-3 rounded-xl transition
                  ${
                    tab.name === "plus"
                      ? "bg-gray-200 text-gray-500 active:scale-95"
                      : activeTab === tab.name
                      ? "bg-gray-100 text-black"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                aria-current={activeTab === tab.name ? "page" : undefined}
              >
                {tab.icon}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <ThreadsPostDialog
        showPostDialog={showPostDialog}
        setShowPostDialog={setShowPostDialog}
      />
    </>
  );
}
