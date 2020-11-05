import AsyncStorage from "@react-native-community/async-storage";
import { makeObservable, observable, action, computed } from "mobx";
import { Card } from "../models/Card";
import { v4 as uuid } from "uuid";

export default class CardStore {
  cards: Card[] = observable.array();
  editingId: string | null = null;
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
      console.log("LOAD");
      console.log(this.cards.slice());
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

  focusRoot() {
    const root = this.cards.find((card: Card) => {
      return card.level == 0 && card.order == 0;
    });
    this.focused = root || null;
  }

  getLineage(card: Card, lineage: number[] = []): number[] {
    const parent = this.getCard(card.parentId as string);
    if (parent) {
      return this.getLineage(parent, [card.order, ...lineage]);
    } else {
      return [card.order, ...lineage];
    }
  }

  baseCards(): Card[] {
    return this.cards.filter((card: Card) => {
      return card.level == 0;
    });
  }

  addCard(content: string, parent: Card | null = null): Card {
    const baseCards = this.baseCards();

    const card: Card = {
      content,
      id: uuid(),
      level: parent ? parent.level + 1 : 0,
      order: parent ? parent.children.length : baseCards.length, // replace 0 with number of level 0 cards
      parentId: parent ? parent.id : null,
      children: observable.array(),
    };
    this.cards.push(card);
    return card;
  }

  deleteCard(card: Card, first = true) {
    // delete all child cards recursively
    for (var i = 0; i < card.children.length; i++) {
      this.deleteCard(card.children[i], false);
    }

    // disallow deleting last card
    // TODO disallow deleting last root card
    if (this.baseCards().includes(card) && this.baseCards().length <= 1) {
      return null;
    }

    // remove as child from parents
    const parent: Card | null = this.getCard(card.parentId);
    if (first && parent) {
      // remove child from parent.children
      const childArrayIndex = parent.children.findIndex((child: Card) => {
        return child.id == card.id;
      });
      console.log(card.content, parent?.content, childArrayIndex);
      parent.children.splice(childArrayIndex, 1);
    }

    // delete from cards
    const cardIndex = this.cards.findIndex((_card) => {
      return _card.id == card.id;
    });
    this.cards.splice(cardIndex, 1);
  }

  updateCard(cardId: string, card: Card) {
    const index = this.cards.findIndex((card: Card, index: number) => {
      return card.id == cardId;
    });
    const temp = this.cards;
    temp[index] = card;
    this.cards = temp;
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

  getCard(cardId?: string | null): Card | null {
    if (!cardId) return null;
    const card = this.cards.find((card: Card) => {
      return card.id == cardId;
    });
    return card || null;
  }

  focusNextSibling() {
    const card = this.focused;
    if (!card) return;
    const parent = this.getCard(card.parentId);
    let focusTo;
    let cards;

    if (!parent) {
      cards = this.baseCards().sort((a, b) =>
        a.order < b.order ? -1 : a.order == b.order ? 0 : 1
      );
    } else {
      cards = parent?.children;
    }

    focusTo = cards.find((otherCard: Card) => {
      return otherCard.order > card.order;
    });

    if (focusTo) this.focused = this.getCard(focusTo.id);
  }

  focusPrevSibling() {

    const card = this.focused;
    if (!card) return;
    const parent = this.getCard(card.parentId);
    let focusTo;
    let cards;

    if (!parent) {
      cards = this.baseCards().sort((a, b) =>
        a.order < b.order ? 1 : a.order == b.order ? 0 : -1
      );
    } else {
      cards = parent?.children;
    }

    focusTo = cards.find((otherCard: Card) => {
      return otherCard.order < card.order;
    });

    if (focusTo) this.focused = this.getCard(focusTo.id);
  }

  focusChildren() {
    const card = this.focused;
    if (!card) return;
    const children = card.children.slice();
    const focusTo = children[0] ? this.getCard(children[0].id) : null;
    if (focusTo) this.focused = focusTo;
  }

  focusParent() {
    const card = this.focused;
    if (!card) return;
    const focusTo = this.getCard(card.parentId);
    if (focusTo) this.focused = focusTo;
  }

  orderCards(_this: any) {
    return (cardA: Card, cardB: Card): number => {
      const lineageA: number[] = _this.getLineage(cardA);
      const lineageB: number[] = _this.getLineage(cardB);

      if (lineageA.length != lineageB.length) {
        return 0;
      }

      for (var i = 0; i < lineageA.length; i++) {
        if (lineageA[i] < lineageB[i]) {
          return -1;
        } else if (lineageA[i] > lineageB[i]) {
          return 1;
        }
      }

      return 0;
    };
  }

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

  descendsFrom(cardA: Card | null, cardB: Card | null): boolean {
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
