import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import CardColumnComponent from "./src/components/CardColumnComponent";
import CardStore from "./src/stores/CardStore";

const cardStore = new CardStore();
cardStore.addCard("Root Card");

export default function App() {
  const [editingId, setEditingId] = useState<number | null>(null);

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
