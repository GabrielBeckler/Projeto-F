import { StyleSheet, Text, View } from "react-native";

import AccessibleButton from "./AccessibleButton";

type Props = {
  mensagem: string;
  variante: "sucesso" | "exclusao" | "arquivamento";
  aoFechar: () => void;
};

export default function NotificacaoToast({ mensagem, variante, aoFechar }: Props) {
  const exclusao = variante === "exclusao";
  const arquivamento = variante === "arquivamento";
  const estiloVariante = exclusao
    ? styles.notificacaoExclusao
    : arquivamento
      ? styles.notificacaoArquivamento
      : styles.notificacaoSucesso;
  const estiloTexto = exclusao
    ? styles.mensagemExclusao
    : arquivamento
      ? styles.mensagemArquivamento
      : styles.mensagemSucesso;

  return (
    <View
      style={[styles.notificacao, estiloVariante]}
    >
      <Text style={[styles.mensagem, estiloTexto]} accessibilityLiveRegion="polite">
        {mensagem}
      </Text>
      <AccessibleButton
        style={styles.botaoFechar}
        focusStyle={styles.foco}
        onPress={aoFechar}
        accessibilityRole="button"
        accessibilityLabel="Fechar notificação"
        hitSlop={4}
      >
        <Text style={[styles.iconeFechar, estiloTexto]}>
          ×
        </Text>
      </AccessibleButton>
    </View>
  );
}

const styles = StyleSheet.create({
  notificacao: {
    position: "absolute",
    top: 16,
    right: 16,
    width: "90%",
    maxWidth: 420,
    zIndex: 100,
    elevation: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingLeft: 16,
    borderWidth: 1,
    borderRadius: 14,
    shadowColor: "#492411",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  notificacaoSucesso: {
    backgroundColor: "#EAF5EA",
    borderColor: "#2E6B38",
    borderLeftWidth: 4,
  },
  notificacaoExclusao: {
    backgroundColor: "#FFF0F3",
    borderColor: "#A52340",
    borderLeftWidth: 4,
  },
  notificacaoArquivamento: {
    backgroundColor: "#FFF3C4",
    borderColor: "#8A6100",
    borderLeftWidth: 4,
  },
  mensagem: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  mensagemSucesso: { color: "#254D2B" },
  mensagemExclusao: { color: "#71152E" },
  mensagemArquivamento: { color: "#492411" },
  botaoFechar: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  iconeFechar: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "500",
  },
  foco: { borderWidth: 2, borderColor: "#1F3D7A" },
});
