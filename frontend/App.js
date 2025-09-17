import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";

import Home from "./pages/home";
import Document from "./pages/document";
import Profile from "./pages/profile";

import Navbar from "./components/Navbar";
import AppHeader from "./components/AppHeader";

const Tab = createBottomTabNavigator();

export default function App() {
   return (
      <SafeAreaProvider>
         <NavigationContainer>
            <Tab.Navigator
               initialRouteName="Home"
               screenOptions={{ headerShown: false }}
               tabBar={(props) => <Navbar {...props} />}
            >
               <Tab.Screen
                  name="Home"
                  component={Home}
                  options={{
                     tabBarLabel: "Home",
                     headerShown: true,
                     header: () => <AppHeader title="THE Easy Read TOOLBOX" />,
                  }}
               />
               <Tab.Screen
                  name="Files"
                  component={Document}
                  options={{
                     tabBarLabel: "Files",
                     headerShown: true,
                     header: () => <AppHeader title="THE Easy Read TOOLBOX" />,
                  }}
               />
               <Tab.Screen
                  name="Menu"
                  component={Profile}
                  options={{ tabBarLabel: "Menu" }} // no header here
               />
            </Tab.Navigator>
         </NavigationContainer>
      </SafeAreaProvider>
   );
}
