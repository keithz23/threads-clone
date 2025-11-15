import { useScreen } from "@/hooks/useScreen";
import getFavicon from "@/utils/getFavicon";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link as LinkIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { AddScreen, EditScreen } from "./sub-screens/SubScreens";

export default function LinksScreen() {
  const { screen, direction, go } = useScreen();
  const prefersReduced = useReducedMotion();
  const [favicon, setFavicon] = useState<string | null>(null);

  // Access form context
  const { register, watch, setValue } = useFormContext();

  // Watch values
  const linkVal = watch("link");
  const titleVal = watch("linkTitle");

  const handleFetchFavicon = async () => {
    if (!linkVal) {
      setFavicon(null);
      return;
    }
    try {
      const icon = await getFavicon(linkVal);
      setFavicon(icon || null);
    } catch {
      setFavicon(null);
    }
  };

  const handleRemoveLink = () => {
    setValue("link", "");
    setValue("linkTitle", "");
    setFavicon(null);
    go("links");
  };

  type Dir = -1 | 0 | 1;
  const variants = {
    enter: (dir: Dir) => ({
      x: dir === 0 ? 0 : dir * 64,
      opacity: dir === 0 ? 1 : 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: Dir) => ({
      x: dir === 0 ? 0 : dir * -64,
      opacity: dir === 0 ? 1 : 0,
    }),
  };

  const sharedTransition = prefersReduced
    ? { duration: 0 }
    : ({ type: "spring", stiffness: 800, damping: 50, mass: 0.7 } as const);

  const hostLabel = useMemo(() => {
    try {
      return new URL(linkVal).hostname;
    } catch {
      return linkVal;
    }
  }, [linkVal]);

  const MainScreen = () => (
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

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        {screen === "links" ? (
          <motion.div
            key="links"
            custom={direction}
            initial="enter"
            animate="center"
            exit="exit"
            variants={variants}
            transition={sharedTransition}
          >
            <MainScreen />
          </motion.div>
        ) : screen === "add" ? (
          <motion.div
            key="add"
            custom={direction}
            initial="enter"
            animate="center"
            exit="exit"
            variants={variants}
            transition={sharedTransition}
          >
            <AddScreen
              register={register}
              handleFetchFavicon={handleFetchFavicon}
              handleRemoveLink={handleRemoveLink}
            />
          </motion.div>
        ) : (
          <motion.div
            key="edit"
            custom={direction}
            initial="enter"
            animate="center"
            exit="exit"
            variants={variants}
            transition={sharedTransition}
          >
            <EditScreen
              register={register}
              handleFetchFavicon={handleFetchFavicon}
              handleRemoveLink={handleRemoveLink}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
