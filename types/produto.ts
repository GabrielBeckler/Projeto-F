export type CategoriaProduto = "sorvete" | "acai" | "picole";

export type Produto = {
    id: number;
    titulo: string;
    descricao: string;
    composicao: string;
    preco_centavos: number;
    imagem_chave: string;
    categoria: CategoriaProduto;
    arquivado: 0 | 1;
};
