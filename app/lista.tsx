import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import FormularioProduto from "../components/FormularioProduto";
import ProdutoCard from "../components/produtoCard";

import {
  atualizarProduto,
  criarProduto,
  excluirProduto,
  listarProdutos,
  arquivarProduto,
  desarquivarProduto,
  type DadosProdutos,
} from "../database/produtosRepository";

import type { Produto } from "../types/produto";

export default function Lista() {
  const db = useSQLiteContext();
  const { width } = useWindowDimensions();
  const telaLarga = width >= 900;

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [produtoEmEdicao, setProdutoEmEdicao] = useState<Produto | null>(null);

  const [produtoParaExcluir, setProdutoParaExcluir] = useState<Produto | null>(
    null,
  );

  const [erroExclusao, setErroExclusao] = useState<string | null>(null);
  const [versaoFormulario, setVersaoFormulario] = useState(0);
  const [ocupado, setOcupado] = useState(false);

  const operacaoEmAndamento = useRef(false);

  const carregarProdutos = useCallback(async () => {
    try {
      const resultado = await listarProdutos(db);
      setProdutos(resultado);
      setErro(null);
    } catch (error) {
      console.error("Erro ao consultar produtos:", error);
      setErro("Não foi possível atualizar a lista.");
    } finally {
      setCarregando(false);
    }
  }, [db]);

  useEffect(() => {
    let ativo = true;

    async function carregarInicialmente() {
        try {
            const resultado = await listarProdutos(db);

            if (ativo) {
                setProdutos(resultado);
                setErro(null);
            }
        } catch (error) {
            console.error("Erro ao carregar produtos:", error);

            if (ativo) {
                setErro("Não foi possível carregar os sorvetes.");
            }
        } finally {
            if (ativo) {
                setCarregando(false);
            }
        }
    }

    void carregarInicialmente();

    return () => {
        ativo = false;
    };
}, [db]);

  function limparFormulario() {
    setProdutoEmEdicao(null);
    setVersaoFormulario((anterior) => anterior + 1);
  }

  function editar(produto: Produto) {
    if (operacaoEmAndamento.current) return;

    setProdutoEmEdicao(produto);
    setVersaoFormulario((anterior) => anterior + 1);
  }

  async function salvar(dados: DadosProdutos) {
    if (operacaoEmAndamento.current) {
      throw new Error("Aguarde a operação atual.");
    }

    operacaoEmAndamento.current = true;
    setOcupado(true);

    try {
      if (produtoEmEdicao) {
        await atualizarProduto(db, produtoEmEdicao.id, dados);
      } else {
        await criarProduto(db, dados);
      }

      limparFormulario();
      await carregarProdutos();
    } finally {
      operacaoEmAndamento.current = false;
      setOcupado(false);
    }
  }

  function pedirExclusao(produto: Produto) {
    if (operacaoEmAndamento.current) return;

    setErroExclusao(null);
    setProdutoParaExcluir(produto);
  }

  async function confirmarExclusao() {
    if (!produtoParaExcluir || operacaoEmAndamento.current) return;

    operacaoEmAndamento.current = true;
    setOcupado(true);
    setErroExclusao(null);

    try {
      await excluirProduto(db, produtoParaExcluir.id);

      if (produtoEmEdicao?.id === produtoParaExcluir.id) {
        limparFormulario();
      }

      setProdutoParaExcluir(null);
      await carregarProdutos();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      setErroExclusao("Não foi possível excluir o sorvete.");
    } finally {
      operacaoEmAndamento.current = false;
      setOcupado(false);
    }
  }

  function fecharConfirmacao() {
    if (!operacaoEmAndamento.current) {
      setProdutoParaExcluir(null);
    }
  }
async function alternarArquivamento(produto: Produto) {
    if (operacaoEmAndamento.current) return;

    operacaoEmAndamento.current = true;
    setOcupado(true);
    setErro(null);

    try {
        if (produto.arquivado === 1) {
            await desarquivarProduto(db, produto.id);
        } else {
            await arquivarProduto(db, produto.id);

            if (produtoEmEdicao?.id === produto.id) {
                limparFormulario();
            }
        }

        await carregarProdutos();
    } catch (error) {
        console.error("Erro ao alterar arquivamento:", error);
        setErro("Não foi possível alterar o arquivamento.");
    } finally {
        operacaoEmAndamento.current = false;
        setOcupado(false);
    }
  }
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View
        style={[
          styles.paineis,
          { flexDirection: telaLarga ? "row" : "column" },
        ]}
      >
        <View style={styles.lista}>
        <View style={styles.cabecalhoLista}>
            <View style={styles.textosCabecalho}>
                <Text style={styles.sobreTitulo}>AGRIZZI SORVETE´S</Text>
                <Text style={styles.titulo}>Seus sorvetes</Text>
                <Text style={styles.subtitulo}>
                    Organize os sabores e deixe seu catálogo em dia.
                </Text>
            </View>

            <View style={styles.contador}>
                <Text style={styles.numeroContador}>{produtos.length}</Text>
                <Text style={styles.rotuloContador}>no catálogo</Text>
            </View>
        </View>
          {erro && (
            <View>
              <Text style={styles.erro}>{erro}</Text>
              <Button
                title="Tentar atualizar novamente"
                onPress={() => void carregarProdutos()}
                disabled={ocupado}
              />
            </View>
          )}

          <FlatList
            data={produtos}
            extraData={ocupado}
            keyExtractor={(item) => item.id.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <ProdutoCard
                  produto={item}
                  onEditar={editar}
                  onExcluir={pedirExclusao}
                  onAlternarArquivamento={alternarArquivamento}
                  ocupado={ocupado}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.mensagem}>
                {carregando
                  ? "Carregando..."
                  : erro
                    ? "A consulta falhou."
                    : "Nenhum sorvete cadastrado."}
              </Text>
            }
          />
        </View>

        <View
          style={[styles.formulario, !telaLarga && styles.formularioEstreito]}
        >
          <FormularioProduto
            key={versaoFormulario}
            produto={produtoEmEdicao}
            ocupado={ocupado}
            onSalvar={salvar}
            onCancelar={limparFormulario}
          />
        </View>
      </View>

      <Modal
        visible={produtoParaExcluir !== null}
        transparent
        animationType="fade"
        onRequestClose={fecharConfirmacao}
      >
        <View style={styles.fundoModal}>
          <View style={styles.caixaModal} accessibilityViewIsModal>
            <View style={styles.iconeExclusao}>
                <Text style={styles.textoIconeExclusao}>!</Text>
            </View>

            <Text style={styles.tituloExclusao}>Excluir sorvete?</Text>

            <Text style={styles.descricaoExclusao}>
                Deseja excluir{" "}
                <Text style={styles.nomeProdutoExclusao}>
                    {produtoParaExcluir?.titulo}
                </Text>
                ? Essa ação não pode ser desfeita.
            </Text>

            {erroExclusao && (
                <Text style={styles.erro}>{erroExclusao}</Text>
            )}

            <View style={styles.acoesExclusao}>
                <TouchableOpacity
                    style={[
                        styles.botaoCancelarExclusao,
                        ocupado && styles.botaoDesabilitado,
                    ]}
                    onPress={fecharConfirmacao}
                    disabled={ocupado}
                    accessibilityRole="button"
                >
                    <Text style={styles.textoCancelarExclusao}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.botaoConfirmarExclusao,
                        ocupado && styles.botaoDesabilitado,
                    ]}
                    onPress={() => void confirmarExclusao()}
                    disabled={ocupado}
                    accessibilityRole="button"
                >
                    <Text style={styles.textoConfirmarExclusao}>
                        {ocupado ? "Excluindo..." : "Sim, excluir"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF8F0",
    },

    paineis: {
        flex: 1,
        width: "100%",
        maxWidth: 1440,
        alignSelf: "center",
        padding: 16,
        gap: 20,
    },

    lista: {
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#EDE2D8",
    },

    cabecalhoLista: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 20,
        gap: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F1E8E0",
    },

    textosCabecalho: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 180,
        gap: 6,
    },

    sobreTitulo: {
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 1.8,
        color: "#B32B53",
    },

    titulo: {
        fontSize: 26,
        fontWeight: "800",
        color: "#492411",
    },

    subtitulo: {
        fontSize: 14,
        lineHeight: 21,
        color: "#7B7069",
    },

    contador: {
        minWidth: 88,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 18,
        backgroundColor: "#FFF0F4",
        alignItems: "center",
        gap: 2,
    },

    numeroContador: {
        fontSize: 24,
        fontWeight: "800",
        color: "#B32B53",
    },

    rotuloContador: {
        fontSize: 11,
        color: "#8A4A5F",
    },

    rolagemLista: {
        flex: 1,
        minHeight: 0,
    },

    conteudoLista: {
        paddingVertical: 12,
        paddingBottom: 24,
    },

    formulario: {
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#EDE2D8",
        borderTopWidth: 4,
        borderTopColor: "#B32B53",
    },

    formularioEstreito: {
        flex: 1,
    },

    mensagem: {
        padding: 24,
        fontSize: 15,
        lineHeight: 23,
        textAlign: "center",
        color: "#7B7069",
    },

    erro: {
        color: "#A52340",
        backgroundColor: "#FFF0F3",
        borderRadius: 10,
        margin: 12,
        padding: 12,
        fontSize: 14,
        lineHeight: 20,
    },

    fundoModal: {
        flex: 1,
        backgroundColor: "rgba(49, 28, 21, 0.55)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },

    caixaModal: {
      width: "100%",
      maxWidth: 420,
      backgroundColor: "#FFFCF8",
      borderRadius: 24,
      borderWidth: 1,
      borderColor: "#EDE2D8",
      padding: 28,
      gap: 16,
  },

  iconeExclusao: {
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor: "#FCE6EB",
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
  },

  textoIconeExclusao: {
      fontSize: 30,
      fontWeight: "800",
      color: "#B32B53",
  },

  tituloExclusao: {
      fontSize: 25,
      fontWeight: "800",
      color: "#492411",
      textAlign: "center",
  },

  descricaoExclusao: {
      fontSize: 15,
      lineHeight: 24,
      color: "#7B7069",
      textAlign: "center",
  },

  nomeProdutoExclusao: {
      fontWeight: "700",
      color: "#492411",
  },

  acoesExclusao: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 8,
  },

  botaoCancelarExclusao: {
      flexGrow: 1,
      flexBasis: 130,
      minHeight: 50,
      borderWidth: 1,
      borderColor: "#E5D9CE",
      borderRadius: 12,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      padding: 14,
  },

  textoCancelarExclusao: {
      fontSize: 15,
      fontWeight: "600",
      color: "#80543C",
  },

  botaoConfirmarExclusao: {
      flexGrow: 1,
      flexBasis: 130,
      minHeight: 50,
      borderRadius: 12,
      backgroundColor: "#B32B53",
      alignItems: "center",
      justifyContent: "center",
      padding: 14,
  },

  textoConfirmarExclusao: {
      fontSize: 15,
      fontWeight: "700",
      color: "#FFFFFF",
  },

  botaoDesabilitado: {
      opacity: 0.45,
  },
});