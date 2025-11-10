import { useState, useRef, useEffect } from "react";
import {
  BookCopy,
  CircleEllipsis,
  Image,
  Smile,
  AlignLeft,
  MapPin,
  Hash,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { useToast } from "./Toast";

type ThreadsPostDialogProps = {
  showPostDialog: boolean;
  setShowPostDialog: (s: boolean) => void;
};

export default function ThreadsPostDialog({
  showPostDialog,
  setShowPostDialog,
}: ThreadsPostDialogProps) {
  const { user } = useAuth();
  const [postContent, setPostContent] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const prevUrlsRef = useRef<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const maxSizeMB = 5; // Define max file size

  const revoke = (url: string | null) => {
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setPostContent((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const handleOpenFile = () => fileRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newUrls: string[] = [];

    // Validate and process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const isImage = file.type.startsWith("image/");
      const isTooLarge = file.size > maxSizeMB * 1024 * 1024;

      if (!isImage) {
        toast.error(`${file.name} is not an image file.`);
        continue;
      }
      if (isTooLarge) {
        toast.error(`${file.name} is too large (>${maxSizeMB}MB).`);
        continue;
      }

      const url = URL.createObjectURL(file);
      newUrls.push(url);
    }

    // Add valid images to uploaded images
    if (newUrls.length > 0) {
      setUploadedImages((prev) => [...prev, ...newUrls]);
      prevUrlsRef.current.push(...newUrls);
    }

    e.target.value = "";
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const urlToRemove = uploadedImages[indexToRemove];
    revoke(urlToRemove);

    setUploadedImages((prev) => prev.filter((_, i) => i !== indexToRemove));
    prevUrlsRef.current = prevUrlsRef.current.filter(
      (_, i) => i !== indexToRemove
    );
  };

  useEffect(() => {
    return () => {
      // Cleanup all URLs on unmount
      prevUrlsRef.current.forEach(revoke);
    };
  }, []);

  const functionButton = [
    {
      id: 1,
      name: "image",
      icon: <Image size={20} className="text-gray-600" />,
      onClick: () => handleOpenFile(),
    },
    {
      id: 2,
      name: "emoji",
      icon: <Smile size={20} className="text-gray-600" />,
      onClick: () => setShowEmojiPicker(!showEmojiPicker),
    },
    {
      id: 3,
      name: "hash",
      icon: <Hash size={20} className="text-gray-600" />,
      onClick: () => toast.error("Coming soon"),
    },
    {
      id: 4,
      name: "poll",
      icon: <AlignLeft size={20} className="text-gray-600" />,
      onClick: () => toast.error("Coming soon"),
    },
    {
      id: 5,
      name: "location",
      icon: <MapPin size={20} className="text-gray-600" />,
      onClick: () => toast.error("Coming soon"),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent className="max-w-xl p-0">
          <DialogHeader className="border-b px-4 py-3">
            <DialogTitle>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowPostDialog(false)}
                  className="text-base font-normal text-gray-900 hover:text-gray-600 cursor-pointer"
                >
                  Cancel
                </button>
                <h3 className="text-gray-900 text-base font-semibold">
                  New thread
                </h3>
                <div className="flex items-center gap-x-3">
                  <button
                    type="button"
                    className="cursor-pointer active:scale-95 text-gray-700 hover:text-gray-900"
                  >
                    <BookCopy size={24} />
                  </button>
                  <button
                    type="button"
                    className="cursor-pointer active:scale-95 text-gray-700 hover:text-gray-900"
                  >
                    <CircleEllipsis size={24} />
                  </button>
                </div>
              </div>
              <DialogDescription />
            </DialogTitle>
          </DialogHeader>

          <div className="p-4">
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <Avatar className="h-10 w-10 border-2 border-gray-200 bg-white">
                  <AvatarImage
                    src={user?.data?.avatarUrl}
                    alt={user?.data?.username}
                  />
                  <AvatarFallback className="text-gray-500 uppercase font-medium text-sm">
                    {user?.data?.username?.substring(0, 2) || "LZ"}
                  </AvatarFallback>
                </Avatar>
                <div className="w-0.5 bg-gray-200 flex-1 mt-2"></div>
              </div>

              <div className="flex-1">
                <div className="mb-2">
                  <span className="font-semibold text-gray-900">
                    {user?.data?.username || "lunez195"}
                  </span>
                  <button className="ml-2 text-gray-500 text-sm">
                    Add a topic
                  </button>
                </div>

                <textarea
                  ref={textareaRef}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="What's new?"
                  className="w-full resize-none border-none outline-none text-gray-900 placeholder-gray-400 text-base"
                  rows={4}
                />

                {uploadedImages.length > 0 && (
                  <Carousel
                    opts={{ align: "start" }}
                    className="w-full max-w-sm"
                  >
                    <CarouselContent>
                      {uploadedImages.map((imageUrl, index) => (
                        <CarouselItem
                          key={index}
                          className="md:basis-1/2 lg:basis-1/3"
                        >
                          <div className="p-1">
                            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={imageUrl}
                                alt={`item ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                aria-label={`Remove image ${index + 1}`}
                                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 rounded-full p-1.5 transition-colors"
                              >
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                )}

                <div className="flex gap-2 mt-2 relative">
                  {functionButton.map((btn) => (
                    <button
                      className="p-2 hover:bg-gray-100 rounded-lg active:scale-95 cursor-pointer"
                      key={btn.id}
                      onClick={btn.onClick}
                    >
                      {btn.icon}
                    </button>
                  ))}

                  {/* Emoji Picker Popup */}
                  {showEmojiPicker && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowEmojiPicker(false)}
                      />
                      <div className="absolute bottom-full left-0 mb-2 z-20">
                        <EmojiPicker
                          onEmojiClick={handleEmojiClick}
                          width={350}
                          height={400}
                          searchDisabled={false}
                          skinTonesDisabled={false}
                          previewConfig={{
                            showPreview: false,
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 pb-4">
              <div className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-gray-300"></div>
              </div>
              <span className="text-gray-400 text-sm">Add to thread</span>
            </div>
          </div>

          <div className="border-t px-4 py-3 flex items-center justify-between">
            <span className="text-gray-500 text-sm">Reply options</span>
            <button
              onClick={() => {
                if (postContent.trim()) {
                  console.log("Posted:", postContent);
                  setPostContent("");
                  setUploadedImages([]);
                  prevUrlsRef.current.forEach(revoke);
                  prevUrlsRef.current = [];
                  setShowPostDialog(false);
                }
              }}
              disabled={!postContent.trim()}
              className="px-6 py-1.5 rounded-full text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-gray-400 hover:text-gray-600"
            >
              Post
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
