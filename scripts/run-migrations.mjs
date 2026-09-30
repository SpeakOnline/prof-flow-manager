#!/usr/bin/env node
/**
 * Script para exibir instruções de execução de migrações SQL no Supabase
 * Migrações: 025_add_destrave_fala_list_type.sql e 026_update_get_available_teachers_for_destrave_fala.sql
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATION_FILES = [
  {
    path: path.join(__dirname, '../supabase/migrations/025_update_get_available_teachers_for_destrave_fale.sql'),
    name: '025_update_get_available_teachers_for_destrave_fale.sql (filtra por destrave_fale)'
  }
];

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║         INSTRUÇÕES PARA EXECUTAR MIGRAÇÕES NO SUPABASE          ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

console.log('📋 Migrações a serem executadas:\n');

for (const file of MIGRATION_FILES) {
  if (fs.existsSync(file.path)) {
    console.log(`✅ ${file.name}`);
    const content = fs.readFileSync(file.path, 'utf-8');
    console.log(`\n${'─'.repeat(70)}`);
    console.log('Conteúdo do arquivo:');
    console.log('─'.repeat(70));
    console.log(content);
    console.log('─'.repeat(70));
  } else {
    console.log(`❌ ${file.name} - ARQUIVO NÃO ENCONTRADO`);
  }
}

console.log('\n\n📝 Como executar as migrações:\n');
console.log('1. Acesse o painel do Supabase: https://app.supabase.com/');
console.log('2. Selecione seu projeto');
console.log('3. Vá em: SQL Editor → New Query');
console.log('4. Copie e cole o conteúdo da migração acima');
console.log('5. Execute e verifique se não houve erros\n');

console.log('⚠️  Importante:');
console.log('   - Faça backup antes de executar em produção');
console.log('   - Verifique se não há erros após a execução\n');
