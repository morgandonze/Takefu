import { observer } from "mobx-react";
import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ScrollView,
  StyleProp,
  Text,
  ViewStyle,
  SectionList,
} from "react-native";
import { CardGroup, LevelType } from "../stores/CardStore";
import CardComponent from "./CardComponent";

function CardGroupComponent(props: { group: CardGroup }) {
  const {
    group: { cards },
  } = props;
  return (
    <FlatList
      data={cards}
      keyExtractor={(_item) => `${_item.id}-card`}
      renderItem={({ item: card }) => <CardComponent card={card} />}
    />
  );
}

export default observer(function Level(props: { level: LevelType }) {
  const {
    level: { groups, levelNum },
  } = props;

  return (
    <FlatList
      data={groups}
      renderItem={({ item: group }) => <CardGroupComponent group={group} />}
    />
  );
});
