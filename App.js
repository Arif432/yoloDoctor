import React from "react";
import { Provider as PaperProvider } from "react-native-paper"; // Import the Provider component
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootSiblingParent } from "react-native-root-siblings";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./Navigator"; // Import the AppNavigator

export default function App() {
  return (
    <PaperProvider>
      <RootSiblingParent>
        <SafeAreaProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </RootSiblingParent>
    </PaperProvider>
  );
}
