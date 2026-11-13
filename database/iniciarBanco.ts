import type { SQLiteDatabase } from "expo-sqlite";
import { inserirProdutosIniciais } from "./inserirProdutosIniciais";

export async function iniciarBanco(db: SQLiteDatabase) {
    await db.execAsync(`
        PRAGMA foreign_keys = ON;
        CREATE TABLE IF NOT EXISTS produtos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            descricao TEXT NOT NULL DEFAULT '',
            composicao TEXT NOT NULL DEFAULT '',
            preco_centavos INTEGER NOT NULL
               CHECK (preco_centavos >= 0),           
            imagem_chave TEXT NOT NULL,
            arquivado INTEGER NOT NULL DEFAULT 0
                CHECK (arquivado IN (0, 1))
        );
    `);
    const colunasProduto = await db.getAllAsync<{ name: string }>(
        "PRAGMA table_info(produtos)",
    );
    if (!colunasProduto.some((coluna) => coluna.name === "categoria")) {
        await db.execAsync(
            "ALTER TABLE produtos ADD COLUMN categoria TEXT NOT NULL DEFAULT 'sorvete'",
        );
    }
    console.log("Banco inicializado: tabela produtos pronta.");
    await inserirProdutosIniciais(db);

    const resultado = await db.getFirstAsync<{ total: number }>(
        "SELECT COUNT(*) AS total FROM produtos",
    );
    console.log(`Total de produtos cadastrados: ${resultado?.total ?? 0}`);
}
