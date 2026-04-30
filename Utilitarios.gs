// =====================================================================
// CTM MANAGER — UTILITÁRIOS
// =====================================================================
// Este arquivo único substitui:
//   - setupPlanilha.gs   (onboarding via aba "Novos Clientes")
//   - criarPlanilhas.gs  (cria 39 abas na planilha do cliente)
//   - permissao.gs       (testa permissões, reseta registry)
//
// Como usar:
//   1. Cole este arquivo no GAS como "Utilitarios.gs"
//   2. Abra a planilha matrix → menu 🥋 CTM Manager aparece
//   3. Execute na ordem:
//      a. Criar / Resetar aba Novos Clientes
//      b. Testar Permissões (e autorize)
//      c. Resetar Registry
//      d. Processar Novos Clientes (quando houver clientes)
// =====================================================================

// ═══════════════════════════════════════════════════════════════
// SEÇÃO 1 — MENU E ONBOARDING VIA PLANILHA
// ═══════════════════════════════════════════════════════════════

var NOVOS_CLIENTES_ABA = 'Novos Clientes';

// ─── Menu personalizado na planilha ──────────────────────────
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🥋 CTM Manager')
    .addItem('✅ Processar Novos Clientes', 'processarNovosClientes')
    .addItem('📋 Criar / Resetar aba Novos Clientes', 'criarAbaNovosClientes')
    .addSeparator()
    .addItem('🏗️ Criar 39 Abas na Planilha do Cliente', 'criarTodasAsPlanilhas')
    .addItem('📊 Verificar Abas', 'verificarAbas')
    .addSeparator()
    .addItem('🔌 Testar Permissões', 'testarPermissoes')
    .addItem('♻️ Resetar Registry', 'resetarRegistry')
    .addSeparator()
    .addItem('⏰ Instalar Trigger (30 min)', 'instalarTrigger')
    .addItem('🗑️ Remover Trigger', 'removerTrigger')
    .addToUi();
}

