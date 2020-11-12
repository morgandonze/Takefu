import { observer } from "mobx-react";
import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Card } from "../models/Card";
import { Draggable } from "react-beautiful-dnd";

import { MobXProviderContext } from "mobx-react";
function useStores() {
  return React.useContext(MobXProviderContext);
}

const AddButton = function (props: {
  onPress(): any;
  style: any;
  symbol: string;
}) {
  const { onPress, style, symbol } = props;
  const [mouseOver, setMouseOver] = useState(false);

  const _style = StyleSheet.flatten([
    style,
    {
      opacity: mouseOver ? 1 : 0.2,
    },
  ]);

  return (
    <div
      onMouseEnter={(e) => {
        setMouseOver(true);
      }}
      onMouseLeave={(e) => {
        setMouseOver(false);
      }}
    >
      <TouchableOpacity style={_style} onPress={onPress}>
        <View style={styles.plus}>
          <Text>{symbol}</Text>
        </View>
      </TouchableOpacity>
    </div>
  );
};

export default observer(function CardComponent(props: {
  card: Card;
  index: number;
}) {
  const { cardStore, uiStore } = useStores();
  const { card, index } = props;

  const [editing, setEditing] = useState(uiStore.editingId == card.id);
  const [content, setContent] = useState(card.content);

  useEffect(() => {
    setEditing(uiStore.editingId == card.id);
  }, [uiStore.editingId]);

  const childPlusStyle = StyleSheet.flatten([
    styles.plusButton,
    {
      left: 305,
      bottom: 0,
    },
  ]);

  const siblingPlusStyle = StyleSheet.flatten([
    styles.plusButton,
    {
      left: 150,
      bottom: -40,
    },
  ]);

  const cardMinusStyle = StyleSheet.flatten([
    styles.plusButton,
    {
      left: 305,
      bottom: 30,
    },
  ]);

  const addChild = async (card: Card) => {
    const lineage = cardStore.getLineage(card);
    const content = `${lineage},${card.childIds.length}`;
    // const content = `${cardStore.getLineage(card)} ${
    //   cardStore.getCard(card.parentId)?.children?.length
    // }`;
    cardStore.addCard(content, card.id);
    await cardStore.saveCards();
  };
  const addSibling = async (card: Card) => {
    const content = `${card.content} Sibling`;
    cardStore.addCard(content, card.parentId);
    await cardStore.saveCards();
  };
  const deleteCard = async (card: Card) => {
    cardStore.deleteCard(card.id);
    await cardStore.saveCards();
  };

  return (
    <Draggable draggableId={card.id} index={index} key={`card-${card.id}`}>
      {(provided: any, snapshot: any) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              if (!editing) {
                uiStore.editingId = card.id;
              } else {
                uiStore.editingId = null;
              }
              setEditing(!editing);
            }}
          >
            <View
              style={{
                display: !editing ? "flex" : "none",
              }}
            >
              <Text>{card.content}</Text>
            </View>

            <TouchableOpacity
              style={{
                display: editing ? "flex" : "none",
              }}
            >
              <TextInput
                style={{ borderWidth: 1, borderColor: "#333" }}
                value={content}
                onSubmitEditing={async () => {
                  card.content = content;
                  await cardStore.saveCards();
                }}
                onChangeText={(text) => {
                  setContent(text);
                }}
              />
            </TouchableOpacity>

            <AddButton
              symbol={"+"}
              onPress={() => addChild(card)}
              style={childPlusStyle}
            />
            <AddButton
              symbol={"+"}
              onPress={() => addSibling(card)}
              style={siblingPlusStyle}
            />
            <AddButton
              symbol={"-"}
              onPress={() => deleteCard(card)}
              style={cardMinusStyle}
            />
          </TouchableOpacity>
        </div>
      )}
    </Draggable>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 5,
    backgroundColor: "#bdbdbd",
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    margin: 5,
    width: 350,
    minHeight: 100,
  },
  plusButton: {
    width: 0,
    height: 0,
    position: "relative",
  },
  plus: {
    backgroundColor: "#ffffff",
    borderRadius: 5,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
