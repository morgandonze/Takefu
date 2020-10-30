import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { action, makeObservable, observable } from "mobx";
import CardComponent from "./src/components/CardComponent";
import CardStore from "./src/stores/CardStore";

export interface Card {
  id: number;
  content: string;
}

const cardStore = new CardStore();
cardStore.addCard("Root Card");

export default function App() {
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <FlatList
        data={cardStore.cards.slice()}
        renderItem={({ item: card }) => (
          <CardComponent
            card={card}
            editing={editingId == card.id}
            onPressEdit={setEditingId}
          />
        )}
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
