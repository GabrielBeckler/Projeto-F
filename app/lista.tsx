import { View, FlatList, StyleSheet } from "react-native";
import { arraySorvetes } from "../data/arrayProdutos";
import ProdutoCard from "../components/produtoCard";

export default function Lista() {
  return (
    <View>
      <FlatList
        data={arraySorvetes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ProdutoCard produto={item} />}
      />
    </View>
  )
};
