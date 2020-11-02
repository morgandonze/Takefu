export interface Card {
  id: string;
  content: string;
  level: number;
  index: number;
  parent: Card | null;
  children: Card[];
}
