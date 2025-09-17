import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Modal,
  Pressable,
  Share,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import FloatingButton from "../components/FloatingButton";
import FileCard from "../components/FileCard";
import {
  fetchDocuments,
  fetchDocument,
  deleteDocument,
  createTextDocument,
} from "../services/api";

const TAB_BAR_HEIGHT = 64;
const SAMPLE_TEXT = `All staff must check that visitors are wearing their badges.
If a visitor does not have a badge, take them to the welcome desk.

The welcome desk will print a badge and record their arrival.`;

const initialViewerState = {
  visible: false,
  document: null,
  loading: false,
  error: null,
};

export default function Document() {
  const insets = useSafeAreaInsets();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [actionFor, setActionFor] = useState(null);
  const [viewerState, setViewerState] = useState(initialViewerState);
  const [manualVisible, setManualVisible] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualText, setManualText] = useState("");
  const [manualSaving, setManualSaving] = useState(false);
  const [creatingSample, setCreatingSample] = useState(false);

  const resetViewer = useCallback(
    () => setViewerState(initialViewerState),
    []
  );

  const formatTimestamp = useCallback((iso) => {
    if (!iso) return { dateLabel: "", timeLabel: "" };
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return { dateLabel: "", timeLabel: "" };
    }
    return {
      dateLabel: date.toLocaleDateString(),
      timeLabel: date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    };
  }, []);

  const loadDocuments = useCallback(async () => {
    const data = await fetchDocuments();
    setDocuments(data);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDocuments();
        if (mounted) {
          setDocuments(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Unable to load documents");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      await loadDocuments();
    } catch (err) {
      setError(err.message || "Unable to refresh documents");
    } finally {
      setRefreshing(false);
    }
  }, [loadDocuments]);

  const handleOpenDocument = useCallback(
    async (doc) => {
      setViewerState({ visible: true, document: doc, loading: true, error: null });
      try {
        const detail = await fetchDocument(doc.id);
        setViewerState({
          visible: true,
          document: detail,
          loading: false,
          error: null,
        });
      } catch (err) {
        setViewerState({
          visible: true,
          document: doc,
          loading: false,
          error: err.message || "Unable to open the document.",
        });
      }
    },
    []
  );

  const handleShare = useCallback(async () => {
    if (!actionFor) return;
    try {
      const detail = await fetchDocument(actionFor.id);
      const message =
        detail.text?.trim() || detail.note || "No text available for this document.";
      await Share.share({ title: detail.title, message });
    } catch (err) {
      Alert.alert("Unable to share", err.message || "Please try again later.");
    } finally {
      setActionFor(null);
    }
  }, [actionFor]);

  const confirmDelete = useCallback(() => {
    if (!actionFor) return;
    Alert.alert("Delete document", `Permanently delete "${actionFor.title}"?`, [
      { text: "Cancel", style: "cancel", onPress: () => setActionFor(null) },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDocument(actionFor.id);
            setDocuments((prev) => prev.filter((doc) => doc.id !== actionFor.id));
          } catch (err) {
            Alert.alert("Unable to delete", err.message || "Please try again later.");
          } finally {
            setActionFor(null);
          }
        },
      },
    ]);
  }, [actionFor]);

  const handleManualSubmit = useCallback(async () => {
    const trimmedText = manualText.trim();
    const trimmedTitle = manualTitle.trim();

    if (!trimmedText) {
      Alert.alert("Add document", "Please enter some text before saving.");
      return;
    }

    try {
      setManualSaving(true);
      const document = await createTextDocument({
        title: trimmedTitle || undefined,
        text: trimmedText,
      });

      setDocuments((prev) => [document, ...prev.filter((item) => item.id !== document.id)]);
      setManualText("");
      setManualTitle("");
      setManualVisible(false);
    } catch (err) {
      Alert.alert("Unable to save", err.message || "Please try again later.");
    } finally {
      setManualSaving(false);
    }
  }, [manualText, manualTitle]);

  const handleAddSample = useCallback(async () => {
    try {
      setCreatingSample(true);
      const document = await createTextDocument({
        title: "Visitor badge policy (sample)",
        text: SAMPLE_TEXT,
        note: "Sample policy added from the Easy Read Toolkit app.",
        source: "Sample content",
      });
      setDocuments((prev) => [document, ...prev.filter((item) => item.id !== document.id)]);
    } catch (err) {
      Alert.alert("Unable to add sample", err.message || "Please try again later.");
    } finally {
      setCreatingSample(false);
    }
  }, []);

  const listEmptyComponent = useMemo(
    () => (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 48,
          paddingHorizontal: 24,
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#961A36" />
        ) : (
          <>
            <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
              No documents yet
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6b7280",
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              Add your first note or create a sample document to see how the library
              works.
            </Text>
            <Pressable
              onPress={handleAddSample}
              disabled={creatingSample}
              style={{
                backgroundColor: creatingSample ? "#e5e7eb" : "#961A36",
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 999,
              }}
            >
              <Text style={{ color: creatingSample ? "#6b7280" : "white", fontWeight: "700" }}>
                {creatingSample ? "Working…" : "Add sample document"}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    ),
    [creatingSample, handleAddSample, loading]
  );

  const renderItem = useCallback(
    ({ item }) => {
      const { dateLabel, timeLabel } = formatTimestamp(item.createdAt);
      return (
        <FileCard
          title={item.title}
          time={timeLabel}
          date={dateLabel}
          snippet={item.snippet}
          note={item.note}
          type={item.type}
          onPress={() => handleOpenDocument(item)}
          onKebabPress={() => setActionFor(item)}
        />
      );
    },
    [formatTimestamp, handleOpenDocument]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={listEmptyComponent}
        ListHeaderComponent={
          error ? (
            <View
              style={{
                marginHorizontal: 16,
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
          ) : null
        }
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: insets.bottom + 150,
        }}
      />

      <FloatingButton
        tabBarHeight={TAB_BAR_HEIGHT}
        onPrimaryAction={() => setManualVisible(true)}
        onSecondaryAction={handleAddSample}
      />

      <Modal
        visible={viewerState.visible}
        transparent
        animationType="fade"
        onRequestClose={resetViewer}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            padding: 24,
            justifyContent: "center",
          }}
          onPress={resetViewer}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              maxHeight: "90%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#e5e7eb",
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "700", flex: 1 }}>
                {viewerState.document?.title}
              </Text>
              <Pressable onPress={resetViewer} hitSlop={10}>
                <Text style={{ fontSize: 20 }}>✕</Text>
              </Pressable>
            </View>

            {viewerState.loading ? (
              <View
                style={{
                  padding: 24,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ActivityIndicator size="small" color="#961A36" />
                <Text style={{ marginTop: 12, color: "#6b7280" }}>
                  Loading document…
                </Text>
              </View>
            ) : viewerState.error ? (
              <View style={{ padding: 24 }}>
                <Text style={{ color: "#B91C1C", marginBottom: 12 }}>
                  {viewerState.error}
                </Text>
                <Pressable
                  onPress={() => handleOpenDocument(viewerState.document)}
                  style={{
                    alignSelf: "flex-start",
                    backgroundColor: "#961A36",
                    paddingHorizontal: 18,
                    paddingVertical: 10,
                    borderRadius: 999,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "700" }}>Retry</Text>
                </Pressable>
              </View>
            ) : (
              <ScrollView
                style={{ paddingHorizontal: 20, paddingVertical: 16 }}
                showsVerticalScrollIndicator={false}
              >
                {viewerState.document?.note ? (
                  <Text style={{ color: "#6b7280", marginBottom: 12 }}>
                    {viewerState.document.note}
                  </Text>
                ) : null}
                <Text style={{ fontSize: 16, lineHeight: 24 }}>
                  {viewerState.document?.text?.trim() || "No text captured yet."}
                </Text>
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={manualVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!manualSaving) {
            setManualVisible(false);
          }
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.4)",
              padding: 24,
              justifyContent: "center",
            }}
            onPress={() => {
              if (!manualSaving) {
                setManualVisible(false);
              }
            }}
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
                  marginBottom: 12,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "700" }}>
                  Add a quick note
                </Text>
                <Pressable
                  onPress={() => {
                    if (!manualSaving) {
                      setManualVisible(false);
                    }
                  }}
                  hitSlop={10}
                >
                  <Text style={{ fontSize: 20 }}>✕</Text>
                </Pressable>
              </View>

              <TextInput
                placeholder="Title (optional)"
                value={manualTitle}
                onChangeText={setManualTitle}
                style={{
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  marginBottom: 12,
                }}
              />

              <TextInput
                placeholder="Write or paste the text you want to keep"
                value={manualText}
                onChangeText={setManualText}
                multiline
                textAlignVertical="top"
                style={{
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  minHeight: 140,
                  maxHeight: 260,
                  marginBottom: 16,
                }}
              />

              <Pressable
                onPress={handleManualSubmit}
                disabled={manualSaving}
                style={{
                  backgroundColor: manualSaving ? "#d1d5db" : "#961A36",
                  paddingVertical: 12,
                  borderRadius: 999,
                  alignItems: "center",
                }}
              >
                {manualSaving ? (
                  <ActivityIndicator size="small" color="#4b5563" />
                ) : (
                  <Text style={{ color: "white", fontWeight: "700" }}>
                    Save to library
                  </Text>
                )}
              </Pressable>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

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

            <Pressable onPress={handleShare} style={{ paddingVertical: 14 }}>
              <Text style={{ fontSize: 16 }}>Share text</Text>
            </Pressable>

            <View style={{ height: 1, backgroundColor: "#e5e7eb" }} />

            <Pressable onPress={confirmDelete} style={{ paddingVertical: 14 }}>
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

      <Modal
        visible={creatingSample}
        transparent
        animationType="fade"
        onRequestClose={() => setCreatingSample(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(255,255,255,0.6)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 24,
              borderRadius: 16,
              alignItems: "center",
              width: 240,
            }}
          >
            <ActivityIndicator size="small" color="#961A36" />
            <Text style={{ marginTop: 12, textAlign: "center", color: "#6b7280" }}>
              Adding sample document…
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
