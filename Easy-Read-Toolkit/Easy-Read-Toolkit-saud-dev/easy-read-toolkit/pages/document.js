import React, { useState } from "react";
import {
   View,
   Text,
   SafeAreaView,
   FlatList,
   Modal,
   Pressable,
   Share,
   Alert,
} from "react-native";
import FloatingButton from "../components/FloatingButton";
import FileCard from "../components/FileCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Document() {
   const TAB_BAR_HEIGHT = 64;
   const insets = useSafeAreaInsets();

   const [showOpenFile, setShowOpenFile] = useState(false);

   // keep files in state so Delete can remove items
   const [files, setFiles] = useState(
      Array.from({ length: 15 }).map((_, i) => ({
         id: String(i + 1),
         title: `File ${i + 1}`,
         time: "2:38pm",
         date: "16/08/2025",
      }))
   );

   // which file’s kebab menu is open
   const [actionFor, setActionFor] = useState(null);

   const handleShare = async () => {
      if (!actionFor) return;
      try {
         await Share.share({
            title: actionFor.title,
            message: `${actionFor.title} — placeholder share (replace with real URL later).`,
         });
      } finally {
         setActionFor(null);
      }
   };

   const handleDelete = () => {
      if (!actionFor) return;
      Alert.alert("Delete file", `Permanently delete "${actionFor.title}"?`, [
         { text: "Cancel", style: "cancel" },
         {
            text: "Delete",
            style: "destructive",
            onPress: () => {
               setFiles((prev) => prev.filter((f) => f.id !== actionFor.id));
               setActionFor(null);
            },
         },
      ]);
   };

   return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
         <FlatList
            data={files}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
               <FileCard
                  title={item.title}
                  time={item.time}
                  date={item.date}
                  onPress={() => setShowOpenFile(true)}
                  onKebabPress={() => setActionFor(item)}
               />
            )}
            contentContainerStyle={{
               paddingTop: 20,
               paddingBottom: insets.bottom + 150,
            }}
         />

         <FloatingButton tabBarHeight={TAB_BAR_HEIGHT} onPress={() => {}} />

         {/* Coming Soon modal */}
         <Modal
            visible={showOpenFile}
            transparent
            animationType="fade"
            onRequestClose={() => setShowOpenFile(false)}
         >
            <Pressable
               style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.4)",
                  padding: 24,
                  justifyContent: "center",
               }}
               onPress={() => setShowOpenFile(false)}
            >
               <Pressable
                  onPress={() => {}}
                  style={{
                     backgroundColor: "white",
                     borderRadius: 16,
                     padding: 20,
                  }}
               >
                  <View
                     style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                     }}
                  >
                     <Text style={{ fontSize: 18, fontWeight: "700" }}>
                        Coming Soon!
                     </Text>
                     <Pressable
                        onPress={() => setShowOpenFile(false)}
                        hitSlop={8}
                     >
                        <Text style={{ fontSize: 18 }}>✕</Text>
                     </Pressable>
                  </View>
               </Pressable>
            </Pressable>
         </Modal>

         {/* Actions modal (Share / Delete) */}
         <Modal
            visible={!!actionFor}
            transparent
            animationType="fade"
            onRequestClose={() => setActionFor(null)}
         >
            <Pressable
               style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.4)",
                  justifyContent: "flex-end",
               }}
               onPress={() => setActionFor(null)}
            >
               <Pressable
                  onPress={() => {}}
                  style={{
                     backgroundColor: "white",
                     borderTopLeftRadius: 16,
                     borderTopRightRadius: 16,
                     paddingHorizontal: 20,
                     paddingTop: 16,
                     paddingBottom: insets.bottom + 12,
                  }}
               >
                  <View style={{ alignItems: "center", marginBottom: 12 }}>
                     <View
                        style={{
                           width: 44,
                           height: 4,
                           borderRadius: 2,
                           backgroundColor: "#e5e7eb",
                        }}
                     />
                  </View>

                  <Text
                     style={{
                        fontWeight: "700",
                        fontSize: 16,
                        marginBottom: 8,
                     }}
                  >
                     {actionFor?.title}
                  </Text>

                  <Pressable
                     onPress={handleShare}
                     style={{ paddingVertical: 14 }}
                  >
                     <Text style={{ fontSize: 16 }}>Share</Text>
                  </Pressable>

                  <View style={{ height: 1, backgroundColor: "#e5e7eb" }} />

                  <Pressable
                     onPress={handleDelete}
                     style={{ paddingVertical: 14 }}
                  >
                     <Text
                        style={{
                           fontSize: 16,
                           color: "#CC1E45",
                           fontWeight: "700",
                        }}
                     >
                        Delete
                     </Text>
                  </Pressable>
               </Pressable>
            </Pressable>
         </Modal>
      </SafeAreaView>
   );
}
