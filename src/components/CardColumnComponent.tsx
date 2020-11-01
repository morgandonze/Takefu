import { observer } from "mobx-react";
import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Card } from "../models/Card";
import CardComponent from "./CardComponent";

export default observer(function CardColumnComponent(props: {
  cards: Card[];
  editingId: number | null;
  setEditingId(id: number | null): any;
}) {
  const { cards, editingId, setEditingId } = props;
  return (
    <View style={styles.cardColumn}>
      <FlatList
        data={cards}
        contentContainerStyle={styles.columnListContainer}
        renderItem={({ item: card }) => (
          <CardComponent
            card={card}
            editing={editingId == card.id}
            onPressEdit={setEditingId}
          />
        )}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  cardColumn: {
    width: 300,
    backgroundColor: "#d8d8d8",
    flexDirection: "column",
    alignItems: "center",
    height: "100%",
  },
  columnListContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
});
