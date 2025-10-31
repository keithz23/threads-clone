import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
type LinksScreenProps = {
  websiteVal: string;
  setWebsiteVal: React.Dispatch<React.SetStateAction<string>>;
  go: (screen: "main" | "bio" | "interests" | "links") => void;
};
export const LinksScreen = ({
  websiteVal,
  setWebsiteVal,
  go,
}: LinksScreenProps) => (
  <div className="flex flex-col gap-5 px-6 pt-4 pb-6 overflow-hidden">
    <label className="text-base font-semibold text-gray-900">Website</label>
    <Input
      placeholder="https://example.com"
      value={websiteVal}
      onChange={(e) => setWebsiteVal(e.target.value)}
      className="text-base h-12"
    />
    <div className="flex gap-3 justify-end">
      <Button
        variant="outline"
        onClick={() => go("main")}
        className="px-6 py-5 text-base"
      >
        Cancel
      </Button>
      <Button onClick={() => go("main")} className="px-6 py-5 text-base">
        Save
      </Button>
    </div>
  </div>
);
