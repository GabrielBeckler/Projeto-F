import type { ImageSourcePropType } from "react-native";
import { imagensProdutos } from "../data/imagensProdutos";

export function obterImagemProduto(
    valor: string
): ImageSourcePropType | undefined {
    if (!valor) {
        return undefined;
    }

    if (valor.startsWith("data:image/")) {
        return { uri: valor };
    }

    return imagensProdutos[valor];
}