import { StyleSheet, Text, View } from "react-native";

export default function FavoriteScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorite</Text>
      <Text style={styles.subtitle}>Keep your saved outfits in one place.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
});