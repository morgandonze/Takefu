import AsyncStorage from "@react-native-community/async-storage";
import { makeObservable, observable, action } from "mobx";
import { Card } from "../models/Card";

export default class CardStore {
  cards: Card[] = [];
  editingId: number | null = null;

  constructor() {
    makeObservable(this, {
      cards: observable,
      getCards: action,
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
}
