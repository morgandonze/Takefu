import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Card } from "../models/Card";

import { MobXProviderContext } from "mobx-react";
function useStores() {
  return React.useContext(MobXProviderContext);
}

const CardText = function (props: {
  card: Card;
  editing: boolean;
  onSave(content: string): void;
}) {
  const { card, editing, onSave } = props;
  const [content, setContent] = useState(card.content);

  if (!editing) {
    return (
      <View style={{ marginBottom: 20 }}>
        <Text>{content}</Text>
      </View>
    );
  } else {
    return (
      <View style={{ marginBottom: 10 }}>
        <View>
          <TextInput
            style={{ borderWidth: 1, borderColor: "#333" }}
            value={content}
            onChangeText={(text) => {
              setContent(text);
            }}
          />
        </View>
        <Button title="done" onPress={() => onSave(content)} />
      </View>
    );
  }
};

export default observer(function CardComponent(props: { card: Card }) {
  const { cardStore } = useStores();
  const { card } = props;
  const [editing, setEditing] = useState(cardStore.editingId == card.id);
  const [focused, setFocused] = useState(cardStore.focused == card);

  useEffect(() => {
    setEditing(cardStore.editingId == card.id);
  }, [cardStore.editingId]);

  useEffect(() => {
    setFocused(cardStore.focused == card);
  }, [cardStore.focused]);

  const onFocus = (e: any) => {
    cardStore.focused = card;
    const lineage = cardStore.getLineage(card);
  };

  let cardBackground: string;
  if (focused) {
    cardBackground = "#fcfcfc";
  } else if (cardStore.relatedToFocused(card)) {
    cardBackground = "#e0e0e0";
  } else {
    cardBackground = "#aaaaab";
  }
  const combineStyles = StyleSheet.flatten([
    styles.card,
    {
      backgroundColor: cardBackground,
    },
  ]);

  const addChild = async () => {
    const newCard = cardStore.addCard(
      `${lineage},${card.children.length}`,
      card
    );
    card.children.push(newCard);
    await cardStore.saveCards();
  };

  const addSibling = async () => {};

  const lineage = cardStore.getLineage(card);

  const childPlusStyle = StyleSheet.flatten([
    styles.plusButton,
    {
      left: 280,
      bottom: 60,
    },
  ]);

  const siblingPlusStyle = StyleSheet.flatten([
    styles.plusButton,
    {
      left: 140,
      bottom: 25,
    },
  ]);

  return (
    <TouchableOpacity style={combineStyles} onPress={onFocus}>
      <TouchableOpacity
        style={{ marginBottom: 40 }}
        onPress={() => {
          cardStore.editingId = card.id;
          setEditing(true);
        }}
      >
        <CardText
          editing={editing}
          card={card}
          onSave={async (content) => {
            cardStore.updateCard(card.id, { ...card, content });
            await cardStore.saveCards();
            cardStore.editingId = null;
            setEditing(false);
          }}
        />
      </TouchableOpacity>
      <TouchableOpacity style={childPlusStyle} onPress={addChild}>
        <View style={styles.x}>
          <Text>+</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={siblingPlusStyle} onPress={addSibling}>
        <View style={styles.x}>
          <Text>+</Text>
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 2,
    width: 350,
    zIndex: 1,
  },
  plusButton: {
    width: 0,
    height: 0,
    position: "relative",
  },
  x: {
    backgroundColor: "#ffffff",
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
  },
});
