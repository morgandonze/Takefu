import { StatusBar } from "expo-status-bar";
import React from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
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
cardStore.addCard("Root Card");

function CardComponent(props: { card: Card; editing?: boolean }) {
  const { card, editing } = props;

  if (editing) {
    return (
      <View
        style={{ padding: 20, backgroundColor: "#f4efef", marginBottom: 20 }}
      >
        <TextInput style={{ borderWidth: 1, borderColor: "#333" }} />
      </View>
    );
  } else {
    return (
      <View
        style={{ padding: 20, backgroundColor: "#f4efef", marginBottom: 20 }}
      >
        <Text>{card.content}</Text>
      </View>
    );
  }
}

export default function App() {
  return (
    <View style={styles.container}>
      <FlatList
        data={cardStore.cards.slice()}
        renderItem={({ item: card }) => <CardComponent card={card} editing />}
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
