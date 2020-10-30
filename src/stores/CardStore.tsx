import { makeObservable, observable, action } from "mobx";
import { Card } from "../../App";

export default class CardStore {
  cards: Card[] = [];
  constructor() {
    makeObservable(this, {
      cards: observable,
      getCards: action,
    });
  }

  getCards() {
    return this.cards;
  }

  addCard(content: string) {
    this.cards.push({ content, id: this.cards.slice().length });
  }
}
