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
  onEdit(): void;
  onSave(content: string): void;
}) {
  const { card, editing, onEdit, onSave } = props;
  const [content, setContent] = useState(card.content);

  if (!editing) {
    return (
      <View style={{ marginBottom: 10 }}>
        <View style={{ marginBottom: 50 }}>
          <Text>{content}</Text>
        </View>
        <Button title="edit" onPress={onEdit} />
      </View>
    );
  } else {
    return (
      <View style={{ marginBottom: 10 }}>
        <View>
          <TextInput
            style={{ borderWidth: 1, borderColor: "#333", paddingBottom: 50 }}
            value={content}
            onChangeText={(text) => {
              console.log("change text");
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
  };

  const combineStyles = StyleSheet.flatten([
    styles.card,
    {
      backgroundColor: focused ? "#fcfcfc" : "#cccccc",
    },
  ]);

  return (
    <TouchableOpacity style={combineStyles} onPress={onFocus}>
      <CardText
        editing={editing}
        card={card}
        onEdit={() => {
          cardStore.editingId = card.id;
          setEditing(true);
        }}
        onSave={async (content) => {
          cardStore.updateCard(card.id, { ...card, content });
          await cardStore.saveCards();
          cardStore.editingId = null;
          setEditing(false);
        }}
      />
      <Button
        title="Add Child"
        onPress={async () => {
          cardStore.addCard(`${card.content} child`, card);
          await cardStore.saveCards();
        }}
      />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: 20,
    backgroundColor: "#fff",
    marginBottom: 2,
    width: 350,
  },
});
