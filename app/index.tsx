import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    useWindowDimensions,
} from "react-native";
import { router } from "expo-router";

export default function TelaPrincipal() {
    const { width } = useWindowDimensions();
    const telaLarga = width >= 700;

    return (
        <ScrollView
            style={styles.tela}
            contentContainerStyle={styles.pagina}
        >
            <View
                style={[
                    styles.painel,
                    { flexDirection: telaLarga ? "row" : "column" },
                ]}
            >
                <Image
                    source={require("../assets/images/home.png")}
                    style={[
                        styles.imagem,
                        telaLarga
                            ? styles.imagemLarga
                            : styles.imagemEstreita,
                    ]}
                    accessibilityLabel="Agrizzi apresentando um sorvete"
                />

                <View style={styles.conteudo}>
                    <Text style={styles.marca}>AGRIZZI SORVETE´S</Text>

                    <Text style={styles.titulo}>
                        Bem-vindo à sorveteria do Agrizzi!
                    </Text>

                    <Text style={styles.descricao}>
                        Cadastre seus sorvetes e organize os sabores
                        em um só lugar.
                    </Text>

                    <TouchableOpacity
                        style={styles.botao}
                        onPress={() => router.navigate("/lista")}
                        accessibilityRole="button"
                        accessibilityLabel="Entrar no gerenciamento de sorvetes"
                    >
                        <Text style={styles.textoBotao}>Entrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  
    tela: {
        flex: 1,
        backgroundColor: "#fff8ee",
    },
    pagina: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 20,
    },
    painel: {
        width: "100%",
        maxWidth: 2300,
        alignSelf: "center",
        backgroundColor: "#fdf3f3",
        borderRadius: 20,
        overflow: "hidden",
    },
    imagem: {
        resizeMode: "cover",
    },
    imagemLarga: {
        width: "45%",
        minHeight: 520,
    },
    imagemEstreita: {
        width: "100%",
        height: 340,
    },
    conteudo: {
        flex: 1,
        justifyContent: "center",
        padding: 28,
        gap: 20,
    },
    marca: {
        fontSize: 14,
        fontWeight: "700",
        color: "#b32b53",
        letterSpacing: 2,
    },
    titulo: {
        fontSize: 32,
        fontWeight: "800",
        color: "#492411",
    },
    descricao: {
        fontSize: 17,
        lineHeight: 26,
        color: "#666",
    },
    botao: {
        backgroundColor: "#b32b53",
        minHeight: 52,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        alignSelf: "flex-start",
    },
    textoBotao: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff",
    },
});