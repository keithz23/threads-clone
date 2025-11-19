import React, {
  useRef,
  useEffect,
  useReducer,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  BookCopy,
  CircleEllipsis,
  Image,
  Smile,
  AlignLeft,
  MapPin,
  Hash,
  SlidersVertical,
  Check,
  ChevronRight,
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
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { usePost } from "@/hooks/usePost";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import HashtagDialog from "./dialogs/HashtagDialog";
import { useHashtag } from "@/hooks/useHashtag";

const ReplyOptions = [
  { id: 1, displayName: "Anyone", replyPolicyName: "ANYONE", name: "anyone" },
  {
    id: 2,
    displayName: "Your followers",
    replyPolicyName: "FOLLOWERS",
    name: "yourFollowers",
  },
  {
    id: 3,
    displayName: "Profiles you follow",
    replyPolicyName: "FOLLOWING",
    name: "profilesYouFollow",
  },
  {
    id: 4,
    displayName: "Profiles you mention",
    replyPolicyName: "MENTIONS",
    name: "profilesYourMetion",
  },
];

const maxSizeMB = 10;

type ThreadsPostDialogProps = {
  showPostDialog: boolean;
  setShowPostDialog: (s: boolean) => void;
  allHashtags: string[];
};

type State = {
  postContent: string;
  uploadedImages: string[];
  uploadedFiles: File[];
  showEmojiPicker: boolean;
  isActive: string;
  isPopoverOpen: boolean;
  reviewApprove: boolean;
  isHashtagOpen: boolean;
  hashtags: string[];
  currentHashtag: string;
};

type Action =
  | { type: "SET_CONTENT"; payload: string }
  | { type: "ADD_IMAGES"; payload: { urls: string[]; files: File[] } }
  | { type: "REMOVE_IMAGE"; payload: number }
  | { type: "CLEAR_IMAGES" }
  | { type: "TOGGLE_EMOJI" }
  | { type: "SET_POPOVER"; payload: boolean }
  | { type: "SET_HASHTAG_POPOVER"; payload: boolean }
  | { type: "SET_ACTIVE"; payload: string }
  | { type: "SET_REVIEW"; payload: boolean }
  | { type: "ADD_HASHTAG"; payload: string }
  | { type: "REMOVE_HASHTAG"; payload: number }
  | { type: "SET_CURRENT_HASHTAG"; payload: string }
  | { type: "CLEAR_ALL" };

const initialState: State = {
  postContent: "",
  uploadedImages: [],
  uploadedFiles: [],
  showEmojiPicker: false,
  isActive: "",
  isPopoverOpen: false,
  reviewApprove: false,
  isHashtagOpen: false,
  hashtags: [],
  currentHashtag: "",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_CONTENT":
      return { ...state, postContent: action.payload };
    case "ADD_IMAGES":
      return {
        ...state,
        uploadedImages: [...state.uploadedImages, ...action.payload.urls],
        uploadedFiles: [...state.uploadedFiles, ...action.payload.files],
      };
    case "REMOVE_IMAGE":
      return {
        ...state,
        uploadedImages: state.uploadedImages.filter(
          (_, i) => i !== action.payload
        ),
        uploadedFiles: state.uploadedFiles.filter(
          (_, i) => i !== action.payload
        ),
      };
    case "CLEAR_IMAGES":
      return { ...state, uploadedImages: [], uploadedFiles: [] };
    case "TOGGLE_EMOJI":
      return { ...state, showEmojiPicker: !state.showEmojiPicker };
    case "SET_POPOVER":
      return { ...state, isPopoverOpen: action.payload };
    case "SET_HASHTAG_POPOVER":
      return { ...state, isHashtagOpen: action.payload };
    case "SET_ACTIVE":
      return { ...state, isActive: action.payload };
    case "SET_REVIEW":
      return { ...state, reviewApprove: action.payload };
    case "ADD_HASHTAG":
      if (!action.payload.trim() || state.hashtags.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        hashtags: [...state.hashtags, action.payload],
        currentHashtag: "",
      };
    case "REMOVE_HASHTAG":
      return {
        ...state,
        hashtags: state.hashtags.filter((_, i) => i !== action.payload),
      };
    case "SET_CURRENT_HASHTAG":
      return { ...state, currentHashtag: action.payload };
    case "CLEAR_ALL":
      return { ...initialState };
    default:
      return state;
  }
}

