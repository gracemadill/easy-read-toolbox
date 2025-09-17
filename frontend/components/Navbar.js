import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Navbar({ state, descriptors, navigation }) {
   const insets = useSafeAreaInsets();

   return (
      <View
         style={{ backgroundColor: "#961A36", paddingBottom: insets.bottom }}
      >
         <View
            style={{
               height: 64,
               flexDirection: "row",
               alignItems: "center",
               justifyContent: "space-around",
               paddingVertical: 10,
            }}
         >
            {state.routes.map((route, index) => {
               const isFocused = state.index === index;
               const onPress = () => {
                  const event = navigation.emit({
                     type: "tabPress",
                     target: route.key,
                     canPreventDefault: true,
                  });
                  if (!isFocused && !event.defaultPrevented) {
                     navigation.navigate(route.name);
                  }
               };

               const label =
                  descriptors[route.key].options.tabBarLabel ??
                  descriptors[route.key].options.title ??
                  route.name;

               return (
                  <TouchableOpacity
                     key={route.key}
                     onPress={onPress}
                     style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 12,
                        backgroundColor: isFocused
                           ? "rgba(255,255,255,0.15)"
                           : "transparent",
                     }}
                  >
                     <Text style={{ color: "white", fontWeight: "700" }}>
                        {label}
                     </Text>
                  </TouchableOpacity>
               );
            })}
         </View>
      </View>
   );
}
