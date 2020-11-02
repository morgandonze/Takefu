import { StatusBar } from "expo-status-bar";
import { observer, Provider } from "mobx-react";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import CardColumnComponent from "./src/components/CardColumnComponent";
import { Card } from "./src/models/Card";
import CardStore from "./src/stores/CardStore";

const cardStore = new CardStore();
let reset: boolean;
reset = false;

if (reset) {
  cardStore.addCard("Root Card");
}

function App() {
  const [, setCards] = useState<Card[]>([]);

  useEffect(() => {
    const setupCardStore = async function () {
      if (reset) {
        await cardStore.saveCards();
      }
      await cardStore.loadCards();
      setCards(cardStore.cards);
    };

    setupCardStore();
  }, []);

  const columns = cardStore.getColumns();

  return (
    <Provider cardStore={cardStore}>
      <FlatList
        data={Object.values(columns)}
        contentContainerStyle={styles.container}
        keyExtractor={(item, index) => `${index}`}
        renderItem={({ item: column }) => (
          <CardColumnComponent cards={column} />
        )}
      />
      <StatusBar style="auto" />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: "100%",
    paddingHorizontal: 20,
    backgroundColor: "#e0e0e0",
  },
});

export default observer(App);
