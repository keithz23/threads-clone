import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  CircleEllipsis,
  Image,
  Search,
  Send,
  SendHorizonal,
  SmilePlus,
  SquarePen,
  Sticker,
} from "lucide-react";
import { useMemo, useRef, useState, useLayoutEffect } from "react";
import { useActive } from "@/hooks/useActive";

type Chat = {
  id: number;
  username: string;
  preview: string;
  time: string;
  avatar?: string;
};

type Msg = {
  id: string;
  from: "me" | "them";
  text: string;
  at: string;
};

export default function Messages() {
  const currentUser = "lunez195";
  const setActiveTab = useActive((s) => s.setActiveTab);

  const ChatPreviews: Chat[] = useMemo(
    () => [
      { id: 1, username: "lunez", preview: "Lorem ipsum....", time: "18h" },
      { id: 2, username: "john", preview: "Lorem ipsum....", time: "20h" },
      { id: 3, username: "micheal", preview: "Lorem ipsum....", time: "1d" },
      { id: 4, username: "marry", preview: "Lorem ipsum....", time: "20m" },
      { id: 5, username: "lukas", preview: "Lorem ipsum....", time: "10h" },
    ],
    []
  );

  const [activeChat, setActiveChat] = useState<Chat | null>(null);

  // Demo messages
  const [messagesByUser, setMessagesByUser] = useState<Record<string, Msg[]>>({
    lunez: [
      {
        id: "m1",
        from: "them",
        text: "Hey, bạn khoẻ không?",
        at: "2025-11-04T09:10:00",
      },
      {
        id: "m2",
        from: "me",
        text: "Khoẻ nè! Dạo này làm gì vậy?",
        at: "2025-11-04T09:12:00",
      },
      {
        id: "m3",
        from: "them",
        text: "Đang build UI with shadcn 😄",
        at: "2025-11-04T09:13:20",
      },
      {
        id: "m4",
        from: "me",
        text: "Nice! Gửi mình cái screenshot đi.",
        at: "2025-11-05T08:15:00",
      },
    ],
    john: [
      {
        id: "j1",
        from: "them",
        text: "Deadline dịch vụ search xong chưa?",
        at: "2025-11-03T13:02:00",
      },
      {
        id: "j2",
        from: "me",
        text: "Tối nay mình push PR.",
        at: "2025-11-03T22:00:00",
      },
    ],
    micheal: [
      {
        id: "c1",
        from: "them",
        text: "Let's pair at 3PM?",
        at: "2025-11-02T10:00:00",
      },
    ],
    marry: [
      {
        id: "d1",
        from: "them",
        text: "Can you review my branch?",
        at: "2025-11-05T08:45:00",
      },
    ],
    lukas: [
      {
        id: "e1",
        from: "me",
        text: "Send me the assets, pls.",
        at: "2025-11-01T11:23:00",
      },
      {
        id: "e2",
        from: "them",
        text: "Just emailed 👍",
        at: "2025-11-01T11:25:00",
      },
    ],
  });

  const [draft, setDraft] = useState("");
  const chatWrapRef = useRef<HTMLDivElement | null>(null);

  const initials = (name: string) =>
    name.trim().slice(0, 2).toUpperCase() || "??";

  const currentMsgs = activeChat
    ? messagesByUser[activeChat.username] ?? []
    : [];

  useLayoutEffect(() => {
    if (!chatWrapRef.current) return;
    chatWrapRef.current.scrollTop = chatWrapRef.current.scrollHeight;
  }, [activeChat, currentMsgs.length]);

  const groupByDate = (msgs: Msg[]) => {
    return msgs.reduce<Record<string, Msg[]>>((acc, m) => {
      const d = new Date(m.at);
      const key = d.toDateString();
      acc[key] = acc[key] || [];
      acc[key].push(m);
      return acc;
    }, {});
  };

  const handleSend = () => {
    const text = draft.trim();
    if (!text || !activeChat) return;
    const newMsg: Msg = {
      id: Math.random().toString(36).slice(2),
      from: "me",
      text,
      at: new Date().toISOString(),
    };
    setMessagesByUser((prev) => {
      const u = activeChat.username;
      const next = { ...prev };
      next[u] = [...(next[u] ?? []), newMsg];
      return next;
    });
    setDraft("");
    requestAnimationFrame(() => {
      if (chatWrapRef.current) {
        chatWrapRef.current.scrollTop = chatWrapRef.current.scrollHeight;
      }
    });
  };

  return (
    <div className="w-full overflow-hidden h-[100dvh] md:h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-4 h-full min-h-0">
        {/* Sidebar */}
        <div
          className={`md:col-span-1 border-r min-h-0 overflow-hidden flex-col ${
            activeChat ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 md:p-4 shrink-0">
            <button
              onClick={() => {
                setActiveTab("home");
              }}
            >
              <ChevronLeft className="block md:hidden" />
            </button>
            <span className="text-gray-900 font-bold">{currentUser}</span>
            <button
              type="button"
              className="h-11 w-11 grid place-items-center rounded-xl hover:bg-gray-100"
              aria-label="New message"
            >
              <SquarePen />
            </button>
          </div>

          {/* Search */}
          <div className="px-3 pb-2 shrink-0">
            <label className="border rounded-xl bg-gray-50 px-4 py-2.5 block">
              <div className="flex items-center gap-2">
                <Search className="text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  className="focus:outline-none w-full bg-transparent text-sm md:text-base"
                  placeholder="Search"
                  aria-label="Search conversations"
                />
              </div>
            </label>
          </div>

          {/* Notes  */}
          <div className="px-3 md:px-5 mt-1 md:mt-2 shrink-0">
            <div className="flex gap-x-3 overflow-x-auto pb-2 md:pb-3">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 flex flex-col items-center gap-2"
                >
                  <div className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-700 font-medium text-xs md:text-sm whitespace-nowrap">
                        {currentUser}
                      </span>
                      <div className="flex flex-col text-gray-400">
                        <ChevronUp className="h-3 w-3" />
                        <ChevronDown className="h-3 w-3 -mt-1.5" />
                      </div>
                    </div>
                  </div>

                  <button type="button" className="focus:outline-none">
                    <Avatar className="h-12 w-12 md:h-16 md:w-16 border-2 border-gray-200 bg-white">
                      <AvatarImage src={undefined} alt={currentUser} />
                      <AvatarFallback className="text-gray-500 uppercase font-medium">
                        {initials(currentUser)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Messages list */}
          <div className="p-3 pt-1 flex-1 min-h-0 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-900 font-semibold text-sm md:text-md">
                Messages
              </h3>
              <button
                type="button"
                className="text-gray-500 font-semibold text-xs hover:underline cursor-pointer"
              >
                Requests
              </button>
            </div>

            <div className="py-1 md:py-2">
              {ChatPreviews.map((chat) => {
                const isActive = activeChat?.id === chat.id;
                return (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => setActiveChat(chat)}
                    className={[
                      "w-full rounded-2xl px-3 py-2 text-left cursor-pointer transition-colors",
                      isActive ? "bg-gray-100" : "hover:bg-gray-100",
                    ].join(" ")}
                    aria-pressed={isActive}
                  >
                    <div className="grid grid-cols-[auto_1fr_auto] gap-3 items-center">
                      <Avatar className="h-11 w-11 md:h-12 md:w-12 border bg-white">
                        <AvatarImage
                          src={chat.avatar || undefined}
                          alt={chat.username}
                        />
                        <AvatarFallback className="text-gray-500 uppercase font-medium">
                          {initials(chat.username)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {chat.username}
                        </div>
                        <div className="text-xs md:text-sm text-gray-500 leading-5 truncate">
                          <span className="text-gray-500">You:</span>{" "}
                          {chat.preview}
                        </div>
                      </div>

                      <span className="text-[11px] md:text-xs text-gray-400 whitespace-nowrap self-start mt-1">
                        {chat.time}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div
          className={`md:col-span-2 min-h-0 min-w-0 ${
            activeChat ? "flex" : "hidden md:flex"
          }`}
        >
          {activeChat ? (
            <div className="relative w-full flex flex-col min-h-0 min-w-0">
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="flex items-center justify-between py-2 px-2 md:px-1">
                  <div className="flex items-center gap-2">
                    {/* Back button mobile */}
                    <button
                      type="button"
                      onClick={() => setActiveChat(null)}
                      className="md:hidden h-11 w-11 grid place-items-center rounded-xl hover:bg-gray-100"
                      aria-label="Back to messages"
                    >
                      <ChevronLeft size={22} />
                    </button>

                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10 md:h-12 md:w-12 border bg-white">
                        <AvatarImage
                          src={activeChat.avatar || undefined}
                          alt={activeChat.username}
                        />
                        <AvatarFallback className="text-gray-500 uppercase font-medium">
                          {initials(activeChat.username)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-900 truncate">
                        {activeChat.username}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="h-11 w-11 grid place-items-center rounded-xl hover:bg-gray-100"
                    aria-label="More options"
                  >
                    <CircleEllipsis size={22} />
                  </button>
                </div>
                <Separator />
              </div>

              {/* Messages content*/}
              <div
                ref={chatWrapRef}
                className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 overscroll-contain"
                style={{ scrollBehavior: "smooth", paddingBottom: "6rem" }}
              >
                {Object.entries(groupByDate(currentMsgs)).map(
                  ([dateKey, msgs]) => (
                    <div key={dateKey} className="space-y-3">
                      {/* Date separator */}
                      <div className="flex items-center gap-3">
                        <div className="h-px bg-gray-200 flex-1" />
                        <span className="text-[11px] md:text-xs text-gray-500 whitespace-nowrap">
                          {new Date(dateKey).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <div className="h-px bg-gray-200 flex-1" />
                      </div>

                      {/* Bubbles */}
                      {msgs.map((m) => {
                        const isMe = m.from === "me";
                        return (
                          <div
                            key={m.id}
                            className={[
                              "flex w-full",
                              isMe ? "justify-end" : "justify-start",
                            ].join(" ")}
                          >
                            <div
                              className={[
                                "max-w-[85%] md:max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-6 shadow-sm",
                                "break-words whitespace-pre-wrap overflow-hidden",
                                isMe
                                  ? "bg-black text-white rounded-br-md"
                                  : "bg-gray-100 text-gray-900 rounded-bl-md",
                              ].join(" ")}
                              title={new Date(m.at).toLocaleString()}
                            >
                              {m.text}
                              <div
                                className={[
                                  "mt-1 text-[10px]",
                                  isMe ? "text-gray-300" : "text-gray-500",
                                ].join(" ")}
                              >
                                {new Date(m.at).toLocaleTimeString(undefined, {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                {isMe ? " • Seen" : ""}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </div>

              {/* Composer */}
              <div
                className="md:static md:bottom-auto md:left-auto md:right-auto md:w-auto fixed bottom-0 left-0 right-0 z-20 border-t bg-white"
                style={{
                  paddingBottom: "max(env(safe-area-inset-bottom), 0px)",
                }}
              >
                <div className="p-2 md:p-3">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    {/* Left controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        aria-label="Open emoji"
                        className="h-11 w-11 grid place-items-center rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                      >
                        <SmilePlus className="h-5 w-5" />
                      </button>

                      {/* Image upload */}
                      <label
                        htmlFor="chat-image-upload"
                        aria-label="Attach image"
                        className="h-11 w-11 grid place-items-center rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer"
                      >
                        <Image className="h-5 w-5" />
                      </label>
                      <input
                        id="chat-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file || !activeChat) return;
                          const newMsg = {
                            id: Math.random().toString(36).slice(2),
                            from: "me" as const,
                            text: `[attached: ${file.name}]`,
                            at: new Date().toISOString(),
                          };
                          setMessagesByUser((prev) => {
                            const u = activeChat.username;
                            const next = { ...prev };
                            next[u] = [...(next[u] ?? []), newMsg];
                            return next;
                          });
                          e.currentTarget.value = "";
                          requestAnimationFrame(() => {
                            if (chatWrapRef.current) {
                              chatWrapRef.current.scrollTop =
                                chatWrapRef.current.scrollHeight;
                            }
                          });
                        }}
                      />

                      <button
                        type="button"
                        aria-label="Open stickers"
                        className="h-11 w-11 grid place-items-center rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                      >
                        <Sticker className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Text input */}
                    <input
                      type="text"
                      placeholder={
                        activeChat
                          ? `Message @${activeChat.username}`
                          : "Message"
                      }
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      className="flex-1 min-w-0 border rounded-xl px-3 h-11 focus:outline-none focus:ring-2 focus:ring-gray-200 text-[15px]"
                      inputMode="text"
                      autoComplete="off"
                      autoCorrect="on"
                      spellCheck
                    />

                    {/* Send */}
                    <button
                      type="button"
                      onClick={handleSend}
                      aria-label="Send message"
                      className="h-11 w-11 grid place-items-center rounded-xl bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-60 shrink-0"
                      disabled={!draft.trim()}
                    >
                      <SendHorizonal className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Empty state
            <div className="flex flex-col items-center justify-center w-full h-full px-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="border border-gray-200 rounded-full p-5">
                  <Send className="h-6 w-6 text-gray-600" />
                </div>
                <div className="text-base md:text-lg font-medium">
                  Your messages
                </div>
                <p className="text-sm text-gray-500">
                  Send a message to start a chat
                </p>
                <button
                  type="button"
                  className="px-5 py-3 rounded-xl bg-black text-white hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Send message
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
