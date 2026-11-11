import { useState } from "react";
import {
    Text,
    TextInput,
    Button,
    Image,
    ScrollView,
    StyleSheet,
    View,
    TouchableOpacity,
} from "react-native";

import type { Produto } from "../types/produto";
import type { DadosProdutos } from "../database/produtosRepository";
import * as ImagePicker from "expo-image-picker";
import { obterImagemProduto } from "../utils/obterImagemProduto";

type Props = {
    produto: Produto | null;
    ocupado: boolean;
    onSalvar: (dados: DadosProdutos) => Promise<void>;
    onCancelar: () => void;
};

export default function FormularioProduto({
    produto,
    ocupado,
    onSalvar,
    onCancelar,
}: Props) {
    const [titulo, setTitulo] = useState(produto?.titulo ?? "");
    const [descricao, setDescricao] = useState(produto?.descricao ?? "");
    const [composicao, setComposicao] = useState(produto?.composicao ?? "");

    const [preco, setPreco] = useState(
        produto
            ? (produto.preco_centavos / 100).toFixed(2).replace(".", ",")
            : ""
    );

    const [imagemChave, setImagemChave] = useState(
        produto?.imagem_chave ?? ""
    );

    const [selecionandoImagem, setSelecionandoImagem] = useState(false);

    const [erro, setErro] = useState<string | null>(null);

    async function salvar() {
        if (ocupado || selecionandoImagem) return;

        setErro(null);

        if (!titulo.trim()) {
            setErro("Informe o nome do sorvete.");
            return;
        }

        const precoNormalizado = preco.trim().replace(",", ".");

        if (!/^\d+(\.\d{1,2})?$/.test(precoNormalizado)) {
            setErro("Informe um preço como 12,90, sem R$.");
            return;
        }

        const precoCentavos = Math.round(Number(precoNormalizado) * 100);

        if (!Number.isSafeInteger(precoCentavos)) {
            setErro("O preço informado é muito alto.");
            return;
        }

        if (!imagemChave) {
            setErro("Adicione uma imagem do sorvete.");
            return;
        }


        try {
            await onSalvar({
                titulo: titulo.trim(),
                descricao: descricao.trim(),
                composicao: composicao.trim(),
                preco_centavos: precoCentavos,
                imagem_chave: imagemChave,
            });
        } catch (error) {
            console.error("Erro ao salvar:", error);
            setErro("Não foi possível salvar. Seus campos foram mantidos.");
        }
    }

async function selecionarImagem() {
    if (ocupado || selecionandoImagem) return;

    setSelecionandoImagem(true);
    setErro(null);

    try {
        const resultado = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsMultipleSelection: false,
            base64: true,
            quality: 0.7,
        });

        if (resultado.canceled) {
            return;
        }

        const imagem = resultado.assets[0];

        if (!imagem?.base64) {
            throw new Error("Não foi possível ler os dados da imagem.");
        }

        const tamanhoAproximado = imagem.base64.length * 0.75;

        if (tamanhoAproximado > 2 * 1024 * 1024) {
            setErro("Escolha uma imagem menor, de até aproximadamente 2 MB.");
            return;
        }

        setImagemChave(
            `data:image/jpeg;base64,${imagem.base64}`
        );
    } catch (error) {
        console.error("Erro ao selecionar imagem:", error);
        setErro("Não foi possível carregar a imagem.");
    } finally {
        setSelecionandoImagem(false);
    }
}

    return (
        <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.formulario}
        >
            <Text style={styles.titulo}>
                {produto ? "Editar sorvete" : "Cadastrar sorvete"}
            </Text>

            <Text>Nome</Text>
            <TextInput
                style={styles.campo}
                value={titulo}
                onChangeText={setTitulo}
                editable={!ocupado}
                accessibilityLabel="Nome do sorvete"
            />

            <Text>Descrição</Text>
            <TextInput
                style={styles.campo}
                value={descricao}
                onChangeText={setDescricao}
                multiline
                editable={!ocupado}
                accessibilityLabel="Descrição"
            />

            <Text>Composição</Text>
            <TextInput
                style={styles.campo}
                value={composicao}
                onChangeText={setComposicao}
                multiline
                editable={!ocupado}
                accessibilityLabel="Composição"
            />

            <Text>Preço em reais</Text>
            <TextInput
                style={styles.campo}
                value={preco}
                onChangeText={setPreco}
                keyboardType="decimal-pad"
                placeholder="12,90"
                editable={!ocupado}
                accessibilityLabel="Preço em reais"
            />

            <Text>Imagem do sorvete</Text>

                {imagemChave ? (
                    <Image
                        source={obterImagemProduto(imagemChave)}
                        style={styles.imagem}
                    />
                ) : (
                    <Text>Nenhuma imagem selecionada.</Text>
                )}

                <TouchableOpacity
                    style={[
                        styles.botaoImagem,
                        (ocupado || selecionandoImagem) && styles.botaoDesabilitado,
                    ]}
                    onPress={() => void selecionarImagem()}
                    disabled={ocupado || selecionandoImagem}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: ocupado || selecionandoImagem }}
                >
                    <Text style={styles.textoBotaoImagem}>
                        {selecionandoImagem
                            ? "Carregando imagem..."
                            : imagemChave
                            ? "Trocar imagem"
                            : "Adicionar imagem"}
                    </Text>
                </TouchableOpacity>

                {erro && <Text style={styles.erro}>{erro}</Text>}

                <View style={styles.acoes}>
                    <TouchableOpacity
                        style={[
                            styles.botaoCancelar,
                            (ocupado || selecionandoImagem) && styles.botaoDesabilitado,
                        ]}
                        onPress={onCancelar}
                        disabled={ocupado || selecionandoImagem}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: ocupado || selecionandoImagem }}
                    >
                        <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.botaoSalvar,
                            (ocupado || selecionandoImagem) && styles.botaoDesabilitado,
                        ]}
                        onPress={() => void salvar()}
                        disabled={ocupado || selecionandoImagem}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: ocupado || selecionandoImagem }}
                    >
                        <Text style={styles.textoBotaoSalvar}>Salvar</Text>
                    </TouchableOpacity>
                </View>
            {ocupado && <Text>Processando...</Text>}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    formulario: {
        padding: 24,
        gap: 14,
    },

    titulo: {
        fontSize: 26,
        fontWeight: "800",
        color: "#492411",
        marginBottom: 8,
    },

    campo: {
        minHeight: 50,
        borderWidth: 1,
        borderColor: "#E5D9CE",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: "#FFFCF8",
        color: "#34251D",
        fontSize: 16,
        textAlignVertical: "top",
    },

    imagem: {
        width: 150,
        height: 150,
        borderRadius: 18,
        alignSelf: "center",
        backgroundColor: "#FFF0F4",
        marginVertical: 8,
        resizeMode: "cover",
    },

    erro: {
        color: "#A52340",
        backgroundColor: "#FFF0F3",
        padding: 12,
        borderRadius: 10,
        fontSize: 14,
        lineHeight: 20,
    },
    botaoImagem: {
        minHeight: 50,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "#C996A6",
        borderRadius: 12,
        backgroundColor: "#FFF0F4",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
    },

    textoBotaoImagem: {
        fontSize: 15,
        fontWeight: "600",
        color: "#A52A50",
        textAlign: "center",
    },

    acoes: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginTop: 12,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: "#EDE2D8",
    },

    botaoSalvar: {
        flexGrow: 1,
        flexBasis: 120,
        minHeight: 52,
        borderRadius: 12,
        backgroundColor: "#B32B53",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 14,
    },

    textoBotaoSalvar: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
        textAlign: "center",
    },

    botaoCancelar: {
        flexGrow: 1,
        flexBasis: 120,
        minHeight: 52,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5D9CE",
        backgroundColor: "#FFFCF8",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 14,
    },

    textoBotaoCancelar: {
        fontSize: 16,
        fontWeight: "600",
        color: "#80543C",
        textAlign: "center",
    },

    botaoDesabilitado: {
        opacity: 0.45,
    },
});