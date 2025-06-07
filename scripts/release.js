#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
  reset: '\u001b[0m',
  red: '\u001b[31m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  blue: '\u001b[34m',
  magenta: '\u001b[35m',
  cyan: '\u001b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function exec(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'inherit', ...options });
  } catch (error) {
    log('❌ Erro ao executar: ' + command, 'red');
    process.exit(1);
  }
}

function getCurrentVersion() {
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  return packageJson.version;
}

function validateGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8', stdio: 'pipe' });
    if (status.trim()) {
      log('❌ Existem mudanças não commitadas. Commit ou stash suas mudanças primeiro.', 'red');
      process.exit(1);
    }
  } catch (error) {
    log('❌ Erro ao verificar status do Git', 'red');
    process.exit(1);
  }
}

function validateBranch() {
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf8', stdio: 'pipe' }).trim();
    if (!['main', 'master'].includes(branch)) {
      log('❌ Você deve estar na branch main ou master. Branch atual: ' + branch, 'red');
      process.exit(1);
    }
    log('✅ Branch atual: ' + branch, 'green');
  } catch (error) {
    log('❌ Erro ao verificar branch atual', 'red');
    process.exit(1);
  }
}

function runTests() {
  log('🧪 Executando testes...', 'yellow');
  exec('npm test');
  log('✅ Testes passaram!', 'green');
}

function buildProject() {
  log('🏗️ Fazendo build do projeto...', 'yellow');
  exec('npm run build');
  log('✅ Build concluído!', 'green');
}

function bumpVersion(type) {
  log('📈 Fazendo bump da versão (' + type + ')...', 'yellow');
  const oldVersion = getCurrentVersion();
  exec('npm version ' + type + ' --no-git-tag-version');
  const newVersion = getCurrentVersion();
  log('✅ Versão atualizada: ' + oldVersion + ' → ' + newVersion, 'green');
  return newVersion;
}

function commitAndPush(version) {
  log('📝 Commitando mudanças...', 'yellow');
  exec('git add package.json package-lock.json');
  exec('git commit -m "chore: bump version to ' + version + '"');
  
  log('🚀 Fazendo push...', 'yellow');
  exec('git push origin HEAD');
  log('✅ Push concluído!', 'green');
}

function showHelp() {
  console.log('\n' + colors.cyan + '🚀 Script de Release - JS Paginate' + colors.reset + '\n');
  console.log('Uso: npm run release [tipo]\n');
  console.log('Tipos de versão disponíveis:');
  console.log('  patch   - Correções de bug (1.0.0 → 1.0.1)');
  console.log('  minor   - Novas funcionalidades (1.0.0 → 1.1.0)');
  console.log('  major   - Mudanças breaking (1.0.0 → 2.0.0)');
  console.log('  prerelease - Prerelease (1.0.0 → 1.0.1-0)');
  console.log('\nExemplos:');
  console.log('  npm run release patch');
  console.log('  npm run release minor');
  console.log('  npm run release major');
  console.log('\nO que este script faz:');
  console.log('  1. ✅ Valida que não há mudanças não commitadas');
  console.log('  2. ✅ Valida que está na branch main/master');
  console.log('  3. 🧪 Executa os testes');
  console.log('  4. 🏗️ Faz build do projeto');
  console.log('  5. 📈 Faz bump da versão');
  console.log('  6. 📝 Commita as mudanças');
  console.log('  7. 🚀 Faz push (que triggera o workflow de release)');
  console.log('\n💡 Dica: Configure o NPM_TOKEN no GitHub Secrets para publicação automática!');
}

function main() {
  const args = process.argv.slice(2);
  const versionType = args[0];
  
  if (!versionType || ['help', '-h', '--help'].includes(versionType)) {
    showHelp();
    return;
  }
  
  const validTypes = ['patch', 'minor', 'major', 'prerelease'];
  if (!validTypes.includes(versionType)) {
    log('❌ Tipo de versão inválido: ' + versionType, 'red');
    log('Tipos válidos: ' + validTypes.join(', '), 'yellow');
    process.exit(1);
  }
  
  log('\n' + colors.magenta + '🚀 Iniciando processo de release...' + colors.reset + '\n');
  
  const currentVersion = getCurrentVersion();
  log('📦 Versão atual: ' + currentVersion, 'blue');
  
  // Validações
  validateGitStatus();
  validateBranch();
  
  // Testes e build
  runTests();
  buildProject();
  
  // Bump de versão
  const newVersion = bumpVersion(versionType);
  
  // Commit e push
  commitAndPush(newVersion);
  
  log('\n' + colors.green + '🎉 Release preparado com sucesso!' + colors.reset);
  log('📦 Nova versão: ' + newVersion, 'green');
  log('🤖 O workflow do GitHub Actions será executado automaticamente.', 'cyan');
  log('📋 Acompanhe o progresso em: https://github.com/booscaaa/js-pagination/actions', 'cyan');
}

if (require.main === module) {
  main();
}

module.exports = { main };