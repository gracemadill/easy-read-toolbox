import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function FileCard({
   title = "File Name",
   time = "2:38pm",
   date = "16/08/2025",
   onPress,
   onKebabPress,
}) {
   return (
      <TouchableOpacity
         activeOpacity={0.85}
         onPress={onPress}
         style={{
            backgroundColor: "white",
            borderRadius: 18,
            paddingVertical: 16,
            paddingHorizontal: 20,
            marginBottom: 16,
            marginHorizontal: 16,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
         }}
      >
         <View
            style={{
               flexDirection: "row",
               justifyContent: "space-between",
               alignItems: "center",
            }}
         >
            <Text style={{ fontWeight: "800", fontSize: 18 }}>{title}</Text>
            <TouchableOpacity
               onPress={onKebabPress}
               style={{
                  width: 40,
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 20,
               }}
               hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
               <Text style={{ fontSize: 22 }}>⋮</Text>
            </TouchableOpacity>
         </View>

         <View
            style={{
               flexDirection: "row",
               justifyContent: "space-between",
               marginTop: 10,
            }}
         >
            <Text style={{ color: "#6b7280", fontSize: 14 }}>
               Scanned {time}
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 14 }}>{date}</Text>
         </View>
      </TouchableOpacity>
   );
}
