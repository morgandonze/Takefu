import { StatusBar } from "expo-status-bar";
import { observer, Provider } from "mobx-react";
import React, { useEffect } from "react";
import { FlatList, StyleSheet } from "react-native";
import CardColumnComponent from "./src/components/CardColumnComponent";
import CardStore from "./src/stores/CardStore";

const cardStore = new CardStore();
let reset: boolean;
reset = false;

if (reset) {
  cardStore.addCard("Root Card");
}

function App() {
  useEffect(() => {
    const setupCardStore = async function () {
      if (reset) {
        await cardStore.saveCards();
      }
      await cardStore.loadCards();
    };

    setupCardStore();
  }, []);

  return (
    <Provider cardStore={cardStore}>
      <FlatList
        data={Object.values(cardStore.columns)}
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
    backgroundColor: "#d0d0d0",
  },
});

export default observer(App);
