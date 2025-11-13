import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Hash, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type HashtagDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentHashtag: string;
  hashtags: string[];
  hashtagInputRef: React.RefObject<HTMLInputElement | null>;
  onCurrentHashtagChange: (value: string) => void;
  onAddHashtag: () => void;
  onRemoveHashtag: (index: number) => void;
  onInsertHashtags: () => void;
  onHashtagKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  allHashtags?: string[];
};

export default function HashtagDialog({
  isOpen,
  onOpenChange,
  currentHashtag,
  hashtags,
  hashtagInputRef,
  onCurrentHashtagChange,
  onAddHashtag,
  onRemoveHashtag,
  onInsertHashtags,
  onHashtagKeyDown,
  allHashtags = [],
}: HashtagDialogProps) {
  const [filteredHashtags, setFilteredHashtags] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const normalizeHashtag = (tag: string) => {
    return tag.startsWith("#") ? tag.slice(1) : tag;
  };

  useEffect(() => {
    if (currentHashtag.trim() && allHashtags && allHashtags.length > 0) {
      const searchTerm = normalizeHashtag(currentHashtag).toLowerCase();

      const filtered = allHashtags.filter((tag) => {
        if (!tag || typeof tag !== "string") return false;

        const normalizedTag = normalizeHashtag(tag).toLowerCase();
        const normalizedAdded = hashtags
          .filter((h) => h && typeof h === "string")
          .map((h) => normalizeHashtag(h).toLowerCase());

        return (
          normalizedTag.includes(searchTerm) &&
          !normalizedAdded.includes(normalizedTag)
        );
      });

      setFilteredHashtags(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredHashtags([]);
    }
  }, [currentHashtag, allHashtags, hashtags]);

  // Handle select hashtag from suggestions
  const handleSelectHashtag = (tag: string) => {
    // Remove # if present in the selected tag
    const cleanTag = normalizeHashtag(tag);
    onCurrentHashtagChange(cleanTag);
    setShowSuggestions(false);

    setTimeout(() => {
      hashtagInputRef.current?.focus();
    }, 0);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setShowSuggestions(false);
      return;
    }

    if (
      showSuggestions &&
      (e.key === "Enter" || e.key === "ArrowDown" || e.key === "ArrowUp")
    ) {
      // Command component sẽ handle
      return;
    }

    onHashtagKeyDown(e);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Hashtags</DialogTitle>
          <DialogDescription>
            Add hashtags to increase the reach of your post
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Hash
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none"
                size={18}
              />

              <Popover open={showSuggestions} onOpenChange={setShowSuggestions}>
                <PopoverTrigger asChild>
                  <input
                    ref={hashtagInputRef}
                    type="text"
                    value={currentHashtag}
                    onChange={(e) => onCurrentHashtagChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter hashtag"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none transition-shadow"
                    onFocus={() => {
                      if (filteredHashtags.length > 0) setShowSuggestions(true);
                    }}
                  />
                </PopoverTrigger>

                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <Command>
                    <CommandList>
                      <CommandEmpty>
                        <div className="px-4 py-3 text-sm text-gray-500">
                          No hashtag found. Press{" "}
                          <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 border rounded">
                            Enter
                          </kbd>{" "}
                          to create "
                          <span className="font-medium">
                            #{normalizeHashtag(currentHashtag)}
                          </span>
                          "
                        </div>
                      </CommandEmpty>
                      <CommandGroup>
                        {filteredHashtags.map((tag) => (
                          <CommandItem
                            key={tag}
                            value={tag}
                            onSelect={() => handleSelectHashtag(tag)}
                            className="cursor-pointer"
                          >
                            <Hash size={14} className="mr-2 text-gray-400" />
                            <span>{tag}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <Button
              onClick={onAddHashtag}
              disabled={!currentHashtag.trim()}
              className="cursor-pointer py-5"
              variant="default"
            >
              <Plus size={18} />
              Add
            </Button>
          </div>

          {hashtags.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Added hashtags:
              </p>
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-gray-700 rounded-full text-sm"
                  >
                    <span className="font-medium">
                      #{normalizeHashtag(tag)}
                    </span>
                    <button
                      onClick={() => onRemoveHashtag(index)}
                      className="hover:bg-blue-100 rounded-full p-0.5 transition-colors cursor-pointer"
                      aria-label={`Remove ${tag}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              onClick={() => onOpenChange(false)}
              variant="ghost"
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={onInsertHashtags}
              disabled={hashtags.length === 0}
              variant="default"
              className="py-5 cursor-pointer"
            >
              Insert {hashtags.length > 0 && `(${hashtags.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
