export interface Card {
  id: string;
  content: string;
  level: number;
  index: number;
  parentId: string | null;
  children: Card[];
}
