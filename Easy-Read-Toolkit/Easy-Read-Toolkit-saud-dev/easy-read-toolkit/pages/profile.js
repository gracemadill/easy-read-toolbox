import React from "react";
import { View, Text, SafeAreaView } from "react-native";

export default function Profile() {
   return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
         <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
         >
            <Text style={{ fontSize: 20, fontWeight: "600" }}>
               Profile Placeholder Page
            </Text>
         </View>
      </SafeAreaView>
   );
}
