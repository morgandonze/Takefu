import { StatusBar } from "expo-status-bar";
import { observer, Provider } from "mobx-react";
import React, { useEffect } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import CardColumnComponent from "./src/components/CardColumnComponent";
import Level from "./src/components/Level";
import { Card } from "./src/models/Card";
import CardStore from "./src/stores/CardStore";

const cardStore = new CardStore();
let reset: boolean;
reset = false; // switch to true and back to reset
// reset = true;

let rootCard: Card;
if (reset) {
  rootCard = cardStore.addRootCard();
}

function App() {
  useEffect(() => {
    const setupCardStore = async function () {
      if (reset) {
        cardStore.addCard("card 1", rootCard.id);
        const card2 = cardStore.addCard("card 2", rootCard.id) as Card;
        cardStore.addCard("card 3", card2.id);
        await cardStore.saveCards();
      }
      await cardStore.loadCards();
    };

    setupCardStore();
  }, []);

  // const levels = cardStore.levels();
  // console.log("LEVELS", levels.map(level => level.groups.slice()));
  // let group =cardStore.level(1).groups[0]
  // console.log(group && group.cards.map(c => c.content));

  let levels = cardStore.levels();
  console.log(levels);

  // iterate over levels
  // in each level, iterate over groups
  // in each group, iterate over cards
  return (
    <ScrollView    >
      <FlatList
        data={levels}
        contentContainerStyle={{
          flex: 1,
          flexDirection: "row"
        }}
        renderItem={({ item: level }) => <Level level={level} />}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({});

export default observer(App);
