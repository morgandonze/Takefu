import { makeObservable, observable } from "mobx";
import { Card } from "../models/Card";
import CardStore from "./CardStore";

export default class UIStore {
  editingId: string | null = null;
  focusedId: string | null = null;

  constructor() {
    makeObservable(this, {
      editingId: observable,
      focusedId: observable,
    });
  }

  relatedToFocused(cardId: string, cardStore: CardStore): boolean {
    const card: Card | null = cardStore.getCard(cardId);
    const focused: Card | null = cardStore.getCard(this.focusedId);
    console.log(focused, card);
    return (
      this.descendsFrom(card, focused, cardStore) ||
      this.descendsFrom(focused, card, cardStore)
    );
  }

  descendsFrom(
    cardA: Card | null,
    cardB: Card | null,
    cardStore: CardStore
  ): boolean {
    const cardAParent = cardStore.getCard(cardA?.parentId as string);
    if (!cardA || !cardB || !cardAParent) {
      return false;
    } else if (cardB.id == cardAParent.id) {
      return true;
    } else {
      return this.descendsFrom(cardAParent, cardB, cardStore);
    }
  }
}
