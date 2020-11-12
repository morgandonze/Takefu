import AsyncStorage from "@react-native-community/async-storage";
import { makeObservable, observable, action, computed } from "mobx";
import { Card } from "../models/Card";
import { v4 as uuid } from "uuid";

export interface CardGroup {
  cards: Card[];
  parentId: string | null;
  order?: number;
}

export interface LevelType {
  groups: CardGroup[];
  levelNum: number;
}

export default class CardStore {
  cards: Card[] = observable.array();

  constructor() {
    makeObservable(this, {
      cards: observable,
      addCard: action,
      addRootCard: action,
      deleteCard: action,
      updateCardContent: action,
    });
  }

  //============================================================
  //                            Views
  //============================================================

  maxLevel() {
    let maxLevel = 0;
    let card;
    for (let i = 0; i < this.cards.length; i++) {
      card = this.cards[i];
      if (card.level > maxLevel) {
        maxLevel = card.level;
      }
    }
    return maxLevel;
  }

  levels(): LevelType[] {
    const _levels: LevelType[] = [];
    for (let i = 0; i <= this.maxLevel(); i++) {
      _levels[i] = this.level(i);
    }

    return _levels;
  }

  level(levelNum: number): LevelType {
    const _level: LevelType = { groups: [], levelNum: levelNum };
    const levelCards = this.cards.filter((card) => card.level == levelNum);

    let card: Card;
    let group: CardGroup | undefined;
    let parentId: string | null;
    let order: number;

    for (var i = 0; i < levelCards.length; i++) {
      card = levelCards[i];
      group = _level.groups.find((g) => g.parentId == card.parentId);

      if (!group) {
        parentId = levelCards[i].parentId;
        group = { parentId: parentId || null, cards: [] };
        // console.log("group", group);
        _level.groups.push(group);
      }

      group.cards.push(card);
    }

    // TODO set group orders
    _level.groups.sort(this.groupSorter(this));

    return _level;
  }

  groupSorter(_this: any) {
    return (groupA: CardGroup, groupB: CardGroup) => {
      const cardA = this.getCard(groupA.parentId);
      const cardB = this.getCard(groupB.parentId);
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

  getLineage(card: Card, lineage: number[] = []): number[] {
    const parent = this.getCard(card.parentId as string);
    if (parent) {
      return this.getLineage(parent, [card.order, ...lineage]);
    } else {
      return [card.order, ...lineage];
    }
  }

  getCard(cardId?: string | null): Card | null {
    if (!cardId) return null;
    const card = this.cards.find((card: Card) => {
      return card.id == cardId;
    });
    return card || null;
  }

  getCardByPosition(level: number, group: number, order: number): Card | null {
    if (level == null || order == null) return null;
    let parent;
    const card = this.cards.find((card: Card) => {
      parent = this.getCard(card.parentId);
      return (
        card.level == level && parent?.order == group && card.order == order
      );
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

    return card;
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
    console.log("CHANGING ORDER");

    const card = this.getCard(cardId);
    if (!card || !card.parentId) return;
    const parent = this.getCard(card.parentId);
    if (!parent) return;

    const siblings: (Card | null)[] = parent.childIds
      .map((id) => this.getCard(id))

    const origOrder = card.order;
    let sibling;

    console.log("reorder", order, origOrder)
    if (order > origOrder) {
      // moving card to later position
      for (var i = origOrder + 1; i <= order; i++) {
        sibling = siblings.find((s) => (s?.order == i))
        if(sibling) sibling.order--;
      }
    } else if (order < origOrder || true) {
      // moving card to earlier position
      for (var i = origOrder - 1; i >= order; i--) {
        sibling = siblings.find((s) => (s?.order == i))
       if(sibling) sibling.order++;
      }
    }
    card.order = order;
  }

  // use to remove order gaps caused by deleting cards
  removeOrderGaps(parentId: string) {
    const parent = this.getCard(parentId);
    if (!parent) return;
    const childrenDup: (Card | null)[] = parent.childIds.map((id) =>
      this.getCard(id)
    );

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
    card.level = newParent.level + 1;
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
    return rootCard;
  }

  async loadCards() {
    try {
      const cardsJSON = (await AsyncStorage.getItem("cards")) || "";
      this.cards = JSON.parse(cardsJSON);
      // console.log("LOAD");
      // console.log(this.cards.slice());
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
