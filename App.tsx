import { StatusBar } from "expo-status-bar";
import { observer, Provider } from "mobx-react";
import React, { useEffect } from "react";
import { Dimensions, FlatList, ScrollView, StyleSheet } from "react-native";
import CardColumnComponent from "./src/components/CardColumnComponent";
import { Card } from "./src/models/Card";
import CardStore from "./src/stores/CardStore";

const cardStore = new CardStore();
let reset: boolean;
reset = false; // switch to true and back to reset
// reset = true

if (reset) {
  cardStore.addCard("0");
}

function App() {
  useEffect(() => {
    const setupCardStore = async function () {
      if (reset) {
        await cardStore.saveCards();
      }
      await cardStore.loadCards();
      cardStore.focusRoot();
    };

    setupCardStore();
  }, []);

  return (
    <Provider cardStore={cardStore}>
      <div
        style={{ height: "100%" }}
        onKeyPress={(e) => {
          const key = e.key;
          if (key == "Enter") {
          }
        }}
        onKeyDown={(e) => {
          const key = e.nativeEvent.key;
          if (key == "ArrowDown" && cardStore.focused) {
            cardStore.focusSibling(1);
          } else if (key == "ArrowUp" && cardStore.focused) {
            cardStore.focusSibling(-1);
          } else if (key == "ArrowRight" && cardStore.focused) {
            cardStore.focusChildren();
          } else if (key == "ArrowLeft" && cardStore.focused) {
            cardStore.focusParent();
          } else {
            console.log(key);
          }
        }}
      >
        <ScrollView horizontal style={styles.scrollView}>
          <FlatList
            data={Object.values(cardStore.columns)}
            contentContainerStyle={styles.container}
            keyExtractor={(item: Card[], index) => `${index}-column`}
            renderItem={({ item: column }) => (
              <CardColumnComponent cards={column} />
            )}
          />
        </ScrollView>
      </div>
      <StatusBar style="auto" />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: "100%",
    paddingHorizontal: 20,
    backgroundColor: "#424242",
    width: Dimensions.get("window").width,
  },
  scrollView: { width: Dimensions.get("window").width, height: "100%" },
});

export default observer(App);
