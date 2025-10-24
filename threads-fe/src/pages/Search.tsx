import { SearchIcon, SlidersHorizontal } from "lucide-react";

export default function Search() {
  return (
    <div
      className="
            w-full md:w-1/2 flex-1 md:border border-gray-300
            md:pt-0 pt-[calc(5rem+env(safe-area-inset-top))]
            rounded-none md:rounded-3xl mx-auto
            h-full overflow-y-auto custom-scroll
          "
    >
      {/* Search input */}
      <div className="p-5">
        <div className="flex justify-between rounded-full p-3 border-2 border-gray-200 bg-gray-100">
          {/* Search Icon */}
          <SearchIcon className="text-gray-400" />

          {/* input */}
          <input
            type="text"
            className="focus:outline-none w-full px-2"
            placeholder="Search"
          />

          {/* Setting Icon */}
          <SlidersHorizontal className="text-gray-400" />
        </div>

        {/* Follow suggestions */}

        <div className="px-2 py-5">
          {/* Title */}
          <h3 className="text-gray-400">Follow suggestions</h3>

          {/* List */}
          {Array.from({ length: 15 }).map((_, idx) => (
            <div
              className="flex py-5 gap-x-1 border-b border-gray-200 w-full"
              key={idx}
            >
              <div>
                <img
                  src={`https://static.cdninstagram.com/rsrc.php/ye/r/lEu8iVizmNW.ico`}
                  className="rounded-full w-10 h-10"
                  alt=""
                />
              </div>
              <div className="flex-1">
                <ul className="px-2">
                  <li className="font-medium">rosesersie</li>
                  <li className="text-gray-400">ROSÉ</li>
                  <li className="text-justify my-2">
                    <span className="text-sm">
                      -fanstagram of @roses_are_rosie <br /> posting hd <br />
                      pics/fancams and more♡ Not impersonating anyone!
                    </span>
                  </li>
                  <li>
                    {/* Follower */}
                    <span className="text-gray-400">415K followers</span>
                  </li>
                </ul>
              </div>
              <div className="group cursor-pointer rounded-full transition-colors duration-150 hover:bg-gray-50 hover:shadow h-8">
                <span className="text-gray-500 group-hover:text-black transition-colors duration-150">
                  <button className="w-full px-8 py-1 border border-black rounded-xl bg-black text-white cursor-pointer">
                    Follow
                  </button>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
