import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";

const typeLabels = {
  image: "Image OCR",
  pdf: "PDF upload",
  text: "Manual note",
};

export default function FileCard({
  title = "Document",
  time = "",
  date = "",
  snippet,
  note,
  type = "text",
  onPress,
  onKebabPress,
}) {
  const typeLabel = typeLabels[type] || "Document";

  const metaLabel = useMemo(() => {
    const parts = [typeLabel];
    if (note && !snippet) {
      parts.push(note);
    }
    return parts.filter(Boolean).join(" · ");
  }, [note, snippet, typeLabel]);

  const timeLabel = useMemo(() => {
    return [date, time].filter(Boolean).join(" · ");
  }, [date, time]);

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
        <Text style={{ fontWeight: "800", fontSize: 18, flex: 1 }}>{title}</Text>
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

      <Text
        numberOfLines={2}
        style={{ color: "#4b5563", marginTop: 12, lineHeight: 20 }}
      >
        {snippet?.trim() || note || "No text captured yet."}
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 14,
        }}
      >
        <Text style={{ color: "#6b7280", fontSize: 13 }}>{metaLabel}</Text>
        <Text style={{ color: "#6b7280", fontSize: 13 }}>{timeLabel}</Text>
      </View>

      {note && snippet ? (
        <Text
          style={{
            marginTop: 6,
            color: "#9ca3af",
            fontSize: 12,
            fontStyle: "italic",
          }}
        >
          {note}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}
