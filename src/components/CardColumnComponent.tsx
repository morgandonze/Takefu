import { observer } from "mobx-react";
import React from "react";
import { View, FlatList, StyleSheet, ScrollView } from "react-native";
import { Card } from "../models/Card";
import CardComponent from "./CardComponent";

export default observer(function CardColumnComponent(props: { cards: Card[] }) {
  const { cards } = props;
  return (
    <FlatList
      data={cards}
      contentContainerStyle={styles.columnListContainer}
      keyExtractor={(_item, index) => `${_item.id}-card`}
      renderItem={({ item: card }) => <CardComponent card={card} />}
    />
  );
});

const styles = StyleSheet.create({
  cardColumn: {
    backgroundColor: "#d8d8d8",
    marginRight: 20,
    flex: 1,
    height: "100%",
    // justifyContent: "center"
  },
  columnListContainer: { flexGrow: 1 },
});