// ─── Cria / garante a aba Novos Clientes ─────────────────────
function criarAbaNovosClientes() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(NOVOS_CLIENTES_ABA);
  if (!sh) {
    sh = ss.insertSheet(NOVOS_CLIENTES_ABA);
    Logger.log('Aba criada: ' + NOVOS_CLIENTES_ABA);
  }

  // Headers
  var headers = [
    'Status', 'Nome completo *', 'ctmId *', 'E-mail *',
    'Telefone', 'Data nascimento', 'Nome do Dojo / CT *',
    'Graduação (faixa)', 'Grau', 'Plano', 'Dias trial',
    'Modalidades', 'Log', 'Processado em'
  ];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Formatação do header
  var hRange = sh.getRange(1, 1, 1, headers.length);
  hRange.setBackground('#1a1a2e');
  hRange.setFontColor('#C9A23A');
  hRange.setFontWeight('bold');
  hRange.setFontSize(10);
  sh.setFrozenRows(1);

  // Larguras de coluna
  sh.setColumnWidth(1,  120); // Status
  sh.setColumnWidth(2,  200); // Nome
  sh.setColumnWidth(3,  150); // ctmId
  sh.setColumnWidth(4,  220); // E-mail
  sh.setColumnWidth(5,  130); // Telefone
  sh.setColumnWidth(6,  130); // Nascimento
  sh.setColumnWidth(7,  200); // Dojo
  sh.setColumnWidth(8,  130); // Faixa
  sh.setColumnWidth(9,   70); // Grau
  sh.setColumnWidth(10, 120); // Plano
  sh.setColumnWidth(11,  80); // Dias
  sh.setColumnWidth(12, 250); // Modalidades
  sh.setColumnWidth(13, 350); // Log
  sh.setColumnWidth(14, 160); // Data

  // Validação coluna Status (A)
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['PENDENTE', 'CONCLUÍDO', 'ERRO', 'IGNORAR'], true)
    .build();
  sh.getRange(2, 1, 200, 1).setDataValidation(statusRule);

  // Preenche linhas com PENDENTE por padrão (col A)
  // (vazia = pendente, status só é escrito pelo sistema)

  // Linha de exemplo
  sh.getRange(2, 1, 1, 14).setValues([[
    'PENDENTE',
    'João Silva Exemplo',
    'joaosilva',
    'joao@exemplo.com.br',
    '(11) 99999-0000',
    '15/03/1990',
    'Dojo Exemplo',
    'Branca',
    '0',
    'profissional',
    '30',
    'bjj_adulto,muay_thai',
    '',
    ''
  ]]);
  sh.getRange(2, 1).setBackground('#14532d').setFontColor('#4ade80'); // linha exemplo verde

  SpreadsheetApp.getUi().alert(
    '✅ Aba criada!',
    'A aba "' + NOVOS_CLIENTES_ABA + '" foi criada com sucesso.\n\n' +
    'Preencha as colunas e clique em:\n' +
    'CTM Manager > Processar Novos Clientes',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

// ─── Processa todas as linhas PENDENTE ───────────────────────
function processarNovosClientes() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(NOVOS_CLIENTES_ABA);
  if (!sh) {
    SpreadsheetApp.getUi().alert('Aba "' + NOVOS_CLIENTES_ABA + '" não encontrada.\nCrie em: CTM Manager > Criar / Resetar aba Novos Clientes');
    return;
  }

  var rows = sh.getDataRange().getValues();
  if (rows.length < 2) {
    SpreadsheetApp.getUi().alert('Nenhuma linha na aba Novos Clientes.');
    return;
  }

  _loadRegistry();

  var processados = 0, erros = 0, ignorados = 0;

  for (var i = 1; i < rows.length; i++) {
    var row    = rows[i];
    var status = (row[0] || '').toString().trim().toUpperCase();

    // Pula linhas já processadas, ignoradas ou vazias
    if (status === 'CONCLUÍDO' || status === 'IGNORAR') { ignorados++; continue; }
    if (!row[2] && !row[3]) continue; // linha vazia

    // Garante que status está como PENDENTE
    if (status !== 'PENDENTE' && status !== 'ERRO') continue;

    var ctmId      = (row[2]  || '').toString().trim().toLowerCase().replace(/\s+/g,'_');
    var nome       = (row[1]  || '').toString().trim();
    var email      = (row[3]  || '').toString().trim().toLowerCase();
    var telefone   = (row[4]  || '').toString().trim();
    var nascimento = (row[5]  || '').toString().trim();
    var dojo       = (row[6]  || '').toString().trim();
    var faixa      = (row[7]  || 'Branca').toString().trim();
    var grau       = parseInt(row[8]) || 0;
    var plano      = (row[9]  || 'profissional').toString().trim();
    var diasTrial  = parseInt(row[10]) || 30;
    var modalidades= (row[11] || '').toString().trim();

    // Validação mínima
    var errosCampos = [];
    if (!ctmId)  errosCampos.push('ctmId');
    if (!nome)   errosCampos.push('Nome');
    if (!email)  errosCampos.push('E-mail');
    if (!dojo)   errosCampos.push('Dojo');
    if (!/^[a-z0-9_]{2,40}$/.test(ctmId)) errosCampos.push('ctmId inválido (use só letras/números/_)');

    if (errosCampos.length) {
      _marcarLinha(sh, i + 1, 'ERRO', 'Campos obrigatórios faltando: ' + errosCampos.join(', '));
      erros++;
      continue;
    }

    // Verifica duplicata
    if (CTM_REGISTRY[ctmId]) {
      _marcarLinha(sh, i + 1, 'ERRO', 'ctmId já existe: ' + ctmId);
      erros++;
      continue;
    }

    // ── Executa setup completo ────────────────────────────
    var log = [];
    try {
      // 1. Cópia da planilha matrix
      log.push('Copiando planilha...');
      var novaFile    = DriveApp.getFileById(SHEET_ID).makeCopy('CTM — ' + dojo);
      var novoSS      = SpreadsheetApp.openById(novaFile.getId());
      var novoSheetId = novoSS.getId();
      log.push('Planilha: ' + novoSheetId.substring(0, 12) + '...');

      // 2. Limpa dados de exemplo
      ['Alunos','CTs','Presenca','PendingAccounts'].forEach(function(aba) {
        try {
          var abaSh = novoSS.getSheetByName(aba);
          if (abaSh && abaSh.getLastRow() > 1) abaSh.deleteRows(2, abaSh.getLastRow() - 1);
        } catch(e) {}
      });
      log.push('Dados limpos');

      // 3. Cria CT
      var ctsSh = novoSS.getSheetByName('CTs');
      if (ctsSh) {
        ctsSh.appendRow([dojo, true, true, true, true, true, true, false, false, '', '', '', '', '', '', '', '', plano, 'ativo', '']);
        log.push('CT criado: ' + dojo);
      }

      // 4. Cria conta admin
      var senhaTemp = ctmId + '@2025';
      var senhaHash = hashPassword(senhaTemp);
      var aluSh = novoSS.getSheetByName('Alunos');
      if (aluSh) {
        var rowAdmin = new Array(35).fill('');
        rowAdmin[0] = email;
        rowAdmin[1] = nome;
        rowAdmin[2] = faixa;
        rowAdmin[3] = grau;
        rowAdmin[4] = dojo;
        rowAdmin[5] = senhaHash;
        rowAdmin[6] = true;
        rowAdmin[7] = new Date();
        rowAdmin[8] = nascimento;
        rowAdmin[12]= telefone;
        aluSh.appendRow(rowAdmin);
        log.push('Admin: ' + email);
      }

      // 5. Faixas
      _currentSheetId = novoSheetId;
      try { ensureFaixasSheet(); log.push('Faixas criadas'); } catch(e) { log.push('Aviso faixas: ' + e.message); }

      // 6. Registry
      _addToRegistry(ctmId, novoSheetId, dojo);
      log.push('Registry: OK');

      // 7. Trial
      _setTrialCliente(ctmId, 'trial', diasTrial, 'Trial inicial — ' + dojo);
      log.push('Trial: ' + diasTrial + 'd');

      // 8. LICENCIADOS
      _currentSheetId = SHEET_ID;
      try {
        var licSheet = getLicenciadosSheet();
        var expDate = new Date(); expDate.setDate(expDate.getDate() + diasTrial);
        var expStr  = Utilities.formatDate(expDate, 'America/Sao_Paulo', 'dd/MM/yyyy');
        // Verifica 1:1
        var licRows = licSheet.getDataRange().getValues();
        var jaExiste = false;
        for (var li = 1; li < licRows.length; li++) {
          if (licRows[li][0] && licRows[li][0].toString().trim().toLowerCase() === email) {
            licSheet.getRange(li + 1, 1, 1, 9).setValues([[email, plano, 'TRIAL', expStr, nome, telefone, nascimento, modalidades, novoSheetId]]);
            jaExiste = true; break;
          }
        }
        if (!jaExiste) licSheet.appendRow([email, plano, 'TRIAL', expStr, nome, telefone, nascimento, modalidades, novoSheetId]);
        log.push('LICENCIADOS: OK');
      } catch(eLic) { log.push('Aviso LIC: ' + eLic.message); }

      _currentSheetId = SHEET_ID;

      var logFinal = log.join(' | ') + ' | Senha: ' + senhaTemp + ' | Link: ?ctm=' + ctmId;
      _marcarLinha(sh, i + 1, 'CONCLUÍDO', logFinal);
      Logger.log('[processarNovosClientes] ' + ctmId + ' OK');
      processados++;

    } catch(eSetup) {
      _currentSheetId = SHEET_ID;
      _marcarLinha(sh, i + 1, 'ERRO', eSetup.message);
      Logger.log('[processarNovosClientes] ERRO ' + ctmId + ': ' + eSetup.message);
      erros++;
    }
  }

  var resumo = 'Processados: ' + processados + ' | Erros: ' + erros + ' | Ignorados: ' + ignorados;
  Logger.log('[processarNovosClientes] ' + resumo);

  SpreadsheetApp.getUi().alert(
    '🥋 Resultado',
    resumo + '\n\n' +
    (processados > 0 ? '✅ Clientes criados com sucesso!' : '') +
    (erros > 0 ? '\n⚠️ Verifique a coluna Log para detalhes dos erros.' : ''),
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

// ─── Marca uma linha com status + log ────────────────────────
function _marcarLinha(sh, rowNum, status, log) {
  sh.getRange(rowNum, 1).setValue(status);
  sh.getRange(rowNum, 13).setValue(log);
  sh.getRange(rowNum, 14).setValue(new Date());

  var cor = status === 'CONCLUÍDO' ? '#14532d' : status === 'ERRO' ? '#7f1d1d' : '#1e3a5f';
  var txt = status === 'CONCLUÍDO' ? '#4ade80' : status === 'ERRO' ? '#f87171' : '#93c5fd';
  sh.getRange(rowNum, 1).setBackground(cor).setFontColor(txt);
}

// ─── Trigger automático (opcional) ───────────────────────────
// Execute instalarTrigger() UMA VEZ para ativar verificação a cada 30 min
function instalarTrigger() {
  // Remove triggers duplicados
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'processarNovosClientes') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('processarNovosClientes')
    .timeBased().everyMinutes(30).create();
  Logger.log('✅ Trigger instalado — verificação a cada 30 minutos');
  SpreadsheetApp.getUi().alert('Trigger instalado!', 'O sistema verificará a aba "Novos Clientes" automaticamente a cada 30 minutos.', SpreadsheetApp.getUi().ButtonSet.OK);
}

function removerTrigger() {
  var count = 0;
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'processarNovosClientes') { ScriptApp.deleteTrigger(t); count++; }
  });
  Logger.log('Triggers removidos: ' + count);
}


