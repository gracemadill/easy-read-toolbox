import React from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BAR_HEIGHT = 56;

export default function AppHeader({ title = "THE Easy Read TOOLBOX" }) {
   const insets = useSafeAreaInsets();

   return (
      <View
         style={{
            backgroundColor: "#961A36",
            paddingTop: insets.top,
            height: insets.top + BAR_HEIGHT,
            borderBottomWidth: 1,
            borderBottomColor: "rgba(255,255,255,0.2)",
            justifyContent: "center",
         }}
      >
         <View
            style={{
               height: BAR_HEIGHT,
               flexDirection: "row",
               alignItems: "center",
               justifyContent: "space-between",
               paddingHorizontal: 16,
            }}
         >
            <Text style={{ color: "white", fontWeight: "800" }}>logo</Text>

            <View
               pointerEvents="none"
               style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  height: BAR_HEIGHT,
                  alignItems: "center",
                  justifyContent: "center",
               }}
            >
               <Text style={{ color: "white", fontWeight: "800" }}>
                  {title}
               </Text>
            </View>

            <Text style={{ color: "white", opacity: 0 }}>menu</Text>
         </View>
      </View>
   );
}
