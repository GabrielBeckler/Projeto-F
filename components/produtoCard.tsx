import { useRef, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import type { Produto } from "../types/produto";
import { obterImagemProduto } from "../utils/obterImagemProduto";
import AccessibleButton from "./AccessibleButton";

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
  const [falhaImagem, setFalhaImagem] = useState(false);
  const [posicaoMenu, setPosicaoMenu] = useState({ top: 0, left: 0 });
  const ancoraMenu = useRef<View>(null);
  const { width: larguraTela, height: alturaTela } = useWindowDimensions();

  const arquivado = produto.arquivado === 1;

  return (
    <View style={[styles.card, arquivado && styles.cardArquivado]}>
      <AccessibleButton
        style={styles.cabecalho}
        focusStyle={styles.focusRing}
        onPress={() => {
          setMenuAberto(false);
          setExpandido((anterior) => !anterior);
        }}
        accessibilityRole="button"
        accessibilityLabel={
          expandido
            ? `Ocultar descrição do sorvete ${produto.titulo}`
            : `Mostrar descrição do sorvete ${produto.titulo}`
        }
        accessibilityState={{ expanded: expandido }}
      >
        <View style={styles.info}>
          <Text style={styles.titulo}>{produto.titulo}</Text>

          {arquivado && <Text style={styles.avisoArquivado}>Arquivado</Text>}

          <Text style={styles.preco}>
            {(produto.preco_centavos / 100).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </Text>

          <Text style={styles.linkDescricao}>
            {expandido ? "Ocultar descrição ▲" : "Ver descrição ▼"}
          </Text>
        </View>

        {falhaImagem ? (
          <View style={styles.imagemIndisponivel} accessible={false}>
            <Text style={styles.imagemIndisponivelTexto}>Gelato</Text>
          </View>
        ) : (
          <Image
            source={obterImagemProduto(produto.imagem_chave)}
            style={styles.imagem}
            onError={() => setFalhaImagem(true)}
            accessibilityRole="image"
            accessibilityLabel={`Imagem do sorvete ${produto.titulo}`}
          />
        )}
      </AccessibleButton>

      {expandido && (
        <View style={styles.areaDescricao}>
          <Text style={styles.descricao}>
            {produto.descricao || "Sem descrição."}
          </Text>
          {produto.composicao ? (
            <Text style={styles.descricao}>Composição: {produto.composicao}</Text>
          ) : null}
        </View>
      )}

      <View ref={ancoraMenu} style={styles.areaOpcoes}>
        <AccessibleButton
          style={styles.botaoOpcoes}
          focusStyle={styles.focusRing}
          onPress={() => {
            if (menuAberto) {
              setMenuAberto(false);
              return;
            }

            ancoraMenu.current?.measureInWindow((x, y, _width, height) => {
              const larguraMenu = 192;
              const alturaMenu = arquivado ? 56 : 160;
              const left = Math.max(8, Math.min(x + 44 - larguraMenu, larguraTela - larguraMenu - 8));
              const abaixo = y + height + alturaMenu <= alturaTela - 8;
              const top = abaixo
                ? y + height
                : Math.max(8, y - alturaMenu);
              setPosicaoMenu({ top, left });
              setMenuAberto(true);
            });
          }}
          disabled={ocupado}
          accessibilityRole="button"
          accessibilityLabel={`Opções de ${produto.titulo}`}
          accessibilityHint="Abre o menu de ações do sorvete"
          accessibilityState={{ expanded: menuAberto }}
        >
          <Text style={styles.pontinhos}>⋮</Text>
        </AccessibleButton>

        <Modal
          visible={menuAberto}
          transparent
          animationType="none"
          onRequestClose={() => setMenuAberto(false)}
        >
          <View style={styles.camadaMenu} accessibilityViewIsModal>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setMenuAberto(false)}
              accessibilityRole="button"
              accessibilityLabel="Fechar opções do sorvete"
            />
            <View style={[styles.menu, posicaoMenu]} accessibilityRole="menu">
            {arquivado ? (
              <AccessibleButton
                style={styles.itemMenu}
                focusStyle={styles.focusRing}
                disabled={ocupado}
                accessibilityRole="menuitem"
                accessibilityLabel={`Desarquivar o sorvete ${produto.titulo}`}
                onPress={() => {
                  setMenuAberto(false);
                  void onAlternarArquivamento(produto);
                }}
              >
                <Text style={styles.itemTexto}>Desarquivar</Text>
              </AccessibleButton>
            ) : (
              <>
                <AccessibleButton
                  style={styles.itemMenu}
                  focusStyle={styles.focusRing}
                  disabled={ocupado}
                  accessibilityRole="menuitem"
                  accessibilityLabel={`Editar o sorvete ${produto.titulo}`}
                  onPress={() => {
                    setMenuAberto(false);
                    onEditar?.(produto);
                  }}
                >
                  <Text style={styles.itemTexto}>Editar</Text>
                </AccessibleButton>

                <AccessibleButton
                  style={styles.itemMenu}
                  focusStyle={styles.focusRing}
                  disabled={ocupado}
                  accessibilityRole="menuitem"
                  accessibilityLabel={`Excluir o sorvete ${produto.titulo}`}
                  onPress={() => {
                    setMenuAberto(false);
                    onExcluir?.(produto);
                  }}
                >
                  <Text style={[styles.itemTexto, styles.textoExcluir]}>
                    Excluir sorvete
                  </Text>
                </AccessibleButton>

                <AccessibleButton
                  style={styles.itemMenu}
                  focusStyle={styles.focusRing}
                  disabled={ocupado}
                  accessibilityRole="menuitem"
                  accessibilityLabel={`Arquivar o sorvete ${produto.titulo}`}
                  onPress={() => {
                    setMenuAberto(false);
                    void onAlternarArquivamento(produto);
                  }}
                >
                  <Text style={styles.itemTexto}>Arquivar</Text>
                </AccessibleButton>
              </>
            )}
            </View>
          </View>
        </Modal>
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
    backgroundColor: "#EFE6E0",
    borderColor: "#B7A59A",
  },
  cabecalho: {
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 176,
    paddingRight: 44,
    gap: 12,
    borderRadius: 12,
  },
  focusRing: {
    borderWidth: 2,
    borderColor: "#1F3D7A",
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
    color: "#8A2142",
  },
  avisoArquivado: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3D2D28",
  },
  linkDescricao: {
    fontSize: 13,
    fontWeight: "600",
    color: "#5D2F1E",
  },
  imagem: {
    width: 88,
    height: 88,
    borderRadius: 12,
    resizeMode: "cover",
  },
  imagemIndisponivel: {
    width: 88,
    height: 88,
    borderRadius: 12,
    backgroundColor: "#F6EAEF",
    alignItems: "center",
    justifyContent: "center",
  },
  imagemIndisponivelTexto: {
    color: "#5A2F1F",
    fontSize: 13,
    fontWeight: "700",
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
    color: "#43362F",
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
    borderRadius: 12,
  },
  pontinhos: {
    fontSize: 28,
    color: "#1F1B18",
  },
  menu: {
    position: "absolute",
    width: 180,
    backgroundColor: "#FFFDFB",
    borderRadius: 10,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    zIndex: 20,
  },
  camadaMenu: {
    flex: 1,
  },
  itemMenu: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5EEE8",
  },
  itemTexto: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2F241F",
  },
  textoExcluir: {
    color: "#9C1840",
  },
});