// ═══════════════════════════════════════════════════════════════
// SEÇÃO 2 — CRIAR ABAS NA PLANILHA DO CLIENTE (39 abas)
// ═══════════════════════════════════════════════════════════════

var TARGET_SHEET_ID = '';

function getTargetSpreadsheet() {
  if (TARGET_SHEET_ID) return SpreadsheetApp.openById(TARGET_SHEET_ID);
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getOrCreate(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  var created = false;
  if (!sheet) { sheet = ss.insertSheet(name); created = true; Logger.log('CRIADA: ' + name); }
  else { Logger.log('JA EXISTE: ' + name); }
  if (headers && headers.length > 0) {
    var cur = sheet.getRange(1,1,1,headers.length).getValues()[0];
    if (!cur[0] || cur[0].toString().trim() === '') {
      sheet.getRange(1,1,1,headers.length).setValues([headers]);
    }
    sheet.getRange(1,1,1,headers.length).setFontWeight('bold');
  }
  return { sheet: sheet, created: created };
}

function formatHeader(sheet, numCols, bgColor, textColor) {
  var range = sheet.getRange(1,1,1,numCols);
  range.setBackground(bgColor  || '#1a1a2e');
  range.setFontColor(textColor || '#d4a829');
  range.setFontWeight('bold');
  range.setFontSize(10);
}

function criarTodasAsPlanilhas() {
  var ss = getTargetSpreadsheet();
  Logger.log('Spreadsheet: ' + ss.getName() + ' | ID: ' + ss.getId());
  var resultados = [];

  var r1 = getOrCreate(ss,'Alunos',['Email','Nome','Faixa','Grau','CT','SenhaHash','Admin','DataCriacao','Nascimento','Genero','Profissao','Bairro','Telefone','Instagram','Emergencia','Origem','Objetivo','Horario','Experiencia','Saude','Avatar','DiasTreino','ResponsavelEmail','SaudeKids','TipoPerfilBkp','Status','TipoPerfil','CTsProfessor','CTsLiberados']);
  formatHeader(r1.sheet, 29); r1.sheet.setFrozenRows(1);
  try { r1.sheet.getRange(2,7,500,1).setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build()); } catch(e){}
  resultados.push({aba:'Alunos',criada:r1.created,colunas:29});

  var r2 = getOrCreate(ss,'Presenca',['Email','Nome','Faixa','Grau','CT','Horario','Data','Hora','Status','ApprovedBy','Modalidade']);
  formatHeader(r2.sheet,11); r2.sheet.setFrozenRows(1);
  resultados.push({aba:'Presenca',criada:r2.created,colunas:11});

  var r3 = getOrCreate(ss,'CTs',['Nome','Ativo','Seg','Ter','Qua','Qui','Sex','Sab','Dom','Endereco','Horarios','ValorAvulso','Planos','Beneficios','MapLink','Instagram','Telefone','Plano','StatusLicenca','DataExpiracao']);
  formatHeader(r3.sheet,20); r3.sheet.setFrozenRows(1);
  try { r3.sheet.getRange(2,2,200,8).setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build()); } catch(e){}
  resultados.push({aba:'CTs',criada:r3.created,colunas:20});

  var r4 = getOrCreate(ss,'PendingAccounts',['Email','Nome','Faixa','Grau','CT','SenhaHash','Approved','Status','Data','Nascimento','Telefone','ResponsavelEmail','SaudeKids','Obs','Tipo','ModalidadesSolicitadas']);
  formatHeader(r4.sheet,16); r4.sheet.setFrozenRows(1);
  resultados.push({aba:'PendingAccounts',criada:r4.created,colunas:16});

  var r5 = getOrCreate(ss,'SenhaReset',['Email','Nome','NovaSenhaHash','Status','Data']);
  formatHeader(r5.sheet,5); r5.sheet.setFrozenRows(1);
  resultados.push({aba:'SenhaReset',criada:r5.created,colunas:5});

  var r6 = getOrCreate(ss,'Campeoes',['Edicao','Tipo','NomeCampeao','CT','Faixa','Data','Categoria']);
  formatHeader(r6.sheet,7); r6.sheet.setFrozenRows(1);
  resultados.push({aba:'Campeoes',criada:r6.created,colunas:7});

  var r7 = getOrCreate(ss,'CampPlacar',['Edicao','Email','Nome','CT','Faixa','Borrachinhas','Categoria']);
  formatHeader(r7.sheet,7); r7.sheet.setFrozenRows(1);
  resultados.push({aba:'CampPlacar',criada:r7.created,colunas:7});

  var r8 = getOrCreate(ss,'CampInscricoes',['Email','Nome','CT','Faixa','Edicao','DataInscricao','Status','AprovadoPor','AprovadoEm']);
  formatHeader(r8.sheet,9); r8.sheet.setFrozenRows(1);
  resultados.push({aba:'CampInscricoes',criada:r8.created,colunas:9});

  var r9 = getOrCreate(ss,'CampConfig',['Edicao','CT','DataEvento','Valor','ChavePix','Observacoes','Ativo','CriadoPor','CriadoEm']);
  formatHeader(r9.sheet,9); r9.sheet.setFrozenRows(1);
  resultados.push({aba:'CampConfig',criada:r9.created,colunas:9});

  var r10 = getOrCreate(ss,'Graduacoes',['email','tipo','faixaOuNivel','grau','data','adminEmail','obs','status','modalidade']);
  formatHeader(r10.sheet,9); r10.sheet.setFrozenRows(1);
  resultados.push({aba:'Graduacoes',criada:r10.created,colunas:9});

  var r11 = getOrCreate(ss,'ConfigGraduacao',['CT','Branca','Azul','Roxa','Marrom','Kids_Cinza','Kids_Amarela','Kids_Laranja','Kids_Verde']);
  formatHeader(r11.sheet,9); r11.sheet.setFrozenRows(1);
  if (r11.created) r11.sheet.appendRow(['Padrao',30,78,108,130,20,25,30,35]);
  resultados.push({aba:'ConfigGraduacao',criada:r11.created,colunas:9});

  var r12 = getOrCreate(ss,'ExameConfig',['Faixa','Categoria','QtdSorteio','AtualizadoPor','AtualizadoEm']);
  formatHeader(r12.sheet,5); r12.sheet.setFrozenRows(1);
  resultados.push({aba:'ExameConfig',criada:r12.created,colunas:5});

  var r13 = getOrCreate(ss,'AgendaExames',['Data','Hora','Vagas','CT','CriadoPor','CriadoEm']);
  formatHeader(r13.sheet,6); r13.sheet.setFrozenRows(1);
  resultados.push({aba:'AgendaExames',criada:r13.created,colunas:6});

  var r14 = getOrCreate(ss,'SolicitacoesExame',['Email','Nome','Faixa','ProxFaixa','DataExame','HoraExame','Status','DataSolicitacao','CT','PgtoStatus','Valor','Tentativa']);
  formatHeader(r14.sheet,12); r14.sheet.setFrozenRows(1);
  resultados.push({aba:'SolicitacoesExame',criada:r14.created,colunas:12});

  var r15 = getOrCreate(ss,'CronogramaAulas',['Data','CT','Horario','Tema','Descricao','Tecnicas','Modulo','Professor','CriadoEm','Modalidade']);
  formatHeader(r15.sheet,10); r15.sheet.setFrozenRows(1);
  r15.sheet.getRange(2,1,500,1).setNumberFormat('@');
  r15.sheet.getRange(2,3,500,1).setNumberFormat('@');
  resultados.push({aba:'CronogramaAulas',criada:r15.created,colunas:10});

  var r16 = getOrCreate(ss,'AulaValidacao',['Email','AulaData','AulaCT','ValidacoesJSON','EstudouSozinho','DataValidacao']);
  formatHeader(r16.sheet,6); r16.sheet.setFrozenRows(1);
  resultados.push({aba:'AulaValidacao',criada:r16.created,colunas:6});

  var r17 = getOrCreate(ss,'FichaMusculacao',['Email','FichaJSON','UpdatedAt']);
  formatHeader(r17.sheet,3); r17.sheet.setFrozenRows(1);
  resultados.push({aba:'FichaMusculacao',criada:r17.created,colunas:3});

  var r18 = getOrCreate(ss,'LogMusculacao',['Email','Data','DoneJSON','UpdatedAt']);
  formatHeader(r18.sheet,4); r18.sheet.setFrozenRows(1);
  resultados.push({aba:'LogMusculacao',criada:r18.created,colunas:4});

  var r19 = getOrCreate(ss,'TreinosCustom',['ID','Nome','Descricao','Exercicios','Cor','CriadoPor','CriadoEm','Ativo']);
  formatHeader(r19.sheet,8); r19.sheet.setFrozenRows(1);
  resultados.push({aba:'TreinosCustom',criada:r19.created,colunas:8});

  var r20 = getOrCreate(ss,'TreinosLog',['Email','Nome','TreinoID','TreinoNome','Data','Duracao','Observacao','Timestamp']);
  formatHeader(r20.sheet,8); r20.sheet.setFrozenRows(1);
  resultados.push({aba:'TreinosLog',criada:r20.created,colunas:8});

  var r21 = getOrCreate(ss,'IBJJFUpdates',['ID','Titulo','Conteudo','Versao','Data','CriadoPor','Ativo']);
  formatHeader(r21.sheet,7); r21.sheet.setFrozenRows(1);
  resultados.push({aba:'IBJJFUpdates',criada:r21.created,colunas:7});

  var r22 = getOrCreate(ss,'ConfigModulos',['Key','Value','UpdatedAt']);
  formatHeader(r22.sheet,3); r22.sheet.setFrozenRows(1);
  if (r22.created) {
    var defMods = JSON.stringify({checkin:true,evolucao:true,presencas:true,cronograma:true,musculacao:true,ranking:true,campeonato:true,jogos:true,manual:true,exame:true,perfil:true,pagamentos:true});
    r22.sheet.appendRow(['modules',defMods,new Date()]);
  }
  resultados.push({aba:'ConfigModulos',criada:r22.created,colunas:3});

  var r23 = getOrCreate(ss,'GameRanking',['Email','GameId','Score','Nome','Data']);
  formatHeader(r23.sheet,5); r23.sheet.setFrozenRows(1);
  resultados.push({aba:'GameRanking',criada:r23.created,colunas:5});

  var r24 = getOrCreate(ss,'AulasProfessor',['Email','CT','Data','Horario','Valor','Tipo','CriadoEm']);
  formatHeader(r24.sheet,7); r24.sheet.setFrozenRows(1);
  resultados.push({aba:'AulasProfessor',criada:r24.created,colunas:7});

  var r25 = getOrCreate(ss,'Feedbacks',['Data','Email','Nome','CT','Tipo','Mensagem','Lido']);
  formatHeader(r25.sheet,7); r25.sheet.setFrozenRows(1);
  resultados.push({aba:'Feedbacks',criada:r25.created,colunas:7});

  var r26 = getOrCreate(ss,'GatewayTokens',['GatewayID','Gateway','AccessToken','Label','DataCadastro','Ativo']);
  formatHeader(r26.sheet,6); r26.sheet.setFrozenRows(1);
  resultados.push({aba:'GatewayTokens',criada:r26.created,colunas:6});

  var r27 = getOrCreate(ss,'ConfigPagamento',['CT','GatewayID','ChavePix','DiaVencimento','Ativo','UpdatedAt']);
  formatHeader(r27.sheet,6); r27.sheet.setFrozenRows(1);
  resultados.push({aba:'ConfigPagamento',criada:r27.created,colunas:6});

  var r28 = getOrCreate(ss,'PlanosPagamento',['ID','CT','GatewayID','Nome','Valor','Descricao','Frequencia','Ativo']);
  formatHeader(r28.sheet,8); r28.sheet.setFrozenRows(1);
  resultados.push({aba:'PlanosPagamento',criada:r28.created,colunas:8});

  var r29 = getOrCreate(ss,'Mensalidades',['Email','CT','PlanoID','GatewayID','Status','Vencimento','ExternalID','Metodo','UpdatedAt','LastPaymentDate']);
  formatHeader(r29.sheet,10); r29.sheet.setFrozenRows(1);
  resultados.push({aba:'Mensalidades',criada:r29.created,colunas:10});

  var r30 = getOrCreate(ss,'CartoesAlunos',['Email','CT','CustomerID','SubscriptionID','Bandeira','Ultimos4','Validade','UpdatedAt']);
  formatHeader(r30.sheet,8); r30.sheet.setFrozenRows(1);
  resultados.push({aba:'CartoesAlunos',criada:r30.created,colunas:8});

  var r31 = getOrCreate(ss,'ConfigWellness',['Rede','GymID','ClientID','ClientSecret','Ativo','WebhookSecret','CT','UpdatedAt']);
  formatHeader(r31.sheet,8); r31.sheet.setFrozenRows(1);
  resultados.push({aba:'ConfigWellness',criada:r31.created,colunas:8});

  var r32 = getOrCreate(ss,'CheckinsWellness',['Data','Rede','UserID','Nome','CT','Status','ExternalRef','Timestamp']);
  formatHeader(r32.sheet,8); r32.sheet.setFrozenRows(1);
  resultados.push({aba:'CheckinsWellness',criada:r32.created,colunas:8});

  var r33 = getOrCreate(ss,'PendingAccounts_Hist',['Email','Nome','Faixa','Grau','CT','SenhaHash','Approved','Status','Data','Nascimento','Telefone','ResponsavelEmail','SaudeKids','Obs','Tipo','ModalidadesSolicitadas','Status_Final','Data_Processado','Processado_Por']);
  formatHeader(r33.sheet,19,'#0f1117','#888888'); r33.sheet.setFrozenRows(1);
  resultados.push({aba:'PendingAccounts_Hist',criada:r33.created,colunas:19});

  var r34 = getOrCreate(ss,'SenhaReset_Hist',['Email','Nome','NovaSenhaHash','Status','Data','Status_Final','Data_Processado','Processado_Por']);
  formatHeader(r34.sheet,8,'#0f1117','#888888'); r34.sheet.setFrozenRows(1);
  resultados.push({aba:'SenhaReset_Hist',criada:r34.created,colunas:8});

  // Modalidades
  var r35 = getOrCreate(ss,'Modalidades',['id','nome','icon','cor','corRGB','desc','gradTipo','ativo']);
  formatHeader(r35.sheet,8); r35.sheet.setFrozenRows(1);
  resultados.push({aba:'Modalidades',criada:r35.created,colunas:8});

  // Faixas
  var r36 = getOrCreate(ss,'Faixas',['modalidade_id','ordem','faixa_id','label','emoji','cor','corRGB','min_meses','max_grau','next_faixa','ativo','idade_min','idade_max']);
  formatHeader(r36.sheet,13); r36.sheet.setFrozenRows(1);
  resultados.push({aba:'Faixas',criada:r36.created,colunas:13});

  // ConfigGraduacaoMod
  var r37 = getOrCreate(ss,'ConfigGraduacaoMod',['CT','ModId','Tipo','ConfigJSON']);
  formatHeader(r37.sheet,4); r37.sheet.setFrozenRows(1);
  resultados.push({aba:'ConfigGraduacaoMod',criada:r37.created,colunas:4});

  // PLANOS (assinatura)
  var r38 = getOrCreate(ss,'PLANOS',['id_plano','nome','valor','frequencia','descricao']);
  formatHeader(r38.sheet,5); r38.sheet.setFrozenRows(1);
  resultados.push({aba:'PLANOS',criada:r38.created,colunas:5});

  // LICENCIADOS
  var r39 = getOrCreate(ss,'LICENCIADOS',['email','plano','status','proximo_vencimento','subscription_id','customer_id','data_inicio_cobranca','modalidades_contrato','sheet_id']);
  formatHeader(r39.sheet,9,'#0a1a0a','#4ade80'); r39.sheet.setFrozenRows(1);
  resultados.push({aba:'LICENCIADOS',criada:r39.created,colunas:9});

  // Relatório final
  Logger.log('');
  Logger.log('=== SETUP CONCLUIDO ===');
  var criadas = 0, existentes = 0;
  for (var i = 0; i < resultados.length; i++) {
    var res = resultados[i];
    Logger.log((res.criada ? '[NOVA]  ' : '[OK]    ') + res.aba + ' (' + res.colunas + ' colunas)');
    if (res.criada) criadas++; else existentes++;
  }
  Logger.log('---');
  Logger.log('Total: ' + resultados.length + ' abas | Criadas: ' + criadas + ' | Existiam: ' + existentes);
  Logger.log('URL: ' + ss.getUrl());

  try {
    SpreadsheetApp.getUi().alert('Setup Concluído!', criadas + ' aba(s) criada(s).\n' + existentes + ' já existiam.\nTotal: ' + resultados.length + ' abas.', SpreadsheetApp.getUi().ButtonSet.OK);
  } catch(e) {}
}

