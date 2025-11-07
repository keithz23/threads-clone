export type TabKey = "home" | "search" | "activity" | "profile" | "messages";

export const tabToPath = (tab: TabKey, handle?: string) =>
  tab === "home"
    ? "/"
    : tab === "search"
    ? "/search"
    : tab === "activity"
    ? "/activity"
    : tab === "messages"
    ? "/messages"
    : // profile
    handle
    ? `/@${handle}`
    : "/";

export const pathToTab = (pathname: string): TabKey => {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/search")) return "search";
  if (pathname.startsWith("/activity")) return "activity";
  if (pathname.startsWith("/messages")) return "messages";
  if (/^\/@[^/]+$/.test(pathname)) return "profile";
  return "home";
};