export default function ThreadsPostDialog({
  showPostDialog,
  setShowPostDialog,
  allHashtags,
}: ThreadsPostDialogProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const prevUrlsRef = useRef<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const hashtagInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const { user } = useAuth();
  const { createPost, isCreating } = usePost();
  const { createHashtag } = useHashtag();

  const hasContent =
    state.postContent.trim().length > 0 || state.uploadedFiles.length > 0;

  const revoke = useCallback((url: string | null) => {
    if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
  }, []);

  const handleEmojiClick = useCallback(
    (emojiData: EmojiClickData) => {
      dispatch({
        type: "SET_CONTENT",
        payload: state.postContent + emojiData.emoji,
      });
      dispatch({ type: "TOGGLE_EMOJI" });
      textareaRef.current?.focus();
    },
    [state.postContent]
  );

  const handleOpenFile = useCallback(() => fileRef.current?.click(), []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const newUrls: string[] = [];
      const newFiles: File[] = [];

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
        newFiles.push(file);
      }

      if (newUrls.length > 0) {
        dispatch({
          type: "ADD_IMAGES",
          payload: { urls: newUrls, files: newFiles },
        });
        prevUrlsRef.current.push(...newUrls);
      }

      e.target.value = "";
    },
    [toast]
  );

  const handleRemoveImage = useCallback(
    (indexToRemove: number) => {
      const urlToRemove = state.uploadedImages[indexToRemove];
      revoke(urlToRemove);
      dispatch({ type: "REMOVE_IMAGE", payload: indexToRemove });
      prevUrlsRef.current = prevUrlsRef.current.filter(
        (_, i) => i !== indexToRemove
      );
    },
    [state.uploadedImages, revoke]
  );

  const cleanupAndClose = useCallback(() => {
    prevUrlsRef.current.forEach(revoke);
    prevUrlsRef.current = [];
    dispatch({ type: "CLEAR_ALL" });
    setShowPostDialog(false);
  }, [revoke, setShowPostDialog]);

  const handleCancel = useCallback(() => {
    if (hasContent) {
      setShowExitConfirm(true);
    } else {
      cleanupAndClose();
    }
  }, [hasContent, cleanupAndClose]);

  const handleDialogChange = useCallback(
    (open: boolean) => {
      if (!open && hasContent) {
        setShowExitConfirm(true);
      } else if (!open) {
        cleanupAndClose();
      }
    },
    [hasContent, cleanupAndClose]
  );

  const handleConfirmExit = useCallback(() => {
    setShowExitConfirm(false);
    cleanupAndClose();
  }, [cleanupAndClose]);

  const handleAddHashtag = useCallback(() => {
    const tag = state.currentHashtag.trim().replace(/^#/, "");

    if (!tag) return;

    const isExisting = allHashtags.some(
      (h) => h.toLowerCase() === tag.toLowerCase()
    );

    if (!isExisting) {
      createHashtag.mutate({
        createHashtagDto: {
          hashtagName: tag,
        },
      });
    }

    dispatch({ type: "ADD_HASHTAG", payload: tag });

    hashtagInputRef.current?.focus();
  }, [state.currentHashtag, createHashtag, allHashtags]);

  const handleHashtagKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddHashtag();
      }
    },
    [handleAddHashtag]
  );

  const handleInsertHashtags = useCallback(() => {
    if (state.hashtags.length > 0) {
      const newContent = state.postContent;
      dispatch({ type: "SET_CONTENT", payload: newContent });
    }
    dispatch({ type: "SET_HASHTAG_POPOVER", payload: false });
    textareaRef.current?.focus();
  }, [state.hashtags, state.postContent]);

  useEffect(() => {
    return () => {
      prevUrlsRef.current.forEach(revoke);
    };
  }, [revoke]);

  const functionButton = useMemo(
    () => [
      {
        id: 1,
        name: "image",
        icon: <Image size={20} className="text-gray-600" />,
        onClick: handleOpenFile,
      },
      {
        id: 2,
        name: "emoji",
        icon: <Smile size={20} className="text-gray-600" />,
        onClick: () => dispatch({ type: "TOGGLE_EMOJI" }),
      },
      {
        id: 3,
        name: "hash",
        icon: <Hash size={20} className="text-gray-600" />,
        onClick: () => dispatch({ type: "SET_HASHTAG_POPOVER", payload: true }),
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
    ],
    [handleOpenFile, toast]
  );

  const handlePost = useCallback(() => {
    const content = state.postContent.trim();
    if (!content && state.uploadedFiles.length === 0) {
      toast.error("Please add some text or an image.");
      return;
    }

    const activeOption = ReplyOptions.find((r) => r.name === state.isActive);
    const replyPolicyName = activeOption?.replyPolicyName || "ANYONE";

    const createPostDto = {
      content,
      replyPolicy: replyPolicyName,
      reviewApprove: state.reviewApprove,
      hashtags: Array.isArray(state.hashtags)
        ? state.hashtags.map((h) => h.trim()).filter(Boolean)
        : [],
    };

    createPost.mutate(
      {
        createPostDto,
        images:
          state.uploadedFiles.length > 0 ? state.uploadedFiles : undefined,
      },
      {
        onSuccess: () => {
          cleanupAndClose();
        },
        onError: (err: any) => {
          console.error("Create post failed:", err);
        },
      }
    );
  }, [
    state.postContent,
    state.uploadedFiles,
    state.isActive,
    state.reviewApprove,
    createPost,
    cleanupAndClose,
    toast,
  ]);

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

      <Dialog open={showPostDialog} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-xl p-0">
          <DialogHeader className="border-b px-4 py-3">
            <DialogTitle>
              <div className="flex items-center justify-between">
                <button
                  onClick={handleCancel}
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
                <div className="flex gap-x-1 items-center mb-2">
                  <span className="font-semibold text-gray-900">
                    {user?.data?.username || "lunez195"}
                  </span>
                  <ChevronRight size={18} className="text-gray-400" />
                  <input
                    type="text"
                    name="topic"
                    id="add-to-topic"
                    className="text-sm p-2 focus:outline-none"
                    placeholder="Add a topic"
                  />
                </div>

                <textarea
                  ref={textareaRef}
                  value={state.postContent}
                  onChange={(e) =>
                    dispatch({ type: "SET_CONTENT", payload: e.target.value })
                  }
                  placeholder="What's new?"
                  className="w-full resize-none border-none outline-none text-gray-900 placeholder-gray-400 text-base"
                  maxLength={5000}
                  rows={4}
                />

                {/* Hashtags Display Section */}
                {state.hashtags.length > 0 && (
                  <div>
                    {state.hashtags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-gray-700 rounded-full text-sm"
                      >
                        #{tag}
                        <button
                          onClick={() =>
                            dispatch({
                              type: "REMOVE_HASHTAG",
                              payload: index,
                            })
                          }
                          className="hover:bg-blue-100 rounded-full p-0.5 transition-colors cursor-pointer ml-0.5"
                          aria-label={`Remove ${tag}`}
                        >
                          <svg
                            className="w-3 h-3"
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
                      </span>
                    ))}
                  </div>
                )}

                <div className="text-right mt-1">
                  <span
                    className={`text-xs ${
                      state.postContent.length > 4500
                        ? "text-red-500 font-semibold"
                        : state.postContent.length > 4000
                        ? "text-orange-500"
                        : "text-gray-400"
                    }`}
                  >
                    {state.postContent.length} / 5000
                  </span>
                </div>

                {state.uploadedImages.length > 0 && (
                  <Carousel
                    opts={{ align: "start" }}
                    className="w-full max-w-sm"
                  >
                    <CarouselContent>
                      {state.uploadedImages.map((imageUrl, index) => (
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

                  {state.showEmojiPicker && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => dispatch({ type: "TOGGLE_EMOJI" })}
                      />
                      <div className="absolute bottom-full left-0 mb-2 z-20">
                        <EmojiPicker
                          onEmojiClick={handleEmojiClick}
                          width={350}
                          height={400}
                          searchDisabled={false}
                          skinTonesDisabled={false}
                          previewConfig={{ showPreview: false }}
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
            <Popover
              open={state.isPopoverOpen}
              onOpenChange={(v) =>
                dispatch({ type: "SET_POPOVER", payload: v })
              }
            >
              <PopoverTrigger asChild>
                <button
                  className={`text-gray-600 text-sm cursor-pointer inline-flex items-center gap-x-3 hover:text-gray-900 transition-colors ${
                    state.reviewApprove && "font-bold"
                  }`}
                >
                  <SlidersVertical size={15} />
                  <span>Reply options</span>
                </button>
              </PopoverTrigger>

              <PopoverContent
                className="w-72 p-0 rounded-2xl bg-white shadow-lg border border-gray-200"
                side="bottom"
                align="start"
                sideOffset={8}
              >
                <div role="menu" aria-label="Reply options" className="p-4">
                  <div className="mb-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Who can reply and quote
                    </span>
                  </div>

                  <ul className="space-y-1">
                    {ReplyOptions.map((rp) => (
                      <li key={rp.id}>
                        <button
                          role="menuitem"
                          type="button"
                          onClick={() => {
                            dispatch({ type: "SET_ACTIVE", payload: rp.name });
                            dispatch({ type: "SET_POPOVER", payload: false });
                          }}
                          className="w-full text-left px-3 py-2.5 transition-colors hover:bg-gray-50 cursor-pointer rounded-lg group"
                        >
                          <div className="flex justify-between items-center gap-x-3">
                            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                              {rp.displayName}
                            </span>
                            {state.isActive === rp.name && <Check size={18} />}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between w-full px-3 py-2.5 transition-all hover:bg-gray-50 cursor-pointer rounded-lg group active:scale-95">
                      <Label
                        htmlFor="review-approve"
                        className="text-sm font-medium text-gray-700 group-hover:text-gray-900 cursor-pointer"
                      >
                        Review and approve replies
                      </Label>
                      <Switch
                        id="review-approve"
                        checked={state.reviewApprove}
                        onCheckedChange={(v: boolean) =>
                          dispatch({ type: "SET_REVIEW", payload: v })
                        }
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <button
              onClick={handlePost}
              disabled={
                isCreating ||
                (!state.postContent.trim() && state.uploadedFiles.length === 0)
              }
              className="cursor-pointer border px-6 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-gray-400 hover:text-gray-600"
            >
              {isCreating ? "Posting..." : "Post"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hashtag Dialog */}
      <HashtagDialog
        allHashtags={allHashtags}
        isOpen={state.isHashtagOpen}
        onOpenChange={(open) =>
          dispatch({ type: "SET_HASHTAG_POPOVER", payload: open })
        }
        currentHashtag={state.currentHashtag}
        hashtags={state.hashtags}
        hashtagInputRef={hashtagInputRef}
        onCurrentHashtagChange={(value) =>
          dispatch({ type: "SET_CURRENT_HASHTAG", payload: value })
        }
        onAddHashtag={handleAddHashtag}
        onRemoveHashtag={(index) =>
          dispatch({ type: "REMOVE_HASHTAG", payload: index })
        }
        onInsertHashtags={handleInsertHashtags}
        onHashtagKeyDown={handleHashtagKeyDown}
      />
      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard thread?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard this
              thread?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmExit}
              className="bg-red-600 hover:bg-red-700"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
