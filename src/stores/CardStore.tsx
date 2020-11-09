import AsyncStorage from "@react-native-community/async-storage";
import { makeObservable, observable, action, computed } from "mobx";
import { Card } from "../models/Card";
import { v4 as uuid } from "uuid";

export default class CardStore {
  cards: Card[] = observable.array();

  constructor() {
    makeObservable(this, {
      cards: observable,
      addCard: action,
      addRootCard: action,
      deleteCard: action,
      updateCardContent: action,
      columns: computed,
    });
  }

  //============================================================
  //                            Views
  //============================================================

  // Returns card columns as an array of arrays
  get columns(): Card[][] {}

  getCard(cardId?: string | null): Card | null {
    if (!cardId) return null;
    const card = this.cards.find((card: Card) => {
      return card.id == cardId;
    });
    return card || null;
  }

  //============================================================
  //                            Actions
  //============================================================

  addCard(content: string, parentId: string, order?: number): Card | undefined {
    const parent: Card | null = this.getCard(parentId);

    if (!parent) return;

    const card: Card = {
      id: uuid(),
      content,
      level: parent.level + 1,
      order: parent.childIds.length,
      parentId: parentId,
      childIds: [] as string[],
    };

    this.cards.push(card);

    parent.childIds.push(card.id);

    if (order) {
      this.changeCardOrder(card.id, order);
    }
  }

  updateCardContent(cardId: string, content: string) {
    const card = this.getCard(cardId);
    if (card) {
      card.content = content;
    }
  }

  deleteCard(cardId: string) {
    const card = this.getCard(cardId);
    if (!card || !card.parentId) return;

    const parent = card && this.getCard(card.parentId);
    if (!parent) return;

    // remove as child from parent
    const cardChildIndex = parent.childIds.findIndex(
      (childId) => childId == cardId
    );
    parent.childIds.splice(cardChildIndex, 1);

    // delete self and recursively delete children
    this.deleteCardRecursive(cardId);

    // reorder siblings
    this.removeOrderGaps(card.parentId);
  }

  deleteCardRecursive(cardId: string) {
    const card = this.getCard(cardId);
    if (!card) {
      return;
    }

    // recursively delete children
    let child;
    for (var i = 0; i < card.childIds.length; i++) {
      this.deleteCardRecursive(card.childIds[i]);
    }

    // Delete card from cards
    const cardIndex: number | null = this.cards.findIndex(
      (_card) => _card.id == cardId
    );
    this.cards.splice(cardIndex, 1);
  }

  changeCardOrder(cardId: string, order: number) {
    const card = this.getCard(cardId);
    if (!card || !card.parentId) return;
    const parent = this.getCard(card.parentId);
    if (!parent) return;
    const siblings: Card[] = parent.childIds
      .map((id) => this.getCard(id))
      .filter((card) => card !== null) as Card[];

    const origOrder = card.order;
    let sibling;
    if (origOrder <= order) {
      for (var i = origOrder; i <= order; i++) {
        sibling = siblings[i];
        sibling.order--;
      }
    } else {
      for (var i = order; i <= origOrder; i++) {
        sibling = siblings[origOrder + order - i];
        sibling.order++;
      }
    }
    card.order = order;

    // update parent.childIds
    const sortedIds = siblings
      .sort((a, b) => {
        if (!a || !b) {
          return 0;
        } else {
          return a.order < b.order ? -1 : a.order > a.order ? 1 : 0;
        }
      })
      .map((card) => card.id);
    parent.childIds = sortedIds;
  }

  // use to remove order gaps caused by deleting cards
  removeOrderGaps(parentId: string) {
    const parent = this.getCard(parentId);
    if (!parent) return;
    const childrenDup: (Card | null)[] = parent.childIds.map((id) =>
      this.getCard(id)
    );

    // Ensure childrenDup are sorted by order
    childrenDup.sort((a, b) => {
      if (!a || !b) {
        return 0;
      } else {
        return a.order < b.order ? -1 : a.order > b.order ? 1 : 0;
      }
    });

    let childDup: Card | null;
    let child: Card | null;
    for (var i = 0; i <= childrenDup.length; i++) {
      childDup = childrenDup[i];
      child = this.getCard(childDup?.id);
      if (child) {
        child.order = i;
      }
    }

    // TODO sort parent's childIds
  }

  changeCardGroup(cardId: string, newParentId: string, order: number) {
    if (!cardId) return;
    const card = this.getCard(cardId);
    if (!card) return;
    const origParentId = card.parentId;
    if (!origParentId || !newParentId) return;

    const origParent = this.getCard(card.parentId);
    const newParent = this.getCard(newParentId);
    if (!newParent) return;

    // card id is removed from parent's childIds
    const cardIndex = origParent?.childIds.findIndex((id) => id == cardId);
    cardIndex && origParent?.childIds.splice(cardIndex, 1);
    this.removeOrderGaps(origParentId);

    // card id is added to new parent's childIds
    // changes the cards parentId and order
    // TODO do it right
    newParent?.childIds.push(cardId);
    card.parentId = newParentId;
    card.order = newParent.childIds.length;
    this.changeCardOrder(cardId, order);
  }

  //============================================================
  //                            Setup Actions
  //============================================================

  addRootCard() {
    const rootCard: Card = {
      id: uuid(),
      content: "Root Card",
      level: 0,
      order: 0,
      parentId: null,
      childIds: [] as string[],
    };
    this.cards.push(rootCard);
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
}
