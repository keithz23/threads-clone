import { Ellipsis, Heart, MessageCircle, Repeat, Send } from "lucide-react";

export default function Home() {
  const post_btn = [
    { id: 1, name: "heart", icon: <Heart size={18} />, count: 12 },
    {
      id: 2,
      name: "message",
      icon: <MessageCircle size={18} />,
      count: 23,
    },
    { id: 3, name: "repeat", icon: <Repeat size={18} />, count: 20 },
    { id: 4, name: "send", icon: <Send size={18} />, count: 30 },
  ];
  return (
    <div
      className="
            w-full md:w-1/2 flex-1 md:border border-gray-300
            md:pt-0 pt-[calc(5rem+env(safe-area-inset-top))]
            rounded-none md:rounded-3xl mx-auto
            h-full overflow-y-auto custom-scroll
          "
    >
      {Array.from({ length: 30 }).map((_, idx) => (
        <div
          key={idx}
          className="flex p-5 gap-x-3 border-b border-gray-200 w-full"
        >
          <div>
            <img
              src={`https://static.cdninstagram.com/rsrc.php/ye/r/lEu8iVizmNW.ico`}
              className="rounded-full w-10 h-10"
              alt=""
            />
          </div>
          <div className="flex-1">
            <ul className="space-y-2 px-2">
              <li className="font-medium">lichngaytot</li>
              <li className="text-justify">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore
                atque voluptates corporis ratione numquam dolores odio deleniti
                commodi facere minus qui id, ducimus blanditiis omnis quos,
                excepturi incidunt iure eius!
              </li>
              <li>
                <div className="flex gap-x-5">
                  {post_btn.map((post) => (
                    <div
                      key={post.id}
                      className="group cursor-pointer rounded-full transition-colors duration-150 p-2 hover:bg-gray-50 hover:shadow"
                    >
                      <span className="flex items-center justify-center text-gray-500 group-hover:text-black transition-colors duration-150">
                        {post.icon}
                        <span className="ml-1">{post.count}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </li>
            </ul>
          </div>
          <div className="group cursor-pointer rounded-full transition-colors duration-150 p-2 hover:bg-gray-50 hover:shadow h-8">
            <span className="text-gray-500 group-hover:text-black transition-colors duration-150">
              <Ellipsis size={15} />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
