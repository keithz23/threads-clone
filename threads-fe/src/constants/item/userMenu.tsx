import { ChevronRight } from "lucide-react";

export const userMenu = [
  {
    preferences: [
      {
        id: 1,
        name: "appearance",
        displayName: "Appearance",
        chevron: <ChevronRight />,
      },
      { id: 2, name: "insight", displayName: "Insight" },
      { id: 3, name: "settings", displayName: "Settings" },
    ],

    content: [
      {
        id: 1,
        name: "feeds",
        displayName: "Feeds",
        chevron: <ChevronRight />,
      },
      { id: 2, name: "saved", displayName: "Saved" },
      { id: 3, name: "liked", displayName: "Liked" },
    ],

    account: [
      { id: 1, name: "reportAProblem", displayName: "Report a problem" },
      { id: 2, name: "logout", displayName: "Logout" },
    ],
  },
];
