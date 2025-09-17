import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { rewriteSentence, apiBaseUrl } from "../services/api";

export default function Home() {
  const insets = useSafeAreaInsets();
  const [sentence, setSentence] = useState("");
  const [keepTermsRaw, setKeepTermsRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const keepTerms = useMemo(
    () =>
      keepTermsRaw
        .split(",")
        .map((term) => term.trim())
        .filter(Boolean),
    [keepTermsRaw]
  );

  const handleSubmit = async () => {
    const trimmed = sentence.trim();
    if (!trimmed) {
      setError("Please enter a sentence to rewrite.");
      setResults([]);
      setSubmitted(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSubmitted(true);
      const candidates = await rewriteSentence({ sentence: trimmed, keepTerms });
      setResults(candidates);
    } catch (err) {
      setError(err.message || "Unable to contact the server.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSentence("");
    setKeepTermsRaw("");
    setResults([]);
    setSubmitted(false);
    setError(null);
  };

  const handleShare = async (text) => {
    try {
      await Share.share({ message: text });
    } catch (err) {
      // ignore share errors
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: insets.bottom + 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 8 }}>
            Rewrite assistant
          </Text>
          <Text style={{ color: "#6b7280", lineHeight: 20 }}>
            Paste a complex sentence and the toolkit will suggest simpler versions. You
            can list any words that must stay in the sentence.
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "#F9FAFB",
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: "#e5e7eb",
          }}
        >
          <Text style={{ fontWeight: "600", marginBottom: 8 }}>Original sentence</Text>
          <TextInput
            value={sentence}
            onChangeText={setSentence}
            placeholder="Type or paste the sentence you want to simplify"
            multiline
            textAlignVertical="top"
            style={{
              borderWidth: 1,
              borderColor: "#d1d5db",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 12,
              minHeight: 120,
              maxHeight: 200,
              backgroundColor: "white",
            }}
          />

          <Text style={{ fontWeight: "600", marginVertical: 12 }}>
            Words to keep (optional)
          </Text>
          <TextInput
            value={keepTermsRaw}
            onChangeText={setKeepTermsRaw}
            placeholder="Comma separated list, e.g. policy, safeguarding"
            style={{
              borderWidth: 1,
              borderColor: "#d1d5db",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              backgroundColor: "white",
            }}
          />

          <View
            style={{
              flexDirection: "row",
              marginTop: 16,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={{
                backgroundColor: loading ? "#d1d5db" : "#961A36",
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 999,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#4b5563" />
              ) : (
                <Text style={{ color: "white", fontWeight: "700" }}>Generate</Text>
              )}
            </Pressable>

            <Pressable
              onPress={handleReset}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "#d1d5db",
              }}
            >
              <Text style={{ color: "#4b5563", fontWeight: "600" }}>Clear</Text>
            </Pressable>
          </View>

          {error ? (
            <View
              style={{
                marginTop: 16,
                padding: 12,
                borderRadius: 12,
                backgroundColor: "#FEF2F2",
                borderWidth: 1,
                borderColor: "#FECACA",
              }}
            >
              <Text style={{ color: "#B91C1C" }}>{error}</Text>
            </View>
          ) : null}
        </View>

        {submitted ? (
          <View style={{ marginTop: 32 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
              Suggestions
            </Text>
            {loading ? (
              <View style={{ alignItems: "center", paddingVertical: 24 }}>
                <ActivityIndicator size="small" color="#961A36" />
              </View>
            ) : results.length ? (
              results.map((text, index) => (
                <View
                  key={`${index}-${text.slice(0, 12)}`}
                  style={{
                    backgroundColor: "white",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
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
                    <Text style={{ fontWeight: "700" }}>Option {index + 1}</Text>
                    <Pressable
                      onPress={() => handleShare(text)}
                      hitSlop={10}
                      style={{ paddingHorizontal: 8, paddingVertical: 4 }}
                    >
                      <Text style={{ color: "#961A36", fontWeight: "600" }}>Share</Text>
                    </Pressable>
                  </View>
                  <Text style={{ lineHeight: 22, color: "#374151" }}>{text}</Text>
                </View>
              ))
            ) : (
              <Text style={{ color: "#6b7280" }}>
                No alternative phrasing yet. Try a shorter sentence or remove some terms
                from the keep list.
              </Text>
            )}
          </View>
        ) : null}

        <View style={{ marginTop: 40, borderTopWidth: 1, borderTopColor: "#e5e7eb" }}>
          <Text style={{ marginTop: 16, color: "#6b7280", fontSize: 12 }}>
            API server: {apiBaseUrl}
          </Text>
          <Text style={{ marginTop: 4, color: "#9ca3af", fontSize: 12 }}>
            Set EXPO_PUBLIC_API_URL to point at a remote server when running on a
            device.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
