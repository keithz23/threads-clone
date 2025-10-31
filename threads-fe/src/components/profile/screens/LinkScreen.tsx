import { Input } from "@/components/ui/input";
type LinksScreenProps = {
  websiteVal: string;
  setWebsiteVal: React.Dispatch<React.SetStateAction<string>>;
  go: (screen: "main" | "bio" | "interests" | "links") => void;
};
export const LinksScreen = ({
  websiteVal,
  setWebsiteVal,
}: LinksScreenProps) => (
  <div className="flex flex-col gap-5 p-6 overflow-hidden">
    <label className="text-base font-semibold text-gray-900">Website</label>
    <Input
      placeholder="https://example.com"
      value={websiteVal}
      onChange={(e) => setWebsiteVal(e.target.value)}
      className="text-base h-12"
    />
  </div>
);
