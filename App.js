import React, { useCallback, useMemo, useState, useEffect } from "react";
import { Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootSiblingParent } from "react-native-root-siblings";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./Navigator"; // Import the AppNavigator

export default function App() {

  return (
    <RootSiblingParent>
        <SafeAreaProvider>
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
        </SafeAreaProvider>
    </RootSiblingParent>
  );
}
