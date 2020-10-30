import React from "react";
import { View, Text, TextInput, Button, TouchableOpacity } from "react-native";
import { Card } from "../../App";

export default function CardComponent(props: {
  card: Card;
  editing?: boolean;
  onPressEdit(id: number | null): any;
}) {
  const { card, editing, onPressEdit } = props;

  if (editing) {
    return (
      <View
        style={{ padding: 20, backgroundColor: "#f4efef", marginBottom: 20 }}
      >
        <TextInput style={{ borderWidth: 1, borderColor: "#333" }} />
        <Button
          title="Done"
          onPress={() => {
            onPressEdit(null);
          }}
        />
      </View>
    );
  } else {
    return (
      <TouchableOpacity
        style={{ padding: 20, backgroundColor: "#f4efef", marginBottom: 20 }}
        onPress={() => onPressEdit(card.id)}
      >
        <Text>{card.content}</Text>
      </TouchableOpacity>
    );
  }
}
