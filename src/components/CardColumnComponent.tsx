import { observer } from "mobx-react";
import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ScrollView,
  StyleProp,
} from "react-native";
import { Card } from "../models/Card";
import CardComponent from "./CardComponent";

export default observer(function CardColumnComponent(props: { cards: Card[] }) {
  const { cards } = props;
  const [offset, setOffset] = useState(0);

  const offsetContainerStyle = StyleSheet.flatten([
    styles.columnListContainer,
    {
      position: "relative",
      top: offset,
    },
  ]);

  return (
    <div
      onMouseEnter={(e) => {
        // console.log(`Mouse over column ${cards.slice()[0].level}`);
      }}
      onWheel={(e) => {
        setOffset(offset + e.nativeEvent.deltaY);
      }}
      style={{
        position: "relative",
        top: offset,
      }}
    >
      <FlatList
        data={cards}
        contentContainerStyle={offsetContainerStyle}
        keyExtractor={(_item) => `${_item.id}-card`}
        renderItem={({ item: card }) => <CardComponent card={card} />}
      />
    </div>
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
