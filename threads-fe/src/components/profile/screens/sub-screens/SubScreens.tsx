import { LinkIcon } from "lucide-react";
import type { useFormContext } from "react-hook-form";

type ScreenProps = {
  register: ReturnType<typeof useFormContext>["register"];
  handleFetchFavicon: () => void;
  handleRemoveLink?: () => void;
};

export function AddScreen({ register, handleFetchFavicon }: ScreenProps) {
  const linkReg = register("link");
  const titleReg = register("linkTitle");
  return (
    <div className="p-5">
      <div className="border border-gray-200 rounded-xl p-5 space-y-5">
        <input
          type="text"
          className="focus:outline-none w-full"
          placeholder="URL"
          {...linkReg}
          onBlur={(e) => {
            linkReg.onBlur(e);
            handleFetchFavicon();
          }}
        />
        <input
          type="text"
          className="focus:outline-none w-full"
          placeholder="Title (optional)"
          {...titleReg}
        />
      </div>
    </div>
  );
}

export function EditScreen({
  register,
  handleFetchFavicon,
  handleRemoveLink,
}: ScreenProps) {
  const linkReg = register("link");
  const titleReg = register("linkTitle");
  return (
    <div className="p-5">
      <div className="border border-gray-200 rounded-xl p-5 space-y-5 mb-5">
        <input
          type="text"
          className="focus:outline-none w-full"
          placeholder="URL"
          {...linkReg}
          onBlur={(e) => {
            linkReg.onBlur(e);
            handleFetchFavicon();
          }}
        />
        <input
          type="text"
          className="focus:outline-none w-full"
          placeholder="Title (optional)"
          {...titleReg}
        />
      </div>
      <div className="border border-gray-200 rounded-2xl py-3 px-5">
        <button
          type="button"
          className="text-red-500 cursor-pointer w-full text-left"
          onClick={handleRemoveLink}
        >
          <span>Remove link</span>
        </button>
      </div>
    </div>
  );
}

export function MainScreen({
  linkVal,
  titleVal,
  favicon,
  hostLabel,
  go,
}: {
  linkVal: string;
  titleVal: string;
  favicon: string | null;
  hostLabel: string;
  go: (s: "links" | "add" | "edit") => void;
}) {
  return (
    <div className="flex flex-col gap-5 p-5 overflow-hidden">
      {linkVal && (
        <button
          type="button"
          className="text-left border border-gray-200 rounded-2xl py-4 px-4 text-xs text-muted-foreground cursor-pointer"
          onClick={() => go("edit")}
        >
          <div className="flex items-center gap-x-3">
            <div className="border bg-gray-50 rounded-xl p-2 h-11 w-11 flex items-center justify-center overflow-hidden">
              {favicon ? (
                <img
                  src={favicon}
                  alt={`${hostLabel} favicon`}
                  className="h-7 w-7"
                />
              ) : (
                <span className="text-sm">
                  {hostLabel?.[0]?.toUpperCase() || "🌐"}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-md">{titleVal || hostLabel}</span>
              <span className="truncate">{linkVal}</span>
            </div>
          </div>
        </button>
      )}

      <div
        className="border border-gray-300 rounded-xl p-4 cursor-pointer"
        onClick={() => go("add")}
      >
        <div className="flex items-center justify-between">
          <button type="button" className="font-semibold">
            Add link
          </button>
          <LinkIcon aria-hidden />
        </div>
      </div>
    </div>
  );
}
