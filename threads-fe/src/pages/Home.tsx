import Sidebar from "../components/Sidebar";

export default function Home() {
  return (
    <>
      <div className="grid grid-cols-3">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="col-span-1 h-screen flex flex-col">
          <div className="w-full p-4 flex-shrink-0">
            <div className="flex items-center justify-center">
              <span className="font-semibold text-xl">Home</span>
            </div>
          </div>
          <div className="w-full flex-1 border border-gray-300 rounded-2xl overflow-auto"></div>
        </div>

        {/* Rightsides */}
        <div className="flex justify-end items-center max-h-20 p-4">
          <button className="py-2 px-4 border rounded-xl bg-black cursor-pointer text-white fixed">
            Login
          </button>
        </div>
      </div>
    </>
  );
}
