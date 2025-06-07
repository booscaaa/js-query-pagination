# Release Workflow Documentation

Este projeto possui workflows automatizados para gerenciar releases e publicação no NPM.

## 🚀 Workflows Disponíveis

### 1. Release Automático (`release.yml`)

**Trigger**: Push para `main` ou `master`

**Funcionalidades**:
- ✅ Executa testes automaticamente
- 🏗️ Faz build do projeto
- 🔍 Verifica se a versão no `package.json` mudou
- 🏷️ Cria tag Git automaticamente
- 📋 Cria release no GitHub
- 📦 Publica no NPM

**Como usar**:
1. Atualize a versão no `package.json`
2. Faça commit e push para a branch principal
3. O workflow será executado automaticamente

```bash
# Exemplo de bump de versão
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# Commit e push
git push origin main
```

### 2. Release Manual (`manual-release.yml`)

**Trigger**: Execução manual via GitHub Actions

**Funcionalidades**:
- 🎯 Controle total sobre o tipo de versão
- 🔧 Opção de versão customizada
- ⚡ Opção de pular testes
- 🏷️ Criação automática de tag e release
- 📦 Publicação inteligente no NPM (latest/next)

**Como usar**:
1. Vá para a aba "Actions" no GitHub
2. Selecione "Manual Release"
3. Clique em "Run workflow"
4. Configure as opções:
   - **Version Type**: patch, minor, major, prerelease
   - **Custom Version**: versão específica (opcional)
   - **Skip Tests**: pular testes (opcional)

## 🔧 Configuração Necessária

### Secrets do GitHub

Você precisa configurar os seguintes secrets no repositório:

1. **`NPM_TOKEN`** (Obrigatório)
   - Token de acesso do NPM para publicação
   - Como obter:
     ```bash
     npm login
     npm token create --read-only=false
     ```
   - Adicione em: Settings → Secrets and variables → Actions → New repository secret

2. **`GITHUB_TOKEN`** (Automático)
   - Fornecido automaticamente pelo GitHub
   - Usado para criar tags e releases

### Permissões do Token NPM

O token NPM deve ter as seguintes permissões:
- ✅ **Publish**: Para publicar pacotes
- ✅ **Read**: Para ler informações do pacote

### Configuração do package.json

Certifique-se de que seu `package.json` está configurado corretamente:

```json
{
  "name": "js-pagination",
  "version": "1.0.0",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "rollup -c",
    "test": "jest"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/seu-usuario/js-pagination.git"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

## 📋 Processo de Release

### Release Automático

1. **Desenvolvimento**
   ```bash
   # Faça suas alterações
   git add .
   git commit -m "feat: nova funcionalidade"
   ```

2. **Bump de Versão**
   ```bash
   # Para correções de bug
   npm version patch
   
   # Para novas funcionalidades
   npm version minor
   
   # Para mudanças breaking
   npm version major
   ```

3. **Push**
   ```bash
   git push origin main
   ```

4. **Automático**: O workflow será executado e:
   - Executará os testes
   - Fará o build
   - Criará a tag
   - Criará o release
   - Publicará no NPM

### Release Manual

1. Vá para **Actions** → **Manual Release**
2. Clique em **Run workflow**
3. Selecione as opções desejadas
4. Clique em **Run workflow**

## 🛡️ Proteções e Validações

### Validações Automáticas
- ✅ Testes devem passar
- ✅ Build deve ser bem-sucedido
- ✅ Versão não pode ser duplicada
- ✅ Commits com `[skip ci]` são ignorados

### Arquivos Ignorados
O workflow não é executado para mudanças apenas em:
- `README.md`
- `docs/**`
- `.gitignore`
- `LICENSE`

### Tratamento de Prereleases
- Versões com `alpha`, `beta`, `rc` são publicadas com tag `next`
- Versões estáveis são publicadas com tag `latest`
- Prereleases são marcadas como "prerelease" no GitHub

## 🔍 Troubleshooting

### Erro: "npm publish failed"
- Verifique se o `NPM_TOKEN` está configurado
- Verifique se o token tem permissões de publicação
- Verifique se a versão não já existe no NPM

### Erro: "Version already exists"
- A versão no `package.json` já existe como tag
- Faça um novo bump de versão

### Erro: "Tests failed"
- Corrija os testes que estão falhando
- Ou use o workflow manual com "Skip Tests" ativado (não recomendado)

### Workflow não executou
- Verifique se o commit não contém `[skip ci]`
- Verifique se as mudanças não são apenas em arquivos ignorados
- Verifique se está na branch `main` ou `master`

## 📚 Exemplos de Uso

### Exemplo 1: Release de Correção
```bash
# Corrigir um bug
git add .
git commit -m "fix: corrige problema de validação"

# Bump patch version (1.0.0 -> 1.0.1)
npm version patch

# Push (trigger automático)
git push origin main
```

### Exemplo 2: Release de Feature
```bash
# Adicionar nova funcionalidade
git add .
git commit -m "feat: adiciona suporte a novos filtros"

# Bump minor version (1.0.0 -> 1.1.0)
npm version minor

# Push (trigger automático)
git push origin main
```

### Exemplo 3: Release Manual de Prerelease
1. Vá para Actions → Manual Release
2. Configure:
   - Version Type: `prerelease`
   - Custom Version: `2.0.0-beta.1`
3. Execute o workflow

## 🎯 Boas Práticas

1. **Sempre teste localmente** antes de fazer push
2. **Use commits semânticos** (feat, fix, docs, etc.)
3. **Atualize o CHANGELOG** para releases importantes
4. **Use prereleases** para testar mudanças grandes
5. **Monitore os workflows** na aba Actions
6. **Mantenha o README atualizado** com exemplos

## 🔗 Links Úteis

- [NPM Token Management](https://docs.npmjs.com/about-access-tokens)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)