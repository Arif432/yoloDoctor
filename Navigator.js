import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CameraAccessScreen from "./screens/cameraAccess/CameraAccessScreen";

const Stack = createNativeStackNavigator();
const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CameraAccessScreen"
        options={{ headerShown: false }}
        component={CameraAccessScreen}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
