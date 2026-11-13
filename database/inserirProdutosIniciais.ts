import type { SQLiteDatabase } from "expo-sqlite";
import {
    criarProduto,
    type DadosProdutos,
} from "./produtosRepository";

const produtosIniciais: DadosProdutos[] = [
    {
        titulo: "Sorvete de Chocolate",
        descricao: "Delicioso sorvete de chocolate com cobertura de calda.",
        composicao: "",
        preco_centavos: 1290,
        imagem_chave: "chocolate",
        categoria: "sorvete",
    },
    {
        titulo: "Sorvete de Morango",
        descricao: "Sorvete cremoso de morango com pedaços da fruta.",
        composicao: "",
        preco_centavos: 1190,
        imagem_chave: "morango",
        categoria: "sorvete",
    },
    {
        titulo: "Sorvete de Baunilha",
        descricao: "Clássico sorvete de baunilha com aroma natural.",
        composicao: "",
        preco_centavos: 1090,
        imagem_chave: "baunilha",
        categoria: "sorvete",
    },
    {
        titulo: "Sorvete de Pistache",
        descricao: "Sorvete gourmet de pistache com pedaços de pistache.",
        composicao: "",
        preco_centavos: 1390,
        imagem_chave: "pistache",
        categoria: "sorvete",
    },
    {
        titulo: "Sorvete de Caramelo",
        descricao: "Sorvete de caramelo com calda de caramelo salgado.",
        composicao: "",
        preco_centavos: 1290,
        imagem_chave: "caramelo",
        categoria: "sorvete",
    },
    {
        titulo: "Sorvete de Limão",
        descricao: "Sorvete refrescante de limão com raspas da fruta.",
        composicao: "",
        preco_centavos: 1190,
        imagem_chave: "limao",
        categoria: "sorvete",
    },
    {
        titulo: "Sorvete de Café",
        descricao: "Sorvete de café intenso com aroma marcante.",
        composicao: "",
        preco_centavos: 1290,
        imagem_chave: "cafe",
        categoria: "sorvete",
    },
    {
        titulo: "Sorvete de Frutas Vermelhas",
        descricao: "Sorvete de frutas vermelhas com pedaços da fruta.",
        composicao: "",
        preco_centavos: 1390,
        imagem_chave: "frutas_vermelhas",
        categoria: "sorvete",
    },
    {
        titulo: "Sorvete de Coco",
        descricao: "Sorvete cremoso de coco com pedaços de coco.",
        composicao: "",
        preco_centavos: 1190,
        imagem_chave: "coco",
        categoria: "sorvete",
    },
];

export async function inserirProdutosIniciais(
    db: SQLiteDatabase
): Promise<void> {
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS inicializacoes (
            chave TEXT PRIMARY KEY NOT NULL
            );
    `); 
    await db.withTransactionAsync(async () => {
        const registro = await db.getFirstAsync<{ chave: string }>(
            `SELECT chave FROM inicializacoes WHERE chave = ?`,
            ["produtos_iniciais_v1"],
        );

        if (registro) {
            return;
        }

        for (const produto of produtosIniciais) {
            await criarProduto(db, produto);
        }

        await db.runAsync(
            `INSERT INTO inicializacoes (chave) VALUES (?)`,
            ["produtos_iniciais_v1"],
        );
    });
}
