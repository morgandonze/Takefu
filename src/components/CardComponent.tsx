import React, { useState } from "react";
import { View, Text, TextInput, Button, TouchableOpacity } from "react-native";
import { Card } from "../../App";

export default function CardComponent(props: {
  card: Card;
  editing?: boolean;
  onPressEdit(id: number | null): any;
}) {
  const { card, editing, onPressEdit } = props;
  const [content, setContent] = useState(card.content);
  const cardStyle = {
    padding: 20,
    backgroundColor: "#f4efef",
    marginBottom: 20,
    height: 200,
  };

  if (editing) {
    return (
      <View style={cardStyle}>
        <TextInput
          style={{ borderWidth: 1, borderColor: "#333" }}
          value={content}
          onChangeText={(text) => {
            setContent(text);
            card.content = content;
          }}
        />
        <Button
          title="Done"
          onPress={() => {
            card.content = content;
            onPressEdit(null);
          }}
        />
      </View>
    );
  } else {
    return (
      <TouchableOpacity style={cardStyle} onPress={() => onPressEdit(card.id)}>
        <Text>{card.content}</Text>
      </TouchableOpacity>
    );
  }
}
