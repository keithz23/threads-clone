import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import AvatarPopover from "./AvatarPopover";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { InterestsScreen } from "./screens/InterestsScreen";
import BioScreen from "./screens/BioScreen";
import LinksScreen from "./screens/LinkScreen";
import { useScreen } from "@/hooks/useScreen";

type Privacy = "private" | "public";

type FormData = {
  bio: string;
  interests: string[];
  link: string;
  linkTitle: string;
  isPrivate: boolean;
};

type EditProfileProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  name?: string;
  handle?: string;
  bio?: string;
  interests?: string[];
  website?: string;
  link: string;
  linkTitle?: string;
  isPrivate?: boolean;
  privacy?: Privacy;

  onSave?(payload: {
    name: string;
    handle: string;
    bio: string;
    interests: string[];
    website: string;
    link: string;
    linkTitle: string;
    isPrivate: boolean;
    privacy?: Privacy;
  }): void;
  onEditInterests?(interests: string[]): void;
};

export default function EditProfile({
  open,
  setOpen,
  name: nameProp = "lunez",
  handle: handleProp = "lunez195",
  bio: bioProp = "",
  interests: interestsProp = ["music", "coding", "testing", "learning"],
  website = "",
  link: linkProp = "",
  linkTitle: linkTitleProp = "",
  isPrivate: isPrivateProp,
  privacy: privacyProp = "private",
  onSave,
}: EditProfileProps) {
  // Local states
  const [name] = useState(nameProp);
  const [handle] = useState(handleProp);
  const { screen, direction, go, reset } = useScreen();

  const [isPrivate, setIsPrivate] = useState<boolean>(
    typeof isPrivateProp === "boolean"
      ? isPrivateProp
      : privacyProp === "private"
  );

  const prefersReduced = useReducedMotion();

  // React Hook Form
  const methods = useForm<FormData>({
    defaultValues: {
      bio: bioProp,
      interests: interestsProp,
      link: linkProp,
      linkTitle: linkTitleProp,
      isPrivate: isPrivateProp,
    },
  });

  const { handleSubmit, watch, reset: resetForm } = methods;

  // Watch values for display
  const bioVal = watch("bio");
  const interestsVal = watch("interests");
  const linkVal = watch("link");

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        reset();
      }, 120);
      return () => clearTimeout(t);
    }
  }, [open, reset]);

  // Reset form when dialog opens with new values
  useEffect(() => {
    if (open) {
      resetForm({
        bio: bioProp,
        interests: interestsProp,
        link: linkProp,
        linkTitle: linkTitleProp,
      });
    }
  }, [open, bioProp, interestsProp, linkProp, linkTitleProp, resetForm]);

  const saveAndClose = handleSubmit((data) => {
    onSave?.({
      name: name.trim(),
      handle: handle.trim(),
      bio: data.bio.trim(),
      interests: data.interests,
      website: website?.trim?.() ?? "",
      link: data.link.trim(),
      linkTitle: data.linkTitle.trim(),
      isPrivate,
    });
    go("main");
  });

  // Variants slide
  const variants = {
    enter: (dir: 1 | -1) => ({ x: dir * 64, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: 1 | -1) => ({ x: dir * -64, opacity: 0 }),
  };

  const sharedTransition = prefersReduced
    ? { duration: 0 }
    : ({ type: "spring", stiffness: 800, damping: 50, mass: 0.7 } as const);

  const renderHeaderTitle = () => {
    if (screen === "main") return "";
    const label =
      screen === "bio"
        ? "Edit bio"
        : screen === "interests"
        ? "Interests"
        : screen === "links"
        ? "Links"
        : screen === "add"
        ? "Add link"
        : screen === "edit"
        ? "Edit link"
        : "";

    return (
      <div className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-gray-500 px-2 pb-2 min-h-12">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            screen === "add" || screen === "edit" ? go("links") : go("main")
          }
          className="justify-self-start cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <span className="text-base font-bold text-center">{label}</span>

        {screen === "bio" ||
        screen === "add" ||
        screen === "edit" ||
        screen === "interests" ? (
          <button
            className="justify-self-end text-sm cursor-pointer"
            type="button"
            onClick={saveAndClose}
          >
            <span>Done</span>
          </button>
        ) : (
          <span className="justify-self-end" aria-hidden />
        )}
      </div>
    );
  };

  const MainScreen = () => (
    <div className="flex flex-col gap-0">
      {/* Header row - Name */}
      <div className="px-5 flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-base font-semibold text-gray-900 mb-3">Name</div>
          <div className="flex items-center gap-3 text-gray-700">
            <Lock className="size-5 shrink-0" aria-hidden />
            <span className="truncate text-base">
              {name} <span className="text-gray-500">(@{handle})</span>
            </span>
          </div>
        </div>
        <AvatarPopover />
      </div>

      <div className="px-6 py-4">
        <Separator />
      </div>

      {/* Bio */}
      <button
        className="w-full text-left px-6 py-5 hover:bg-gray-50 transition cursor-pointer"
        onClick={() => go("bio")}
        aria-label="Edit bio"
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-4">
            <div className="text-base font-semibold text-gray-900 mb-1">
              Bio
            </div>
            <div className="text-base text-gray-500">
              {bioVal
                ? `${bioVal.slice(0, 60)}${bioVal.length > 60 ? "…" : ""}`
                : "+ Write bio"}
            </div>
          </div>
          <ChevronRight className="size-5 text-gray-400 shrink-0" aria-hidden />
        </div>
      </button>

      <div className="px-6">
        <Separator />
      </div>

      {/* Interests */}
      <button
        type="button"
        className="w-full text-left px-6 py-5 hover:bg-gray-50 transition cursor-pointer"
        onClick={() => go("interests")}
        aria-label="Edit interests"
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-4">
            <div className="text-base font-semibold text-gray-900 mb-1">
              Interests
            </div>
            <div className="text-base text-gray-500">
              {interestsVal.length ? interestsVal.join(", ") : "Add interests"}
            </div>
          </div>
          <ChevronRight className="size-5 text-gray-400 shrink-0" aria-hidden />
        </div>
      </button>

      <div className="px-6">
        <Separator />
      </div>

      {/* Links */}
      <button
        type="button"
        className="w-full text-left px-6 py-5 hover:bg-gray-50 transition cursor-pointer"
        onClick={() => go("links")}
        aria-label="Edit links"
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-4">
            <div className="text-base font-semibold text-gray-900 mb-1">
              Links
            </div>
            <div className="text-base text-gray-500">
              {linkVal ? linkVal : "Add website"}
            </div>
          </div>
          <ChevronRight className="size-5 text-gray-400 shrink-0" aria-hidden />
        </div>
      </button>

      <div className="px-6">
        <Separator />
      </div>

      {/* Profile privacy (uses isPrivate boolean) */}
      <button
        type="button"
        className="w-full text-left px-6 py-5 hover:bg-gray-50 transition cursor-pointer"
        onClick={() => setIsPrivate((p) => !p)}
        aria-label="Toggle profile privacy"
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-4">
            <div className="text-base font-semibold text-gray-900 mb-1">
              Profile privacy
            </div>
            <div className="text-sm text-gray-500">
              If you switch to public, anyone can see your threads and replies.
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-base text-gray-500 capitalize">
              {isPrivate ? "private" : "public"}
            </span>
            <ChevronRight className="size-5 text-gray-400" aria-hidden />
          </div>
        </div>
      </button>

      {/* Done */}
      <div className="p-6">
        <Button
          className="w-full py-6 text-base cursor-pointer"
          type="button"
          onClick={saveAndClose}
          aria-label="Save profile changes"
        >
          Done
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-3xl p-0 overflow-hidden"
        aria-label="Edit profile dialog"
      >
        <DialogDescription />
        <DialogHeader>
          <DialogTitle className="text-lg">{renderHeaderTitle()}</DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <div className="relative overflow-hidden max-h-[80vh]">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              {screen === "main" ? (
                <motion.div
                  key="main"
                  custom={direction}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  variants={variants}
                  transition={sharedTransition}
                >
                  <MainScreen />
                </motion.div>
              ) : screen === "bio" ? (
                <motion.div
                  key="bio"
                  custom={direction}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  variants={variants}
                  transition={sharedTransition}
                >
                  <BioScreen />
                </motion.div>
              ) : screen === "interests" ? (
                <motion.div
                  key="interests"
                  custom={direction}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  variants={variants}
                  transition={sharedTransition}
                >
                  <InterestsScreen />
                </motion.div>
              ) : (
                <motion.div
                  key="links"
                  custom={direction}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  variants={variants}
                  transition={sharedTransition}
                >
                  <LinksScreen />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
