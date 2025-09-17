import React, { useState } from "react";
import { View, Text, TouchableOpacity, Pressable, Modal, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FloatingButton({
  size = 64,
  color = "#CC1E45",
  right = 16,
  extraOffset = 12,
  tabBarHeight = 64,
  accessibilityLabel = "Add document",
  onPrimaryAction,
  onSecondaryAction,
  primaryLabel = "Add note",
  secondaryLabel = "Add sample",
}) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [fallbackModal, setFallbackModal] = useState(null);

  const radius = size / 2;
  const fabBottom = insets.bottom + tabBarHeight + extraOffset;
  const menuBottom = fabBottom + size + 12;

  const handlePrimary = () => {
    setOpen(false);
    if (onPrimaryAction) {
      onPrimaryAction();
    } else {
      setFallbackModal("primary");
    }
  };

  const handleSecondary = () => {
    setOpen(false);
    if (onSecondaryAction) {
      onSecondaryAction();
    } else {
      setFallbackModal("secondary");
    }
  };

  return (
    <>
      {open && (
        <Pressable
          style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
          onPress={() => setOpen(false)}
        />
      )}

      {open && (
        <View
          style={{
            position: "absolute",
            right,
            bottom: menuBottom,
            backgroundColor: color,
            borderRadius: 24,
            padding: 12,
            width: 260,
            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 8,
          }}
        >
          <View style={{ alignItems: "flex-end" }}>
            <TouchableOpacity onPress={() => setOpen(false)} hitSlop={10}>
              <Text style={{ color: "white", fontSize: 22, fontWeight: "800" }}>✕</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handlePrimary}
            activeOpacity={0.9}
            style={{
              backgroundColor: "white",
              borderRadius: 24,
              paddingVertical: 14,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            <Text style={{ fontWeight: "700" }}>{primaryLabel}</Text>
            <Text>[＋]</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSecondary}
            activeOpacity={0.9}
            style={{
              backgroundColor: "white",
              borderRadius: 24,
              paddingVertical: 14,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            <Text style={{ fontWeight: "700" }}>{secondaryLabel}</Text>
            <Text>[☆]</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        onPress={() => setOpen((value) => !value)}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={{
          position: "absolute",
          right,
          bottom: fabBottom,
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: color,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
        {...(Platform.OS === "android"
          ? { android_ripple: { color: "rgba(255,255,255,0.15)", radius } }
          : {})}
      >
        <Text
          style={{
            color: "white",
            fontSize: size * 0.5,
            fontWeight: "900",
            lineHeight: size * 0.55,
          }}
        >
          +
        </Text>
      </TouchableOpacity>

      <Modal
        visible={!!fallbackModal}
        transparent
        animationType="fade"
        onRequestClose={() => setFallbackModal(null)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            padding: 24,
          }}
          onPress={() => setFallbackModal(null)}
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
              <Text style={{ fontSize: 18, fontWeight: "700" }}>Action unavailable</Text>
              <Pressable onPress={() => setFallbackModal(null)} hitSlop={8}>
                <Text style={{ fontSize: 18 }}>✕</Text>
              </Pressable>
            </View>
            <Text style={{ color: "#6b7280" }}>
              {fallbackModal === "primary"
                ? "Connect this action to your workflow by passing an onPrimaryAction prop."
                : "Connect this action to your workflow by passing an onSecondaryAction prop."}
            </Text>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