// Verifica quais abas estão faltando sem criar nada
function verificarAbas() {
  var ss = getTargetSpreadsheet();
  var necessarias = ['Alunos','Presenca','CTs','PendingAccounts','SenhaReset','Campeoes','CampPlacar','CampInscricoes','CampConfig','Graduacoes','ConfigGraduacao','ExameConfig','AgendaExames','SolicitacoesExame','CronogramaAulas','AulaValidacao','FichaMusculacao','LogMusculacao','TreinosCustom','TreinosLog','IBJJFUpdates','ConfigModulos','GameRanking','AulasProfessor','Feedbacks','GatewayTokens','ConfigPagamento','PlanosPagamento','Mensalidades','CartoesAlunos','ConfigWellness','CheckinsWellness','PendingAccounts_Hist','SenhaReset_Hist','Modalidades','Faixas','ConfigGraduacaoMod','PLANOS','LICENCIADOS'];
  var presentes = [], ausentes = [];
  for (var i = 0; i < necessarias.length; i++) {
    if (ss.getSheetByName(necessarias[i])) presentes.push(necessarias[i]);
    else ausentes.push(necessarias[i]);
  }
  Logger.log('Presentes (' + presentes.length + '): ' + presentes.join(', '));
  Logger.log('Ausentes  (' + ausentes.length  + '): ' + (ausentes.join(', ') || 'Nenhuma'));
  if (ausentes.length === 0) Logger.log('Todas as abas estão criadas!');
  else Logger.log('Execute criarTodasAsPlanilhas() para criar as abas faltantes.');
}


