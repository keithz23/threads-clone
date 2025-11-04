import {
  House,
  Search,
  Plus,
  Heart,
  User,
  TextAlignStart,
  ChevronRight,
  Send,
} from "lucide-react";
import { useActive } from "../hooks/useActive";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Separator } from "./ui/separator";
import { useAuth } from "@/hooks/useAuth";

export default function Sidebar() {
  const activeTab = useActive((s) => s.activeTab);
  const setActiveTab = useActive((s) => s.setActiveTab);
  const { logout } = useAuth();

  const tabs = [
    { id: 1, name: "home", icon: <House size={24} /> },
    { id: 2, name: "search", icon: <Search size={24} /> },
    { id: 3, name: "plus", icon: <Plus size={24} /> },
    { id: 4, name: "activity", icon: <Heart size={24} /> },
    { id: 5, name: "profile", icon: <User size={24} /> },
  ];

  const handleLogout = async () => {
    await logout.mutateAsync();
  };

  const moreContent = [
    {
      appearance: [
        {
          id: 1,
          name: "appearance",
          displayName: "Appearance",
          chevron: <ChevronRight />,
        },
        { id: 2, name: "insight", displayName: "Insight" },
        { id: 3, name: "settings", displayName: "Settings" },
      ],
      feed: [
        {
          id: 1,
          name: "feeds",
          displayName: "Feeds",
          chevron: <ChevronRight />,
        },
        { id: 2, name: "saved", displayName: "Saved" },
        { id: 3, name: "liked", displayName: "Liked" },
      ],
      function: [
        { id: 1, name: "reportAProblem", displayName: "Report a problem" },
        { id: 2, name: "logout", displayName: "Logout" },
      ],
    },
  ];

  return (
    <>
      <aside className="hidden md:flex w-20 h-screen fixed left-0 top-0 shadow-md">
        <div className="flex flex-col items-center justify-between gap-10 h-full p-4">
          {/* Logo */}
          <div aria-label="Threads logo">
            <svg
              aria-label="Threads"
              fill="currentColor"
              viewBox="0 0 192 192"
              className="h-9 w-9 text-black"
              role="img"
            >
              <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
            </svg>
          </div>

          {/* Buttons */}
          <div>
            <ul className="space-y-2">
              {tabs.map((tab) => (
                <li
                  key={tab.id}
                  onClick={() => setActiveTab(tab.name)}
                  className={`rounded-xl p-3 cursor-pointer transition-all
                    ${
                      tab.name === "plus"
                        ? "bg-gray-200 text-gray-400 hover:text-black"
                        : activeTab === tab.name
                        ? "bg-gray-100 text-black"
                        : "text-gray-400 hover:bg-gray-100"
                    }`}
                  aria-label={tab.name}
                >
                  {tab.icon}
                </li>
              ))}
            </ul>
          </div>

          {/* Pin & more */}
          <div>
            <ul className="space-y-5">
              <li
                className={`rounded-xl p-3 cursor-pointer transition-all
                    ${
                      activeTab === "messages"
                        ? "bg-gray-100 text-black"
                        : "text-gray-400 hover:bg-gray-100"
                    }`}
                onClick={() => setActiveTab("messages")}
              >
                <Send size={24} />
              </li>
              <li className="rounded-xl p-3 cursor-pointer transition-all text-gray-400 hover:text-black hover:bg-gray-100">
                <Popover>
                  <PopoverTrigger asChild>
                    <TextAlignStart size={24} />
                  </PopoverTrigger>

                  <PopoverContent
                    className="w-56 p-1"
                    side="bottom"
                    align="start"
                    sideOffset={8}
                  >
                    <div role="menu" aria-label="More options" className="py-1">
                      {/* Appearance group */}
                      <div className="px-1 py-1">
                        {moreContent[0].appearance.map((item) => (
                          <button
                            key={item.id}
                            role="menuitem"
                            className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                            onClick={() => {}}
                          >
                            <span className="truncate">{item.displayName}</span>
                            {item.chevron ? (
                              <span className="shrink-0">{item.chevron}</span>
                            ) : null}
                          </button>
                        ))}
                      </div>

                      <Separator className="my-1" />

                      {/* Feed group */}
                      <div className="px-1 py-1">
                        {moreContent[0].feed.map((item) => (
                          <button
                            key={item.id}
                            role="menuitem"
                            className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                            onClick={() => {}}
                          >
                            <span className="truncate">{item.displayName}</span>
                            {item.chevron ? (
                              <span className="shrink-0">{item.chevron}</span>
                            ) : null}
                          </button>
                        ))}
                      </div>

                      <Separator className="my-1" />

                      {/* Function group */}
                      <div className="px-1 py-1">
                        {moreContent[0].function.map((item) => {
                          const isLogout = item.name === "logout";
                          return (
                            <button
                              key={item.id}
                              role="menuitem"
                              className={
                                "w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-sm hover:bg-gray-100 cursor-pointer " +
                                (isLogout ? "text-red-600 hover:bg-red-50" : "")
                              }
                              onClick={handleLogout}
                            >
                              <span className="truncate">
                                {item.displayName}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </li>
            </ul>
          </div>
        </div>
      </aside>
      {/* Mobile: Top header (logo) */}
      <header className="md:hidden fixed top-0 inset-x-0 h-20 z-50">
        <div
          className="
      absolute inset-0
      bg-white/10
      backdrop-blur-2xl
      [--fallback-bg:theme(colors.white/30)]
      supports-[backdrop-filter]:bg-white/20
    "
        />
        <div
          className="
      pointer-events-none absolute inset-0
      bg-gradient-to-r from-white/70 via-transparent to-white/70
    "
        />
        <div className="relative h-full flex items-center justify-center px-4 pt-[env(safe-area-inset-top)]">
          <div className="h-7 w-7 text-black" aria-label="Threads logo">
            <svg
              fill="currentColor"
              viewBox="0 0 192 192"
              className="h-8 w-8"
              role="img"
            >
              <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
            </svg>
          </div>
          <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2">
            <TextAlignStart />
          </button>
        </div>
      </header>
      {/* Mobile: Bottom navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur z-40">
        <ul className="flex items-center justify-around py-2">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                aria-label={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`p-3 rounded-xl transition
                  ${
                    tab.name === "plus"
                      ? "bg-gray-200 text-gray-500 active:scale-95"
                      : activeTab === tab.name
                      ? "bg-gray-100 text-black"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
              >
                {tab.icon}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
