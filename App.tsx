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
import CardStore, { CardGroup, LevelType } from "./src/stores/CardStore";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import CardComponent from "./src/components/CardComponent";

const cardStore = new CardStore();
let reset: boolean;
reset = false; // switch to true and back to reset
// reset = true;

let rootCard: Card;
let root2: Card;
if (reset) {
  rootCard = cardStore.addRootCard();
  root2 = cardStore.addRootCard();
}

function App() {
  useEffect(() => {
    const setupCardStore = async function () {
      if (reset) {
        cardStore.addCard("card 1", rootCard.id);
        cardStore.addCard("card 1", root2.id);
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

  const onDragEnd = (event: any) => {};

  // iterate over levels
  // in each level, iterate over groups
  // in each group, iterate over cards
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <View style={styles.container0}>
        {levels.map((level: LevelType, levelIndex: number) => (
          <View style={styles.level}>
            {level.groups.map((group: CardGroup, groupIndex: number) => (
              <View style={styles.group}>
                <Droppable
                  droppableId={`column-${levelIndex}-${groupIndex}`}
                  key={`column-${levelIndex}-${groupIndex}`}
                  type="GROUP"
                >
                  {(provided: any, snapshot: any) => (
                    <View ref={provided.innerRef} {...provided.droppableProps}>
                      {group.cards.map((card: Card, cardIndex: number) => (
                        <CardComponent card={card} index={cardIndex} />
                      ))}
                      {provided.placeholder}
                    </View>
                  )}
                </Droppable>
              </View>
            ))}
          </View>
        ))}
      </View>
    </DragDropContext>
  );
}

const styles = StyleSheet.create({
  container0: {
    flexDirection: "row",
    display: "flex",
    height: "100%",
    backgroundColor: "#ccc",
  },
  container: {
    flexDirection: "row",
    backgroundColor: "#ccc",
  },
  level: {
    // width: 200,
    margin: 10,
  },
  group: {
    borderWidth: 1,
    borderColor: "#eee",
    marginVertical: 2,
  },
});

export default observer(App);
