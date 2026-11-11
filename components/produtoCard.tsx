import { useState } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
} from "react-native";

import type { Produto } from "../types/produto";
import { obterImagemProduto } from "../utils/obterImagemProduto";

type Props = {
    produto: Produto;
    onEditar?: (produto: Produto) => void;
    onExcluir?: (produto: Produto) => void;
    onAlternarArquivamento: (produto: Produto) => Promise<void>;
    ocupado: boolean;
};

export default function ProdutoCard({
    produto,
    onEditar,
    onExcluir,
    onAlternarArquivamento,
    ocupado,
}: Props) {
    const [expandido, setExpandido] = useState(false);
    const [menuAberto, setMenuAberto] = useState(false);

    const arquivado = produto.arquivado === 1;

    return (
        <View
            style={[
                styles.card,
                arquivado && styles.cardArquivado,
            ]}
        >
            <TouchableOpacity
                style={styles.cabecalho}
                onPress={() => {
                    setMenuAberto(false);
                    setExpandido((anterior) => !anterior);
                }}
                accessibilityRole="button"
                accessibilityState={{ expanded: expandido }}
            >
                <View style={styles.info}>
                    <Text style={styles.titulo}>{produto.titulo}</Text>

                    {arquivado && (
                        <Text style={styles.avisoArquivado}>Arquivado</Text>
                    )}

                    <Text style={styles.preco}>
                        {(produto.preco_centavos / 100).toLocaleString(
                            "pt-BR",
                            {
                                style: "currency",
                                currency: "BRL",
                            }
                        )}
                    </Text>

                    <Text style={styles.linkDescricao}>
                        {expandido
                            ? "Ocultar descrição ▲"
                            : "Ver descrição ▼"}
                    </Text>
                </View>

                <Image
                    source={obterImagemProduto(produto.imagem_chave)}
                    style={styles.imagem}
                />
            </TouchableOpacity>

            {expandido && (
                <View style={styles.areaDescricao}>
                    <Text style={styles.descricao}>
                        {produto.descricao || "Sem descrição."}
                    </Text>
                </View>
            )}

            <View style={styles.areaOpcoes}>
                <TouchableOpacity
                    style={styles.botaoOpcoes}
                    onPress={() => setMenuAberto((anterior) => !anterior)}
                    disabled={ocupado}
                    accessibilityRole="button"
                    accessibilityLabel={`Opções de ${produto.titulo}`}
                    accessibilityState={{ expanded: menuAberto }}
                >
                    <Text style={styles.pontinhos}>⋮</Text>
                </TouchableOpacity>

                {menuAberto && (
                    <View style={styles.menu}>
                        {arquivado ? (
                            <TouchableOpacity
                                style={styles.itemMenu}
                                disabled={ocupado}
                                accessibilityRole="button"
                                onPress={() => {
                                    setMenuAberto(false);
                                    void onAlternarArquivamento(produto);
                                }}
                            >
                                <Text>Desarquivar</Text>
                            </TouchableOpacity>
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={styles.itemMenu}
                                    disabled={ocupado}
                                    accessibilityRole="button"
                                    onPress={() => {
                                        setMenuAberto(false);
                                        onEditar?.(produto);
                                    }}
                                >
                                    <Text>Editar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.itemMenu}
                                    disabled={ocupado}
                                    accessibilityRole="button"
                                    onPress={() => {
                                        setMenuAberto(false);
                                        onExcluir?.(produto);
                                    }}
                                >
                                    <Text style={styles.textoExcluir}>
                                        Deletar
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.itemMenu}
                                    disabled={ocupado}
                                    accessibilityRole="button"
                                    onPress={() => {
                                        setMenuAberto(false);
                                        void onAlternarArquivamento(produto);
                                    }}
                                >
                                    <Text>Arquivar</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        position: "relative",
        backgroundColor: "#FFFCF8",
        marginHorizontal: 12,
        marginVertical: 8,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#EDE2D8",
        padding: 16,
        minHeight: 200,
    },

    cardArquivado: {
        backgroundColor: "#D2CBC5",
        borderColor: "#BDB3AA",
    },
    cabecalho: {
        flexDirection: "row",
        alignItems: "flex-start",
        minHeight: 176,
        paddingRight: 44,
        gap: 12,
    },
    info: {
        flex: 1,
        minWidth: 0,
        gap: 12,
    },
    titulo: {
        fontSize: 19,
        fontWeight: "700",
        color: "#492411",
    },
    preco: {
        fontSize: 20,
        fontWeight: "800",
        color: "#B32B53",
    },
    avisoArquivado: {
        fontSize: 13,
        fontWeight: "700",
        color: "#333",
    },
    linkDescricao: {
        fontSize: 13,
        fontWeight: "600",
        color: "#80543C",
    },
    imagem: {
        width: 88,
        height: 88,
        borderRadius: 12,
        resizeMode: "cover",
    },
    areaDescricao: {
        borderTopWidth: 1,
        borderTopColor: "#E5D9CE",
        paddingTop: 14,
        marginTop: 8,
    },
    descricao: {
        fontSize: 15,
        lineHeight: 23,
        color: "#675B53",
    },
    areaOpcoes: {
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 10,
    },
    botaoOpcoes: {
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
    },
    pontinhos: {
        fontSize: 28,
        color: "#222",
    },
    menu: {
        position: "absolute",
        top: 44,
        right: 0,
        width: 160,
        backgroundColor: "#fff",
        borderRadius: 10,
        elevation: 8,
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        zIndex: 20,
    },
    itemMenu: {
        minHeight: 44,
        justifyContent: "center",
        paddingHorizontal: 16,
    },
    textoExcluir: {
        color: "#b00020",
    },
});