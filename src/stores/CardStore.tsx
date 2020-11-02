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

  getCards() {
    return this.cards;
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

  get columns(): Card[][] {
    const reducer = (obj: any, card: Card) => {
      if (!obj.hasOwnProperty(card.level)) {
        obj[card.level] = [];
      }

      obj[card.level].push(card);

      return obj;
    };

    const columnsObj = this.cards.reduce(reducer, {});
    return Object.values(columnsObj);
  }

  descendsFromFocused(card: Card): boolean {
    if (!this.focused || !card.parent) {
      return false;
    } else if (this.focused.id == card.parent.id) {
      return true;
    } else {
      return this.descendsFromFocused(card.parent);
    }
  }
}
