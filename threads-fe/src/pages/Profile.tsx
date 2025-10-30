import { ChartNoAxesColumn, Link as LinkIcon } from "lucide-react";
import { useMemo, useState } from "react";

export default function Profile() {
  const interests = useMemo(() => ["music", "+"], []);
  const [activeTab, setActiveTab] = useState("threads");
  const avatarUrl =
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop";

  const tabs = [
    { id: 1, displayName: "Threads", name: "threads" },
    { id: 2, displayName: "Replies", name: "replies" },
    { id: 3, displayName: "Media", name: "media" },
    { id: 4, displayName: "Reposts", name: "reposts" },
  ];

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
            <div className="text-gray-500 text-sm">lunez</div>
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
                href="#"
                className="inline-flex items-center gap-1 text-gray-600 hover:underline"
              >
                <LinkIcon className="size-4" aria-hidden /> keithivers.me
              </a>
            </div>
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 cursor-pointer"
              title="Insights"
              aria-label="Insights"
            >
              <ChartNoAxesColumn className="size-4" />
            </button>
          </div>
        </div>

        {/* Edit profile button full-width */}
        <div className="mt-5">
          <button
            type="button"
            className="w-full rounded-xl border border-gray-300 py-2.5 text-sm font-medium hover:bg-gray-50 cursor-pointer"
          >
            Edit profile
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-y border-gray-200">
        <nav className="mx-auto max-w-3xl">
          <ul className="flex">
            {tabs.map((tab) => (
              <li key={tab.id} className="flex-1">
                <button
                  onClick={() => setActiveTab(tab.name)}
                  className={`w-full py-3 text-sm cursor-pointer ${
                    activeTab === tab.name
                      ? "text-gray-900"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  role="tab"
                  aria-selected={activeTab === tab.name}
                >
                  {tab.displayName}
                </button>
              </li>
            ))}
          </ul>
          {/* Underline indicator */}
          <div className="relative h-[1px] bg-gray-200">
            <div
              className="absolute left-0 -top-[1px] h-[2px] bg-gray-900 transition-transform duration-200"
              style={{
                width: `${100 / tabs.length}%`,
                transform: `translateX(${
                  tabs.findIndex((t) => t.name === activeTab) * 100
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
          <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 cursor-pointer">
            Post
          </button>
        </div>
      </div>

      {/* Content placeholder */}
      <div className="p-5 md:p-8">
        <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-gray-500">
          Your threads will show up here.
        </div>
      </div>
    </div>
  );
}
