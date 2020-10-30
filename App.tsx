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

function CardColumnComponent(props: {
  cards: Card[];
  editingId: number | null;
  setEditingId(id: number | null): any;
}) {
  const { cards, editingId, setEditingId } = props;
  return (
    <FlatList
      data={cards}
      renderItem={({ item: card }) => (
        <CardComponent
          card={card}
          editing={editingId == card.id}
          onPressEdit={setEditingId}
        />
      )}
    />
  );
}

export default function App() {
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <View style={{ width: 300 }}>
        <CardColumnComponent
          cards={cardStore.cards.slice()}
          editingId={editingId}
          setEditingId={setEditingId}
        />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    padding: 20,
    backgroundColor: "cyan",
    alignItems: "center",
    justifyContent: "flex-start",
  },
});