// ═══════════════════════════════════════════════════════════════
// SEÇÃO 3 — PERMISSÕES E DIAGNÓSTICO
// ═══════════════════════════════════════════════════════════════

function testarPermissoes() {
  Logger.log('=== TESTANDO PERMISSÕES CTM ===');
  
  // 1. DriveApp — necessário para criar cópias de planilhas
  try {
    var file = DriveApp.getFileById('1Yojc1Jk8SdZdBvknBvVjsrITQEkHJZvQV619h9eH6m4');
    Logger.log('✅ DriveApp OK — arquivo: ' + file.getName());
  } catch(e) {
    Logger.log('❌ DriveApp ERRO: ' + e.message);
  }

  // 2. SpreadsheetApp — necessário para ler/escrever planilhas
  try {
    var ss = SpreadsheetApp.openById('1Yojc1Jk8SdZdBvknBvVjsrITQEkHJZvQV619h9eH6m4');
    Logger.log('✅ SpreadsheetApp OK — planilha: ' + ss.getName());
  } catch(e) {
    Logger.log('❌ SpreadsheetApp ERRO: ' + e.message);
  }

  // 3. PropertiesService — necessário para CTM_REGISTRY dinâmico e trial
  try {
    PropertiesService.getScriptProperties().setProperty('_test_perm', 'ok');
    PropertiesService.getScriptProperties().deleteProperty('_test_perm');
    Logger.log('✅ PropertiesService OK');
  } catch(e) {
    Logger.log('❌ PropertiesService ERRO: ' + e.message);
  }

  // 4. CacheService — necessário para rate limiting de login
  try {
    CacheService.getScriptCache().put('_test', 'ok', 10);
    Logger.log('✅ CacheService OK');
  } catch(e) {
    Logger.log('❌ CacheService ERRO: ' + e.message);
  }

  // 5. UrlFetchApp — necessário para Mercado Pago, Wellhub, etc.
  try {
    UrlFetchApp.fetch('https://www.google.com', {muteHttpExceptions:true});
    Logger.log('✅ UrlFetchApp OK');
  } catch(e) {
    Logger.log('❌ UrlFetchApp ERRO: ' + e.message);
  }

  // 6. LockService — necessário para check-ins concorrentes
  try {
    var lock = LockService.getScriptLock();
    lock.waitLock(1000);
    lock.releaseLock();
    Logger.log('✅ LockService OK');
  } catch(e) {
    Logger.log('❌ LockService ERRO: ' + e.message);
  }

  Logger.log('');
  Logger.log('=== FIM DOS TESTES ===');
  Logger.log('Se todos aparecem ✅, o sistema está pronto para criar clientes pelo painel.');
}

// Reseta o CTM_REGISTRY dinâmico para recarregar do SEED
// Use quando adicionar novos clientes diretamente no código
function resetarRegistry() {
  PropertiesService.getScriptProperties().deleteProperty('CTM_REGISTRY_JSON');
  Logger.log('✅ Registry resetado — será recarregado do CTM_REGISTRY_SEED na próxima requisição.');
  Logger.log('Clientes no SEED:');
  // Lê o SEED do Código.gs (via eval é inseguro; apenas informativo aqui)
  Logger.log('Publique o GAS e faça qualquer requisição para forçar o recarregamento.');
}
