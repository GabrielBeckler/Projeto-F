export type Produto = {
    id: number;
    titulo: string;
    descricao: string;
    composicao: string;
    preco_centavos: number;
    imagem_chave: string;
    arquivado: 0 | 1;
};