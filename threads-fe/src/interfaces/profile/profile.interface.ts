export interface GroupItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  dangerous?: boolean;
}

export interface Group {
  id: string;
  items: GroupItem[];
}
