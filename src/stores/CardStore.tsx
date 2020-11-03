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
    } catch (e) {
      console.log(e);
    }
  }

  addCard(content: string, parent: Card | null = null): Card {
    const card: Card = {
      content,
      id: uuid(),
      level: parent ? parent.level + 1 : 0,
      index: parent ? parent.children.length : 0, // replace 0 with number of level 0 cards
      parentId: parent ? parent.id : null,
      children: [],
    };
    this.cards.push(card);
    return card;
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
    return this.sortColumns(Object.values(columnsObj));
  }

  getCard(cardId: string): Card | null {
    const card = this.cards.find((card: Card) => {
      return card.id == cardId;
    });
    return card || null;
  }

  getLineage(card: Card, lineage = []): number[] {
    const parent = this.getCard(card.parentId as string);
    if (parent) {
      return [...this.getLineage(parent), card.index, ...lineage];
    } else {
      return [card.index, ...lineage];
    }
  }

  orderCards(_this: any) {
    return (cardA: Card, cardB: Card): number => {
      const lineageA = _this.getLineage(cardA);
      console.log(cardA.index);
      console.log(lineageA);
      const lineageB = _this.getLineage(cardB);
      return 0;
    };
  }

  // deprecated

  sortColumns(columns: Card[][]): Card[][] {
    for (var col = 0; col < columns.length; col++) {
      columns[col] = columns[col].sort(this.orderCards(this));
    }
    return columns;
  }

  relatedToFocused(card: Card): boolean {
    return (
      this.descendsFrom(card, this.focused) ||
      this.descendsFrom(this.focused, card)
    );
  }

  descendsFrom(cardA: Card, cardB: Card | null): boolean {
    const cardAParent = this.getCard(cardA?.parentId as string);
    if (!cardA || !cardB || !cardAParent) {
      return false;
    } else if (cardB.id == cardAParent.id) {
      return true;
    } else {
      return this.descendsFrom(cardAParent, cardB);
    }
  }
}
