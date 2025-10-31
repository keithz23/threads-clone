import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";

type InterestsScreenProps = {
  interestsVal: string[];
  setInterestsVal: React.Dispatch<React.SetStateAction<string[]>>;
  go: (screen: "main" | "bio" | "interests" | "links") => void;
};
export const InterestsScreen = ({
  interestsVal,
  setInterestsVal,
  go,
}: InterestsScreenProps) => {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (!interestsVal.includes(v)) setInterestsVal((prev) => [...prev, v]);
    setDraft("");
  };
  const remove = (s: string) =>
    setInterestsVal((prev) => prev.filter((x) => x !== s));

  return (
    <div className="flex flex-col gap-5 px-6 pt-4 pb-6 overflow-hidden">
      <label className="text-base font-semibold text-gray-900">Interests</label>
      <div className="flex gap-3">
        <Input
          placeholder="e.g. music"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          className="text-base h-12"
        />
        <Button onClick={add} className="px-6 text-base">
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {interestsVal.length ? (
          interestsVal.map((tag) => (
            <button
              key={tag}
              onClick={() => remove(tag)}
              className="px-4 py-2 rounded-full border text-base hover:bg-gray-50 transition"
              title="Click to remove"
            >
              {tag}
            </button>
          ))
        ) : (
          <span className="text-base text-gray-500">No interests yet.</span>
        )}
      </div>
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={() => go("main")}
          className="px-6 py-5 text-base"
        >
          Cancel
        </Button>
        <Button onClick={() => go("main")} className="px-6 py-5 text-base">
          Save
        </Button>
      </div>
    </div>
  );
};
