

## Plano: Substituir banner de citação por 3 caixas (Missão, Visão, Valores)

### O que será feito
Remover o banner de citação atual (fundo azul com o texto "Performance é o resultado...") e substituí-lo por 3 caixas lado a lado na mesma cor azul (bg-primary), com texto branco, contendo: **Missão**, **Visão** e **Valores**.

### Alterações em `src/pages/Dashboard.tsx`:

1. **Remover** o bloco do Quote Banner e o botão de edição associado
2. **Remover** estados relacionados à citação (`editQuote`, `tmpQuote`, `tmpAuthor`) e o Dialog de edição da citação
3. **Remover** import do ícone `Quote`
4. **Adicionar** 3 caixas em grid (`grid-cols-3`) com `bg-primary` e `text-primary-foreground`, cada uma com o título centralizado (Missão, Visão, Valores)
5. Cada caixa será editável (com conteúdo vindo do banco) — ou inicialmente estática com placeholder para o usuário informar o conteúdo depois

As caixas terão o mesmo estilo visual do banner atual (cor primária azul), com texto branco e cantos arredondados.

