import { StatusBar } from "expo-status-bar";
import { observer } from "mobx-react";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import CardColumnComponent from "./src/components/CardColumnComponent";
import { Card } from "./src/models/Card";
import CardStore from "./src/stores/CardStore";

const cardStore = new CardStore();

export default function App() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [cards, setCards] = useState<Card[]>([]);

  useLayoutEffect(() => {
    const setupCardStore = async function () {
      // await cardStore.saveCards();
      await cardStore.loadCards();
      setCards(cardStore.cards);
    };

    setupCardStore();
  }, []);

  console.log(cardStore.cards.slice());

  return (
    <View style={styles.container}>
      <CardColumnComponent
        cards={cardStore.cards.slice()}
        editingId={editingId}
        setEditingId={setEditingId}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "flex-start",
  },
});
