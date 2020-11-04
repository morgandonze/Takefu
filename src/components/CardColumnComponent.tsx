import { observer } from "mobx-react";
import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ScrollView,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Card } from "../models/Card";
import CardComponent from "./CardComponent";

export default observer(function CardColumnComponent(props: { cards: Card[] }) {
  const { cards } = props;
  const [offset, setOffset] = useState(0);

  const offsetContainerStyle = StyleSheet.flatten([
    styles.columnListContainer,
    {},
  ]);

  return (
    <div
      onMouseEnter={(e) => {
        // console.log(`Mouse over column ${cards.slice()[0].level}`);
      }}
      onWheel={(e) => {
        const _offset = Math.max(0, offset + e.nativeEvent.deltaY);
        setOffset(_offset);
      }}
      style={{
        height: "100%",
      }}
    >
      <View
        style={{
          position: "relative",
          top: offset,
        }}
      >
        <FlatList
          data={cards}
          contentContainerStyle={offsetContainerStyle as StyleProp<ViewStyle>}
          keyExtractor={(_item) => `${_item.id}-card`}
          renderItem={({ item: card }) => <CardComponent card={card} />}
        />
      </View>
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
