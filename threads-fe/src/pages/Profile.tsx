import { ChartNoAxesColumn, Link as LinkIcon } from "lucide-react";
import { useEffect, useMemo, useState, type JSX } from "react";
import Threads from "../components/tabs/Threads";
import Replies from "../components/tabs/Replies";
import Media from "../components/tabs/Media";
import Reposts from "../components/tabs/Reposts";
import { Button } from "@/components/ui/button";
import EditProfile from "@/components/profile/EditProfile";

type TabKey = "threads" | "replies" | "media" | "reposts";

const TABS = [
  { id: 1, displayName: "Threads", name: "threads" as const },
  { id: 2, displayName: "Replies", name: "replies" as const },
  { id: 3, displayName: "Media", name: "media" as const },
  { id: 4, displayName: "Reposts", name: "reposts" as const },
] satisfies { id: number; displayName: string; name: TabKey }[];

const TAB_TO_COMPONENT: Record<TabKey, JSX.Element> = {
  threads: <Threads />,
  replies: <Replies />,
  media: <Media />,
  reposts: <Reposts />,
};

export default function Profile() {
  const interests = useMemo(() => ["music", "+"].filter(Boolean), []);
  const [open, setOpen] = useState(false);

  const initialTab = (() => {
    const url = new URL(window.location.href);
    const fromUrl = url.searchParams.get("tab") as TabKey | null;
    if (fromUrl && TABS.some((t) => t.name === fromUrl)) return fromUrl;

    const fromLs = localStorage.getItem("profile_active_tab") as TabKey | null;
    if (fromLs && TABS.some((t) => t.name === fromLs)) return fromLs;

    return "threads" as const;
  })();

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  useEffect(() => {
    localStorage.setItem("profile_active_tab", activeTab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", activeTab);
    const current = new URL(window.location.href);
    if (current.search !== url.search) {
      window.history.replaceState(null, "", url.toString());
    }
  }, [activeTab]);

  const avatarUrl =
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop";

  const handleOpenDialog = () => setOpen(true);

  return (
    <div
      className="w-full md:w-1/2 flex-1 md:border border-gray-200 md:pt-0 pt-[calc(4rem+env(safe-area-inset-top))] rounded-none md:rounded-3xl mx-auto h-full overflow-y-auto bg-white"
      role="main"
      aria-label="Profile page"
    >
      {/* Header area */}
      <div className="relative p-5 md:p-8">
        {/* Name + handle + Avatar */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-xl leading-tight break-words">
              lunez
            </h2>
            <div className="text-gray-500 text-sm">@lunez</div>
          </div>

          {/* Avatar */}
          <div className="flex items-start gap-3">
            <div className="rounded-full ring-4 ring-white/90 shadow-md">
              <img
                src={avatarUrl}
                alt="Profile picture"
                width={90}
                height={90}
                className="rounded-full border border-gray-300 object-cover"
              />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <p className="text-sm text-gray-800">nothing</p>

          {/* Interest pills */}
          <div className="mt-3 flex items-center gap-2">
            {interests.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Followers · website + Insights */}
          <div className="mt-3 text-sm text-gray-500 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span>0 followers</span>
              <span>·</span>
              <a
                href="https://keithivers.me"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-gray-600 hover:underline"
              >
                <LinkIcon className="size-4" aria-hidden /> keithivers.me
              </a>
            </div>
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 cursor-pointer"
              title="Insights"
              aria-label="Insights"
              type="button"
            >
              <ChartNoAxesColumn className="size-4" />
            </button>
          </div>
        </div>

        {/* Edit profile button full-width */}
        <div className="mt-5">
          <Button
            type="button"
            onClick={handleOpenDialog}
            className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 cursor-pointer"
            variant="outline"
          >
            Edit profile
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-y border-gray-200">
        <nav
          className="mx-auto max-w-3xl"
          role="tablist"
          aria-label="Profile tabs"
        >
          <ul className="flex">
            {TABS.map((tab) => {
              const selected = activeTab === tab.name;
              return (
                <li key={tab.id} className="flex-1">
                  <button
                    id={`tab-${tab.name}`}
                    role="tab"
                    aria-selected={selected}
                    aria-controls={`panel-${tab.name}`}
                    onClick={() => setActiveTab(tab.name)}
                    className={`w-full py-3 text-sm cursor-pointer ${
                      selected
                        ? "text-gray-900"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                    type="button"
                  >
                    {tab.displayName}
                  </button>
                </li>
              );
            })}
          </ul>
          {/* Underline indicator */}
          <div className="relative h-[1px] bg-gray-200">
            <div
              className="absolute left-0 -top-[1px] h-[2px] bg-gray-900 transition-transform duration-200"
              style={{
                width: `${100 / TABS.length}%`,
                transform: `translateX(${
                  TABS.findIndex((t) => t.name === activeTab) * 100
                }%)`,
              }}
            />
          </div>
        </nav>
      </div>

      {/* Composer row */}
      <div className="p-4">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
          <img
            src={avatarUrl}
            alt="Your avatar"
            width={28}
            height={28}
            className="rounded-full border border-gray-300 object-cover"
          />
          <input
            type="text"
            placeholder="What's new?"
            className="flex-1 bg-transparent outline-none placeholder:text-gray-400 text-sm"
          />
          <Button
            type="button"
            className="rounded-lg border border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
            variant="outline"
          >
            Post
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 md:p-8">
        <div
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-gray-500"
        >
          {TAB_TO_COMPONENT[activeTab]}
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <EditProfile open={open} setOpen={setOpen} />
    </div>
  );
}
