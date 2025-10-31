import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
type BioScreenProps = {
  bioVal: string;
  setBioVal: React.Dispatch<React.SetStateAction<string>>;
  go: (screen: "main" | "bio" | "interests" | "links") => void;
};
export const BioScreen = ({ bioVal, setBioVal, go }: BioScreenProps) => (
  <div className="flex flex-col gap-5 px-6 pt-4 pb-6 overflow-hidden">
    <label className="text-base font-semibold text-gray-900">Bio</label>
    <Textarea
      value={bioVal}
      onChange={(e) => setBioVal(e.target.value)}
      placeholder="Write something about you…"
      className="min-h-32 text-base"
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
