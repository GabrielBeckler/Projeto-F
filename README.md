# Gelato 🍦

Aplicativo de gerenciamento de sorvetes desenvolvido com **React Native, Expo, TypeScript e SQLite**. Permite cadastrar produtos com fotos, editar informações, excluir com confirmação e arquivar sabores sem perder os dados.

Projeto de estudo e portfólio desenvolvido por **Gabriel Beckler**, a partir de uma base acadêmica de aplicativo de hamburgueria, adaptada para uma sorveteria com identidade visual própria.

## Funcionalidades

- Tela de boas-vindas com a identidade visual Gelato e mascote de tubarão surfista.
- Cadastro de sorvetes com nome, descrição, composição, preço e imagem.
- Seleção de fotos do dispositivo com prévia no formulário.
- Listagem dos produtos armazenados no SQLite.
- Descrição expansível nos cartões.
- Edição no mesmo formulário utilizado para cadastro.
- Exclusão com modal de confirmação.
- Arquivamento e desarquivamento de produtos.
- Produtos arquivados escurecidos e posicionados após os ativos.
- Menu de opções contextual: produtos arquivados mostram somente a ação de desarquivar.
- Persistência local de produtos, imagens e status de arquivamento.
- Adaptação de layout conforme o tamanho da janela, com formulário lateral em telas largas e cadastro/edição em modal em telas estreitas.

## Tecnologias

| Tecnologia | Uso |
| --- | --- |
| React Native | Componentes e interface do aplicativo |
| Expo SDK 57 | Ambiente de desenvolvimento e módulos |
| Expo Router | Navegação baseada em arquivos |
| TypeScript | Tipagem dos dados e componentes |
| Expo SQLite | Persistência local e operações de cadastro, leitura, edição e exclusão |
| Expo ImagePicker | Seleção de imagens |
| React Native Safe Area Context | Espaçamento em relação às áreas de sistema do dispositivo |
| Bun | Gerenciamento de dependências e execução dos comandos |

## Executar o projeto

### Pré-requisitos

- Node.js LTS compatível com o Expo SDK 57.
- Bun instalado.
- Navegador para a versão web ou Expo Go compatível com o SDK do projeto para testar no celular.

Na pasta do projeto, instale as dependências:

```bash
bun install
```

Inicie o servidor de desenvolvimento:

```bash
bunx expo start
```

### Navegador

Pressione `w` no terminal do Expo ou execute:

```bash
bunx expo start --web
```

### Celular

Abra o projeto pelo QR code exibido no terminal. O computador e o celular devem estar na mesma rede para conexão local. Se necessário, siga a solicitação do Expo para entrar na mesma conta nos dois dispositivos.

Se houver bloqueio de conexão na rede, tente:

```bash
bunx expo start --tunnel
```

O suporte a SQLite na web exige a configuração de WASM no Metro e os cabeçalhos `Cross-Origin-Embedder-Policy` e `Cross-Origin-Opener-Policy`. Preserve essas configurações ao alterar `metro.config.js` e `app.json`. No projeto, a saída web utiliza `single`.

## Verificações

```bash
bunx expo lint
bunx tsc --noEmit
bunx expo-doctor
```

Para reiniciar o servidor com limpeza do cache:

```bash
bunx expo start --clear
```

## Organização do código

| Arquivo ou pasta | Responsabilidade |
| --- | --- |
| `app/_layout.tsx` | Navegação e inicialização do SQLiteProvider |
| `app/index.tsx` | Tela de boas-vindas |
| `app/lista.tsx` | Listagem, seleção do produto e coordenação das operações no banco |
| `components/FormularioProduto.tsx` | Campos, validações, seleção de foto e ações do formulário |
| `components/produtoCard.tsx` | Apresentação do produto, descrição expansível e menu de opções |
| `database/iniciarBanco.ts` | Criação das tabelas e chamada da carga inicial |
| `database/inserirProdutosIniciais.ts` | Cadastro dos nove sabores iniciais com controle de execução |
| `database/produtosRepository.ts` | Consultas e alterações dos produtos no SQLite |
| `types/produto.ts` | Tipo que representa um produto persistido |
| `data/imagensProdutos.ts` | Mapeamento das imagens incluídas no aplicativo |
| `utils/obterImagemProduto.ts` | Resolução da imagem a partir de uma chave ou data URI |
| `assets/images/` | Logo, favicon e imagens locais |

