import AsyncStorage from "@react-native-community/async-storage";
import { makeObservable, observable, action } from "mobx";
import { Card } from "../models/Card";

export default class CardStore {
  cards: Card[] = [];
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

  addCard(content: string) {
    this.cards.push({
      content,
      id: this.cards.slice().length,
      level: 0,
      index: 0,
    });
  }
}
