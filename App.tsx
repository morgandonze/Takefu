import { StatusBar } from "expo-status-bar";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { action, makeObservable, observable } from "mobx";

interface Card {
  id: number;
  content: string;
}

class CardStore {
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

const cardStore = new CardStore();
cardStore.addCard("Test Card");
cardStore.addCard("Test Card");

function CardComponent(props: { card: Card }) {
  const { card } = props;
  return (
    <View style={{padding: 20, backgroundColor: "#f4efef", marginBottom: 20}}>
      <Text>{card.content}</Text>
    </View>
  );
}

export default function App() {
  return (
    <View style={styles.container}>
      <FlatList
        data={cardStore.cards.slice()}
        renderItem={({ item: card }) => <CardComponent card={card} />}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
