import { observer } from "mobx-react";
import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
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
      <View>
        <Text>{content}</Text>
        <Button title="edit" onPress={onEdit} />
      </View>
    );
  } else {
    return (
      <View>
        <TextInput
          style={{ borderWidth: 1, borderColor: "#333" }}
          value={content}
          onChangeText={(text) => {
            console.log("change text");
            setContent(text);
          }}
        />
        <Button title="done" onPress={() => onSave(content)} />
      </View>
    );
  }
};

export default observer(function CardComponent(props: { card: Card }) {
  const { cardStore } = useStores();
  const { card } = props;
  const [editing, setEditing] = useState(cardStore.editingId == card.id);

  return (
    <View style={styles.card}>
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
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: 20,
    backgroundColor: "#fff",
    marginBottom: 20,
    height: 200,
    width: 350,
  },
});
