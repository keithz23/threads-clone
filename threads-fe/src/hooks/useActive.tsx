import { useState } from "react";

export const useActive = (initialTab: string = "house") => {
  const [activeTab, setActiveTab] = useState(initialTab);

  return [activeTab, setActiveTab] as const;
};
