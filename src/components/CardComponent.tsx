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

export default function CardComponent(props: {
  card: Card;
  editing?: boolean;
  onPressEdit(id: number | null): any;
}) {
  const { card, editing, onPressEdit } = props;

  if (editing) {
    return (
      <EditingCard
        initialContent={card.content}
        onSave={(text: string) => {
          card.content = text;
          onPressEdit(null);
        }}
      />
    );
  } else {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => onPressEdit(card.id)}
      >
        <Text>{card.content}</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    backgroundColor: "#fff",
    marginBottom: 20,
    height: 200,
    width: 350,
  },
});
