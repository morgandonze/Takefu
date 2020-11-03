import AsyncStorage from "@react-native-community/async-storage";
import { makeObservable, observable, action, computed } from "mobx";
import { Card } from "../models/Card";
import { v4 as uuid } from "uuid";

export default class CardStore {
  cards: Card[] = [];
  editingId: number | null = null;
  focused: Card | null = null;

  constructor() {
    makeObservable(this, {
      cards: observable,
      editingId: observable,
      focused: observable,
      loadCards: action,
      addCard: action,
      updateCard: action,
      columns: computed,
    });
  }

  async loadCards() {
    try {
      const cardsJSON = (await AsyncStorage.getItem("cards")) || "";
      this.cards = JSON.parse(cardsJSON);
    } catch (e) {
      this.cards = [];
    }
  }

  async saveCards() {
    try {
      const cards = JSON.stringify(this.cards);
      await AsyncStorage.setItem("cards", cards);
    } catch (e) {}
  }

  addCard(content: string, parent: Card | null = null, index: number = 0) {
    const card: Card = {
      content,
      id: uuid(),
      level: parent ? parent.level + 1 : 0,
      index,
      parent,
      children: [],
    };
    this.cards.push(card);
  }

  updateCard(cardId: string, card: Card) {
    const index = this.cards.findIndex((card: Card, index: number) => {
      return card.id == cardId;
    });
    const origCard = this.cards[index];
    this.cards[index] = card;
  }

  // Builds an index of cards by tree level
  get columnsObj(): any {
    const reducer = (obj: any, card: Card) => {
      if (!obj.hasOwnProperty(card.level)) {
        obj[card.level] = [];
      }
      obj[card.level].push(card);
      return obj;
    };

    const columnsObj = this.cards.reduce(reducer, {});
    return columnsObj;
  }

  // Returns card columns as an array of arrays
  get columns(): Card[][] {
    const columnsObj: any = this.columnsObj;
    console.log(Object.values(columnsObj));
    return this.sortColumns(Object.values(columnsObj));
  }

  orderCards(cardA: Card, cardB: Card): number {
    if (!cardA.parent && !cardB.parent) {
      return cardA.index < cardB.index ? -1 : cardA.index > cardB.index ? 1 : 0;
    } else if (!cardA.parent && cardB.parent) {
      return -1;
    } else if (cardA.parent && !cardB.parent) {
      return 1;
    }

    if (!cardA.parent || !cardB.parent) {
      return 0;
    }

    if (cardA.parent.index < cardB.parent.index) {
      return -1;
    } else if (cardA.parent.index == cardB.parent.index) {
      return cardA.index < cardB.index ? -1 : cardA.index > cardB.index ? 1 : 0;
    } else if (cardA.parent.index > cardB.parent.index) {
      return 1;
    } else {
      return 0;
    }
  }

  sortColumns(columns: Card[][]): Card[][] {
    console.log("sorting");
    for (var col = 0; col < columns.length; col++) {
      columns[col] = columns[col].sort(this.orderCards);
    }
    return columns;
  }

  relatedToFocused(card: Card): boolean {
    return (
      this.descendsFrom(card, this.focused) ||
      this.descendsFrom(this.focused, card)
    );
  }

  descendsFrom(cardA: Card | null, cardB: Card | null): boolean {
    if (!cardA || !cardB || !cardA.parent) {
      return false;
    } else if (cardB.id == cardA.parent.id) {
      return true;
    } else {
      return this.descendsFrom(cardA.parent, cardB);
    }
  }
}
