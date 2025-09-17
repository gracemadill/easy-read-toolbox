import React from "react";
import { SafeAreaView, View, Text, Pressable, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { apiBaseUrl } from "../services/api";

const DOCS_URL = "https://expressjs.com/";

export default function Profile() {
  const insets = useSafeAreaInsets();

  const handleOpenDocs = async () => {
    try {
      const supported = await Linking.canOpenURL(DOCS_URL);
      if (supported) {
        await Linking.openURL(DOCS_URL);
      }
    } catch (err) {
      // swallow linking errors
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View
        style={{
          flex: 1,
          paddingTop: 24,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 8 }}>
          Project status
        </Text>
        <Text style={{ color: "#6b7280", marginBottom: 24 }}>
          The Easy Read Toolkit demo bundles a Node.js API and an Expo client so you can
          explore the complete workflow locally.
        </Text>

        <View
          style={{
            backgroundColor: "#F9FAFB",
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            marginBottom: 20,
          }}
        >
          <Text style={{ fontWeight: "700", marginBottom: 6 }}>Connected API</Text>
          <Text style={{ color: "#374151", marginBottom: 12 }}>{apiBaseUrl}</Text>
          <Text style={{ color: "#6b7280", lineHeight: 20 }}>
            Use the <Text style={{ fontWeight: "600" }}>EXPO_PUBLIC_API_URL</Text> environment
            variable when running on a device so the mobile app can reach your Node.js
            server.
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            marginBottom: 20,
          }}
        >
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>Run everything locally</Text>
          <Text style={{ color: "#4b5563", lineHeight: 22 }}>
            1. Install dependencies inside <Text style={{ fontWeight: "600" }}>backend/</Text> and run
            <Text style={{ fontWeight: "600" }}> npm start</Text> to boot the API.
          </Text>
          <Text style={{ color: "#4b5563", lineHeight: 22, marginTop: 6 }}>
            2. In <Text style={{ fontWeight: "600" }}>frontend/</Text>, run <Text style={{ fontWeight: "600" }}>npm start</Text> and choose web or Expo
            Go.
          </Text>
          <Text style={{ color: "#4b5563", lineHeight: 22, marginTop: 6 }}>
            3. Open the Documents tab to add notes and try the easy-read suggestions on the
            Home tab.
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "#FEF3C7",
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: "#FDE68A",
          }}
        >
          <Text style={{ fontWeight: "700", marginBottom: 8 }}>Next steps</Text>
          <Text style={{ color: "#92400E", lineHeight: 20, marginBottom: 12 }}>
            Swap the stubbed AI rewrite logic with your preferred language model provider
            and wire the floating button actions to real capture flows (camera, PDF
            upload, or URL import).
          </Text>
          <Pressable
            onPress={handleOpenDocs}
            style={{ paddingVertical: 10 }}
            hitSlop={6}
          >
            <Text style={{ color: "#B45309", fontWeight: "600" }}>
              Review Express documentation
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
