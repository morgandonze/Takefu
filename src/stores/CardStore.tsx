import AsyncStorage from "@react-native-community/async-storage";
import { makeObservable, observable, action } from "mobx";
import { Card } from "../models/Card";

export default class CardStore {
  cards: Card[] = [];
  editingId: number | null = null;
  focusedId: number | null = 0;

  constructor() {
    makeObservable(this, {
      cards: observable,
      editingId: observable,
      focusedId: observable,
      loadCards: action,
      addCard: action,
      updateCard: action,
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

  addCard(card: Card) {
    this.cards.push({
      ...card,
      id: this.cards.length,
    });
  }

  updateCard(cardId: number, card: Card) {
    const index = this.cards.findIndex((card: Card, index: number) => {
      return card.id == cardId;
    });
    const origCard = this.cards[index];
    this.cards[index] = card;
  }

  getColumns(): Card[][] {
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
}
