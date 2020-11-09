import { StatusBar } from "expo-status-bar";
import { observer, Provider } from "mobx-react";
import React, { useEffect } from "react";
import { Dimensions, FlatList, ScrollView, StyleSheet, View } from "react-native";
import CardColumnComponent from "./src/components/CardColumnComponent";
import { Card } from "./src/models/Card";
import CardStore from "./src/stores/CardStore";

const cardStore = new CardStore();
let reset: boolean;
reset = false; // switch to true and back to reset
// reset = true;

if (reset) {
  cardStore.addRootCard();
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
    <View></View>
  );
}

const styles = StyleSheet.create({});

export default observer(App);
