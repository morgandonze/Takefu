import { observer } from "mobx-react";
import React, { useState } from "react";
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

function EditingCard(props: {
  initialContent: string;
  onSave(text: string): void;
}) {
  const { initialContent, onSave } = props;
  const [content, setContent] = useState(initialContent);
  return (
    <View style={styles.card}>
      <TextInput
        style={{ borderWidth: 1, borderColor: "#333" }}
        value={content}
        onChangeText={(text) => {
          setContent(text);
        }}
      />
      <Button title="Done" onPress={() => onSave(content)} />
    </View>
  );
}

export default observer(function CardComponent(props: { card: Card }) {
  const { cardStore } = useStores();
  const { card } = props;
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <EditingCard
        initialContent={card.content}
        onSave={async (text: string) => {
          card.content = text;
          await cardStore.saveCards();
          setEditing(false);
        }}
      />
    );
  } else {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          setEditing(true);
        }}
      >
        <Text>{card.content}</Text>

        <Button title="add child" onPress={() => {}} />
        <Button
          title="add sibling"
          onPress={async () => {
            const newCard: Card = {
              content: "",
              id: 0,
              index: card.index + 1,
              level: 0,
            };
            await cardStore.addCard(newCard);
            await cardStore.saveCards();
          }}
        />
      </TouchableOpacity>
    );
  }
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