## Persistência e regras

O banco local se chama `sorveteria.db`. A tabela `produtos` utiliza os seguintes campos:

| Campo | Tipo | Finalidade |
| --- | --- | --- |
| `id` | INTEGER | Identificador gerado pelo banco |
| `titulo` | TEXT | Nome do produto |
| `descricao` | TEXT | Descrição do sorvete |
| `composicao` | TEXT | Composição ou ingredientes informados |
| `preco_centavos` | INTEGER | Preço em centavos; `1290` representa R$ 12,90 |
| `imagem_chave` | TEXT | Chave de imagem local ou data URI com os dados da foto |
| `arquivado` | INTEGER | `0` para ativo e `1` para arquivado |

Os nove sabores iniciais são inseridos uma única vez. A tabela `inicializacoes` registra a conclusão dessa carga: excluir um produto não faz com que ele seja recriado ao abrir o aplicativo.

As consultas com valores usam parâmetros. Após uma alteração, a interface consulta novamente o banco para atualizar a listagem. A ordenação prioriza produtos ativos e organiza os títulos dentro de cada grupo.

As fotos selecionadas são armazenadas como Base64 no próprio banco. O formulário limita cada imagem a aproximadamente 2 MB. Essa solução atende ao escopo de demonstração, mas aumenta o tamanho do banco e o uso de memória; um catálogo maior pode adotar arquivos persistentes e miniaturas.

## Escopo

O Gelato é um gerenciador local de catálogo. Esta versão não inclui autenticação, sincronização entre dispositivos, controle de estoque, cadastro de clientes, vendas ou pagamentos.

Os dados ficam no dispositivo ou no armazenamento do navegador e não são compartilhados automaticamente. Limpar os dados do aplicativo ou do site pode remover os cadastros. Trocar o nome do arquivo do banco abre uma base diferente.

O layout possui adaptações para diferentes larguras; o acabamento e o comportamento do teclado devem ser verificados nos dispositivos usados para a demonstração. O suporte web de `expo-sqlite` é experimental.

## Roteiro de teste manual

1. Cadastrar um produto com nome, preço e foto.
2. Conferir a imagem, o valor e a descrição na lista.
3. Editar o produto e verificar a atualização do mesmo cadastro.
4. Cancelar uma edição e confirmar que nada foi gravado.
5. Recarregar o aplicativo e verificar a persistência dos dados.
6. Arquivar e confirmar a posição ao fim da lista e o menu de desarquivamento.
7. Desarquivar e conferir o retorno às opções de produto ativo.
8. Cancelar uma exclusão; depois confirmar a exclusão de um produto de teste.
9. Testar janelas largas e estreitas, teclado, formulário e seleção de imagem no celular.

## Aprendizados

O projeto reúne prática de componentes reutilizáveis, propriedades e callbacks, estado com hooks, operações assíncronas, SQL parametrizado, separação entre interface e acesso a dados, formulários e layouts responsivos.

## Autor e referências

**Gabriel Beckler** — [GitHub](https://github.com/GabrielBeckler)

Desenvolvido a partir de uma base de aula, com adaptações de tema, persistência, funcionalidades e interface. Os elementos visuais da Gelato foram criados com auxílio de IA.

- [Documentação do Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/)
- [Expo SQLite](https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/)
- [Expo ImagePicker](https://docs.expo.dev/versions/v57.0.0/sdk/imagepicker/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native](https://reactnative.dev/docs/getting-started)

Antes de redistribuir o código, confira a licença da base original e mantenha os créditos e avisos exigidos por ela.
