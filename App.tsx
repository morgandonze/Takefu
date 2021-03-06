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
import UIStore from "./src/stores/UIStore";

const cardStore = new CardStore();
const uiStore = new UIStore();
let reset: boolean;
reset = false; // switch to true and back to reset
// reset = true;

let rootCard: Card;
let root2: Card;
if (reset) {
  rootCard = cardStore.addRootCard();
  // root2 = cardStore.addRootCard();
}

function App() {
  useEffect(() => {
    const setupCardStore = async function () {
      if (reset) {
        // cardStore.addCard("card 1", rootCard.id);
        // cardStore.addCard("card 1", root2.id);
        // const card2 = cardStore.addCard("card 2", rootCard.id) as Card;
        // cardStore.addCard("card 3", card2.id);
        await cardStore.saveCards();
      }
      await cardStore.loadCards();
    };

    setupCardStore();
  }, []);

  let levels = cardStore.levels();

  const cardSorter = (cardA: Card, cardB: Card) => {
    return cardA.order < cardB.order ? -1 : cardB.order < cardA.order ? 1 : 0;
  };

  const onDragEnd = (event: any) => {
    const { source, destination: dest } = event;
    const sourceDrop: string = source.droppableId;
    const destDrop: string = dest.droppableId;
    const [, sourceLevel, sourceGroup] = sourceDrop.split("-");
    const [, destLevel, destGroup] = destDrop.split("-");

    const card = cardStore.getCardByPosition(
      parseInt(sourceLevel),
      parseInt(sourceGroup),
      source.index
    );

    if (!card) return;

    if (sourceDrop == destDrop) {
      cardStore.changeCardOrder(card.id, dest.index);
    } else {
      const newParentId: string | null = ((levels[
        parseInt(destLevel)
      ] as LevelType).groups[parseInt(destGroup)] as CardGroup).parentId;

      if (!newParentId) return;
      cardStore.changeCardGroup(card.id, newParentId, dest.index);
    }
  };

  return (
    <Provider cardStore={cardStore} uiStore={uiStore}>
      <DragDropContext onDragEnd={onDragEnd}>
        <View style={styles.container0}>
          {levels.map((level: LevelType, levelIndex: number) => (
            <View style={styles.level} key={`level-${levelIndex}-view`}>
              {level.groups.map((group: CardGroup, groupIndex: number) => (
                <View style={styles.group} key={`group-${groupIndex}-view`}>
                  <Droppable
                    droppableId={`column-${levelIndex}-${groupIndex}`}
                    key={`column-${levelIndex}-${groupIndex}`}
                    type="GROUP"
                  >
                    {(provided: any, snapshot: any) => (
                      <View
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {group.cards
                          .sort(cardSorter)
                          .map((card: Card, cardIndex: number) => (
                            <CardComponent
                              card={card}
                              index={cardIndex}
                              key={`card-component-${cardIndex}`}
                            />
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
    </Provider>
  );
}

const styles = StyleSheet.create({
  container0: {
    flexDirection: "row",
    display: "flex",
    height: "100%",
    backgroundColor: "#212121",
    padding: 10,
  },
  container: {
    flexDirection: "row",
  },
  level: {
    marginRight: 5,
  },
  group: {
    borderBottomWidth: 1,
    borderBottomColor: "#424242",
    // borderBottomRightRadius: 3,
    // borderBottomLeftRadius: 3,
    paddingVertical: 4,
  },
});

export default observer(App);
