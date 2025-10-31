import { Textarea } from "@/components/ui/textarea";
type BioScreenProps = {
  bioVal: string;
  setBioVal: React.Dispatch<React.SetStateAction<string>>;
  go: (screen: "main" | "bio" | "interests" | "links") => void;
};
export const BioScreen = ({ bioVal, setBioVal }: BioScreenProps) => (
  <div className="flex flex-col gap-5 p-6 overflow-hidden">
    <label className="text-base font-semibold text-gray-900">Bio</label>
    <Textarea
      value={bioVal}
      onChange={(e) => setBioVal(e.target.value)}
      placeholder="Write something about you…"
      className="min-h-32 text-base"
    />
  </div>
);
