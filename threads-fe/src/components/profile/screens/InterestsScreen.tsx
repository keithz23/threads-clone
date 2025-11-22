import { Separator } from "@/components/ui/separator";
import { CircleMinus, TextAlignJustify } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { DndContext, closestCenter } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const InterestsScreen = () => {
  const [draft, setDraft] = useState("");

  // Access form context
  const { watch, setValue } = useFormContext();

  // Use local state for DnD
  const [localInterests, setLocalInterests] = useState<string[]>([]);

  // Sync from form to local state
  useEffect(() => {
    const interests = watch("interests") || [];
    setLocalInterests(interests);
  }, [watch("interests")]);

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (!localInterests.includes(v)) {
      const newInterests = [...localInterests, v];
      setLocalInterests(newInterests);
      setValue("interests", newInterests);
    }
    setDraft("");
  };

  const remove = (s: string) => {
    const newInterests = localInterests.filter((x: string) => x !== s);
    setLocalInterests(newInterests);
    setValue("interests", newInterests);
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const oldIndex = localInterests.findIndex((x: string) => x === active.id);
    const newIndex = localInterests.findIndex((x: string) => x === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newInterests = arrayMove(localInterests, oldIndex, newIndex);
    setLocalInterests(newInterests);
    setValue("interests", newInterests, { shouldDirty: true });
  };

  return (
    <div className="flex flex-col gap-5 p-6">
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
        {localInterests.length ? (
          <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext
              items={localInterests}
              strategy={verticalListSortingStrategy}
            >
              <div className="border border-gray-300 shadow-2xs w-full rounded-2xl overflow-hidden">
                {localInterests.map((tag: string, i: number) => (
                  <RowItem
                    key={tag}
                    id={tag}
                    tag={tag}
                    onRemove={remove}
                    showSep={i < localInterests.length - 1}
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
