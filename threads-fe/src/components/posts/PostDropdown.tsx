import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { Group } from "@/interfaces/profile/profile.interface";
import { Ellipsis } from "lucide-react";

type PostDropdownProps = {
  groups: Group[];
};

export default function PostDropdown({ groups }: PostDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="cursor-pointer group rounded-full transition-all duration-200 p-2 hover:bg-gray-100 active:scale-95 flex-shrink-0 focus:outline-none"
          aria-label="More options"
        >
          <Ellipsis
            size={18}
            className="text-gray-500 group-hover:text-gray-900 transition-colors"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-60 ml-2" align="start">
        {groups.map((g, gi) => (
          <React.Fragment key={g.id}>
            <DropdownMenuGroup>
              {g.items.map((it) => (
                <DropdownMenuItem
                  key={it.id}
                  className={it.dangerous ? "text-red-600" : undefined}
                >
                  {it.label}

                  <DropdownMenuShortcut>
                    {it.icon ? (
                      it.dangerous ? (
                        <span className="text-red-500">{it.icon}</span>
                      ) : (
                        it.icon
                      )
                    ) : null}
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            {gi < groups.length - 1 && <DropdownMenuSeparator />}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
