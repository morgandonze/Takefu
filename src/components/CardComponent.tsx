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

const AddButton = function (props: { onPress(): any; style: any }) {
  const { onPress, style } = props;
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
          <Text>+</Text>
        </View>
      </TouchableOpacity>
    </div>
  );
};

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
    console.log(lineage);
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
      left: 300,
      bottom: 60,
    },
  ]);

  const siblingPlusStyle = StyleSheet.flatten([
    styles.plusButton,
    {
      left: 140,
      bottom: 10,
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

      <AddButton onPress={addChild} style={childPlusStyle} />
      <AddButton onPress={addSibling} style={siblingPlusStyle} />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 5,
    borderColor: "#ccc",
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    margin: 5,
    width: 350,
    zIndex: 1,
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
