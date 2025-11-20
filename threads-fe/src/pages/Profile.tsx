import {
  Bell,
  ChartNoAxesColumn,
  Ellipsis,
  Link as LinkIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import EditProfile from "@/components/profile/EditProfile";
import { useAuth } from "@/hooks/useAuth";
import type { UpdateProfileDto } from "@/interfaces/auth/profile.interface";
import { useProfileRealtime } from "@/hooks/useProfile";
import { useParams } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  profileMenuItems,
  TAB_TO_COMPONENT,
  TABS,
  type TabKey,
  type TabProps,
} from "@/constants/item/profileMenu";
import { useFollow } from "@/hooks/useFollow";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserPosts } from "@/hooks/useNewsfeed";

function normalizeUrl(url?: string) {
  if (!url) return "";
  try {
    const hasProtocol = /^https?:\/\//i.test(url);
    return hasProtocol ? url : `https://${url}`;
  } catch {
    return "";
  }
}

export default function Profile() {
  const { user, update } = useAuth();
  const [open, setOpen] = useState(false);
  const [showUnfollowDialog, setShowUnfollowDialog] = useState(false);
  const { toggleFollow } = useFollow();
  const [isFollowing, setIsFollowing] = useState(false);
  const { handle } = useParams();

  const me = user?.data;

  const targetUsername = useMemo(() => {
    if (!handle) return me?.username; // Own profile
    return handle.replace(/^@/, "");
  }, [handle, me?.username]);

  const { profileData } = useUserProfile(targetUsername);

  useProfileRealtime(me, profileData?.id);

  const isOwnProfile = useMemo(() => {
    if (!me) return false;
    if (!targetUsername) return true;
    if (profileData && typeof profileData.isOwnProfile !== "undefined") {
      return Boolean(profileData.isOwnProfile);
    }
    return me.username === targetUsername;
  }, [me, targetUsername, profileData]);

  const viewingUser = useMemo(() => {
    if (isOwnProfile) {
      return me ?? {};
    }
    return profileData ?? {};
  }, [isOwnProfile, me, profileData]);

  const profile = useMemo(() => {
    const d = viewingUser ?? {};

    const interestsClean: string[] = Array.isArray(d.interests)
      ? [
          ...new Set(
            (d.interests as unknown[])
              .map(String)
              .map((s) => s.trim())
              .filter(Boolean)
          ),
        ]
      : [];

    return {
      id: d.id,
      displayName: (d.displayName ?? "").trim(),
      username: (d.username ?? "").trim() || targetUsername || "",
      bio: (d.bio ?? "").trim(),
      interests: interestsClean,
      link: normalizeUrl(d.link),
      linkTitle: (d.linkTitle ?? "").trim(),
      isPrivate: Boolean(d.isPrivate),
      avatarUrl:
        (d.avatarUrl as string) ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
      followersCount:
        typeof d.followersCount === "number" &&
        Number.isFinite(d.followersCount)
          ? d.followersCount
          : 0,
    };
  }, [viewingUser, targetUsername]);

  useEffect(() => {
    if (
      profileData &&
      typeof profileData.relationshipStatus?.isFollowing !== "undefined"
    ) {
      setIsFollowing(profileData.relationshipStatus.isFollowing);
    }
  }, [profileData]);

  const handleSave = async (data: UpdateProfileDto) => {
    await update.mutateAsync({ updateProfileDto: data });
  };

  const initialTab: TabKey = useMemo(() => {
    const url = new URL(window.location.href);
    const fromUrl = url.searchParams.get("tab") as TabKey | null;
    if (fromUrl && TABS.some((t) => t.name === fromUrl)) return fromUrl;

    const fromLs = (localStorage.getItem("profile_active_tab") || "") as TabKey;
    if (fromLs && TABS.some((t) => t.name === fromLs)) return fromLs;

    return "posts";
  }, []);

  const handleToggleFollow = async (followingId: string) => {
    try {
      const res = await toggleFollow.mutateAsync({ followingId });

      if (res?.isFollowing !== undefined) {
        setIsFollowing(res.isFollowing);
      }

      setShowUnfollowDialog(false);
    } catch (error) {
      console.error("Toggle follow failed:", error);
    }
  };

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const {
    posts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useUserPosts(
    targetUsername || "",
    activeTab as "posts" | "replies" | "media",
    20
  );

  const ActiveTab = TAB_TO_COMPONENT[activeTab];

  const tabProps: TabProps = {
    profileId: profile.id,
    isOwnProfile,
    username: targetUsername || profile.username,
    tabKeys: activeTab,
    posts: posts,
    hasNextPage: hasNextPage,
    isFetchingNextPage: isFetchingNextPage,
    fetchNextPage: fetchNextPage,
    isError: isError,
    isLoading: isLoading,
    error: error,
  };

  useEffect(() => {
    localStorage.setItem("profile_active_tab", activeTab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", activeTab);
    if (window.location.search !== url.search) {
      window.history.replaceState(null, "", url.toString());
    }
  }, [activeTab]);

  const interestPills = useMemo(
    () => [...profile.interests],
    [profile.interests]
  );

  if (!targetUsername) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div
      className="w-full md:w-1/2 flex-1 md:border border-gray-200 md:pt-0 pt-[calc(4rem+env(safe-area-inset-top))] rounded-none md:rounded-3xl mx-auto h-full overflow-y-auto bg-white custom-scroll"
      role="main"
      aria-label="Profile page"
    >
      {/* Header area */}
      <div className="relative p-5 md:p-8">
        {/* Name + handle + Avatar */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-xl leading-tight break-words">
              {profile.displayName || profile.username || "Unnamed"}
            </h2>
            {profile.username && (
              <div className="text-gray-500 text-sm">@{profile.username}</div>
            )}
          </div>

          {/* Avatar */}
          <div className="flex items-start gap-3">
            <div className="rounded-full ring-4 ring-white/90 shadow-md">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatarUrl} alt={profile.username} />
                <AvatarFallback className="text-lg">
                  {profile.username?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          {profile.bio && (
            <p className="text-sm text-gray-800">{profile.bio}</p>
          )}

          {/* Interest pills */}
          {interestPills.length > 0 && (
            <div className="mt-3 flex items-center gap-2 flex-wrap cursor-pointer">
              {interestPills.map((tag) => (
                <span
                  key={String(tag)}
                  className="inline-flex items-center rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-700"
                >
                  {String(tag)}
                </span>
              ))}
            </div>
          )}

          {/* Followers · website + Insights */}
          <div className="mt-3 text-sm text-gray-500 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span>{profile.followersCount} followers</span>
              {profile.link && (
                <>
                  <span>·</span>
                  <a
                    href={profile.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-gray-600 hover:underline"
                  >
                    <LinkIcon className="size-4" aria-hidden />
                    {profile.linkTitle || profile.link}
                  </a>
                </>
              )}
            </div>
            {isOwnProfile ? (
              <Button
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 cursor-pointer"
                title="Insights"
                aria-label="Insights"
                type="button"
                variant={"outline"}
              >
                <ChartNoAxesColumn className="size-4" />
              </Button>
            ) : (
              <div className="flex items-center gap-x-3">
                <Button
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 cursor-pointer"
                  title="Bell"
                  aria-label="Bell"
                  type="button"
                  variant={"outline"}
                >
                  <Bell className="size-4" />
                </Button>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 cursor-pointer"
                      title="ellipsis"
                      aria-label="ellipsis"
                      type="button"
                      variant={"outline"}
                    >
                      <Ellipsis className="size-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-56 p-1"
                    side="bottom"
                    align="start"
                    sideOffset={8}
                  >
                    <div role="menu" aria-label="More options" className="py-1">
                      {/* Interact group */}
                      <div className="px-1 py-1">
                        {profileMenuItems[0].actions.map((item) => (
                          <button
                            key={item.id}
                            role="menuitem"
                            className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                            onClick={() => {}}
                          >
                            <span className="truncate">{item.displayName}</span>
                            <span className="shrink-0">{item.icon}</span>
                          </button>
                        ))}
                      </div>

                      <Separator className="my-1" />

                      {/* Mute group */}
                      <div className="px-1 py-1">
                        {profileMenuItems[0].privacy.map((item) => (
                          <button
                            key={item.id}
                            role="menuitem"
                            className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                            onClick={() => {}}
                          >
                            <span className="truncate">{item.displayName}</span>
                            <span className="shrink-0">{item.icon}</span>
                          </button>
                        ))}
                      </div>

                      <Separator className="my-1" />

                      {/* Function group */}
                      <div className="px-1 py-1">
                        {profileMenuItems[0].moderation.map((item) => {
                          return (
                            <button
                              key={item.id}
                              role="menuitem"
                              className={
                                "w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-sm cursor-pointer text-red-600 hover:bg-red-50"
                              }
                            >
                              <span className="truncate">
                                {item.displayName}
                              </span>
                              <span className="shrink-0">{item.icon}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </div>

        {/* Edit profile button full-width (only when viewing own profile) */}
        {isOwnProfile ? (
          <div className="mt-5">
            <Button
              type="button"
              onClick={() => setOpen(true)}
              className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 cursor-pointer"
              variant="outline"
            >
              Edit profile
            </Button>
          </div>
        ) : (
          <div>
            <div className="mt-5 flex items-center gap-x-3">
              <Button
                type="button"
                className={`p-5 w-1/2 rounded-lg border border-gray-300 cursor-pointer flex items-center justify-center gap-2 ${
                  isFollowing
                    ? "bg-white text-gray-900 hover:bg-gray-50"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
                variant={isFollowing ? "outline" : "default"}
                onClick={() => {
                  if (isFollowing) {
                    setShowUnfollowDialog(true);
                  } else {
                    handleToggleFollow(profile.id);
                  }
                }}
                disabled={toggleFollow.isPending}
              >
                {toggleFollow.isPending ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isFollowing ? (
                  <>Following</>
                ) : (
                  <>Follow</>
                )}
              </Button>

              {/* Modal confirm unfollow */}
              <AlertDialog
                open={showUnfollowDialog}
                onOpenChange={setShowUnfollowDialog}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Unfollow @{profile.username}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Their posts will no longer show up in your home timeline.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleToggleFollow(profile.id)}
                      disabled={toggleFollow.isPending}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      {toggleFollow.isPending ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "Unfollow"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                type="button"
                className="p-5 w-1/2 rounded-lg border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 cursor-pointer"
                variant="outline"
              >
                Mention
              </Button>
            </div>
          </div>
        )}
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
        {isOwnProfile && (
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
            <Avatar className="h-10 w-10 rounded-full border border-gray-300 object-cover">
              <AvatarImage src={profile.avatarUrl} alt={profile.username} />
              <AvatarFallback className="text-lg">
                {profile.username?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
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
        )}
      </div>

      {/* Content */}
      <div className="p-2 md:p-4">
        <div
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="rounded-2xl border border-dashed border-gray-200 p-1 text-center text-gray-500"
        >
          <ActiveTab {...tabProps} />
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <EditProfile
        open={open}
        setOpen={setOpen}
        name={profile.displayName}
        handle={profile.username}
        bio={profile.bio}
        interests={profile.interests}
        link={profile.link}
        linkTitle={profile.linkTitle}
        isPrivate={profile.isPrivate}
        onSave={handleSave}
      />
    </div>
  );
}
