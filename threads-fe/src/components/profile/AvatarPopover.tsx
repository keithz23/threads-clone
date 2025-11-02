import { useRef, useState, useEffect } from "react";
import { UserRoundPlusIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useToast } from "../Toast";

type AvatarPopoverProps = {
  defaultUrl?: string;
  maxSizeMB?: number; // default 5MB
  onChange?: (file: File | null, previewUrl: string | null) => void;
};

export default function AvatarPopover({
  defaultUrl,
  maxSizeMB = 5,
  onChange,
}: AvatarPopoverProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const prevUrlRef = useRef<string | null>(null);
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(defaultUrl ?? null);
  const toast = useToast();

  const revoke = (url: string | null) => {
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  };

  const handleOpenFile = () => fileRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const isImage = file.type.startsWith("image/");
    const isTooLarge = file.size > maxSizeMB * 1024 * 1024;
    if (!isImage) {
      toast.error("Please select an image file.");
      e.target.value = "";
      return;
    }
    if (isTooLarge) {
      console.error(`Image too large (>${maxSizeMB}MB).`);
      e.target.value = "";
      return;
    }

    const url = URL.createObjectURL(file);

    revoke(prevUrlRef.current);
    prevUrlRef.current = url;

    setAvatarUrl(url);
    onChange?.(file, url);

    setOpen(false);

    e.target.value = "";
  };

  const handleRemove = () => {
    revoke(prevUrlRef.current);
    prevUrlRef.current = null;

    setAvatarUrl(null);
    onChange?.(null, null);
    setOpen(false);

    // reset input
    if (fileRef.current) fileRef.current.value = "";
  };

  useEffect(() => {
    return () => revoke(prevUrlRef.current);
  }, []);

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-haspopup="menu"
            aria-label="Change profile photo"
            className="relative size-12 rounded-full overflow-hidden border border-gray-300 hover:border-gray-400 bg-gray-50 transition cursor-pointer"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => {
                  setAvatarUrl(null);
                }}
              />
            ) : (
              <UserRoundPlusIcon className="size-12 -scale-x-100 p-3" />
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent
          side="bottom"
          align="end"
          className="bg-white border border-gray-100 shadow-lg rounded-2xl w-80 p-2"
          role="menu"
        >
          <button
            type="button"
            onClick={handleOpenFile}
            role="menuitem"
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-100 focus:outline-none cursor-pointer"
          >
            Upload picture
          </button>

          {avatarUrl ? (
            <button
              type="button"
              onClick={handleRemove}
              role="menuitem"
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-100 focus:outline-none text-red-600 cursor-pointer"
            >
              Remove current picture
            </button>
          ) : null}
        </PopoverContent>
      </Popover>
    </>
  );
}
