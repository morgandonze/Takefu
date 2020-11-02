import { StatusBar } from "expo-status-bar";
import { observer, Provider } from "mobx-react";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import CardColumnComponent from "./src/components/CardColumnComponent";
import { Card } from "./src/models/Card";
import CardStore from "./src/stores/CardStore";

const cardStore = new CardStore();

// cardStore.addCard({
//   id: 0,
//   content: "root card",
//   index: 0,
//   level: 0,
// });

function App() {
  const [, setCards] = useState<Card[]>([]);

  useEffect(() => {
    const setupCardStore = async function () {
      // await cardStore.saveCards()
      await cardStore.loadCards();
      setCards(cardStore.cards);
    };

    setupCardStore();
  }, []);

  return (
    <Provider cardStore={cardStore}>
      <View style={styles.container}>
        <CardColumnComponent
          cards={cardStore.cards.slice()}
        />
        <StatusBar style="auto" />
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "flex-start",
  },
});

export default observer(App);
