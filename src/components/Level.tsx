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
import { Droppable } from "react-beautiful-dnd";

function CardGroupComponent(props: { group: CardGroup }) {
  const {
    group: { cards, parentId },
  } = props;
  return (
    <Droppable
      droppableId={`group-${parentId}`}
      key={`group-${parentId}`}
      type="GROUP"
    >
      {(provided: any, snapshot: any) => (
        <div
          ref={provided.innerRef}
          style={{
            backgroundColor: snapshot.isDraggingOver
              ? "lightblue"
              : "lightgrey",
            zIndex: -1
          }}
          {...provided.droppableProps}
        >
          <FlatList
            data={cards}
            keyExtractor={(_item) => `${_item.id}-card`}
            renderItem={({ item: card, index }) => (
              <CardComponent card={card} key={`card-${index}`} index={index} />
            )}
          />
          {provided.placeholder}
        </div>
      )}
    </Droppable>
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
