export interface GroupItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  dangerous?: boolean;
  onClick?: (e?: React.MouseEvent) => void;
}

export interface Group {
  id: string;
  items: GroupItem[];
}
