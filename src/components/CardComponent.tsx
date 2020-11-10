import { observer } from "mobx-react";
import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Card } from "../models/Card";

import { MobXProviderContext } from "mobx-react";
function useStores() {
  return React.useContext(MobXProviderContext);
}

export default observer(function CardComponent(props: { card: Card }) {
  const {card} = props
  return (
    <View>
      <Text>{card.content}</Text>
    </View>
  )
});
