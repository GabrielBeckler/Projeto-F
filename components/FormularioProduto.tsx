import { useState } from "react";
import { Text, TextInput, Image, ScrollView, StyleSheet, View } from "react-native";
import * as ImagePicker from "expo-image-picker";

import AccessibleButton from "./AccessibleButton";
import type { CategoriaProduto, Produto } from "../types/produto";
import type { DadosProdutos } from "../database/produtosRepository";
import { obterImagemProduto } from "../utils/obterImagemProduto";

type Props = {
    produto: Produto | null;
    ocupado: boolean;
    onAlteracao: () => void;
    onSalvar: (dados: DadosProdutos) => Promise<void>;
    onCancelar: () => void;
};

export default function FormularioProduto({
    produto,
    ocupado,
    onAlteracao,
    onSalvar,
    onCancelar,
}: Props) {
    const [titulo, setTitulo] = useState(produto?.titulo ?? "");
    const [descricao, setDescricao] = useState(produto?.descricao ?? "");
    const [composicao, setComposicao] = useState(produto?.composicao ?? "");
    const [preco, setPreco] = useState(
        produto ? (produto.preco_centavos / 100).toFixed(2).replace(".", ",") : "",
    );
    const [imagemChave, setImagemChave] = useState(produto?.imagem_chave ?? "");
    const [categoria, setCategoria] = useState<CategoriaProduto>(produto?.categoria ?? "sorvete");
    const [selecionandoImagem, setSelecionandoImagem] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [campoComErro, setCampoComErro] = useState<"nome" | "preco" | "imagem" | null>(null);

    async function salvar() {
        if (ocupado || selecionandoImagem) return;

        setErro(null);
        setCampoComErro(null);

        if (!titulo.trim()) {
            setErro("Informe o nome do sorvete.");
            setCampoComErro("nome");
            return;
        }

        const precoNormalizado = preco.trim().replace(",", ".");

        if (!/^\d+(\.\d{1,2})?$/.test(precoNormalizado)) {
            setErro("Informe um preço como 12,90, sem R$.");
            setCampoComErro("preco");
            return;
        }

        const precoCentavos = Math.round(Number(precoNormalizado) * 100);

        if (!Number.isSafeInteger(precoCentavos)) {
            setErro("O preço informado é muito alto.");
            setCampoComErro("preco");
            return;
        }

        if (!imagemChave) {
            setErro("Adicione uma imagem do sorvete.");
            setCampoComErro("imagem");
            return;
        }

        try {
            await onSalvar({
                titulo: titulo.trim(),
                descricao: descricao.trim(),
                composicao: composicao.trim(),
                preco_centavos: precoCentavos,
                imagem_chave: imagemChave,
                categoria,
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
        setCampoComErro(null);

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

            setImagemChave(`data:image/jpeg;base64,${imagem.base64}`);
            onAlteracao();
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

            <Text style={styles.rotulo}>Nome <Text style={styles.obrigatorio}>(obrigatório)</Text></Text>
            <TextInput
                style={[styles.campo, campoComErro === "nome" && styles.campoErro]}
                value={titulo}
                onChangeText={(valor) => { setTitulo(valor); onAlteracao(); }}
                editable={!ocupado}
                placeholder="Ex.: Pistache"
                placeholderTextColor="#7B7069"
                accessibilityLabel="Nome do sorvete"
                accessibilityHint="Digite o nome do sorvete"
                accessibilityState={{ disabled: ocupado }}
                returnKeyType="next"
            />
            {campoComErro === "nome" && <Text style={styles.erroCampo} accessibilityLiveRegion="polite">{erro}</Text>}

            <Text style={styles.rotulo}>Categoria</Text>
            <View style={styles.opcoesCategoria}>
                {([
                    ["sorvete", "Sorvete"],
                    ["acai", "Açaí"],
                    ["picole", "Picolé"],
                ] as const).map(([valor, rotulo]) => {
                    const selecionada = categoria === valor;
                    return (
                        <AccessibleButton
                            key={valor}
                            style={[styles.opcaoCategoria, selecionada && styles.opcaoCategoriaAtiva]}
                            focusStyle={styles.focusRing}
                            onPress={() => {
                                setCategoria(valor);
                                onAlteracao();
                            }}
                            accessibilityRole="radio"
                            accessibilityLabel={rotulo}
                            accessibilityState={{ selected: selecionada }}
                        >
                            <Text style={[styles.textoOpcaoCategoria, selecionada && styles.textoOpcaoCategoriaAtiva]}>
                                {rotulo}
                            </Text>
                        </AccessibleButton>
                    );
                })}
            </View>

            <Text style={styles.rotulo}>Descrição</Text>
            <TextInput
                style={styles.campo}
                value={descricao}
                onChangeText={(valor) => { setDescricao(valor); onAlteracao(); }}
                multiline
                editable={!ocupado}
                placeholder="Descreva o sorvete"
                placeholderTextColor="#7B7069"
                accessibilityLabel="Descrição do sorvete"
                accessibilityHint="Descreva o sorvete"
                returnKeyType="next"
            />

            <Text style={styles.rotulo}>Composição</Text>
            <TextInput
                style={[styles.campo, campoComErro === "preco" && styles.campoErro]}
                value={composicao}
                onChangeText={(valor) => { setComposicao(valor); onAlteracao(); }}
                multiline
                editable={!ocupado}
                placeholder="Ingredientes e sabores"
                placeholderTextColor="#7B7069"
                accessibilityLabel="Composição do sorvete"
                accessibilityHint="Informe a composição do sorvete"
                returnKeyType="next"
            />

            <Text style={styles.rotulo}>Preço em reais <Text style={styles.obrigatorio}>(obrigatório)</Text></Text>
            <TextInput
                style={styles.campo}
                value={preco}
                onChangeText={(valor) => { setPreco(valor); onAlteracao(); }}
                keyboardType="decimal-pad"
                placeholder="12,90"
                placeholderTextColor="#7B7069"
                editable={!ocupado}
                accessibilityLabel="Preço em reais"
                accessibilityHint="Digite o preço do sorvete"
                returnKeyType="done"
            />
            {campoComErro === "preco" && <Text style={styles.erroCampo} accessibilityLiveRegion="polite">{erro}</Text>}

            <Text style={styles.rotulo}>Imagem do sorvete <Text style={styles.obrigatorio}>(obrigatória)</Text></Text>

            {imagemChave ? (
                <Image
                    source={obterImagemProduto(imagemChave)}
                    style={styles.imagem}
                    accessibilityRole="image"
                    accessibilityLabel={
                        titulo
                            ? `Pré-visualização da imagem do sorvete ${titulo}`
                            : "Pré-visualização da imagem do sorvete"
                    }
                    onError={() => setErro("Não foi possível exibir esta imagem. Escolha outra imagem.")}
                />
            ) : (
                <Text style={styles.helperText}>Nenhuma imagem selecionada.</Text>
            )}

            <AccessibleButton
                style={[
                    styles.botaoImagem,
                    campoComErro === "imagem" && styles.botaoImagemErro,
                    (ocupado || selecionandoImagem) && styles.botaoDesabilitado,
                ]}
                focusStyle={styles.focusRing}
                onPress={() => void selecionarImagem()}
                disabled={ocupado || selecionandoImagem}
                accessibilityRole="button"
                accessibilityLabel={
                    imagemChave ? "Trocar imagem do sorvete" : "Adicionar imagem do sorvete"
                }
                accessibilityHint="Abre a biblioteca de imagens do dispositivo"
                accessibilityState={{ disabled: ocupado || selecionandoImagem }}
            >
                <Text style={styles.textoBotaoImagem}>
                    {selecionandoImagem
                        ? "Carregando imagem..."
                        : imagemChave
                        ? "Trocar imagem"
                        : "Adicionar imagem"}
                </Text>
            </AccessibleButton>

            {campoComErro === "imagem" && <Text style={styles.erroCampo} accessibilityLiveRegion="polite">{erro}</Text>}

            {erro && !campoComErro && (
                <Text style={styles.erro} accessibilityLiveRegion="polite">
                    {erro}
                </Text>
            )}

            <View style={styles.acoes}>
                <AccessibleButton
                    style={[
                        styles.botaoCancelar,
                        (ocupado || selecionandoImagem) && styles.botaoDesabilitado,
                    ]}
                    focusStyle={styles.focusRing}
                    onPress={onCancelar}
                    disabled={ocupado || selecionandoImagem}
                    accessibilityRole="button"
                    accessibilityLabel={produto ? "Cancelar edição do sorvete" : "Cancelar cadastro do sorvete"}
                    accessibilityState={{ disabled: ocupado || selecionandoImagem }}
                >
                    <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
                </AccessibleButton>

                <AccessibleButton
                    style={[
                        styles.botaoSalvar,
                        (ocupado || selecionandoImagem) && styles.botaoDesabilitado,
                    ]}
                    focusStyle={styles.focusRing}
                    onPress={() => void salvar()}
                    disabled={ocupado || selecionandoImagem}
                    accessibilityRole="button"
                    accessibilityLabel={produto ? "Salvar alterações do sorvete" : "Cadastrar sorvete"}
                    accessibilityState={{ disabled: ocupado || selecionandoImagem }}
                >
                    <Text style={styles.textoBotaoSalvar}>{produto ? "Salvar alterações" : "Salvar"}</Text>
                </AccessibleButton>
            </View>
            {ocupado && <Text style={styles.status}>Processando...</Text>}
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
    rotulo: {
        fontSize: 14,
        fontWeight: "700",
        color: "#34251D",
    },
    opcoesCategoria: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    opcaoCategoria: {
        minHeight: 44,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5D9CE",
        backgroundColor: "#FFFCF8",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
    },
    opcaoCategoriaAtiva: {
        borderColor: "#9A2F52",
        backgroundColor: "#FFF0F4",
    },
    textoOpcaoCategoria: {
        color: "#5A2F1F",
        fontSize: 14,
        fontWeight: "600",
    },
    textoOpcaoCategoriaAtiva: {
        color: "#9A2F52",
        fontWeight: "800",
    },
    obrigatorio: {
        color: "#5A2F1F",
        fontWeight: "500",
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
    campoErro: {
        borderColor: "#A52340",
        borderWidth: 2,
    },
    erroCampo: {
        color: "#8C1734",
        fontSize: 13,
        lineHeight: 18,
        marginTop: -8,
    },
    helperText: {
        fontSize: 14,
        color: "#43362F",
        marginBottom: 2,
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
        borderColor: "#8C4D65",
        borderRadius: 12,
        backgroundColor: "#FFF0F4",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    botaoImagemErro: {
        borderColor: "#A52340",
        borderWidth: 2,
    },
    focusRing: {
        borderWidth: 2,
        borderColor: "#1F3D7A",
    },
    botaoDesabilitado: {
        opacity: 0.5,
    },
    textoBotaoImagem: {
        fontSize: 15,
        fontWeight: "600",
        color: "#7D2747",
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
    botaoCancelar: {
        flex: 1,
        minHeight: 48,
        borderWidth: 1,
        borderColor: "#D9C6B8",
        borderRadius: 12,
        backgroundColor: "#FFFDFB",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
    },
    textoBotaoCancelar: {
        fontSize: 15,
        fontWeight: "700",
        color: "#5A2F1F",
    },
    botaoSalvar: {
        flex: 1,
        minHeight: 48,
        borderRadius: 12,
        backgroundColor: "#B32B53",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
    },
    textoBotaoSalvar: {
        fontSize: 15,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    status: {
        fontSize: 14,
        color: "#3F2A26",
        fontWeight: "600",
    },
});
