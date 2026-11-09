import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";

export default function TelaPrincipal() {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push('/lista')}>
        <Image
          source={require('../assets/images/home.jpg')}
          style={styles.Imagem}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  Imagem: { width: 500, height: 850, borderRadius: 12 },
});