import { Badge } from "@/components/ui/badge";
import { type TabKey } from "@/utils/tabPathMap";
import { Heart, House, Plus, Search, User } from "lucide-react";

export const tabs: Array<{
  id: number;
  name: TabKey | "plus";
  icon: React.ReactNode;
}> = [
  { id: 1, name: "home", icon: <House size={24} /> },
  { id: 2, name: "search", icon: <Search size={24} /> },
  { id: 3, name: "plus", icon: <Plus size={24} /> }, // action
  {
    id: 4,
    name: "activity",
    icon: (
      <div className="relative inline-block">
        <Heart size={24} />
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-2 w-2 p-0 flex items-center justify-center"
        />
      </div>
    ),
  },
  { id: 5, name: "profile", icon: <User size={24} /> },
];
