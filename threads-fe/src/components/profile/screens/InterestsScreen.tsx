import { Separator } from "@/components/ui/separator";
import { CircleMinus, TextAlignJustify } from "lucide-react";
import React, { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type InterestsScreenProps = {
  interestsVal: string[];
  setInterestsVal: React.Dispatch<React.SetStateAction<string[]>>;
  go: (screen: "main" | "bio" | "interests" | "links") => void;
};

export const InterestsScreen = ({
  interestsVal,
  setInterestsVal,
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

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const oldIndex = interestsVal.findIndex((x) => x === active.id);
    const newIndex = interestsVal.findIndex((x) => x === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    setInterestsVal((prev) => arrayMove(prev, oldIndex, newIndex));
  };

  return (
    <div className="flex flex-col gap-5 p-6 overflow-hidden">
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Add a topic"
          className="p-5 rounded-xl border border-gray-300 w-full focus:ring-0 focus:outline-none"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
      </div>

      <div className="flex flex-wrap gap-2 w-full">
        {interestsVal.length ? (
          <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext
              items={interestsVal}
              strategy={verticalListSortingStrategy}
            >
              <div className="border border-gray-300 shadow-2xs w-full rounded-2xl overflow-hidden">
                {interestsVal.map((tag, i) => (
                  <RowItem
                    key={tag}
                    id={tag}
                    tag={tag}
                    onRemove={remove}
                    showSep={i < interestsVal.length - 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-sm text-gray-500">No interests yet.</div>
        )}
      </div>
    </div>
  );
};

function RowItem({
  id,
  tag,
  onRemove,
  showSep,
}: {
  id: string;
  tag: string;
  onRemove: (s: string) => void;
  showSep: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isDragging ? "rgba(0,0,0,0.02)" : undefined,
    opacity: isDragging ? 0.95 : 1,
    cursor: "grab",
    touchAction: "none",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-center justify-between p-5">
        <div
          className="flex items-center gap-x-5 select-none"
          {...attributes}
          {...listeners}
          aria-label={`Drag handle for ${tag}`}
          title="Drag to reorder"
        >
          <TextAlignJustify size={20} className="text-gray-400" />
          <span className="text-xl">{tag}</span>
        </div>

        <button
          type="button"
          className="cursor-pointer p-1 rounded-md hover:bg-gray-100"
          onClick={() => onRemove(tag)}
          aria-label={`Remove ${tag}`}
        >
          <CircleMinus className="text-gray-500" />
        </button>
      </div>
      {showSep && <Separator />}
    </div>
  );
}
