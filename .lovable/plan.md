

## Plano: Remover tela de acesso restrito da página Diretorias & KPIs

A página `Departments.tsx` possui um mecanismo de bloqueio com código de acesso (`ACCESS_CODE`) que exige uma senha antes de exibir o conteúdo. O plano é remover toda essa lógica.

### Alterações em `src/pages/Departments.tsx`:

1. **Remover estados desnecessários:** `unlocked`, `code`, `error`
2. **Remover a constante** `ACCESS_CODE`
3. **Remover imports não mais usados:** `Lock`, `X`
4. **Remover a função** `handleUnlock`
5. **Remover o bloco condicional** `if (!unlocked)` que renderiza a tela de senha
6. **Remover o botão "Bloquear"** (com ícone `X`) do cabeçalho
7. **Atualizar a query de departments** para remover `enabled: unlocked` (ficará sempre ativa)

O conteúdo da página será exibido diretamente ao acessar a rota, sem nenhuma barreira.

