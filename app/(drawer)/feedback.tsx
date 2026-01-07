import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BlurView } from "expo-blur";

import { supabase } from "@/lib/supabase";

const BG = "#FEF7F5";
const CARD_BG = "#FFFFFF";

export default function FeedbackScreen() {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    const text = message.trim();
    if (!text) {
      setError("Schrijf alsjeblieft je feedback.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const { error: supaError } = await supabase
        .from("feedback")
        .insert({ message: text });
      if (supaError) throw supaError;
      setSuccess(true);
      setMessage("");
    } catch (e: any) {
      if (e?.code === "NETWORK" || e?.code === "TIMEOUT" || e?.code === "OFFLINE") {
        setError("Netwerkfout. Controleer je verbinding en probeer opnieuw.");
      } else {
        setError("Feedback verzenden is niet gelukt.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Feedback</Text>
          <Text style={styles.subtitle}>
            Loop je ergens tegenaan of heb je tips/ideeën? Laat het hier weten!
          </Text>

          <TextInput
            style={styles.input}
            multiline
            numberOfLines={6}
            placeholder="Voorbeeld: Voeg meer rustige nummers toe voor het slapen gaan."
            placeholderTextColor="#9AA0A6"
            value={message}
            onChangeText={(val) => {
              setMessage(val);
              if (error) setError(null);
              if (success) setSuccess(false);
            }}
            textAlignVertical="top"
            editable={!submitting}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[
              styles.button,
              (!message.trim() || submitting) && { opacity: 0.65 },
            ]}
            onPress={handleSubmit}
            disabled={!message.trim() || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Versturen</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {success && (
        <View style={styles.alertOverlay}>
          <BlurView intensity={45} tint="light" style={styles.blur} />
          <View style={styles.alertCard}>
            <Text style={styles.alertTitle}>Bedankt!</Text>
            <Text style={styles.alertText}>
              Je feedback is verstuurd.
            </Text>
            <TouchableOpacity
              style={styles.alertButton}
              onPress={() => setSuccess(false)}
            >
              <Text style={styles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 12,
  },
  title: { fontSize: 24, fontWeight: "700", color: "#2f2f2f" },
  subtitle: { fontSize: 15, color: "#555", lineHeight: 20 },
  input: {
    minHeight: 150,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e2e2",
    backgroundColor: "#fafafa",
    padding: 14,
    fontSize: 16,
    color: "#333",
  },
  button: {
    marginTop: 6,
    backgroundColor: "#4FBC80",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  error: { marginTop: -4, color: "#B00020" },
  alertOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  blur: { ...StyleSheet.absoluteFillObject },
  alertCard: {
    width: "78%",
    maxWidth: 360,
    backgroundColor: CARD_BG,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
  },
  alertTitle: { fontSize: 20, fontWeight: "700", color: "#1f1f1f", marginBottom: 6 },
  alertText: { fontSize: 15, color: "#444", textAlign: "center", marginBottom: 14 },
  alertButton: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 12,
    backgroundColor: "#4FBC80",
  },
  alertButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
