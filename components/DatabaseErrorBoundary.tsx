import { Component, type ErrorInfo, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import AccessibleButton from "./AccessibleButton";

type Props = { children: ReactNode };
type State = { error: Error | null; attempt: number };

export default class DatabaseErrorBoundary extends Component<Props, State> {
  state: State = { error: null, attempt: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Erro ao iniciar o banco de dados:", error, info.componentStack);
  }

  tentarNovamente = () => {
    this.setState(({ attempt }) => ({ error: null, attempt: attempt + 1 }));
  };

  render() {
    if (this.state.error) {
      return (
        <View style={styles.tela}>
          <View style={styles.cartao}>
            <Text style={styles.titulo}>Não foi possível abrir o catálogo</Text>
            <Text style={styles.descricao} accessibilityLiveRegion="polite">
              O banco de dados não pôde ser iniciado. Tente novamente.
            </Text>
            <AccessibleButton
              style={styles.botao}
              focusStyle={styles.foco}
              onPress={this.tentarNovamente}
              accessibilityRole="button"
              accessibilityLabel="Tentar abrir o catálogo novamente"
            >
              <Text style={styles.textoBotao}>Tentar novamente</Text>
            </AccessibleButton>
          </View>
        </View>
      );
    }

    return <View key={this.state.attempt} style={styles.raiz}>{this.props.children}</View>;
  }
}

const styles = StyleSheet.create({
  raiz: { flex: 1 },
  tela: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FFF8F0",
  },
  cartao: {
    width: "100%",
    maxWidth: 480,
    alignItems: "center",
    gap: 16,
    padding: 28,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#EDE2D8",
    backgroundColor: "#FFFCF8",
  },
  titulo: {
    color: "#492411",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  descricao: {
    color: "#43362F",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  botao: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#B32B53",
  },
  textoBotao: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  foco: { borderWidth: 2, borderColor: "#1F3D7A" },
});
