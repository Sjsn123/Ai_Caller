import { Stack } from "expo-router";
import React from "react";
import Colors from "@/constants/colors";
import { useThemeStore } from "@/store/theme-store";

export default function AuthLayout() {
  const { theme } = useThemeStore();
  const colors = Colors[theme];

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerBackTitle: "Back",
        contentStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
    </Stack>
  );
}