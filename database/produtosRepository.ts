import type { SQLiteDatabase } from "expo-sqlite";
import type { Produto } from "../types/produto";

export async function listarProdutos(db: SQLiteDatabase): Promise<Produto[]> {
  return await db.getAllAsync<Produto>(
    "SELECT * FROM produtos ORDER BY arquivado ASC, titulo ASC"
  );
}

export type DadosProdutos = Pick<
  Produto,
  | "titulo"
  | "descricao"
  | "composicao"
  | "preco_centavos"
  | "imagem_chave"
  | "categoria"
>;

export async function buscarProdutoId(
  db: SQLiteDatabase,
  id: number,
): Promise<Produto | null> {
  return await db.getFirstAsync<Produto>(
    "SELECT * FROM produtos WHERE id = ?",
    [id],
  );
}

export async function atualizarProduto(
  db: SQLiteDatabase,
  id: number,
  produto: DadosProdutos,
): Promise<void> {
  const resultado = await db.runAsync(
    `UPDATE produtos
     SET titulo = ?,
         descricao = ?,
         composicao = ?,
         preco_centavos = ?,
         imagem_chave = ?,
         categoria = ?
     WHERE id = ?`,
    [
      produto.titulo,
      produto.descricao,
      produto.composicao,
      produto.preco_centavos,
      produto.imagem_chave,
      produto.categoria,
      id,
    ],
  );

  if (resultado.changes === 0) {
    throw new Error("Produto não encontrado para edição.");
  }
}

export async function criarProduto(
  db: SQLiteDatabase,
  dados: DadosProdutos,
): Promise<number> {
  const resultado = await db.runAsync(
    `INSERT INTO produtos (
      titulo,
      descricao,
      composicao,
      preco_centavos,
      imagem_chave,
      categoria
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      dados.titulo,
      dados.descricao,
      dados.composicao,
      dados.preco_centavos,
      dados.imagem_chave,
      dados.categoria,
    ],
  );

  return resultado.lastInsertRowId;
}

export async function excluirProduto(
    db: SQLiteDatabase,
    id: number,
): Promise<void> {
    const resultado = await db.runAsync(
        `DELETE FROM produtos WHERE id = ?`,
        [id],
    );

    if (resultado.changes === 0) {
        throw new Error("Produto não encontrado para exclusão.");
    }
}

export async function arquivarProduto(
    db: SQLiteDatabase,
    id: number,
): Promise<void> {
    const resultado = await db.runAsync(
        `UPDATE produtos SET arquivado = 1 WHERE id = ?`,
        [id],
    );

    if (resultado.changes === 0) {
        throw new Error("Produto não encontrado para arquivamento.");
    }
}

export async function desarquivarProduto(
    db: SQLiteDatabase,
    id: number,
): Promise<void> {
    const resultado = await db.runAsync(
        `UPDATE produtos SET arquivado = 0 WHERE id = ?`,
        [id],
    );

    if (resultado.changes === 0) {
        throw new Error("Produto não encontrado para desarquivamento.");
    }
}

export async function buscarProdutoPorTitulo(
    db: SQLiteDatabase,
    titulo: string,
): Promise<Produto | null> {
    return await db.getFirstAsync<Produto>(
        `SELECT * FROM produtos WHERE titulo = ?`,
        [titulo],
    );
}
