import { router } from "expo-router";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";

export default function TelaPrincipal() {
    const { width, height } = useWindowDimensions();

    // Em janelas muito baixas, permite rolagem para não esconder conteúdo.
    const telaLarga = width >= 700 && height >= 500;

    return (
        <ScrollView
            style={styles.tela}
            contentContainerStyle={[
                styles.pagina,
                telaLarga && styles.paginaDesktop,
            ]}
            scrollEnabled={!telaLarga}
        >
            <View
                style={[
                    styles.painel,
                    telaLarga
                        ? [
                              styles.painelDesktop,
                              { height: Math.min(620, height - 40) },
                          ]
                        : styles.painelCelular,
                ]}
            >
                <View
                    style={[
                        styles.areaLogo,
                        telaLarga
                            ? styles.areaLogoDesktop
                            : styles.areaLogoCelular,
                    ]}
                >
                    <Image
                        source={require("../assets/images/home.png")}
                        style={styles.logo}
                        resizeMode="contain"
                        accessibilityLabel="Logo Gelato com tubarão surfista"
                    />
                </View>

                <View style={styles.conteudo}>
                    <Text style={styles.marca}>GELATO APP</Text>

                    <Text style={styles.titulo}>
                        Bem-vindo à sorveteria Gelato!
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
        backgroundColor: "#FFF8F0",
    },
    pagina: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 20,
    },
    paginaDesktop: {
        flex: 1,
        minHeight: 0,
    },
    painel: {
        width: "100%",
        maxWidth: 1100,
        alignSelf: "center",
        backgroundColor: "#FFF5F7",
        borderRadius: 24,
        overflow: "hidden",
    },
    painelDesktop: {
        flexDirection: "row",
        minHeight: 0,
    },
    painelCelular: {
        flexDirection: "column",
    },
    areaLogo: {
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    areaLogoDesktop: {
        width: "45%",
        height: "100%",
    },
    areaLogoCelular: {
        width: "100%",
        height: 280,
        paddingBottom: 8,
    },
    logo: {
        width: "100%",
        height: "100%",
    },
    conteudo: {
        flexGrow: 1,
        flexShrink: 1,
        minWidth: 0,
        justifyContent: "center",
        padding: 28,
        gap: 20,
    },
    marca: {
        fontSize: 14,
        fontWeight: "700",
        color: "#B32B53",
        letterSpacing: 2,
    },
    titulo: {
        fontSize: 30,
        fontWeight: "800",
        color: "#492411",
        flexShrink: 1,
    },
    descricao: {
        fontSize: 17,
        lineHeight: 26,
        color: "#666",
        flexShrink: 1,
    },
    botao: {
        backgroundColor: "#B32B53",
        minHeight: 52,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
        paddingVertical: 14,
        alignSelf: "flex-start",
    },
    textoBotao: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
    },
});