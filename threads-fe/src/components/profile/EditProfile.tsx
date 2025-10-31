import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import AvatarPopover from "./AvatarPopover";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { InterestsScreen } from "./screens/InterestsScreen";
import { BioScreen } from "./screens/BioScreen";
import { LinksScreen } from "./screens/LinkScreen";

type Privacy = "private" | "public";
type Screen = "main" | "bio" | "interests" | "links";

type EditProfileProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  name?: string;
  handle?: string;
  bio?: string;
  interests?: string[];
  website?: string;
  showInstagramBadge?: boolean;
  privacy?: Privacy;
  onSave?(payload: {
    name: string;
    handle: string;
    bio: string;
    interests: string[];
    website: string;
    showInstagramBadge: boolean;
    privacy: Privacy;
  }): void;
  onEditInterests?(): void;
  onEditLinks?(): void;
};

export default function EditProfile({
  open,
  setOpen,
  name: nameProp = "lunez",
  handle: handleProp = "lunez195",
  bio: bioProp = "",
  interests: interestsProp = ["music", "coding", "testing", "learning"],
  website: websiteProp = "",
  showInstagramBadge: showInstagramBadgeProp = false,
  privacy: privacyProp = "private",
  onSave,
}: EditProfileProps) {
  // Local states
  const [name] = useState(nameProp);
  const [handle] = useState(handleProp);

  const [bioVal, setBioVal] = useState(bioProp);
  const [interestsVal, setInterestsVal] = useState<string[]>(interestsProp);
  const [websiteVal, setWebsiteVal] = useState(websiteProp);
  const [igBadge, setIgBadge] = useState(showInstagramBadgeProp);
  const [privacyVal, setPrivacyVal] = useState<Privacy>(privacyProp);

  // Sliding screens
  const [screen, setScreen] = useState<Screen>("main");
  const [direction, setDirection] = useState<1 | -1>(1);
  const prefersReduced = useReducedMotion();

  const go = (next: Screen) => {
    const order: Screen[] = ["main", "bio", "interests", "links"];
    const curIdx = order.indexOf(screen);
    const nextIdx = order.indexOf(next);
    setDirection(nextIdx > curIdx ? 1 : -1);
    setScreen(next);
  };

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setScreen("main");
        setDirection(1);
      }, 120);
      return () => clearTimeout(t);
    }
  }, [open]);

  const saveAndClose = () => {
    onSave?.({
      name: name.trim(),
      handle: handle.trim(),
      bio: bioVal.trim(),
      interests: interestsVal,
      website: websiteVal.trim(),
      showInstagramBadge: igBadge,
      privacy: privacyVal,
    });
    setOpen(false);
  };

  // Variants slide
  const variants = {
    enter: (dir: 1 | -1) => ({ x: dir * 64, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: 1 | -1) => ({ x: dir * -64, opacity: 0 }),
  };

  const sharedTransition = prefersReduced
    ? { duration: 0 }
    : ({ type: "spring", stiffness: 800, damping: 45, mass: 0.7 } as const);

  const renderHeaderTitle = () => {
    if (screen === "main") return "";
    const label =
      screen === "bio" ? "Bio" : screen === "interests" ? "Interests" : "Links";

    return (
      <div className="grid grid-cols-[auto_1fr_auto] items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => go("main")}
          className="cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <span className="justify-self-center text-base font-medium">
          {label}
        </span>
        {screen === "bio" ? (
          <button
            className="text-sm cursor-pointer"
            type="button"
            onClick={() => go("main")}
          >
            <span>Done</span>
          </button>
        ) : (
          <div className="h-10 w-10" aria-hidden />
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
                : "Write bio"}
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
              {websiteVal ? websiteVal : "Add website"}
            </div>
          </div>
          <ChevronRight className="size-5 text-gray-400 shrink-0" aria-hidden />
        </div>
      </button>

      <div className="px-6">
        <Separator />
      </div>

      {/* Instagram badge toggle */}
      <div className="px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-base font-semibold text-gray-900 mb-1">
              Show Instagram badge
            </div>
            <div className="text-sm text-gray-500">
              When turned on, the Threads badge on your Instagram profile will
              also appear.
            </div>
          </div>
          <Switch
            className="cursor-pointer"
            checked={igBadge}
            onCheckedChange={(v) => setIgBadge(v)}
            aria-label="Show Instagram badge"
          />
        </div>
      </div>

      <div className="px-6">
        <Separator />
      </div>

      {/* Profile privacy */}
      <button
        type="button"
        className="w-full text-left px-6 py-5 hover:bg-gray-50 transition cursor-pointer"
        onClick={() =>
          setPrivacyVal((p) => (p === "private" ? "public" : "private"))
        }
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
              {privacyVal}
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
        <DialogHeader className="px-5">
          <DialogTitle className="text-lg">{renderHeaderTitle()}</DialogTitle>
        </DialogHeader>

        {/* Container với overflow auto */}
        <div className="relative overflow-y-auto max-h-[80vh]">
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
                <BioScreen bioVal={bioVal} setBioVal={setBioVal} go={go} />
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
                <InterestsScreen
                  interestsVal={interestsVal}
                  setInterestsVal={setInterestsVal}
                  go={go}
                />
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
                <LinksScreen
                  websiteVal={websiteVal}
                  setWebsiteVal={setWebsiteVal}
                  go={go}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
