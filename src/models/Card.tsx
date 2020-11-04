export interface Card {
  id: string;
  content: string;
  level: number;
  order: number;
  parentId: string | null;
  children: Card[];
}
