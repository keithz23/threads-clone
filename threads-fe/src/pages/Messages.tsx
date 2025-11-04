import { SearchIcon, Send, SquarePen } from "lucide-react";

export default function Messages() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Messages Content */}
      <div className="flex-1 ">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 w-full mx-auto h-full">
          {/* Sidebar  */}
          <div className="md:col-span-1 border-r">
            {/* Name & New conversation button */}
            <div className="flex items-center justify-between p-4">
              <span className="text-gray-900 font-bold">lunez195</span>
              <span className="cursor-pointer hover:opacity-70">
                <SquarePen />
              </span>
            </div>
            {/* Search */}
            <div className="p-3">
              <div className="border rounded-xl bg-gray-50 px-5 py-3">
                <div className="flex items-center gap-2">
                  {/* Icon */}
                  <SearchIcon className="text-gray-400" />
                  <input
                    type="text"
                    className="focus:outline-none w-full"
                    placeholder="Search"
                  />
                </div>
              </div>
            </div>
            {/* Conversation */}
          </div>

          {/* Main area */}
          <div className="md:col-span-2 hidden md:block">
            <div className="flex flex-col items-center justify-center h-screen">
              <div className="flex flex-col justify-center">
                <div className="border rounded-full p-5">
                  <Send />
                </div>
                <span className="text-md">
                  Your messages
                  <p className="text-xs">Send a message to start a chat</p>
                </span>
                btn.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
