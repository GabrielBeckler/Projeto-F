import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import AccessibleButton from "../components/AccessibleButton";
import FormularioProduto from "../components/FormularioProduto";
import NotificacaoToast from "../components/NotificacaoToast";
import ProdutoCard from "../components/produtoCard";

import {
  arquivarProduto,
  atualizarProduto,
  criarProduto,
  desarquivarProduto,
  excluirProduto,
  listarProdutos,
  type DadosProdutos,
} from "../database/produtosRepository";

import type { Produto } from "../types/produto";

export default function Lista() {
  const db = useSQLiteContext();
  const { width } = useWindowDimensions();
  const telaLarga = width >= 900;
  const [formularioAberto, setFormularioAberto] = useState(false);

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [tipoStatus, setTipoStatus] = useState<"sucesso" | "exclusao" | "arquivamento">("sucesso");
  const [produtoEmEdicao, setProdutoEmEdicao] = useState<Produto | null>(null);
  const [formularioAlterado, setFormularioAlterado] = useState(false);
  const [confirmarDescarte, setConfirmarDescarte] = useState(false);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<Produto | null>(
    null,
  );
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);
  const [versaoFormulario, setVersaoFormulario] = useState(0);
  const [ocupado, setOcupado] = useState(false);

  const operacaoEmAndamento = useRef(false);

  const carregarProdutos = useCallback(async (): Promise<boolean> => {
    setAtualizando(true);
    try {
      const resultado = await listarProdutos(db);
      setProdutos(resultado);
      setErro(null);
      return true;
    } catch (error) {
      console.error("Erro ao consultar produtos:", error);
      setErro("Não foi possível atualizar a lista.");
      return false;
    } finally {
      setCarregando(false);
      setAtualizando(false);
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

  function novoProduto() {
    if (operacaoEmAndamento.current) return;

    setProdutoEmEdicao(null);
    setFormularioAlterado(false);
    setVersaoFormulario((anterior) => anterior + 1);
    setFormularioAberto(true);
  }

  function cancelarFormulario() {
    if (operacaoEmAndamento.current) return;

    if (formularioAlterado) {
      setConfirmarDescarte(true);
      return;
    }

    limparFormulario();
  }

  function limparFormulario() {
    setProdutoEmEdicao(null);
    setFormularioAlterado(false);
    setConfirmarDescarte(false);
    setVersaoFormulario((anterior) => anterior + 1);
    setFormularioAberto(false);
  }

  function editar(produto: Produto) {
    if (operacaoEmAndamento.current) return;

    setProdutoEmEdicao(produto);
    setFormularioAlterado(false);
    setVersaoFormulario((anterior) => anterior + 1);

    if (!telaLarga || formularioAberto) {
      setFormularioAberto(true);
    }
  }

  async function salvar(dados: DadosProdutos) {
    if (operacaoEmAndamento.current) {
      throw new Error("Aguarde a operação atual.");
    }

    operacaoEmAndamento.current = true;
    setOcupado(true);
    setStatus(null);

    try {
      const editando = Boolean(produtoEmEdicao);
      if (produtoEmEdicao) {
        await atualizarProduto(db, produtoEmEdicao.id, dados);
      } else {
        await criarProduto(db, dados);
      }

      limparFormulario();
      const listaAtualizada = await carregarProdutos();
      setTipoStatus("sucesso");
      setStatus(
        listaAtualizada
          ? editando ? "Sorvete atualizado com sucesso." : "Sorvete cadastrado com sucesso."
          : "Alteração salva, mas a lista não foi atualizada. Tente atualizar novamente.",
      );
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
    setStatus(null);

    try {
      await excluirProduto(db, produtoParaExcluir.id);

      if (produtoEmEdicao?.id === produtoParaExcluir.id) {
        limparFormulario();
      }

      setProdutoParaExcluir(null);
      const listaAtualizada = await carregarProdutos();
      setTipoStatus("exclusao");
      setStatus(
        listaAtualizada
          ? "Sorvete excluído com sucesso."
          : "Sorvete excluído, mas a lista não foi atualizada. Tente atualizar novamente.",
      );
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
    setStatus(null);

    try {
      if (produto.arquivado === 1) {
        await desarquivarProduto(db, produto.id);
      } else {
        await arquivarProduto(db, produto.id);

        if (produtoEmEdicao?.id === produto.id) {
          limparFormulario();
        }
      }

      const listaAtualizada = await carregarProdutos();
      const acao = produto.arquivado === 1 ? "desarquivado" : "arquivado";
      setTipoStatus("arquivamento");
      setStatus(
        listaAtualizada
          ? `Sorvete ${acao} com sucesso.`
          : `Sorvete ${acao}, mas a lista não foi atualizada. Tente atualizar novamente.`,
      );
    } catch (error) {
      console.error("Erro ao alterar arquivamento:", error);
      setTipoStatus("arquivamento");
      setStatus("Não foi possível alterar o arquivamento. Tente novamente.");
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
          !telaLarga && styles.paineisEstreitos,
        ]}
      >
        <View style={styles.lista}>
          <View style={styles.cabecalhoLista}>
            <View style={styles.textosCabecalho}>
              <Text style={styles.sobreTitulo}>GELATO APP</Text>
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

          {!telaLarga && (
            <AccessibleButton
              style={[styles.botaoNovo, ocupado && styles.botaoDesabilitado]}
              focusStyle={styles.focusRing}
              onPress={novoProduto}
              disabled={ocupado}
              accessibilityRole="button"
              accessibilityLabel="Cadastrar novo sorvete"
              accessibilityHint="Abre o formulário para cadastrar um novo sorvete"
            >
              <Text style={styles.textoBotaoNovo}>+ Novo sorvete</Text>
            </AccessibleButton>
          )}

          {erro && (
            <View>
              <Text style={styles.erro} accessibilityLiveRegion="polite">
                {erro}
              </Text>
              <AccessibleButton
                style={styles.botaoAtualizar}
                focusStyle={styles.focusRing}
                onPress={() => void carregarProdutos()}
                disabled={ocupado || atualizando}
                accessibilityRole="button"
                accessibilityLabel={atualizando ? "Atualizando lista" : "Tentar atualizar novamente"}
                accessibilityState={{ disabled: ocupado || atualizando, busy: atualizando }}
              >
                <Text style={styles.textoBotaoAtualizar}>
                  {atualizando ? "Atualizando…" : "Tentar atualizar novamente"}
                </Text>
              </AccessibleButton>
            </View>
          )}

          {atualizando && produtos.length > 0 && (
            <Text style={styles.textoAtualizando} accessibilityLiveRegion="polite">
              Atualizando lista…
            </Text>
          )}

          <FlatList
            data={produtos}
            style={styles.rolagemLista}
            contentContainerStyle={styles.conteudoLista}
            showsVerticalScrollIndicator={false}
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
              carregando ? (
                <Text style={styles.mensagem} accessibilityLiveRegion="polite">
                  Carregando sorvetes…
                </Text>
              ) : erro ? (
                <Text style={styles.mensagem}>Não foi possível mostrar os sorvetes. Tente atualizar.</Text>
              ) : (
                <View style={styles.estadoVazio}>
                  <Text style={styles.mensagem}>Nenhum sorvete cadastrado ainda.</Text>
                  <AccessibleButton
                    style={styles.botaoEstadoVazio}
                    focusStyle={styles.focusRing}
                    onPress={novoProduto}
                    disabled={ocupado}
                    accessibilityRole="button"
                    accessibilityLabel="Cadastrar primeiro sorvete"
                  >
                    <Text style={styles.textoBotaoNovo}>Cadastrar primeiro sorvete</Text>
                  </AccessibleButton>
                </View>
              )
            }
          />
        </View>

        {telaLarga && !formularioAberto && (
          <View style={styles.formulario}>
            <FormularioProduto
              key={versaoFormulario}
              produto={produtoEmEdicao}
              ocupado={ocupado}
              onAlteracao={() => setFormularioAlterado(true)}
              onSalvar={salvar}
              onCancelar={cancelarFormulario}
            />
          </View>
        )}
      </View>

      {status && (
        <NotificacaoToast
          mensagem={status}
          variante={tipoStatus}
          aoFechar={() => setStatus(null)}
        />
      )}

      <Modal
        visible={formularioAberto}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={cancelarFormulario}
      >
        <SafeAreaProvider>
          <SafeAreaView style={styles.telaFormulario}>
            <KeyboardAvoidingView
              style={styles.corpoFormulario}
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <View style={styles.barraFormulario}>
                <Text style={styles.marcaFormulario}>GELATO</Text>

                <AccessibleButton
                  style={[
                    styles.botaoFechar,
                    ocupado && styles.botaoDesabilitado,
                  ]}
                  focusStyle={styles.focusRing}
                  onPress={cancelarFormulario}
                  disabled={ocupado}
                  accessibilityRole="button"
                  accessibilityLabel="Cancelar e fechar formulário"
                >
                  <Text style={styles.textoFechar}>Fechar</Text>
                </AccessibleButton>
              </View>

              {formularioAberto && (
                <FormularioProduto
                  key={versaoFormulario}
                  produto={produtoEmEdicao}
                  ocupado={ocupado}
                  onAlteracao={() => setFormularioAlterado(true)}
                  onSalvar={salvar}
                  onCancelar={cancelarFormulario}
                />
              )}
            </KeyboardAvoidingView>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>

      <Modal
        visible={confirmarDescarte}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmarDescarte(false)}
      >
        <View style={styles.fundoModal}>
          <View style={styles.caixaModal} accessibilityViewIsModal>
            <Text style={styles.tituloExclusao}>Descartar alterações?</Text>
            <Text style={styles.descricaoExclusao}>
              As informações preenchidas serão perdidas.
            </Text>
            <View style={styles.acoesExclusao}>
              <AccessibleButton
                style={styles.botaoCancelarExclusao}
                focusStyle={styles.focusRing}
                onPress={() => setConfirmarDescarte(false)}
                accessibilityRole="button"
                accessibilityLabel="Continuar editando o sorvete"
              >
                <Text style={styles.textoCancelarExclusao}>Continuar editando</Text>
              </AccessibleButton>
              <AccessibleButton
                style={styles.botaoConfirmarExclusao}
                focusStyle={styles.focusRing}
                onPress={() => {
                  setConfirmarDescarte(false);
                  limparFormulario();
                }}
                accessibilityRole="button"
                accessibilityLabel="Descartar alterações do sorvete"
              >
                <Text style={styles.textoConfirmarExclusao}>Descartar</Text>
              </AccessibleButton>
            </View>
          </View>
        </View>
      </Modal>

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
              <Text style={styles.erro} accessibilityLiveRegion="polite">
                {erroExclusao}
              </Text>
            )}

            <View style={styles.acoesExclusao}>
              <AccessibleButton
                style={[
                  styles.botaoCancelarExclusao,
                  ocupado && styles.botaoDesabilitado,
                ]}
                focusStyle={styles.focusRing}
                onPress={fecharConfirmacao}
                disabled={ocupado}
                accessibilityRole="button"
                accessibilityLabel="Cancelar exclusão do sorvete"
              >
                <Text style={styles.textoCancelarExclusao}>Cancelar</Text>
              </AccessibleButton>

              <AccessibleButton
                style={[
                  styles.botaoConfirmarExclusao,
                  ocupado && styles.botaoDesabilitado,
                ]}
                focusStyle={styles.focusRing}
                onPress={() => void confirmarExclusao()}
                disabled={ocupado}
                accessibilityRole="button"
                accessibilityLabel={
                  ocupado
                    ? "Excluindo sorvete"
                    : `Confirmar exclusão do sorvete ${produtoParaExcluir?.titulo ?? ""}`
                }
              >
                <Text style={styles.textoConfirmarExclusao}>
                  {ocupado ? "Excluindo..." : "Sim, excluir"}
                </Text>
              </AccessibleButton>
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
  paineisEstreitos: {
    padding: 8,
    gap: 0,
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
    color: "#9A2F52",
  },
  titulo: {
    fontSize: 26,
    fontWeight: "800",
    color: "#492411",
  },
  subtitulo: {
    fontSize: 14,
    lineHeight: 21,
    color: "#43362F",
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
    color: "#9A2F52",
  },
  rotuloContador: {
    fontSize: 11,
    color: "#493135",
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
  mensagem: {
    padding: 24,
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
    color: "#43362F",
  },
  textoAtualizando: {
    color: "#43362F",
    fontSize: 13,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  estadoVazio: {
    alignItems: "center",
    padding: 20,
    gap: 8,
  },
  botaoEstadoVazio: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "#B32B53",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
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
  botaoAtualizar: {
    minHeight: 48,
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: "#F6EAEF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textoBotaoAtualizar: {
    fontWeight: "700",
    color: "#4B1D2C",
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
    color: "#43362F",
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
    color: "#5A2F1F",
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
  botaoNovo: {
    minHeight: 48,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    borderRadius: 12,
    backgroundColor: "#B32B53",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textoBotaoNovo: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  focusRing: {
    borderWidth: 2,
    borderColor: "#1F3D7A",
  },
  telaFormulario: {
    flex: 1,
    backgroundColor: "#FFFCF8",
  },
  corpoFormulario: {
    flex: 1,
  },
  barraFormulario: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EDE2D8",
  },
  marcaFormulario: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 2,
    color: "#B32B53",
  },
  botaoFechar: {
    minWidth: 64,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  textoFechar: {
    fontSize: 15,
    fontWeight: "600",
    color: "#5A2F1F",
  },
});
