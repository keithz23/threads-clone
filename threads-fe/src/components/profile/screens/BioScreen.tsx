import { useFormContext } from "react-hook-form";

export default function BioScreen() {
  const { register } = useFormContext();

  return (
    <div className="flex flex-col gap-5 p-6 overflow-hidden">
      <textarea
        {...register("bio")}
        className="focus:outline-none h-32 text-base resize-none"
        placeholder="Write a bio..."
      />
    </div>
  );
}
