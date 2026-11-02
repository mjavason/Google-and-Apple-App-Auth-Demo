
import React, { useState } from "react";
import { View, Text, Button, StyleSheet, ScrollView } from "react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

const TEST_PAGE = "http://127.0.0.1:5500/frontend/auth-test.html";

export default function TestPage() {
  const [status, setStatus] = useState("Idle");
  const [result, setResult] = useState("");

  async function testAuthSession() {
    try {
      setStatus("Opening browser...");
      setResult("");

      const redirectUri = AuthSession.makeRedirectUri({
        scheme: "app",
        path: "explore",
      });

      console.log("Redirect URI:", redirectUri);

      const authUrl = new URL(TEST_PAGE);
      authUrl.searchParams.set("redirect_uri", redirectUri);

      const response = await WebBrowser.openAuthSessionAsync(
        authUrl.toString(),
        redirectUri
      );

      console.log("AuthSession response:", response);

      setStatus(response.type);
      setResult(JSON.stringify(response, null, 2));
    } catch (error) {
      console.error(error);
      setStatus("Error");
      setResult(String(error));
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>AuthSession Test</Text>

      <Text>Status: {status}</Text>

      <Button
        title="Open Authentication Session"
        onPress={testAuthSession}
      />

      <Text style={styles.result}>{result}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  result: {
    fontSize: 12,
    fontFamily: "monospace",
  },
});
