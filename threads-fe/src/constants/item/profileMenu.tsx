import Media from "@/components/tabs/Media";
import Replies from "@/components/tabs/Replies";
import Reposts from "@/components/tabs/Reposts";
import Threads from "@/components/tabs/Threads";
import {
  ChevronRight,
  Info,
  Link,
  MessageSquareWarning,
  UserMinus,
  UserRoundX,
  UserX,
} from "lucide-react";
import type { JSX } from "react";

export type TabKey = "threads" | "replies" | "media" | "reposts";

export const TABS = [
  { id: 1, displayName: "Threads", name: "threads" as const },
  { id: 2, displayName: "Replies", name: "replies" as const },
  { id: 3, displayName: "Media", name: "media" as const },
  { id: 4, displayName: "Reposts", name: "reposts" as const },
] satisfies { id: number; displayName: string; name: TabKey }[];

export const TAB_TO_COMPONENT: Record<TabKey, JSX.Element> = {
  threads: <Threads />,
  replies: <Replies />,
  media: <Media />,
  reposts: <Reposts />,
};

export const profileMenuItems = [
  {
    actions: [
      {
        id: 1,
        displayName: "Copy link",
        name: "copyLink",
        icon: <Link size={20} />,
      },
      {
        id: 2,
        displayName: "About this profile",
        name: "aboutThisProfile",
        icon: <Info size={20} />,
      },
      {
        id: 3,
        displayName: "Add to feed",
        name: "addToFeed",
        icon: <ChevronRight size={20} />,
      },
    ],
    privacy: [
      {
        id: 1,
        displayName: "Mute",
        name: "mute",
        icon: <UserMinus size={20} />,
      },
      {
        id: 2,
        displayName: "Restrict",
        name: "restrict",
        icon: <UserX size={20} />,
      },
    ],
    moderation: [
      {
        id: 1,
        displayName: "Block",
        name: "block",
        icon: <UserRoundX size={20} />,
      },
      {
        id: 2,
        displayName: "Report",
        name: "report",
        icon: <MessageSquareWarning size={20} />,
      },
    ],
  },
];
