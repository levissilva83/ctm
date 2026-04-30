// ===== JIU JITSU ACADEMY - BACKEND v4.5 =====
// 🔒 SECURITY PATCH by Claude Security Audit
//
// MUDANÇAS v4.5 (modalidadesGrad):
// [NEW] _parseModalidadesGrad: helper de leitura da col AH
// [UPD] handleLogin:             retorna modalidadesGrad (col AH)
// [UPD] handleGetStudentsList:   inclui modalidadesGrad em cada aluno
// [UPD] handleAdminUpdateStudent: salva modalidadesGrad na col AH (34)
// [UPD] handleApproveAccount:    pré-popula modalidadesGrad com Branca/0
// [UPD] handleGetPendingAccounts: retorna modalidadesSolicitadas (col P)
// [UPD] handleRequestAccount:    sem CT/faixa/grau; aluno informa modalidades
//
// MUDANÇAS v4.4:
// [NEW] handleRequestAccount: não exige CT/faixa/grau no cadastro
// [NEW] handleGetPendingAccounts: retorna modalidadesSolicitadas
// [NEW] handleApproveAccount: recebe CT do frontend ao aprovar
//
// MUDANÇAS v4.3 (frontend compatibility):
// [FIX] handleAdminUpdateStudent: lê isProfessor + ctsProfessor
// [FIX] handleGetStudentsList: retorna ctsProfessor
// [FIX] handleSaveCampEvento: validateAuth() → requireAdmin()
// [FIX] handleGetCampEvento: validateAuth() → requireAuth()
// [FIX] handleInscricaoCamp: validateAuth() → requireAuth()
// [FIX] handleGetInscricoesCamp: validateAuth() → requireAdmin()
// [FIX] handleAprovarInscricao: validateAuth() → requireAdmin()
// [FIX] handleRejeitarInscricao: validateAuth() → requireAdmin()
//
// SHEET: Alunos
// A:Email | B:Nome | C:Faixa | D:Grau | E:CT | F:SenhaHash | G:Admin | H:DataCriacao
// I:Nascimento | J:Genero | K:Profissao | L:Bairro | M:Telefone | N:Instagram
// O:Emergencia | P:Origem | Q:Objetivo | R:Horario | S:Experiencia | T:Saude
// U:Avatar | V:DiasTreino | W:ResponsavelEmail | X:SaudeKids | Y:TipoPerfilBkp
// Z:Status | AA:TipoPerfil | AB:CTsProfessor | AC:CTsLiberados
// AD:reservado | AE:reservado | AF:Modalidades | AG:ModalidadePrincipal
// AH:ModalidadesGrad (JSON) ← NOVO v4.5
//
// SHEET: Presenca
// A:Email | B:Nome | C:Faixa | D:Grau | E:CT | F:Horario | G:Data | H:Hora | I:Status | J:ApprovedBy
// K:Modalidade
//
// SHEET: CTs
// A:Nome | B:Ativo | C:Seg | D:Ter | E:Qua | F:Qui | G:Sex | H:Sab | I:Dom
// J:Endereco | K:Horarios | L:ValorAvulso | M:Planos | N:Beneficios | O:MapLink | P:Instagram | Q:Telefone
//
// SHEET: PendingAccounts
// A:Email | B:Nome | C:Faixa | D:Grau | E:CT | F:SenhaHash | G:Approved | H:Status | I:Data
// J:Nascimento | K:Telefone | L-O:reservados | P:ModalidadesSolicitadas
//
// SHEET: SenhaReset  A:Email | B:Nome | C:NovaSenhaHash | D:Status | E:Data
// SHEET: Campeoes    A:Edicao | B:Tipo | C:NomeCampeao | D:CT | E:Faixa | F:Data | G:Categoria
// SHEET: CampPlacar  A:Edicao | B:Email | C:Nome | D:CT | E:Faixa | F:Borrachinhas | G:Categoria

const SHEET_ID  = '1Yojc1Jk8SdZdBvknBvVjsrITQEkHJZvQV619h9eH6m4'; // matrix
const CTM_VERSION = '2025-04-29-v5';

// ══════════════════════════════════════════════════════════════════
// MULTI-TENANT — um único .gs e um único index.html para todos
//
// Para adicionar novo cliente: cole uma linha no CTM_REGISTRY e
// republique o GAS (Implantar → Nova versão). Só isso.
//
// O ctmId é resolvido automaticamente:
//   1. Cadastro: getCTsList agrega CTs de TODOS os clientes
//   2. Aluno seleciona CT → frontend salva ctmId no localStorage
//   3. Login sem ctmId: backend busca email em TODOS os sheets
//   4. A partir do 1º login, todas as chamadas enviam ctmId no body
// ══════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════
// CTM_REGISTRY DINÂMICO — armazenado em PropertiesService
// Novos clientes são adicionados via painel sem editar código.
// O mapa hardcoded abaixo é o SEED inicial — carregado uma vez
// se o PropertiesService estiver vazio.
// ══════════════════════════════════════════════════════════════════
var CTM_REGISTRY_SEED = {
  'johnson':                              '1iYz_xKQwzxKbYnQjsV13ToVBWZRrm6_vwnBsFvcRF0o',
  'matrix':                               '1Yojc1Jk8SdZdBvknBvVjsrITQEkHJZvQV619h9eH6m4',
  'ct_operacional_de_lutas':              '1GD_AVTCe5CuZXpDOVr-8Kp9SsgdWjW1Sy8u274O5OcA',
  'aj_team':                              '1ZictRTjot8GK6x2y3j76TXMx0Rif_S_EFNGhmY_tMNw',
  'brother_fight':                        '11HA1_fyuuWZSFwEzFANsB3igY5i67rdzds-sbgnv5VQ',
  'hml':                                  '1rJMmWR2YuStG4OFwgR-_aX8psk8vgTV7MnlrOw3PSEs',
  'ct_spartacus_team':                    '1w-uUX4JhLJNhbd5TvvMoKOvbBPfcMI5Lb7snIkmaepo',
  'instituto_alpha_bjj':                  '1rgnH94lkHW-Vmv-Ho8JNnqVOMDOGP4TQtAs77mgxGsc',
  'escola_artes_marciais_alison_oliveira':'1uKsL99FNT8d7rLrxlJ8gwwLObjBdg-2a-Tj49JVtlSk',
  'deny_tae_martial_arts':                '1B1CFcnq_hxI7BnR-3KlqCN86NpFm-PwsBy_Nv7bxm-k',
  'ct_wallyson_maguila':                  '15_s5Il2qydecVEDnFj0z84rpQ0QCfRoUMgRsL7iY-LM',
  'yuri_serra_bjj':                       '1dJTc7H7vOVS1EvUj80YQkQsDcU5Yo3CkAplxUGM7WoI',
  'forjando_valentes':                    '1ALxIY4pDdNnBtnjrMPet2nS78JFqZd4Wg2iJLYuf2VQ',
  'rwr_fight_club':                       '1u5zzthfooQhCK6gscBoknvB5G0mmjtzIx9uwWdQnHug',
  'serginho':                             '1ax2NSk2Gcu1LC8tS298P8FmF4vrIqCLhlC-XxhdtmKY',
  'ct_danketsu_judo':                     '1h2PTcDUn7GgOdqReZJkEV1FyyYUZfRdMgY7rZOYbkns',
  'ct_muay_thai_leo_forte':               '14c9ZfPqxJ3HUqsRHLMczaT36iO6gJ7aLbLP0CZ0oA48',
  'ct_taz':                               '14JKbXK-yt5JlSFpG-hnn0k5Le4Ae7ShfNDmwDtVp2DY',
  'team_jeferson_muaythai':               '1_I3e3t1NBxFmnjR_jHasQ-7dTQ9PMHoz70DfNT-qqEc'
};

// CTM_REGISTRY em memória — carregado do PropertiesService a cada request
var CTM_REGISTRY = {};

function _loadRegistry() {
  try {
    var raw = PropertiesService.getScriptProperties().getProperty('CTM_REGISTRY_JSON');
    if (raw) {
      CTM_REGISTRY = JSON.parse(raw);
      return;
    }
  } catch(e) { Logger.log('[_loadRegistry] erro: ' + e.message); }
  // Primeira vez: carrega o seed e persiste
  CTM_REGISTRY = CTM_REGISTRY_SEED;
  _saveRegistry();
}

function _saveRegistry() {
  PropertiesService.getScriptProperties().setProperty('CTM_REGISTRY_JSON', JSON.stringify(CTM_REGISTRY));
}

function _addToRegistry(ctmId, sheetId, nome) {
  _loadRegistry();
  CTM_REGISTRY[ctmId] = sheetId;
  _saveRegistry();
  Logger.log('[registry] adicionado: ' + ctmId + ' → ' + sheetId.substring(0,15) + '...');
}

var _currentSheetId = SHEET_ID;
var _currentCtmId   = '';

function _getSpreadsheet() {
  return SpreadsheetApp.openById(_currentSheetId);
}

function _resolveSheetId(ctmId) {
  if (!ctmId) return SHEET_ID;
  var id = ctmId.toString().trim().toLowerCase();
  return CTM_REGISTRY[id] || SHEET_ID;
}

function _findClientByEmail(email) {
  if (!email) return null;
  var emailLow = email.toString().trim().toLowerCase();
  if (_currentCtmId && _currentSheetId !== SHEET_ID) {
    try {
      var sh = SpreadsheetApp.openById(_currentSheetId).getSheetByName('Alunos');
      var rows = sh ? sh.getDataRange().getValues() : [];
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] && rows[i][0].toString().trim().toLowerCase() === emailLow)
          return { ctmId: _currentCtmId, sheetId: _currentSheetId };
      }
    } catch(e) {}
  }
  var ids = Object.keys(CTM_REGISTRY);
  for (var c = 0; c < ids.length; c++) {
    var ctmId   = ids[c];
    var sheetId = CTM_REGISTRY[ctmId];
    if (sheetId === _currentSheetId) continue;
    try {
      var sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Alunos');
      if (!sheet) continue;
      var dta = sheet.getDataRange().getValues();
      for (var r = 1; r < dta.length; r++) {
        if (dta[r][0] && dta[r][0].toString().trim().toLowerCase() === emailLow)
          return { ctmId: ctmId, sheetId: sheetId };
      }
    } catch(e) { Logger.log('[_findClientByEmail] erro em ' + ctmId + ': ' + e.message); }
  }
  return null;
}

function handleResolveClientByEmail(data) {
  var email = (data.email || '').toString().trim().toLowerCase();
  if (!email) return jsonResponse(false, 'email obrigatório');
  var found = _findClientByEmail(email);
  if (!found) return jsonResponse(false, 'Email não encontrado');
  return jsonResponse(true, null, { ctmId: found.ctmId });
}
// 🔑 SUPER ADMIN — únicos com acesso à tela de sistema (criar/deletar CTs, etc.)
const SUPER_ADMIN_EMAILS = ['idesystemstecnologia@gmail.com'];

// 📱 WhatsApp de suporte exibido na tela de bloqueio
const SUPORTE_WHATSAPP = '5511984760689';

// 🔒 SEGREDO para HMAC - TROQUE POR UM VALOR ALEATÓRIO DE 32+ CARACTERES!
const HMAC_SECRET = 'JWzM8lqyb1e2xAxKtkn2G35N5w7jgzdqkH3BjycQEL8GaWB175o9XBWqNzKdGGVU';
const SESSION_SECRET = 'L2_ld1PP6KuEnjyl_LuvYWAxuhGnbemgyGqnkZFnV4Nbl_ToN6WU--Thq-mn3Uxi';

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_SECONDS = 300;
const SESSION_DURATION_HOURS = 24;
const MAX_FIELD_LENGTH = 500;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;

// Mapeamento dos campos do perfil → colunas da sheet Alunos (0-indexed)
const PROFILE_COLUMNS = {
  nascimento:          8,   // I
  genero:              9,   // J
  profissao:           10,  // K
  bairro:              11,  // L
  telefone:            12,  // M
  instagram:           13,  // N
  emergencia:          14,  // O
  origem:              15,  // P
  objetivo:            16,  // Q
  horario:             17,  // R
  experiencia:         18,  // S
  saude:               19,  // T
  avatar:              20,  // U
  diasTreino:          21,  // V
  responsavelEmail:    22,  // W
  saudeKids:           23,  // X
  tipoPerfilBkp:       24,  // Y
  // Col 25 (Z) = status (DESATIVADO)
  tipoPerfil:          26,  // AA
  ctsProfessor:        27,  // AB
  ctsliberados:        28,  // AC — CTs extras liberados pelo admin
  professorPerms:      29,  // AD — Permissões dinâmicas do professor (JSON) ← v5.1
  modalidades:         31,  // AF — Modalidades atribuídas
  modalidadePrincipal: 32   // AG — Modalidade principal
  // AH (33) = modalidadesGrad — gerenciado separadamente (não via saveProfile)
};

// ============================================================
// ===== 🔒 SECURITY HELPERS =====
// ============================================================

function sanitizeInput(str) {
  if (str === null || str === undefined) return '';
  var s = str.toString().trim();
  s = s.replace(/<[^>]*>/g, '');
  s = s.replace(/&/g, '&amp;');
  s = s.replace(/"/g, '&quot;');
  s = s.replace(/'/g, '&#x27;');
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
  return s;
}

function truncateField(str, maxLen) {
  if (!str) return '';
  var s = str.toString();
  return s.length > maxLen ? s.substring(0, maxLen) : s;
}

function formatHorarios(val) {
  if (!val) return '';
  if (val instanceof Date) {
    var h = val.getHours();
    var m = val.getMinutes();
    return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m);
  }
  var s = val.toString().trim();
  var dateMatch = s.match(/(\d{1,2}):(\d{2}):\d{2}\s*GMT/);
  if (dateMatch) {
    var hh = parseInt(dateMatch[1]);
    var mm = dateMatch[2];
    return (hh < 10 ? '0' + hh : hh) + ':' + mm;
  }
  return s;
}

function cleanField(str, maxLen) {
  return truncateField(sanitizeInput(str), maxLen || MAX_FIELD_LENGTH);
}

function parseHorariosPorDia(rawVal) {
  if (!rawVal) return {};
  var s = rawVal.toString().trim();
  if (s.charAt(0) === '{') {
    try { return JSON.parse(s); } catch(e) { return {}; }
  }
  var formatted = formatHorarios(rawVal);
  return formatted ? { _global: formatted } : {};
}

function getHorariosHoje(rawVal) {
  if (!rawVal) return '';
  var s = rawVal.toString().trim();
  if (s.charAt(0) === '{') {
    try {
      var parsed = JSON.parse(s);
      var DAY_KEYS = ['dom','seg','ter','qua','qui','sex','sab'];
      var hoje = DAY_KEYS[new Date().getDay()];
      return parsed[hoje] || '';
    } catch(e) { return ''; }
  }
  return formatHorarios(rawVal);
}

function getCheckinWindows(horariosStr) {
  if (!horariosStr) return [];
  var slots = horariosStr.toString().split(',');
  var windows = [];
  for (var i = 0; i < slots.length; i++) {
    var t = slots[i].trim();
    var parts = t.match(/^(\d{1,2}):(\d{2})$/);
    if (!parts) continue;
    var h = parseInt(parts[1]);
    var m = parseInt(parts[2]);
    var startMin = h * 60 + m;
    var endMin = Math.min(startMin + 300, 1439);
    windows.push({ start: startMin, end: endMin, slot: t });
  }
  return windows;
}

/**
 * Extrai os horários de uma modalidade específica de ctHorariosPorDia.
 * Suporta formato por-modalidade: { muay_thai: { seg: "20:00", qua: "20:00" }, bjj_adulto: { ter: "21:00" } }
 * Retorna string de horários separados por vírgula para o dia de hoje, ou null se não encontrar.
 */
function getHorariosPorModalidade(ctHorariosPorDia, modalidade, diaSemana) {
  if (!ctHorariosPorDia || !modalidade) return null;
  var modKey = modalidade.toString().trim().toLowerCase();
  var modData = ctHorariosPorDia[modKey];
  if (!modData || typeof modData !== 'object') return null;
  var DAY_KEYS = ['dom','seg','ter','qua','qui','sex','sab'];
  var dayKey = DAY_KEYS[diaSemana] || '';
  var horario = modData[dayKey] || modData['_global'] || '';
  return horario ? horario.toString().trim() : null;
}

function isTimeInWindow(horaStr, window) {
  if (!horaStr || !window) return false;
  var parts = horaStr.toString().trim().match(/(\d{1,2}):(\d{2})/);
  if (!parts) return false;
  var min = parseInt(parts[1]) * 60 + parseInt(parts[2]);
  return min >= window.start && min <= window.end;
}

// FIX #4 -- aceita modalidade para permitir check-ins de mods diferentes no mesmo dia
function checkDuplicateByWindow(presencaData, email, ctHorarios, modalidade) {
  var modAtual = (modalidade || '').toString().trim().toLowerCase();
  function _modDiferente(row) {
    if (!modAtual) return false;
    var rowMod = row[10] ? row[10].toString().trim().toLowerCase() : '';
    return rowMod && rowMod !== modAtual;
  }
  var windows = getCheckinWindows(ctHorarios);
  var now = new Date();
  var nowMin = now.getHours() * 60 + now.getMinutes();

  var janelaAtual = null;
  for (var w = 0; w < windows.length; w++) {
    if (nowMin >= windows[w].start && nowMin <= windows[w].end) {
      janelaAtual = windows[w];
      break;
    }
  }

  if (!janelaAtual && windows.length > 0) {
    for (var j = 1; j < presencaData.length; j++) {
      if (!presencaData[j][0]) continue;
      if (presencaData[j][0].toString().trim().toLowerCase() !== email) continue;
      var rowStatus = getPresencaStatus(presencaData[j]);
      if (_modDiferente(presencaData[j])) continue; // FIX #4: outra modalidade, nao e' duplicata
      if ((rowStatus === 'APROVADO' || rowStatus === 'PENDENTE') && isToday(presencaData[j][6])) {
        return { duplicado: true, motivo: 'duplicado_fora_janela' };
      }
    }
    return { duplicado: false };
  }

  if (windows.length === 0) {
    for (var k = 1; k < presencaData.length; k++) {
      if (!presencaData[k][0]) continue;
      if (presencaData[k][0].toString().trim().toLowerCase() !== email) continue;
      var rowStatus2 = getPresencaStatus(presencaData[k]);
      if (_modDiferente(presencaData[k])) continue; // FIX #4: outra modalidade
      if ((rowStatus2 === 'APROVADO' || rowStatus2 === 'PENDENTE') && isToday(presencaData[k][6])) {
        return { duplicado: true, motivo: 'duplicado' };
      }
    }
    return { duplicado: false };
  }

  for (var p = 1; p < presencaData.length; p++) {
    if (!presencaData[p][0]) continue;
    if (presencaData[p][0].toString().trim().toLowerCase() !== email) continue;
    var pStatus = getPresencaStatus(presencaData[p]);
    if (pStatus !== 'APROVADO' && pStatus !== 'PENDENTE') continue;
    if (!isToday(presencaData[p][6])) continue;
    var checkinHora = presencaData[p][7] ? presencaData[p][7].toString().trim() : '';
    if (!checkinHora && presencaData[p][5]) checkinHora = formatTime(presencaData[p][5]);
    if (_modDiferente(presencaData[p])) continue; // FIX #4: outra modalidade
    if (janelaAtual && isTimeInWindow(checkinHora, janelaAtual)) {
      return { duplicado: true, motivo: 'duplicado_mesma_janela' };
    }
  }

  return { duplicado: false };
}

function hashPasswordSecure(password, salt) {
  var data = salt + ':' + password;
  var signature = Utilities.computeHmacSha256Signature(data, HMAC_SECRET);
  return 'hmac:' + salt + ':' + signature.map(function(byte) { return ('0' + (byte & 0xff).toString(16)).slice(-2); }).join('');
}

function hashPasswordLegacy(password) {
  var hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  return hash.map(function(byte) { return ('0' + (byte & 0xff).toString(16)).slice(-2); }).join('');
}

function generateSalt() {
  var bytes = [];
  for (var i = 0; i < 16; i++) { bytes.push(Math.floor(Math.random() * 256)); }
  return bytes.map(function(b) { return ('0' + b.toString(16)).slice(-2); }).join('');
}

function hashPassword(password) {
  var salt = generateSalt();
  return hashPasswordSecure(password, salt);
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !password) return false;
  if (storedHash.indexOf('hmac:') === 0) {
    var parts = storedHash.split(':');
    if (parts.length < 3) return false;
    var salt = parts[1];
    var expected = hashPasswordSecure(password, salt);
    return expected === storedHash;
  } else {
    var legacyHash = hashPasswordLegacy(password);
    return legacyHash === storedHash;
  }
}

function generateSessionToken(email) {
  var timestamp = new Date().getTime();
  var payload = email + ':' + timestamp;
  var signature = Utilities.computeHmacSha256Signature(payload, SESSION_SECRET);
  var sigHex = signature.map(function(byte) { return ('0' + (byte & 0xff).toString(16)).slice(-2); }).join('');
  return payload + ':' + sigHex;
}

function validateSessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  var parts = token.split(':');
  if (parts.length < 3) return null;
  var email = parts[0];
  var timestamp = parseInt(parts[1]);
  var providedSig = parts.slice(2).join(':');
  if (isNaN(timestamp)) return null;
  var now = new Date().getTime();
  var maxAge = SESSION_DURATION_HOURS * 60 * 60 * 1000;
  if (now - timestamp > maxAge) return null;
  var payload = email + ':' + timestamp;
  var expectedSig = Utilities.computeHmacSha256Signature(payload, SESSION_SECRET);
  var expectedHex = expectedSig.map(function(byte) { return ('0' + (byte & 0xff).toString(16)).slice(-2); }).join('');
  if (providedSig !== expectedHex) return null;
  return email;
}

function isRateLimited(key, maxAttempts, windowSeconds) {
  var cache = CacheService.getScriptCache();
  var cacheKey = 'ratelimit_' + key;
  var data = cache.get(cacheKey);
  var attempts = 0;
  if (data) { attempts = parseInt(data) || 0; }
  if (attempts >= maxAttempts) { return true; }
  cache.put(cacheKey, (attempts + 1).toString(), windowSeconds);
  return false;
}

function resetRateLimit(key) {
  var cache = CacheService.getScriptCache();
  cache.remove('ratelimit_' + key);
}

// ============================================================
// ===== RBAC v2 — Permissões estáticas + dinâmicas por professor ============
// Hierarquia: admin(3) > professor(2) > aluno(1)
// admin    → herda professor + aluno + lista própria
// professor → herda aluno + lista estática + lista dinâmica (configurada pelo admin)
// aluno     → lista base
// ===========================================================================

var ROLE_HIERARCHY = { admin: 3, professor: 2, aluno: 1 };

// ── Ações que o admin pode habilitar/desabilitar individualmente por professor ──
// Estas saem da lista estática PERMISSIONS.professor e passam a ser opcionais.
var PROFESSOR_DYNAMIC_PERMS = {
  saveCronogramaAula:    { label: 'Criar aulas no cronograma',       default: true  },
  deleteCronogramaAula:  { label: 'Remover aulas do cronograma',      default: false },
  adminUpdateStudent:    { label: 'Editar dados de alunos',           default: true  },
  bulkApproveCheckins:   { label: 'Aprovar check-ins em lote',        default: true  },
  setManualLevel:        { label: 'Alterar graduação manualmente',    default: false },
  addGraduacao:          { label: 'Graduar aluno',                    default: true  },
  deleteStudent:         { label: 'Excluir aluno',                    default: false },
  saveGradConfig:        { label: 'Editar configuração de graduação', default: false },
  saveMusculacaoFicha:   { label: 'Criar ficha de musculação',        default: true  },
  getPagamentosAdmin:    { label: 'Ver relatório de pagamentos',      default: false },
};

// ── Permissões ESTÁTICAS — sempre ativas independente de config ──
var PERMISSIONS = {
  aluno: [
    'login','requestAccount','getCTsList','resolveClientByEmail','getModalidadesCT','requestPasswordReset',
    'attendance','getRankingMonth',
    'getProfile','saveProfile','changePassword',
    'getMyPresencas','solicitarPresencaEsquecimento',
    'updateGrau','requestGraduacao','getMyGraduacoes','setMyInicioBJJ',
    'getGradConfig','getGradConfigMod','getExameConfig',
    'getChampions','getCampPlacar','getCampEvento','inscricaoCamp',
    'submitFeedback',
    'getCronogramaAulas','getMusculacao','saveMusculacaoLog',
    'getTreinosCustom','saveTreinoRealizado','getHistoricoTreinos',
    'saveUserModulePrefs','getUserModulePrefs',
    'checkTrialStatus','getIBJJFUpdates','marcarEstudouSozinho',
    'saveGameScore','getGameRanking',
    'getExamSlots','requestExam',
    'getPagamentoStatus','getAlunoPlanos','selecionarPlanoAluno',
    'gerarPixMensalidade','verificarPagamento',
    'salvarCartaoMP','removerCartaoMP',
    'getAulasProfessor','getAulasHoje',
    'getModalidades','whatsappCheckin',
  ],

  professor: [
    // Ações sempre permitidas para professor (não configuráveis pelo admin)
    'getStudentsList',
    'getPendingAccounts','approveAccount','rejectAccount',
    'getPendingCheckins','approveCheckin','rejectCheckin',
    'rejectGraduacao','getPendingGraduacoes',
    'getGraduacoes',
    'approveExamRequest','rejectExamRequest','addExamSlot','removeExamSlot',
    'getExamRequests',
    'getInactiveStudents','getGradAlerts',
    'getBirthdays','getAllBirthdaysToday',
    'getFeedbacks','markFeedbackRead',
    'saveAulaProfessor','validateAulaTecnicas','getPresencaList',
    'getAttendanceReport','getReportData','getStudentInsights','getSystemHealth',
    'getPendingResets','approvePasswordReset','rejectPasswordReset',
    'deleteMusculacaoFicha',
    'saveTreinoCustom','deleteTreinoCustom',
    'getAulasProfessor',
    'getGradConfigMod', // leitura, não escrita
  ],

  admin: [
    // Exclusivos de admin — NUNCA delegáveis a professor
    'deactivateAccount','reactivateAccount',
    'saveCTSchedule','saveCTDetails',
    'saveGradConfigMod','saveExameConfig',
    'saveModulesConfig','getModulesConfig',
    'saveChampions','deleteChampion','updateChampion',
    'saveCampEvento','getInscricoesCamp','aprovarInscricao','rejeitarInscricao',
    'saveCampPlacar',
    'setProfessor',
    'saveIBJJFUpdate','autoFetchIBJJF','fetchIBJJFExterno',
    'createCT','deleteCT',
    'vincularGatewayCT','getVinculosCT','removerVinculoCT',
    'salvarGatewayToken','getGatewayTokens','removerGatewayToken',
    'salvarPlano','deletarPlano','atribuirPlanoAluno','marcarPago',
    'salvarConfigMP','getConfigMP',
    'saveWellnessConfig','getWellnessCheckins','getWellnessReport','validateWellnessToken',
    'saveModalidade','deleteModalidade',
    'getPlanosList',
    'saveProfessorPerms',  // configurar permissões do professor
    'cobrarMensalidadeManual', // forçar cobrança recorrente agora
    'cobrarAgoraAluno',        // cobrança imediata de aluno específico
    'getBillingConfig',        // ler config de cobrança
    'saveBillingConfig',       // salvar config de cobrança
    'saveModalidadesPlanoMap', // mapeamento modalidade→plano
    'getModalidadesPlanoMap',  // ler mapeamento
    // ── ASSINATURA RECORRENTE ──
    'verificarAdmin',         // assinatura: checar admin
    'getPlanos',              // assinatura: listar planos
    'getAssinatura',          // assinatura: status atual
    'criarAssinatura',        // assinatura: criar preapproval
    'cancelarAssinatura',     // assinatura: cancelar preapproval
    'trocarPlano',            // assinatura: trocar plano
  ]
};

/**
 * Lê as permissões dinâmicas de um professor (col AD, índice 29).
 * Retorna array de action ids habilitadas.
 * Se o campo está vazio, aplica os defaults do PROFESSOR_DYNAMIC_PERMS.
 */
function getProfessorPerms(email) {
  try {
    var rows = getSheet('Alunos').getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0]) continue;
      if (rows[i][0].toString().trim().toLowerCase() !== email.toLowerCase()) continue;
      var raw = rows[i][29] ? rows[i][29].toString().trim() : ''; // AD
      if (raw) {
        try { return JSON.parse(raw); } catch(e) {}
      }
      // Sem config salva → aplica defaults
      var defaults = [];
      Object.keys(PROFESSOR_DYNAMIC_PERMS).forEach(function(k) {
        if (PROFESSOR_DYNAMIC_PERMS[k].default) defaults.push(k);
      });
      return defaults;
    }
  } catch(e) { Logger.log('getProfessorPerms: ' + e.message); }
  return [];
}

/**
 * Resolve o papel real do usuário lendo a planilha Alunos.
 * admin=TRUE + tipoPerfil != professor  → 'admin'
 * tipoPerfil === 'professor'            → 'professor'
 * else                                 → 'aluno'
 */
// ══════════════════════════════════════════════════════════════════
// ABA SuperAdmins — separada da aba Alunos
// Colunas: A=Email | B=Nome | C=SenhaHash | D=Ativo | E=DataCriacao
// SuperAdmins não aparecem na lista de alunos de nenhum cliente.
// Para mover a conta: copie a linha de Alunos → SuperAdmins e delete de Alunos.
// ══════════════════════════════════════════════════════════════════
function getOrCreateSuperAdminsSheet() {
  // SuperAdmins ficam na planilha MATRIX (principal) — não na do cliente
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName('SuperAdmins');
  if (!sh) {
    sh = ss.insertSheet('SuperAdmins');
    sh.appendRow(['Email','Nome','SenhaHash','Ativo','DataCriacao']);
    sh.getRange(1,1,1,5).setFontWeight('bold').setBackground('#1a1a2e').setFontColor('#C9A23A');
    Logger.log('[SuperAdmins] Aba criada na planilha matrix');
  }
  return sh;
}

/**
 * Verifica se o email existe na aba SuperAdmins E está ativo.
 * Usado em login, getRole e isEmailAdmin.
 */
function _isSuperAdminSheet(email) {
  if (!email) return false;
  var clean = email.toString().trim().toLowerCase();
  // Primeiro checa a lista hardcoded (mais rápido, sem I/O)
  if (isEmailSuperAdmin(clean)) return true;
  // Depois checa a planilha
  try {
    var sh   = getOrCreateSuperAdminsSheet();
    var rows = sh.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0]) continue;
      if (rows[i][0].toString().trim().toLowerCase() !== clean) continue;
      var ativo = rows[i][3] === true || rows[i][3] === 'TRUE' || rows[i][3] === 'true';
      return ativo;
    }
  } catch(e) { Logger.log('[_isSuperAdminSheet] ' + e.message); }
  return false;
}

/**
 * Busca senha do SuperAdmin na aba SuperAdmins.
 * Retorna { nome, hash } ou null se não encontrar.
 */
function _getSuperAdminCredentials(email) {
  var clean = email.toString().trim().toLowerCase();
  try {
    var sh   = getOrCreateSuperAdminsSheet();
    var rows = sh.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0]) continue;
      if (rows[i][0].toString().trim().toLowerCase() !== clean) continue;
      var ativo = rows[i][3] === true || rows[i][3] === 'TRUE' || rows[i][3] === 'true';
      if (!ativo) return null;
      return { nome: rows[i][1] ? rows[i][1].toString() : 'SuperAdmin', hash: rows[i][2] ? rows[i][2].toString() : '' };
    }
  } catch(e) { Logger.log('[_getSuperAdminCredentials] ' + e.message); }
  return null;
}

function getRole(email) {
  if (!email) return 'aluno';
  var clean = email.toString().trim().toLowerCase();
  // SuperAdmin tem role admin independente de qualquer planilha de cliente
  if (_isSuperAdminSheet(clean)) return 'admin';
  try {
    var rows = getSheet('Alunos').getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0]) continue;
      if (rows[i][0].toString().trim().toLowerCase() !== clean) continue;
      var isAdm = rows[i][6] === true || rows[i][6] === 'TRUE';
      var tipo  = rows[i][26] ? rows[i][26].toString().trim().toLowerCase() : '';
      if (isAdm) return 'admin';
      if (tipo === 'professor') return 'professor';
      return 'aluno';
    }
  } catch(e) { Logger.log('getRole: ' + e.message); }
  return 'aluno';
}

/**
 * Verifica se um papel tem permissão para uma action.
 * Para professor: verifica lista estática + lista dinâmica habilitada pelo admin.
 *
 * @param {string}   role        - 'admin' | 'professor' | 'aluno'
 * @param {string}   action      - nome da action
 * @param {string[]} [profPerms] - permissões dinâmicas do professor (só usado se role=professor)
 */
function hasPermission(role, action, profPerms) {
  if (!role || !action) return false;
  if (role === 'admin') return true; // admin herda tudo — sem exceções

  // Monta lista base herdada
  var base = (PERMISSIONS[role] || []).concat(PERMISSIONS.aluno || []);
  if (base.indexOf(action) !== -1) return true;

  // Professor: verifica permissões dinâmicas habilitadas pelo admin
  if (role === 'professor' && PROFESSOR_DYNAMIC_PERMS[action] !== undefined) {
    var perms = profPerms || [];
    return perms.indexOf(action) !== -1;
  }

  return false;
}

/**
 * Middleware principal. Retorna { email, role } ou null.
 */
function requireRole(data, minRole) {
  var email = requireAuth(data);
  if (!email) return null;
  var role  = getRole(email);
  var minLv = ROLE_HIERARCHY[minRole] || 1;
  var usrLv = ROLE_HIERARCHY[role]    || 1;
  if (usrLv < minLv) return null;
  return { email: email, role: role };
}

// ── Atalhos de compatibilidade ──



function isEmailAdmin(email) {
  if (!email) return false;
  var cleanEmail = email.toString().trim().toLowerCase();
  // SuperAdmin da aba SuperAdmins sempre é admin
  if (_isSuperAdminSheet(cleanEmail)) return true;
  try {
    var alunosSheet = getSheet('Alunos');
    var rows = alunosSheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] && rows[i][0].toString().trim().toLowerCase() === cleanEmail) {
        return rows[i][6] === true || rows[i][6] === 'TRUE';
      }
    }
  } catch (e) { Logger.log('Erro ao verificar admin: ' + e.message); }
  return false;
}

function isEmailProfessor(email) {
  if (!email) return false;
  var cleanEmail = email.toString().trim().toLowerCase();
  try {
    var alunosSheet = getSheet('Alunos');
    var rows = alunosSheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] && rows[i][0].toString().trim().toLowerCase() === cleanEmail) {
        var tipo = rows[i][26] ? rows[i][26].toString().trim().toLowerCase() : ''; // AA
        return tipo === 'professor';
      }
    }
  } catch(e) {}
  return false;
}

function isEmailSuperAdmin(email) {
  if (!email) return false;
  var cleanEmail = email.toString().trim().toLowerCase();
  for (var i = 0; i < SUPER_ADMIN_EMAILS.length; i++) {
    if (SUPER_ADMIN_EMAILS[i].trim().toLowerCase() === cleanEmail) return true;
  }
  return false;
}

function requireSuperAdmin(data) {
  var authEmail = requireAuth(data);
  if (!authEmail) return null;
  if (!isEmailSuperAdmin(authEmail)) return null;
  return authEmail;
}

function getProfessorCTs(email) {
  if (!email) return [];
  var cleanEmail = email.toString().trim().toLowerCase();
  try {
    var alunosSheet = getSheet('Alunos');
    var rows = alunosSheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] && rows[i][0].toString().trim().toLowerCase() === cleanEmail) {
        var ctsProfStr = rows[i][27] ? rows[i][27].toString().trim() : ''; // AB
        var mainCT = rows[i][4] ? rows[i][4].toString().trim() : '';
        if (ctsProfStr) {
          return ctsProfStr.split(',').map(function(c) { return c.trim(); }).filter(Boolean);
        }
        return mainCT ? [mainCT] : [];
      }
    }
  } catch(e) {}
  return [];
}

function requireProfessorOrAdmin(data) {
  var authEmail = requireAuth(data);
  if (!authEmail) return null;
  if (isEmailAdmin(authEmail) || isEmailProfessor(authEmail)) return authEmail;
  return null;
}

function requireAuth(data) {
  if (!data || !data.token) return null;
  var email = validateSessionToken(data.token);
  return email;
}

function requireAdmin(data) {
  var email = requireAuth(data);
  if (!email) return null;
  if (!isEmailAdmin(email)) return null;
  return email;
}


// ============================================================
// ===== CORE HELPERS =====
// ============================================================

function jsonResponse(success, message, extra) {
  var response = { success: success };
  if (message !== undefined && message !== null) response.message = message;
  if (extra) {
    var keys = Object.keys(extra);
    for (var k = 0; k < keys.length; k++) { response[keys[k]] = extra[keys[k]]; }
  }
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(publicMessage) {
  return jsonResponse(false, publicMessage || 'Erro no servidor');
}

function unauthorizedResponse() {
  return jsonResponse(false, 'Sessão expirada ou inválida. Faça login novamente.', { unauthorized: true });
}

function forbiddenResponse() {
  return jsonResponse(false, 'Você não tem permissão para esta ação.', { forbidden: true });
}

function isValidEmail(email) {
  if (!email || email.length > MAX_EMAIL_LENGTH) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isKnownDomain(email) {
  var knownDomains = ['gmail.com','hotmail.com','outlook.com','yahoo.com','protonmail.com','icloud.com','aol.com','mail.com','uol.com.br','terra.com.br','ig.com.br','bol.com.br','globomail.com','yahoo.com.br','hotmail.com.br','live.com'];
  var domain = email.split('@')[1].toLowerCase();
  return knownDomains.indexOf(domain) !== -1;
}

function getSheet(name) {
  var allowed = ['Alunos', 'Presenca', 'CTs', 'PendingAccounts', 'SenhaReset', 'Campeoes', 'CampPlacar', 'Modalidades'];
  if (allowed.indexOf(name) === -1) throw new Error('Sheet não permitida');
  var ss = _getSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('Sheet não encontrada');
  return sheet;
}

function formatTime(val) {
  if (!val) return '';
  if (val instanceof Date) {
    var hh = ('0' + val.getHours()).slice(-2);
    var mm = ('0' + val.getMinutes()).slice(-2);
    return hh + ':' + mm;
  }
  var str = val.toString().trim();
  if (str.length > 10) {
    var d = new Date(str);
    if (!isNaN(d.getTime())) {
      var hh2 = ('0' + d.getHours()).slice(-2);
      var mm2 = ('0' + d.getMinutes()).slice(-2);
      return hh2 + ':' + mm2;
    }
  }
  return str;
}

function formatDate(val) {
  if (!val) return '-';
  var d;
  if (val instanceof Date) { d = val; } else { d = new Date(val); }
  if (isNaN(d.getTime())) return val.toString();
  var dd = ('0' + d.getDate()).slice(-2);
  var mm = ('0' + (d.getMonth() + 1)).slice(-2);
  var yyyy = d.getFullYear();
  return dd + '/' + mm + '/' + yyyy;
}

function isToday(val) {
  if (!val) return false;
  var d = (val instanceof Date) ? val : new Date(val);
  if (isNaN(d.getTime())) return false;
  var now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function isThisWeek(val) {
  if (!val) return false;
  var d = (val instanceof Date) ? val : new Date(val);
  if (isNaN(d.getTime())) return false;
  var now = new Date();
  var diffMs = now.getTime() - d.getTime();
  return diffMs >= 0 && diffMs <= 7 * 24 * 60 * 60 * 1000;
}

function getPresencaStatus(row) {
  var status = (row.length > 8 && row[8]) ? row[8].toString().toUpperCase().trim() : '';
  if (!status || status === '') return 'APROVADO';
  return status;
}


// ============================================================
// ===== HELPERS v4.9 — modalidadesGrad + multidisciplinar =====
// ============================================================

/**
 * Lê a coluna AH (índice 33, 0-based) e retorna o objeto modalidadesGrad.
 * Retorna {} se a coluna estiver vazia ou inválida.
 * Formato esperado: { "bjj_adulto": {"nivel":"Preta","grau":0}, "muay_thai": {"nivel":"Azul","grau":0} }
 */
function _parseModalidadesGrad(rawVal) {
  if (!rawVal) return {};
  var s = rawVal.toString().trim();
  if (!s || s === '{}') return {};
  if (s.indexOf('pendente:') === 0) return {};
  try { return JSON.parse(s); } catch(e) { return {}; }
}

/**
 * Dado o objeto modalidadesGrad e a modalidade principal,
 * retorna { nivel, grau } para sincronizar as colunas C e D.
 * Suporta chave legada "faixa" além da nova "nivel".
 */
function _gradParaPrincipal(modalidadesGrad, modalidadePrincipal) {
  if (!modalidadePrincipal || !modalidadesGrad) return null;
  var g = modalidadesGrad[modalidadePrincipal];
  if (!g) return null;
  if (modalidadePrincipal === 'muay_thai') {
    var grauNum = parseInt(g.grau) || 1;
    var corLabel = g.cor || g.faixa || 'Branco';
    return { faixa: 'Grau ' + grauNum + ' — ' + corLabel, grau: grauNum, cor: corLabel, nivelLabel: g.nivelLabel || '' };
  }
  if (modalidadePrincipal === 'capoeira') {
    var cordaoNome = g.cordao || g.faixa || 'Sem cordão';
    var grauOrdem  = parseInt(g.grau) || 1;
    return { faixa: cordaoNome + ' (' + (g.nivelLabel || '') + ')', cordao: cordaoNome, grau: grauOrdem, nivelLabel: g.nivelLabel || '' };
  }
  return { faixa: g.nivel || g.faixa || 'Branca', grau: parseInt(g.grau) || 0 };
}

/**
 * v4.9 — Lê o nível atual de uma modalidade de forma normalizada.
 * Suporta chave legada "faixa" e nova "nivel".
 * Retorna { nivel, grau }.
 */
/**
 * Retorna tipo de graduação e grau máximo para uma modalidade.
 * Consulta a sheet Modalidades (col G = gradTipo). Fallback seguro.
 */
function _getModInfo(modId) {
  if (!modId) return { tipo: 'faixa_cintura', maxGrau: 4 };
  // FONTE ÚNICA: planilha Modalidades — sem hardcoded
  var key = modId.toString().trim().toLowerCase();
  try {
    var cache = _getModInfoCache();
    if (cache[key]) return cache[key];
    // Se não encontrou no cache, lê da planilha diretamente
    var sheet = ensureModalidadesSheet();
    var rows  = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0]) continue;
      if (rows[i][0].toString().trim().toLowerCase() !== key) continue;
      var gradTipo = rows[i][6] ? rows[i][6].toString().trim() : 'faixa_cintura';
      var maxGrau  = gradTipo === 'prajied' ? (key === 'muay_thai_khan' ? 16 : 11) : gradTipo === 'corda' ? 12 : gradTipo === 'nenhum' ? 0 : 4;
      return { tipo: gradTipo, maxGrau: maxGrau };
    }
  } catch(e) { Logger.log('_getModInfo erro: ' + e.message); }
  return { tipo: 'faixa_cintura', maxGrau: 4 };  // fallback seguro
}

// Cache em memória por execução (evita múltiplos I/O na mesma requisição)
var _modInfoCacheObj = null;
function _getModInfoCache() {
  if (_modInfoCacheObj) return _modInfoCacheObj;
  _modInfoCacheObj = {};
  try {
    var rows = ensureModalidadesSheet().getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0]) continue;
      var id       = rows[i][0].toString().trim().toLowerCase();
      var gradTipo = rows[i][6] ? rows[i][6].toString().trim() : 'faixa_cintura';
      var maxGrau  = gradTipo === 'prajied' ? (id === 'muay_thai_khan' ? 16 : 11) : gradTipo === 'corda' ? 12 : gradTipo === 'nenhum' ? 0 : 4;
      _modInfoCacheObj[id] = { tipo: gradTipo, maxGrau: maxGrau };
    }
  } catch(e) { Logger.log('_getModInfoCache erro: ' + e.message); }
  return _modInfoCacheObj;
}

function _getNivelAtual(modalidadesGrad, modId, fallbackNivel) {
  var g = modalidadesGrad && modalidadesGrad[modId];
  if (!g) {
    // Default seguro por tipo de modalidade
    var _mi = _getModInfo(modId);
    if (_mi.tipo === 'prajied') return { nivel: '1', faixa: 'Branco', grau: 1, nivelLabel: 'Iniciante' };
    if (_mi.tipo === 'corda')   return { nivel: 'sem-cordao', faixa: 'Sem cordão', cordao: 'Sem cordão', grau: 1, nivelLabel: 'Aluno iniciante' };
    if (_mi.tipo === 'nenhum')  return { nivel: '', faixa: '', grau: 0 };
    return { nivel: fallbackNivel || 'Branca', grau: 0 };
  }
  // Muay Thai — Kruang Prajied
  if (modId === 'muay_thai') {
    var grauNum = parseInt(g.grau) || 1;
    var corLabel = g.cor || g.faixa || g.nivel || 'Branco';
    return { nivel: g.nivel || String(grauNum), faixa: corLabel, grau: grauNum, cor: corLabel, nivelLabel: g.nivelLabel || '' };
  }
  // Capoeira — Sistema de Cordões
  if (modId === 'capoeira') {
    var cordaoNome = g.cordao || g.faixa || g.nivel || 'Sem cordão';
    var grauOrdem  = parseInt(g.grau) || 1;
    return { nivel: g.nivel || 'sem-cordao', faixa: cordaoNome, cordao: cordaoNome, grau: grauOrdem, nivelLabel: g.nivelLabel || '' };
  }
  return {
    nivel: g.nivel || g.faixa || fallbackNivel || 'Branca',
    grau:  parseInt(g.grau) || 0
  };
}

/**
 * v4.9 — Retorna o objeto de graduação inicial correto para uma modalidade.
 * Consulta o gradTipo cadastrado na sheet Modalidades.
 * Para modalidades sem graduação formal (MMA, Wrestling), retorna {}.
 */
function _gradInicialParaMod(modId) {
  if (!modId) return { nivel: 'Branca', grau: 0 };
  try {
    var sheet = ensureModalidadesSheet();
    var rows  = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0]) continue;
      if (rows[i][0].toString().trim().toLowerCase() === modId.toLowerCase()) {
        var gradTipo = rows[i][6] ? rows[i][6].toString().trim() : 'nenhum';
        if (gradTipo === 'nenhum') return {};
        if (gradTipo === 'prajied') {
          // muay_thai_khan começa no Khan 1 (Branco), muay_thai simples começa no Grau 1
          if (modId.toLowerCase() === 'muay_thai_khan') {
            return { nivel: 'khan_1', faixa: 'Branco', grau: 1, cor: 'Branco', nivelLabel: '1° Khan Nueng' };
          }
          return { nivel: '1', faixa: 'Branco', grau: 1, cor: 'Branco', nivelLabel: 'Iniciante' };
        }
        if (gradTipo === 'corda')   return { nivel: 'sem-cordao', faixa: 'Sem cord\u00e3o', cordao: 'Sem cord\u00e3o', grau: 1, nivelLabel: 'Aluno iniciante' }; // Capoeira — grau inicial
        return { nivel: 'Branca', grau: 0 };
      }
    }
  } catch(e) { Logger.log('_gradInicialParaMod erro: ' + e.message); }
  return { nivel: 'Branca', grau: 0 };
}


// ============================================================
// ===== MIGRAÇÃO v4.9 — rodar UMA VEZ no GAS Editor =====
// ============================================================

/**
 * Popula col AH (34) de alunos sem modalidadesGrad.
 * Execute: GAS Editor → Run → migrarModalidadesGrad
 */
function migrarModalidadesGrad() {
  var sheet = getSheet('Alunos');
  var rows  = sheet.getDataRange().getValues();
  var count = 0;
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    var existing = rows[i][33] ? rows[i][33].toString().trim() : '';
    if (existing && existing !== '{}' && existing.charAt(0) === '{') continue;
    var modalidades = rows[i][31] ? rows[i][31].toString().trim() : 'bjj_adulto';
    var principal   = rows[i][32] ? rows[i][32].toString().trim() : modalidades.split(',')[0].trim();
    var faixa = rows[i][2] ? rows[i][2].toString() : 'Branca';
    var grau  = parseInt(rows[i][3]) || 0;
    var mods  = modalidades.split(',').map(function(m){ return m.trim(); }).filter(Boolean);
    if (mods.length === 0) mods = ['bjj_adulto'];
    var grad = {};
    mods.forEach(function(m) { grad[m] = _gradInicialParaMod(m); });
    if (principal && grad[principal] !== undefined) {
      if (Object.keys(grad[principal]).length > 0) {
        grad[principal].nivel = faixa;
        grad[principal].faixa = faixa;
        grad[principal].grau  = grau;
      }
    }
    sheet.getRange(i + 1, 34).setValue(JSON.stringify(grad));
    count++;
  }
  Logger.log('migrarModalidadesGrad: ' + count + ' alunos atualizados.');
  return 'Migração: ' + count + ' alunos';
}

/**
 * v4.9 — Preenche col I (modalidade) na sheet Graduacoes para registros sem modalidade.
 * Execute: GAS Editor → Run → migrarGraduacoesModalidade
 */
function migrarGraduacoesModalidade() {
  var ss   = _getSpreadsheet();
  var grad = ss.getSheetByName('Graduacoes');
  if (!grad) { Logger.log('Sheet Graduacoes não existe.'); return 'Sem sheet'; }
  var header = grad.getRange(1, 1, 1, 9).getValues()[0];
  if (!header[8] || header[8].toString().trim() === '') {
    grad.getRange(1, 9).setValue('modalidade');
    grad.getRange(1, 9).setFontWeight('bold');
  }
  var aluSheet = getSheet('Alunos');
  var aluRows  = aluSheet.getDataRange().getValues();
  var modMap   = {};
  for (var a = 1; a < aluRows.length; a++) {
    if (!aluRows[a][0]) continue;
    var em = aluRows[a][0].toString().trim().toLowerCase();
    modMap[em] = aluRows[a][32] ? aluRows[a][32].toString().trim() : 'bjj_adulto';
  }
  var rows  = grad.getDataRange().getValues();
  var count = 0;
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    var existingMod = rows[i][8] ? rows[i][8].toString().trim() : '';
    if (existingMod) continue;
    var email = rows[i][0].toString().trim().toLowerCase();
    grad.getRange(i + 1, 9).setValue(modMap[email] || 'bjj_adulto');
    count++;
  }
  Logger.log('migrarGraduacoesModalidade: ' + count + ' linhas.');
  return 'Migração: ' + count + ' linhas';
}


// ============================================================
// ===== doGet =====
// ============================================================

function doGet(e) {
  var params = e && e.parameter ? e.parameter : {};
  var source  = (params.source  || '').toString().toLowerCase();
  var action  = (params.action  || '').toString().toLowerCase();
  var token   = (params.token   || params.access_token || '').toString();
  var gymId   = (params.gymId   || params.gym_id || params.academyId || '').toString();
  var userId  = (params.userId  || params.user_id  || params.cpf || '').toString();

  // ── Painel SuperAdmin ────────────────────────────────────────
  // Acesso: URL_DO_GAS?painel=1&token=SEU_TOKEN_DE_SESSAO
  // O token é gerado no login normal do SuperAdmin no app.
  // Sem senha exposta no HTML.
  if (params.painel === '1') {
    _loadRegistry();
    var painelToken = params.token ? params.token.toString() : '';
    var painelEmail = painelToken ? validateSessionToken(painelToken) : null;
    if (!painelEmail || !_isSuperAdminSheet(painelEmail)) {
      return HtmlService.createHtmlOutput(
        '<div style="font-family:sans-serif;padding:2rem">' +
        '<h2 style="color:#c00">❌ Acesso negado</h2>' +
        '<p style="color:#666;margin-top:1rem">Faça login no app como SuperAdmin, copie seu token e acesse:<br>' +
        '<code>URL_DO_GAS?painel=1&token=SEU_TOKEN</code></p></div>'
      );
    }
    return HtmlService.createHtmlOutput(_buildPainelHtml(painelToken))
      .setTitle('CTM — Painel SuperAdmin')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  // ────────────────────────────────────────────────────────────

  if ((source === 'wellhub' || source === 'gympass' || source === 'totalpass') && action === 'checkin') {
    var result = processWellnessCheckin(source === 'gympass' ? 'wellhub' : source, token, gymId, userId, params);
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }

  if (params.qr && params.acao === 'checkin') {
    return HtmlService.createHtmlOutput('<h1>🥋 Jiu Jitsu Academy</h1><p>Redirecionando...</p><script>window.location.href=window.location.href;</script>');
  }

  return HtmlService.createHtmlOutput('<h1>🥋 Jiu Jitsu Academy</h1><p>Sistema ativo.</p>');
}

// ============================================================
// ===== DoPost - ROUTER =====
// ============================================================

function doPost(e) {
  try {
    var data  = JSON.parse(e.postData.contents);
    _loadRegistry(); // carrega CTM_REGISTRY do PropertiesService
    var ctmParam = ((e && e.parameter && e.parameter.ctm) ? e.parameter.ctm : (data.ctmId || '')).toString().trim().toLowerCase();
    _currentCtmId   = ctmParam;
    _currentSheetId = _resolveSheetId(ctmParam);
    Logger.log('REQ: ' + (data.action || 'unknown') + ' | ctm: ' + (ctmParam || 'default'));

    // ── RBAC gate central ────────────────────────────────────────
    // Actions públicas dispensam sessão.
    var _PUBLIC = ['login','requestAccount','getCTsList','getModalidadesCT','getFaixas',
                   'requestPasswordReset','checkTrialStatus',
                   'whatsappCheckin','webhookMP',
                   'painelAction','painelGetStatus',
                   'painelCriarCliente','painelListarClientes','painelRemoverCliente','ping','checkClient'];
    if (_PUBLIC.indexOf(data.action) === -1) {
      var _gateEmail = requireAuth(data);
      if (!_gateEmail) return unauthorizedResponse();
      var _gateRole  = getRole(_gateEmail);
      // Para professores, carrega permissões dinâmicas antes de validar
      var _profPerms = _gateRole === 'professor' ? getProfessorPerms(_gateEmail) : null;
      if (!hasPermission(_gateRole, data.action, _profPerms)) {
        Logger.log('RBAC BLOQUEOU: ' + _gateEmail + ' [' + _gateRole + '] → ' + data.action);
        return forbiddenResponse();
      }
    }
    // ─────────────────────────────────────────────────────────────

    switch(data.action) {
      case 'requestAccount':        return handleRequestAccount(data);
      case 'login':                 return handleLogin(data);
      case 'getCTsList':            return handleGetCTsList();
      case 'resolveClientByEmail':  return handleResolveClientByEmail(data);
      case 'requestPasswordReset':  return handleRequestPasswordReset(data);
      case 'attendance':            return handleAttendance(data);
      case 'getRankingMonth':       return handleGetRankingMonth(data);
      case 'getInactiveStudents':   return handleGetInactiveStudents(data);
      case 'getProfile':            return handleGetProfile(data);
      case 'saveProfile':           return handleSaveProfile(data);
      case 'saveAvatarFoto':        return handleSaveAvatarFoto(data);
      case 'getAlunosComFotos':     return handleGetAlunosComFotos(data);
      case 'checkinEmMassa':        return handleCheckinEmMassa(data);
      case 'analisarFotoTreino':    return handleAnalisarFotoTreino(data);
      case 'changePassword':        return handleChangePassword(data);
      case 'updateGrau':            return handleUpdateGrau(data);
      case 'getChampions':          return handleGetChampions();
      case 'getCampPlacar':         return handleGetCampPlacar(data);
      case 'getMyPresencas':        return handleGetMyPresencas(data);
      case 'getStudentsList':       return handleGetStudentsList(data);
      case 'deleteStudent':         return handleDeleteStudent(data);
      case 'adminUpdateStudent':    return handleAdminUpdateStudent(data);
      case 'getPendingAccounts':    return handleGetPendingAccounts(data);
      case 'approveAccount':        return handleApproveAccount(data);
      case 'rejectAccount':         return handleRejectAccount(data);
      case 'getPendingCheckins':    return handleGetPendingCheckins(data);
      case 'approveCheckin':        return handleApproveCheckin(data);
      case 'rejectCheckin':         return handleRejectCheckin(data);
      case 'bulkApproveCheckins':   return handleBulkApproveCheckins(data);
      case 'solicitarPresencaEsquecimento': return handleSolicitarPresencaEsquecimento(data);
      case 'saveCTSchedule':        return handleSaveCTSchedule(data);
      case 'saveCTDetails':         return handleSaveCTDetails(data);
      case 'getGradConfig':         return handleGetGradConfig(data);
      case 'saveGradConfig':        return handleSaveGradConfig(data);
      case 'getGradConfigMod':      return handleGetGradConfigMod(data);
      case 'saveGradConfigMod':     return handleSaveGradConfigMod(data);
      case 'setManualLevel':        return handleSetManualLevel(data);
      case 'getGradAlerts':         return handleGetGradAlerts(data);
      case 'getAllBirthdaysToday':   return handleGetAllBirthdaysToday(data);
      case 'saveExameConfig':       return handleSaveExameConfig(data);
      case 'getExameConfig':        return handleGetExameConfig(data);
      case 'saveCronogramaAula':    return handleSaveCronogramaAula(data);
      case 'getCronogramaAulas':    return handleGetCronogramaAulas(data);
      case 'deleteCronogramaAula':  return handleDeleteCronogramaAula(data);
      case 'getMusculacao':         return handleGetMusculacao(data);
      case 'saveMusculacaoFicha':   return handleSaveMusculacaoFicha(data);
      case 'saveMusculacaoLog':     return handleSaveMusculacaoLog(data);
      case 'deleteMusculacaoFicha': return handleDeleteMusculacaoFicha(data);
      case 'getTreinosCustom':      return handleGetTreinosCustom(data);
      case 'saveTreinoCustom':      return handleSaveTreinoCustom(data);
      case 'deleteTreinoCustom':    return handleDeleteTreinoCustom(data);
      case 'saveTreinoRealizado':   return handleSaveTreinoRealizado(data);
      case 'getHistoricoTreinos':   return handleGetHistoricoTreinos(data);
      case 'getIBJJFUpdates':       return handleGetIBJJFUpdates(data);
      case 'saveIBJJFUpdate':       return handleSaveIBJJFUpdate(data);
      case 'autoFetchIBJJF':        return handleAutoFetchIBJJF(data);
      case 'fetchIBJJFExterno':     return handleFetchIBJJFExterno(data);
      case 'getModulesConfig':      return handleGetModulesConfig(data);
      case 'saveModulesConfig':     return handleSaveModulesConfig(data);
      case 'getUserModulePrefs':    return handleGetUserModulePrefs(data);
      case 'saveUserModulePrefs':   return handleSaveUserModulePrefs(data);
      case 'getBirthdays':          return handleGetBirthdays(data);
      case 'deactivateAccount':     return handleDeactivateAccount(data);
      case 'reactivateAccount':     return handleReactivateAccount(data);
      case 'createCT':              return handleCreateCT(data);
      case 'deleteCT':              return handleDeleteCT(data);
      case 'getSuperAdminData':     return handleGetSuperAdminData(data);
      case 'checkIsSuperAdmin':     return handleCheckIsSuperAdmin(data);
      case 'getTrialConfig':        return handleGetTrialConfig(data);
      case 'saveTrialConfig':       return handleSaveTrialConfig(data);
      case 'checkTrialStatus':      return handleCheckTrialStatus(data);
      case 'getPresencaList':       return handleGetPresencaList(data);
      case 'saveAulaProfessor':     return handleSaveAulaProfessor(data);
      case 'setProfessor':          return handleSetProfessor(data);
      case 'saveProfessorPerms':    return handleSaveProfessorPerms(data);
      case 'getProfessorPermsConfig': return handleGetProfessorPermsConfig(data);
      case 'cobrarMensalidadeManual': return handleCobrarMensalidadeManual(data);
      case 'cobrarAgoraAluno':        return handleCobrarAgoraAluno(data);
      case 'getBillingConfig':        return handleGetBillingConfig(data);
      case 'saveBillingConfig':       return handleSaveBillingConfig(data);
      case 'saveModalidadesPlanoMap': return handleSaveModalidadesPlanoMap(data);
      case 'getModalidadesPlanoMap':  return handleGetModalidadesPlanoMap(data);
      case 'getAulasProfessor':     return handleGetAulasProfessor(data);
      case 'validateAulaTecnicas':  return handleValidateAulaTecnicas(data);
      case 'marcarEstudouSozinho':  return handleMarcarEstudouSozinho(data);
      case 'getExamSlots':          return handleGetExamSlots(data);
      case 'addExamSlot':           return handleAddExamSlot(data);
      case 'removeExamSlot':        return handleRemoveExamSlot(data);
      case 'requestExam':           return handleRequestExam(data);
      case 'getExamRequests':       return handleGetExamRequests(data);
      case 'approveExamRequest':    return handleApproveExamRequest(data);
      case 'rejectExamRequest':     return handleRejectExamRequest(data);
      case 'getAttendanceReport':   return handleGetAttendanceReport(data);
      case 'addGraduacao':          return handleAddGraduacao(data);
      case 'rejectGraduacao':       return handleRejectGraduacao(data);
      case 'getGraduacoes':         return handleGetGraduacoes(data);
      case 'getPendingGraduacoes':  return handleGetPendingGraduacoes(data);
      case 'getMyGraduacoes':       return handleGetMyGraduacoes(data);
      case 'setMyInicioBJJ':        return handleSetMyInicioBJJ(data);
      case 'requestGraduacao':      return handleRequestGraduacao(data);
      case 'getReportData':         return handleGetReportData(data);
      case 'getStudentInsights':    return handleGetStudentInsights(data);
      case 'getSystemHealth':       return handleGetSystemHealth(data);
      case 'getPendingResets':      return handleGetPendingResets(data);
      case 'approvePasswordReset':  return handleApprovePasswordReset(data);
      case 'rejectPasswordReset':   return handleRejectPasswordReset(data);
      case 'saveChampions':         return handleSaveChampions(data);
      case 'deleteChampion':        return handleDeleteChampion(data);
      case 'updateChampion':        return handleUpdateChampion(data);
      case 'saveCampPlacar':        return handleSaveCampPlacar(data);
      case 'saveCampEvento':        return handleSaveCampEvento(data);
      case 'getCampEvento':         return handleGetCampEvento(data);
      case 'inscricaoCamp':         return handleInscricaoCamp(data);
      case 'getInscricoesCamp':     return handleGetInscricoesCamp(data);
      case 'aprovarInscricao':      return handleAprovarInscricao(data);
      case 'rejeitarInscricao':     return handleRejeitarInscricao(data);
      case 'whatsappCheckin':       return handleWhatsAppCheckin(data);
      case 'getAulasHoje':          return handleGetAulasHoje(data);
      case 'saveGameScore':         return handleSaveGameScore(data);
      case 'getGameRanking':        return handleGetGameRanking(data);
      case 'submitFeedback':        return handleSubmitFeedback(data);
      case 'getFeedbacks':          return handleGetFeedbacks(data);
      case 'markFeedbackRead':      return handleMarkFeedbackRead(data);

      // ── PAGAMENTOS v2 ──
      case 'salvarGatewayToken':    return handleSalvarGatewayToken(data);
      case 'getGatewayTokens':      return handleGetGatewayTokens(data);
      case 'removerGatewayToken':   return handleRemoverGatewayToken(data);
      case 'vincularGatewayCT':     return handleVincularGatewayCT(data);
      case 'getVinculosCT':         return handleGetVinculosCT(data);
      case 'removerVinculoCT':      return handleRemoverVinculoCT(data);
      case 'salvarPlano':           return handleSalvarPlano(data);
      case 'deletarPlano':          return handleDeletarPlano(data);
      case 'getPlanosList':         return handleGetPlanosList(data);
      case 'getAlunoPlanos':        return handleGetAlunoPlanos(data);
      case 'selecionarPlanoAluno':  return handleSelecionarPlanoAluno(data);
      case 'getPagamentosAdmin':    return handleGetPagamentosAdmin(data);
      case 'atribuirPlanoAluno':    return handleAtribuirPlanoAluno(data);
      case 'marcarPago':            return handleMarcarPago(data);
      case 'getPagamentoStatus':    return handleGetPagamentoStatus(data);
      case 'gerarPixMensalidade':   return handleGerarPixMensalidade(data);
      case 'verificarPagamento':    return handleVerificarPagamento(data);
      case 'salvarCartaoMP':        return handleSalvarCartaoMP(data);
      case 'removerCartaoMP':       return handleRemoverCartaoMP(data);
      case 'salvarConfigMP':        return handleSalvarConfigMP(data);
      case 'getConfigMP':           return handleGetConfigMP(data);
      case 'webhookMP':             return handleWebhookMP(data);

      // ── REDES DE BENEFÍCIO ──
      case 'getWellnessConfig':       return handleGetWellnessConfig(data);
      case 'saveWellnessConfig':      return handleSaveWellnessConfig(data);
      case 'getWellnessCheckins':     return handleGetWellnessCheckins(data);
      case 'getWellnessReport':       return handleGetWellnessReport(data);
      case 'validateWellnessToken':   return handleValidateWellnessToken(data);

      case 'getModalidades':        return handleGetModalidades(data);
      case 'getFaixas':             return handleGetFaixas(data);
      case 'getTodasModalidades':    return handleGetTodasModalidades(data);   // SuperAdmin: catálogo completo
      case 'getModalidadesCT':       return handleGetModalidadesCT(data);       // Público: modalidades de um CT pelo nome
      case 'setModalidadesContrato': return handleSetModalidadesContrato(data); // SuperAdmin: define contrato
      case 'getModalidadesContrato': return handleGetModalidadesContrato(data); // SuperAdmin: lê contrato
      case 'listarContratos':        return handleListarContratos(data);          // SuperAdmin: lista todos os CTs com contrato
      case 'saveModalidade':        return handleSaveModalidade(data);
      case 'deleteModalidade':      return handleDeleteModalidade(data);

      // ── ASSINATURA RECORRENTE (Mercado Pago Preapproval) ──
      case 'verificarAdmin':      return handleVerificarAdmin(data);
      case 'getPlanos':           return handleGetPlanos(data);
      case 'getAssinatura':       return handleGetAssinatura(data);
      case 'asnCarregarTudo':     return handleAsnCarregarTudo(data);
      case 'criarAssinatura':     return handleCriarAssinatura(data);
      case 'cancelarAssinatura':  return handleCancelarAssinatura(data);
      case 'trocarPlano':         return handleTrocarPlano(data);
      case 'getNovidades':        return handleGetNovidades(data);
      case 'publicarNovidade':    return handlePublicarNovidade(data);
      case 'removerNovidade':     return handleRemoverNovidade(data);

      // ── Painel SuperAdmin ──
      case 'painelAction':        return handlePainelAction(data);
      case 'painelGetStatus':     return handlePainelGetStatus(data);
      case 'painelCriarCliente':  return handlePainelCriarCliente(data);
      case 'painelListarClientes':return handlePainelListarClientes(data);
      case 'painelRemoverCliente':return handlePainelRemoverCliente(data);
      case 'painelResetRegistry': {
        var authEmail = data.token ? validateSessionToken(data.token) : null;
        if (!authEmail || !_isSuperAdminSheet(authEmail)) return forbiddenResponse();
        PropertiesService.getScriptProperties().deleteProperty('CTM_REGISTRY_JSON');
        _loadRegistry();
        return jsonResponse(true, 'Registry resetado. Clientes: ' + Object.keys(CTM_REGISTRY).length);
      }
      case 'ping': return ContentService.createTextOutput(JSON.stringify({success:true,msg:'pong',version:CTM_VERSION,registry:Object.keys(CTM_REGISTRY).length,sheet:SHEET_ID.substring(0,10)})).setMimeType(ContentService.MimeType.JSON);
      case 'checkClient': {
        _loadRegistry();
        var cId = (data.ctmId||'').toString().trim().toLowerCase();
        var exists = cId && !!CTM_REGISTRY[cId];
        return ContentService.createTextOutput(JSON.stringify({success:true,exists:exists,ctmId:cId})).setMimeType(ContentService.MimeType.JSON);
      }

      default:
        return errorResponse('Ação não reconhecida');
    }
  } catch (error) {
    Logger.log('ERRO: ' + error.message);
    return errorResponse('Erro interno do servidor');
  }
}


// ============================================================
// ===== REQUEST ACCOUNT — v4.4+ (sem CT/faixa no cadastro) =====
// ============================================================

function handleRequestAccount(data) {
  if (!data.name || !data.email || !data.password) {
    return jsonResponse(false, 'Preencha todos os campos obrigatórios');
  }

  var name     = cleanField(data.name, MAX_NAME_LENGTH);
  var email    = data.email.toString().trim().toLowerCase();
  var password = data.password;

  // Faixa/grau default — professor ajusta após aprovação
  var faixa = 'Branca';
  var grau  = '0';
  var ct    = ''; // preenchido pelo admin ao aprovar

  // Modalidades solicitadas pelo aluno
  var modalidadesSolicitadas = cleanField(data.modalidadesSolicitadas || '', 300);

  if (name.length < 3)
    return jsonResponse(false, 'Nome deve ter no mínimo 3 caracteres');
  if (!isValidEmail(email))
    return jsonResponse(false, 'Email inválido');
  if (!isKnownDomain(email))
    return jsonResponse(false, 'Use um email de provedor conhecido (Gmail, Hotmail, Outlook, etc)');
  if (password.length < 6)
    return jsonResponse(false, 'Senha deve ter no mínimo 6 caracteres');
  if (password.length > 128)
    return jsonResponse(false, 'Senha muito longa');
  if (!modalidadesSolicitadas)
    return jsonResponse(false, 'Selecione pelo menos uma modalidade');

  if (isRateLimited('register_' + email, 3, 600)) {
    return jsonResponse(false, 'Muitas tentativas de cadastro. Aguarde alguns minutos.');
  }

  try {
    var alunosSheet = getSheet('Alunos');
    var alunosData  = alunosSheet.getDataRange().getValues();
    for (var i = 1; i < alunosData.length; i++) {
      if (alunosData[i][0] && alunosData[i][0].toString().toLowerCase() === email) {
        return jsonResponse(false, 'Este email já tem uma conta aprovada');
      }
    }

    var pendingSheet = getSheet('PendingAccounts');
    var pendingData  = pendingSheet.getDataRange().getValues();
    for (var j = 1; j < pendingData.length; j++) {
      if (pendingData[j][0] && pendingData[j][0].toString().toLowerCase() === email) {
        var pSt  = pendingData[j][7] ? pendingData[j][7].toString().trim().toUpperCase() : '';
        var pSt6 = pendingData[j][6] ? pendingData[j][6].toString().trim().toUpperCase() : '';
        if (pSt === 'PENDENTE' || (pSt === '' && pSt6 === 'PENDENTE')) {
          return jsonResponse(false, 'Sua solicitação já está pendente de aprovação');
        }
      }
    }

    var hashStr    = hashPassword(password);
    var nascimento = cleanField(data.nascimento || '', 20);
    var telefone   = cleanField(data.telefone   || '', 30);

    // PendingAccounts row:
    // [0]Email [1]Nome [2]Faixa [3]Grau [4]CT [5]Hash [6]false [7]PENDENTE [8]Data
    // [9]Nascimento [10]Telefone [11..14]reservado [15]ModalidadesSolicitadas
    var row = [
      email, name, faixa, grau, ct, hashStr,
      false, 'PENDENTE', new Date(),
      nascimento, telefone,
      '', '', '', '',          // colunas L, M, N, O — reservadas
      modalidadesSolicitadas   // coluna P (índice 15)
    ];
    pendingSheet.appendRow(row);

    Logger.log('Conta pendente: ' + email + ' | modalidades: ' + modalidadesSolicitadas);
    return jsonResponse(true, 'Solicitação enviada! Aguarde aprovação do Professor.', {
      email:                   email,
      name:                    name,
      status:                  'PENDENTE',
      modalidadesSolicitadas:  modalidadesSolicitadas
    });
  } catch (error) {
    Logger.log('Erro requestAccount: ' + error.message);
    return errorResponse('Erro ao processar cadastro');
  }
}


// ============================================================
// ===== LOGIN — v4.5 (retorna modalidadesGrad) =====
// ============================================================

function handleLogin(data) {
  if (!data.email || !data.password) {
    return jsonResponse(false, 'Email e senha obrigatórios');
  }
  var email    = data.email.toString().trim().toLowerCase();
  var password = data.password;

  if (isRateLimited('login_' + email, MAX_LOGIN_ATTEMPTS, LOGIN_LOCKOUT_SECONDS)) {
    return jsonResponse(false, 'Muitas tentativas de login. Aguarde ' + Math.ceil(LOGIN_LOCKOUT_SECONDS / 60) + ' minutos.');
  }

  // ── Login via aba SuperAdmins (conta protegida, não em Alunos) ──
  try {
    var saCredentials = _getSuperAdminCredentials(email);
    if (saCredentials) {
      if (!verifyPassword(password, saCredentials.hash)) {
        return jsonResponse(false, 'Email ou senha incorretos');
      }
      resetRateLimit('login_' + email);
      var sessionToken = generateSessionToken(email);
      Logger.log('[Login SuperAdmin] ' + email);
      return ContentService.createTextOutput(JSON.stringify({
        success:             true,
        authenticated:       true,
        ctmId:               _currentCtmId || '',
        token:               sessionToken,
        email:               email,
        name:                saCredentials.nome,
        faixa:               'SuperAdmin',
        grau:                0,
        ct:                  '',
        treinos:             0,
        admin:               true,
        role:                'admin',
        isProfessor:         false,
        modalidades:         '',
        modalidadePrincipal: '',
        modalidadesGrad:     {},
        trial: { bloqueado: false, modoTrial: false, diasRestantes: null, suporteWhatsApp: SUPORTE_WHATSAPP }
      })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch(eSA) { Logger.log('[Login SuperAdmin] erro: ' + eSA.message); }

  try {
    var alunosSheet = getSheet('Alunos');
    var rows = alunosSheet.getDataRange().getValues();
    if (rows.length < 2) return jsonResponse(false, 'Nenhum usuário cadastrado');

    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0] || rows[i][0].toString().trim().toLowerCase() !== email) continue;

      var storedHash = rows[i][5] ? rows[i][5].toString() : '';
      if (!verifyPassword(password, storedHash)) {
        return jsonResponse(false, 'Email ou senha incorretos');
      }

      var acctStatus = rows[i][25] ? rows[i][25].toString().toUpperCase() : ''; // Z
      if (acctStatus === 'DESATIVADO') {
        return jsonResponse(false, 'Conta desabilitada. Entre em contato com o professor.');
      }

      // ── Se sem ctmId, busca o cliente correto em todos os sheets ──
      if (!_currentCtmId || _currentSheetId === SHEET_ID) {
        var _found = _findClientByEmail(email);
        if (_found) { _currentCtmId = _found.ctmId; _currentSheetId = _found.sheetId; }
      }

      resetRateLimit('login_' + email);
      if (storedHash.indexOf('hmac:') !== 0) {
        var newHash = hashPassword(password);
        alunosSheet.getRange(i + 1, 6).setValue(newHash);
        Logger.log('Hash migrado: ' + email);
      }

      // Contagem de treinos — filtrada por modalidade (retorna map + total da principal)
      var presencaSheet = getSheet('Presenca');
      var presencaData = presencaSheet.getDataRange().getValues();
      var treinos = 0;
      var ultimoCheckin = null;
      var treinosPorModalidade = {}; // { modId: count }
      var ultimoCheckinPorModalidade = {}; // { modId: ISOString }
      var _loginModPrincipal = rows[i][32] ? rows[i][32].toString().trim().toLowerCase() : '';
      for (var j = 1; j < presencaData.length; j++) {
        if (presencaData[j][0] && presencaData[j][0].toString().trim().toLowerCase() === email) {
          var status = getPresencaStatus(presencaData[j]);
          if (status === 'APROVADO') {
            var _jMod = presencaData[j][10] ? presencaData[j][10].toString().trim().toLowerCase() : '';
            var _countKey = _jMod || '_legacy';
            treinosPorModalidade[_countKey] = (treinosPorModalidade[_countKey] || 0) + 1;
            var dt = presencaData[j][6];
            if (dt) {
              var d = (dt instanceof Date) ? dt : new Date(dt);
              if (!isNaN(d.getTime())) {
                if (!ultimoCheckin || d > ultimoCheckin) ultimoCheckin = d;
                // Rastreia último check-in por modalidade
                if (_jMod) {
                  var _dIso = d.toISOString();
                  if (!ultimoCheckinPorModalidade[_jMod] || d > new Date(ultimoCheckinPorModalidade[_jMod])) {
                    ultimoCheckinPorModalidade[_jMod] = _dIso;
                  }
                }
              }
            }
          }
        }
      }
      // treinos = conta da modalidade principal (+ legado sem modalidade)
      if (_loginModPrincipal) {
        treinos = (treinosPorModalidade[_loginModPrincipal] || 0) +
                  (treinosPorModalidade['_legacy'] || 0);
      } else {
        // sem modalidade principal: soma tudo
        Object.keys(treinosPorModalidade).forEach(function(k){ treinos += treinosPorModalidade[k]; });
      }

      var isAdminUser = rows[i][6] === true || rows[i][6] === 'TRUE';
      if (!isAdminUser && ultimoCheckin) {
        var daysSinceLast = Math.floor((new Date() - ultimoCheckin) / (1000*60*60*24));
        if (daysSinceLast >= 30) {
          alunosSheet.getRange(i + 1, 26).setValue('DESATIVADO');
          return jsonResponse(false, 'Sua conta foi desativada por inatividade (' + daysSinceLast + ' dias sem treinar). Entre em contato com o professor para reativar.');
        }
      }

      var sessionToken = generateSessionToken(email);

      // ── Lê colunas de perfil ──
      var tipoPerfil          = rows[i][26] ? rows[i][26].toString().trim().toLowerCase() : ''; // AA
      var ctsProfessor        = rows[i][27] ? rows[i][27].toString().trim() : '';               // AB
      var ctsliberados        = rows[i][28] ? rows[i][28].toString().trim() : '';               // AC
      var professorPermsRaw   = rows[i][29] ? rows[i][29].toString().trim() : '';               // AD — v5.1
      var modalidades         = rows[i][31] ? rows[i][31].toString().trim() : '';               // AF
      var modalidadePrincipal = rows[i][32] ? rows[i][32].toString().trim() : '';               // AG

      // Professor: carrega permissões dinâmicas habilitadas pelo admin
      var professorPermissions = null;
      if (tipoPerfil === 'professor') {
        if (professorPermsRaw) {
          try { professorPermissions = JSON.parse(professorPermsRaw); } catch(e) {}
        }
        if (!professorPermissions) {
          // Sem config salva → aplica defaults
          professorPermissions = [];
          Object.keys(PROFESSOR_DYNAMIC_PERMS).forEach(function(k) {
            if (PROFESSOR_DYNAMIC_PERMS[k].default) professorPermissions.push(k);
          });
        }
      }

      // ── modalidadesGrad (col AH = índice 33) ──
      var modalidadesGrad = _parseModalidadesGrad(rows[i][33]);

      // Fallback de migração: se grad vazio mas temos faixa/grau global, popula em memória
      if (Object.keys(modalidadesGrad).length === 0) {
        var faixaGlobal = rows[i][2] ? rows[i][2].toString() : 'Branca';
        var grauGlobal  = rows[i][3] !== undefined ? parseInt(rows[i][3]) || 0 : 0;
        var firstMod    = (modalidadePrincipal || (modalidades ? modalidades.split(',')[0].trim() : '') || 'bjj_adulto');
        modalidadesGrad[firstMod] = { faixa: faixaGlobal, grau: grauGlobal };
      }

      // Trial check
      var trialBloqueado = false, trialMotivo = '', trialModoTrial = false, trialDiasRestantes = null;
      try {
        var tBloqueado  = _getTrialProp('BLOQUEADO') === 'true';
        var tDataExpStr = _getTrialProp('DATA_EXP');
        trialMotivo     = _getTrialProp('MOTIVO') || '';
        var tExpirado   = false;
        if (tDataExpStr) {
          var tExp  = new Date(tDataExpStr);
          var tDiff = Math.ceil((tExp - new Date()) / (1000 * 60 * 60 * 24));
          trialDiasRestantes = tDiff;
          tExpirado = tDiff <= 0;
          trialModoTrial = true;
        }
        trialBloqueado = tBloqueado || tExpirado;
      } catch(te) {}

      var respEmail = rows[i][22] ? rows[i][22].toString().trim().toLowerCase() : ''; // W

      Logger.log('Login OK: ' + email);

      return ContentService.createTextOutput(JSON.stringify({
        success:             true,
        ctmId:               _currentCtmId || '',
        authenticated:       true,
        token:               sessionToken,
        email:               rows[i][0],
        name:                rows[i][1],
        faixa: (function() {
          var _mg = modalidadesGrad || {}, _mp = modalidadePrincipal || '';
          var _gp = _mg[_mp];
          if (_gp && (_gp.nivel || _gp.faixa)) return (_gp.nivel || _gp.faixa);
          return rows[i][2] || 'Branca';
        })(),
        grau:                rows[i][3],
        ct:                  rows[i][4],
        treinos:             treinos,
        treinosPorModalidade: treinosPorModalidade,
        ultimoCheckinPorModalidade: ultimoCheckinPorModalidade,
        ultimoCheckin:       ultimoCheckin ? ultimoCheckin.toISOString() : null,
        admin:               rows[i][6] === true || rows[i][6] === 'TRUE',
        dataCriacao:         rows[i][7],
        nascimento:          rows[i][8] ? (rows[i][8] instanceof Date ? Utilities.formatDate(rows[i][8], Session.getScriptTimeZone(), 'yyyy-MM-dd') : rows[i][8].toString()) : '',
        isKids:              respEmail !== '',
        isProfessor:         tipoPerfil === 'professor',
        role:                (function(){
          // Admin tem prioridade — mesmo que tipoPerfil seja professor
          if (rows[i][6] === true || rows[i][6] === 'TRUE') return 'admin';
          if (tipoPerfil === 'professor') return 'professor';
          return 'aluno';
        })(),
        ctsProfessor:        ctsProfessor,
        ctsliberados:        ctsliberados,
        professorPermissions: professorPermissions,  // ← v5.1
        modalidades:         modalidades,
        modalidadePrincipal: modalidadePrincipal,
        modalidadesGrad:     modalidadesGrad,   // ← v4.5
        trial: {
          bloqueado:       trialBloqueado,
          motivo:          trialMotivo,
          modoTrial:       trialModoTrial,
          diasRestantes:   trialDiasRestantes,
          suporteWhatsApp: SUPORTE_WHATSAPP
        }
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return jsonResponse(false, 'Email ou senha incorretos');
  } catch (error) {
    Logger.log('Erro login: ' + error.message);
    return errorResponse('Erro ao processar login');
  }
}


// ============================================================
// ===== GET CTs LIST (PÚBLICO) =====
// ============================================================

function handleGetCTsList() {
  try {
    var ctsSheet = getSheet('CTs');
    var rows = ctsSheet.getDataRange().getValues();
    var cts = [];
    var DAY_NAMES = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] && (rows[i][1] === true || rows[i][1] === 'TRUE')) {
        var schedule = {};
        for (var d = 0; d < DAY_NAMES.length; d++) {
          schedule[DAY_NAMES[d]] = (rows[i][d + 2] === true || rows[i][d + 2] === 'TRUE');
        }
        cts.push({
          name:           rows[i][0].toString(),
          schedule:       schedule,
          endereco:       rows[i][9]  ? rows[i][9].toString()  : '',
          horarios:       getHorariosHoje(rows[i][10]),
          horariosPorDia: parseHorariosPorDia(rows[i][10]),
          valorAvulso:    rows[i][11] ? rows[i][11].toString() : '',
          planos:         rows[i][12] ? rows[i][12].toString() : '',
          beneficios:     rows[i][13] ? rows[i][13].toString() : '',
          mapLink:        rows[i][14] ? rows[i][14].toString() : '',
          instagram:      rows[i][15] ? rows[i][15].toString() : '',
          telefone:       rows[i][16] ? rows[i][16].toString() : '',
          plano:          rows[i][17] ? rows[i][17].toString().trim().toLowerCase() : 'basico',
          statusLicenca:  rows[i][18] ? rows[i][18].toString().trim().toLowerCase() : 'ativo',
          dataExpiracao:  rows[i][19] ? (rows[i][19] instanceof Date ? Utilities.formatDate(rows[i][19], Session.getScriptTimeZone(), 'yyyy-MM-dd') : rows[i][19].toString()) : ''
        });
      }
    }
    Logger.log('[getCTsList] ctm=' + (_currentCtmId||'default') + ' | ' + cts.length + ' CTs');
    return ContentService.createTextOutput(JSON.stringify({ success: true, cts: cts }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Erro getCTs: ' + error.message);
    return errorResponse('Erro ao listar CTs');
  }
}

function _getCTsFromSheet(sheetId, ctmId) {
  var ss  = SpreadsheetApp.openById(sheetId);
  var sh  = ss.getSheetByName('CTs');
  var cts = [];
  if (!sh) return ContentService.createTextOutput(JSON.stringify({ success: true, cts: [] })).setMimeType(ContentService.MimeType.JSON);
  var rows = sh.getDataRange().getValues();
  var DAY_NAMES = ['seg','ter','qua','qui','sex','sab','dom'];
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0] || !(rows[i][1] === true || rows[i][1] === 'TRUE')) continue;
    var schedule = {};
    for (var d = 0; d < DAY_NAMES.length; d++) {
      schedule[DAY_NAMES[d]] = (rows[i][d + 2] === true || rows[i][d + 2] === 'TRUE');
    }
    cts.push({
      name:           rows[i][0].toString(),
      _ctmId:         ctmId,
      schedule:       schedule,
      endereco:       rows[i][9]  ? rows[i][9].toString()  : '',
      horarios:       getHorariosHoje(rows[i][10]),
      horariosPorDia: parseHorariosPorDia(rows[i][10]),
      valorAvulso:    rows[i][11] ? rows[i][11].toString() : '',
      planos:         rows[i][12] ? rows[i][12].toString() : '',
      beneficios:     rows[i][13] ? rows[i][13].toString() : '',
      mapLink:        rows[i][14] ? rows[i][14].toString() : '',
      instagram:      rows[i][15] ? rows[i][15].toString() : '',
      telefone:       rows[i][16] ? rows[i][16].toString() : '',
      plano:          rows[i][17] ? rows[i][17].toString().trim().toLowerCase() : 'basico',
      statusLicenca:  rows[i][18] ? rows[i][18].toString().trim().toLowerCase() : 'ativo',
      dataExpiracao:  rows[i][19] ? (rows[i][19] instanceof Date ? Utilities.formatDate(rows[i][19], Session.getScriptTimeZone(), 'yyyy-MM-dd') : rows[i][19].toString()) : ''
    });
  }
  return ContentService.createTextOutput(JSON.stringify({ success: true, cts: cts })).setMimeType(ContentService.MimeType.JSON);
}


// ============================================================
// ===== ADMIN: LIST STUDENTS — v4.5 (inclui modalidadesGrad) =====
// ============================================================

function handleGetStudentsList(data) {
  var authEmail = requireProfessorOrAdmin(data);
  if (!authEmail) return forbiddenResponse();
  try {
    var alunosSheet = getSheet('Alunos');
    var rows = alunosSheet.getDataRange().getValues();
    var students = [];
    var profCTs = [];
    if (!isEmailAdmin(authEmail) && isEmailProfessor(authEmail)) { profCTs = getProfessorCTs(authEmail); }

    var presencaSheet = getSheet('Presenca');
    var pRows = presencaSheet.getDataRange().getValues();
    var treinosPorAluno = {}, ultimoCheckinPorAluno = {}, treinosModPorAluno = {};
    for (var p = 1; p < pRows.length; p++) {
      if (!pRows[p][0] || getPresencaStatus(pRows[p]) !== 'APROVADO') continue;
      var pEmail = pRows[p][0].toString().trim().toLowerCase();
      var pMod = pRows[p][10] ? pRows[p][10].toString().trim().toLowerCase() : '_legacy';
      treinosPorAluno[pEmail] = (treinosPorAluno[pEmail] || 0) + 1;
      if (!treinosModPorAluno[pEmail]) treinosModPorAluno[pEmail] = {};
      treinosModPorAluno[pEmail][pMod] = (treinosModPorAluno[pEmail][pMod] || 0) + 1;
      var dateVal = pRows[p][6];
      var dt = null;
      if (dateVal instanceof Date) dt = dateVal;
      else if (dateVal) { var parsed = new Date(dateVal); if (!isNaN(parsed.getTime())) dt = parsed; }
      if (dt && (!ultimoCheckinPorAluno[pEmail] || dt > ultimoCheckinPorAluno[pEmail])) { ultimoCheckinPorAluno[pEmail] = dt; }
    }

    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0] || !rows[i][0].toString().trim()) continue;
      var email = rows[i][0].toString().trim().toLowerCase();
      if (isEmailSuperAdmin(email)) continue; // SuperAdmin não aparece no painel
      var studentCT = rows[i][4] ? rows[i][4].toString().trim() : '';
      if (profCTs.length > 0 && profCTs.indexOf(studentCT) === -1) continue;

      var acctStatus          = rows[i][25] ? rows[i][25].toString().toUpperCase().trim() : ''; // Z
      var tipoPerfil          = rows[i][26] ? rows[i][26].toString().trim() : '';               // AA
      var ctsProfessor        = rows[i][27] ? rows[i][27].toString().trim() : '';               // AB
      var ctsliberados        = rows[i][28] ? rows[i][28].toString().trim() : '';               // AC
      var modalidades         = rows[i][31] ? rows[i][31].toString().trim() : '';               // AF
      var modalidadePrincipal = rows[i][32] ? rows[i][32].toString().trim() : '';               // AG
      var modalidadesGrad     = _parseModalidadesGrad(rows[i][33]);                             // AH

      // Fallback de migração em memória
      if (Object.keys(modalidadesGrad).length === 0 && modalidades) {
        var firstMod = (modalidadePrincipal || modalidades.split(',')[0] || 'bjj_adulto').trim();
        modalidadesGrad[firstMod] = {
          faixa: rows[i][2] ? rows[i][2].toString() : 'Branca',
          grau:  parseInt(rows[i][3]) || 0
        };
      }

      var lastCheckin = ultimoCheckinPorAluno[email];
      students.push({
        email:               rows[i][0],
        name:                rows[i][1] ? rows[i][1].toString() : '',
        faixa: (function() {
          var _mg = modalidadesGrad || {}, _mp = modalidadePrincipal || '';
          var _gp = _mg[_mp];
          if (_gp && (_gp.nivel || _gp.faixa)) return (_gp.nivel || _gp.faixa);
          return rows[i][2] ? rows[i][2].toString() : 'Branca'; // fallback legado
        })(),
        grau:                rows[i][3] ? rows[i][3].toString() : '',
        ct:                  studentCT,
        admin:               rows[i][6],
        dataCriacao:         rows[i][7] ? rows[i][7].toString() : '',
        treinos:             treinosPorAluno[email] || 0,
        treinosPorModalidade: treinosModPorAluno[email] || {},
        status:              acctStatus,
        ultimoCheckin:       lastCheckin ? lastCheckin.toISOString() : '',
        nascimento:          rows[i][8] ? (rows[i][8] instanceof Date ? rows[i][8].toISOString() : rows[i][8].toString()) : '',
        telefone:            rows[i][12] ? rows[i][12].toString() : '',
        tipoPerfil:          tipoPerfil,
        ctsProfessor:        ctsProfessor,
        ctsliberados:        ctsliberados,
        modalidades:         modalidades,
        modalidadePrincipal: modalidadePrincipal,
        modalidadesGrad:     modalidadesGrad      // ← v4.5
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true, students: students })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Erro listar: ' + error.message);
    return errorResponse('Erro ao listar alunos');
  }
}


// ============================================================
// ===== ADMIN: UPDATE STUDENT — v4.5 (salva modalidadesGrad) =====
// ============================================================

function handleAdminUpdateStudent(data) {
  var adminEmail = requireProfessorOrAdmin(data);
  if (!adminEmail) return forbiddenResponse();
  if (!data.email) return jsonResponse(false, 'Email do aluno obrigatório');

  try {
    var email = data.email.toString().trim().toLowerCase();
    var alunosSheet = getSheet('Alunos');
    var rows = alunosSheet.getDataRange().getValues();

    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0]) continue;
      if (rows[i][0].toString().trim().toLowerCase() !== email) continue;

      // Campos básicos
      if (data.name  !== undefined) alunosSheet.getRange(i + 1, 2).setValue(cleanField(data.name, MAX_NAME_LENGTH));
      if (data.ct    !== undefined) alunosSheet.getRange(i + 1, 5).setValue(cleanField(data.ct, 100));

      // Campos de perfil
      var profileMap = {
        nascimento: 9, genero: 10, profissao: 11, bairro: 12,
        telefone: 13, instagram: 14, emergencia: 15, origem: 16,
        objetivo: 17, horario: 18, experiencia: 19, saude: 20, diasTreino: 22
      };
      var pKeys = Object.keys(profileMap);
      for (var k = 0; k < pKeys.length; k++) {
        var key = pKeys[k];
        if (data[key] !== undefined) {
          alunosSheet.getRange(i + 1, profileMap[key]).setValue(cleanField(data[key], MAX_FIELD_LENGTH));
        }
      }

      // ── modalidadesGrad (col AH = 34, 1-indexed) — v4.5 ──
      if (data.modalidadesGrad !== undefined) {
        var gradInput = data.modalidadesGrad;
        var gradObj   = {};

        if (typeof gradInput === 'string') {
          try { gradObj = JSON.parse(gradInput); } catch(e) { gradObj = {}; }
        } else if (typeof gradInput === 'object' && gradInput !== null) {
          gradObj = gradInput;
        }

        // Sanitiza cada entrada; suporte ao Kruang Prajied (Muay Thai) e Cordões (Capoeira)
        var gradSanitized = {};
        Object.keys(gradObj).forEach(function(modId) {
          var g = gradObj[modId];
          if (g && typeof g === 'object') {
            if (modId === 'muay_thai') {
              // Kruang Prajied: salva estrutura completa
              var grauNum  = parseInt(g.grau) || 1;
              var corLabel = cleanField(g.cor || g.faixa || 'Branco', 50);
              gradSanitized[modId] = {
                nivel:      cleanField(g.nivel || String(grauNum), 10),
                faixa:      corLabel,
                grau:       grauNum,
                cor:        corLabel,
                nivelLabel: cleanField(g.nivelLabel || '', 30)
              };
            } else if (modId === 'capoeira') {
              // Sistema de Cordões: salva estrutura completa
              var cordaoNome = cleanField(g.cordao || g.faixa || 'Sem cordão', 80);
              var grauOrdem  = parseInt(g.grau) || 1;
              gradSanitized[modId] = {
                nivel:      cleanField(g.nivel || 'sem-cordao', 40),
                faixa:      cordaoNome,
                cordao:     cordaoNome,
                grau:       grauOrdem,
                nivelLabel: cleanField(g.nivelLabel || '', 40)
              };
            } else {
              gradSanitized[modId] = {
                nivel: cleanField(g.nivel || g.faixa || 'Branca', 30),
                faixa: cleanField(g.faixa || g.nivel || 'Branca', 30),
                grau:  parseInt(g.grau) || 0
              };
            }
          }
        });

        alunosSheet.getRange(i + 1, 34).setValue(JSON.stringify(gradSanitized)); // AH

        // Sincroniza cols C(3) e D(4) com a modalidade principal
        var principal = '';
        if (data.modalidadePrincipal) {
          principal = data.modalidadePrincipal.toString().trim();
        } else if (rows[i][32]) {
          principal = rows[i][32].toString().trim(); // AG
        }
        if (principal && gradSanitized[principal]) {
          var _gs = gradSanitized[principal];
          var _colC;
          if (principal === 'muay_thai' && _gs.grau) {
            _colC = 'Grau ' + _gs.grau + ' — ' + (_gs.cor || _gs.faixa || '');
          } else if (principal === 'capoeira' && _gs.cordao) {
            _colC = _gs.cordao + ' (' + (_gs.nivelLabel || '') + ')';
          } else {
            _colC = _gs.nivel || _gs.faixa || 'Branca';
          }
          alunosSheet.getRange(i + 1, 3).setValue(_colC);
          alunosSheet.getRange(i + 1, 4).setValue(_gs.grau || 0);
        } else if (data.faixa !== undefined && data.faixa !== null && data.faixa !== '') {
          // Fallback legado: usa faixa enviada diretamente (retrocompatibilidade)
          alunosSheet.getRange(i + 1, 3).setValue(data.faixa);
          if (data.grau !== undefined) {
            var g = parseInt(data.grau);
            if (!isNaN(g) && g >= 0 && g <= 6) alunosSheet.getRange(i + 1, 4).setValue(g);
          }
        }

        Logger.log('modalidadesGrad salvo para ' + email + ': ' + JSON.stringify(gradSanitized));

      } else {
        // Sem modalidadesGrad → só atualiza faixa se enviada explicitamente (campo legado)
        if (data.faixa !== undefined && data.faixa !== null && data.faixa !== '') alunosSheet.getRange(i + 1, 3).setValue(cleanField(data.faixa, 30));
        if (data.grau  !== undefined) {
          var g2 = parseInt(data.grau);
          if (!isNaN(g2) && g2 >= 0 && g2 <= 6) alunosSheet.getRange(i + 1, 4).setValue(g2);
        }
      }

      // ── Modalidades: professor OU admin podem atribuir ──────────────────
      // FIX: modalidades e modalidadePrincipal saíram do bloco admin-exclusivo.
      // _authRole nunca foi definido no código — era um gate morto que bloqueava
      // a gravação das colunas AF e AG para qualquer usuário, inclusive admins reais.
      var _modalidadesAlteradas = false;
      if (data.modalidades !== undefined) {
        alunosSheet.getRange(i + 1, 32).setValue(cleanField(data.modalidades, 500)); // AF
        _modalidadesAlteradas = true;
      }
      if (data.modalidadePrincipal !== undefined) {
        alunosSheet.getRange(i + 1, 33).setValue(cleanField(data.modalidadePrincipal, 100)); // AG
      }

      // Auto-atribuir plano se modalidades foram alteradas e mapeamento está configurado
      if (_modalidadesAlteradas) {
        try {
          var planoAuto = autoAtribuirPlano(email);
          if (planoAuto) Logger.log('Plano auto-atribuído ao atualizar mods ' + email + ': ' + planoAuto);
        } catch(ePa) { Logger.log('autoAtribuirPlano no update: ' + ePa.message); }
      }

      // ── Campos exclusivos de admin real ──────────────────────────────────
      // Só admin real (col G = true) pode promover/rebaixar papéis e liberar CTs.
      var _isRealAdmin = isEmailAdmin(adminEmail);
      if (_isRealAdmin) {
        if (data.admin !== undefined) {
          alunosSheet.getRange(i + 1, 7).setValue(data.admin === true || data.admin === 'true' ? true : false);
        }
        if (data.isProfessor !== undefined) {
          var isProf = data.isProfessor === true || data.isProfessor === 'true';
          alunosSheet.getRange(i + 1, 27).setValue(isProf ? 'professor' : ''); // AA
          if (data.ctsProfessor !== undefined) {
            alunosSheet.getRange(i + 1, 28).setValue(isProf ? cleanField(data.ctsProfessor, 500) : ''); // AB
          }
        }
        if (data.ctsliberados !== undefined) {
          alunosSheet.getRange(i + 1, 29).setValue(cleanField(data.ctsliberados, 500)); // AC
        }
      }

      Logger.log('Admin ' + adminEmail + ' atualizou: ' + email);
      return jsonResponse(true, 'Aluno atualizado com sucesso!', {
        admin:      data.admin !== undefined ? (data.admin === true || data.admin === 'true') : isEmailAdmin(email),
        tipoPerfil: data.isProfessor !== undefined ? (data.isProfessor === true || data.isProfessor === 'true' ? 'professor' : '') : '',
        isProfessor: data.isProfessor === true || data.isProfessor === 'true'
      });
    }

    return jsonResponse(false, 'Aluno não encontrado');
  } catch (error) {
    Logger.log('Erro adminUpdateStudent: ' + error.message);
    return errorResponse('Erro ao atualizar aluno');
  }
}


// ============================================================
// ===== ADMIN: PENDING ACCOUNTS — v4.5 =====
// ============================================================

function handleGetPendingAccounts(data) {
  var adminEmail = requireProfessorOrAdmin(data);
  if (!adminEmail) return forbiddenResponse();
  try {
    var pendingSheet = getSheet('PendingAccounts');
    var rows = pendingSheet.getDataRange().getValues();
    var accounts = [];
    for (var i = 1; i < rows.length; i++) {
      var status  = rows[i][7] ? rows[i][7].toString().toUpperCase().trim() : '';
      var col6Val = rows[i][6] ? rows[i][6].toString().trim().toUpperCase() : '';
      if (status === 'PENDENTE' || (status === '' && col6Val === 'PENDENTE')) {
        accounts.push({
          email:                  rows[i][0]  ? rows[i][0].toString()  : '',
          name:                   rows[i][1]  ? rows[i][1].toString()  : '',
          faixa:                  rows[i][2]  ? rows[i][2].toString()  : 'Branca',
          grau:                   rows[i][3]  !== undefined ? rows[i][3].toString() : '0',
          ct:                     rows[i][4]  ? rows[i][4].toString()  : '',
          data:                   rows[i][8]  ? rows[i][8].toString()  : '',
          nascimento:             rows[i][9]  ? rows[i][9].toString()  : '',
          telefone:               rows[i][10] ? rows[i][10].toString() : '',
          // Coluna P (índice 15) — modalidades solicitadas pelo aluno
          modalidadesSolicitadas: rows[i][15] ? rows[i][15].toString() : ''
        });
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true, accounts: accounts })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Erro getPendingAccounts: ' + error.message);
    return errorResponse('Erro ao listar contas pendentes');
  }
}

// ============================================================
// ===== APPROVE ACCOUNT — v4.5 (CT escolhido pelo admin + modalidadesGrad) =====
// ============================================================

function handleApproveAccount(data) {
  var adminEmail = requireProfessorOrAdmin(data);
  if (!adminEmail) return forbiddenResponse();
  if (!data.email) return jsonResponse(false, 'Email obrigatório');

  var email       = data.email.toString().trim().toLowerCase();
  // CT escolhido pelo admin no card de aprovação
  var ctEscolhido = data.ct ? cleanField(data.ct.toString().trim(), 100) : '';
  if (!ctEscolhido) return jsonResponse(false, 'Selecione o CT antes de aprovar');

  try {
    var pendingSheet = getSheet('PendingAccounts');
    var pendingData  = pendingSheet.getDataRange().getValues();

    var found = false, foundRow = -1;
    var accName, accFaixa, accGrau, accHash;
    var accNascimento, accTelefone, accResponsavel, accSaudeKids, accObs, accTipo;
    var accModalidadesSolicitadas = '';

    for (var i = 1; i < pendingData.length; i++) {
      var rowEmail = pendingData[i][0] ? pendingData[i][0].toString().trim().toLowerCase() : '';
      if (rowEmail !== email) continue;
      var rawStatus = pendingData[i][7] ? pendingData[i][7].toString().trim().toUpperCase() : '';
      var col6Val   = pendingData[i][6] ? pendingData[i][6].toString().trim().toUpperCase() : '';
      if (rawStatus === 'PENDENTE' || (rawStatus === '' && col6Val === 'PENDENTE')) {
        accName       = pendingData[i][1];
        accFaixa      = pendingData[i][2] || 'Branca';
        accGrau       = pendingData[i][3] !== undefined ? pendingData[i][3] : '0';
        accHash       = pendingData[i][5] || '';
        accNascimento = pendingData[i][9]  || '';
        accTelefone   = pendingData[i][10] || '';
        accResponsavel= pendingData[i][11] || '';
        accSaudeKids  = pendingData[i][12] || '';
        accObs        = pendingData[i][13] || '';
        accTipo       = pendingData[i][14] || '';
        accModalidadesSolicitadas = pendingData[i][15] ? pendingData[i][15].toString() : '';
        foundRow = i;
        found    = true;
        break;
      }
    }

    if (!found) {
      var emailFound = false; var lastStatus = '';
      for (var d = 1; d < pendingData.length; d++) {
        var dEmail = pendingData[d][0] ? pendingData[d][0].toString().trim().toLowerCase() : '';
        if (dEmail === email) { emailFound = true; lastStatus = pendingData[d][7] ? pendingData[d][7].toString() : '(vazio)'; }
      }
      return emailFound
        ? jsonResponse(false, 'Conta já processada (status: ' + lastStatus + ')')
        : jsonResponse(false, 'Conta pendente não encontrada para: ' + email);
    }

    // Professor: restringido a seus CTs
    var _updateRole = getRole(adminEmail);
    if (_updateRole === 'professor') {
      var profCTs = getProfessorCTs(adminEmail);
      if (profCTs.length > 0 && ctEscolhido && profCTs.indexOf(ctEscolhido) === -1) {
        return jsonResponse(false, 'Sem permissão para aprovar aluno do CT: ' + ctEscolhido);
      }
    }

    var alunosSheet = getSheet('Alunos');
    var alunosData  = alunosSheet.getDataRange().getValues();
    for (var j = 1; j < alunosData.length; j++) {
      if (alunosData[j][0] && alunosData[j][0].toString().trim().toLowerCase() === email) {
        return jsonResponse(false, 'Este email já existe na lista de alunos');
      }
    }

    // CT = escolhido pelo admin, faixa = Branca, grau = 0
    if (!_currentCtmId) {
      Logger.log('⚠️ [approveAccount] ATENÇÃO: ctmId não resolvido — aluno será gravado na planilha padrão! Publique o index_url.html para corrigir.');
    }
    alunosSheet.appendRow([email, accName, accFaixa, accGrau, ctEscolhido, accHash, false, new Date()]);
    var lastRow = alunosSheet.getLastRow();

    if (accNascimento)  alunosSheet.getRange(lastRow, 9).setValue(accNascimento);
    if (accTelefone)    alunosSheet.getRange(lastRow, 13).setValue(accTelefone);
    if (accResponsavel) alunosSheet.getRange(lastRow, 23).setValue(accResponsavel);
    if (accSaudeKids)   alunosSheet.getRange(lastRow, 24).setValue(accSaudeKids);
    if (accObs)         alunosSheet.getRange(lastRow, 20).setValue(accObs);
    if (accTipo === 'kids') alunosSheet.getRange(lastRow, 25).setValue('kids');

    // Dias de treino do CT
    if (ctEscolhido) {
      try {
        var ctsSheet = getSheet('CTs');
        var ctsRows  = ctsSheet.getDataRange().getValues();
        var DAY_KEYS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
        for (var ct = 1; ct < ctsRows.length; ct++) {
          if (ctsRows[ct][0] && ctsRows[ct][0].toString().trim() === ctEscolhido) {
            var dias = [];
            for (var dk = 0; dk < DAY_KEYS.length; dk++) {
              var colVal = ctsRows[ct][dk + 2];
              if (colVal === true || colVal === 'TRUE') { dias.push(DAY_KEYS[dk]); }
            }
            if (dias.length > 0) { alunosSheet.getRange(lastRow, 22).setValue(dias.join(',')); }
            break;
          }
        }
      } catch(ctErr) { Logger.log('Erro diasTreino: ' + ctErr.message); }
    }

    // ── Modalidades solicitadas → cols AF (32) e AG (33) ──
    if (accModalidadesSolicitadas) {
      alunosSheet.getRange(lastRow, 32).setValue(accModalidadesSolicitadas); // AF

      var modsArr = accModalidadesSolicitadas.split(',').map(function(m){ return m.trim(); }).filter(Boolean);

      // Define primeira modalidade como principal (col AG = 33)
      if (modsArr.length > 0) {
        alunosSheet.getRange(lastRow, 33).setValue(modsArr[0]); // AG
      }

      // ── Pré-popula modalidadesGrad com graduação inicial correta para cada modalidade (col AH = 34) ── v4.9
      var gradInicial = {};
      modsArr.forEach(function(modId) {
        gradInicial[modId] = _gradInicialParaMod(modId); // v4.9 — correto por tipo de modalidade
      });
      alunosSheet.getRange(lastRow, 34).setValue(JSON.stringify(gradInicial)); // AH
      Logger.log('modalidadesGrad inicial para ' + email + ': ' + JSON.stringify(gradInicial));
    }

    _archivePendingRow(pendingSheet, foundRow, 'APROVADO', adminEmail);

    // Atribui plano automaticamente com base nas modalidades (se mapeamento configurado)
    try {
      var planoAtribuido = autoAtribuirPlano(email);
      if (planoAtribuido) Logger.log('Plano auto-atribuído ao aprovar ' + email + ': ' + planoAtribuido);
    } catch(ePlano) { Logger.log('autoAtribuirPlano erro: ' + ePlano.message); }

    Logger.log('Admin ' + adminEmail + ' aprovou: ' + email + ' → CT: ' + ctEscolhido + ' | mods: ' + accModalidadesSolicitadas);
    return jsonResponse(true, 'Conta aprovada! ' + accName + ' pode fazer login.');

  } catch (error) {
    Logger.log('Erro approveAccount: ' + error.message);
    return errorResponse('Erro ao aprovar conta');
  }
}

function handleRejectAccount(data) {
  var adminEmail = requireProfessorOrAdmin(data);
  if (!adminEmail) return forbiddenResponse();
  if (!data.email) return jsonResponse(false, 'Email obrigatório');
  var email = data.email.toString().trim().toLowerCase();
  try {
    var pendingSheet = getSheet('PendingAccounts');
    var pendingData = pendingSheet.getDataRange().getValues();
    for (var i = 1; i < pendingData.length; i++) {
      var rowEmail = pendingData[i][0] ? pendingData[i][0].toString().trim().toLowerCase() : '';
      if (rowEmail !== email) continue;
      var rawStatus = pendingData[i][7] ? pendingData[i][7].toString().trim().toUpperCase() : '';
      var col6Val = pendingData[i][6] ? pendingData[i][6].toString().trim().toUpperCase() : '';
      if (rawStatus === 'PENDENTE' || (rawStatus === '' && col6Val === 'PENDENTE')) {
        _archivePendingRow(pendingSheet, i, 'REJEITADO', adminEmail);
        Logger.log('Admin ' + adminEmail + ' rejeitou conta: ' + email);
        return jsonResponse(true, 'Conta de ' + email + ' rejeitada.');
      }
    }
    return jsonResponse(false, 'Conta pendente não encontrada');
  } catch (error) {
    Logger.log('Erro rejectAccount: ' + error.message);
    return errorResponse('Erro ao rejeitar conta');
  }
}




// ============================================================
// ===== ATTENDANCE - CHECK-IN (AUTENTICADO) =====
// ============================================================

function handleAttendance(data) {
  if (!data.email || !data.ct) {
    return jsonResponse(false, 'Email e CT obrigatórios');
  }
  var authEmail = requireAuth(data);
  if (!authEmail) return unauthorizedResponse();
  var requestedEmail = data.email.toString().trim().toLowerCase();
  if (authEmail !== requestedEmail) { return forbiddenResponse(); }

  var lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch (e) {
    return jsonResponse(false, 'Servidor ocupado, tente novamente em alguns segundos');
  }

  try {
    var presencaSheet = getSheet('Presenca');
    var alunosSheet   = getSheet('Alunos');
    var alunosData    = alunosSheet.getDataRange().getValues();
    var email         = authEmail;
    var studentName   = 'Aluno', studentFaixa = 'Branca', studentGrau = '0';
    var modalidadesGradAluno = {}, modPrincipalAluno = 'bjj_adulto';

    for (var i = 1; i < alunosData.length; i++) {
      if (alunosData[i][0] && alunosData[i][0].toString().toLowerCase() === email) {
        studentName          = alunosData[i][1];
        studentFaixa         = alunosData[i][2];
        studentGrau          = alunosData[i][3];
        modalidadesGradAluno = _parseModalidadesGrad(alunosData[i][33]);
        modPrincipalAluno    = alunosData[i][32] ? alunosData[i][32].toString().trim() : 'bjj_adulto';
        break;
      }
    }

    // FIX BUG 1 — v4.9: declarar ANTES de usar em checkDuplicateByWindow
    var modalidadeCheckin = data.modalidade ? data.modalidade.toString().trim().toLowerCase() : '';

    // FIX BUG 8 — v4.9: snapshot de graduação da modalidade do check-in
    var checkMod  = modalidadeCheckin || modPrincipalAluno || 'bjj_adulto';
    var gradSnap  = _getNivelAtual(modalidadesGradAluno, checkMod, studentFaixa);
    var snapFaixa = gradSnap.nivel;
    var snapGrau  = gradSnap.grau;

    var now = new Date();
    var hora = ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2);
    var ctInput = cleanField(data.ct, 100);
    var dayMap = [8, 2, 3, 4, 5, 6, 7];
    var diaPermitido = true;
    var diaSemanaIdx = dayMap[now.getDay()];
    var ctHorarios = '';
    var ctHorariosPorDia = null; // v4.9: para validação por modalidade

    try {
      var ctsSheet = getSheet('CTs');
      var ctsData = ctsSheet.getDataRange().getValues();
      for (var c = 1; c < ctsData.length; c++) {
        if (ctsData[c][0] && ctsData[c][0].toString().trim() === ctInput) {
          var temConfig = false;
          for (var dc = 2; dc <= 8; dc++) {
            if (ctsData[c][dc] === true || ctsData[c][dc] === 'TRUE') { temConfig = true; break; }
          }
          if (temConfig) {
            var valDia = ctsData[c][diaSemanaIdx];
            diaPermitido = (valDia === true || valDia === 'TRUE');
          }
          ctHorarios = getHorariosHoje(ctsData[c][10]);
          // v4.9: guarda horariosPorDia para validar modalidade
          var rawHpd = ctsData[c][10];
          if (rawHpd && rawHpd.toString().trim().charAt(0) === '{') {
            try { ctHorariosPorDia = JSON.parse(rawHpd.toString().trim()); } catch(e) {}
          }
          break;
        }
      }
    } catch (ctErr) { Logger.log('Aviso schedule CT: ' + ctErr.message); }

    // ── v4.9: valida horário cadastrado para a modalidade ──────────────
    if (modalidadeCheckin && ctHorariosPorDia) {
      var hpdKeys = Object.keys(ctHorariosPorDia);
      var DAY_MARKER = { dom:1, seg:1, ter:1, qua:1, qui:1, sex:1, sab:1, _global:1 };
      var isPerModBackend = hpdKeys.length > 0 && hpdKeys.every(function(k){ return !DAY_MARKER[k]; });
      if (isPerModBackend) {
        var modHpdB = ctHorariosPorDia[modalidadeCheckin];
        var temHorarioMod = modHpdB && typeof modHpdB === 'object' &&
          Object.keys(modHpdB).some(function(k){ return modHpdB[k] && modHpdB[k].toString().trim() !== ''; });
        if (!temHorarioMod) {
          lock.releaseLock();
          return jsonResponse(false, '🚫 Este CT não possui horário cadastrado para a modalidade selecionada. Fale com seu professor.');
        }
      }
    }
    // ──────────────────────────────────────────────────────────────────

    var presencaData = presencaSheet.getDataRange().getValues();

    // ── Horários específicos da modalidade para validação de janela ──────────────────
    // Se o CT tem horários por modalidade, usa só os da modalidade do check-in.
    // Isso garante que Muay Thai 20h e BJJ 21h tenham janelas independentes.
    var ctHorariosParaDupCheck = ctHorarios; // fallback: horário global
    if (modalidadeCheckin && ctHorariosPorDia) {
      var hpdAllKeys = Object.keys(ctHorariosPorDia);
      var DAY_MAP_DUP = ['dom','seg','ter','qua','qui','sex','sab'];
      var _DAY_SET_DUP = { dom:1, seg:1, ter:1, qua:1, qui:1, sex:1, sab:1, _global:1 };
      var isPerModFmt = hpdAllKeys.length > 0 && hpdAllKeys.every(function(k){ return !_DAY_SET_DUP[k]; });
      if (isPerModFmt) {
        var horarioMod = getHorariosPorModalidade(ctHorariosPorDia, modalidadeCheckin, new Date().getDay());
        if (horarioMod) ctHorariosParaDupCheck = horarioMod;
      }
    }
    // ─────────────────────────────────────────────────────────────────────────────────

    // FIX BUG 1 — modalidadeCheckin agora está corretamente declarado
    var dupCheck = checkDuplicateByWindow(presencaData, email, ctHorariosParaDupCheck, modalidadeCheckin);
    if (dupCheck.duplicado) {
      lock.releaseLock();
      return jsonResponse(true, '✅ Você já fez check-in hoje! Presença já registrada.', { name: studentName, ct: ctInput, timestamp: now, status: 'JA_REGISTRADO' });
    }

    var statusCheckin, motivo = '';
    if (!diaPermitido) { statusCheckin = 'PENDENTE'; motivo = 'dia_nao_permitido'; }
    else { statusCheckin = 'APROVADO'; }

    // FIX BUG 8 — usa snapshot do nível da modalidade correta
    presencaSheet.appendRow([
      email, studentName, snapFaixa, snapGrau,
      ctInput, data.horario || hora, now, hora,
      statusCheckin, '',
      modalidadeCheckin   // K = col 11
    ]);

    if (statusCheckin === 'APROVADO') {
      try {
        var allRows = presencaSheet.getDataRange().getValues();
        var rowsToDelete = [];
        var foundAprovadoToday = false;
        for (var d = allRows.length - 1; d >= 1; d--) {
          if (!allRows[d][0]) continue;
          var rEmail = allRows[d][0].toString().trim().toLowerCase();
          if (rEmail !== email) continue;
          if (!isToday(allRows[d][6])) continue;
          var rStatus = allRows[d][8] ? allRows[d][8].toString().toUpperCase().trim() : '';
          if (rStatus === 'PENDENTE') { rowsToDelete.push(d + 1); }
          else if (rStatus === 'APROVADO') {
            if (!foundAprovadoToday) { foundAprovadoToday = true; }
            else { rowsToDelete.push(d + 1); }
          }
        }
        rowsToDelete.sort(function(a,b){return b-a;});
        for (var del = 0; del < rowsToDelete.length; del++) { presencaSheet.deleteRow(rowsToDelete[del]); }
      } catch (cleanErr) { Logger.log('Aviso auto-clean: ' + cleanErr.message); }
    }

    lock.releaseLock();

    if (statusCheckin === 'APROVADO') {
      try {
        var stuRow = -1, currentHorario = '';
        for (var ah = 1; ah < alunosData.length; ah++) {
          if (alunosData[ah][0] && alunosData[ah][0].toString().toLowerCase() === email) {
            stuRow = ah + 1; currentHorario = alunosData[ah][17] ? alunosData[ah][17].toString().trim() : ''; break;
          }
        }
        if (stuRow > 0 && !currentHorario) {
          var freshPresenca = presencaSheet.getDataRange().getValues();
          var detected = autoDetectTurno(email, freshPresenca);
          if (detected) { alunosSheet.getRange(stuRow, 18).setValue(detected); }
        }
      } catch (turnoErr) { Logger.log('Aviso auto-turno: ' + turnoErr.message); }
    }

    var DAY_LABELS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    var hojeDia = DAY_LABELS[now.getDay()];
    if (motivo === 'dia_nao_permitido') {
      return jsonResponse(true, '⚠️ Hoje (' + hojeDia + ') não é dia de treino no ' + ctInput + '. Seu check-in ficará pendente.', { name: studentName, ct: ctInput, timestamp: now, status: 'PENDENTE', reason: 'dia_nao_permitido' });
    } else {
      return jsonResponse(true, 'Presença registrada com sucesso! ✅', { name: studentName, ct: ctInput, timestamp: now, status: 'APROVADO' });
    }
  } catch (error) {
    lock.releaseLock();
    Logger.log('Erro attendance: ' + error.message);
    return errorResponse('Erro ao registrar presença');
  }
}


// ============================================================
// ===== GET RANKING (AUTENTICADO) =====
// ============================================================

function handleGetRankingMonth(data) {
  try {
    var authEmail = requireAuth(data);
    if (!authEmail) return unauthorizedResponse();
    if (!data.email) data.email = authEmail;

    var presencaSheet = getSheet('Presenca');
    var presencaData = presencaSheet.getDataRange().getValues();
    var now = new Date();
    var month, year, useYear;

    if (data.period) {
      year = now.getFullYear(); month = now.getMonth() + 1; useYear = (data.period === 'ano');
    } else {
      month = parseInt(data.month); year = parseInt(data.year); useYear = data.mode === 'year';
    }
    if (!useYear && (isNaN(month) || isNaN(year))) return jsonResponse(false, 'Mês/ano inválidos');
    if (useYear && isNaN(year)) return jsonResponse(false, 'Ano inválido');

    var modalidadeFiltro = data.modalidade ? data.modalidade.toString().trim().toLowerCase() : '';

    var counts = {};
    for (var i = 1; i < presencaData.length; i++) {
      var rowDate = presencaData[i][6];
      if (!rowDate) continue;
      var d = (rowDate instanceof Date) ? rowDate : new Date(rowDate);
      if (isNaN(d.getTime())) continue;
      var status = getPresencaStatus(presencaData[i]);
      if (status !== 'APROVADO') continue;
      var match = useYear ? d.getFullYear() === year : (d.getMonth() + 1) === month && d.getFullYear() === year;
      if (!match) continue;

      var rowMod = presencaData[i][10] ? presencaData[i][10].toString().trim().toLowerCase() : '';
      if (modalidadeFiltro) {
        if (rowMod && rowMod !== modalidadeFiltro) continue;
        // Registros legados (sem coluna modalidade): incluir para bjj_adulto E bjj_kids
        // (ambos são a mesma base de Jiu-Jitsu — legado não tinha segmentação)
        if (!rowMod && modalidadeFiltro !== 'bjj_adulto' && modalidadeFiltro !== 'bjj_kids') continue;
      }

      var email = presencaData[i][0] ? presencaData[i][0].toString().trim().toLowerCase() : '';
      var nome  = presencaData[i][1] ? presencaData[i][1].toString() : 'Aluno';
      var faixa = presencaData[i][2] ? presencaData[i][2].toString() : '';
      var grau  = presencaData[i][3] !== undefined ? presencaData[i][3].toString() : '0';
      var ct    = presencaData[i][4] ? presencaData[i][4].toString() : '';
      if (!email) continue;
      if (!counts[email]) { counts[email] = { email: email, name: nome, faixa: faixa, grau: grau, treinos: 0, cts: {} }; }
      counts[email].treinos++;
      if (ct) { if (!counts[email].cts[ct]) counts[email].cts[ct] = 0; counts[email].cts[ct]++; }
    }

    var ranking = [];
    var keys = Object.keys(counts);
    for (var k = 0; k < keys.length; k++) {
      var entry = counts[keys[k]];
      var ctKeys = Object.keys(entry.cts);
      var ctPrincipal = '', maxCt = 0;
      var treinosPorCT = {};
      for (var c = 0; c < ctKeys.length; c++) {
        treinosPorCT[ctKeys[c]] = entry.cts[ctKeys[c]];
        if (entry.cts[ctKeys[c]] > maxCt) { maxCt = entry.cts[ctKeys[c]]; ctPrincipal = ctKeys[c]; }
      }
      var ctsArr = [];
      for (var c2 = 0; c2 < ctKeys.length; c2++) { ctsArr.push({ ct: ctKeys[c2], count: entry.cts[ctKeys[c2]] }); }
      ctsArr.sort(function(a, b) { return b.count - a.count; });
      ranking.push({ email: entry.email, name: entry.name, faixa: entry.faixa, grau: entry.grau, treinos: entry.treinos, totalTreinos: entry.treinos, treinosPorCT: treinosPorCT, ctPrincipal: ctPrincipal, cts: ctsArr });
    }
    ranking.sort(function(a, b) { return b.treinos - a.treinos; });

    var userEntry = null;
    for (var u = 0; u < ranking.length; u++) {
      if (ranking[u].email === authEmail) {
        userEntry = { position: u + 1, treinos: ranking[u].treinos, totalTreinos: ranking[u].treinos, treinosPorCT: ranking[u].treinosPorCT, ctPrincipal: ranking[u].ctPrincipal, cts: ranking[u].cts };
        break;
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true, ranking: ranking.slice(0, 50), total: ranking.length, user: userEntry })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Erro ranking: ' + error.message);
    return errorResponse('Erro ao gerar ranking');
  }
}


// ============================================================
// GET INACTIVE STUDENTS
// ============================================================
function handleGetInactiveStudents(data) {
  try {
    var authEmail = requireProfessorOrAdmin(data);
    if (!authEmail) return forbiddenResponse();
    var dias = parseInt(data.dias) || 30;
    var agora = new Date();
    var aluSheet  = getSheet('Alunos');
    var preSheet  = getSheet('Presenca');
    var aluData   = aluSheet.getDataRange().getValues();
    var preData   = preSheet.getDataRange().getValues();
    var ultimoCheckin = {};
    for (var p = 1; p < preData.length; p++) {
      if (getPresencaStatus(preData[p]) !== 'APROVADO') continue;
      var pe = preData[p][0] ? preData[p][0].toString().trim().toLowerCase() : '';
      if (!pe) continue;
      var pd = preData[p][6]; if (!pd) continue;
      var dd = (pd instanceof Date) ? pd : new Date(pd);
      if (isNaN(dd.getTime())) continue;
      if (!ultimoCheckin[pe] || dd > ultimoCheckin[pe]) ultimoCheckin[pe] = dd;
    }
    var inativos = [];
    for (var i = 1; i < aluData.length; i++) {
      var email = aluData[i][0] ? aluData[i][0].toString().trim().toLowerCase() : '';
      if (!email) continue;
      var isAdm = (aluData[i][6] === true || aluData[i][6] === 'TRUE');
      if (isAdm) continue;
      var nome   = aluData[i][1]  ? aluData[i][1].toString()  : '';
      var faixa  = aluData[i][2]  ? aluData[i][2].toString()  : ''; // legado
      var ct     = aluData[i][4]  ? aluData[i][4].toString()  : '';
      var status = aluData[i][25] ? aluData[i][25].toString().toUpperCase() : '';
      var modals = aluData[i][31] ? aluData[i][31].toString().trim() : '';
      var modPri = aluData[i][32] ? aluData[i][32].toString().trim() : '';
      // v4.9 — usa graduação da modalidade principal em vez da global
      var mGrad    = _parseModalidadesGrad(aluData[i][33]);
      var gradMP   = _getNivelAtual(mGrad, modPri || 'bjj_adulto', faixa);
      var nivelLabel = gradMP.nivel + (gradMP.grau ? ' • ' + gradMP.grau + 'º' : '');
      var ultimo   = ultimoCheckin[email] || null;
      var diasSem  = ultimo ? Math.floor((agora - ultimo) / 864e5) : null;
      var inativo  = (diasSem === null || diasSem >= dias);
      if (!inativo && status !== 'DESATIVADO') continue;
      inativos.push({ email: email, nome: nome, faixa: nivelLabel, nivel: gradMP.nivel, grau: gradMP.grau, modalidadesGrad: mGrad, ct: ct, status: status || 'ATIVO', diasSemTreinamento: diasSem, ultimoCheckin: ultimo ? Utilities.formatDate(ultimo, Session.getScriptTimeZone(), 'dd/MM/yyyy') : null, modalidades: modals, modalidadePrincipal: modPri });
    }
    inativos.sort(function(a, b) {
      if (a.status === 'DESATIVADO' && b.status !== 'DESATIVADO') return -1;
      if (b.status === 'DESATIVADO' && a.status !== 'DESATIVADO') return  1;
      return (b.diasSemTreinamento || 9999) - (a.diasSemTreinamento || 9999);
    });
    return ContentService.createTextOutput(JSON.stringify({ success: true, inativos: inativos, total: inativos.length })).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    Logger.log('Erro getInactiveStudents: ' + err.message);
    return errorResponse('Erro ao buscar inativos');
  }
}

// ============================================================
// ===== GET / SAVE PROFILE =====
// ============================================================

function handleGetProfile(data) {
  if (!data.email) return jsonResponse(false, 'Email obrigatório');
  var authEmail = requireAuth(data);
  if (!authEmail) return unauthorizedResponse();
  var requestedEmail = data.email.toString().trim().toLowerCase();
  if (authEmail !== requestedEmail && !isEmailAdmin(authEmail)) { return forbiddenResponse(); }
  try {
    var alunosSheet = getSheet('Alunos');
    var alunosData = alunosSheet.getDataRange().getValues();
    for (var i = 1; i < alunosData.length; i++) {
      if (!alunosData[i][0]) continue;
      if (alunosData[i][0].toString().trim().toLowerCase() === requestedEmail) {
        var profile = {};
        var keys = Object.keys(PROFILE_COLUMNS);
        for (var k = 0; k < keys.length; k++) {
          var key = keys[k];
          var val = alunosData[i][PROFILE_COLUMNS[key]];
          if (val instanceof Date) { profile[key] = val.toISOString(); }
          else { profile[key] = (val !== undefined && val !== null) ? val.toString() : ''; }
        }
        // Inclui modalidadesGrad no perfil
        profile.modalidadesGrad = _parseModalidadesGrad(alunosData[i][33]);
        return ContentService.createTextOutput(JSON.stringify({ success: true, profile: profile })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    return jsonResponse(true, 'Perfil vazio', { profile: {} });
  } catch (error) {
    Logger.log('Erro getProfile: ' + error.message);
    return errorResponse('Erro ao obter perfil');
  }
}

function handleSaveProfile(data) {
  if (!data.email || !data.profile) return jsonResponse(false, 'Dados incompletos');
  var authEmail = requireAuth(data);
  if (!authEmail) return unauthorizedResponse();
  var requestedEmail = data.email.toString().trim().toLowerCase();
  if (authEmail !== requestedEmail) { return forbiddenResponse(); }
  try {
    var alunosSheet = getSheet('Alunos');
    var alunosData  = alunosSheet.getDataRange().getValues();
    for (var i = 1; i < alunosData.length; i++) {
      if (!alunosData[i][0]) continue;
      if (alunosData[i][0].toString().trim().toLowerCase() !== authEmail) continue;
      var profile = data.profile;
      var keys    = Object.keys(PROFILE_COLUMNS);
      var values  = [];
      for (var k = 0; k < keys.length; k++) {
        var key        = keys[k];
        var newVal     = profile[key];
        var currentVal = alunosData[i][PROFILE_COLUMNS[key]];
        if (newVal !== undefined && newVal !== null && newVal !== '') {
          if (key === 'avatar') {
            // Avatar (foto base64 ou JSON SVG) — NÃO truncar com MAX_FIELD_LENGTH
            var avatarStr = newVal.toString();
            values.push(avatarStr.length <= 700000 ? avatarStr : (currentVal ? currentVal.toString() : ''));
          } else {
            values.push(cleanField(newVal.toString(), MAX_FIELD_LENGTH));
          }
        } else if (currentVal !== undefined && currentVal !== null && currentVal !== '') {
          values.push(newVal === '' ? '' : currentVal.toString());
        } else {
          values.push('');
        }
      }
      alunosSheet.getRange(i + 1, 9, 1, keys.length).setValues([values]);
      Logger.log('[saveProfile] ' + authEmail + ' avatar=' + (profile.avatar ? profile.avatar.length + 'chars' : 'none'));
      return jsonResponse(true, 'Perfil salvo com sucesso!');
    }
    return jsonResponse(false, 'Aluno não encontrado');
  } catch (error) {
    Logger.log('Erro saveProfile: ' + error.message);
    return errorResponse('Erro ao salvar perfil');
  }
}

// ============================================================
// ===== SAVE AVATAR FOTO (foto real, sem truncar) =====
// ============================================================

function handleSaveAvatarFoto(data) {
  var authEmail = requireAuth(data);
  if (!authEmail) return unauthorizedResponse();
  if (!data.fotoBase64) return jsonResponse(false, 'Foto obrigatória');

  var fotoData = data.fotoBase64.toString();
  if (fotoData.indexOf(',') > -1) fotoData = fotoData.split(',')[1];
  if (fotoData.length > 700000) return jsonResponse(false, 'Foto muito grande. Máximo 500 KB.');

  var mimeType = sanitizeInput(data.mimeType || 'image/jpeg');
  var dataUrl  = 'data:' + mimeType + ';base64,' + fotoData;

  try {
    var alunosSheet = getSheet('Alunos');
    var rows        = alunosSheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      var rowEmail = (rows[i][0] || '').toString().trim().toLowerCase();
      if (rowEmail !== authEmail) continue;
      alunosSheet.getRange(i + 1, 21).setValue(dataUrl); // col U = avatar
      Logger.log('[saveAvatarFoto] ' + authEmail + ': ' + fotoData.length + ' chars');
      return jsonResponse(true, 'Foto de perfil salva com sucesso!');
    }
    return jsonResponse(false, 'Aluno não encontrado');
  } catch (e) {
    Logger.log('[saveAvatarFoto] erro: ' + e.message);
    return errorResponse('Erro ao salvar foto');
  }
}

// ============================================================
// ===== GET ALUNOS COM FOTOS (para IA de reconhecimento) =====
// ============================================================

function handleGetAlunosComFotos(data) {
  var adminEmail = requireAdmin(data);
  if (!adminEmail) return forbiddenResponse();

  var ctFiltro    = sanitizeInput(data.ct || '');
  var alunosSheet = getSheet('Alunos');
  var rows        = alunosSheet.getDataRange().getValues();
  var alunos      = [];

  for (var i = 1; i < rows.length; i++) {
    var email  = (rows[i][0]  || '').toString().trim();
    var nome   = (rows[i][1]  || '').toString().trim();
    var faixa  = (rows[i][2]  || '').toString().trim();
    var ct     = (rows[i][4]  || '').toString().trim();
    var status = (rows[i][25] || '').toString().trim().toLowerCase(); // col Z
    var avatar = (rows[i][20] || '').toString().trim();               // col U

    if (status === 'desativado' || status === 'bloqueado') continue;
    if (ctFiltro && ct.toLowerCase() !== ctFiltro.toLowerCase()) continue;
    if (!email || !nome) continue;

    alunos.push({
      email:   email,
      nome:    nome,
      faixa:   faixa,
      ct:      ct,
      temFoto: avatar.length > 100,
      avatar:  avatar.length > 100 ? avatar : null
    });
  }

  return jsonResponse(true, null, {
    alunos:  alunos,
    total:   alunos.length,
    comFoto: alunos.filter(function(a){ return a.temFoto; }).length
  });
}

// ============================================================
// ===== CHECKIN EM MASSA (via foto do treino — professor) =====
// ============================================================

function handleCheckinEmMassa(data) {
  var adminEmail = requireAdmin(data);
  if (!adminEmail) return forbiddenResponse();

  if (!data.emails || !Array.isArray(data.emails) || data.emails.length === 0) {
    return jsonResponse(false, 'Lista de emails obrigatória');
  }

  var emails     = data.emails.slice(0, 50);
  var modalidade = sanitizeInput(data.modalidade || '');
  var origem     = sanitizeInput(data.origem     || 'foto_treino');
  var hoje       = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd');
  var hora       = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'HH:mm');

  var alunosSheet   = getSheet('Alunos');
  var presencaSheet = getSheet('Presenca');
  var alunosData    = alunosSheet.getDataRange().getValues();
  var presencaData  = presencaSheet.getDataRange().getValues();

  // Mapa email → dados do aluno
  var alunoMap = {};
  for (var i = 1; i < alunosData.length; i++) {
    var em = (alunosData[i][0] || '').toString().trim().toLowerCase();
    if (em) alunoMap[em] = {
      nome:         alunosData[i][1]  || '',
      faixa:        alunosData[i][2]  || '',
      grau:         alunosData[i][3]  || '',
      ct:           alunosData[i][4]  || '',
      horario:      alunosData[i][17] || '',
      modPrincipal: alunosData[i][32] || ''
    };
  }

  // Checkins já feitos hoje
  var jaFez = {};
  for (var j = 1; j < presencaData.length; j++) {
    var pEm  = (presencaData[j][0]  || '').toString().trim().toLowerCase();
    var pDt  = (presencaData[j][6]  || '').toString().trim();
    var pMod = (presencaData[j][10] || '').toString().trim();
    if (pDt === hoje) jaFez[pEm + '_' + pMod] = true;
  }

  var novasLinhas = [];
  var resultados  = [];

  for (var k = 0; k < emails.length; k++) {
    var emailAluno = emails[k].toString().trim().toLowerCase();
    var aluno      = alunoMap[emailAluno];
    if (!aluno) {
      resultados.push({ email: emailAluno, status: 'nao_encontrado' });
      continue;
    }
    var modFinal = modalidade || aluno.modPrincipal || 'geral';
    var chave    = emailAluno + '_' + modFinal;
    if (jaFez[chave]) {
      resultados.push({ email: emailAluno, nome: aluno.nome, status: 'ja_registrado' });
      continue;
    }
    // A:Email | B:Nome | C:Faixa | D:Grau | E:CT | F:Horario | G:Data | H:Hora | I:Status | J:ApprovedBy | K:Modalidade
    novasLinhas.push([
      emailAluno, aluno.nome, aluno.faixa, aluno.grau, aluno.ct,
      aluno.horario, hoje, hora, 'presente',
      adminEmail + ' (' + origem + ')', modFinal
    ]);
    jaFez[chave] = true;
    resultados.push({ email: emailAluno, nome: aluno.nome, status: 'ok' });
  }

  if (novasLinhas.length > 0) {
    var ultima = presencaSheet.getLastRow();
    presencaSheet.getRange(ultima + 1, 1, novasLinhas.length, novasLinhas[0].length).setValues(novasLinhas);
  }

  var totalOk = resultados.filter(function(r){ return r.status === 'ok'; }).length;
  Logger.log('[checkinEmMassa] admin=' + adminEmail + ' ok=' + totalOk + '/' + emails.length + ' origem=' + origem);

  return jsonResponse(true, totalOk + ' check-in(s) registrado(s)', {
    totalSolicitado: emails.length,
    totalRegistrado: totalOk,
    resultados:      resultados
  });
}

// ============================================================
// ===== PROXY CLAUDE API — analisa foto do treino ============
// ============================================================
// A chave da API fica segura no servidor (PropertiesService).
// Configure em: Apps Script → Configurações do projeto →
// Propriedades do script → adicione ANTHROPIC_API_KEY = sk-ant-...
//
// action: 'analisarFotoTreino'
// Payload: { token, fotoBase64, mimeType, alunos: [...], temFotos: bool }

function handleAnalisarFotoTreino(data) {
  var adminEmail = requireAdmin(data);
  if (!adminEmail) return forbiddenResponse();

  if (!data.fotoBase64) return jsonResponse(false, 'Foto obrigatória');

  // Busca chave da API nas propriedades do script
  var props  = PropertiesService.getScriptProperties();
  var apiKey = props.getProperty('ANTHROPIC_API_KEY') || '';
  if (!apiKey || apiKey.length < 20) {
    return jsonResponse(false, 'Chave ANTHROPIC_API_KEY não configurada. Vá em Apps Script → Configurações → Propriedades do script e adicione a chave.');
  }

  // Valida foto
  var fotoBase64 = data.fotoBase64.toString();
  if (fotoBase64.indexOf(',') > -1) fotoBase64 = fotoBase64.split(',')[1];
  if (fotoBase64.length > 1500000) return jsonResponse(false, 'Foto muito grande para análise.');

  var mimeType = sanitizeInput(data.mimeType || 'image/jpeg');
  var alunos   = [];
  try {
    alunos = typeof data.alunos === 'string' ? JSON.parse(data.alunos) : (data.alunos || []);
  } catch(e) { alunos = []; }

  // Monta lista de alunos para o prompt
  var listaTexto = alunos.map(function(a, i) {
    return (i + 1) + '. ' + (a.nome || '') + ' (faixa ' + (a.faixa || '?') + (a.temFoto ? ' ★foto' : '') + ')';
  }).join('\n');

  var temFotos = !!data.temFotos;

  // Monta content blocks para a API
  var contentBlocks = [];

  // Foto do treino (principal)
  contentBlocks.push({
    type: 'image',
    source: { type: 'base64', media_type: mimeType, data: fotoBase64 }
  });

  // Fotos de referência dos alunos (se tiver, até 8 para não estourar)
  var alunosComFoto = alunos.filter(function(a){ return a.temFoto && a.avatar && a.avatar.length > 100; }).slice(0, 8);
  if (alunosComFoto.length > 0) {
    contentBlocks.push({ type: 'text', text: 'Fotos de referência dos alunos cadastrados:' });
    alunosComFoto.forEach(function(a) {
      var base = a.avatar.indexOf(',') > -1 ? a.avatar.split(',')[1] : a.avatar;
      var mime = (a.avatar.indexOf('image/png') > -1) ? 'image/png' : 'image/jpeg';
      contentBlocks.push({ type: 'image', source: { type: 'base64', media_type: mime, data: base } });
      contentBlocks.push({ type: 'text', text: 'Aluno da foto acima: ' + a.nome });
    });
  }

  var prompt = 'Você é um sistema de controle de presença de uma academia de artes marciais.\n\n' +
    'LISTA DE ALUNOS CADASTRADOS:\n' + (listaTexto || '(nenhum aluno cadastrado)') + '\n\n' +
    (temFotos
      ? 'Você recebeu a foto do treino (primeira imagem) e fotos de referência de alguns alunos. Compare os rostos.\n'
      : 'Você não tem fotos de referência. Use características visuais: cor da faixa, posição, uniforme, gênero, estatura.\n') +
    '\nAnalise a primeira foto (treino do grupo) e identifique quem está presente.\n' +
    'RESPONDA APENAS EM JSON VÁLIDO sem texto antes ou depois:\n' +
    '{"total_pessoas":<número>,"reconhecidos":[{"nome":"<nome da lista>","email":"","confianca":<0-100>,"descricao":"<faixa, posição>"}],"nao_identificados":<número>,"observacoes":"<resumo>"}';

  contentBlocks.push({ type: 'text', text: prompt });

  // Chama a API da Anthropic via UrlFetchApp (sem CORS)
  try {
    var payload = JSON.stringify({
      model:      'claude-opus-4-5',
      max_tokens: 1500,
      messages:   [{ role: 'user', content: contentBlocks }]
    });

    var response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method:             'POST',
      muteHttpExceptions: true,
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01'
      },
      payload: payload
    });

    var code    = response.getResponseCode();
    var resText = response.getContentText();

    if (code !== 200) {
      Logger.log('[analisarFotoTreino] API error ' + code + ': ' + resText.substring(0, 300));
      var errBody = {};
      try { errBody = JSON.parse(resText); } catch(e) {}
      var msg = (errBody.error && errBody.error.message) ? errBody.error.message : 'Erro na API (' + code + ')';
      return jsonResponse(false, msg);
    }

    var resJson  = JSON.parse(resText);
    var texto    = '';
    (resJson.content || []).forEach(function(b){ if (b.type === 'text') texto += b.text; });

    // Extrai JSON da resposta
    var jsonMatch = texto.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return jsonResponse(false, 'Resposta da IA em formato inválido.');

    var resultado = JSON.parse(jsonMatch[0]);
    Logger.log('[analisarFotoTreino] ok — reconhecidos: ' + (resultado.reconhecidos || []).length);

    return jsonResponse(true, null, { resultado: resultado });

  } catch(e) {
    Logger.log('[analisarFotoTreino] erro: ' + e.message);
    return errorResponse('Erro ao chamar IA: ' + e.message);
  }
}

// ============================================================
// ===== CHANGE PASSWORD =====
// ============================================================

function handleChangePassword(data) {
  if (!data.email || !data.currentPassword || !data.newPassword) { return jsonResponse(false, 'Dados incompletos'); }
  var authEmail = requireAuth(data);
  if (!authEmail) return unauthorizedResponse();
  if (authEmail !== data.email.toString().trim().toLowerCase()) { return forbiddenResponse(); }
  if (data.newPassword.length < 6) return jsonResponse(false, 'Nova senha deve ter no mínimo 6 caracteres');
  if (data.newPassword.length > 128) return jsonResponse(false, 'Senha muito longa');
  try {
    var alunosSheet = getSheet('Alunos');
    var rows = alunosSheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] && rows[i][0].toString().trim().toLowerCase() === authEmail) {
        var storedHash = rows[i][5] ? rows[i][5].toString() : '';
        if (!verifyPassword(data.currentPassword, storedHash)) { return jsonResponse(false, 'Senha atual incorreta'); }
        alunosSheet.getRange(i + 1, 6).setValue(hashPassword(data.newPassword));
        Logger.log('Senha alterada: ' + authEmail);
        return jsonResponse(true, 'Senha alterada com sucesso!');
      }
    }
    return jsonResponse(false, 'Aluno não encontrado');
  } catch (error) {
    Logger.log('Erro changePassword: ' + error.message);
    return errorResponse('Erro ao alterar senha');
  }
}

// ============================================================
// ===== UPDATE GRAU — v4.9 (respeita modalidade) =====
// ============================================================

function handleUpdateGrau(data) {
  if (!data.email) return jsonResponse(false, 'Email obrigatório');
  var authEmail = requireAuth(data);
  if (!authEmail) return unauthorizedResponse();
  if (authEmail !== data.email.toString().trim().toLowerCase()) { return forbiddenResponse(); }
  var novoGrau = parseInt(data.grau);
  if (isNaN(novoGrau) || novoGrau < 0) { return jsonResponse(false, 'Grau inválido'); }
  // v4.9+: modId obrigatório para segregar por modalidade
  var modIdParam = data.modId ? data.modId.toString().trim().toLowerCase() : '';
  try {
    var alunosSheet = getSheet('Alunos');
    var rows = alunosSheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] && rows[i][0].toString().trim().toLowerCase() === authEmail) {
        var principal = rows[i][32] ? rows[i][32].toString().trim() : '';
        var modId     = modIdParam || principal || 'bjj_adulto';
        // ─ Validação de compatibilidade por modalidade ─────────────────────────
        var modInfo = _getModInfo(modId);
        var maxGrau = modInfo.maxGrau;
        if (novoGrau > maxGrau) { return jsonResponse(false, 'Grau ' + novoGrau + ' inválido para ' + modId + ' (máx: ' + maxGrau + ')'); }
        // ───────────────────────────────────────────────────
        var grad      = _parseModalidadesGrad(rows[i][33]);
        var gradAtual = _getNivelAtual(grad, modId, 'Branca');
        if (novoGrau <= gradAtual.grau) { return jsonResponse(true, 'Grau já atualizado', { grau: gradAtual.grau }); }
        if (!grad[modId]) grad[modId] = _gradInicialParaMod(modId);
        grad[modId].grau = novoGrau;
        alunosSheet.getRange(i + 1, 34).setValue(JSON.stringify(grad)); // AH
        // Sincroniza col D apenas se for a modalidade principal
        if (modId === principal) { alunosSheet.getRange(i + 1, 4).setValue(novoGrau); }
        Logger.log('updateGrau [' + modId + '] ' + authEmail + ' → grau ' + novoGrau);
        return jsonResponse(true, 'Grau atualizado para ' + novoGrau, { grau: novoGrau, modId: modId });
      }
    }
    return jsonResponse(false, 'Aluno não encontrado');
  } catch (error) {
    Logger.log('Erro updateGrau: ' + error.message);
    return errorResponse('Erro ao atualizar grau');
  }
}

// ============================================================
// ===== MY PRESENCAS =====
// ============================================================

function handleGetMyPresencas(data) {
  var authEmail = requireAuth(data);
  if (!authEmail) return unauthorizedResponse();
  try {
    var presencaSheet = getSheet('Presenca');
    var rows = presencaSheet.getDataRange().getValues();
    var records = [];
    // ── Filtro por modalidade (opcional) ─────────────────────────────
    // Regra: se informada, retorna só registros da mesma modalidade.
    // Registros antigos (col K vazia) são incluídos como legado.
    var modFilter = data.modalidade ? data.modalidade.toString().trim().toLowerCase() : '';
    // ────────────────────────────────────────────────────────────────
    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0]) continue;
      if (rows[i][0].toString().trim().toLowerCase() !== authEmail) continue;
      var status = getPresencaStatus(rows[i]);
      if (status !== 'APROVADO' && status !== 'PENDENTE') continue;
      // ── Aplica filtro de modalidade ───────────────────────────────
      if (modFilter) {
        var rowMod = rows[i][10] ? rows[i][10].toString().trim().toLowerCase() : '';
        if (rowMod && rowMod !== modFilter) continue; // pula outras modalidades
        // rowMod vazio → registro legado, sempre inclui
      }
      // ─────────────────────────────────────────────────────────────
      var dt = rows[i][6];
      var dateStr = '';
      if (dt instanceof Date) {
        dateStr = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
      } else if (dt) {
        var parsed = new Date(dt);
        if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1900) {
          dateStr = parsed.getFullYear() + '-' + String(parsed.getMonth() + 1).padStart(2, '0') + '-' + String(parsed.getDate()).padStart(2, '0');
        } else { dateStr = dt.toString().trim(); }
      }
      if (!dateStr) continue;
      records.push({ date: dateStr, hora: formatTime(rows[i][7]) || formatTime(rows[i][5]) || '', ct: rows[i][4] ? rows[i][4].toString().trim() : '', status: status, modalidade: rows[i][10] ? rows[i][10].toString().trim() : '' });
    }
    records.sort(function(a, b) { return b.date.localeCompare(a.date); });
    return ContentService.createTextOutput(JSON.stringify({ success: true, records: records })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Erro getMyPresencas: ' + error.message);
    return errorResponse('Erro ao buscar presenças');
  }
}


// ============================================================
// ===== ADMIN: DELETE STUDENT =====
// ============================================================

function handleDeleteStudent(data) {
  var adminEmail = requireAdmin(data);
  if (!adminEmail) return forbiddenResponse();
  if (!data.email) return jsonResponse(false, 'Email obrigatório');
  var targetEmail = data.email.toString().trim().toLowerCase();
  if (targetEmail === adminEmail) { return jsonResponse(false, 'Não é possível deletar sua própria conta'); }
  if (isEmailSuperAdmin(targetEmail)) { return jsonResponse(false, 'Conta protegida — não pode ser removida.'); }
  try {
    var alunosSheet = getSheet('Alunos');
    var rows = alunosSheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] && rows[i][0].toString().toLowerCase() === targetEmail) {
        alunosSheet.deleteRow(i + 1);
        Logger.log('Admin ' + adminEmail + ' deletou: ' + targetEmail);
        return jsonResponse(true, 'Aluno deletado com sucesso');
      }
    }
    return jsonResponse(false, 'Aluno não encontrado');
  } catch (error) {
    Logger.log('Erro delete: ' + error.message);
    return errorResponse('Erro ao deletar aluno');
  }
}

// ============================================================
// ===== ADMIN: PENDING CHECKINS =====
// ============================================================

function handleGetPendingCheckins(data) {
  var adminEmail = requireAdmin(data);
  if (!adminEmail) return forbiddenResponse();
  try {
    var presencaSheet = getSheet('Presenca');
    var rows = presencaSheet.getDataRange().getValues();
    var filter = (data && data.filter) ? data.filter : 'hoje';
    var pending = [], approved = [], todayTotal = 0;
    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0]) continue;
      var rowDate = rows[i][6];
      var status = getPresencaStatus(rows[i]);
      if (isToday(rowDate) && status !== 'REJEITADO') { todayTotal++; }
      var matchFilter = filter === 'hoje' ? isToday(rowDate) : filter === 'semana' ? isThisWeek(rowDate) : true;
      if (!matchFilter) continue;
      var approvedByField = rows[i][9] ? rows[i][9].toString() : '';
      var isEsquecimento = approvedByField.indexOf('Solicitação manual') === 0;
      var obsText = isEsquecimento ? approvedByField.replace('Solicitação manual', '').replace(/^:\s*/, '').trim() : '';
      var checkinObj = { rowIndex: i + 1, email: rows[i][0] ? rows[i][0].toString() : '', name: rows[i][1] ? rows[i][1].toString() : '', faixa: rows[i][2] ? rows[i][2].toString() : '', grau: rows[i][3] !== undefined ? rows[i][3].toString() : '0', ct: rows[i][4] ? rows[i][4].toString() : '', horario: formatTime(rows[i][5]), data: rowDate ? rowDate.toString() : '', dataFormatada: formatDate(rowDate), hora: formatTime(rows[i][7]), status: status, tipo: isEsquecimento ? 'ESQUECIMENTO' : 'NORMAL', observacao: obsText };
      if (status === 'PENDENTE') { pending.push(checkinObj); }
      else if (status === 'APROVADO') { approved.push(checkinObj); }
    }
    pending.reverse(); approved.reverse();
    return ContentService.createTextOutput(JSON.stringify({ success: true, pending: pending, approved: approved, todayTotal: todayTotal })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Erro getPendingCheckins: ' + error.message);
    return errorResponse('Erro ao listar check-ins');
  }
}

function handleApproveCheckin(data) {
  var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  if (!data.rowIndex) return jsonResponse(false, 'rowIndex obrigatório');
  var rowIndex = parseInt(data.rowIndex);
  if (isNaN(rowIndex) || rowIndex < 2) return jsonResponse(false, 'rowIndex inválido');
  try {
    var presencaSheet = getSheet('Presenca');
    if (rowIndex > presencaSheet.getLastRow()) return jsonResponse(false, 'Linha não encontrada');
    presencaSheet.getRange(rowIndex, 9).setValue('APROVADO');
    presencaSheet.getRange(rowIndex, 10).setValue(adminEmail);
    return jsonResponse(true, 'Check-in aprovado!');
  } catch (error) { return errorResponse('Erro ao aprovar check-in'); }
}

function handleRejectCheckin(data) {
  var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  if (!data.rowIndex) return jsonResponse(false, 'rowIndex obrigatório');
  var rowIndex = parseInt(data.rowIndex);
  if (isNaN(rowIndex) || rowIndex < 2) return jsonResponse(false, 'rowIndex inválido');
  try {
    var presencaSheet = getSheet('Presenca');
    if (rowIndex > presencaSheet.getLastRow()) return jsonResponse(false, 'Linha não encontrada');
    presencaSheet.getRange(rowIndex, 9).setValue('REJEITADO');
    return jsonResponse(true, 'Check-in rejeitado.');
  } catch (error) { return errorResponse('Erro ao rejeitar check-in'); }
}

function handleBulkApproveCheckins(data) {
  var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  try {
    var presencaSheet = getSheet('Presenca');
    var rows = presencaSheet.getDataRange().getValues();
    var filter = (data && data.filter) ? data.filter : 'hoje';
    var count = 0;
    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0] || getPresencaStatus(rows[i]) !== 'PENDENTE') continue;
      var rowDate = rows[i][6];
      var matchFilter = filter === 'hoje' ? isToday(rowDate) : filter === 'semana' ? isThisWeek(rowDate) : true;
      if (!matchFilter) continue;
      presencaSheet.getRange(i + 1, 9).setValue('APROVADO');
      presencaSheet.getRange(i + 1, 10).setValue(adminEmail);
      count++;
    }
    return jsonResponse(true, count + ' check-ins aprovados!', { count: count });
  } catch (error) { return errorResponse('Erro ao aprovar em massa'); }
}


// ============================================================
// ===== ADMIN: CT SCHEDULE & DETAILS =====
// ============================================================

function handleSaveCTSchedule(data) {
  var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  if (!data.ctName || !data.schedule) return jsonResponse(false, 'Dados incompletos');
  try {
    var ctsSheet = getSheet('CTs'); var rows = ctsSheet.getDataRange().getValues();
    var DAY_NAMES = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] && rows[i][0].toString().trim() === data.ctName.trim()) {
        var values = [];
        for (var d = 0; d < DAY_NAMES.length; d++) { values.push(data.schedule[DAY_NAMES[d]] === true ? true : false); }
        ctsSheet.getRange(i + 1, 3, 1, 7).setValues([values]);
        return jsonResponse(true, 'Horário do ' + data.ctName + ' salvo!');
      }
    }
    return jsonResponse(false, 'CT não encontrado');
  } catch (error) { return errorResponse('Erro ao salvar horário'); }
}

function handleSaveCTDetails(data) {
  // Salva apenas horariosPorDia por modalidade (col 11)
  var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  if (!data.ctName) return jsonResponse(false, 'Nome do CT obrigatório');
  try {
    var ctsSheet = getSheet('CTs'); var rows = ctsSheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] && rows[i][0].toString().trim() === data.ctName.trim()) {
        var horariosRaw = (data.horarios || '').toString().trim();
        if (horariosRaw && horariosRaw.charAt(0) === '{') { try { JSON.parse(horariosRaw); } catch(e) { horariosRaw = ''; } }
        ctsSheet.getRange(i + 1, 11).setValue(truncateField(horariosRaw, MAX_FIELD_LENGTH));
        return jsonResponse(true, 'Horários do ' + data.ctName + ' salvos!');
      }
    }
    return jsonResponse(false, 'CT não encontrado');
  } catch (error) { return errorResponse('Erro ao salvar CT'); }
}

// ============================================================
// ===== ATTENDANCE REPORT =====
// ============================================================

function handleGetAttendanceReport(data) {
  var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  try {
    var presencaSheet = getSheet('Presenca'); var rows = presencaSheet.getDataRange().getValues();
    var filterCT = (data && data.ct && data.ct !== 'todos') ? data.ct.toString().trim() : '';
    var filterMod = (data && data.modalidade) ? data.modalidade.toString().trim().toLowerCase() : '';
    var DAY_NAMES = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
    var byMonth = {}, byDayOfWeek = { dom: 0, seg: 0, ter: 0, qua: 0, qui: 0, sex: 0, sab: 0 };
    var byHour = {}, byCT = {}, byMonthCT = {}, byAluno = {};
    var totalGeral = 0, records = [], allCTNames = {};
    var MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0] || getPresencaStatus(rows[i]) !== 'APROVADO') continue;
      var rowDate = rows[i][6]; if (!rowDate) continue;
      var d = (rowDate instanceof Date) ? rowDate : new Date(rowDate); if (isNaN(d.getTime())) continue;
      var email = rows[i][0].toString().trim().toLowerCase(); var nome = rows[i][1] ? rows[i][1].toString() : 'Aluno';
      var faixa = rows[i][2] ? rows[i][2].toString() : ''; var ct = rows[i][4] ? rows[i][4].toString() : '';
      var horaStr = formatTime(rows[i][7]) || formatTime(rows[i][5]) || '';
      // ── Filtro por modalidade ─────────────────────────────────────────────
      if (filterMod) { var rMod = rows[i][10] ? rows[i][10].toString().trim().toLowerCase() : ''; if (rMod && rMod !== filterMod) continue; }
      // ─────────────────────────────────────────────────────────────────────
      if (ct) allCTNames[ct] = true;
      if (ct) { if (!byCT[ct]) byCT[ct] = 0; byCT[ct]++; }
      if (filterCT && ct !== filterCT) continue;
      totalGeral++;
      var mm = ('0' + (d.getMonth() + 1)).slice(-2), yyyy = d.getFullYear();
      var monthKey = yyyy + '-' + mm;
      if (!byMonth[monthKey]) { byMonth[monthKey] = { key: monthKey, label: MONTH_LABELS[d.getMonth()] + '/' + yyyy, total: 0 }; }
      byMonth[monthKey].total++;
      byDayOfWeek[DAY_NAMES[d.getDay()]]++;
      var hourKey = horaStr ? horaStr.substring(0, 2) : '';
      if (hourKey) { if (!byHour[hourKey]) byHour[hourKey] = 0; byHour[hourKey]++; }
      if (ct) { var mctKey = monthKey + '|' + ct; if (!byMonthCT[mctKey]) byMonthCT[mctKey] = { month: monthKey, monthLabel: MONTH_LABELS[d.getMonth()] + '/' + yyyy, ct: ct, total: 0 }; byMonthCT[mctKey].total++; }
      if (!byAluno[email]) byAluno[email] = { email: email, name: nome, faixa: faixa, total: 0 };
      byAluno[email].total++;
      if (records.length < 200) { records.push({ email: email, name: nome, faixa: faixa, ct: ct, data: formatDate(d), hora: horaStr, dia: DAY_NAMES[d.getDay()] }); }
    }
    var byMonthArr = [], monthKeys = Object.keys(byMonth).sort(); for (var m = 0; m < monthKeys.length; m++) byMonthArr.push(byMonth[monthKeys[m]]);
    var byHourArr = [], hourKeys = Object.keys(byHour).sort(); for (var h = 0; h < hourKeys.length; h++) byHourArr.push({ hour: hourKeys[h] + ':00', total: byHour[hourKeys[h]] });
    var byCTArr = [], ctKeys2 = Object.keys(byCT).sort(); for (var c = 0; c < ctKeys2.length; c++) byCTArr.push({ ct: ctKeys2[c], total: byCT[ctKeys2[c]] });
    byCTArr.sort(function(a, b) { return b.total - a.total; });
    var byMonthCTArr = [], mctKeys = Object.keys(byMonthCT).sort(); for (var mc = 0; mc < mctKeys.length; mc++) byMonthCTArr.push(byMonthCT[mctKeys[mc]]);
    var byAlunoArr = [], alunoKeys = Object.keys(byAluno); for (var a = 0; a < alunoKeys.length; a++) byAlunoArr.push(byAluno[alunoKeys[a]]);
    byAlunoArr.sort(function(a, b) { return b.total - a.total; });
    var picoMes = byMonthArr.length > 0 ? byMonthArr.reduce(function(max, m) { return m.total > max.total ? m : max; }) : null;
    var picoDia = Object.keys(byDayOfWeek).reduce(function(max, d) { return byDayOfWeek[d] > byDayOfWeek[max] ? d : max; }, 'seg');
    var picoHora = byHourArr.length > 0 ? byHourArr.reduce(function(max, h) { return h.total > max.total ? h : max; }) : null;
    records.reverse();
    return ContentService.createTextOutput(JSON.stringify({ success: true, filterCT: filterCT || 'todos', allCTs: Object.keys(allCTNames).sort(), totalGeral: totalGeral, totalAlunos: byAlunoArr.length, byMonth: byMonthArr, byDayOfWeek: byDayOfWeek, byHour: byHourArr, byCT: byCTArr, byMonthCT: byMonthCTArr, byAluno: byAlunoArr.slice(0, 30), records: records, pico: { mes: picoMes, dia: picoDia, hora: picoHora } })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) { Logger.log('Erro getAttendanceReport: ' + error.message); return errorResponse('Erro ao gerar relatório'); }
}


// ============================================================
// ===== PASSWORD RESET =====
// ============================================================

function handleRequestPasswordReset(data) {
  if (!data.email || !data.novaSenha) return jsonResponse(false, 'Email e nova senha são obrigatórios');
  var email = data.email.toString().trim().toLowerCase();
  var novaSenha = data.novaSenha.toString();
  if (novaSenha.length < 6) return jsonResponse(false, 'Senha deve ter no mínimo 6 caracteres');
  if (novaSenha.length > 128) return jsonResponse(false, 'Senha muito longa');
  if (isRateLimited('reset_' + email, 3, 600)) { return jsonResponse(false, 'Muitas solicitações. Aguarde alguns minutos.'); }
  try {
    var alunosSheet = getSheet('Alunos'); var alunosData = alunosSheet.getDataRange().getValues();
    var nome = '', found = false;
    for (var i = 1; i < alunosData.length; i++) { if (alunosData[i][0] && alunosData[i][0].toString().trim().toLowerCase() === email) { nome = alunosData[i][1] ? alunosData[i][1].toString() : 'Aluno'; found = true; break; } }
    if (!found) return jsonResponse(true, 'Se o email estiver cadastrado, a solicitação será enviada ao Professor.');
    var resetSheet;
    try { resetSheet = getSheet('SenhaReset'); } catch (e) { var ss = _getSpreadsheet(); resetSheet = ss.insertSheet('SenhaReset'); resetSheet.appendRow(['Email', 'Nome', 'NovaSenhaHash', 'Status', 'Data']); }
    var resetData = resetSheet.getDataRange().getValues();
    for (var j = 1; j < resetData.length; j++) {
      var rEmail = resetData[j][0] ? resetData[j][0].toString().trim().toLowerCase() : '';
      var rStatus = resetData[j][3] ? resetData[j][3].toString().toUpperCase().trim() : '';
      if (rEmail === email && rStatus === 'PENDENTE') { resetSheet.getRange(j + 1, 3).setValue(hashPassword(novaSenha)); resetSheet.getRange(j + 1, 5).setValue(new Date()); return jsonResponse(true, 'Solicitação de nova senha atualizada! Aguarde o Professor aprovar.'); }
    }
    resetSheet.appendRow([email, nome, hashPassword(novaSenha), 'PENDENTE', new Date()]);
    return jsonResponse(true, 'Solicitação enviada! O Professor irá avaliar e aprovar sua nova senha.');
  } catch (error) { Logger.log('Erro requestPasswordReset: ' + error.message); return errorResponse('Erro ao solicitar reset'); }
}

function handleGetPendingResets(data) {
  var adminEmail = requireProfessorOrAdmin(data); if (!adminEmail) return forbiddenResponse();
  try {
    var resetSheet; try { resetSheet = getSheet('SenhaReset'); } catch (e) { return ContentService.createTextOutput(JSON.stringify({ success: true, resets: [] })).setMimeType(ContentService.MimeType.JSON); }
    var rows = resetSheet.getDataRange().getValues(); var resets = [];
    for (var i = 1; i < rows.length; i++) { var status = rows[i][3] ? rows[i][3].toString().toUpperCase().trim() : ''; if (status !== 'PENDENTE') continue; resets.push({ email: rows[i][0] ? rows[i][0].toString() : '', name: rows[i][1] ? rows[i][1].toString() : 'Aluno', data: rows[i][4] ? formatDate(rows[i][4]) : '' }); }
    return ContentService.createTextOutput(JSON.stringify({ success: true, resets: resets })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) { return errorResponse('Erro ao listar resets'); }
}

function handleApprovePasswordReset(data) {
  var adminEmail = requireProfessorOrAdmin(data); if (!adminEmail) return forbiddenResponse();
  if (!data.email) return jsonResponse(false, 'Email obrigatório');
  var email = data.email.toString().trim().toLowerCase();
  try {
    var resetSheet = getSheet('SenhaReset'); var resetData = resetSheet.getDataRange().getValues();
    var novoHash = '', resetRow = -1;
    for (var i = 1; i < resetData.length; i++) { var rEmail = resetData[i][0] ? resetData[i][0].toString().trim().toLowerCase() : ''; var rStatus = resetData[i][3] ? resetData[i][3].toString().toUpperCase().trim() : ''; if (rEmail === email && rStatus === 'PENDENTE') { novoHash = resetData[i][2] ? resetData[i][2].toString() : ''; resetRow = i; break; } }
    if (resetRow < 0) return jsonResponse(false, 'Solicitação não encontrada');
    if (!novoHash) return jsonResponse(false, 'Hash de senha inválido');
    var alunosSheet = getSheet('Alunos'); var alunosData = alunosSheet.getDataRange().getValues(); var updated = false;
    for (var j = 1; j < alunosData.length; j++) { if (alunosData[j][0] && alunosData[j][0].toString().trim().toLowerCase() === email) { alunosSheet.getRange(j + 1, 6).setValue(novoHash); updated = true; break; } }
    if (!updated) return jsonResponse(false, 'Aluno não encontrado');
    _archiveResetRow(resetSheet, resetRow, 'APROVADO', adminEmail);
    return jsonResponse(true, 'Senha de ' + email + ' atualizada!');
  } catch (error) { return errorResponse('Erro ao aprovar reset'); }
}

function handleRejectPasswordReset(data) {
  var adminEmail = requireProfessorOrAdmin(data); if (!adminEmail) return forbiddenResponse();
  if (!data.email) return jsonResponse(false, 'Email obrigatório');
  var email = data.email.toString().trim().toLowerCase();
  try {
    var resetSheet = getSheet('SenhaReset'); var resetData = resetSheet.getDataRange().getValues();
    for (var i = 1; i < resetData.length; i++) { var rEmail = resetData[i][0] ? resetData[i][0].toString().trim().toLowerCase() : ''; var rStatus = resetData[i][3] ? resetData[i][3].toString().toUpperCase().trim() : ''; if (rEmail === email && rStatus === 'PENDENTE') { _archiveResetRow(resetSheet, i, 'REJEITADO', adminEmail); return jsonResponse(true, 'Solicitação de reset rejeitada.'); } }
    return jsonResponse(false, 'Solicitação não encontrada');
  } catch (error) { return errorResponse('Erro ao rejeitar reset'); }
}

// ============================================================
// ===== ARCHIVE HELPERS =====
// ============================================================

function _archivePendingRow(pendingSheet, rowIndex, status, adminEmail) {
  try {
    var ss = _getSpreadsheet();
    var histSheet = ss.getSheetByName('PendingAccounts_Hist');
    if (!histSheet) { histSheet = ss.insertSheet('PendingAccounts_Hist'); var header = pendingSheet.getRange(1, 1, 1, pendingSheet.getLastColumn()).getValues()[0]; header.push('Status_Final', 'Data_Processado', 'Processado_Por'); histSheet.appendRow(header); histSheet.getRange(1, 1, 1, histSheet.getLastColumn()).setFontWeight('bold'); }
    var rowData = pendingSheet.getRange(rowIndex + 1, 1, 1, pendingSheet.getLastColumn()).getValues()[0];
    rowData.push(status, new Date(), adminEmail);
    histSheet.appendRow(rowData);
    pendingSheet.deleteRow(rowIndex + 1);
  } catch(e) {
    Logger.log('Erro _archivePendingRow: ' + e.message);
    try { pendingSheet.getRange(rowIndex + 1, 8).setValue(status); pendingSheet.getRange(rowIndex + 1, 10).setValue(new Date()); pendingSheet.getRange(rowIndex + 1, 11).setValue(adminEmail); } catch(e2) {}
  }
}

function _archiveResetRow(resetSheet, rowIndex, status, adminEmail) {
  try {
    var ss = _getSpreadsheet();
    var histSheet = ss.getSheetByName('SenhaReset_Hist');
    if (!histSheet) { histSheet = ss.insertSheet('SenhaReset_Hist'); histSheet.appendRow(['Email', 'Nome', 'NovaSenhaHash', 'Status', 'Data', 'Status_Final', 'Data_Processado', 'Processado_Por']); histSheet.getRange(1, 1, 1, 8).setFontWeight('bold'); }
    var rowData = resetSheet.getRange(rowIndex + 1, 1, 1, resetSheet.getLastColumn()).getValues()[0];
    rowData.push(status, new Date(), adminEmail);
    histSheet.appendRow(rowData);
    resetSheet.deleteRow(rowIndex + 1);
  } catch(e) {
    Logger.log('Erro _archiveResetRow: ' + e.message);
    try { resetSheet.getRange(rowIndex + 1, 4).setValue(status); } catch(e2) {}
  }
}


function normalizePhone(phone) {
  if (!phone) return '';
  var digits = phone.toString().replace(/\D/g, '');
  if (digits.length >= 12 && digits.substring(0, 2) === '55') digits = digits.substring(2);
  if (digits.length === 10) digits = digits.substring(0, 2) + '9' + digits.substring(2);
  return digits;
}

function handleSolicitarPresencaEsquecimento(data) {
  var authEmail = requireAuth(data);
  if (!authEmail) return unauthorizedResponse();
  var dataAula = (data.dataAula || '').toString().trim();
  var horario  = (data.horario  || '').toString().trim();
  var obs      = cleanField(data.observacao || '', MAX_FIELD_LENGTH);
  if (!dataAula) return jsonResponse(false, 'Data da aula é obrigatória');
  if (!horario)  return jsonResponse(false, 'Horário é obrigatório');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataAula)) return jsonResponse(false, 'Formato de data inválido');
  var hoje = new Date();
  var hojeStr = Utilities.formatDate(hoje, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  if (dataAula > hojeStr) return jsonResponse(false, 'Não é possível solicitar presença para uma data futura');
  var dataObj = new Date(dataAula + 'T12:00:00');
  var diffDays = Math.floor((hoje - dataObj) / (1000 * 60 * 60 * 24));
  if (diffDays > 30) return jsonResponse(false, 'Não é possível solicitar presença com mais de 30 dias de atraso');
  try {
    var alunosSheet = getSheet('Alunos'); var aRows = alunosSheet.getDataRange().getValues();
    var nome = '', faixa = '', grau = 0, ct = '';
    for (var a = 1; a < aRows.length; a++) {
      if (!aRows[a][0]) continue;
      if (aRows[a][0].toString().trim().toLowerCase() === authEmail) { nome = aRows[a][1] ? aRows[a][1].toString() : ''; faixa = aRows[a][2] ? aRows[a][2].toString() : 'Branca'; grau = aRows[a][3] !== undefined ? parseInt(aRows[a][3]) || 0 : 0; ct = aRows[a][4] ? aRows[a][4].toString().trim() : ''; break; }
    }
    if (!nome) return jsonResponse(false, 'Aluno não encontrado');
    var presencaSheet = getSheet('Presenca'); var pRows = presencaSheet.getDataRange().getValues();
    for (var i = 1; i < pRows.length; i++) {
      if (!pRows[i][0]) continue;
      if (pRows[i][0].toString().trim().toLowerCase() !== authEmail) continue;
      var pStatus = getPresencaStatus(pRows[i]); if (pStatus === 'REJEITADO') continue;
      var pDateVal = pRows[i][6]; var pDateStr = '';
      if (pDateVal instanceof Date) { pDateStr = Utilities.formatDate(pDateVal, Session.getScriptTimeZone(), 'yyyy-MM-dd'); }
      else if (pDateVal) { var s = pDateVal.toString().trim(); pDateStr = s.length >= 10 ? s.substring(0, 10) : s; }
      if (pDateStr === dataAula) { var statusLabel = pStatus === 'APROVADO' ? 'aprovada' : 'pendente de aprovação'; return jsonResponse(false, 'Você já possui uma presença ' + statusLabel + ' para este dia.'); }
    }
    var dataObj2 = new Date(dataAula + 'T12:00:00');
    var horaRegisto = Utilities.formatDate(hoje, Session.getScriptTimeZone(), 'HH:mm');
    var notaObs = 'Solicitação manual' + (obs ? ': ' + obs : '');
    var modVal = data.modalidade ? data.modalidade.toString().trim().toLowerCase() : '';
    presencaSheet.appendRow([authEmail, nome, faixa, grau, ct, horario, dataObj2, horaRegisto, 'PENDENTE', notaObs, modVal]);
    return jsonResponse(true, 'Solicitação enviada! Aguarde a aprovação do professor.');
  } catch (error) { Logger.log('Erro solicitarPresencaEsquecimento: ' + error.message); return errorResponse('Erro ao enviar solicitação'); }
}

function handleGetAulasHoje(data) {
  var ctsSheet = getSheet('CTs'); var ctsData = ctsSheet.getDataRange().getValues();
  var now = new Date(); var dayOfWeek = now.getDay();
  var dayColMap = [8, 2, 3, 4, 5, 6, 7]; var diaColIdx = dayColMap[dayOfWeek];
  var DAY_NAMES = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  var hojeDia = DAY_NAMES[dayOfWeek];
  var ctFilter = (data.ct && data.ct.toString().trim()) ? data.ct.toString().trim().toLowerCase() : '';
  var aulas = [];
  for (var i = 1; i < ctsData.length; i++) {
    if (!ctsData[i][0]) continue;
    if (ctsData[i][1] !== true && ctsData[i][1] !== 'TRUE') continue;
    var ctName = ctsData[i][0].toString().trim();
    if (ctFilter) { var ctLower = ctName.toLowerCase(); var ctClean2 = ctLower.replace(/^ct\s*/i, ''); var filterClean = ctFilter.replace(/^ct\s*/i, ''); if (ctLower.indexOf(filterClean) === -1 && ctClean2.indexOf(filterClean) === -1) continue; }
    var temConfig = false;
    for (var dc = 2; dc <= 8; dc++) { if (ctsData[i][dc] === true || ctsData[i][dc] === 'TRUE') { temConfig = true; break; } }
    if (temConfig) { var diaAtivo = ctsData[i][diaColIdx]; if (diaAtivo !== true && diaAtivo !== 'TRUE') { if (!ctFilter) continue; } }
    var horarios = getHorariosHoje(ctsData[i][10]);
    if (horarios) { var horasArr = horarios.split(','); for (var h = 0; h < horasArr.length; h++) { var hora = horasArr[h].trim(); if (hora) aulas.push({ ct: ctName, dia: hojeDia, horario: hora, temAulaHoje: (ctsData[i][diaColIdx] === true || ctsData[i][diaColIdx] === 'TRUE') }); } }
    else { aulas.push({ ct: ctName, dia: hojeDia, horario: 'Horário a confirmar', temAulaHoje: (ctsData[i][diaColIdx] === true || ctsData[i][diaColIdx] === 'TRUE') }); }
  }
  if (aulas.length === 0) return ContentService.createTextOutput(JSON.stringify({ success: false, message: '😴 *' + hojeDia + '* — Sem aulas programadas para hoje.', aulas: [] })).setMimeType(ContentService.MimeType.JSON);
  return ContentService.createTextOutput(JSON.stringify({ success: true, aulas: aulas, dia: hojeDia })).setMimeType(ContentService.MimeType.JSON);
}


// ============================================================
// ===== WHATSAPP CHECK-IN =====
// ============================================================

function handleWhatsAppCheckin(data) {
  if (!data.phone) return jsonResponse(false, '❌ Telefone não informado');
  var phoneNorm = normalizePhone(data.phone);
  if (isRateLimited('wa_' + phoneNorm, 5, 60)) return jsonResponse(false, '⏳ Muitas tentativas. Aguarde 1 minuto.');
  var lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch (e) { return jsonResponse(false, '⏳ Servidor ocupado, tente de novo'); }
  try {
    if (phoneNorm.length < 10) { lock.releaseLock(); return jsonResponse(false, '❌ Número de telefone inválido'); }
    var alunosSheet = getSheet('Alunos'); var alunosData = alunosSheet.getDataRange().getValues();
    var foundEmail = '', studentName = '', studentFaixa = '', studentGrau = '', studentCT = '';
    for (var i = 1; i < alunosData.length; i++) {
      if (!alunosData[i][0]) continue;
      var alunoPhone = alunosData[i][12]; if (!alunoPhone) continue;
      if (normalizePhone(alunoPhone) === phoneNorm) { foundEmail = alunosData[i][0].toString().trim().toLowerCase(); studentName = alunosData[i][1] ? alunosData[i][1].toString() : 'Aluno'; studentFaixa = alunosData[i][2] ? alunosData[i][2].toString() : 'Branca'; studentGrau = alunosData[i][3] ? alunosData[i][3].toString() : '0'; studentCT = alunosData[i][4] ? alunosData[i][4].toString() : ''; break; }
    }
    if (!foundEmail) { lock.releaseLock(); return jsonResponse(false, '❌ Número não cadastrado. Cadastre seu telefone no perfil do app primeiro!'); }
    var ctInput = (data.ct && data.ct.toString().trim()) ? cleanField(data.ct, 100) : '';
    var usandoHomeCT = false;
    if (!ctInput) { if (!studentCT) { lock.releaseLock(); return jsonResponse(false, '❌ *' + studentName + '*, você não tem CT cadastrado no perfil.\n\nUse: /treinei Nome do CT\nOu cadastre seu CT no app.'); } ctInput = studentCT; usandoHomeCT = true; }
    var ctsSheet = getSheet('CTs'); var ctsData = ctsSheet.getDataRange().getValues();
    var matchedCT = ''; var ctInputLower = ctInput.toLowerCase();
    for (var c = 1; c < ctsData.length; c++) {
      if (!ctsData[c][0]) continue; if (ctsData[c][1] !== true && ctsData[c][1] !== 'TRUE') continue;
      var ctName = ctsData[c][0].toString().trim(); var ctNameLower = ctName.toLowerCase();
      if (ctNameLower === ctInputLower) { matchedCT = ctName; break; }
      if (ctNameLower.indexOf(ctInputLower) !== -1 || ctInputLower.indexOf(ctNameLower.replace('ct ','')) !== -1) { matchedCT = ctName; break; }
    }
    if (!matchedCT) {
      var ctClean = ctInputLower.replace(/^ct\s*/i, '');
      for (var c2 = 1; c2 < ctsData.length; c2++) { if (!ctsData[c2][0]) continue; if (ctsData[c2][1] !== true && ctsData[c2][1] !== 'TRUE') continue; var ctName2 = ctsData[c2][0].toString().trim(); var ctName2Clean = ctName2.toLowerCase().replace(/^ct\s*/i, ''); if (ctName2Clean.indexOf(ctClean) !== -1 || ctClean.indexOf(ctName2Clean) !== -1) { matchedCT = ctName2; break; } }
    }
    if (!matchedCT) {
      lock.releaseLock();
      var ctNomes = []; for (var cn = 1; cn < ctsData.length; cn++) { if (ctsData[cn][0] && (ctsData[cn][1] === true || ctsData[cn][1] === 'TRUE')) ctNomes.push(ctsData[cn][0].toString().trim()); }
      return jsonResponse(false, '❌ CT "' + ctInput + '" não encontrado.\n\nCTs disponíveis:\n' + ctNomes.join('\n'));
    }
    var presencaSheet = getSheet('Presenca');
    var now = new Date(); var hora = ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2);
    var dayMap = [8, 2, 3, 4, 5, 6, 7]; var diaPermitido = true; var diaSemanaIdx = dayMap[now.getDay()]; var ctHorarios = '';
    for (var d = 1; d < ctsData.length; d++) {
      if (ctsData[d][0] && ctsData[d][0].toString().trim() === matchedCT) {
        var temConfig = false; for (var dc = 2; dc <= 8; dc++) { if (ctsData[d][dc] === true || ctsData[d][dc] === 'TRUE') { temConfig = true; break; } }
        if (temConfig) { var valDia = ctsData[d][diaSemanaIdx]; diaPermitido = (valDia === true || valDia === 'TRUE'); }
        ctHorarios = getHorariosHoje(ctsData[d][10]); break;
      }
    }
    var presencaData = presencaSheet.getDataRange().getValues();
    // FIX #4 -- extrai modalidade do payload ou do cadastro do aluno
    var waModalidade = data.modalidade ? data.modalidade.toString().trim().toLowerCase() : '';
    if (!waModalidade) {
      for (var mi = 1; mi < alunosData.length; mi++) {
        if (alunosData[mi][0] && alunosData[mi][0].toString().trim().toLowerCase() === foundEmail) {
          waModalidade = alunosData[mi][32] ? alunosData[mi][32].toString().trim().toLowerCase() : '';
          break;
        }
      }
    }
    var dupCheck = checkDuplicateByWindow(presencaData, foundEmail, ctHorarios, waModalidade);
    if (dupCheck.duplicado) {
      lock.releaseLock();
      var totalExisting = 0;
      for (var te = 1; te < presencaData.length; te++) { if (!presencaData[te][0]) continue; if (presencaData[te][0].toString().trim().toLowerCase() === foundEmail && getPresencaStatus(presencaData[te]) === 'APROVADO') totalExisting++; }
      var dupMsg = '✅ *' + studentName + '*, você já fez check-in hoje!\n\n💪 Total: *' + totalExisting + ' treinos*\n\nSua presença já está registrada. Ossú! 🤙';
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: dupMsg, status: 'JA_REGISTRADO', name: studentName, ct: matchedCT, treinos: totalExisting, source: 'whatsapp' })).setMimeType(ContentService.MimeType.JSON);
    }
    var statusCheckin = (!diaPermitido) ? 'PENDENTE' : 'APROVADO';
    // FIX #4b -- salva modalidade na col K (Presenca sheet)
    presencaSheet.appendRow([foundEmail, studentName, studentFaixa, studentGrau, matchedCT, hora, now, hora, statusCheckin, 'WhatsApp', waModalidade]);
    lock.releaseLock();
    var totalTreinos = 0;
    for (var t = 1; t < presencaData.length; t++) { if (!presencaData[t][0]) continue; if (presencaData[t][0].toString().trim().toLowerCase() === foundEmail && getPresencaStatus(presencaData[t]) === 'APROVADO') totalTreinos++; }
    if (statusCheckin === 'APROVADO') totalTreinos++;
    var DAY_LABELS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']; var hojeDia = DAY_LABELS[now.getDay()];
    var replyMsg = (statusCheckin === 'PENDENTE')
      ? '⚠️ *' + studentName + '*, hoje (' + hojeDia + ') não é dia de treino no *' + matchedCT + '*.\n\nSeu check-in ficou _pendente_.'
      : '✅ *Presença registrada!*\n\n🥋 *' + studentName + '*\n📍 ' + matchedCT + (usandoHomeCT ? ' 🏠' : ' 🌍') + '\n🕐 ' + hora + '\n💪 Total: *' + totalTreinos + ' treinos*\n\nOssú! 🤙';
    return ContentService.createTextOutput(JSON.stringify({ success: true, message: replyMsg, status: statusCheckin, name: studentName, ct: matchedCT, treinos: totalTreinos, source: 'whatsapp' })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) { try { lock.releaseLock(); } catch(e2) {} Logger.log('Erro whatsappCheckin: ' + error.message); return errorResponse('Erro no sistema'); }
}


// ============================================================
// ===== CAMPEONATO =====
// ============================================================

function handleSaveChampions(data) {
  var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  if (!data.champions || !Array.isArray(data.champions)) return jsonResponse(false, 'Dados inválidos');
  try {
    var ss = _getSpreadsheet(); var sheet = ss.getSheetByName('Campeoes');
    if (!sheet) { sheet = ss.insertSheet('Campeoes'); sheet.appendRow(['Edicao', 'Tipo', 'NomeCampeao', 'CT', 'Faixa', 'Data', 'Categoria']); }
    var now2 = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy');
    for (var i = 0; i < data.champions.length; i++) { var c = data.champions[i]; if (!c.nome || !c.tipo || !c.edicao) continue; sheet.appendRow([cleanField(c.edicao, 100), cleanField(c.tipo, 50), cleanField(c.nome, MAX_NAME_LENGTH), cleanField(c.ct, 100), cleanField(c.faixa, 30), now2, cleanField(c.categoria || 'Masculino', 30)]); }
    return jsonResponse(true, 'Campeões cadastrados!');
  } catch (error) { return errorResponse('Erro ao salvar campeões'); }
}

function handleGetChampions() {
  try {
    var ss = _getSpreadsheet(); var sheet = ss.getSheetByName('Campeoes');
    if (!sheet) return ContentService.createTextOutput(JSON.stringify({ success: true, champions: [] })).setMimeType(ContentService.MimeType.JSON);
    var rows = sheet.getDataRange().getValues(); var champions = [];
    for (var i = 1; i < rows.length; i++) { if (!rows[i][0] && !rows[i][2]) continue; champions.push({ rowIndex: i + 1, edicao: rows[i][0] ? rows[i][0].toString() : '', tipo: rows[i][1] ? rows[i][1].toString() : '', nome: rows[i][2] ? rows[i][2].toString() : '', ct: rows[i][3] ? rows[i][3].toString() : '', faixa: rows[i][4] ? rows[i][4].toString() : '', data: rows[i][5] ? rows[i][5].toString() : '', categoria: rows[i][6] ? rows[i][6].toString() : 'Masculino' }); }
    champions.sort(function(a, b) { return b.edicao.localeCompare(a.edicao); });
    return ContentService.createTextOutput(JSON.stringify({ success: true, champions: champions })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) { return errorResponse('Erro ao listar campeões'); }
}

function handleDeleteChampion(data) {
  var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  if (!data.rowIndex) return jsonResponse(false, 'Linha não informada');
  try { var ss = _getSpreadsheet(); var sheet = ss.getSheetByName('Campeoes'); if (!sheet) return jsonResponse(false, 'Sheet não encontrada'); var row = parseInt(data.rowIndex); if (row < 2 || row > sheet.getLastRow()) return jsonResponse(false, 'Linha inválida'); sheet.deleteRow(row); return jsonResponse(true, 'Campeão removido!'); }
  catch (error) { return errorResponse('Erro ao deletar campeão'); }
}

function handleUpdateChampion(data) {
  var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  if (!data.rowIndex) return jsonResponse(false, 'Linha não informada');
  try {
    var ss = _getSpreadsheet(); var sheet = ss.getSheetByName('Campeoes'); if (!sheet) return jsonResponse(false, 'Sheet não encontrada');
    var row = parseInt(data.rowIndex); if (row < 2 || row > sheet.getLastRow()) return jsonResponse(false, 'Linha inválida');
    if (data.edicao !== undefined) sheet.getRange(row, 1).setValue(cleanField(data.edicao, 100));
    if (data.tipo !== undefined) sheet.getRange(row, 2).setValue(cleanField(data.tipo, 50));
    if (data.nome !== undefined) sheet.getRange(row, 3).setValue(cleanField(data.nome, MAX_NAME_LENGTH));
    if (data.ct !== undefined) sheet.getRange(row, 4).setValue(cleanField(data.ct, 100));
    if (data.faixa !== undefined) sheet.getRange(row, 5).setValue(cleanField(data.faixa, 30));
    if (data.categoria !== undefined) sheet.getRange(row, 7).setValue(cleanField(data.categoria, 30));
    return jsonResponse(true, 'Campeão atualizado!');
  } catch (error) { return errorResponse('Erro ao atualizar campeão'); }
}

function handleSaveCampPlacar(data) {
  var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  if (!data.edicao || !data.placar || !Array.isArray(data.placar)) return jsonResponse(false, 'Dados inválidos');
  try {
    var ss = _getSpreadsheet(); var sheet = ss.getSheetByName('CampPlacar');
    if (!sheet) { sheet = ss.insertSheet('CampPlacar'); sheet.appendRow(['Edicao', 'Email', 'Nome', 'CT', 'Faixa', 'Borrachinhas', 'Categoria']); }
    var edicao = cleanField(data.edicao, 100); var rows = sheet.getDataRange().getValues();
    for (var p = 0; p < data.placar.length; p++) {
      var entry = data.placar[p]; if (!entry.nome) continue;
      var email = entry.email ? entry.email.toString().trim().toLowerCase() : '';
      var categoria = cleanField(entry.categoria || 'Masculino', 30); var found = false;
      for (var i = 1; i < rows.length; i++) { var rowEdicao = rows[i][0] ? rows[i][0].toString().trim() : ''; var rowEmail = rows[i][1] ? rows[i][1].toString().trim().toLowerCase() : ''; var rowCat = rows[i][6] ? rows[i][6].toString().trim() : 'Masculino'; if (rowEdicao === edicao && rowEmail === email && email !== '' && rowCat === categoria) { sheet.getRange(i + 1, 6).setValue(parseInt(entry.borrachinhas) || 0); sheet.getRange(i + 1, 3).setValue(cleanField(entry.nome, MAX_NAME_LENGTH)); sheet.getRange(i + 1, 4).setValue(cleanField(entry.ct, 100)); sheet.getRange(i + 1, 5).setValue(cleanField(entry.faixa, 30)); sheet.getRange(i + 1, 7).setValue(categoria); found = true; break; } }
      if (!found) { sheet.appendRow([edicao, email, cleanField(entry.nome, MAX_NAME_LENGTH), cleanField(entry.ct, 100), cleanField(entry.faixa, 30), parseInt(entry.borrachinhas) || 0, categoria]); rows = sheet.getDataRange().getValues(); }
    }
    return jsonResponse(true, 'Placar atualizado!');
  } catch (error) { return errorResponse('Erro ao salvar placar'); }
}

function handleGetCampPlacar(data) {
  try {
    var ss = _getSpreadsheet(); var sheet = ss.getSheetByName('CampPlacar');
    if (!sheet) return ContentService.createTextOutput(JSON.stringify({ success: true, placar: [], edicoes: [], cts: [] })).setMimeType(ContentService.MimeType.JSON);
    var rows = sheet.getDataRange().getValues(); var placar = [], edicoesMap = {}, ctsMap = {};
    var filterEdicao = data.edicao ? data.edicao.toString().trim() : ''; var filterCT = data.ct ? data.ct.toString().trim() : ''; var filterCat = data.categoria ? data.categoria.toString().trim() : '';
    for (var i = 1; i < rows.length; i++) { if (!rows[i][0]) continue; var edicao = rows[i][0].toString().trim(); var ct = rows[i][3] ? rows[i][3].toString().trim() : ''; var categoria = rows[i][6] ? rows[i][6].toString().trim() : 'Masculino'; edicoesMap[edicao] = true; if (edicao === filterEdicao || !filterEdicao) { if (ct) ctsMap[ct] = true; } if (filterEdicao && edicao !== filterEdicao) continue; if (filterCT && ct !== filterCT) continue; if (filterCat && categoria !== filterCat) continue; placar.push({ edicao: edicao, email: rows[i][1] ? rows[i][1].toString().trim() : '', nome: rows[i][2] ? rows[i][2].toString().trim() : '', ct: ct, faixa: rows[i][4] ? rows[i][4].toString().trim() : '', borrachinhas: parseInt(rows[i][5]) || 0, categoria: categoria }); }
    placar.sort(function(a, b) { return b.borrachinhas - a.borrachinhas; });
    return ContentService.createTextOutput(JSON.stringify({ success: true, placar: placar, edicoes: Object.keys(edicoesMap).sort().reverse(), cts: Object.keys(ctsMap).sort() })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) { return errorResponse('Erro ao buscar placar'); }
}

// ============================================================
// ===== CAMPEONATO INSCRIÇÕES =====
// ============================================================

var CAMP_INSC_HEADERS = ['Email', 'Nome', 'CT', 'Faixa', 'Edicao', 'DataInscricao', 'Status', 'AprovadoPor', 'AprovadoEm'];

function getOrCreateCampInscSheet() { var ss = _getSpreadsheet(); var sheet = ss.getSheetByName('CampInscricoes'); if (!sheet) { sheet = ss.insertSheet('CampInscricoes'); sheet.appendRow(CAMP_INSC_HEADERS); } return sheet; }
function getOrCreateCampConfigSheet() { var ss = _getSpreadsheet(); var sheet = ss.getSheetByName('CampConfig'); if (!sheet) { sheet = ss.insertSheet('CampConfig'); sheet.appendRow(['Edicao', 'CT', 'DataEvento', 'Valor', 'ChavePix', 'Observacoes', 'Ativo', 'CriadoPor', 'CriadoEm']); } return sheet; }

function handleSaveCampEvento(data) {
  try {
    var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse();
    var edicao = (data.edicao || '').trim(); var ct = (data.ct || '').trim(); var dataEvento = (data.dataEvento || '').trim(); var valor = data.valor || 100; var chavePix = (data.chavePix || '').trim(); var obs = (data.observacoes || '').trim(); var ativo = data.ativo !== false;
    if (!edicao || !ct || !dataEvento) return jsonResponse(false, 'Edição, CT e data obrigatórios');
    var sheet = getOrCreateCampConfigSheet(); var rows = sheet.getDataRange().getValues(); var found = false;
    for (var i = 1; i < rows.length; i++) { if (rows[i][0] && rows[i][0].toString().trim() === edicao && rows[i][1] && rows[i][1].toString().trim() === ct) { sheet.getRange(i+1,3).setValue(dataEvento); sheet.getRange(i+1,4).setValue(valor); sheet.getRange(i+1,5).setValue(chavePix); sheet.getRange(i+1,6).setValue(obs); sheet.getRange(i+1,7).setValue(ativo ? 'SIM' : 'NAO'); found = true; break; } }
    if (!found) sheet.appendRow([edicao, ct, dataEvento, valor, chavePix, obs, ativo ? 'SIM' : 'NAO', adminEmail, new Date()]);
    return jsonResponse(true, 'Evento salvo para ' + ct + '!');
  } catch (e) { return jsonResponse(false, 'Erro: ' + e.message); }
}

function handleGetCampEvento(data) {
  try {
    var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
    var studentCT = '';
    var alunosSheet = _getSpreadsheet().getSheetByName('Alunos'); var aRows = alunosSheet.getDataRange().getValues();
    for (var a = 1; a < aRows.length; a++) { if (aRows[a][0] && aRows[a][0].toString().trim().toLowerCase() === authEmail) { studentCT = aRows[a][4] ? aRows[a][4].toString().trim() : ''; break; } }
    var filterCT = (data.ct || '').trim() || studentCT;
    var sheet; try { sheet = getOrCreateCampConfigSheet(); } catch(e) { return ContentService.createTextOutput(JSON.stringify({success:true,evento:null,eventos:[]})).setMimeType(ContentService.MimeType.JSON); }
    var rows = sheet.getDataRange().getValues(); var allEventos = [], evento = null;
    for (var i = 1; i < rows.length; i++) { if (!rows[i][0]) continue; var isAtivo = rows[i][6] && rows[i][6].toString().toUpperCase() === 'SIM'; var evtCT = rows[i][1] ? rows[i][1].toString().trim() : ''; if (isAtivo) { var evt = { edicao: rows[i][0]||'', ct: evtCT, dataEvento: rows[i][2]||'', valor: rows[i][3]||100, chavePix: rows[i][4]||'', observacoes: rows[i][5]||'' }; allEventos.push(evt); if (filterCT && evtCT === filterCT) evento = evt; } }
    var inscrito = null;
    if (evento) { try { var inscSheet = getOrCreateCampInscSheet(); var inscRows = inscSheet.getDataRange().getValues(); for (var j = 1; j < inscRows.length; j++) { if (inscRows[j][0] && inscRows[j][0].toString().trim().toLowerCase() === authEmail && inscRows[j][4] && inscRows[j][4].toString().trim() === evento.edicao) { inscrito = { status: inscRows[j][6] || 'PENDENTE', data: inscRows[j][5] || '' }; break; } } } catch(e2) {} }
    return ContentService.createTextOutput(JSON.stringify({ success:true, evento:evento, inscrito:inscrito, eventos:allEventos, studentCT:studentCT })).setMimeType(ContentService.MimeType.JSON);
  } catch (e) { return jsonResponse(false, 'Erro: ' + e.message); }
}

function handleInscricaoCamp(data) {
  try {
    var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
    var edicao = (data.edicao || '').trim(); if (!edicao) return jsonResponse(false, 'Edição não informada');
    var sheet = getOrCreateCampInscSheet(); var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) { if (rows[i][0] && rows[i][0].toString().trim().toLowerCase() === authEmail && rows[i][4] && rows[i][4].toString().trim() === edicao) return jsonResponse(false, 'Você já confirmou pagamento para esta edição. Status: ' + (rows[i][6] || 'PENDENTE')); }
    var alunosSheet = _getSpreadsheet().getSheetByName('Alunos'); var aData = alunosSheet.getDataRange().getValues(); var nome = '', ct = '', faixa = '';
    for (var a = 1; a < aData.length; a++) { if (aData[a][0] && aData[a][0].toString().trim().toLowerCase() === authEmail) { nome = aData[a][1] ? aData[a][1].toString() : ''; faixa = aData[a][2] ? aData[a][2].toString() : ''; ct = aData[a][4] ? aData[a][4].toString() : ''; break; } }
    sheet.appendRow([authEmail, nome, ct, faixa, edicao, new Date(), 'PENDENTE', '', '']);
    return jsonResponse(true, 'Pagamento confirmado! Envie o comprovante ao professor via WhatsApp. Status: PENDENTE até aprovação.');
  } catch (e) { return jsonResponse(false, 'Erro: ' + e.message); }
}

function handleGetInscricoesCamp(data) {
  try {
    var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse();
    var edicao = (data.edicao || '').trim();
    var sheet; try { sheet = getOrCreateCampInscSheet(); } catch(e) { return ContentService.createTextOutput(JSON.stringify({success:true,inscricoes:[]})).setMimeType(ContentService.MimeType.JSON); }
    var rows = sheet.getDataRange().getValues(); var result = [];
    for (var i = 1; i < rows.length; i++) { if (!rows[i][0]) continue; if (edicao && rows[i][4] && rows[i][4].toString().trim() !== edicao) continue; result.push({ email:rows[i][0]||'', nome:rows[i][1]||'', ct:rows[i][2]||'', faixa:rows[i][3]||'', edicao:rows[i][4]||'', dataInscricao:rows[i][5]?formatDate(new Date(rows[i][5])):'', status:rows[i][6]||'PENDENTE', aprovadoPor:rows[i][7]||'', aprovadoEm:rows[i][8]?formatDate(new Date(rows[i][8])):'' }); }
    return ContentService.createTextOutput(JSON.stringify({ success:true, inscricoes:result })).setMimeType(ContentService.MimeType.JSON);
  } catch (e) { return jsonResponse(false, 'Erro: ' + e.message); }
}

function handleAprovarInscricao(data) {
  try {
    var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse();
    var email = (data.targetEmail || '').trim().toLowerCase(); var edicao = (data.edicao || '').trim();
    if (!email || !edicao) return jsonResponse(false, 'Email e edição obrigatórios');
    var sheet = getOrCreateCampInscSheet(); var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) { if (rows[i][0] && rows[i][0].toString().trim().toLowerCase() === email && rows[i][4] && rows[i][4].toString().trim() === edicao) { sheet.getRange(i+1,7).setValue('APROVADO'); sheet.getRange(i+1,8).setValue(adminEmail); sheet.getRange(i+1,9).setValue(new Date()); return jsonResponse(true, 'Inscrição aprovada!'); } }
    return jsonResponse(false, 'Inscrição não encontrada');
  } catch (e) { return jsonResponse(false, 'Erro: ' + e.message); }
}

function handleRejeitarInscricao(data) {
  try {
    var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse();
    var email = (data.targetEmail || '').trim().toLowerCase(); var edicao = (data.edicao || '').trim();
    if (!email || !edicao) return jsonResponse(false, 'Email e edição obrigatórios');
    var sheet = getOrCreateCampInscSheet(); var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) { if (rows[i][0] && rows[i][0].toString().trim().toLowerCase() === email && rows[i][4] && rows[i][4].toString().trim() === edicao) { sheet.getRange(i+1,7).setValue('REJEITADO'); sheet.getRange(i+1,8).setValue(adminEmail); sheet.getRange(i+1,9).setValue(new Date()); return jsonResponse(true, 'Inscrição rejeitada'); } }
    return jsonResponse(false, 'Inscrição não encontrada');
  } catch (e) { return jsonResponse(false, 'Erro: ' + e.message); }
}


// ============================================================
// ===== GRADUATION =====
// ============================================================

var GRAD_HEADERS = ['Email', 'Tipo', 'Faixa', 'Grau', 'Data', 'RegistradoPor', 'Obs', 'Status'];

// v4.9 — col I (modalidade) adicionada
function getOrCreateGradSheet() {
  var ss = _getSpreadsheet(); var sheet = ss.getSheetByName('Graduacoes');
  if (!sheet) {
    sheet = ss.insertSheet('Graduacoes');
    sheet.appendRow(['email','tipo','faixaOuNivel','grau','data','adminEmail','obs','status','modalidade']);
    sheet.getRange(1,1,1,9).setFontWeight('bold');
    sheet.autoResizeColumns(1,9);
    return sheet;
  }
  var headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 9)).getValues()[0];
  if (headers.length < 8 || !headers[7]) sheet.getRange(1, 8).setValue('status');
  if (!headers[8]) { sheet.getRange(1, 9).setValue('modalidade'); sheet.getRange(1,9).setFontWeight('bold'); }
  return sheet;
}

function formatDateBR() { var now = new Date(); return ('0'+now.getDate()).slice(-2)+'/'+('0'+(now.getMonth()+1)).slice(-2)+'/'+now.getFullYear(); }
function convertToDateBR(input) { var s = (input||'').toString().trim(); var m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/); if (m) return m[3]+'/'+m[2]+'/'+m[1]; return s; }

function handleAddGraduacao(data) {
  var adminEmail = requireProfessorOrAdmin(data); if (!adminEmail) return forbiddenResponse();
  try {
    var sheet = getOrCreateGradSheet(); var studentEmail = '';
    if (data.rowIndex) {
      var ri = parseInt(data.rowIndex); var row = sheet.getRange(ri, 1, 1, 9).getValues()[0];
      if (!row[0]) return jsonResponse(false, 'Evento não encontrado');
      studentEmail = row[0].toString().trim().toLowerCase();
      // Preserva a data original informada pelo aluno (col 5) — só atualiza aprovador e status
      sheet.getRange(ri, 6).setValue(adminEmail);   // col 6 = aprovadoPor
      sheet.getRange(ri, 8).setValue('APROVADO');    // col 8 = status
      // col 9 = data de aprovação (nova coluna para auditoria)
      sheet.getRange(ri, 10).setValue(formatDateBR());
      syncStudentProfileFromGrad(studentEmail);
      return jsonResponse(true, 'Graduação aprovada! Perfil do aluno atualizado.');
    }
    if (!data.alunoEmail || !data.tipo) return jsonResponse(false, 'Campos obrigatórios: alunoEmail, tipo');
    var validTipos = ['inicio', 'grau', 'faixa', 'nivel']; var tipo = data.tipo.toString().trim().toLowerCase();
    if (validTipos.indexOf(tipo) === -1) return jsonResponse(false, 'Tipo inválido');
    if (tipo === 'faixa') tipo = 'nivel'; // v4.9: normaliza chave legada
    studentEmail = cleanField(data.alunoEmail.toString().trim().toLowerCase(), MAX_EMAIL_LENGTH);
    // v4.9: modId obrigatório para novos registros; fallback para retrocompatibilidade
    var modId = data.modId ? data.modId.toString().trim() : '';
    if (!modId) {
      var aluSh = getSheet('Alunos'); var aluRs = aluSh.getDataRange().getValues();
      for (var aa = 1; aa < aluRs.length; aa++) { if (!aluRs[aa][0]) continue; if (aluRs[aa][0].toString().trim().toLowerCase() === studentEmail) { modId = aluRs[aa][32] ? aluRs[aa][32].toString().trim() : 'bjj_adulto'; break; } }
      modId = modId || 'bjj_adulto';
    }
    // ─ Validação de compatibilidade (admin) ───────────────────────────
    var modInfoAdd = _getModInfo(modId);
    if (modInfoAdd.tipo === 'nenhum' && tipo !== 'inicio') { return jsonResponse(false, 'Modalidade "' + modId + '" não possui sistema de graduação.'); }
    // ─────────────────────────────────────────────────────────
    var nivelVal = cleanField(data.faixa || data.nivel || '', 30);
    var grauVal  = data.grau !== undefined ? parseInt(data.grau) || 0 : 0;
    sheet.appendRow([studentEmail, tipo, nivelVal, grauVal, formatDateBR(), adminEmail, cleanField(data.obs||'',MAX_FIELD_LENGTH), 'APROVADO', modId]);
    syncStudentProfileFromGrad(studentEmail);
    return jsonResponse(true, 'Graduação registrada! Perfil do aluno atualizado.');
  } catch (error) { Logger.log('Erro addGraduacao: ' + error.message); return errorResponse('Erro ao registrar graduação'); }
}

// v4.9 — Sincroniza perfil do aluno respeitando qual modalidade cada evento pertence
function syncStudentProfileFromGrad(email) {
  try {
    var events = getGraduacoesForEmail(email, false); if (events.length === 0) return;
    // Agrupa eventos por modalidade — pega estado mais recente de cada uma
    var gradPorMod = {};
    for (var i = 0; i < events.length; i++) {
      var ev    = events[i];
      var evMod = ev.modalidade || '_legacy';
      if (ev.tipo === 'inicio' || ev.tipo === 'nivel' || ev.tipo === 'grau' || ev.tipo === 'faixa') {
        if (!gradPorMod[evMod]) gradPorMod[evMod] = { nivel: 'Branca', grau: 0 };
        if (ev.nivel || ev.faixa) gradPorMod[evMod].nivel = ev.nivel || ev.faixa;
        if (ev.grau !== undefined) gradPorMod[evMod].grau = ev.grau || 0;
      }
    }
    var alunosSheet = getSheet('Alunos'); var aRows = alunosSheet.getDataRange().getValues();
    for (var a = 1; a < aRows.length; a++) {
      if (!aRows[a][0]) continue;
      if (aRows[a][0].toString().trim().toLowerCase() !== email) continue;
      var principal = aRows[a][32] ? aRows[a][32].toString().trim() : '';
      var grad = _parseModalidadesGrad(aRows[a][33]);
      var modKeys = Object.keys(gradPorMod);
      for (var k = 0; k < modKeys.length; k++) {
        var mk = modKeys[k];
        if (mk === '_legacy') {
          if (principal) { if (!grad[principal]) grad[principal] = {}; grad[principal].nivel = gradPorMod['_legacy'].nivel; grad[principal].faixa = gradPorMod['_legacy'].nivel; grad[principal].grau = gradPorMod['_legacy'].grau; }
        } else {
          if (!grad[mk]) grad[mk] = {};
          var mkInfo = _getModInfo(mk);
          if (mkInfo.tipo === 'prajied') {
            // Muay Thai: preserva estrutura prajied
            grad[mk].nivel      = gradPorMod[mk].nivel;
            grad[mk].faixa      = gradPorMod[mk].faixa || gradPorMod[mk].nivel;
            grad[mk].grau       = gradPorMod[mk].grau;
            grad[mk].cor        = gradPorMod[mk].cor || gradPorMod[mk].nivel;
            grad[mk].nivelLabel = gradPorMod[mk].nivelLabel || '';
          } else if (mkInfo.tipo === 'corda') {
            // Capoeira: preserva estrutura cordão
            grad[mk].nivel      = gradPorMod[mk].nivel;
            grad[mk].faixa      = gradPorMod[mk].faixa || gradPorMod[mk].nivel;
            grad[mk].cordao     = gradPorMod[mk].cordao || gradPorMod[mk].faixa || gradPorMod[mk].nivel;
            grad[mk].grau       = gradPorMod[mk].grau;
            grad[mk].nivelLabel = gradPorMod[mk].nivelLabel || '';
          } else {
            grad[mk].nivel = gradPorMod[mk].nivel; grad[mk].faixa = gradPorMod[mk].nivel; grad[mk].grau = gradPorMod[mk].grau;
          }
        }
      }
      alunosSheet.getRange(a+1,34).setValue(JSON.stringify(grad)); // AH
      if (principal && grad[principal]) {
        alunosSheet.getRange(a+1,3).setValue(grad[principal].nivel || grad[principal].faixa || 'Branca'); // C
        alunosSheet.getRange(a+1,4).setValue(grad[principal].grau || 0); // D
      }
      break;
    }
  } catch (error) { Logger.log('Erro syncStudentProfileFromGrad: ' + error.message); }
}

function handleRejectGraduacao(data) {
  var adminEmail = requireProfessorOrAdmin(data); if (!adminEmail) return forbiddenResponse();
  if (!data.rowIndex) return jsonResponse(false, 'rowIndex obrigatório');
  try { var sheet = getOrCreateGradSheet(); var ri = parseInt(data.rowIndex); sheet.getRange(ri, 8).setValue('REJEITADO'); sheet.getRange(ri, 6).setValue(adminEmail); return jsonResponse(true, 'Solicitação rejeitada'); }
  catch (error) { return errorResponse('Erro ao rejeitar'); }
}

// v4.9 — retorna modalidade em cada item pendente, label correto por tipo
function handleGetPendingGraduacoes(data) {
  var adminEmail = requireProfessorOrAdmin(data); if (!adminEmail) return forbiddenResponse();
  try {
    var ss = _getSpreadsheet(); var gradSheet = ss.getSheetByName('Graduacoes');
    if (!gradSheet) return ContentService.createTextOutput(JSON.stringify({success:true,pending:[]})).setMimeType(ContentService.MimeType.JSON);
    var rows = gradSheet.getDataRange().getValues();
    var alunosSheet = getSheet('Alunos'); var aRows = alunosSheet.getDataRange().getValues();
    var alunoMap = {};
    for (var a = 1; a < aRows.length; a++) { if (!aRows[a][0]) continue; var em2 = aRows[a][0].toString().trim().toLowerCase(); alunoMap[em2] = { nome: aRows[a][1]?aRows[a][1].toString():'', modPrincipal: aRows[a][32]?aRows[a][32].toString().trim():'bjj_adulto' }; }
    var pending = [];
    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0]) continue; var status = rows[i][7] ? rows[i][7].toString().toUpperCase().trim() : ''; if (status !== 'PENDENTE') continue;
      var email2 = rows[i][0].toString().trim().toLowerCase(); var tipo = rows[i][1]?rows[i][1].toString():'';
      var modId2 = rows[i][8] ? rows[i][8].toString().trim() : ((alunoMap[email2]||{}).modPrincipal || 'bjj_adulto');
      var tipoLabel = tipo==='grau'?'Grau':(tipo==='nivel'||tipo==='faixa'?'Nível / Faixa':(tipo==='inicio'?'Início na modalidade':tipo));
      pending.push({ rowIndex:i+1, email:email2, name:(alunoMap[email2]||{}).nome||email2, tipo:tipo, tipoLabel:tipoLabel, faixa:rows[i][2]?rows[i][2].toString():'', nivel:rows[i][2]?rows[i][2].toString():'', grau:rows[i][3]!==undefined?parseInt(rows[i][3])||0:0, data:rows[i][4]?formatDate(rows[i][4]):'', obs:rows[i][6]?rows[i][6].toString():'', modalidade:modId2 });
    }
    return ContentService.createTextOutput(JSON.stringify({success:true,pending:pending})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) { return errorResponse('Erro ao buscar graduações pendentes'); }
}

// v4.9 — passa modId, normaliza tipo 'faixa' → 'nivel'
function handleRequestGraduacao(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  if (!data.tipo) return jsonResponse(false, 'Tipo obrigatório');
  var validTipos = ['grau', 'faixa', 'nivel']; var tipo = data.tipo.toString().trim().toLowerCase();
  if (validTipos.indexOf(tipo) === -1) return jsonResponse(false, 'Alunos só podem solicitar nivel ou grau');
  if (tipo === 'faixa') tipo = 'nivel';
  if (!data.data) return jsonResponse(false, 'Data obrigatória');
  var modId = data.modId ? data.modId.toString().trim() : '';
  // CORREÇÃO v5.0: nunca usar bjj_adulto como fallback silencioso — isso causava mistura de dados.
  // Se modId não veio no payload, lê a modalidade principal do aluno como fallback seguro.
  // Se ainda assim estiver vazio, rejeita (evita sobrescrever jornada de outra modalidade).
  if (!modId) {
    var aluSh2 = getSheet('Alunos'); var aluRs2 = aluSh2.getDataRange().getValues();
    for (var ab = 1; ab < aluRs2.length; ab++) {
      if (!aluRs2[ab][0]) continue;
      if (aluRs2[ab][0].toString().trim().toLowerCase() === authEmail) {
        modId = aluRs2[ab][32] ? aluRs2[ab][32].toString().trim() : '';
        break;
      }
    }
    if (!modId) return jsonResponse(false, 'modalidadeId obrigatória. Selecione uma modalidade no app antes de registrar a graduação.');
  }
  // ─ Validação de compatibilidade: tipo de graduação vs modalidade ────────────
  var modInfoReq = _getModInfo(modId);
  if (modInfoReq.tipo === 'nenhum') { return jsonResponse(false, 'Modalidade "' + modId + '" não possui sistema de graduação.'); }
  if (modInfoReq.tipo === 'prajied' && tipo === 'nivel' && data.faixa) {
    // Valida que o grau está dentro do limite do Prajied
    var grauReq = parseInt(data.grau) || 0;
    if (grauReq < 1 || grauReq > modInfoReq.maxGrau) { return jsonResponse(false, 'Grau Prajied inválido (1-11).'); }
  }
  if (modInfoReq.tipo === 'corda' && tipo === 'nivel') {
    var grauReqC = parseInt(data.grau) || 0;
    if (grauReqC < 1 || grauReqC > modInfoReq.maxGrau) { return jsonResponse(false, 'Cordão inválido para Capoeira (1-12).'); }
  }
  // ─────────────────────────────────────────────────────────
  try {
    var sheet = getOrCreateGradSheet(); var dataBR = convertToDateBR(data.data);
    var nivelVal2 = cleanField(data.faixa || data.nivel || '', 30);
    var grauVal2  = data.grau !== undefined ? parseInt(data.grau) || 0 : 0;
    // ── Salva como PENDENTE — professor precisa aprovar para refletir no perfil ──
    sheet.appendRow([authEmail, tipo, nivelVal2, grauVal2, dataBR, authEmail, cleanField(data.obs||'',MAX_FIELD_LENGTH), 'PENDENTE', modId]);
    // NÃO chama syncStudentProfileFromGrad aqui — só após aprovação do professor
    return jsonResponse(true, 'Solicitação enviada! Aguardando aprovação do professor.');
  } catch (error) { return errorResponse('Erro ao enviar solicitação'); }
}

// v4.9 — filtro opcional por modId
function handleGetGraduacoes(data) {
  var adminEmail = requireProfessorOrAdmin(data); if (!adminEmail) return forbiddenResponse();
  if (!data.alunoEmail) return jsonResponse(false, 'Email do aluno obrigatório');
  try {
    var aluEmail = data.alunoEmail.toString().trim().toLowerCase();
    var events = getGraduacoesForEmail(aluEmail, true);
    if (data.modId) {
      var mf = data.modId.toString().toLowerCase();
      var aluSheet2 = getSheet('Alunos'); var aluRows2 = aluSheet2.getDataRange().getValues();
      var principalMod2 = '';
      for (var pa2 = 1; pa2 < aluRows2.length; pa2++) {
        if (!aluRows2[pa2][0]) continue;
        if (aluRows2[pa2][0].toString().trim().toLowerCase() === aluEmail) {
          principalMod2 = aluRows2[pa2][32] ? aluRows2[pa2][32].toString().trim().toLowerCase() : 'bjj_adulto';
          break;
        }
      }
      principalMod2 = principalMod2 || 'bjj_adulto';
      var isPrincipal2 = (mf === principalMod2);
      events = events.filter(function(ev) {
        var em3 = (ev.modalidade || '').toLowerCase();
        if (!em3) return isPrincipal2;
        return em3 === mf;
      });
    }
    return ContentService.createTextOutput(JSON.stringify({success:true,events:events})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) { return errorResponse('Erro ao buscar graduações'); }
}

function handleGetMyGraduacoes(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  try {
    var events = getGraduacoesForEmail(authEmail, true);

    // Filtra por modalidade se enviada
    // Registros sem modalidade (legados) são incluídos apenas se modId não foi enviado
    // ou se a modalidade do aluno principal bate com modId
    if (data.modId) {
      var modId = data.modId.toString().trim().toLowerCase();

      // Busca modalidade principal do aluno para incluir registros legados
      var principalMod = modId; // fallback: considera o próprio modId como principal
      try {
        var alunoSheet = getSheet('Alunos');
        var alunoRows  = alunoSheet.getDataRange().getValues();
        for (var i = 1; i < alunoRows.length; i++) {
          if (!alunoRows[i][0]) continue;
          if (alunoRows[i][0].toString().trim().toLowerCase() === authEmail) {
            principalMod = alunoRows[i][32] ? alunoRows[i][32].toString().trim().toLowerCase() : modId;
            break;
          }
        }
      } catch(e) {}

      var isPrincipal = (modId === principalMod);
      events = events.filter(function(ev) {
        var evMod = (ev.modalidade || '').toLowerCase().trim();
        if (!evMod) return isPrincipal; // legado: só aparece na modalidade principal
        return evMod === modId;
      });
    }

    return ContentService.createTextOutput(JSON.stringify({success:true,events:events})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) { return errorResponse('Erro ao buscar graduações'); }
}

function handleSetMyInicioBJJ(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  if (!data.data) return jsonResponse(false, 'Data obrigatória');

  // modId é opcional: se não enviado, comportamento legado (sem coluna modalidade)
  var modId = data.modId ? data.modId.toString().trim() : '';

  try {
    var sheet = getOrCreateGradSheet();
    var dataBR = convertToDateBR(data.data);
    var rows = sheet.getDataRange().getValues();

    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0]) continue;
      var rowEmail = rows[i][0].toString().trim().toLowerCase();
      var rowTipo  = rows[i][1] ? rows[i][1].toString().trim().toLowerCase() : '';
      var rowMod   = rows[i][8] ? rows[i][8].toString().trim().toLowerCase() : '';

      if (rowEmail !== authEmail || rowTipo !== 'inicio') continue;

      // Bate modalidade: atualiza
      if (modId && rowMod === modId.toLowerCase()) {
        sheet.getRange(i+1, 5).setValue(dataBR);
        return jsonResponse(true, 'Data de início atualizada!');
      }
      // Sem modId: atualiza o primeiro registro de inicio encontrado (legado)
      if (!modId && !rowMod) {
        sheet.getRange(i+1, 5).setValue(dataBR);
        return jsonResponse(true, 'Data de início atualizada!');
      }
    }

    // Não encontrou: cria novo registro
    sheet.appendRow([authEmail, 'inicio', 'Branca', 0, dataBR, authEmail, '', 'APROVADO', modId]);
    return jsonResponse(true, 'Data de início registrada!');
  } catch (error) { return errorResponse('Erro ao salvar data de início'); }
}

function getGraduacoesForEmail(email, includeAll) {
  var ss = _getSpreadsheet(); var sheet = ss.getSheetByName('Graduacoes');
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues(); var events = [];
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    var rowEmail = rows[i][0].toString().trim().toLowerCase(); if (rowEmail !== email) continue;
    var status = rows[i][7] ? rows[i][7].toString().toUpperCase().trim() : 'APROVADO';
    if (!includeAll && status !== 'APROVADO') continue;
    if (status === 'REJEITADO') continue;
    var tipoRaw  = rows[i][1] ? rows[i][1].toString() : '';
    var nivelRaw = rows[i][2] ? rows[i][2].toString() : '';
    events.push({
      rowIndex: i+1,
      tipo: tipoRaw, faixa: nivelRaw, nivel: nivelRaw,
      grau: rows[i][3] !== undefined ? parseInt(rows[i][3]) || 0 : 0,
      data: rows[i][4] ? formatDate(rows[i][4]) : '',
      registradoPor: rows[i][5] ? rows[i][5].toString() : '',
      obs: rows[i][6] ? rows[i][6].toString() : '',
      status: status,
      modalidade: rows[i][8] ? rows[i][8].toString().trim() : ''
    });
  }
  events.sort(function(a,b){
    function toSortable(d){var m=(d||'').match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);if(m)return m[3]+m[2].padStart(2,'0')+m[1].padStart(2,'0');return d||'';}
    return toSortable(a.data).localeCompare(toSortable(b.data));
  });
  return events;
}



// ============================================================
// ===== GRAD CONFIG + GRAD ALERTS =====
// ============================================================

function getOrCreateGradConfigSheet() {
  var ss = _getSpreadsheet(); var sheet = ss.getSheetByName('ConfigGraduacao');
  if (!sheet) { sheet = ss.insertSheet('ConfigGraduacao'); sheet.appendRow(['CT','Branca','Azul','Roxa','Marrom','Kids_Cinza','Kids_Amarela','Kids_Laranja','Kids_Verde']); sheet.appendRow(['Padrão',30,78,108,130,20,25,30,35]); sheet.getRange(1,1,1,9).setFontWeight('bold'); }
  else { var header = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0]; if (header.indexOf('Kids_Cinza') === -1) { var lastCol = sheet.getLastColumn(); sheet.getRange(1, lastCol+1, 1, 4).setValues([['Kids_Cinza','Kids_Amarela','Kids_Laranja','Kids_Verde']]); sheet.getRange(1, lastCol+1, 1, 4).setFontWeight('bold'); var rows = sheet.getDataRange().getValues(); for (var r = 1; r < rows.length; r++) { sheet.getRange(r+1, lastCol+1, 1, 4).setValues([[20,25,30,35]]); } } }
  return sheet;
}

var FAIXAS_KIDS = ['cinza','cinza/branca','branca/cinza','amarela','amarela/cinza','cinza/amarela','laranja','laranja/amarela','amarela/laranja','verde','verde/laranja','laranja/verde'];
function getFaixaKidsBase(faixaLower) { if (faixaLower.indexOf('cinza') !== -1) return 'kids_cinza'; if (faixaLower.indexOf('amarela') !== -1) return 'kids_amarela'; if (faixaLower.indexOf('laranja') !== -1) return 'kids_laranja'; if (faixaLower.indexOf('verde') !== -1) return 'kids_verde'; return null; }

function handleGetGradConfig(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  try {
    var sheet = getOrCreateGradConfigSheet(); var rows = sheet.getDataRange().getValues(); var configs = [];
    for (var i = 1; i < rows.length; i++) { if (!rows[i][0]) continue; configs.push({ ct: rows[i][0].toString().trim(), branca: parseInt(rows[i][1])||30, azul: parseInt(rows[i][2])||78, roxa: parseInt(rows[i][3])||108, marrom: parseInt(rows[i][4])||130, kids_cinza: parseInt(rows[i][5])||20, kids_amarela: parseInt(rows[i][6])||25, kids_laranja: parseInt(rows[i][7])||30, kids_verde: parseInt(rows[i][8])||35 }); }
    return ContentService.createTextOutput(JSON.stringify({success:true,configs:configs})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) { return errorResponse('Erro ao buscar configuração'); }
}

function handleSaveGradConfig(data) {
  var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  if (!data.ct) return jsonResponse(false, 'CT obrigatório');
  try {
    var sheet = getOrCreateGradConfigSheet(); var rows = sheet.getDataRange().getValues();
    var ct = data.ct.toString().trim();
    var branca = Math.max(1, parseInt(data.branca)||30); var azul = Math.max(1, parseInt(data.azul)||78); var roxa = Math.max(1, parseInt(data.roxa)||108); var marrom = Math.max(1, parseInt(data.marrom)||130);
    var kidsCinza = Math.max(1, parseInt(data.kids_cinza)||20); var kidsAmarela = Math.max(1, parseInt(data.kids_amarela)||25); var kidsLaranja = Math.max(1, parseInt(data.kids_laranja)||30); var kidsVerde = Math.max(1, parseInt(data.kids_verde)||35);
    var found = false;
    for (var i = 1; i < rows.length; i++) { if (rows[i][0] && rows[i][0].toString().trim() === ct) { sheet.getRange(i+1,2,1,8).setValues([[branca,azul,roxa,marrom,kidsCinza,kidsAmarela,kidsLaranja,kidsVerde]]); found = true; break; } }
    if (!found) sheet.appendRow([ct,branca,azul,roxa,marrom,kidsCinza,kidsAmarela,kidsLaranja,kidsVerde]);
    return jsonResponse(true, 'Configuração salva!');
  } catch (error) { return errorResponse('Erro ao salvar configuração'); }
}

// ─────────────────────────────────────────────────────────────────────────
// SISTEMA DE GRADUAÇÃO V2 — configuração por modalidade
// Sheet: ConfigGraduacaoMod | CT | ModId | Tipo | ConfigJSON
// Tipos válidos: 'aulas' | 'tempo' | 'hibrido' | 'manual' | 'nenhum'
// ─────────────────────────────────────────────────────────────────────────

function getOrCreateGradConfigModSheet() {
  var ss = _getSpreadsheet();
  var sh = ss.getSheetByName('ConfigGraduacaoMod');
  if (!sh) {
    sh = ss.insertSheet('ConfigGraduacaoMod');
    sh.appendRow(['CT','ModId','Tipo','ConfigJSON']);
    sh.getRange(1,1,1,4).setFontWeight('bold');
  }
  return sh;
}

function handleGetGradConfigMod(data) {
  var auth = requireAuth(data); if (!auth) return unauthorizedResponse();
  try {
    var sh   = getOrCreateGradConfigModSheet();
    var rows = sh.getDataRange().getValues();
    var configs = [];
    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0]) continue;
      var ct    = rows[i][0].toString().trim();
      var modId = rows[i][1] ? rows[i][1].toString().trim() : '';
      var tipo  = rows[i][2] ? rows[i][2].toString().trim() : 'aulas';
      var regras = [];
      if (rows[i][3]) { try { regras = JSON.parse(rows[i][3].toString()); } catch(e){} }
      var ok = ['aulas','tempo','hibrido','manual','nenhum'];
      if (ok.indexOf(tipo) === -1) tipo = 'aulas';
      configs.push({ ct:ct, modId:modId, tipo:tipo, regras:regras,
                     descricao: rows[i][4] ? rows[i][4].toString() : '' });
    }
    return ContentService.createTextOutput(JSON.stringify({success:true,configs:configs}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(e) { return errorResponse('Erro getGradConfigMod: '+e.message); }
}

function handleSaveGradConfigMod(data) {
  var adm = requireAdmin(data); if (!adm) return forbiddenResponse();
  var ct    = (data.ct    || 'Padrão').toString().trim();
  var modId = (data.modId || '').toString().trim();
  var tipo  = (data.tipo  || 'aulas').toString().trim();
  if (!modId) return jsonResponse(false, 'modId obrigatório');
  var ok = ['aulas','tempo','hibrido','manual','nenhum'];
  if (ok.indexOf(tipo) === -1) return jsonResponse(false, 'Tipo inválido: '+tipo);

  // Validação backend: manual precisa de descricao
  var descricao = (data.descricao || '').toString().trim();
  if (tipo === 'manual' && !descricao) {
    return jsonResponse(false, 'Modo manual requer descrição da regra de graduação.');
  }

  // Regras: valida minAulas/minMeses > 0 quando obrigatório
  var regras = [];
  if (tipo !== 'manual' && tipo !== 'nenhum') {
    if (!data.regras || !Array.isArray(data.regras)) {
      return jsonResponse(false, 'Regras obrigatórias para tipo: '+tipo);
    }
    var erros = [];
    data.regras.forEach(function(r) {
      if (!r.nivel) return;
      var minAulas = Math.max(0, parseInt(r.minAulas)||0);
      var minMeses = Math.max(0, parseInt(r.minMeses)||0);
      if ((tipo==='aulas'||tipo==='hibrido') && minAulas < 1)  erros.push('Aulas mín. = 0 no nível '+r.nivel);
      if ((tipo==='tempo'||tipo==='hibrido')  && minMeses < 1) erros.push('Meses mín. = 0 no nível '+r.nivel);
      regras.push({ nivel:r.nivel.toString().trim(), minAulas:minAulas, minMeses:minMeses });
    });
    if (erros.length) return jsonResponse(false, erros[0]);
  }

  try {
    var sh   = getOrCreateGradConfigModSheet();
    var rows = sh.getDataRange().getValues();
    var found = false;
    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0]) continue;
      if (rows[i][0].toString().trim()===ct && rows[i][1].toString().trim()===modId) {
        // col5 = descricao (nova coluna)
        sh.getRange(i+1,3,1,3).setValues([[tipo, JSON.stringify(regras), descricao]]);
        found = true; break;
      }
    }
    if (!found) sh.appendRow([ct, modId, tipo, JSON.stringify(regras), descricao]);
    return jsonResponse(true, 'Configuração salva! ('+modId+' / '+ct+')');
  } catch(e) { return errorResponse('Erro saveGradConfigMod: '+e.message); }
}

/**
 * handleSetManualLevel — define nível texto livre para aluno em modalidade sem sistema.
 * Grava na aba Graduacoes com tipo='nivel_manual' e status='APROVADO'.
 */
function handleSetManualLevel(data) {
  var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  var alunoEmail = (data.alunoEmail||'').toString().trim().toLowerCase();
  var nivel      = (data.nivel    ||'').toString().trim();
  if (!alunoEmail) return jsonResponse(false, 'Email do aluno obrigatório');
  if (!nivel)      return jsonResponse(false, 'Nível obrigatório');
  if (nivel.length > 60) return jsonResponse(false, 'Nível muito longo (máx 60 chars)');
  try {
    var sheet   = getOrCreateGradSheet();
    var rows    = sheet.getDataRange().getValues();
    var dataBR  = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy');
    var modId   = (data.modId||'').toString().trim() || 'manual';
    // Remove entrada manual anterior desta modalidade
    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0]) continue;
      if (rows[i][0].toString().trim().toLowerCase() !== alunoEmail) continue;
      if ((rows[i][1]||'').toString().trim() === 'nivel_manual' &&
          (rows[i][8]||'').toString().trim() === modId) {
        sheet.deleteRow(i+1); break;
      }
    }
    sheet.appendRow([alunoEmail, 'nivel_manual', nivel, 0, dataBR, adminEmail, '', 'APROVADO', modId]);
    return jsonResponse(true, 'Nível definido: '+nivel);
  } catch(e) { return errorResponse('Erro setManualLevel: '+e.message); }
}

/**
 * _getModTipoProgressao — retorna o tipo operacional para modId+CT.
 * Usado no backend para bloquear cálculos automáticos quando tipo='nenhum'.
 */
function _getModTipoProgressao(modId, ct) {
  try {
    var sh   = getOrCreateGradConfigModSheet();
    var rows = sh.getDataRange().getValues();
    ct = ct || 'Padrão';
    // Exact CT match first
    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0]) continue;
      if (rows[i][0].toString().trim()===ct && rows[i][1].toString().trim()===modId) {
        var t = rows[i][2] ? rows[i][2].toString().trim() : 'aulas';
        return t;
      }
    }
    // Fallback to Padrão
    for (var j = 1; j < rows.length; j++) {
      if (!rows[j][0]) continue;
      if (rows[j][0].toString().trim()==='Padrão' && rows[j][1].toString().trim()===modId) {
        return rows[j][2] ? rows[j][2].toString().trim() : 'aulas';
      }
    }
  } catch(e) { Logger.log('_getModTipoProgressao erro: '+e.message); }
  // Fallback: schema native
  var mi = _getModInfo(modId);
  return mi.tipo === 'nenhum' ? 'nenhum' : 'aulas';
}


function handleGetGradAlerts(data) {
  var authEmail = requireProfessorOrAdmin(data); if (!authEmail) return forbiddenResponse();
  try {
    var configSheet = getOrCreateGradConfigSheet(); var configRows = configSheet.getDataRange().getValues(); var configMap = {};
    for (var c = 1; c < configRows.length; c++) { if (!configRows[c][0]) continue; var ctc = configRows[c][0].toString().trim(); configMap[ctc] = { branca: parseInt(configRows[c][1])||30, azul: parseInt(configRows[c][2])||78, roxa: parseInt(configRows[c][3])||108, marrom: parseInt(configRows[c][4])||130, kids_cinza: parseInt(configRows[c][5])||20, kids_amarela: parseInt(configRows[c][6])||25, kids_laranja: parseInt(configRows[c][7])||30, kids_verde: parseInt(configRows[c][8])||35 }; }
    var defaultConfig = configMap['Padrão'] || { branca: 30, azul: 78, roxa: 108, marrom: 130, kids_cinza: 20, kids_amarela: 25, kids_laranja: 30, kids_verde: 35 };
    var alunosSheet = getSheet('Alunos'); var aRows = alunosSheet.getDataRange().getValues();
    var presencaSheet = getSheet('Presenca'); var pRows = presencaSheet.getDataRange().getValues();
    var treinosDatas = {};
    for (var p = 1; p < pRows.length; p++) { if (!pRows[p][0]) continue; if (getPresencaStatus(pRows[p]) !== 'APROVADO') continue; var pe = pRows[p][0].toString().trim().toLowerCase(); var pCT = pRows[p][4] ? pRows[p][4].toString().trim() : ''; var pd = pRows[p][6]; if (!pd) continue; var pdate = (pd instanceof Date) ? pd : new Date(pd); if (isNaN(pdate.getTime())) continue;
      // ── Inclui a modalidade do registro para filtro posterior ─────────────
      var pMod = pRows[p][10] ? pRows[p][10].toString().trim().toLowerCase() : '';
      if (!treinosDatas[pe]) treinosDatas[pe] = [];
      treinosDatas[pe].push({ date: pdate, ct: pCT, modalidade: pMod });
    }
    for (var em in treinosDatas) { treinosDatas[em].sort(function(a,b){ return a.date - b.date; }); }
    var dataFaixaAtual = {};
    try { var gradSheet2 = _getSpreadsheet().getSheetByName('Graduacoes'); if (gradSheet2) { var gRows = gradSheet2.getDataRange().getValues(); for (var g = 1; g < gRows.length; g++) { if (!gRows[g][0]) continue; var gEmail = gRows[g][0].toString().trim().toLowerCase(); var gStatus = gRows[g][7] ? gRows[g][7].toString().toUpperCase().trim() : 'APROVADO'; if (gStatus !== 'APROVADO') continue; var gTipo = gRows[g][1] ? gRows[g][1].toString().trim().toLowerCase() : ''; if (gTipo !== 'faixa' && gTipo !== 'inicio') continue; var gData = gRows[g][4]; if (!gData) continue; var gDate; if (gData instanceof Date) { gDate = gData; } else { var gs = gData.toString().trim(); var mBR = gs.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); var mISO = gs.match(/^(\d{4})-(\d{2})-(\d{2})$/); if (mBR) gDate = new Date(parseInt(mBR[3]),parseInt(mBR[2])-1,parseInt(mBR[1])); else if (mISO) gDate = new Date(parseInt(mISO[1]),parseInt(mISO[2])-1,parseInt(mISO[3])); else continue; } if (isNaN(gDate.getTime())) continue; if (!dataFaixaAtual[gEmail] || gDate > dataFaixaAtual[gEmail]) { dataFaixaAtual[gEmail] = gDate; } } } } catch(gradErr) { Logger.log('Erro ao ler Graduacoes: ' + gradErr.message); }
    var profCTs = [];
    if (!isEmailAdmin(authEmail) && isEmailProfessor(authEmail)) { for (var a2 = 1; a2 < aRows.length; a2++) { if (!aRows[a2][0]) continue; if (aRows[a2][0].toString().trim().toLowerCase() === authEmail) { var ctsProf = aRows[a2][27] ? aRows[a2][27].toString().split(',') : []; profCTs = ctsProf.map(function(x){return x.trim();}).filter(function(x){return x;}); break; } } }
    var hoje = new Date(); var alerts = [], nearAlerts = [], overdueAlerts = [], allStudents = [];
    // v4.9 — níveis máximos agnósticos de modalidade (nunca geram alerta de progressão)
    var NIVEIS_MAXIMOS = ['preta', 'preto', 'mestre', 'kru', 'vermelha', 'grão-mestre', 'master'];
    for (var i = 1; i < aRows.length; i++) {
      if (!aRows[i][0]) continue; var acctStatus = aRows[i][25] ? aRows[i][25].toString().toUpperCase() : ''; if (acctStatus === 'DESATIVADO') continue;
      var email = aRows[i][0].toString().trim().toLowerCase(); var nome = aRows[i][1] ? aRows[i][1].toString() : email;
      var ct = aRows[i][4] ? aRows[i][4].toString().trim() : ''; var tipoAluno = aRows[i][24] ? aRows[i][24].toString().trim().toLowerCase() : '';
      if (profCTs.length > 0 && profCTs.indexOf(ct) === -1) continue;
      // v4.9 — lê faixa/grau da modalidade principal em vez das colunas globais C/D
      var modPrincipalAluno = (aRows[i][32] ? aRows[i][32].toString().trim() : '') || 'bjj_adulto';
      var mGrad    = _parseModalidadesGrad(aRows[i][33]);
      var gradAtual = _getNivelAtual(mGrad, modPrincipalAluno, aRows[i][2] ? aRows[i][2].toString() : 'Branca');
      var faixa    = gradAtual.nivel;
      var grau     = gradAtual.grau;
      var faixaLower = faixa.toLowerCase();
      if (NIVEIS_MAXIMOS.indexOf(faixaLower) !== -1) continue; // nível máximo — sem alerta
      // v4.10 — pula se modalidade configurada como sem graduação
      var _tipoMod = _getModTipoProgressao(modPrincipalAluno, ct);
      if (_tipoMod === 'nenhum' || _tipoMod === 'manual') continue;
      var cfg = configMap[ct] || defaultConfig;
      var kidsBase = getFaixaKidsBase(faixaLower); var isKidsAluno = kidsBase !== null || tipoAluno === 'kids';
      var aulasPorGrau = isKidsAluno && kidsBase ? (cfg[kidsBase] || defaultConfig[kidsBase] || 20) : (cfg[faixaLower] || defaultConfig[faixaLower] || 30);
      var proximoGrau = grau + 1; if (proximoGrau > 4) continue;
      var dataInicio = dataFaixaAtual[email] || null; var todosObjetos = treinosDatas[email] || [];
      // Filtra treinos pela modalidade principal do aluno
      todosObjetos = todosObjetos.filter(function(t) {
        var tm = t.modalidade || '';
        return !tm || tm.toLowerCase() === modPrincipalAluno.toLowerCase();
      });
      var naFaixa = dataInicio ? todosObjetos.filter(function(t) { return t && t.date && t.date >= dataInicio; }) : todosObjetos.filter(function(t) { return t && t.date; });
      var ctNorm = ct.trim().toLowerCase();
      var noCTPrincipal = naFaixa.filter(function(t) { return (t.ct || '').trim().toLowerCase() === ctNorm; });
      var emOutrosCTs   = naFaixa.filter(function(t) { return (t.ct || '').trim().toLowerCase() !== ctNorm; });
      var totalPonderado = noCTPrincipal.length + (emOutrosCTs.length * 0.5);
      var totalTreinos = naFaixa.length;
      var minParaProximo = aulasPorGrau;
      var pct = minParaProximo > 0 ? Math.round((totalPonderado / minParaProximo) * 100) : 100;
      var diasAguardando = 0; var dataAtingiu = null;
      if (pct >= 100) { var somaPond = 0; for (var ti = 0; ti < naFaixa.length; ti++) { somaPond += ((naFaixa[ti].ct || '').trim().toLowerCase() === ctNorm) ? 1.0 : 0.5; if (somaPond >= minParaProximo) { dataAtingiu = naFaixa[ti].date; break; } } if (dataAtingiu) { diasAguardando = Math.floor((hoje - dataAtingiu) / (1000 * 60 * 60 * 24)); } }
      var entry = { email: email, nome: nome, faixa: faixa, nivel: faixa, grau: grau, proximoGrau: proximoGrau, ct: ct, modalidade: modPrincipalAluno, totalTreinos: totalTreinos, treinosCTPrincipal: noCTPrincipal.length, treinosOutrosCTs: emOutrosCTs.length, totalPonderado: Math.round(totalPonderado * 10) / 10, minTreinos: minParaProximo, pct: Math.min(pct, 100), diasAguardando: diasAguardando, dataAtingiu: (function() { try { return dataAtingiu ? Utilities.formatDate(dataAtingiu, Session.getScriptTimeZone(), 'dd/MM/yyyy') : ''; } catch(e) { return ''; } })(), previsaoDias: null };
      if (pct >= 100) { if (diasAguardando > 30) { overdueAlerts.push(entry); } else { alerts.push(entry); } }
      else if (pct >= 80) { nearAlerts.push(entry); }
      else { allStudents.push(entry); }
    }
    var faixaOrder = {'Preta':0,'Preto':0,'Mestre':0,'Marrom':1,'Roxa':2,'Azul':3,'Branca':4};
    function sortAlerts(a, b) { var fo = (faixaOrder[a.faixa]||5) - (faixaOrder[b.faixa]||5); if (fo !== 0) return fo; if (b.diasAguardando !== a.diasAguardando) return b.diasAguardando - a.diasAguardando; return a.nome.localeCompare(b.nome); }
    overdueAlerts.sort(sortAlerts); alerts.sort(sortAlerts); nearAlerts.sort(sortAlerts);
    allStudents.sort(function(a,b){ if (b.pct !== a.pct) return b.pct - a.pct; return a.nome.localeCompare(b.nome); });
    return ContentService.createTextOutput(JSON.stringify({ success: true, overdueAlerts: overdueAlerts, alerts: alerts, nearAlerts: nearAlerts, allStudents: allStudents })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) { Logger.log('Erro getGradAlerts: ' + error.message); return errorResponse('Erro ao buscar alertas de graduação: ' + error.message); }
}


// ============================================================
// ===== FEEDBACK =====
// ============================================================

function getOrCreateFeedbackSheet() { var ss = _getSpreadsheet(); var sheet = ss.getSheetByName('Feedbacks'); if (!sheet) { sheet = ss.insertSheet('Feedbacks'); sheet.appendRow(['Data','Email','Nome','CT','Tipo','Mensagem','Lido']); sheet.getRange(1,1,1,7).setFontWeight('bold'); } return sheet; }

function handleSubmitFeedback(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  try {
    var tipo = (data.tipo || 'sugestao').toString().trim(); var mensagem = (data.mensagem || '').toString().trim();
    if (!mensagem) return errorResponse('Mensagem não pode ser vazia');
    if (mensagem.length > 1000) return errorResponse('Mensagem muito longa (máx 1000 caracteres)');
    var tiposValidos = ['elogio','reclamacao','sugestao']; if (tiposValidos.indexOf(tipo) === -1) tipo = 'sugestao';
    var alunosSheet = getSheet('Alunos'); var aRows = alunosSheet.getDataRange().getValues(); var nome = authEmail, ct = '';
    for (var i = 1; i < aRows.length; i++) { if (!aRows[i][0]) continue; if (aRows[i][0].toString().trim().toLowerCase() === authEmail) { nome = aRows[i][1] ? aRows[i][1].toString() : authEmail; ct = aRows[i][4] ? aRows[i][4].toString().trim() : ''; break; } }
    var sheet = getOrCreateFeedbackSheet(); var now = new Date();
    sheet.appendRow([Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'), authEmail, nome, ct, tipo, mensagem, 'NÃO']);
    return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Feedback enviado com sucesso!' })).setMimeType(ContentService.MimeType.JSON);
  } catch(e) { Logger.log('Erro submitFeedback: ' + e.message); return errorResponse('Erro ao enviar feedback'); }
}

function handleGetFeedbacks(data) {
  var authEmail = requireProfessorOrAdmin(data); if (!authEmail) return forbiddenResponse();
  try {
    var sheet = getOrCreateFeedbackSheet(); var rows = sheet.getDataRange().getValues(); var feedbacks = [];
    for (var i = 1; i < rows.length; i++) { if (!rows[i][0]) continue; feedbacks.push({ data: rows[i][0] ? rows[i][0].toString() : '', email: rows[i][1] ? rows[i][1].toString() : '', nome: rows[i][2] ? rows[i][2].toString() : '', ct: rows[i][3] ? rows[i][3].toString() : '', tipo: rows[i][4] ? rows[i][4].toString() : 'sugestao', mensagem: rows[i][5] ? rows[i][5].toString() : '', lido: rows[i][6] ? rows[i][6].toString().toUpperCase() === 'SIM' : false, rowIndex: i + 1 }); }
    feedbacks.reverse();
    var naoLidos = feedbacks.filter(function(f){ return !f.lido; }).length;
    return ContentService.createTextOutput(JSON.stringify({ success: true, feedbacks: feedbacks, naoLidos: naoLidos })).setMimeType(ContentService.MimeType.JSON);
  } catch(e) { Logger.log('Erro getFeedbacks: ' + e.message); return errorResponse('Erro ao buscar feedbacks'); }
}

function handleMarkFeedbackRead(data) {
  var authEmail = requireProfessorOrAdmin(data); if (!authEmail) return forbiddenResponse();
  try { var rowIndex = parseInt(data.rowIndex); if (!rowIndex || rowIndex < 2) return errorResponse('Row inválido'); var sheet = getOrCreateFeedbackSheet(); sheet.getRange(rowIndex, 7).setValue('SIM'); return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON); }
  catch(e) { return errorResponse('Erro: ' + e.message); }
}

// ============================================================
// ===== TRIAL / PERÍODO DE TESTE =====
// ============================================================

// Trial agora é por cliente — chave prefixada com ctmId
function getTrialProps() { return PropertiesService.getScriptProperties(); }
function _trialKey(key) {
  var prefix = _currentCtmId ? _currentCtmId : 'default';
  return 'TRIAL_' + prefix.toUpperCase() + '_' + key;
}
function _getTrialProp(key)        { return getTrialProps().getProperty(_trialKey(key)) || ''; }
function _setTrialProp(key, value) { getTrialProps().setProperty(_trialKey(key), value); }
function _delTrialProp(key)        { getTrialProps().deleteProperty(_trialKey(key)); }

function handleCheckTrialStatus(data) {
  try {
    // Primeiro verifica LICENCIADOS — se ATIVO/TRIAL-válido, jamais bloqueia
    try {
      var authEmail = data.token ? validateSessionToken(data.token) : (data.email || '');
      if (authEmail) {
        var licCheck = _getLicenciado(authEmail.toString().trim().toLowerCase());
        if (licCheck && (licCheck.status === 'ATIVO' || licCheck.status === 'PAGO')) {
          return ContentService.createTextOutput(JSON.stringify({
            success: true, bloqueado: false, modoTrial: false, diasRestantes: null
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
    } catch(eLic) {}

    var bloqueado   = _getTrialProp('BLOQUEADO') === 'true';
    var dataExpStr  = _getTrialProp('DATA_EXP');
    var motivo      = _getTrialProp('MOTIVO') || '';
    var expirado = false; var diasRestantes = null; var dataExp = null;
    if (dataExpStr) { dataExp = new Date(dataExpStr); var agora = new Date(); var diffMs = dataExp.getTime() - agora.getTime(); diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24)); expirado = diasRestantes <= 0; }
    var ativo = bloqueado || expirado;
    return ContentService.createTextOutput(JSON.stringify({ success: true, bloqueado: ativo, motivoBloqueio: motivo, modoTrial: !!dataExpStr, dataExpiracao: dataExpStr || null, diasRestantes: diasRestantes, expirado: expirado, suporteWhatsApp: SUPORTE_WHATSAPP })).setMimeType(ContentService.MimeType.JSON);
  } catch(e) { return ContentService.createTextOutput(JSON.stringify({ success: true, bloqueado: false, modoTrial: false })).setMimeType(ContentService.MimeType.JSON); }
}

function handleGetTrialConfig(data) {
  var saEmail = requireSuperAdmin(data); if (!saEmail) return forbiddenResponse();
  try { return ContentService.createTextOutput(JSON.stringify({ success: true, bloqueado: _getTrialProp('BLOQUEADO') === 'true', dataExpiracao: _getTrialProp('DATA_EXP') || '', motivo: _getTrialProp('MOTIVO') || '', criadoEm: _getTrialProp('CRIADO_EM') || '' })).setMimeType(ContentService.MimeType.JSON); }
  catch(e) { return errorResponse('Erro: ' + e.message); }
}

function handleSaveTrialConfig(data) {
  var saEmail = requireSuperAdmin(data); if (!saEmail) return forbiddenResponse();
  try {
    var acao = (data.acao || '').toString().trim();
    if (acao === 'definir_trial') {
      var dias = parseInt(data.dias) || 0; if (dias < 1 || dias > 365) return errorResponse('Dias deve ser entre 1 e 365');
      var expDate = new Date(); expDate.setDate(expDate.getDate() + dias);
      _setTrialProp('DATA_EXP',  expDate.toISOString());
      _setTrialProp('BLOQUEADO', 'false');
      _setTrialProp('MOTIVO',    data.motivo || 'Período de avaliação');
      _setTrialProp('CRIADO_EM', new Date().toISOString());
    } else if (acao === 'bloquear') {
      _setTrialProp('BLOQUEADO', 'true');
      _setTrialProp('MOTIVO',    data.motivo || 'Sistema bloqueado pelo administrador');
    } else if (acao === 'desbloquear') {
      _setTrialProp('BLOQUEADO', 'false');
      _setTrialProp('MOTIVO',    '');
    } else if (acao === 'remover_trial') {
      _delTrialProp('DATA_EXP'); _delTrialProp('BLOQUEADO');
      _delTrialProp('MOTIVO');   _delTrialProp('CRIADO_EM');
    } else { return errorResponse('Ação inválida'); }
    return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Configuração salva!' })).setMimeType(ContentService.MimeType.JSON);
  } catch(e) { Logger.log('Erro saveTrialConfig: ' + e.message); return errorResponse('Erro: ' + e.message); }
}

// ══════════════════════════════════════════════════════════════════
// PAINEL SUPERADMIN — doGet?painel=1&token=SEU_TOKEN_DE_SESSAO
// ══════════════════════════════════════════════════════════════════

function _getTrialInfoCliente(ctmId) {
  var prefix = 'TRIAL_' + ctmId.toUpperCase() + '_';
  var props  = PropertiesService.getScriptProperties();
  var bloqueado = props.getProperty(prefix + 'BLOQUEADO') === 'true';
  var dataExp   = props.getProperty(prefix + 'DATA_EXP') || '';
  var motivo    = props.getProperty(prefix + 'MOTIVO')   || '';
  var expirado  = false; var diasRestantes = null;
  if (dataExp) {
    var d = new Date(dataExp); var diff = Math.ceil((d - new Date()) / 86400000);
    diasRestantes = diff; expirado = diff <= 0;
  }
  return { ctmId: ctmId, bloqueado: bloqueado, expirado: expirado, diasRestantes: diasRestantes, dataExp: dataExp, motivo: motivo };
}

function _setTrialCliente(ctmId, acao, dias, motivo) {
  var prefix = 'TRIAL_' + ctmId.toUpperCase() + '_';
  var props  = PropertiesService.getScriptProperties();
  if (acao === 'trial') {
    var exp = new Date(); exp.setDate(exp.getDate() + parseInt(dias));
    props.setProperty(prefix + 'DATA_EXP',  exp.toISOString());
    props.setProperty(prefix + 'BLOQUEADO', 'false');
    props.setProperty(prefix + 'MOTIVO',    motivo || 'Periodo de avaliacao');
    props.setProperty(prefix + 'CRIADO_EM', new Date().toISOString());
  } else if (acao === 'bloquear') {
    props.setProperty(prefix + 'BLOQUEADO', 'true');
    props.setProperty(prefix + 'MOTIVO',    motivo || 'Bloqueado pelo administrador');
  } else if (acao === 'desbloquear') {
    props.setProperty(prefix + 'BLOQUEADO', 'false');
    props.deleteProperty(prefix + 'DATA_EXP');
    props.setProperty(prefix + 'MOTIVO', '');
  }
}

function handlePainelAction(data) {
  // Valida via token de sessão do SuperAdmin — sem senha exposta
  var painelEmail = data.token ? validateSessionToken(data.token) : null;
  if (!painelEmail || !_isSuperAdminSheet(painelEmail)) return forbiddenResponse();
  var ctmId = (data.ctmId || '').toString().trim().toLowerCase();
  var acao  = (data.acao  || '').toString().trim();
  var dias  = parseInt(data.dias) || 30;
  var mot   = (data.motivo || '').toString().trim();
  if (!ctmId || !CTM_REGISTRY[ctmId]) return jsonResponse(false, 'ctmId invalido: ' + ctmId);
  _setTrialCliente(ctmId, acao, dias, mot);
  return jsonResponse(true, 'OK', _getTrialInfoCliente(ctmId));
}

function handlePainelGetStatus(data) {
  var painelEmail = data.token ? validateSessionToken(data.token) : null;
  if (!painelEmail || !_isSuperAdminSheet(painelEmail)) return forbiddenResponse();
  var clientes = Object.keys(CTM_REGISTRY).map(function(id) { return _getTrialInfoCliente(id); });
  return jsonResponse(true, null, { clientes: clientes });
}

// ══════════════════════════════════════════════════════════════════
// AUTOMAÇÃO — Criar novo cliente via painel
// ══════════════════════════════════════════════════════════════════

function _validarCtmId(ctmId) {
  return /^[a-z0-9_]{2,40}$/.test(ctmId);
}

/**
 * Cria planilha do cliente (cópia da matrix), configura abas,
 * faixas, trial, LICENCIADOS e registry — tudo automaticamente.
 */
function handlePainelCriarCliente(data) {
  var painelEmail = data.token ? validateSessionToken(data.token) : null;
  if (!painelEmail || !_isSuperAdminSheet(painelEmail)) return forbiddenResponse();

  // ── Campos do formulário ──
  var ctmId      = (data.ctmId      || '').toString().trim().toLowerCase();
  var nomeAdmin  = (data.nome        || '').toString().trim();
  var emailAdmin = (data.emailAdmin  || '').toString().trim().toLowerCase();
  var telefone   = (data.telefone    || '').toString().trim();
  var nascimento = (data.nascimento  || '').toString().trim();
  var nomeDojo   = (data.nomeDojo    || '').toString().trim();
  var faixa      = (data.faixa       || 'Branca').toString().trim();
  var grau       = parseInt(data.grau) || 0;
  var modalidades= (data.modalidades || '').toString().trim();
  var plano      = (data.plano       || 'profissional').toString().trim();
  var diasTrial  = parseInt(data.diasTrial) || 30;

  // ── Validações ──
  if (!ctmId)       return jsonResponse(false, 'ctmId obrigatório');
  if (!_validarCtmId(ctmId)) return jsonResponse(false, 'ctmId inválido — use apenas letras minúsculas, números e _ (ex: dojo_system)');
  if (!nomeAdmin)   return jsonResponse(false, 'Nome completo obrigatório');
  if (!emailAdmin)  return jsonResponse(false, 'E-mail obrigatório');
  if (!nomeDojo)    return jsonResponse(false, 'Nome do Dojo obrigatório');

  _loadRegistry();
  if (CTM_REGISTRY[ctmId]) return jsonResponse(false, 'ctmId já existe: ' + ctmId);

  // Verifica se email já tem contrato ativo (1:1)
  try {
    _currentSheetId = SHEET_ID;
    var licChk  = getLicenciadosSheet();
    var licData = licChk.getDataRange().getValues();
    for (var lc = 1; lc < licData.length; lc++) {
      if (licData[lc][0] && licData[lc][0].toString().trim().toLowerCase() === emailAdmin.toLowerCase()) {
        return jsonResponse(false, 'E-mail já possui um contrato ativo (LICENCIADOS). Cada e-mail só pode ter 1 contrato.');
      }
    }
  } catch(eLicChk) { /* ignora se planilha vazia */ }

  var log = [];
  try {
    // 1. Cria planilha — cópia da matrix
    log.push('Criando planilha...');
    var novaFile    = DriveApp.getFileById(SHEET_ID).makeCopy('CTM — ' + nomeDojo);
    var novoSS      = SpreadsheetApp.openById(novaFile.getId());
    var novoSheetId = novoSS.getId();
    log.push('Planilha criada: ' + novoSheetId.substring(0,15) + '...');

    // 2. Limpa dados de exemplo
    try {
      ['Alunos','CTs','Presenca','PendingAccounts'].forEach(function(aba) {
        var sh = novoSS.getSheetByName(aba);
        if (sh && sh.getLastRow() > 1) sh.deleteRows(2, sh.getLastRow() - 1);
      });
      log.push('Dados de exemplo limpos');
    } catch(eL) { log.push('Aviso limpeza: ' + eL.message); }

    // 3. Cria CT (dojo) na aba CTs
    try {
      var ctsSh = novoSS.getSheetByName('CTs');
      if (ctsSh) {
        ctsSh.appendRow([
          nomeDojo, true,
          true, true, true, true, true, false, false, // Seg-Dom
          '', '', '', '', '', '', '', '',              // Endereco, Horarios, etc
          plano, 'ativo', ''
        ]);
        log.push('CT criado: ' + nomeDojo);
      }
    } catch(eCT) { log.push('Aviso CT: ' + eCT.message); }

    // 4. Cria conta admin na aba Alunos com senha temporária
    var senhaTemp = ctmId + '@2025';
    var senhaHash = '';
    try {
      senhaHash = hashPassword(senhaTemp);
    } catch(eH) { log.push('Aviso hash: ' + eH.message); }

    try {
      var aluSh = novoSS.getSheetByName('Alunos');
      if (aluSh) {
        var agora = new Date();
        var rowAdmin = new Array(35).fill('');
        rowAdmin[0]  = emailAdmin;   // A - Email
        rowAdmin[1]  = nomeAdmin;    // B - Nome
        rowAdmin[2]  = faixa;        // C - Faixa
        rowAdmin[3]  = grau;         // D - Grau
        rowAdmin[4]  = nomeDojo;     // E - CT
        rowAdmin[5]  = senhaHash;    // F - SenhaHash
        rowAdmin[6]  = true;         // G - Admin
        rowAdmin[7]  = agora;        // H - DataCriacao
        rowAdmin[8]  = nascimento;   // I - Nascimento
        rowAdmin[12] = telefone;     // M - Telefone
        rowAdmin[25] = '';           // Z - Status (ativo)
        aluSh.appendRow(rowAdmin);
        log.push('Conta admin criada: ' + emailAdmin);
      }
    } catch(eA) { log.push('Aviso admin: ' + eA.message); }

    // 5. Cria faixas
    _currentSheetId = novoSheetId;
    try {
      var fSh = ensureFaixasSheet();
      log.push('Faixas: ' + (fSh.getLastRow()-1) + ' linhas');
    } catch(eF) { log.push('Aviso faixas: ' + eF.message); }

    // 6. Adiciona ao registry dinâmico
    _addToRegistry(ctmId, novoSheetId, nomeDojo);
    log.push('Registry: ' + ctmId + ' cadastrado');

    // 7. Configura trial
    _setTrialCliente(ctmId, 'trial', diasTrial, 'Trial inicial — ' + nomeDojo);
    log.push('Trial: ' + diasTrial + ' dias');

    // 8. Registra no LICENCIADOS da matrix (1 email = 1 contrato)
    _currentSheetId = SHEET_ID;
    try {
      var licSheet = getLicenciadosSheet();
      var licRows  = licSheet.getDataRange().getValues();
      // Verifica se já existe contrato para este email
      var licRowIdx = -1;
      for (var li = 1; li < licRows.length; li++) {
        if (licRows[li][0] && licRows[li][0].toString().trim().toLowerCase() === emailAdmin.toLowerCase()) {
          licRowIdx = li + 1; // 1-indexed
          break;
        }
      }
      var expDate = new Date(); expDate.setDate(expDate.getDate() + diasTrial);
      var expStr  = Utilities.formatDate(expDate, 'America/Sao_Paulo', 'dd/MM/yyyy');
      var novaLinha = [emailAdmin, plano, 'TRIAL', expStr, nomeAdmin, telefone, nascimento, modalidades, novoSheetId];
      if (licRowIdx > 0) {
        // Atualiza a linha existente (1:1 — não duplica)
        licSheet.getRange(licRowIdx, 1, 1, novaLinha.length).setValues([novaLinha]);
        log.push('LICENCIADOS: contrato atualizado (email já existia)');
      } else {
        licSheet.appendRow(novaLinha);
        log.push('LICENCIADOS: novo contrato registrado');
      }
    } catch(eLic) { log.push('Aviso LICENCIADOS: ' + eLic.message); }

    _currentSheetId = SHEET_ID;
    Logger.log('[criarCliente] ' + ctmId + ' OK | ' + log.join(' | '));

    return jsonResponse(true, 'Cliente criado com sucesso!', {
      ctmId:       ctmId,
      nomeDojo:    nomeDojo,
      sheetId:     novoSheetId,
      sheetUrl:    'https://docs.google.com/spreadsheets/d/' + novoSheetId,
      linkCliente: 'https://levissilva83.github.io/ctm/?ctm=' + ctmId,
      senhaTemp:   senhaTemp,
      diasTrial:   diasTrial,
      log:         log
    });

  } catch(e) {
    _currentSheetId = SHEET_ID;
    Logger.log('[criarCliente] ERRO: ' + e.message);
    return jsonResponse(false, 'Erro: ' + e.message, { log: log });
  }
}

function handlePainelListarClientes(data) {
  var painelEmail = data.token ? validateSessionToken(data.token) : null;
  if (!painelEmail || !_isSuperAdminSheet(painelEmail)) return forbiddenResponse();
  _loadRegistry();
  var clientes = Object.keys(CTM_REGISTRY).map(function(id) {
    var trial = _getTrialInfoCliente(id);
    return {
      ctmId:  id,
      sheetId: CTM_REGISTRY[id],
      trial:  trial,
      link:   'https://levissilva83.github.io/ctm/?ctm=' + id
    };
  });
  return jsonResponse(true, null, { clientes: clientes });
}

function handlePainelRemoverCliente(data) {
  var painelEmail = data.token ? validateSessionToken(data.token) : null;
  if (!painelEmail || !_isSuperAdminSheet(painelEmail)) return forbiddenResponse();
  var ctmId = (data.ctmId || '').toString().trim().toLowerCase();
  if (!ctmId || ctmId === 'matrix') return jsonResponse(false, 'Não é possível remover o cliente matrix');
  _loadRegistry();
  if (!CTM_REGISTRY[ctmId]) return jsonResponse(false, 'Cliente não encontrado: ' + ctmId);
  delete CTM_REGISTRY[ctmId];
  _saveRegistry();
  return jsonResponse(true, 'Cliente removido do registry: ' + ctmId);
}

function _buildPainelHtml(sessionToken) {
  _loadRegistry();
  var scriptUrl = ScriptApp.getService().getUrl();
  var clientes  = Object.keys(CTM_REGISTRY);
  var rows = clientes.map(function(id) {
    var info = _getTrialInfoCliente(id);
    var status, badge;
    if (info.bloqueado)                    { status = 'BLOQUEADO';              badge = '#e53935'; }
    else if (info.expirado)                { status = 'EXPIRADO';               badge = '#f97316'; }
    else if (info.diasRestantes !== null)  { status = info.diasRestantes + 'd'; badge = '#22c55e'; }
    else                                   { status = 'SEM TRIAL';              badge = '#6b7280'; }
    return '<tr>' +
      '<td style="padding:10px 14px;font-weight:500;font-size:13px">' + id + '</td>' +
      '<td><span style="background:' + badge + ';color:#fff;border-radius:20px;padding:3px 10px;font-size:12px">' + status + '</span></td>' +
      '<td style="color:#9ca3af;font-size:12px">' + (info.dataExp ? info.dataExp.substring(0,10) : '-') + '</td>' +
      '<td><input type="number" id="dias_' + id + '" value="30" min="1" max="365" style="width:58px;padding:4px;border-radius:6px;border:1px solid #374151;background:#1f2937;color:#fff;margin-right:4px"></td>' +
      '<td style="padding:8px 14px">' +
        '<button onclick="ac(this)" data-id="' + id + '" data-ac="trial"       style="background:#2563eb;color:#fff;border:none;border-radius:6px;padding:5px 10px;cursor:pointer;font-size:12px">Trial</button>' +
        '<button onclick="ac(this)" data-id="' + id + '" data-ac="desbloquear" style="background:#16a34a;color:#fff;border:none;border-radius:6px;padding:5px 10px;cursor:pointer;font-size:12px">Liberar</button>' +
        '<button onclick="ac(this)" data-id="' + id + '" data-ac="bloquear"    style="background:#dc2626;color:#fff;border:none;border-radius:6px;padding:5px 10px;cursor:pointer;font-size:12px">Bloquear</button>' +
      '</td>' +
    '</tr>';
  }).join('');

  var modOpts = [
    'bjj_adulto','muay_thai','muay_thai_khan','judo','karate',
    'capoeira','boxe','kickboxing','taekwondo','mma','wrestling'
  ].map(function(m){ return '<option value="'+m+'">'+m+'</option>'; }).join('');

  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>CTM Painel</title>' +
    '<style>*{box-sizing:border-box;margin:0;padding:0}' +
    'body{background:#111827;color:#f9fafb;font-family:system-ui,sans-serif;padding:2rem}' +
    'h1{margin-bottom:.5rem;font-size:1.4rem;color:#C9A23A}' +
    'h2{font-size:1rem;color:#9ca3af;margin:2rem 0 1rem;border-bottom:1px solid #1f2937;padding-bottom:.5rem}' +
    'table{width:100%;border-collapse:collapse}' +
    'th{text-align:left;padding:8px 14px;font-size:11px;text-transform:uppercase;letter-spacing:.8px;color:#9ca3af;border-bottom:1px solid #374151}' +
    'tr:hover td{background:#1f2937}td{padding:6px 14px;border-bottom:1px solid #1f2937;vertical-align:middle}' +
    '.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}' +
    'label{font-size:12px;color:#9ca3af;display:block;margin-bottom:4px}' +
    'input,select{width:100%;background:#1f2937;border:1px solid #374151;color:#f9fafb;border-radius:6px;padding:7px 10px;font-size:13px}' +
    'input:focus,select:focus{outline:none;border-color:#C9A23A}' +
    '.btn-criar{background:#C9A23A;color:#111;border:none;border-radius:6px;padding:10px 24px;font-size:14px;font-weight:600;cursor:pointer;width:100%;margin-top:4px}' +
    '.btn-criar:hover{background:#d4af37}' +
    '.btn-criar:disabled{background:#374151;color:#6b7280;cursor:not-allowed}' +
    '.card{background:#1f2937;border:1px solid #374151;border-radius:10px;padding:1.25rem;margin-bottom:1.5rem}' +
    '#msg{margin-top:1rem;padding:12px 16px;border-radius:8px;display:none;font-size:13px;line-height:1.6}' +
    '#result-link{display:none;margin-top:1rem;background:#052e16;border:1px solid #166534;border-radius:8px;padding:12px 16px}' +
    '.link-item{font-size:12px;color:#86efac;word-break:break-all;margin:4px 0}' +
    '.link-label{font-size:11px;color:#6b7280;margin-bottom:2px}' +
    '.mod-checks{display:flex;flex-wrap:wrap;gap:8px}' +
    '.mod-cb{display:flex;align-items:center;gap:5px;background:#111827;border:1px solid #374151;border-radius:6px;padding:5px 10px;cursor:pointer;font-size:12px}' +
    '.mod-cb input{width:14px;height:14px;margin:0}' +
    '.spinner{display:none;border:3px solid #374151;border-top:3px solid #C9A23A;border-radius:50%;width:20px;height:20px;animation:spin .8s linear infinite;margin:0 auto}' +
    '@keyframes spin{to{transform:rotate(360deg)}}' +
    '</style></head><body>' +

    '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1rem">' +
    '<div><h1 style="color:#C9A23A;font-size:1.4rem">🥋 CTM — Painel SuperAdmin</h1>' +
    '<p style="font-size:11px;color:#4b5563;margin-top:2px">Versão: ' + CTM_VERSION + ' | ' + clientes.length + ' clientes no registry</p></div>' +
    '<div style="display:flex;gap:8px">' +
    '<button onclick="testarConexao()" style="background:none;border:1px solid #374151;color:#9ca3af;border-radius:6px;padding:5px 14px;font-size:12px;cursor:pointer">🔌 Testar conexão</button>' +
    '<button onclick="resetarRegistryBtn()" style="background:none;border:1px solid #92400e;color:#f59e0b;border-radius:6px;padding:5px 14px;font-size:12px;cursor:pointer">♻️ Resetar Registry</button>' +
    '</div></div>' +

    // FORMULÁRIO NOVO CLIENTE
    '<h2>Criar novo cliente</h2>' +
    '<div class="card">' +
    '<div class="form-grid">' +
    '<div><label>Nome completo *</label><input id="f_nome" placeholder="Ex: João Silva" oninput="this.style.border=\'\'" /></div>' +
    '<div><label>ctmId * <span style="color:#6b7280">(URL do cliente)</span></label><input id="f_ctmid" placeholder="Ex: dojosystem" oninput="this.style.border=\'\'" /></div>' +
    '<div><label>E-mail *</label><input id="f_email" type="email" placeholder="joao@dojosystem.com.br" oninput="this.style.border=\'\'" /></div>' +
    '<div><label>Telefone</label><input id="f_telefone" placeholder="(11) 99999-9999" /></div>' +
    '<div><label>Data de nascimento</label><input id="f_nasc" type="date" /></div>' +
    '<div><label>Nome do Dojo / CT *</label><input id="f_dojo" placeholder="Ex: Dojo System" oninput="this.style.border=\'\'" /></div>' +
    '<div><label>Graduação (faixa)</label><select id="f_faixa"><option value="Branca">Branca</option><option value="Azul">Azul</option><option value="Roxa">Roxa</option><option value="Marrom">Marrom</option><option value="Preta">Preta</option></select></div>' +
    '<div><label>Grau</label><select id="f_grau"><option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></div>' +
    '<div><label>Plano</label><select id="f_plano"><option value="profissional">Profissional</option><option value="basico">Básico</option><option value="premium">Premium</option></select></div>' +
    '<div><label>Dias de trial</label><input id="f_dias" type="number" value="30" min="1" max="365" /></div>' +
    '</div>' +
    '<label style="margin-bottom:8px">Modalidades contratadas</label>' +
    '<div class="mod-checks">' +
    ['bjj_adulto','muay_thai','muay_thai_khan','judo','karate','capoeira','boxe','kickboxing','taekwondo','mma','wrestling'].map(function(m){
      return '<label class="mod-cb"><input type="checkbox" value="'+m+'" class="mod-check"> '+m+'</label>';
    }).join('') +
    '</div>' +
    '<div style="margin-top:16px"><button class="btn-criar" onclick="criarCliente()">Criar cliente automaticamente</button></div>' +
    '<div style="margin-top:8px;text-align:right"><button onclick="testarConexao()" style="background:none;border:1px solid #374151;color:#9ca3af;border-radius:6px;padding:4px 12px;font-size:12px;cursor:pointer">🔌 Testar conexão com GAS</button></div>' +
    '<div class="spinner" id="spinner" style="margin-top:16px"></div>' +
    '<div id="msg"></div>' +
    '<div id="result-link"></div>' +
    '</div>' +

    // TABELA CLIENTES
    '<h2>Clientes cadastrados — trial</h2>' +
    '<table><thead><tr><th>Cliente</th><th>Status</th><th>Expira</th><th>Dias</th><th>Ações</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table>' +

    '<script>' +
    'var U="' + scriptUrl + '",TK=' + JSON.stringify(sessionToken||'') + ';' +

    // Gera ctmId automaticamente a partir do nome do dojo
    'document.getElementById("f_dojo").addEventListener("input",function(){' +
    '  var n=this.value.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"");' +
    '  document.getElementById("f_ctmid").value=n;' +
    '});' +

    'function criarCliente(){' +
    '  var campos=[' +
    '    {id:"f_nome",  label:"Nome completo"},' +
    '    {id:"f_ctmid", label:"ctmId"},' +
    '    {id:"f_email", label:"E-mail"},' +
    '    {id:"f_dojo",  label:"Nome do Dojo / CT"}' +
    '  ];' +
    '  var erros=[];' +
    '  campos.forEach(function(c){' +
    '    var el=document.getElementById(c.id);' +
    '    if(!el||!el.value.trim()){' +
    '      erros.push(c.label);' +
    '      if(el){el.style.border="2px solid #ef4444";}' +
    '    } else {' +
    '      if(el){el.style.border="";}' +
    '    }' +
    '  });' +
    '  if(erros.length){showMsg("⚠️ Preencha os campos obrigatórios: "+erros.join(", "),"#7f1d1d");return;}' +
    '  var nome=document.getElementById("f_nome").value.trim();' +
    '  var ctmId=document.getElementById("f_ctmid").value.trim();' +
    '  var email=document.getElementById("f_email").value.trim();' +
    '  var telefone=document.getElementById("f_telefone").value.trim();' +
    '  var nasc=document.getElementById("f_nasc").value.trim();' +
    '  var dojo=document.getElementById("f_dojo").value.trim();' +
    '  var faixa=document.getElementById("f_faixa").value;' +
    '  var grau=document.getElementById("f_grau").value;' +
    '  var plano=document.getElementById("f_plano").value;' +
    '  var dias=document.getElementById("f_dias").value;' +
    '  var mods=[].slice.call(document.querySelectorAll(".mod-check:checked")).map(function(c){return c.value;}).join(",");' +
    '  if(!/^[a-z0-9_]{2,40}$/.test(ctmId)){showMsg("⚠️ ctmId inválido — use letras minúsculas, números e _ (ex: dojo_system)","#7f1d1d");document.getElementById("f_ctmid").style.border="2px solid #ef4444";return;}' +
    '  document.querySelector(".btn-criar").disabled=true;' +
    '  document.getElementById("spinner").style.display="block";' +
    '  document.getElementById("msg").style.display="none";' +
    '  document.getElementById("result-link").style.display="none";' +
    '  fetch(U,{method:"POST",body:JSON.stringify({action:"painelCriarCliente",token:TK,ctmId:ctmId,nome:nome,emailAdmin:email,telefone:telefone,nascimento:nasc,nomeDojo:dojo,faixa:faixa,grau:grau,plano:plano,diasTrial:dias,modalidades:mods})})' +
    '  .then(function(r){return r.json();})' +
    '  .then(function(d){' +
    '    document.getElementById("spinner").style.display="none";' +
    '    document.querySelector(".btn-criar").disabled=false;' +
    '    if(d.success){' +
    '      showMsg("Cliente criado com sucesso!","#14532d");' +
    '      var rl=document.getElementById("result-link");' +
    '      rl.style.display="block";' +
    '      rl.innerHTML=' +
    '        "<div class=\\"link-label\\">Link do cliente</div>"' +
    '        +"<div class=\\"link-item\\">"+d.linkCliente+"</div>"' +
    '        +"<div class=\\"link-label\\" style=\\"margin-top:8px\\">Senha temporária (envie ao cliente)</div>"' +
    '        +"<div class=\\"link-item\\" style=\\"font-size:16px;font-weight:600;letter-spacing:2px\\">"+d.senhaTemp+"</div>"' +
    '        +"<div class=\\"link-label\\" style=\\"margin-top:8px\\">Planilha</div>"' +
    '        +"<div class=\\"link-item\\"><a href=\\""+d.sheetUrl+"\\" target=\\"_blank\\" style=\\"color:#86efac\\">"+d.sheetUrl+"</a></div>"' +
    '        +"<div style=\\"margin-top:8px;font-size:11px;color:#6b7280\\">Trial: "+d.diasTrial+" dias | A página vai recarregar em 5s</div>";' +
    '      setTimeout(function(){location.reload();},5000);' +
    '    } else {showMsg("Erro: "+(d.message||"?"),"#7f1d1d");}' +
    '  }).catch(function(e){' +
    '    document.getElementById("spinner").style.display="none";' +
    '    document.querySelector(".btn-criar").disabled=false;' +
    '    showMsg("Erro de rede: "+e,"#7f1d1d");' +
    '  });' +
    '}' +

    'function showMsg(t,bg){var m=document.getElementById("msg");m.style.display="block";m.style.background=bg;m.style.whiteSpace="pre-wrap";m.textContent=t;}' +
    'function testarConexao(){' +
    '  showMsg("Testando conexão...","#1f2937");' +
    '  fetch(U,{method:"POST",body:JSON.stringify({action:"ping"})})' +
    '  .then(function(r){return r.json();})' +
    '  .then(function(d){showMsg("✅ GAS OK | Versão: "+d.version+" | Clientes: "+d.registry+" | Sheet: "+d.sheet,"#14532d");})' +
    '  .catch(function(e){showMsg("❌ Erro: "+e,"#7f1d1d");});' +
    '}' +
    'function resetarRegistry(){' +
    '  if(!confirm("Resetar o registry vai recarregar do SEED do código. Continuar?"))return;' +
    '  fetch(U,{method:"POST",body:JSON.stringify({action:"painelResetRegistry",token:TK})})' +
    '  .then(function(r){return r.json();})' +
    '  .then(function(d){showMsg(d.success?"✅ Registry resetado! Recarregue a página.":"Erro: "+(d.message||"?"),d.success?"#14532d":"#7f1d1d");})' +
    '  .catch(function(e){showMsg("❌ "+e,"#7f1d1d");});' +
    '}' +
    'var resetarRegistryBtn=resetarRegistry;' +

    'function ac(btn){' +
    '  var id=btn.getAttribute?btn.getAttribute("data-id"):btn;' +
    '  var a=btn.getAttribute?btn.getAttribute("data-ac"):arguments[1];' +
    '  var dias=document.getElementById("dias_"+id).value;' +
    '  var m=document.getElementById("msg");' +
    '  m.style.display="block";m.style.background="#1f2937";m.textContent="Aguarde...";' +
    '  fetch(U,{method:"POST",body:JSON.stringify({action:"painelAction",token:TK,ctmId:id,acao:a,dias:dias})})' +
    '  .then(function(r){return r.json();})' +
    '  .then(function(d){if(d.success){showMsg("OK: "+id+" → "+a,"#14532d");setTimeout(function(){location.reload();},1500);}' +
    '  else{showMsg("Erro: "+(d.message||"?")+(d.log?"\\n"+d.log.join("\\n"):""),"#7f1d1d");}})' +
    '  .catch(function(e){showMsg("Erro: "+e,"#7f1d1d");});' +
    '}' +
    '<\\/script></body></html>';
}

function handleCheckIsSuperAdmin(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  return ContentService.createTextOutput(JSON.stringify({ success: true, isSuperAdmin: isEmailSuperAdmin(authEmail) })).setMimeType(ContentService.MimeType.JSON);
}

function handleGetSuperAdminData(data) {
  var saEmail = requireSuperAdmin(data); if (!saEmail) return forbiddenResponse();
  try {
    var ss = _getSpreadsheet(); var ctSheet = ss.getSheetByName('CTs'); var cts = [];
    if (ctSheet) { var ctRows = ctSheet.getDataRange().getValues(); for (var c = 1; c < ctRows.length; c++) { if (!ctRows[c][0]) continue; cts.push({ nome: ctRows[c][0].toString().trim(), ativo: ctRows[c][1] === true || ctRows[c][1] === 'TRUE', criadoEm: ctRows[c][2] ? ctRows[c][2].toString() : '' }); } }
    var alunosSheet = getSheet('Alunos'); var aRows = alunosSheet.getDataRange().getValues(); var admins = [], professores = [], totalAlunos = 0, ctStats = {};
    for (var a = 1; a < aRows.length; a++) { if (!aRows[a][0]) continue; var acctStatus = aRows[a][25] ? aRows[a][25].toString().toUpperCase() : ''; if (acctStatus === 'DESATIVADO') continue; totalAlunos++; var tipo = aRows[a][26] ? aRows[a][26].toString().trim().toLowerCase() : ''; var isAdm = aRows[a][6] === true || aRows[a][6] === 'TRUE'; var entry = { email: aRows[a][0].toString().trim(), nome: aRows[a][1] ? aRows[a][1].toString() : '', ct: aRows[a][4] ? aRows[a][4].toString().trim() : '' }; if (isAdm && tipo !== 'professor') admins.push(entry); if (tipo === 'professor') professores.push(entry); var ct2 = aRows[a][4] ? aRows[a][4].toString().trim() : 'Sem CT'; ctStats[ct2] = (ctStats[ct2] || 0) + 1; }
    return ContentService.createTextOutput(JSON.stringify({ success: true, cts: cts, admins: admins, professores: professores, totalAlunos: totalAlunos, ctStats: ctStats })).setMimeType(ContentService.MimeType.JSON);
  } catch(e) { Logger.log('Erro getSuperAdminData: ' + e.message); return errorResponse('Erro ao buscar dados: ' + e.message); }
}


// ============================================================
// ===== BIRTHDAYS, DEACTIVATE, CREATE/DELETE CT, EXAM CONFIG =====
// ============================================================

function handleGetAllBirthdaysToday(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  try {
    var alunosSheet = getSheet('Alunos'); var rows = alunosSheet.getDataRange().getValues(); var now = new Date(); var hojeM = now.getMonth(); var hojeD = now.getDate(); var birthdays = [];
    for (var i = 1; i < rows.length; i++) { if (!rows[i][0]) continue; var acctStatus = rows[i][25] ? rows[i][25].toString().toUpperCase() : ''; if (acctStatus === 'DESATIVADO') continue; var nascVal = rows[i][8]; if (!nascVal) continue; var nascDate; if (nascVal instanceof Date) { nascDate = nascVal; } else { var s = nascVal.toString().trim(); if (s.length < 6) continue; nascDate = new Date(s); if (isNaN(nascDate.getTime())) continue; } if (nascDate.getMonth() !== hojeM || nascDate.getDate() !== hojeD) continue; var nome = rows[i][1] ? rows[i][1].toString() : ''; var ct = rows[i][4] ? rows[i][4].toString().trim() : ''; var faixa = rows[i][2] ? rows[i][2].toString() : 'Branca'; var idade = now.getFullYear() - nascDate.getFullYear(); birthdays.push({ nome: nome, ct: ct, faixa: faixa, idade: idade }); }
    return ContentService.createTextOutput(JSON.stringify({ success: true, birthdays: birthdays })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) { Logger.log('Erro getAllBirthdaysToday: ' + error.message); return errorResponse('Erro ao buscar aniversariantes'); }
}

function handleGetBirthdays(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  if (!isEmailAdmin(authEmail) && !isEmailProfessor(authEmail)) return forbiddenResponse();
  try {
    var alunosSheet = getSheet('Alunos'); var rows = alunosSheet.getDataRange().getValues(); var hoje = new Date(); var hojeM = hoje.getMonth(); var hojeD = hoje.getDate(); var birthdays = [];
    for (var i = 1; i < rows.length; i++) { var nascVal = rows[i][8]; if (!nascVal) continue; var nascDate; if (nascVal instanceof Date) { nascDate = nascVal; } else { var nascStr = nascVal.toString().trim(); if (nascStr.length<6) continue; nascDate = new Date(nascStr); if (isNaN(nascDate.getTime())) continue; } var nascM = nascDate.getMonth(); var nascD = nascDate.getDate(); var nextBday = new Date(hoje.getFullYear(),nascM,nascD); if (nextBday<hoje&&!(nascM===hojeM&&nascD===hojeD)) nextBday = new Date(hoje.getFullYear()+1,nascM,nascD); var diffMs = nextBday.getTime()-hoje.getTime(); var diasFalta = Math.ceil(diffMs/(1000*60*60*24)); var isToday2 = (nascM===hojeM&&nascD===hojeD); if (isToday2) diasFalta = 0; if (diasFalta>30&&!isToday2) continue; var age = hoje.getFullYear()-nascDate.getFullYear(); if (hojeM<nascM||(hojeM===nascM&&hojeD<nascD)) age--; if (isToday2) age = hoje.getFullYear()-nascDate.getFullYear(); birthdays.push({name:rows[i][1]||'',ct:rows[i][4]||'',data:('0'+nascD).slice(-2)+'/'+('0'+(nascM+1)).slice(-2),idade:age,diasFalta:diasFalta,isToday:isToday2}); }
    birthdays.sort(function(a,b){if(a.isToday&&!b.isToday)return -1;if(!a.isToday&&b.isToday)return 1;return a.diasFalta-b.diasFalta;});
    return ContentService.createTextOutput(JSON.stringify({success:true,birthdays:birthdays})).setMimeType(ContentService.MimeType.JSON);
  } catch(e) { return errorResponse('Erro: '+e.message); }
}

function handleDeactivateAccount(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  try {
    var targetEmail = authEmail; if (data.targetEmail&&isEmailAdmin(authEmail)) targetEmail = data.targetEmail.toString().trim().toLowerCase();
    if (isEmailSuperAdmin(targetEmail)) { return jsonResponse(false, 'Conta protegida — não pode ser desativada.'); }
    var alunosSheet = getSheet('Alunos'); var rows = alunosSheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) { if (rows[i][0]&&rows[i][0].toString().trim().toLowerCase()===targetEmail) { alunosSheet.getRange(i+1,26).setValue('DESATIVADO'); return jsonResponse(true,'Conta desabilitada'); } }
    return jsonResponse(false,'Conta não encontrada');
  } catch(e) { return errorResponse('Erro: '+e.message); }
}

function handleReactivateAccount(data) {
  var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  try {
    var targetEmail = data.targetEmail?data.targetEmail.toString().trim().toLowerCase():''; if (!targetEmail) return jsonResponse(false,'Email obrigatório');
    var alunosSheet = getSheet('Alunos'); var rows = alunosSheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) { if (rows[i][0]&&rows[i][0].toString().trim().toLowerCase()===targetEmail) { alunosSheet.getRange(i+1,26).setValue(''); return jsonResponse(true,'Conta reativada'); } }
    return jsonResponse(false,'Conta não encontrada');
  } catch(e) { return errorResponse('Erro: '+e.message); }
}

function handleCreateCT(data) {
  // 🔒 RECURSO PREMIUM — criação de filiais bloqueada no plano gratuito
  return jsonResponse(false, '🔒 Criar Filial / CT é um recurso dos planos pagos. Entre em contato para habilitar.');
}

function handleDeleteCT(data) {
  var saEmail = requireSuperAdmin(data); if (!saEmail) return forbiddenResponse();
  try {
    if (!data.nome) return jsonResponse(false,'Nome obrigatório'); var nome = data.nome.toString().trim();
    var ss = _getSpreadsheet(); var ctSheet = ss.getSheetByName('CTs'); if (!ctSheet) return jsonResponse(false,'Sheet CTs não encontrada');
    var rows = ctSheet.getDataRange().getValues();
    for (var i = rows.length-1; i >= 1; i--) { if (rows[i][0]&&rows[i][0].toString().trim().toLowerCase()===nome.toLowerCase()) { ctSheet.deleteRow(i+1); return jsonResponse(true,'CT excluído!'); } }
    return jsonResponse(false,'CT não encontrado');
  } catch(e) { return errorResponse('Erro: '+e.message); }
}

function getOrCreateExameConfigSheet() { var ss = _getSpreadsheet(); var sheet = ss.getSheetByName('ExameConfig'); if (!sheet) { sheet = ss.insertSheet('ExameConfig'); sheet.appendRow(['Faixa','Categoria','QtdSorteio','AtualizadoPor','AtualizadoEm']); sheet.getRange(1,1,1,5).setFontWeight('bold'); } return sheet; }

function handleSaveExameConfig(data) {
  var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  try {
    var faixa = (data.faixa||'').trim(); var configs = data.configs; if (!faixa || !configs || !configs.length) return jsonResponse(false, 'Dados incompletos');
    var sheet = getOrCreateExameConfigSheet(); var rows = sheet.getDataRange().getValues(); var now = new Date();
    for (var c = 0; c < configs.length; c++) { var cat = configs[c].categoria; var qtd = parseInt(configs[c].qtd)||0; var found = false; for (var i = 1; i < rows.length; i++) { if (rows[i][0]&&rows[i][0].toString().trim()===faixa&&rows[i][1]&&rows[i][1].toString().trim()===cat) { sheet.getRange(i+1,3).setValue(qtd); sheet.getRange(i+1,4).setValue(adminEmail); sheet.getRange(i+1,5).setValue(now); found = true; break; } } if (!found) { sheet.appendRow([faixa,cat,qtd,adminEmail,now]); rows.push([faixa,cat,qtd,adminEmail,now]); } }
    return jsonResponse(true, 'Configuração salva para faixa '+faixa+'!');
  } catch (e) { return errorResponse('Erro ao salvar config: '+e.message); }
}

function handleGetExameConfig(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  try { var sheet; try { sheet = getOrCreateExameConfigSheet(); } catch(e) { return ContentService.createTextOutput(JSON.stringify({success:true,configs:[]})).setMimeType(ContentService.MimeType.JSON); } var rows = sheet.getDataRange().getValues(); var configs = []; for (var i = 1; i < rows.length; i++) { if (!rows[i][0]) continue; configs.push({faixa:rows[i][0].toString().trim(),categoria:rows[i][1]?rows[i][1].toString().trim():'',qtd:parseInt(rows[i][2])||0}); } return ContentService.createTextOutput(JSON.stringify({success:true,configs:configs})).setMimeType(ContentService.MimeType.JSON); }
  catch (e) { return errorResponse('Erro: '+e.message); }
}


// ============================================================
// ===== PRESENÇA LIST, AULA PROFESSOR, SET PROFESSOR,
//       CRONOGRAMA, MUSCULAÇÃO, TREINOS CUSTOM,
//       IBJJF, MODULES, REPORT, SYSTEM HEALTH,
//       GAME SCORE, EXAM SLOTS, STUDENT INSIGHTS
// ============================================================

function parseDateInput(val) { if (!val) return null; var s = val.toString().trim(); var m1 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); if (m1) return new Date(parseInt(m1[3]),parseInt(m1[2])-1,parseInt(m1[1])); var m2 = s.match(/^(\d{4})-(\d{2})-(\d{2})$/); if (m2) return new Date(parseInt(m2[1]),parseInt(m2[2])-1,parseInt(m2[3])); return null; }

function autoDetectTurno(email, presencaRows) {
  var morningCount = 0, nightCount = 0, found = 0;
  for (var i = presencaRows.length-1; i >= 1 && found < 20; i--) { if (!presencaRows[i][0]) continue; if (presencaRows[i][0].toString().trim().toLowerCase() !== email) continue; if (getPresencaStatus(presencaRows[i]) !== 'APROVADO') continue; found++; var horaStr = formatTime(presencaRows[i][7])||formatTime(presencaRows[i][5])||''; if (!horaStr) continue; var hour = parseInt(horaStr.split(':')[0])||0; if (hour >= 6 && hour < 12) morningCount++; else if (hour >= 18 && hour <= 23) nightCount++; }
  if (morningCount === 0 && nightCount === 0) return ''; return morningCount >= nightCount ? 'Manhã' : 'Noite';
}

function handleGetPresencaList(data) {
  var authEmail = requireProfessorOrAdmin(data); if (!authEmail) return forbiddenResponse();
  try {
    var dataDe = data.dataDe?data.dataDe.toString().trim():''; var dataAte = data.dataAte?data.dataAte.toString().trim():'';
    if (!dataDe&&data.data){dataDe=data.data.toString().trim();dataAte=dataDe;}
    var ctFilter = data.ct ? data.ct.toString().trim() : ''; var modFilter = data.modalidade ? data.modalidade.toString().trim().toLowerCase() : '';
    var presencaSheet = getSheet('Presenca'); var pRows = presencaSheet.getDataRange().getValues(); var presencas = [];
    for (var i = 1; i < pRows.length; i++) {
      var email = pRows[i][0]?pRows[i][0].toString().trim().toLowerCase():''; if (!email) continue;
      if (getPresencaStatus(pRows[i])!=='APROVADO') continue;
      if (modFilter) { var pMod = pRows[i][10] ? pRows[i][10].toString().trim().toLowerCase() : ''; if (pMod && pMod !== modFilter) continue; if (!pMod && modFilter !== 'bjj_adulto') continue; }
      var pDateStr = ''; var dateVal = pRows[i][6];
      if (dateVal instanceof Date) pDateStr = Utilities.formatDate(dateVal,Session.getScriptTimeZone(),'yyyy-MM-dd');
      else if (dateVal) { var ds = dateVal.toString().trim(); if (ds.length>=10) pDateStr = ds.substring(0,10); }
      if (dataDe&&pDateStr<dataDe) continue; if (dataAte&&pDateStr>dataAte) continue;
      var pCT = pRows[i][4]?pRows[i][4].toString().trim():''; if (ctFilter&&pCT!==ctFilter) continue;
      var nome = pRows[i][1]?pRows[i][1].toString():email;
      var horarioVal = pRows[i][5]; var horario = '';
      if (horarioVal instanceof Date) horario = Utilities.formatDate(horarioVal,Session.getScriptTimeZone(),'HH:mm');
      else if (horarioVal) { var hmStr = horarioVal.toString().trim(); var hmMatch = hmStr.match(/(\d{1,2}:\d{2})/); if (hmMatch) horario = hmMatch[1]; else horario = hmStr; }
      presencas.push({email:email,nome:nome,ct:pCT,horario:horario,data:pDateStr,modalidade:pRows[i][10]?pRows[i][10].toString().trim():''});
    }
    return ContentService.createTextOutput(JSON.stringify({success:true,presencas:presencas})).setMimeType(ContentService.MimeType.JSON);
  } catch(e) { return errorResponse('Erro: '+e.message); }
}

function getOrCreateAulaProfSheet() { var ss = _getSpreadsheet(); var sheet = ss.getSheetByName('AulasProfessor'); if (!sheet) { sheet = ss.insertSheet('AulasProfessor'); sheet.appendRow(['Email','CT','Data','Horario','Valor','Tipo','CriadoEm']); } return sheet; }

function handleSaveAulaProfessor(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  if (!isEmailAdmin(authEmail)&&!isEmailProfessor(authEmail)) return forbiddenResponse();
  try { if (!data.ct||!data.data) return jsonResponse(false,'CT e Data obrigatórios'); getOrCreateAulaProfSheet().appendRow([authEmail,cleanField(data.ct,100),cleanField(data.data,20),cleanField(data.horario||'',10),cleanField(data.valor||'0',20),cleanField(data.tipo||'BJJ Adulto',50),new Date()]); return jsonResponse(true,'Aula registrada!'); }
  catch(e) { return errorResponse('Erro: '+e.message); }
}

function handleGetAulasProfessor(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  if (!isEmailAdmin(authEmail)&&!isEmailProfessor(authEmail)) return forbiddenResponse();
  try {
    var sheet = getOrCreateAulaProfSheet(); var rows = sheet.getDataRange().getValues(); var aulas = [];
    for (var i = rows.length-1; i >= 1; i--) { if (rows[i][0]&&rows[i][0].toString().trim().toLowerCase()===authEmail) { aulas.push({ct:rows[i][1]?rows[i][1].toString():'',data:rows[i][2]?rows[i][2].toString():'',horario:rows[i][3]?rows[i][3].toString():'',valor:rows[i][4]?rows[i][4].toString():'0',tipo:rows[i][5]?rows[i][5].toString():''}); if (aulas.length>=30) break; } }
    return ContentService.createTextOutput(JSON.stringify({success:true,aulas:aulas})).setMimeType(ContentService.MimeType.JSON);
  } catch(e) { return errorResponse('Erro: '+e.message); }
}

function handleSetProfessor(data) {
  var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  try {
    var targetEmail = data.targetEmail?data.targetEmail.toString().trim().toLowerCase():''; if (!targetEmail) return jsonResponse(false,'Email obrigatório');
    var isProfessor = data.isProfessor===true||data.isProfessor==='true'; var ctsList = data.ctsProfessor?cleanField(data.ctsProfessor,500):'';
    var alunosSheet = getSheet('Alunos'); var rows = alunosSheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) { if (rows[i][0]&&rows[i][0].toString().trim().toLowerCase()===targetEmail) { alunosSheet.getRange(i+1,27).setValue(isProfessor?'professor':''); alunosSheet.getRange(i+1,28).setValue(isProfessor?ctsList:''); return jsonResponse(true,isProfessor?'Professor configurado!':'Perfil professor removido'); } }
    return jsonResponse(false,'Aluno não encontrado');
  } catch(e) { return errorResponse('Erro: '+e.message); }
}

// ── v5.1: Permissões dinâmicas por professor ──────────────────────────────

/**
 * Admin salva as permissões habilitadas para um professor específico.
 * Persiste array JSON na col AD (índice 29, getRange col 30).
 */
function handleSaveProfessorPerms(data) {
  var adminEmail = requireAdmin(data);
  if (!adminEmail) return forbiddenResponse();
  if (!data.targetEmail) return jsonResponse(false, 'Email do professor obrigatório');
  var targetEmail = data.targetEmail.toString().trim().toLowerCase();

  // Valida payload: deve ser array de action ids
  var perms = [];
  try {
    var raw = data.perms;
    if (typeof raw === 'string') raw = JSON.parse(raw);
    if (!Array.isArray(raw)) return jsonResponse(false, 'perms deve ser array');
    // Só aceita action ids que estão em PROFESSOR_DYNAMIC_PERMS
    perms = raw.filter(function(p) { return PROFESSOR_DYNAMIC_PERMS[p] !== undefined; });
  } catch(e) { return jsonResponse(false, 'JSON inválido'); }

  try {
    var sheet = getSheet('Alunos');
    var rows  = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0]) continue;
      if (rows[i][0].toString().trim().toLowerCase() !== targetEmail) continue;
      // Garante que é professor
      var tipo = rows[i][26] ? rows[i][26].toString().trim().toLowerCase() : '';
      if (tipo !== 'professor' && !(rows[i][6] === true || rows[i][6] === 'TRUE')) {
        return jsonResponse(false, 'Usuário não é professor');
      }
      sheet.getRange(i + 1, 30).setValue(JSON.stringify(perms)); // col AD
      Logger.log('Admin ' + adminEmail + ' configurou perms de ' + targetEmail + ': ' + JSON.stringify(perms));
      return jsonResponse(true, 'Permissões salvas!', { perms: perms });
    }
    return jsonResponse(false, 'Professor não encontrado');
  } catch(e) { return errorResponse('Erro: ' + e.message); }
}

/**
 * Retorna as permissões atuais de um professor + catálogo completo de opções.
 * Admin usa para montar a UI de configuração.
 */
function handleGetProfessorPermsConfig(data) {
  var adminEmail = requireAdmin(data);
  if (!adminEmail) return forbiddenResponse();
  if (!data.targetEmail) return jsonResponse(false, 'Email obrigatório');
  var targetEmail = data.targetEmail.toString().trim().toLowerCase();

  try {
    var currentPerms = getProfessorPerms(targetEmail);
    var catalog = Object.keys(PROFESSOR_DYNAMIC_PERMS).map(function(k) {
      return {
        action:   k,
        label:    PROFESSOR_DYNAMIC_PERMS[k].label,
        enabled:  currentPerms.indexOf(k) !== -1,
        default:  PROFESSOR_DYNAMIC_PERMS[k].default
      };
    });
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      targetEmail: targetEmail,
      perms: currentPerms,
      catalog: catalog
    })).setMimeType(ContentService.MimeType.JSON);
  } catch(e) { return errorResponse('Erro: ' + e.message); }
}
// ─────────────────────────────────────────────────────────────────────────────

function handleGetReportData(data) {
  var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  try {
    var alunosSheet = getSheet('Alunos'); var aRows = alunosSheet.getDataRange().getValues(); var presencaSheet = getSheet('Presenca'); var pRows = presencaSheet.getDataRange().getValues();
    var now = new Date(); var today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); var dateFrom = today, dateTo = today;
    if (data.dateFrom) { var df = parseDateInput(data.dateFrom); if (df) dateFrom = df; } if (data.dateTo) { var dt2 = parseDateInput(data.dateTo); if (dt2) dateTo = dt2; }
    var filterCT = data.filterCT || ''; var totalAlunos = 0, faixaCount = {}, ctCount = {}, alunosAtivos = {}, treinosHoje = 0, treinosRange = 0;
    for (var i = 1; i < aRows.length; i++) { if (!aRows[i][0]) continue; var acctStatus = aRows[i][25] ? aRows[i][25].toString().toUpperCase() : ''; if (acctStatus === 'DESATIVADO') continue; var sCT = aRows[i][4] ? aRows[i][4].toString().trim() : ''; if (filterCT && sCT !== filterCT) continue; totalAlunos++; var faixa = aRows[i][2] ? aRows[i][2].toString() : 'Branca'; if (!faixaCount[faixa]) faixaCount[faixa] = 0; faixaCount[faixa]++; if (sCT) { if (!ctCount[sCT]) ctCount[sCT] = 0; ctCount[sCT]++; } }
    for (var p = 1; p < pRows.length; p++) { if (!pRows[p][0]) continue; var pStatus = getPresencaStatus(pRows[p]); if (pStatus !== 'APROVADO') continue; var pCT = pRows[p][4] ? pRows[p][4].toString().trim() : ''; if (filterCT && pCT !== filterCT) continue; var pDate = pRows[p][6]; if (!pDate) continue; var pd = (pDate instanceof Date) ? pDate : new Date(pDate); if (isNaN(pd.getTime())) continue; var pDay = new Date(pd.getFullYear(), pd.getMonth(), pd.getDate()); if (pDay.getTime() === today.getTime()) treinosHoje++; if (pDay >= dateFrom && pDay <= dateTo) { treinosRange++; var pe = pRows[p][0].toString().trim().toLowerCase(); alunosAtivos[pe] = true; } }
    var faixaArr = [], faixaKeys = Object.keys(faixaCount); for (var f = 0; f < faixaKeys.length; f++) faixaArr.push({faixa:faixaKeys[f],total:faixaCount[faixaKeys[f]]}); faixaArr.sort(function(a,b){return b.total-a.total;});
    var ctArr = [], ctKeys = Object.keys(ctCount); for (var c = 0; c < ctKeys.length; c++) ctArr.push({ct:ctKeys[c],total:ctCount[ctKeys[c]]}); ctArr.sort(function(a,b){return b.total-a.total;});
    return ContentService.createTextOutput(JSON.stringify({ success:true, totalAlunos:totalAlunos, treinosHoje:treinosHoje, treinosRange:treinosRange, alunosAtivos:Object.keys(alunosAtivos).length, faixaCount:faixaArr, ctCount:ctArr, dateFrom:data.dateFrom||'', dateTo:data.dateTo||'', filterCT:filterCT })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) { Logger.log('Erro getReportData: '+error.message); return errorResponse('Erro ao gerar relatório'); }
}

function handleGetStudentInsights(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  var targetEmail = authEmail; if (data.targetEmail && (isEmailAdmin(authEmail) || isEmailProfessor(authEmail))) targetEmail = data.targetEmail.toString().trim().toLowerCase();
  try {
    var presencaSheet = getSheet('Presenca'); var pRows = presencaSheet.getDataRange().getValues(); var now = new Date(); var weekMs = 7*24*60*60*1000; var monthMs = 30*24*60*60*1000;
    var total = 0, thisWeek = 0, thisMonth = 0, byDow = {}, byHour = {}; var lastDate = null;
    for (var i = 1; i < pRows.length; i++) { if (!pRows[i][0]) continue; if (pRows[i][0].toString().trim().toLowerCase() !== targetEmail) continue; if (getPresencaStatus(pRows[i]) !== 'APROVADO') continue; var pd = pRows[i][6]; if (!pd) continue; var d = (pd instanceof Date) ? pd : new Date(pd); if (isNaN(d.getTime())) continue; total++; var diff = now.getTime() - d.getTime(); if (diff <= weekMs) thisWeek++; if (diff <= monthMs) thisMonth++; if (!lastDate || d > lastDate) lastDate = d; var dayKey = ['dom','seg','ter','qua','qui','sex','sab'][d.getDay()]; if (!byDow[dayKey]) byDow[dayKey] = 0; byDow[dayKey]++; var horaStr = formatTime(pRows[i][7])||formatTime(pRows[i][5])||''; if (horaStr) { var hk = horaStr.substring(0,2); if (!byHour[hk]) byHour[hk] = 0; byHour[hk]++; } }
    var favDay = Object.keys(byDow).reduce(function(max,k){return byDow[k]>byDow[max]?k:max;},'seg');
    var favHour = Object.keys(byHour).reduce(function(max,k){return byHour[k]>byHour[max]?k:max;},'');
    return ContentService.createTextOutput(JSON.stringify({ success:true, total:total, thisWeek:thisWeek, thisMonth:thisMonth, lastCheckin:lastDate?lastDate.toISOString():null, favDay:favDay, favHour:favHour?favHour+':00':'', byDow:byDow, byHour:byHour })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) { return errorResponse('Erro ao buscar insights'); }
}

function handleGetSystemHealth(data) {
  var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  try {
    var alunosSheet = getSheet('Alunos'); var aRows = alunosSheet.getDataRange().getValues(); var presencaSheet = getSheet('Presenca'); var pRows = presencaSheet.getDataRange().getValues();
    var totalAlunos = 0, totalDesativados = 0, totalPresencas = 0, presencasHoje = 0;
    for (var i = 1; i < aRows.length; i++) { if (!aRows[i][0]) continue; totalAlunos++; var st = aRows[i][25] ? aRows[i][25].toString().toUpperCase() : ''; if (st === 'DESATIVADO') totalDesativados++; }
    for (var p = 1; p < pRows.length; p++) { if (!pRows[p][0]) continue; if (getPresencaStatus(pRows[p]) === 'APROVADO') { totalPresencas++; if (isToday(pRows[p][6])) presencasHoje++; } }
    return ContentService.createTextOutput(JSON.stringify({ success:true, totalAlunos:totalAlunos, totalDesativados:totalDesativados, totalPresencas:totalPresencas, presencasHoje:presencasHoje, sheetsOk:true, serverTime:new Date().toISOString() })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) { return errorResponse('Erro ao verificar saúde do sistema'); }
}

function handleSaveGameScore(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  try {
    if (!data.gameId || data.score === undefined) return jsonResponse(false, 'gameId e score obrigatórios');
    var ss = _getSpreadsheet(); var sheet = ss.getSheetByName('GameRanking'); if (!sheet) { sheet = ss.insertSheet('GameRanking'); sheet.appendRow(['Email','GameId','Score','Nome','Data']); }
    var rows = sheet.getDataRange().getValues(); var score = parseInt(data.score)||0;
    var alunosSheet = getSheet('Alunos'); var aRows = alunosSheet.getDataRange().getValues(); var nome = '';
    for (var a = 1; a < aRows.length; a++) { if (aRows[a][0]&&aRows[a][0].toString().trim().toLowerCase()===authEmail) { nome = aRows[a][1]?aRows[a][1].toString():''; break; } }
    var updated = false;
    for (var i = 1; i < rows.length; i++) { if (rows[i][0]&&rows[i][0].toString().trim().toLowerCase()===authEmail&&rows[i][1]&&rows[i][1].toString().trim()===data.gameId) { if (score > (parseInt(rows[i][2])||0)) { sheet.getRange(i+1,3).setValue(score); sheet.getRange(i+1,5).setValue(new Date()); } updated = true; break; } }
    if (!updated) sheet.appendRow([authEmail,data.gameId,score,nome,new Date()]);
    return jsonResponse(true, 'Score salvo!', {score:score});
  } catch(e) { return errorResponse('Erro ao salvar score'); }
}

function handleGetGameRanking(data) {
  try {
    var gameId = (data.gameId||'').trim(); if (!gameId) return jsonResponse(false, 'gameId obrigatório');
    var ss = _getSpreadsheet(); var sheet = ss.getSheetByName('GameRanking'); if (!sheet) return ContentService.createTextOutput(JSON.stringify({success:true,ranking:[]})).setMimeType(ContentService.MimeType.JSON);
    var rows = sheet.getDataRange().getValues(); var ranking = [];
    for (var i = 1; i < rows.length; i++) { if (!rows[i][0]) continue; if (rows[i][1]&&rows[i][1].toString().trim()===gameId) ranking.push({email:rows[i][0].toString(),score:parseInt(rows[i][2])||0,nome:rows[i][3]?rows[i][3].toString():''}); }
    ranking.sort(function(a,b){return b.score-a.score;});
    return ContentService.createTextOutput(JSON.stringify({success:true,ranking:ranking.slice(0,20)})).setMimeType(ContentService.MimeType.JSON);
  } catch(e) { return errorResponse('Erro ao buscar ranking'); }
}


// ============================================================
// ===== CRONOGRAMA AULAS =====
// ============================================================

function getOrCreateCronogramaSheet() {
  var ss = _getSpreadsheet();
  var sheet = ss.getSheetByName('CronogramaAulas');
  if (!sheet) {
    sheet = ss.insertSheet('CronogramaAulas');
    sheet.appendRow(['Data','CT','Horario','Tema','Descricao','Tecnicas','Modulo','Professor','CriadoEm','Modalidade']);
    sheet.getRange(1,1,1,10).setFontWeight('bold');
  } else {
    // Retrocompatibilidade: garante que a coluna Modalidade existe
    if (sheet.getLastColumn() < 10) {
      sheet.getRange(1, 10).setValue('Modalidade').setFontWeight('bold');
    }
  }
  return sheet;
}

function handleSaveCronogramaAula(data) {
  var adminEmail = requireProfessorOrAdmin(data); if (!adminEmail) return forbiddenResponse();
  try {
    if (!data.tema) return jsonResponse(false, 'Tema é obrigatório');
    var sheet = getOrCreateCronogramaSheet(); var now = new Date();
    if (data.rowIndex) { var ri = parseInt(data.rowIndex); var dataStr = (data.data || '').toString().trim(); var horStr = (data.horario || '').toString().trim(); sheet.getRange(ri,1).setNumberFormat('@').setValue(dataStr); sheet.getRange(ri,2).setValue(data.ct||''); sheet.getRange(ri,3).setNumberFormat('@').setValue(horStr); sheet.getRange(ri,4).setValue(data.tema); sheet.getRange(ri,5).setValue(data.descricao||''); sheet.getRange(ri,8).setValue(adminEmail); sheet.getRange(ri,9).setValue(now); sheet.getRange(ri,10).setValue(data.modalidade||''); return jsonResponse(true, 'Aula atualizada!'); }
    var ctsList = data.cts ? data.cts.toString().split(',').map(function(c){return c.trim();}).filter(function(c){return c;}) : (data.ct ? [data.ct.toString().trim()] : []);
    if (ctsList.length === 0) return jsonResponse(false, 'Selecione pelo menos um CT');
    var datesList = data.datas ? data.datas.toString().split(',').map(function(d){return d.trim();}).filter(function(d){return d;}) : (data.data ? [data.data.toString().trim()] : []);
    if (datesList.length === 0) return jsonResponse(false, 'Selecione pelo menos uma data');
    if (datesList.length * ctsList.length > 200) return jsonResponse(false, 'Máximo 200 aulas por vez');
    var horario = (data.horario || '').toString().trim();
    var modalidade = (data.modalidade || '').toString().trim();
    var existing = {}; var allRows = sheet.getDataRange().getValues();
    for (var e = 1; e < allRows.length; e++) { if (!allRows[e][0]) continue; var eDt = allRows[e][0]; var eDateStr = (eDt instanceof Date) ? Utilities.formatDate(eDt, Session.getScriptTimeZone(), 'yyyy-MM-dd') : eDt.toString(); var eCt = allRows[e][1] ? allRows[e][1].toString().trim() : ''; var eTema = allRows[e][3] ? allRows[e][3].toString().trim() : ''; existing[eDateStr+'|'+eCt+'|'+eTema] = true; }
    var newRows = [];
    for (var ci = 0; ci < ctsList.length; ci++) { for (var di = 0; di < datesList.length; di++) { var dupKey = datesList[di]+'|'+ctsList[ci]+'|'+data.tema.trim(); if (!existing[dupKey]) { newRows.push([datesList[di], ctsList[ci], horario, data.tema, data.descricao||'', '', '', adminEmail, now, modalidade]); existing[dupKey] = true; } } }
    if (newRows.length === 0) return jsonResponse(false, 'Todas as combinações já estão cadastradas');
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow+1, 1, newRows.length, 1).setNumberFormat('@');
    sheet.getRange(lastRow+1, 3, newRows.length, 1).setNumberFormat('@');
    sheet.getRange(lastRow+1, 1, newRows.length, 10).setValues(newRows);
    return jsonResponse(true, newRows.length+' aula(s) cadastrada(s) em '+ctsList.length+' CT(s)!');
  } catch (e) { return errorResponse('Erro: '+e.message); }
}

function handleDeleteCronogramaAula(data) {
  var adminEmail = requireProfessorOrAdmin(data); if (!adminEmail) return forbiddenResponse();
  try {
    if (data.deleteTema) { var sheet = getOrCreateCronogramaSheet(); var rows = sheet.getDataRange().getValues(); var deleted = 0; for (var i = rows.length-1; i >= 1; i--) { if ((rows[i][3]||'').toString().trim() === data.deleteTema.toString().trim()) { sheet.deleteRow(i+1); deleted++; } } return jsonResponse(true, deleted+' aula(s) removida(s)!'); }
    if (data.deleteSerieKey) { var sheet2 = getOrCreateCronogramaSheet(); var rows2 = sheet2.getDataRange().getValues(); var parts = data.deleteSerieKey.split('|'); var serieCT = parts[0]||''; var serieTema = parts[1]||''; var deleted2 = 0; for (var j = rows2.length-1; j >= 1; j--) { if ((rows2[j][1]||'').toString().trim()===serieCT&&(rows2[j][3]||'').toString().trim()===serieTema) { sheet2.deleteRow(j+1); deleted2++; } } return jsonResponse(true, deleted2+' aulas removidas!'); }
    if (!data.rowIndex) return jsonResponse(false, 'Aula não encontrada');
    getOrCreateCronogramaSheet().deleteRow(parseInt(data.rowIndex));
    return jsonResponse(true, 'Aula removida!');
  } catch (e) { return errorResponse('Erro: '+e.message); }
}

function getOrCreateAulaValidacaoSheet() { var ss = _getSpreadsheet(); var sheet = ss.getSheetByName('AulaValidacao'); if (!sheet) { sheet = ss.insertSheet('AulaValidacao'); sheet.appendRow(['Email','AulaData','AulaCT','ValidacoesJSON','EstudouSozinho','DataValidacao']); sheet.getRange(1,1,1,6).setFontWeight('bold'); } return sheet; }

function handleValidateAulaTecnicas(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  try {
    if (!data.aulaData || !data.aulaCT) return jsonResponse(false, 'Dados da aula incompletos');
    var sheet = getOrCreateAulaValidacaoSheet(); var rows = sheet.getDataRange().getValues(); var now = new Date();
    for (var i = 1; i < rows.length; i++) { if (rows[i][0]&&rows[i][0].toString().trim().toLowerCase()===authEmail&&rows[i][1]&&rows[i][1].toString().trim()===data.aulaData&&rows[i][2]&&rows[i][2].toString().trim()===data.aulaCT) { sheet.getRange(i+1,4).setValue(data.validacoes||'{}'); sheet.getRange(i+1,6).setValue(now); return jsonResponse(true,'Validação salva!'); } }
    sheet.appendRow([authEmail,data.aulaData,data.aulaCT,data.validacoes||'{}',false,now]);
    return jsonResponse(true,'Validação salva!');
  } catch (e) { return errorResponse('Erro: '+e.message); }
}

function handleMarcarEstudouSozinho(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  try {
    if (!data.aulaData || !data.aulaCT) return jsonResponse(false, 'Dados da aula incompletos');
    var sheet = getOrCreateAulaValidacaoSheet(); var rows = sheet.getDataRange().getValues(); var now = new Date();
    for (var i = 1; i < rows.length; i++) { if (rows[i][0]&&rows[i][0].toString().trim().toLowerCase()===authEmail&&rows[i][1]&&rows[i][1].toString().trim()===data.aulaData&&rows[i][2]&&rows[i][2].toString().trim()===data.aulaCT) { sheet.getRange(i+1,5).setValue(true); sheet.getRange(i+1,6).setValue(now); return jsonResponse(true,'Marcado como estudado!'); } }
    sheet.appendRow([authEmail,data.aulaData,data.aulaCT,'{}',true,now]);
    return jsonResponse(true,'Marcado como estudado!');
  } catch (e) { return errorResponse('Erro: '+e.message); }
}

function handleGetCronogramaAulas(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  try {
    var sheet; try{sheet=getOrCreateCronogramaSheet();}catch(e){return ContentService.createTextOutput(JSON.stringify({success:true,aulas:[]})).setMimeType(ContentService.MimeType.JSON);}
    var rows = sheet.getDataRange().getValues(); var filterCT = data.ct || ''; var isAdm = isEmailAdmin(authEmail) || isEmailProfessor(authEmail);

    // ── Filtro de modalidade para ALUNOS ────────────────────────────────────
    // Admins/professores recebem TUDO.
    // Alunos recebem SOMENTE aulas da modalidade ATIVA (data.modalidade).
    // Dois filtros distintos com variáveis separadas:
    //   • filterModalidade        → quais aulas aparecem (modalidade ativa)
    //   • filterModalidadePresenca → qual check-in conta como "presente" (idem)
    // Aulas sem modalidade (legado/vazio) são sempre exibidas.
    var filterModalidade         = '';  // filtra aulas exibidas
    var filterModalidadePresenca = '';  // filtra coloração de presença
    if (!isAdm && data.modalidade) {
      filterModalidade         = data.modalidade.toString().trim().toLowerCase();
      filterModalidadePresenca = filterModalidade;
    }
    // ───────────────────────────────────────────────────────────────────────

    if (!isAdm && data.email) { var alunosSheet = getSheet('Alunos'); var aRows = alunosSheet.getDataRange().getValues(); for (var a = 1; a < aRows.length; a++) { if (aRows[a][0] && aRows[a][0].toString().trim().toLowerCase() === authEmail) { if (!filterCT) filterCT = aRows[a][4] ? aRows[a][4].toString().trim() : ''; var liberados = aRows[a][28] ? aRows[a][28].toString().split(',').map(function(x){return x.trim();}).filter(Boolean) : []; if (liberados.length > 0 && filterCT) filterCT = ''; break; } } }
    var presencaSheet = getSheet('Presenca'); var pRows = presencaSheet.getDataRange().getValues(); var studentDates = {};
    for (var p = 1; p < pRows.length; p++) { if (!pRows[p][0]||pRows[p][0].toString().trim().toLowerCase()!==authEmail) continue; if (getPresencaStatus(pRows[p])!=='APROVADO') continue; var pd = pRows[p][6]; if (!pd) continue; pd = (pd instanceof Date)?pd:new Date(pd); if (isNaN(pd.getTime())) continue;
      // ── Filtro por modalidade na presença ────────────────────────────────
      // Só marca o dia como "presente" se o check-in foi na modalidade ATIVA.
      // Registros legados (col K vazia) são sempre aceitos.
      if (filterModalidadePresenca) {
        var _cronoRowMod = pRows[p][10] ? pRows[p][10].toString().trim().toLowerCase() : '';
        if (_cronoRowMod && _cronoRowMod !== filterModalidadePresenca) continue;
      }
      // ──────────────────────────────────────────────────────────────────────
      studentDates[Utilities.formatDate(pd,Session.getScriptTimeZone(),'yyyy-MM-dd')] = true; }
    var validacoes = {};
    try { var valSheet = getOrCreateAulaValidacaoSheet(); var valRows = valSheet.getDataRange().getValues(); for (var v = 1; v < valRows.length; v++) { if (!valRows[v][0]||valRows[v][0].toString().trim().toLowerCase()!==authEmail) continue; var vKey = (valRows[v][1]||'').toString().trim()+'|'+(valRows[v][2]||'').toString().trim(); var estudou = valRows[v][4]===true||valRows[v][4]==='TRUE'||valRows[v][4]==='true'; try{validacoes[vKey]={tecnicas:JSON.parse((valRows[v][3]||'').toString()||'{}'),estudou:estudou};}catch(x){validacoes[vKey]={tecnicas:{},estudou:estudou};} } } catch(ve){}
    var aulas = []; var today = new Date(); var todayStr = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0]) continue;
      var dt = rows[i][0]; var dateStr = '';
      if (dt instanceof Date) { dateStr = Utilities.formatDate(dt, Session.getScriptTimeZone(), 'yyyy-MM-dd'); }
      else { var raw = dt.toString().trim(); var mISO = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/); var mBR = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); if (mISO) dateStr = raw; else if (mBR) dateStr = mBR[3] + '-' + mBR[2].padStart(2,'0') + '-' + mBR[1].padStart(2,'0'); else continue; }
      if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) continue;
      var ct = rows[i][1] ? rows[i][1].toString().trim() : ''; if (filterCT && ct !== filterCT) continue;

      // ── TRAVA DE MODALIDADE ──────────────────────────────────────────────
      // Aluno vê SOMENTE aulas da modalidade ativa.
      // Aulas com modalidade vazia (legado) são sempre visíveis.
      var aulaModalidade = rows[i][9] ? rows[i][9].toString().trim().toLowerCase() : '';
      if (filterModalidade && aulaModalidade && aulaModalidade !== filterModalidade) continue;
      // ────────────────────────────────────────────────────────────────────

      var dtDate = parseDateInput(dateStr); var isPast = dtDate && dtDate < today && dateStr !== todayStr; var isTodayAula = dateStr === todayStr; var presente = studentDates[dateStr] || false;
      var status = 'futuro'; if (isTodayAula) status = presente ? 'presente_hoje' : 'hoje'; else if (isPast) status = presente ? 'presente' : 'ausente';
      var tecStr = rows[i][5] ? rows[i][5].toString() : ''; var tecArray = tecStr ? tecStr.split(',').map(function(t){return t.trim();}).filter(function(t){return t;}) : [];
      var valKey = dateStr+'|'+ct; var val = validacoes[valKey] || {tecnicas:{}, estudou:false};
      var dominadas = 0, revisar = 0; for (var k in val.tecnicas) { if (val.tecnicas[k]===1) dominadas++; else if (val.tecnicas[k]===0) revisar++; }
      if (status==='ausente' && val.estudou) status = 'estudou';
      aulas.push({ rowIndex: i+1, data: dateStr, ct: ct, horario: formatTime(rows[i][2]), tema: rows[i][3] ? rows[i][3].toString() : '', descricao: rows[i][4] ? rows[i][4].toString() : '', tecnicas: tecArray, modulo: rows[i][6] ? rows[i][6].toString() : '', professor: rows[i][7] ? rows[i][7].toString() : '', modalidade: rows[i][9] ? rows[i][9].toString().trim() : '', status: status, validacao: val.tecnicas, estudou: val.estudou, dominadas: dominadas, revisar: revisar, totalTec: tecArray.length });
    }
    aulas.sort(function(a,b){ var aT=(a.status==='hoje'||a.status==='presente_hoje'),bT=(b.status==='hoje'||b.status==='presente_hoje'); if (aT&&!bT) return -1; if (!aT&&bT) return 1; var aF=a.status==='futuro',bF=b.status==='futuro'; if (aF&&!bF) return -1; if (!aF&&bF) return 1; if (aF&&bF) return a.data<b.data?-1:1; return a.data>b.data?-1:a.data<b.data?1:0; });
    return ContentService.createTextOutput(JSON.stringify({ success: true, aulas: aulas, studentCT: filterCT, debug_total: aulas.length, debug_isAdm: isAdm })).setMimeType(ContentService.MimeType.JSON);
  } catch (e) { return errorResponse('Erro: '+e.message); }
}


// ============================================================
// ===== MUSCULAÇÃO =====
// ============================================================

function getOrCreateMusculacaoSheet(name) { var ss = _getSpreadsheet(); var sheet = ss.getSheetByName(name); if (!sheet) { sheet = ss.insertSheet(name); if (name==='FichaMusculacao') sheet.appendRow(['Email','FichaJSON','UpdatedAt']); else if (name==='LogMusculacao') sheet.appendRow(['Email','Data','DoneJSON','UpdatedAt']); } return sheet; }

function handleGetMusculacao(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  try {
    var fichaSheet = getOrCreateMusculacaoSheet('FichaMusculacao'); var fichaRows = fichaSheet.getDataRange().getValues(); var ficha = null;
    for (var i = 1; i < fichaRows.length; i++) { if (fichaRows[i][0]&&fichaRows[i][0].toString().trim().toLowerCase()===authEmail) { try{ficha=JSON.parse(fichaRows[i][1]);}catch(x){} break; } }
    var logSheet = getOrCreateMusculacaoSheet('LogMusculacao'); var logRows = logSheet.getDataRange().getValues(); var logs = {};
    var cutoff = new Date(); cutoff.setDate(cutoff.getDate()-60); var cutoffStr = Utilities.formatDate(cutoff,Session.getScriptTimeZone(),'yyyy-MM-dd');
    for (var j = 1; j < logRows.length; j++) { if (!logRows[j][0]||logRows[j][0].toString().trim().toLowerCase()!==authEmail) continue; var dateStr = logRows[j][1]?logRows[j][1].toString().trim():''; if (dateStr<cutoffStr) continue; try{logs[dateStr]=JSON.parse(logRows[j][2]);}catch(x){logs[dateStr]=[];} }
    return ContentService.createTextOutput(JSON.stringify({success:true,ficha:ficha,logs:logs})).setMimeType(ContentService.MimeType.JSON);
  } catch(e) { return errorResponse('Erro: '+e.message); }
}

function handleSaveMusculacaoFicha(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  try {
    if (!data.ficha) return jsonResponse(false,'Ficha vazia'); var fichaObj; try{fichaObj=JSON.parse(data.ficha);}catch(x){return jsonResponse(false,'JSON inválido');}
    if (!Array.isArray(fichaObj)||fichaObj.length===0) return jsonResponse(false,'Ficha vazia'); if (fichaObj.length>7) return jsonResponse(false,'Máximo 7 dias');
    var sheet = getOrCreateMusculacaoSheet('FichaMusculacao'); var rows = sheet.getDataRange().getValues(); var now = new Date();
    for (var i = 1; i < rows.length; i++) { if (rows[i][0]&&rows[i][0].toString().trim().toLowerCase()===authEmail) { sheet.getRange(i+1,2).setValue(data.ficha); sheet.getRange(i+1,3).setValue(now); return jsonResponse(true,'Ficha atualizada!'); } }
    sheet.appendRow([authEmail,data.ficha,now]); return jsonResponse(true,'Ficha criada!');
  } catch(e) { return errorResponse('Erro: '+e.message); }
}

function handleSaveMusculacaoLog(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  try {
    if (!data.data||!data.done) return jsonResponse(false,'Dados incompletos');
    var dateStr = data.data.toString().trim(); var sheet = getOrCreateMusculacaoSheet('LogMusculacao'); var rows = sheet.getDataRange().getValues(); var now = new Date();
    var logObj; try{logObj=JSON.parse(data.done);}catch(x){logObj={treinoId:'',done:[]};}
    var isEmpty = Array.isArray(logObj)?(logObj.length===0):((!logObj.treinoId||logObj.treinoId==='')&&(!logObj.done||logObj.done.length===0));
    for (var i = 1; i < rows.length; i++) { if (rows[i][0]&&rows[i][0].toString().trim().toLowerCase()===authEmail&&rows[i][1]&&rows[i][1].toString().trim()===dateStr) { if (isEmpty) sheet.deleteRow(i+1); else { sheet.getRange(i+1,3).setValue(data.done); sheet.getRange(i+1,4).setValue(now); } return jsonResponse(true,'OK'); } }
    if (!isEmpty) sheet.appendRow([authEmail,dateStr,data.done,now]);
    return jsonResponse(true,'OK');
  } catch(e) { return errorResponse('Erro: '+e.message); }
}

function handleDeleteMusculacaoFicha(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  try { var sheet = getOrCreateMusculacaoSheet('FichaMusculacao'); var rows = sheet.getDataRange().getValues(); for (var i = rows.length-1; i >= 1; i--) { if (rows[i][0]&&rows[i][0].toString().trim().toLowerCase()===authEmail) sheet.deleteRow(i+1); } return jsonResponse(true,'Ficha removida!'); }
  catch(e) { return errorResponse('Erro: '+e.message); }
}

// ============================================================
// ===== TREINOS CUSTOM =====
// ============================================================

function getOrCreateTreinosSheet() { var ss = _getSpreadsheet(); var sheet = ss.getSheetByName('TreinosCustom'); if (!sheet) { sheet = ss.insertSheet('TreinosCustom'); sheet.appendRow(['ID','Nome','Descricao','Exercicios','Cor','CriadoPor','CriadoEm','Ativo']); sheet.getRange(1,1,1,8).setFontWeight('bold'); } return sheet; }
function getOrCreateTreinosLogSheet() { var ss = _getSpreadsheet(); var sheet = ss.getSheetByName('TreinosLog'); if (!sheet) { sheet = ss.insertSheet('TreinosLog'); sheet.appendRow(['Email','Nome','TreinoID','TreinoNome','Data','Duracao','Observacao','Timestamp']); sheet.getRange(1,1,1,8).setFontWeight('bold'); } return sheet; }

function handleGetTreinosCustom(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  try { var sheet = getOrCreateTreinosSheet(); var rows = sheet.getDataRange().getValues(); var treinos = []; for (var i = 1; i < rows.length; i++) { if (!rows[i][0]) continue; if (rows[i][7] === false || rows[i][7] === 'FALSE') continue; var exs = []; try { exs = JSON.parse(rows[i][3] || '[]'); } catch(e) {} treinos.push({ id: rows[i][0].toString(), nome: rows[i][1] ? rows[i][1].toString() : '', descricao: rows[i][2] ? rows[i][2].toString() : '', exercicios: exs, cor: rows[i][4] ? rows[i][4].toString() : '#3b82f6', criadoPor: rows[i][5] ? rows[i][5].toString() : '', criadoEm: rows[i][6] ? rows[i][6].toString() : '', rowIndex: i + 1 }); } return ContentService.createTextOutput(JSON.stringify({ success: true, treinos: treinos })).setMimeType(ContentService.MimeType.JSON); }
  catch(e) { return errorResponse('Erro: ' + e.message); }
}

function handleSaveTreinoCustom(data) {
  var authEmail = requireProfessorOrAdmin(data); if (!authEmail) return forbiddenResponse();
  try {
    var sheet = getOrCreateTreinosSheet(); var nome = cleanField(data.nome || '', 100); var descricao = cleanField(data.descricao || '', 300); var cor = (data.cor || '#3b82f6').toString().trim(); var exs = []; if (typeof data.exercicios === 'string') { try { exs = JSON.parse(data.exercicios); } catch(e) {} } else if (Array.isArray(data.exercicios)) { exs = data.exercicios; }
    if (!nome) return jsonResponse(false, 'Nome obrigatório');
    var id = data.id ? data.id.toString() : 'ct_' + new Date().getTime(); var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) { if (rows[i][0] && rows[i][0].toString() === id) { sheet.getRange(i+1,2).setValue(nome); sheet.getRange(i+1,3).setValue(descricao); sheet.getRange(i+1,4).setValue(JSON.stringify(exs)); sheet.getRange(i+1,5).setValue(cor); return jsonResponse(true, 'Treino atualizado!'); } }
    sheet.appendRow([id, nome, descricao, JSON.stringify(exs), cor, authEmail, new Date(), true]); return jsonResponse(true, 'Treino criado!');
  } catch(e) { return errorResponse('Erro: ' + e.message); }
}

function handleDeleteTreinoCustom(data) {
  var authEmail = requireProfessorOrAdmin(data); if (!authEmail) return forbiddenResponse();
  try { var id = data.id ? data.id.toString() : ''; if (!id) return jsonResponse(false, 'ID obrigatório'); var sheet = getOrCreateTreinosSheet(); var rows = sheet.getDataRange().getValues(); for (var i = 1; i < rows.length; i++) { if (rows[i][0] && rows[i][0].toString() === id) { sheet.getRange(i+1, 8).setValue(false); return jsonResponse(true, 'Treino removido!'); } } return jsonResponse(false, 'Treino não encontrado'); }
  catch(e) { return errorResponse('Erro: ' + e.message); }
}

function handleSaveTreinoRealizado(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  try {
    var treinoId = (data.treinoId || '').toString().trim(); var treinoNome = (data.treinoNome || '').toString().trim(); var dataStr = (data.data || '').toString().trim(); var duracao = (data.duracao || '').toString().trim(); var obs = cleanField(data.observacao || '', 300);
    if (!treinoId || !dataStr) return jsonResponse(false, 'Dados obrigatórios');
    var alunosSheet = getSheet('Alunos'); var aRows = alunosSheet.getDataRange().getValues(); var nomeAluno = authEmail;
    for (var a = 1; a < aRows.length; a++) { if (aRows[a][0] && aRows[a][0].toString().trim().toLowerCase() === authEmail) { nomeAluno = aRows[a][1] ? aRows[a][1].toString() : authEmail; break; } }
    getOrCreateTreinosLogSheet().appendRow([authEmail, nomeAluno, treinoId, treinoNome, dataStr, duracao, obs, new Date()]);
    return jsonResponse(true, 'Treino salvo!');
  } catch(e) { return errorResponse('Erro: ' + e.message); }
}

function handleGetHistoricoTreinos(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  try {
    var sheet = getOrCreateTreinosLogSheet(); var rows = sheet.getDataRange().getValues(); var corMap = {};
    try { var customSheet = getOrCreateTreinosSheet(); var cRows = customSheet.getDataRange().getValues(); for (var c = 1; c < cRows.length; c++) { if (cRows[c][0]) corMap[cRows[c][0].toString()] = cRows[c][4] ? cRows[c][4].toString() : '#3b82f6'; } } catch(e) {}
    var historico = [];
    for (var i = 1; i < rows.length; i++) { if (!rows[i][0]) continue; if (rows[i][0].toString().trim().toLowerCase() !== authEmail) continue; var tid = rows[i][2] ? rows[i][2].toString() : ''; historico.push({ treinoId: tid, treinoNome: rows[i][3] ? rows[i][3].toString() : '', data: rows[i][4] ? rows[i][4].toString() : '', duracao: rows[i][5] ? rows[i][5].toString() : '', obs: rows[i][6] ? rows[i][6].toString() : '', cor: corMap[tid] || '#3b82f6' }); }
    historico.reverse();
    return ContentService.createTextOutput(JSON.stringify({ success: true, historico: historico })).setMimeType(ContentService.MimeType.JSON);
  } catch(e) { return errorResponse('Erro: ' + e.message); }
}


// ============================================================
// ===== IBJJF, MODULES, EXAM SLOTS =====
// ============================================================

function getOrCreateIBJJFSheet() { var ss = _getSpreadsheet(); var sheet = ss.getSheetByName('IBJJFUpdates'); if (!sheet) { sheet = ss.insertSheet('IBJJFUpdates'); sheet.appendRow(['ID','Titulo','Conteudo','Versao','Data','CriadoPor','Ativo']); sheet.getRange(1,1,1,7).setFontWeight('bold'); } return sheet; }

function handleGetIBJJFUpdates(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  try { var sheet = getOrCreateIBJJFSheet(); var rows = sheet.getDataRange().getValues(); var updates = []; for (var i = 1; i < rows.length; i++) { if (!rows[i][0]) continue; if (rows[i][6] === false || rows[i][6] === 'FALSE') continue; updates.push({ id: rows[i][0].toString(), titulo: rows[i][1] ? rows[i][1].toString() : '', conteudo: rows[i][2] ? rows[i][2].toString() : '', versao: rows[i][3] ? rows[i][3].toString() : '', data: rows[i][4] ? rows[i][4].toString() : '', rowIndex: i + 1 }); } updates.reverse(); return ContentService.createTextOutput(JSON.stringify({ success: true, updates: updates })).setMimeType(ContentService.MimeType.JSON); }
  catch(e) { return errorResponse('Erro: '+e.message); }
}

function handleSaveIBJJFUpdate(data) {
  var authEmail = requireProfessorOrAdmin(data); if (!authEmail) return forbiddenResponse();
  try {
    var sheet = getOrCreateIBJJFSheet(); var titulo = cleanField(data.titulo || '', 200); var conteudo = cleanField(data.conteudo || '', 2000); var versao = cleanField(data.versao || '', 50);
    if (!titulo || !conteudo) return jsonResponse(false, 'Título e conteúdo obrigatórios');
    var id = data.id ? data.id.toString() : 'ibjjf_' + new Date().getTime(); var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) { if (rows[i][0] && rows[i][0].toString() === id) { sheet.getRange(i+1,2).setValue(titulo); sheet.getRange(i+1,3).setValue(conteudo); sheet.getRange(i+1,4).setValue(versao); if (data.ativo === false) sheet.getRange(i+1,7).setValue(false); return jsonResponse(true, 'Atualização salva!'); } }
    var dataFormatada = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy');
    sheet.appendRow([id, titulo, conteudo, versao, dataFormatada, authEmail, true]); return jsonResponse(true, 'Novidade publicada!');
  } catch(e) { return errorResponse('Erro: '+e.message); }
}

function handleAutoFetchIBJJF(data) {
  var authEmail = requireProfessorOrAdmin(data); if (!authEmail) return forbiddenResponse();
  try { var sheet = getOrCreateIBJJFSheet(); var rows = sheet.getDataRange().getValues(); var count = 0; for (var i = 1; i < rows.length; i++) { if (rows[i][0] && rows[i][6] !== false && rows[i][6] !== 'FALSE') count++; } return ContentService.createTextOutput(JSON.stringify({ success: true, novos: 0, message: count > 0 ? 'Sistema mantendo ' + count + ' atualização(ões). Para adicionar novas, use o formulário.' : 'Nenhuma atualização publicada ainda. Adicione manualmente.' })).setMimeType(ContentService.MimeType.JSON); }
  catch(e) { return errorResponse('Erro: ' + e.message); }
}

function handleFetchIBJJFExterno(data) {
  var authEmail = requireProfessorOrAdmin(data); if (!authEmail) return forbiddenResponse();
  try { var sheet = getOrCreateIBJJFSheet(); var rows = sheet.getDataRange().getValues(); var count = 0; for (var i = 1; i < rows.length; i++) { if (rows[i][0] && rows[i][6] !== false && rows[i][6] !== 'FALSE') count++; } return ContentService.createTextOutput(JSON.stringify({ success: true, message: count > 0 ? 'Mantendo ' + count + ' atualização(ões). Para adicionar novas, use o formulário.' : 'Nenhuma atualização. Adicione manualmente.' })).setMimeType(ContentService.MimeType.JSON); }
  catch(e) { return errorResponse('Erro: ' + e.message); }
}

function getOrCreateModulesConfigSheet() { var ss = _getSpreadsheet(); var sheet = ss.getSheetByName('ConfigModulos'); if (!sheet) { sheet = ss.insertSheet('ConfigModulos'); sheet.appendRow(['Key','Value','UpdatedAt']); sheet.appendRow(['modules',JSON.stringify({checkin:true,evolucao:true,presencas:true,cronograma:true,musculacao:true,ranking:true,campeonato:true,jogos:true,manual:true,exame:true,perfil:true,pagamentos:true}),new Date()]); } return sheet; }

function handleGetModulesConfig(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  try { var sheet = getOrCreateModulesConfigSheet(); var rows = sheet.getDataRange().getValues(); var modules = {}; for (var i = 1; i < rows.length; i++) { if (rows[i][0]==='modules') { try{modules=JSON.parse(rows[i][1]);}catch(x){} break; } } if (modules.pagamentos === undefined) modules.pagamentos = true; return ContentService.createTextOutput(JSON.stringify({success:true,modules:modules})).setMimeType(ContentService.MimeType.JSON); }
  catch(e) { return errorResponse('Erro: '+e.message); }
}

function handleSaveModulesConfig(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  if (!isEmailAdmin(authEmail)) return jsonResponse(false,'Sem permissão');
  try { if (!data.modules) return jsonResponse(false,'Dados inválidos'); try{JSON.parse(data.modules);}catch(x){return jsonResponse(false,'JSON inválido');} var sheet = getOrCreateModulesConfigSheet(); var rows = sheet.getDataRange().getValues(); var now = new Date(); for (var i = 1; i < rows.length; i++) { if (rows[i][0]==='modules') { sheet.getRange(i+1,2).setValue(data.modules); sheet.getRange(i+1,3).setValue(now); return jsonResponse(true,'Configuração salva!'); } } sheet.appendRow(['modules',data.modules,now]); return jsonResponse(true,'Configuração salva!'); }
  catch(e) { return errorResponse('Erro: '+e.message); }
}

function handleGetUserModulePrefs(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  try { var sheet = getOrCreateModulesConfigSheet(); var rows = sheet.getDataRange().getValues(); var key = 'user:'+authEmail; var prefs = {}; for (var i = 1; i < rows.length; i++) { if (rows[i][0]===key) { try{prefs=JSON.parse(rows[i][1]);}catch(x){} break; } } return ContentService.createTextOutput(JSON.stringify({success:true,prefs:prefs})).setMimeType(ContentService.MimeType.JSON); }
  catch(e) { return errorResponse('Erro: '+e.message); }
}

function handleSaveUserModulePrefs(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  try { if (!data.prefs) return jsonResponse(false,'Dados inválidos'); try{JSON.parse(data.prefs);}catch(x){return jsonResponse(false,'JSON inválido');} var sheet = getOrCreateModulesConfigSheet(); var rows = sheet.getDataRange().getValues(); var key = 'user:'+authEmail; var now = new Date(); for (var i = 1; i < rows.length; i++) { if (rows[i][0]===key) { sheet.getRange(i+1,2).setValue(data.prefs); sheet.getRange(i+1,3).setValue(now); return jsonResponse(true,'Preferências salvas!'); } } sheet.appendRow([key,data.prefs,now]); return jsonResponse(true,'Preferências salvas!'); }
  catch(e) { return errorResponse('Erro: '+e.message); }
}

function getOrCreateExamSlotsSheet() { var ss = _getSpreadsheet(); var sheet = ss.getSheetByName('AgendaExames'); if (!sheet) { sheet = ss.insertSheet('AgendaExames'); sheet.appendRow(['Data','Hora','Vagas','CT','CriadoPor','CriadoEm']); sheet.getRange(1,1,1,6).setFontWeight('bold'); } return sheet; }
function getOrCreateExamRequestsSheet() { var ss = _getSpreadsheet(); var sheet = ss.getSheetByName('SolicitacoesExame'); if (!sheet) { sheet = ss.insertSheet('SolicitacoesExame'); sheet.appendRow(['Email','Nome','Faixa','ProxFaixa','DataExame','HoraExame','Status','DataSolicitacao','CT']); sheet.getRange(1,1,1,9).setFontWeight('bold'); } return sheet; }

function handleGetExamSlots(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  try {
    var sheet = getOrCreateExamSlotsSheet(); var rows = sheet.getDataRange().getValues(); var reqSheet = getOrCreateExamRequestsSheet(); var reqRows = reqSheet.getDataRange().getValues(); var slots = [];
    for (var i = 1; i < rows.length; i++) { if (!rows[i][0]) continue; var dt = rows[i][0], hr = rows[i][1]; var vagas = parseInt(rows[i][2])||5; var ct = (rows[i][3]||'Todos').toString(); var dateStr = (dt instanceof Date)?Utilities.formatDate(dt,Session.getScriptTimeZone(),'yyyy-MM-dd'):dt.toString(); var timeStr = (hr instanceof Date)?Utilities.formatDate(hr,Session.getScriptTimeZone(),'HH:mm'):hr.toString(); var confirmed = 0, userRequested = false; for (var r = 1; r < reqRows.length; r++) { if (reqRows[r][4]&&reqRows[r][5]) { var rDate = (reqRows[r][4] instanceof Date)?Utilities.formatDate(reqRows[r][4],Session.getScriptTimeZone(),'yyyy-MM-dd'):reqRows[r][4].toString(); var rTime = (reqRows[r][5] instanceof Date)?Utilities.formatDate(reqRows[r][5],Session.getScriptTimeZone(),'HH:mm'):reqRows[r][5].toString(); if (rDate===dateStr&&rTime===timeStr&&(reqRows[r][6]==='APROVADO'||reqRows[r][6]==='PENDENTE')) confirmed++; if (reqRows[r][0]===authEmail&&rDate===dateStr&&rTime===timeStr&&reqRows[r][6]!=='REJEITADO') userRequested = true; } } slots.push({rowIndex:i+1,date:dateStr,time:timeStr,vagas:vagas,vagasUsadas:confirmed,ct:ct,userRequested:userRequested}); }
    var tentativa = 1, lastRejectDate = null, hasPending = false;
    for (var h = 1; h < reqRows.length; h++) { if (reqRows[h][0]===authEmail) { var hSt = (reqRows[h][6]||'').toString().toUpperCase(); if (hSt==='PENDENTE') hasPending = true; if (hSt==='REPROVADO'||hSt==='REJEITADO') { tentativa++; if (!lastRejectDate&&reqRows[h][7]) lastRejectDate = new Date(reqRows[h][7]); } } }
    var valor = tentativa<=1?150:100; var bloqueado = false, diasRestantes = 0;
    if (lastRejectDate&&tentativa>1) { var diffD = Math.floor((new Date()-lastRejectDate)/86400000); if (diffD<60){bloqueado=true;diasRestantes=60-diffD;} }
    return ContentService.createTextOutput(JSON.stringify({success:true,slots:slots,examInfo:{valor:valor,tentativa:tentativa,hasPending:hasPending,bloqueado:bloqueado,diasRestantes:diasRestantes}})).setMimeType(ContentService.MimeType.JSON);
  } catch (e) { return errorResponse('Erro ao buscar horários'); }
}

function handleAddExamSlot(data) { var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse(); if (!data.date || !data.time) return jsonResponse(false, 'Data e hora obrigatórios'); try { getOrCreateExamSlotsSheet().appendRow([data.date,data.time,Math.max(1,parseInt(data.vagas)||5),data.ct||'Todos',adminEmail,new Date()]); return jsonResponse(true,'Horário adicionado!'); } catch (e) { return errorResponse('Erro ao adicionar horário'); } }
function handleRemoveExamSlot(data) { var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse(); if (!data.rowIndex) return jsonResponse(false,'Slot não encontrado'); try { getOrCreateExamSlotsSheet().deleteRow(parseInt(data.rowIndex)); return jsonResponse(true,'Horário removido!'); } catch (e) { return errorResponse('Erro ao remover'); } }

function handleRequestExam(data) {
  var authEmail = requireAuth(data); if (!authEmail) return unauthorizedResponse();
  if (!data.date || !data.time) return jsonResponse(false, 'Selecione um horário');
  try {
    var reqSheet = getOrCreateExamRequestsSheet(); var rows = reqSheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) { if (rows[i][0]===authEmail&&rows[i][6]==='PENDENTE') return jsonResponse(false,'Você já possui uma solicitação pendente'); }
    var lastExamDate = null, tentativa = 1;
    for (var k = rows.length-1; k >= 1; k--) { if (rows[k][0]===authEmail) { var st = (rows[k][6]||'').toString().toUpperCase(); if (st==='REPROVADO'||st==='REJEITADO') { tentativa++; if (!lastExamDate&&rows[k][7]) lastExamDate = new Date(rows[k][7]); } } }
    if (lastExamDate&&tentativa>1) { var diffDays = Math.floor((new Date()-lastExamDate)/86400000); if (diffDays<60) return jsonResponse(false,'Você precisa aguardar 2 meses após a reprovação. Faltam '+(60-diffDays)+' dias.'); }
    var valor = tentativa<=1?150:100;
    var alunosSheet = _getSpreadsheet().getSheetByName('Alunos'); var aRows = alunosSheet.getDataRange().getValues(); var name = '', faixa = '', ct = '';
    for (var j = 1; j < aRows.length; j++) { if (aRows[j][0]&&aRows[j][0].toString().trim().toLowerCase()===authEmail) { name=aRows[j][1]?aRows[j][1].toString():''; faixa=aRows[j][2]?aRows[j][2].toString():''; ct=aRows[j][4]?aRows[j][4].toString():''; break; } }
    var nextFaixa = {'Branca':'Azul','Azul':'Roxa','Roxa':'Marrom','Marrom':'Preta'};
    reqSheet.appendRow([authEmail,name,faixa,nextFaixa[faixa]||'?',data.date,data.time,'PENDENTE',new Date(),ct,'PENDENTE',valor,tentativa]);
    return jsonResponse(true,'Solicitação enviada! Taxa: R$'+valor+',00. Envie o comprovante ao professor via WhatsApp.');
  } catch (e) { return errorResponse('Erro ao solicitar exame'); }
}

function handleGetExamRequests(data) {
  var adminEmail = requireProfessorOrAdmin(data); if (!adminEmail) return forbiddenResponse();
  try { var sheet = getOrCreateExamRequestsSheet(); var rows = sheet.getDataRange().getValues(); var requests = []; for (var i = 1; i < rows.length; i++) { if (!rows[i][0]) continue; var dateStr = (rows[i][4] instanceof Date)?Utilities.formatDate(rows[i][4],Session.getScriptTimeZone(),'yyyy-MM-dd'):rows[i][4].toString(); var timeStr = (rows[i][5] instanceof Date)?Utilities.formatDate(rows[i][5],Session.getScriptTimeZone(),'HH:mm'):rows[i][5].toString(); var solStr = (rows[i][7] instanceof Date)?Utilities.formatDate(rows[i][7],Session.getScriptTimeZone(),'dd/MM/yyyy HH:mm'):rows[i][7].toString(); requests.push({rowIndex:i+1,email:rows[i][0],name:rows[i][1],faixa:rows[i][2],proxFaixa:rows[i][3],date:dateStr,time:timeStr,status:rows[i][6],dataSolicitacao:solStr,ct:rows[i][8]||'',pgtoStatus:rows[i][9]||'',valor:rows[i][10]||150,tentativa:rows[i][11]||1}); } return ContentService.createTextOutput(JSON.stringify({success:true,requests:requests})).setMimeType(ContentService.MimeType.JSON); }
  catch (e) { return errorResponse('Erro ao buscar solicitações'); }
}

function handleApproveExamRequest(data) { var adminEmail = requireProfessorOrAdmin(data); if (!adminEmail) return forbiddenResponse(); if (!data.rowIndex) return jsonResponse(false,'Solicitação não encontrada'); try { var sheet = getOrCreateExamRequestsSheet(); sheet.getRange(parseInt(data.rowIndex),7).setValue('APROVADO'); sheet.getRange(parseInt(data.rowIndex),10).setValue('APROVADO'); return jsonResponse(true,'Exame aprovado!'); } catch (e) { return errorResponse('Erro ao aprovar'); } }
function handleRejectExamRequest(data) { var adminEmail = requireProfessorOrAdmin(data); if (!adminEmail) return forbiddenResponse(); if (!data.rowIndex) return jsonResponse(false,'Solicitação não encontrada'); try { getOrCreateExamRequestsSheet().getRange(parseInt(data.rowIndex),7).setValue('REPROVADO'); return jsonResponse(true,'Solicitação reprovada'); } catch (e) { return errorResponse('Erro ao reprovar'); } }


// ============================================================
// ███  MÓDULO: PAGAMENTOS — v2.0  ███
// ============================================================

function getPagSheet(name) {
  var ss = _getSpreadsheet(); var s = ss.getSheetByName(name);
  if (!s) { s = ss.insertSheet(name); var H = { 'GatewayTokens': ['GatewayID','Gateway','AccessToken','Label','DataCadastro','Ativo'], 'ConfigPagamento': ['CT','GatewayID','ChavePix','DiaVencimento','Ativo','UpdatedAt'], 'PlanosPagamento': ['ID','CT','GatewayID','Nome','Valor','Descricao','Frequencia','Ativo'], 'Mensalidades': ['Email','CT','PlanoID','GatewayID','Status','Vencimento','ExternalID','Metodo','UpdatedAt'], 'CartoesAlunos': ['Email','CT','CustomerID','SubscriptionID','Bandeira','Ultimos4','Validade','UpdatedAt'] }; if (H[name]) { s.appendRow(H[name]); s.getRange(1,1,1,H[name].length).setFontWeight('bold'); } }
  return s;
}

function handleSalvarGatewayToken(data) {
  var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  try { var gateway = (data.gateway||'').toString().trim().toLowerCase(); var accessToken = (data.accessToken||'').toString().trim(); var label = (data.label||'').toString().trim(); var gateways = ['mercadopago','infinitypay','pix_manual']; if (gateways.indexOf(gateway)===-1) return jsonResponse(false,'Gateway inválido: '+gateway); if (!accessToken&&gateway!=='pix_manual') return jsonResponse(false,'Access Token obrigatório'); var sheet = getPagSheet('GatewayTokens'); var rows = sheet.getDataRange().getValues(); for (var i=1;i<rows.length;i++) { if (rows[i][1]&&rows[i][1].toString().toLowerCase()===gateway&&rows[i][3]&&rows[i][3].toString()===label) { sheet.getRange(i+1,3,1,4).setValues([[accessToken,label,new Date(),true]]); return jsonResponse(true,'Token atualizado: '+gateway+' — '+label); } } var gwId = 'gw_'+gateway+'_'+new Date().getTime(); sheet.appendRow([gwId,gateway,accessToken,label||gateway,new Date(),true]); return jsonResponse(true,'Token cadastrado!',{gatewayId:gwId}); }
  catch(e) { return errorResponse('Erro: '+e.message); }
}

function handleGetGatewayTokens(data) {
  var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  try { var rows = getPagSheet('GatewayTokens').getDataRange().getValues(); var tokens = []; for (var i=1;i<rows.length;i++) { if (!rows[i][0]||rows[i][5]===false||rows[i][5]==='FALSE') continue; tokens.push({gatewayId:rows[i][0].toString(),gateway:rows[i][1].toString(),label:rows[i][3].toString(),cadastrado:rows[i][4]?rows[i][4].toString().substring(0,10):''}); } return ContentService.createTextOutput(JSON.stringify({success:true,tokens:tokens})).setMimeType(ContentService.MimeType.JSON); }
  catch(e) { return errorResponse('Erro: '+e.message); }
}

function handleRemoverGatewayToken(data) {
  var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  try { var gwId = (data.gatewayId||'').toString().trim(); var sheet = getPagSheet('GatewayTokens'); var rows = sheet.getDataRange().getValues(); for (var i=1;i<rows.length;i++) { if (rows[i][0]&&rows[i][0].toString()===gwId) { sheet.getRange(i+1,6).setValue(false); return jsonResponse(true,'Token removido'); } } return jsonResponse(false,'Token não encontrado'); }
  catch(e) { return errorResponse('Erro: '+e.message); }
}

function handleVincularGatewayCT(data) {
  var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  try {
    var ct = (data.ct||'').toString().trim(); var gatewayId = (data.gatewayId||'').toString().trim(); var chavePix = (data.chavePix||'').toString().trim(); var diaVenc = Math.min(28,Math.max(1,parseInt(data.diaVencimento)||10));
    if (!ct) return jsonResponse(false,'CT obrigatório'); if (!gatewayId&&!chavePix) return jsonResponse(false,'Selecione um gateway ou informe chave PIX');
    if (gatewayId) { var tokRows = getPagSheet('GatewayTokens').getDataRange().getValues(); var tokOk = false; for (var t=1;t<tokRows.length;t++) { if (tokRows[t][0]&&tokRows[t][0].toString()===gatewayId&&tokRows[t][5]!==false&&tokRows[t][5]!=='FALSE') { tokOk=true; break; } } if (!tokOk) return jsonResponse(false,'Gateway não encontrado. Cadastre o token na Aba 1 primeiro.'); }
    var sheet = getPagSheet('ConfigPagamento'); var rows = sheet.getDataRange().getValues();
    for (var i=1;i<rows.length;i++) { if (rows[i][0]&&rows[i][0].toString().trim()===ct) { sheet.getRange(i+1,2,1,5).setValues([[gatewayId,chavePix,diaVenc,true,new Date()]]); return jsonResponse(true,'Gateway vinculado ao CT: '+ct); } }
    sheet.appendRow([ct,gatewayId,chavePix,diaVenc,true,new Date()]); return jsonResponse(true,'CT configurado: '+ct);
  } catch(e) { return errorResponse('Erro: '+e.message); }
}

function handleGetVinculosCT(data) {
  var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  try {
    var cfgRows = getPagSheet('ConfigPagamento').getDataRange().getValues(); var tokRows = getPagSheet('GatewayTokens').getDataRange().getValues(); var tokMap = {};
    for (var t=1;t<tokRows.length;t++) { if (tokRows[t][0]) tokMap[tokRows[t][0].toString()]={gateway:tokRows[t][1].toString(),label:tokRows[t][3].toString()}; }
    var vinculos = [];
    for (var i=1;i<cfgRows.length;i++) { if (!cfgRows[i][0]) continue; var gwId=cfgRows[i][1]?cfgRows[i][1].toString():''; var tok=gwId&&tokMap[gwId]?tokMap[gwId]:null; vinculos.push({ct:cfgRows[i][0].toString(),gatewayId:gwId,gateway:tok?tok.gateway:(gwId?gwId:'pix_manual'),gatewayLabel:tok?tok.label:(gwId?gwId:'PIX Manual'),chavePix:cfgRows[i][2]?cfgRows[i][2].toString():'',diaVencimento:parseInt(cfgRows[i][3])||10,ativo:cfgRows[i][4]!==false&&cfgRows[i][4]!=='FALSE'}); }
    return ContentService.createTextOutput(JSON.stringify({success:true,vinculos:vinculos})).setMimeType(ContentService.MimeType.JSON);
  } catch(e) { return errorResponse('Erro: '+e.message); }
}

function handleRemoverVinculoCT(data) {
  var adminEmail = requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  try { var ct=(data.ct||'').toString().trim(); var sheet=getPagSheet('ConfigPagamento'); var rows=sheet.getDataRange().getValues(); for (var i=1;i<rows.length;i++) { if (rows[i][0]&&rows[i][0].toString().trim()===ct) { sheet.getRange(i+1,5).setValue(false); return jsonResponse(true,'Vínculo removido do CT: '+ct); } } return jsonResponse(false,'Vínculo não encontrado'); }
  catch(e) { return errorResponse('Erro: '+e.message); }
}

function getGatewayConfig(ctName) {
  if (!ctName) return null;
  var cfgRows = getPagSheet('ConfigPagamento').getDataRange().getValues(); var tokRows = getPagSheet('GatewayTokens').getDataRange().getValues();
  for (var i=1;i<cfgRows.length;i++) { if (!cfgRows[i][0]||cfgRows[i][0].toString().trim()!==ctName) continue; if (cfgRows[i][4]===false||cfgRows[i][4]==='FALSE') continue; var gwId=cfgRows[i][1]?cfgRows[i][1].toString().trim():''; var chavePix=cfgRows[i][2]?cfgRows[i][2].toString().trim():''; var diaVenc=parseInt(cfgRows[i][3])||10; var accessToken=''; var gateway='pix_manual'; if (gwId) { for (var t=1;t<tokRows.length;t++) { if (tokRows[t][0]&&tokRows[t][0].toString()===gwId&&tokRows[t][5]!==false&&tokRows[t][5]!=='FALSE') { accessToken=tokRows[t][2]?tokRows[t][2].toString().trim():''; gateway=tokRows[t][1]?tokRows[t][1].toString().toLowerCase():'pix_manual'; break; } } } return {ct:ctName,gatewayId:gwId,gateway:gateway,apiKey:accessToken,accessToken:accessToken,chavePix:chavePix,diaVencimento:diaVenc}; }
  return null;
}

function getCTDoAluno(email) { var rows = getSheet('Alunos').getDataRange().getValues(); for (var i=1;i<rows.length;i++) { if (rows[i][0]&&rows[i][0].toString().trim().toLowerCase()===email) return rows[i][4]?rows[i][4].toString().trim():''; } return ''; }
function getAlunoNome(email) { var rows = getSheet('Alunos').getDataRange().getValues(); for (var i=1;i<rows.length;i++) { if (rows[i][0]&&rows[i][0].toString().trim().toLowerCase()===email) return rows[i][1]?rows[i][1].toString():email; } return email; }
function getPlanoValor(planoId) { if (!planoId) return {nome:'Mensalidade',valor:0}; var rows = getPagSheet('PlanosPagamento').getDataRange().getValues(); for (var i=1;i<rows.length;i++) { if (rows[i][0]&&rows[i][0].toString()===planoId) return {nome:rows[i][3].toString(),valor:parseFloat(rows[i][4])||0}; } return {nome:'Mensalidade',valor:0}; }

function getMensalidadeAluno(email) {
  var rows = getPagSheet('Mensalidades').getDataRange().getValues();
  for (var i=1;i<rows.length;i++) {
    if (!rows[i][0]||rows[i][0].toString().trim().toLowerCase()!==email) continue;
    var vencRaw=rows[i][5]; var vencStr='';
    if (vencRaw instanceof Date) { vencStr=Utilities.formatDate(vencRaw,'America/Sao_Paulo','dd/MM/yyyy'); }
    else if (vencRaw) { var v=vencRaw.toString().trim(); if (v.length>10) { try { var d=new Date(v); if(!isNaN(d.getTime())) v=Utilities.formatDate(d,'America/Sao_Paulo','dd/MM/yyyy'); } catch(e2) {} } vencStr=v; }
    return {
      rowIndex:        i+1,
      planoId:         rows[i][2] ? rows[i][2].toString() : '',
      gatewayId:       rows[i][3] ? rows[i][3].toString() : '',
      status:          rows[i][4] ? rows[i][4].toString() : '',
      vencimento:      vencStr,
      externalId:      rows[i][6] ? rows[i][6].toString() : '',
      metodo:          rows[i][7] ? rows[i][7].toString() : '',
      lastPaymentDate: rows[i][9] ? rows[i][9].toString() : ''
    };
  }
  return null;
}

function upsertMensalidade(email,ct,planoId,gatewayId,status,vencimento,externalId,metodo) {
  var sheet=getPagSheet('Mensalidades'); var rows=sheet.getDataRange().getValues();
  var vencStr=vencimento instanceof Date?Utilities.formatDate(vencimento,'America/Sao_Paulo','dd/MM/yyyy'):vencimento.toString();
  var now = new Date();
  // col 10 = lastPaymentDate: só atualiza quando status é PAGO
  var lastPay = '';
  if ((status||'').toUpperCase() === 'PAGO') {
    lastPay = Utilities.formatDate(now,'America/Sao_Paulo','dd/MM/yyyy');
  }
  for (var i=1;i<rows.length;i++) {
    if (rows[i][0]&&rows[i][0].toString().trim().toLowerCase()===email) {
      // mantém lastPaymentDate existente se não é PAGO
      var existingLastPay = rows[i][9] ? rows[i][9].toString() : '';
      var finalLastPay = lastPay || existingLastPay;
      sheet.getRange(i+1,2,1,9).setValues([[ct,planoId,gatewayId,status,vencStr,externalId,metodo,now,finalLastPay]]);
      return;
    }
  }
  sheet.appendRow([email,ct,planoId,gatewayId,status,vencStr,externalId,metodo,now,lastPay]);
}

function handleGetPlanosList(data) {
  var adminEmail = requireAdmin(data); var ctFiltro = ''; if (adminEmail) { ctFiltro=data.ct?data.ct.toString().trim():''; } else { var authEmail=requireAuth(data); if (!authEmail) return unauthorizedResponse(); ctFiltro=getCTDoAluno(authEmail); }
  try { var rows=getPagSheet('PlanosPagamento').getDataRange().getValues(); var planos=[]; for (var i=1;i<rows.length;i++) { if (!rows[i][0]||rows[i][7]===false||rows[i][7]==='FALSE') continue; if (ctFiltro&&rows[i][1]&&rows[i][1].toString().trim()!==ctFiltro) continue; planos.push({id:rows[i][0].toString(),ct:rows[i][1]?rows[i][1].toString():'',gatewayId:rows[i][2]?rows[i][2].toString():'',nome:rows[i][3]?rows[i][3].toString():'',valor:rows[i][4]||0,descricao:rows[i][5]?rows[i][5].toString():'',frequencia:rows[i][6]?rows[i][6].toString():'mensal'}); } return ContentService.createTextOutput(JSON.stringify({success:true,planos:planos})).setMimeType(ContentService.MimeType.JSON); }
  catch(e) { return errorResponse('Erro: '+e.message); }
}

function handleSalvarPlano(data) {
  var adminEmail=requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  try { var ct=(data.ct||'').toString().trim(); var nome=(data.nome||'').toString().trim(); var valor=parseFloat(data.valor)||0; var gatewayId=(data.gatewayId||'').toString().trim(); var frequencia=(data.frequencia||'mensal').toString().trim().toLowerCase(); var descricao=(data.descricao||'').toString().trim(); if (!ct) return jsonResponse(false,'CT obrigatório'); if (!nome) return jsonResponse(false,'Nome do plano obrigatório'); if (!valor) return jsonResponse(false,'Valor obrigatório'); var cfg=getGatewayConfig(ct); if (!cfg) return jsonResponse(false,'CT "'+ct+'" não possui gateway configurado.'); if (!gatewayId) gatewayId=cfg.gatewayId||''; var sheet=getPagSheet('PlanosPagamento'); var id=data.id?data.id.toString():'plano_'+new Date().getTime(); var rows=sheet.getDataRange().getValues(); for (var i=1;i<rows.length;i++) { if (rows[i][0]&&rows[i][0].toString()===id) { sheet.getRange(i+1,2,1,7).setValues([[ct,gatewayId,nome,valor,descricao,frequencia,true]]); return jsonResponse(true,'Plano atualizado!'); } } sheet.appendRow([id,ct,gatewayId,nome,valor,descricao,frequencia,true]); return jsonResponse(true,'Plano criado!'); }
  catch(e) { return errorResponse('Erro: '+e.message); }
}

function handleDeletarPlano(data) { var adminEmail=requireAdmin(data); if (!adminEmail) return forbiddenResponse(); try { var rows=getPagSheet('PlanosPagamento').getDataRange().getValues(); for (var i=1;i<rows.length;i++) { if (rows[i][0]&&rows[i][0].toString()===data.id.toString()) { getPagSheet('PlanosPagamento').getRange(i+1,8).setValue(false); return jsonResponse(true,'Plano removido'); } } return jsonResponse(false,'Plano não encontrado'); } catch(e) { return errorResponse('Erro: '+e.message); } }

function handleGetAlunoPlanos(data) { var authEmail=requireAuth(data); if (!authEmail) return unauthorizedResponse(); try { var ct=getCTDoAluno(authEmail); var rows=getPagSheet('PlanosPagamento').getDataRange().getValues(); var planos=[]; for (var i=1;i<rows.length;i++) { if (!rows[i][0]||rows[i][7]===false||rows[i][7]==='FALSE') continue; var planoCT=rows[i][1]?rows[i][1].toString().trim():''; if (planoCT&&planoCT!==ct) continue; planos.push({id:rows[i][0].toString(),ct:planoCT,nome:rows[i][3]?rows[i][3].toString():'',valor:rows[i][4]||0,descricao:rows[i][5]?rows[i][5].toString():'',frequencia:rows[i][6]?rows[i][6].toString():'mensal'}); } return ContentService.createTextOutput(JSON.stringify({success:true,planos:planos})).setMimeType(ContentService.MimeType.JSON); } catch(e) { return errorResponse('Erro: '+e.message); } }

function handleSelecionarPlanoAluno(data) { var authEmail=requireAuth(data); if (!authEmail) return unauthorizedResponse(); try { var planoId=(data.planoId||'').toString().trim(); if (!planoId) return jsonResponse(false,'Plano não informado'); var ct=getCTDoAluno(authEmail); var cfg=getGatewayConfig(ct); if (!cfg) return jsonResponse(false,'Seu CT não possui pagamento configurado'); var rows=getPagSheet('PlanosPagamento').getDataRange().getValues(); var planoOk=false,planoGwId=''; for (var i=1;i<rows.length;i++) { if (!rows[i][0]||rows[i][0].toString()!==planoId) continue; if (rows[i][7]===false||rows[i][7]==='FALSE') continue; var planoCT=rows[i][1]?rows[i][1].toString().trim():''; if (planoCT&&planoCT!==ct) continue; planoOk=true; planoGwId=rows[i][2]?rows[i][2].toString():cfg.gatewayId||''; break; } if (!planoOk) return jsonResponse(false,'Plano inválido ou indisponível para seu CT'); var hoje=new Date(); var dia=cfg.diaVencimento||10; var venc=new Date(hoje.getFullYear(),hoje.getMonth(),dia); if (venc<=hoje) venc=new Date(hoje.getFullYear(),hoje.getMonth()+1,dia); upsertMensalidade(authEmail,ct,planoId,planoGwId,'PENDENTE',venc,'',''); return jsonResponse(true,'Plano selecionado!',{vencimento:Utilities.formatDate(venc,'America/Sao_Paulo','dd/MM/yyyy')}); } catch(e) { return errorResponse('Erro: '+e.message); } }

function handleGetPagamentosAdmin(data) {
  var adminEmail=requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  try {
    var cfgFiltro=data.ct?data.ct.toString().trim():''; var cfgRows=getPagSheet('ConfigPagamento').getDataRange().getValues(); var tokRows=getPagSheet('GatewayTokens').getDataRange().getValues(); var ctComGateway={};
    for (var c=1;c<cfgRows.length;c++) { if (!cfgRows[c][0]) continue; if (cfgRows[c][4]===false||cfgRows[c][4]==='FALSE') continue; var ctN=cfgRows[c][0].toString().trim(); if (!cfgFiltro||ctN===cfgFiltro) ctComGateway[ctN]=true; }
    var planRows=getPagSheet('PlanosPagamento').getDataRange().getValues(); var planMap={}; for (var p=1;p<planRows.length;p++) { if (planRows[p][0]) planMap[planRows[p][0].toString()]={nome:planRows[p][3]?planRows[p][3].toString():'',valor:planRows[p][4]||0}; }
    var menRows=getPagSheet('Mensalidades').getDataRange().getValues(); var menMap={}; for (var m=1;m<menRows.length;m++) { if (!menRows[m][0]) continue; var ek=menRows[m][0].toString().trim().toLowerCase(); menMap[ek]={planoId:menRows[m][2]?menRows[m][2].toString():'',gatewayId:menRows[m][3]?menRows[m][3].toString():'',status:menRows[m][4]?menRows[m][4].toString():'',vencimento:menRows[m][5]?menRows[m][5].toString():'',metodo:menRows[m][7]?menRows[m][7].toString():''}; }
    var aluRows=getSheet('Alunos').getDataRange().getValues(); var pags=[]; var visto={};
    for (var a=1;a<aluRows.length;a++) { if (!aluRows[a][0]) continue; var aluCT=aluRows[a][4]?aluRows[a][4].toString().trim():''; if (!ctComGateway[aluCT]) continue; var aluStatus=aluRows[a][25]?aluRows[a][25].toString().toUpperCase():''; if (aluStatus==='DESATIVADO'||aluStatus==='INATIVO') continue; var aluEmail=aluRows[a][0].toString().trim().toLowerCase(); if (visto[aluEmail]) continue; visto[aluEmail]=true; var men=menMap[aluEmail]||{}; var plano=men.planoId?(planMap[men.planoId]||{nome:'—',valor:0}):{nome:'',valor:0}; var finStatus=men.status||'SEM_PLANO'; if (!men.planoId) finStatus='SEM_PLANO'; else if (men.vencimento&&men.status!=='PAGO') { var partes=(men.vencimento||'').split('/'); if (partes.length===3) { var vencDate=new Date(parseInt(partes[2]),parseInt(partes[1])-1,parseInt(partes[0])); var hoje=new Date(); var diffDias=Math.floor((hoje-vencDate)/(1000*60*60*24)); if (diffDias>0) finStatus='ATRASADO'; else if (diffDias>=-5) finStatus='VENCENDO'; else finStatus=men.status||'PENDENTE'; } } pags.push({email:aluEmail,nome:aluRows[a][1]?aluRows[a][1].toString():aluEmail,ct:aluCT,planoId:men.planoId||'',planoNome:plano.nome||'',planoValor:plano.valor||0,gatewayId:men.gatewayId||'',status:finStatus,vencimento:men.vencimento||'',metodo:men.metodo||''}); }
    var ordem={ATRASADO:0,VENCENDO:1,PENDENTE:2,SEM_PLANO:3,PAGO:4}; pags.sort(function(a,b){return (ordem[a.status]!==undefined?ordem[a.status]:9)-(ordem[b.status]!==undefined?ordem[b.status]:9);});
    return ContentService.createTextOutput(JSON.stringify({success:true,pagamentos:pags})).setMimeType(ContentService.MimeType.JSON);
  } catch(e) { return errorResponse('Erro: '+e.message); }
}

function handleAtribuirPlanoAluno(data) { var adminEmail=requireAdmin(data); if (!adminEmail) return forbiddenResponse(); try { var email=(data.email||'').toString().trim().toLowerCase(); var planoId=(data.planoId||'').toString().trim(); if (!email||!planoId) return jsonResponse(false,'Email e plano obrigatórios'); var ct=getCTDoAluno(email); var cfg=getGatewayConfig(ct); if (!cfg) return jsonResponse(false,'CT "'+ct+'" não possui gateway configurado'); var dia=cfg.diaVencimento||10; var hoje=new Date(); var venc=new Date(hoje.getFullYear(),hoje.getMonth(),dia); if (venc<=hoje) venc=new Date(hoje.getFullYear(),hoje.getMonth()+1,dia); upsertMensalidade(email,ct,planoId,cfg.gatewayId||'','PENDENTE',venc,'',''); return jsonResponse(true,'Plano atribuído! Vencimento: '+Utilities.formatDate(venc,'America/Sao_Paulo','dd/MM/yyyy')); } catch(e) { return errorResponse('Erro: '+e.message); } }

function handleMarcarPago(data) { var adminEmail=requireAdmin(data); if (!adminEmail) return forbiddenResponse(); try { var email=(data.email||'').toString().trim().toLowerCase(); var status=(data.status||'PAGO').toString().trim().toUpperCase(); if (!email) return jsonResponse(false,'Email obrigatório'); var ct=getCTDoAluno(email); var cfg=getGatewayConfig(ct); var dia=cfg?cfg.diaVencimento:10; var hoje=new Date(); var venc=new Date(hoje.getFullYear(),hoje.getMonth(),dia); if (venc<=hoje) venc=new Date(hoje.getFullYear(),hoje.getMonth()+1,dia); var men=getMensalidadeAluno(email)||{}; upsertMensalidade(email,ct,men.planoId||'',men.gatewayId||'',status,venc,men.externalId||adminEmail+'_manual_'+Date.now(),'manual'); return jsonResponse(true,'Status atualizado para '+status); } catch(e) { return errorResponse('Erro: '+e.message); } }

function handleGetPagamentoStatus(data) {
  var authEmail=requireAuth(data); if (!authEmail) return unauthorizedResponse();
  try {
    var ct=getCTDoAluno(authEmail); var cfg=ct?getGatewayConfig(ct):null;
    if (!cfg) return ContentService.createTextOutput(JSON.stringify({success:true,configurado:false})).setMimeType(ContentService.MimeType.JSON);
    var men=getMensalidadeAluno(authEmail)||{}; var planoInfo={nome:'',valor:0,frequencia:'mensal'};
    if (men.planoId) { var planRows=getPagSheet('PlanosPagamento').getDataRange().getValues(); for (var pi=1;pi<planRows.length;pi++) { if (planRows[pi][0]&&planRows[pi][0].toString()===men.planoId) { planoInfo.nome=planRows[pi][3]?planRows[pi][3].toString():''; planoInfo.valor=parseFloat(planRows[pi][4])||0; planoInfo.frequencia=planRows[pi][6]?planRows[pi][6].toString():'mensal'; break; } } }
    var historico = [];
    if (cfg.accessToken && cfg.gateway !== 'pix_manual') { try { historico = gw_getHistory(cfg, authEmail); } catch(e) { Logger.log('history err: ' + e.message); } }
    var proxVenc=''; if (men.vencimento) { if (men.vencimento instanceof Date) { proxVenc=Utilities.formatDate(men.vencimento,'America/Sao_Paulo','dd/MM/yyyy'); } else { proxVenc=men.vencimento.toString(); if (proxVenc.length>20) { try { var d=new Date(proxVenc); if (!isNaN(d.getTime())) proxVenc=Utilities.formatDate(d,'America/Sao_Paulo','dd/MM/yyyy'); } catch(e2) {} } } }
    var temGateway=!!(cfg.accessToken&&cfg.gateway&&cfg.gateway!=='pix_manual'); var pixManual=!temGateway;
    // Flag de fallback PIX: cartão foi cobrado mas falhou
    var pixFallback  = (men.metodo || '').toString().toUpperCase() === 'PIX_FALLBACK';
    var cartaoFalhou = pixFallback;
    var motivoFalha  = pixFallback ? (men.externalId || 'Pagamento não processado') : '';
    // Verifica se aluno tem cartão salvo + retorna dados para exibição
    var temCartaoSalvo = false;
    var cartaoInfo = null;
    try {
      var ss2 = _getSpreadsheet();
      var cSheet2 = ss2.getSheetByName('CartoesAlunos');
      if (cSheet2) {
        var cRows2 = cSheet2.getDataRange().getValues();
        for (var cc = 1; cc < cRows2.length; cc++) {
          if (cRows2[cc][0] && cRows2[cc][0].toString().trim().toLowerCase() === authEmail) {
            temCartaoSalvo = true;
            cartaoInfo = {
              bandeira:  cRows2[cc][4] ? cRows2[cc][4].toString() : '',
              ultimos4:  cRows2[cc][5] ? cRows2[cc][5].toString() : '',
              validade:  cRows2[cc][6] ? cRows2[cc][6].toString() : ''
            };
            break;
          }
        }
      }
    } catch(eC) {}
    return ContentService.createTextOutput(JSON.stringify({success:true,configurado:true,gateway:cfg.gateway||'pix_manual',temGateway:temGateway,pixManual:pixManual,chavePix:cfg.chavePix||'',status:men.status||'inativo',plano:{nome:planoInfo.nome||'',valor:planoInfo.valor||0,frequencia:'',diaVencimento:cfg.diaVencimento},proximoVencimento:proxVenc,historico:historico,temCartaoSalvo:temCartaoSalvo,cartao:cartaoInfo,pixFallback:pixFallback,cartaoFalhou:cartaoFalhou,motivoFalha:motivoFalha})).setMimeType(ContentService.MimeType.JSON);
  } catch(e) { return errorResponse('Erro: '+e.message); }
}

function handleGerarPixMensalidade(data) {
  var authEmail=requireAuth(data); if (!authEmail) return unauthorizedResponse();
  try {
    var ct=getCTDoAluno(authEmail); var cfg=getGatewayConfig(ct); if (!cfg) return jsonResponse(false,'Pagamento não configurado para este CT');
    var men=getMensalidadeAluno(authEmail)||{}; var pl=getPlanoValor(men.planoId); var nome=getAlunoNome(authEmail); var pts=nome.split(' ');
    if (!cfg.accessToken||cfg.gateway==='pix_manual') { var vencEst=new Date(); vencEst.setMonth(vencEst.getMonth()+1); vencEst.setDate(cfg.diaVencimento||10); upsertMensalidade(authEmail,ct,men.planoId||'',cfg.gatewayId||'','PENDENTE',vencEst,'pix_manual_'+new Date().getTime(),'PIX'); return ContentService.createTextOutput(JSON.stringify({success:true,pixManual:true,pagamentoId:null,chavePix:cfg.chavePix,valor:pl.valor,gateway:'pix_manual',planoNome:pl.nome||'Mensalidade',alunoNome:nome,ct:ct,instrucoes:'Abra seu banco, escolha PIX e copie a chave abaixo. Informe seu professor após o pagamento.'})).setMimeType(ContentService.MimeType.JSON); }
    var pixPayload={email:authEmail,valor:pl.valor,descricao:'Mensalidade '+ct+' — '+nome,nomeFirst:pts[0]||nome,nomeLast:pts.slice(1).join(' ')||'Aluno',cpf:'00000000000'};
    var result=gw_createPix(cfg,pixPayload); var venc=new Date(); venc.setMonth(venc.getMonth()+1); venc.setDate(cfg.diaVencimento); upsertMensalidade(authEmail,ct,men.planoId||'',cfg.gatewayId||'','PENDENTE',venc,result.externalId,'PIX');
    return ContentService.createTextOutput(JSON.stringify({success:true,pagamentoId:result.externalId,pixCode:result.pixCode,qrBase64:result.qrBase64,qrUrl:result.qrUrl||'',valor:pl.valor,gateway:cfg.gateway})).setMimeType(ContentService.MimeType.JSON);
  } catch(e) { Logger.log('gerarPix: '+e.message); return errorResponse('Erro: '+e.message); }
}

function handleVerificarPagamento(data) { var authEmail=requireAuth(data); if (!authEmail) return unauthorizedResponse(); try { var pagId=(data.pagamentoId||'').toString(); if (!pagId) return jsonResponse(false,'ID inválido'); var ct=getCTDoAluno(authEmail); var cfg=getGatewayConfig(ct); if (!cfg||!cfg.accessToken) return jsonResponse(false,'Gateway não configurado'); var status=gw_getPaymentStatus(cfg,pagId); if (status==='APROVADO') { var venc=new Date(); venc.setMonth(venc.getMonth()+1); venc.setDate(cfg.diaVencimento); var men=getMensalidadeAluno(authEmail)||{}; upsertMensalidade(authEmail,ct,men.planoId||'',cfg.gatewayId||'','PAGO',venc,pagId,'PIX'); } return ContentService.createTextOutput(JSON.stringify({success:true,status:status})).setMimeType(ContentService.MimeType.JSON); } catch(e) { return errorResponse('Erro: '+e.message); } }

function handleSalvarCartaoMP(data) { return handleSalvarCartao(data); }
function handleRemoverCartaoMP(data) { return handleRemoverCartao(data); }

function handleSalvarCartao(data) {
  var authEmail=requireAuth(data); if (!authEmail) return unauthorizedResponse();
  try {
    var ct=getCTDoAluno(authEmail); var cfg=getGatewayConfig(ct); if (!cfg||!cfg.accessToken) return jsonResponse(false,'Gateway não configurado para este CT'); if (cfg.gateway!=='mercadopago') return jsonResponse(false,'Cartão disponível apenas para Mercado Pago por enquanto');
    var cardNumber=(data.cardNumber||'').toString().replace(/\s/g,''); var expiryMonth=(data.expiryMonth||'').toString().trim(); var expiryYear=(data.expiryYear||'').toString().trim(); var cvv=(data.cvv||'').toString().trim(); var cardHolder=(data.cardHolder||'').toString().trim().toUpperCase(); var cpf=(data.cpf||'').toString().replace(/\D/g,''); var nome=getAlunoNome(authEmail); var pts=nome.split(' ');
    if (!cardNumber||!expiryMonth||!expiryYear||!cvv||!cardHolder) return jsonResponse(false,'Dados incompletos');
    var bandeira='Outro'; if (/^4/.test(cardNumber)) bandeira='Visa'; else if (/^5[1-5]/.test(cardNumber)) bandeira='Mastercard'; else if (/^3[47]/.test(cardNumber)) bandeira='Amex';
    var ultimos4=cardNumber.slice(-4); var validade=expiryMonth.padStart(2,'0')+'/'+expiryYear.slice(-2);
    var tokenResult=gw_tokenizeCard(cfg,{email:authEmail,cardNumber:cardNumber,expiryMonth:expiryMonth,expiryYear:expiryYear,cvv:cvv,cardHolder:cardHolder,cpf:cpf,nomeFirst:pts[0]||nome,nomeLast:pts.slice(1).join(' ')||'Aluno'});
    var men=getMensalidadeAluno(authEmail)||{}; var pl=getPlanoValor(men.planoId); var prox=new Date(); prox.setMonth(prox.getMonth()+1); prox.setDate(cfg.diaVencimento);
    var subResult=gw_createSubscription(cfg,{email:authEmail,valor:pl.valor,nomeFirst:pts[0]||nome,nomeLast:pts.slice(1).join(' ')||'Aluno',cpf:cpf,cardToken:tokenResult.cardToken,cardNumber:cardNumber,expiryMonth:expiryMonth,expiryYear:expiryYear,cvv:cvv,cardHolder:cardHolder,customerId:tokenResult.customerId,descricao:'Mensalidade '+ct,startDate:prox});
    var cSheet=getPagSheet('CartoesAlunos'); var cRows=cSheet?cSheet.getDataRange().getValues():[]; var found=false;
    for (var c=1;c<cRows.length;c++) { if (cRows[c][0]&&cRows[c][0].toString().toLowerCase()===authEmail) { cSheet.getRange(c+1,2,1,7).setValues([[ct,tokenResult.customerId,subResult.subscriptionId||'',bandeira,ultimos4,validade,new Date()]]); found=true; break; } }
    if (!found) cSheet.appendRow([authEmail,ct,tokenResult.customerId,subResult.subscriptionId||'',bandeira,ultimos4,validade,new Date()]);
    upsertMensalidade(authEmail,ct,men.planoId||'',cfg.gatewayId||'','PAGO',prox,subResult.subscriptionId||'','Cartão');
    return jsonResponse(true,'Cartão salvo e cobrança ativada!',{bandeira:bandeira,ultimos4:ultimos4});
  } catch(e) { Logger.log('salvarCartao: '+e.message); return errorResponse('Erro: '+e.message); }
}

function handleRemoverCartao(data) {
  var authEmail=requireAuth(data); if (!authEmail) return unauthorizedResponse();
  try {
    var ss=_getSpreadsheet(); var cSheet=ss.getSheetByName('CartoesAlunos'); if (!cSheet) return jsonResponse(true,'Nenhum cartão cadastrado');
    var cRows=cSheet.getDataRange().getValues();
    for (var c=1;c<cRows.length;c++) { if (cRows[c][0]&&cRows[c][0].toString().toLowerCase()===authEmail) { var ct=getCTDoAluno(authEmail); var cfg=getGatewayConfig(ct); var subId=cRows[c][3]?cRows[c][3].toString():''; if (cfg&&cfg.accessToken&&subId) { try { gw_cancelSubscription(cfg,subId); } catch(e2) { Logger.log('cancel sub: '+e2.message); } } cSheet.deleteRow(c+1); return jsonResponse(true,'Cartão removido'); } }
    return jsonResponse(true,'Nenhum cartão encontrado');
  } catch(e) { return errorResponse('Erro: '+e.message); }
}

function handleSalvarConfigMP(data) {
  var adminEmail=requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  try { var ct=(data.ct||'').toString().trim(); var chavePix=(data.chavePix||data.chave_pix||'').toString().trim(); var diaVenc=parseInt(data.diaVencimento||data.dia_vencimento)||10; if (!ct) return jsonResponse(false,'CT obrigatório'); var sheet=getPagSheet('ConfigPagamento'); var rows=sheet.getDataRange().getValues(); for (var i=1;i<rows.length;i++) { if (rows[i][0]&&rows[i][0].toString().trim()===ct) { sheet.getRange(i+1,2,1,5).setValues([['',chavePix,diaVenc,true,new Date()]]); return jsonResponse(true,'Configuração PIX salva para '+ct); } } sheet.appendRow([ct,'',chavePix,diaVenc,true,new Date()]); return jsonResponse(true,'Configuração PIX salva para '+ct); }
  catch(e) { return errorResponse('Erro: '+e.message); }
}

function handleGetConfigMP(data) { var adminEmail=requireAdmin(data); if (!adminEmail) return forbiddenResponse(); return handleGetVinculosCT(data); }

function httpCall(method,url,headers,payload) { var opts={method:method,headers:headers||{},muteHttpExceptions:true}; if (payload) opts.payload=typeof payload==='string'?payload:JSON.stringify(payload); var resp=UrlFetchApp.fetch(url,opts); try{return{code:resp.getResponseCode(),body:JSON.parse(resp.getContentText()||'{}')};}catch(e){return{code:resp.getResponseCode(),body:{raw:resp.getContentText()}};} }

function gw_createPix(cfg,p){if(!cfg||!cfg.accessToken)throw new Error('Access Token não configurado');switch(cfg.gateway){case 'mercadopago':return gw_mp_createPix(cfg,p);case 'infinitypay':return gw_ip_createPix(cfg,p);default:throw new Error('Gateway não suporta PIX: '+cfg.gateway);}}
function gw_createSubscription(cfg,p){switch(cfg.gateway){case 'mercadopago':return gw_mp_createSubscription(cfg,p);default:throw new Error('Assinatura não suportada: '+cfg.gateway);}}
function gw_cancelSubscription(cfg,subscriptionId){switch(cfg.gateway){case 'mercadopago':return gw_mp_cancelSubscription(cfg,subscriptionId);default:Logger.log('cancelSubscription não implementado: '+cfg.gateway);}}
function gw_getPaymentStatus(cfg,externalId){switch(cfg.gateway){case 'mercadopago':return gw_mp_getPaymentStatus(cfg,externalId);case 'infinitypay':return gw_ip_getPaymentStatus(cfg,externalId);default:return 'PENDENTE';}}
function gw_getHistory(cfg,email){switch(cfg.gateway){case 'mercadopago':return gw_mp_getHistory(cfg,email);case 'infinitypay':return gw_ip_getHistory(cfg,email);default:return[];}}
function gw_tokenizeCard(cfg,p){switch(cfg.gateway){case 'mercadopago':return gw_mp_tokenizeCard(cfg,p);default:throw new Error('Tokenização não suportada: '+cfg.gateway);}}

function mp_call(cfg,method,path,payload){var base='https://api.mercadopago.com';return httpCall(method,base+path,{'Authorization':'Bearer '+cfg.accessToken,'Content-Type':'application/json','X-Idempotency-Key':Utilities.getUuid()},payload);}
function gw_mp_createPix(cfg,p){var expira=new Date(Date.now()+30*60*1000);var r=mp_call(cfg,'post','/v1/payments',{transaction_amount:p.valor,description:p.descricao,payment_method_id:'pix',payer:{email:p.email,first_name:p.nomeFirst,last_name:p.nomeLast,identification:{type:'CPF',number:p.cpf||'00000000000'}},date_of_expiration:expira.toISOString()});if(r.code!==200&&r.code!==201)throw new Error('MP PIX error '+r.code+': '+JSON.stringify(r.body).substring(0,120));var txInfo=r.body.point_of_interaction&&r.body.point_of_interaction.transaction_data||{};return{externalId:r.body.id?r.body.id.toString():'',pixCode:txInfo.qr_code||'',qrBase64:txInfo.qr_code_base64||'',qrUrl:'',expira:expira};}
function gw_mp_getPaymentStatus(cfg,externalId){var r=mp_call(cfg,'get','/v1/payments/'+externalId,null);var s=r.body.status||'';return s==='approved'?'APROVADO':(s==='pending'||s==='in_process')?'PENDENTE':'NEGADO';}
function gw_mp_tokenizeCard(cfg,p){var r=mp_call(cfg,'post','/v1/card_tokens',{card_number:p.cardNumber,security_code:p.cvv,expiration_month:parseInt(p.expiryMonth),expiration_year:parseInt(p.expiryYear),cardholder:{name:p.cardHolder,identification:{type:'CPF',number:p.cpf||'00000000000'}}});if(r.code!==200&&r.code!==201)throw new Error('MP token error: '+r.code);return{customerId:'',cardToken:r.body.id||''};}
function gw_mp_createSubscription(cfg,p){var custR=mp_call(cfg,'post','/v1/customers',{email:p.email,first_name:p.nomeFirst,last_name:p.nomeLast});var custId=custR.body.id||'';if(custId)mp_call(cfg,'post','/v1/customers/'+custId+'/cards',{token:p.cardToken});var subR=mp_call(cfg,'post','/preapproval',{reason:p.descricao,auto_recurring:{frequency:1,frequency_type:'months',transaction_amount:p.valor,currency_id:'BRL',start_date:p.startDate?p.startDate.toISOString():new Date().toISOString()},payer_email:p.email,back_url:'https://script.google.com/macros/s/'});return{subscriptionId:subR.body.id?subR.body.id.toString():'',customerId:custId};}
function gw_mp_cancelSubscription(cfg,subscriptionId){mp_call(cfg,'put','/preapproval/'+subscriptionId,{status:'cancelled'});}
function gw_mp_getHistory(cfg,email){var r=mp_call(cfg,'get','/v1/payments/search?payer.email='+encodeURIComponent(email)+'&sort=date_created&criteria=desc&range=date_created&begin_date=NOW-6MONTHS&end_date=NOW&limit=6',null);if(!r.body.results)return[];return r.body.results.map(function(p){return{data:p.date_created?p.date_created.substring(0,10):'',referencia:p.description||'Mensalidade',valor:(p.transaction_amount||0).toFixed(2),status:p.status==='approved'?'APROVADO':p.status==='pending'?'PENDENTE':'NEGADO',metodo:p.payment_method_id||'—'}});}

function ip_call(cfg,method,path,payload){var base='https://api.infinitepay.io';return httpCall(method,base+path,{'Authorization':'Bearer '+cfg.accessToken,'Content-Type':'application/json'},payload);}
function gw_ip_createPix(cfg,p){var expira=new Date(Date.now()+30*60*1000);var r=ip_call(cfg,'post','/v2/transactions',{amount:Math.round(p.valor*100),payment_method:'pix',description:p.descricao,customer:{email:p.email,name:p.nomeFirst+' '+p.nomeLast,document:{type:'cpf',number:p.cpf||'00000000000'}},expires_in:1800});if(r.code!==200&&r.code!==201)throw new Error('InfinityPay PIX error '+r.code+': '+JSON.stringify(r.body).substring(0,120));var pix=r.body.pix||{};return{externalId:r.body.id?r.body.id.toString():'',pixCode:pix.qr_code||r.body.qr_code||'',qrBase64:pix.qr_code_image||'',qrUrl:'',expira:expira};}
function gw_ip_getPaymentStatus(cfg,externalId){var r=ip_call(cfg,'get','/v2/transactions/'+externalId,null);var s=(r.body.status||'').toLowerCase();if(s==='succeeded'||s==='paid'||s==='approved')return'APROVADO';if(s==='pending'||s==='waiting_payment'||s==='processing')return'PENDENTE';return'NEGADO';}
function gw_ip_getHistory(cfg,email){var r=ip_call(cfg,'get','/v2/transactions?customer_email='+encodeURIComponent(email)+'&limit=6&sort=-created_at',null);var list=r.body.data||r.body.transactions||[];return list.map(function(t){var s=(t.status||'').toLowerCase();return{data:t.created_at?t.created_at.substring(0,10):'',referencia:t.description||'Mensalidade',valor:((t.amount||0)/100).toFixed(2),status:(s==='succeeded'||s==='paid')?'APROVADO':s==='pending'?'PENDENTE':'NEGADO',metodo:t.payment_method||'—'}});}

function handleWebhookMP(data){return handleWebhookPagamento(data);}
function handleWebhookPagamento(data){
  try{var externalId=(data.id||(data.data&&data.data.id)||'').toString();if(!externalId)return ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);var cfgRows=getPagSheet('ConfigPagamento').getDataRange().getValues();var tokRows=getPagSheet('GatewayTokens').getDataRange().getValues();var tokMap={};for(var t=1;t<tokRows.length;t++){if(tokRows[t][0]&&tokRows[t][5]!==false&&tokRows[t][5]!=='FALSE')tokMap[tokRows[t][0].toString()]={gateway:tokRows[t][1].toString(),accessToken:tokRows[t][2].toString()};}for(var c=1;c<cfgRows.length;c++){if(!cfgRows[c][0]||cfgRows[c][4]===false)continue;var gwId=cfgRows[c][1]?cfgRows[c][1].toString():'';if(!gwId||!tokMap[gwId])continue;var tok=tokMap[gwId];var cfg={ct:cfgRows[c][0].toString(),gateway:tok.gateway,accessToken:tok.accessToken,apiKey:tok.accessToken,diaVencimento:parseInt(cfgRows[c][3])||10};try{var status=gw_getPaymentStatus(cfg,externalId);if(status==='APROVADO'){var menRows=getPagSheet('Mensalidades').getDataRange().getValues();for(var m=1;m<menRows.length;m++){if(menRows[m][6]&&menRows[m][6].toString()===externalId){var email=menRows[m][0].toString();var venc=new Date();venc.setMonth(venc.getMonth()+1);venc.setDate(cfg.diaVencimento);upsertMensalidade(email,cfg.ct,menRows[m][2].toString(),gwId,'PAGO',venc,externalId,menRows[m][7]||'');Logger.log('Webhook aprovado: '+email+' via '+cfg.gateway);break;}}}break;}catch(e2){}}}catch(e){Logger.log('webhook err: '+e.message);}return ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);
}


// ============================================================
// ███  MÓDULO: REDES DE BENEFÍCIO — Wellhub & TotalPass  ███
// ============================================================

function getWellnessSheet(name) { var ss=_getSpreadsheet(); var s=ss.getSheetByName(name); if (!s) { s=ss.insertSheet(name); var H={'ConfigWellness':['Rede','GymID','ClientID','ClientSecret','Ativo','WebhookSecret','CT','UpdatedAt'],'CheckinsWellness':['Data','Rede','UserID','Nome','CT','Status','ExternalRef','Timestamp']}; if (H[name]) { s.appendRow(H[name]); s.getRange(1,1,1,H[name].length).setFontWeight('bold'); } } return s; }

function getWellnessConfig(rede,ct) { var rows=getWellnessSheet('ConfigWellness').getDataRange().getValues(); for (var i=1;i<rows.length;i++) { if (!rows[i][0]) continue; if (rows[i][0].toString().toLowerCase()!==rede.toLowerCase()) continue; if (rows[i][4]===false||rows[i][4]==='FALSE') continue; if (ct&&rows[i][6]&&rows[i][6].toString().trim()!==ct) continue; return {rede:rows[i][0].toString(),gymId:rows[i][1]?rows[i][1].toString():'',clientId:rows[i][2]?rows[i][2].toString():'',clientSecret:rows[i][3]?rows[i][3].toString():'',webhookSecret:rows[i][5]?rows[i][5].toString():'',ct:rows[i][6]?rows[i][6].toString():'',rowIndex:i+1}; } return null; }

function getAllWellnessConfigs() { var rows=getWellnessSheet('ConfigWellness').getDataRange().getValues(); var result=[]; for (var i=1;i<rows.length;i++) { if (!rows[i][0]) continue; result.push({rede:rows[i][0].toString(),gymId:rows[i][1]?rows[i][1].toString():'',clientId:rows[i][2]?rows[i][2].toString().substring(0,8)+'...':'',ativo:rows[i][4]!==false&&rows[i][4]!=='FALSE',ct:rows[i][6]?rows[i][6].toString():'',rowIndex:i+1}); } return result; }

function validateWellhubToken(cfg,token) {
  if (!token||!cfg.clientId||!cfg.clientSecret) return null;
  try { var r=UrlFetchApp.fetch('https://gympass.com/v1/checkin/validate',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Basic '+Utilities.base64Encode(cfg.clientId+':'+cfg.clientSecret)},payload:JSON.stringify({token:token,gym_id:cfg.gymId}),muteHttpExceptions:true}); var code=r.getResponseCode(); var body=JSON.parse(r.getContentText()||'{}'); if (code===200&&body.valid) { return {userId:body.user_id||body.userId||'',nome:body.user_name||body.name||'Usuário Wellhub',cpf:body.cpf||'',valido:true}; } Logger.log('Wellhub validate failed: '+code); return null; } catch(e) { Logger.log('Wellhub validate error: '+e.message); return null; }
}

function validateTotalPassToken(cfg,token,params) {
  if (!token) return null;
  try { var decoded=''; try{decoded=Utilities.newBlob(Utilities.base64Decode(token)).getDataAsString();}catch(e2){decoded=token;} var parts=decoded.split(':'); if (parts.length<2) return null; var userId=parts[0]; var timestamp=parseInt(parts[1])||0; var now=Math.floor(Date.now()/1000); if (Math.abs(now-timestamp)>300) { Logger.log('TotalPass token expirado'); return null; } if (cfg.webhookSecret) { var expected=Utilities.computeHmacSha256Signature(decoded,cfg.webhookSecret).map(function(b){return('0'+(b&0xFF).toString(16)).slice(-2);}).join(''); var provided=(params.signature||params.sig||'').toString(); if (provided&&provided!==expected) { Logger.log('TotalPass signature inválida'); return null; } } var r=UrlFetchApp.fetch('https://api.totalpass.com.br/v1/validate-checkin',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':cfg.clientSecret},payload:JSON.stringify({userId:userId,gymId:cfg.gymId,token:token}),muteHttpExceptions:true}); var code=r.getResponseCode(); var body=JSON.parse(r.getContentText()||'{}'); if (code===200) { return {userId:userId,nome:body.name||body.userName||'Usuário TotalPass',cpf:body.cpf||'',valido:true}; } Logger.log('TotalPass validate failed: '+code); return null; } catch(e) { Logger.log('TotalPass validate error: '+e.message); return null; }
}

function processWellnessCheckin(rede,token,gymId,userId,params) {
  try {
    var cfg=getWellnessConfig(rede,null); if (!cfg) { Logger.log('Wellness config não encontrada para rede: '+rede); return {success:false,error:'Academia não configurada para '+rede}; }
    var userInfo=null; if (rede==='wellhub') { userInfo=validateWellhubToken(cfg,token); } else if (rede==='totalpass') { userInfo=validateTotalPassToken(cfg,token,params); }
    var sandboxMode=cfg.clientSecret==='sandbox'||cfg.clientSecret==='test'||!cfg.clientId; if (!userInfo&&sandboxMode) { userInfo={userId:userId||'sandbox_user',nome:'Usuário '+rede+' (Sandbox)',valido:true}; Logger.log('Wellness SANDBOX mode: '+rede); }
    if (!userInfo) return {success:false,error:'Token inválido ou expirado'};
    var ct=cfg.ct||'Principal'; var now=new Date(); var todayStr=Utilities.formatDate(now,Session.getScriptTimeZone(),'yyyy-MM-dd'); var hora=Utilities.formatDate(now,Session.getScriptTimeZone(),'HH:mm'); var extRef=rede+'_'+(userInfo.userId||userId)+'_'+todayStr;
    var wSheet=getWellnessSheet('CheckinsWellness'); var wRows=wSheet.getDataRange().getValues();
    for (var i=1;i<wRows.length;i++) { if (!wRows[i][0]) continue; var rowDate=wRows[i][0] instanceof Date?Utilities.formatDate(wRows[i][0],Session.getScriptTimeZone(),'yyyy-MM-dd'):wRows[i][0].toString().substring(0,10); if (rowDate===todayStr&&wRows[i][2]===userInfo.userId&&wRows[i][1]===rede) { Logger.log('Wellness check-in duplicado: '+userInfo.userId); return {success:true,message:'Check-in já registrado hoje',status:'DUPLICADO'}; } }
    wSheet.appendRow([now,rede.toUpperCase(),userInfo.userId,userInfo.nome,ct,'APROVADO',extRef]);
    var presencaSheet=getSheet('Presenca'); var nomeExib=userInfo.nome+' ['+rede.toUpperCase()+']';
    presencaSheet.appendRow([userInfo.cpf||(rede+'_'+userInfo.userId),nomeExib,'—','—',ct,hora,now,hora,'APROVADO',rede.toUpperCase(),'']);
    Logger.log('Wellness check-in OK: '+rede+' | '+userInfo.nome+' | '+ct);
    return {success:true,message:'Check-in registrado com sucesso!',status:'APROVADO',user:userInfo.nome,ct:ct,hora:hora,timestamp:now.toISOString()};
  } catch(e) { Logger.log('processWellnessCheckin error: '+e.message); return {success:false,error:'Erro interno: '+e.message}; }
}

function handleGetWellnessConfig(data) { var adminEmail=requireAdmin(data); if (!adminEmail) return forbiddenResponse(); try { var configs=getAllWellnessConfigs(); return ContentService.createTextOutput(JSON.stringify({success:true,configs:configs,redes:['wellhub','totalpass'],webhookUrl:'https://script.google.com/macros/s/SEU_SCRIPT_ID/exec'})).setMimeType(ContentService.MimeType.JSON); } catch(e) { return errorResponse('Erro: '+e.message); } }

function handleSaveWellnessConfig(data) {
  var adminEmail=requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  try { var rede=(data.rede||'').toString().toLowerCase().trim(); var gymId=(data.gymId||'').toString().trim(); var clientId=(data.clientId||'').toString().trim(); var clientSecret=(data.clientSecret||'').toString().trim(); var webhookSecret=(data.webhookSecret||'').toString().trim(); var ct=(data.ct||'').toString().trim(); var ativo=data.ativo!==false&&data.ativo!=='false'; var redesValidas=['wellhub','totalpass']; if (redesValidas.indexOf(rede)===-1) return jsonResponse(false,'Rede inválida: '+rede); if (!gymId) return jsonResponse(false,'GymID obrigatório'); var sheet=getWellnessSheet('ConfigWellness'); var rows=sheet.getDataRange().getValues(); for (var i=1;i<rows.length;i++) { if (rows[i][0]&&rows[i][0].toString().toLowerCase()===rede&&rows[i][6]&&rows[i][6].toString()===ct) { sheet.getRange(i+1,2,1,7).setValues([[gymId,clientId,clientSecret,ativo,webhookSecret,ct,new Date()]]); return jsonResponse(true,'Configuração atualizada para '+rede+' — '+ct); } } sheet.appendRow([rede,gymId,clientId,clientSecret,ativo,webhookSecret,ct,new Date()]); return jsonResponse(true,'Configuração criada para '+rede+' — '+ct); }
  catch(e) { return errorResponse('Erro: '+e.message); }
}

function handleGetWellnessCheckins(data) {
  var adminEmail=requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  try { var sheet=getWellnessSheet('CheckinsWellness'); var rows=sheet.getDataRange().getValues(); var filterRede=(data.rede||'').toLowerCase(); var filterCT=data.ct||''; var checkins=[];
    for (var i=rows.length-1;i>=1;i--) { if (!rows[i][0]) continue; var rede=(rows[i][1]||'').toString().toLowerCase(); if (filterRede&&rede!==filterRede) continue; if (filterCT&&(rows[i][4]||'').toString()!==filterCT) continue; var dt=rows[i][0] instanceof Date?Utilities.formatDate(rows[i][0],Session.getScriptTimeZone(),'dd/MM/yyyy HH:mm'):rows[i][0].toString(); checkins.push({data:dt,rede:rows[i][1]||'',userId:rows[i][2]||'',nome:rows[i][3]||'',ct:rows[i][4]||'',status:rows[i][5]||'',extRef:rows[i][6]||''}); if (checkins.length>=200) break; }
    return ContentService.createTextOutput(JSON.stringify({success:true,checkins:checkins})).setMimeType(ContentService.MimeType.JSON); }
  catch(e) { return errorResponse('Erro: '+e.message); }
}

function handleGetWellnessReport(data) {
  var adminEmail=requireAdmin(data); if (!adminEmail) return forbiddenResponse();
  try { var sheet=getWellnessSheet('CheckinsWellness'); var rows=sheet.getDataRange().getValues(); var hoje=new Date(); var mesAtual=hoje.getMonth(); var anoAtual=hoje.getFullYear(); var byRede={},byDia={},totalMes=0,totalGeral=0;
    for (var i=1;i<rows.length;i++) { if (!rows[i][0]) continue; var dt=rows[i][0] instanceof Date?rows[i][0]:new Date(rows[i][0]); if (isNaN(dt.getTime())) continue; var rede=(rows[i][1]||'UNKNOWN').toString(); if (!byRede[rede]) byRede[rede]={total:0,mes:0}; byRede[rede].total++; totalGeral++; if (dt.getMonth()===mesAtual&&dt.getFullYear()===anoAtual) { byRede[rede].mes++; totalMes++; var dStr=Utilities.formatDate(dt,Session.getScriptTimeZone(),'yyyy-MM-dd'); if (!byDia[dStr]) byDia[dStr]=0; byDia[dStr]++; } }
    var byDiaArr=Object.keys(byDia).sort().map(function(d){return{data:d,total:byDia[d]};});
    return ContentService.createTextOutput(JSON.stringify({success:true,totalGeral:totalGeral,totalMes:totalMes,byRede:byRede,byDia:byDiaArr})).setMimeType(ContentService.MimeType.JSON); }
  catch(e) { return errorResponse('Erro: '+e.message); }
}

function handleValidateWellnessToken(data) { var authEmail=requireAdmin(data); if (!authEmail) return forbiddenResponse(); try { var rede=(data.rede||'').toLowerCase(); var token=data.token||''; var cfg=getWellnessConfig(rede,null); if (!cfg) return jsonResponse(false,'Rede não configurada: '+rede); var info=rede==='wellhub'?validateWellhubToken(cfg,token):validateTotalPassToken(cfg,token,{}); if (info) return jsonResponse(true,'Token válido',{user:info.nome,userId:info.userId}); return jsonResponse(false,'Token inválido ou API da rede indisponível'); } catch(e) { return errorResponse('Erro: '+e.message); } }


// ============================================================
// ===== MODALIDADES — CRUD na planilha "Modalidades" =====
// ============================================================
// Estrutura da sheet "Modalidades":
// A:id | B:nome | C:icon | D:cor | E:corRGB | F:desc | G:gradTipo | H:ativo
// Exemplo de linha:
//   bjj_adulto | BJJ Adulto | 🥋 | #C9A23A | 201,162,58 | Brazilian Jiu-Jitsu | faixa_cintura | TRUE

// Cria a sheet Modalidades com cabeçalho e dados padrão se não existir
function ensureModalidadesSheet() {
  var ss = _getSpreadsheet();
  var sheet = ss.getSheetByName('Modalidades');
  if (!sheet) {
    sheet = ss.insertSheet('Modalidades');
    var header = ['id','nome','icon','cor','corRGB','desc','gradTipo','ativo'];
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
    sheet.getRange(1, 1, 1, header.length).setFontWeight('bold');

    // Dados padrão (os que eram hardcoded antes)
    var defaults = [
      ['bjj_adulto',  'BJJ',         '🥋', '#C9A23A', '201,162,58', 'Brazilian Jiu-Jitsu — faixas por idade (Kids 4-15 / Adulto 16+)', 'faixa_cintura', true],
      ['muay_thai',   'Muay Thai',       '🥷', '#F97316', '249,115,22', 'Arte das Oito Armas — Prajied Simples (11 graus)', 'prajied', true],
      ['muay_thai_khan','Muay Thai Khan', '🥷', '#E85D04', '232,93,4',   'Arte das Oito Armas — Sistema Khan IFMA/WMC (16 níveis)', 'prajied', true],
      ['mma',         'MMA',         '🥊', '#EF4444', '239,68,68',  'Mixed Martial Arts',      'nenhum',        true],
      ['judo',        'Judô',        '🎌', '#D97706', '217,119,6',  'Arte Marcial Japonesa',   'faixa_cintura', true],
      ['karate',      'Karatê',      '🥋', '#DC2626', '220,38,38',  'Arte Marcial Japonesa',   'faixa_cintura', true],
      ['capoeira',    'Capoeira',    '🌀', '#16A34A', '22,163,74',  'Arte Marcial Brasileira', 'corda',         true],
      ['boxe',        'Boxe',        '🥊', '#3B82F6', '59,130,246', 'Boxe Inglês',             'nenhum',        true],
      ['wrestling',   'Wrestling',   '🤼', '#8B5CF6', '139,92,246', 'Luta Olímpica',           'nenhum',        true],
      ['kickboxing',  'Kickboxing',  '🦵', '#EC4899', '236,72,153', 'Kickboxing — Sistema WAKO (mais utilizado no Brasil)', 'faixa_cintura', true],
      ['taekwondo',   'Taekwondo',   '🥋', '#1565C0', '21,101,192', 'Taekwondo — Sistema WT/Kukkiwon (Geup e Dan)',         'faixa_cintura', true],
    ];
    if (defaults.length > 0) {
      sheet.getRange(2, 1, defaults.length, defaults[0].length).setValues(defaults);
    }
    sheet.autoResizeColumns(1, header.length);
  }
  return sheet;
}



// GET — retorna modalidades filtradas pelo contrato do licenciado
// SuperAdmin vê todas; admin vê apenas as contratadas; aluno vê as do seu CT
function handleGetModalidades(data) {
  try {
    var sheet  = ensureModalidadesSheet();
    var rows   = sheet.getDataRange().getValues();

    // Determina filtro de contrato
    var contratadas = null; // null = sem filtro (vê todas as ativas)
    var authEmail   = '';
    try { authEmail = requireAuth(data) || ''; } catch(e) {}

    var isSA = authEmail ? isEmailSuperAdmin(authEmail) : false;

    if (!isSA && authEmail) {
      // Busca modalidades_contrato do licenciado pelo email
      var lic = _getLicenciado(authEmail);
      if (lic && lic.modalidadesContrato) {
        contratadas = lic.modalidadesContrato
          .split(',')
          .map(function(m){ return m.trim().toLowerCase(); })
          .filter(Boolean);
      }
    }

    var mods = [];
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      if (!r[0]) continue;
      var id    = r[0].toString().trim().toLowerCase();
      var ativo = r[7] === true || r[7] === 'TRUE' || r[7] === 'true';
      if (!ativo && !isSA) continue; // alunos/admins só vêem ativas
      // Filtro de contrato: SuperAdmin vê todas; demais só as contratadas (ou todas se lista vazia)
      if (!isSA && contratadas && contratadas.length > 0) {
        if (contratadas.indexOf(id) === -1) continue;
      }
      mods.push({
        id:       id,
        nome:     r[1] ? r[1].toString().trim() : '',
        icon:     r[2] ? r[2].toString().trim() : '🥋',
        cor:      r[3] ? r[3].toString().trim() : '#C9A23A',
        corRGB:   r[4] ? r[4].toString().trim() : '201,162,58',
        desc:     r[5] ? r[5].toString().trim() : '',
        gradTipo: r[6] ? r[6].toString().trim() : 'nenhum',
        ativo:    ativo
      });
    }
    // Inclui faixas de cada modalidade para o frontend popular o schema dinamicamente
    try {
      var faixasMapa = getFaixasPorModalidade();
      mods.forEach(function(m) {
        m.faixas = faixasMapa[m.id] || [];
      });
    } catch(ef) { Logger.log('getFaixas inline: ' + ef.message); }

    return jsonResponse(true, null, { modalidades: mods });
  } catch(e) {
    Logger.log('Erro getModalidades: ' + e.message);
    return errorResponse('Erro ao carregar modalidades');
  }
}

// SAVE — cria ou atualiza uma modalidade (somente admin)
function handleSaveModalidade(data) {
  var adminEmail = requireAdmin(data);
  if (!adminEmail) return forbiddenResponse();

  var id    = (data.id    || '').toString().trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  var nome  = (data.nome  || '').toString().trim();
  var icon  = (data.icon  || '🥋').toString().trim();
  var cor   = (data.cor   || '#C9A23A').toString().trim();
  var corRGB= (data.corRGB|| '201,162,58').toString().trim();
  var desc  = (data.desc  || '').toString().trim();
  var gradTipo = (data.gradTipo || 'nenhum').toString().trim();
  var ativo = data.ativo !== false; // default true

  if (!id)   return jsonResponse(false, 'ID obrigatório (ex: kung_fu)');
  if (!nome) return jsonResponse(false, 'Nome obrigatório');

  try {
    var sheet = ensureModalidadesSheet();
    var rows  = sheet.getDataRange().getValues();

    // Procura linha existente pelo id
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] && rows[i][0].toString().trim().toLowerCase() === id) {
        // Atualiza
        sheet.getRange(i + 1, 1, 1, 8).setValues([[id, nome, icon, cor, corRGB, desc, gradTipo, ativo]]);
        return jsonResponse(true, 'Modalidade "' + nome + '" atualizada!');
      }
    }

    // Nova linha
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, 1, 8).setValues([[id, nome, icon, cor, corRGB, desc, gradTipo, ativo]]);
    return jsonResponse(true, 'Modalidade "' + nome + '" criada!');
  } catch(e) {
    Logger.log('Erro saveModalidade: ' + e.message);
    return errorResponse('Erro ao salvar modalidade');
  }
}

// DELETE — remove (ou desativa) uma modalidade (somente superadmin)
function handleDeleteModalidade(data) {
  var adminEmail = requireAdmin(data);
  if (!adminEmail) return forbiddenResponse();

  // Só superadmin pode excluir de vez; outros apenas desativam
  var isSuperAdmin = SUPER_ADMIN_EMAILS.indexOf(adminEmail.toLowerCase()) !== -1;
  var id = (data.id || '').toString().trim().toLowerCase();
  if (!id) return jsonResponse(false, 'ID obrigatório');

  try {
    var sheet = ensureModalidadesSheet();
    var rows  = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] && rows[i][0].toString().trim().toLowerCase() === id) {
        if (isSuperAdmin && data.excluirFisico) {
          sheet.deleteRow(i + 1);
          return jsonResponse(true, 'Modalidade excluída permanentemente.');
        } else {
          // Desativa (soft delete)
          sheet.getRange(i + 1, 8).setValue(false);
          return jsonResponse(true, 'Modalidade desativada.');
        }
      }
    }
    return jsonResponse(false, 'Modalidade não encontrada');
  } catch(e) {
    Logger.log('Erro deleteModalidade: ' + e.message);
    return errorResponse('Erro ao excluir modalidade');
  }
}

// ============================================================
// ===== COBRANÇA RECORRENTE AUTOMÁTICA (TIME TRIGGER) ========
// ============================================================
//
// Fluxo:
//   1. Admin chama installMensalidadeTrigger() UMA VEZ para
//      registrar o cron diário no GAS.
//   2. Todo dia cobrarMensalidade() roda automaticamente:
//      a. Varre alunos com cartão salvo e status PENDENTE/ATRASADO
//         cujo vencimento chegou.
//      b. Cobra via preapproval (MP) ou cria nova cobrança.
//      c. Atualiza status na planilha.
//      d. Alunos com PIX: só atualiza status para ATRASADO se vencido.
//
// Para instalar: abra o editor GAS e execute installMensalidadeTrigger()
// ============================================================

/**
 * Instala o trigger diário de cobrança recorrente.
 * Execute manualmente UMA VEZ no editor GAS.
 * Idempotente: remove trigger antigo antes de criar novo.
 */
function installMensalidadeTrigger() {
  // Remove triggers existentes com o mesmo nome
  var existing = ScriptApp.getProjectTriggers();
  for (var i = 0; i < existing.length; i++) {
    if (existing[i].getHandlerFunction() === 'cobrarMensalidade') {
      ScriptApp.deleteTrigger(existing[i]);
    }
  }
  // Cria trigger diário às 07:00
  ScriptApp.newTrigger('cobrarMensalidade')
    .timeBased()
    .everyDays(1)
    .atHour(7)
    .create();
  Logger.log('Trigger cobrarMensalidade instalado — roda diariamente às 07h');
}

/**
 * Ponto de entrada do cron diário.
 * Processa mensalidades vencidas para todos os CTs com gateway ativo.
 */
function cobrarMensalidade() {
  Logger.log('[cobrarMensalidade] Início: ' + new Date().toISOString());
  try {
    var processados = 0, cobrados = 0, erros = 0;

    // Lê todos os alunos ativos
    var alunosSheet = getSheet('Alunos');
    var alunos = alunosSheet.getDataRange().getValues();

    // Lê todos os cartões salvos (email → {ct, customerId, subscriptionId, bandeira, ultimos4})
    var ss = _getSpreadsheet();
    var cSheet = ss.getSheetByName('CartoesAlunos');
    var cartaoMap = {};
    if (cSheet) {
      var cRows = cSheet.getDataRange().getValues();
      for (var c = 1; c < cRows.length; c++) {
        if (!cRows[c][0]) continue;
        var em = cRows[c][0].toString().trim().toLowerCase();
        cartaoMap[em] = {
          ct:             cRows[c][1] ? cRows[c][1].toString() : '',
          customerId:     cRows[c][2] ? cRows[c][2].toString().trim() : '',
          subscriptionId: cRows[c][3] ? cRows[c][3].toString().trim() : '',
          bandeira:       cRows[c][4] ? cRows[c][4].toString().trim() : '',
          ultimos4:       cRows[c][5] ? cRows[c][5].toString().trim() : ''
        };
      }
    }

    var hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    for (var i = 1; i < alunos.length; i++) {
      if (!alunos[i][0]) continue;
      var email = alunos[i][0].toString().trim().toLowerCase();
      var acctStatus = alunos[i][25] ? alunos[i][25].toString().toUpperCase() : '';
      if (acctStatus === 'DESATIVADO') continue;

      try {
        processados++;
        _processarCobrancaAluno(email, cartaoMap, hoje);
      } catch (e) {
        erros++;
        Logger.log('[cobrarMensalidade] Erro em ' + email + ': ' + e.message);
      }
    }

    Logger.log('[cobrarMensalidade] Fim: ' + processados + ' processados, ' + erros + ' erros');
  } catch (e) {
    Logger.log('[cobrarMensalidade] ERRO GERAL: ' + e.message);
  }
}

/**
 * Processa a cobrança de um aluno específico.
 * Lógica:
 *   - Se tem cartão: verifica se preapproval ainda ativa; se vencida, renova.
 *   - Se não tem cartão + status PENDENTE: verifica se venceu → marca ATRASADO.
 */
function _processarCobrancaAluno(email, cartaoMap, hoje) {
  var men = getMensalidadeAluno(email);
  if (!men || !men.planoId) return;

  var statusAtual = (men.status || '').toUpperCase();
  if (statusAtual === 'PAGO') {
    var vencDate = _parseDDMMYYYY(men.vencimento);
    if (!vencDate || vencDate > hoje) return;
    var ct = getCTDoAluno(email);
    var cfg = getGatewayConfig(ct);
    var diaVenc = cfg ? (cfg.diaVencimento || 10) : 10;
    var novoVenc = new Date(hoje.getFullYear(), hoje.getMonth(), diaVenc);
    if (novoVenc <= hoje) novoVenc = new Date(hoje.getFullYear(), hoje.getMonth() + 1, diaVenc);
    upsertMensalidade(email, ct, men.planoId, men.gatewayId || '', 'PENDENTE', novoVenc, '', men.metodo || '');
    Logger.log('[cron] ' + email + ': PAGO → PENDENTE (venceu em ' + men.vencimento + ')');
    return;
  }

  if (statusAtual !== 'PENDENTE' && statusAtual !== 'ATRASADO' && statusAtual !== '') return;

  var vencDate = _parseDDMMYYYY(men.vencimento);
  if (!vencDate) return;
  var diffDias = Math.floor((hoje - vencDate) / (1000 * 60 * 60 * 24));
  if (diffDias < 0) return;

  var ct = getCTDoAluno(email);
  var cfg = getGatewayConfig(ct);
  if (!cfg) return;

  var cartao = cartaoMap[email];

  if (cartao && cartao.customerId && cfg.accessToken && cfg.gateway === 'mercadopago') {
    // ── TEM CARTÃO: cobrança direta via customerId ────────────────────
    try {
      var pmId = _mpBandeiraToPaymentMethodId(cartao.bandeira || '');
      var chargeResult = gw_mp_directCharge(cfg, {
        valor:      getPlanoValor(men.planoId).valor,
        descricao:  'Mensalidade ' + ct,
        customerId: cartao.customerId,
        pmId:       pmId,
        email:      email
      });

      if (chargeResult.status === 'approved') {
        var prox = calcularProximaCobranca(men.lastPaymentDate || '', cfg, getBillingConfig());
        upsertMensalidade(email, ct, men.planoId, men.gatewayId || '', 'PAGO', prox, chargeResult.id, 'Cartão');
        Logger.log('[cron] ' + email + ': cartão aprovado id=' + chargeResult.id + ' → PAGO');
      } else {
        // Cartão recusado → fallback PIX
        var motivo = chargeResult.statusDetail || chargeResult.status;
        _ativarFallbackPix(email, ct, men, cfg, vencDate, 'Cartão recusado (' + motivo + ')');
      }
    } catch (e) {
      Logger.log('[cron] ' + email + ' erro cobrança cartão: ' + e.message);
      _ativarFallbackPix(email, ct, men, cfg, vencDate, 'Erro no gateway: ' + e.message);
    }

  } else {
    // ── SEM CARTÃO — PIX / manual ────────────────────────────────
    if (diffDias >= 1 && statusAtual !== 'ATRASADO') {
      upsertMensalidade(email, ct, men.planoId, men.gatewayId || '', 'ATRASADO', vencDate, men.externalId || '', men.metodo || 'PIX');
      Logger.log('[cron] ' + email + ': sem cartão, vencido ' + diffDias + 'd → ATRASADO');
    }
  }
}

/**
 * Ativa o fallback para PIX quando o cartão falhou.
 * - status = PENDENTE (não ATRASADO — aluno ainda pode pagar via PIX)
 * - metodo = 'PIX_FALLBACK'  ← sinaliza para o frontend exibir aviso + PIX
 * - externalId = motivo do fallback (para rastreabilidade)
 */
function _ativarFallbackPix(email, ct, men, cfg, vencDate, motivo) {
  upsertMensalidade(
    email, ct, men.planoId, men.gatewayId || '',
    'PENDENTE',             // mantém PENDENTE — PIX ainda pode pagar
    vencDate,               // vencimento original
    motivo,                 // motivo gravado no campo externalId
    'PIX_FALLBACK'          // ← flag lida pelo frontend
  );
  Logger.log('[cron] ' + email + ': FALLBACK PIX — ' + motivo);
}

/**
 * Busca o último pagamento individual de uma preapproval do MP.
 * Retorna { id, status, statusDetail, valor }
 */
function _getPreapprovalLastPayment(cfg, subscriptionId) {
  try {
    var r = mp_call(cfg, 'get',
      '/preapproval_payment?preapproval_id=' + subscriptionId +
      '&sort=date_created&criteria=desc&limit=1', null);
    if (r.code !== 200 || !r.body.results || !r.body.results.length) {
      return { status: 'unknown', id: '', statusDetail: '' };
    }
    var p = r.body.results[0];
    var st = (p.status || '').toLowerCase();
    return {
      id:           p.id ? p.id.toString() : '',
      status:       st,
      statusDetail: (p.status_detail || '').toLowerCase(),
      valor:        p.transaction_amount || 0
    };
  } catch (e) {
    Logger.log('_getPreapprovalLastPayment: ' + e.message);
    return { status: 'unknown', id: '', statusDetail: '' };
  }
}

/**
 * Retorna o status de uma preapproval do Mercado Pago.
 * Possíveis retornos: 'authorized' | 'paused' | 'cancelled' | 'pending'
 */
function _getPreapprovalStatus(cfg, subscriptionId) {
  var r = mp_call(cfg, 'get', '/preapproval/' + subscriptionId, null);
  if (r.code !== 200) return 'unknown';
  return (r.body.status || 'unknown').toLowerCase();
}

/**
 * Converte string 'dd/MM/yyyy' em Date. Retorna null se inválido.
 */
function _parseDDMMYYYY(str) {
  if (!str) return null;
  var s = str.toString().trim();
  // Aceita dd/MM/yyyy ou yyyy-MM-dd
  var mBR  = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  var mISO = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  try {
    if (mBR)  return new Date(parseInt(mBR[3]),  parseInt(mBR[2])-1,  parseInt(mBR[1]));
    if (mISO) return new Date(parseInt(mISO[1]), parseInt(mISO[2])-1, parseInt(mISO[3]));
  } catch(e) {}
  return null;
}

/**
 * Roda manualmente pelo admin para reprocessar todos agora
 * (sem esperar o trigger diário).
 * Exposta via action 'cobrarMensalidadeManual' (admin-only).
 */
function handleCobrarMensalidadeManual(data) {
  var adminEmail = requireAdmin(data);
  if (!adminEmail) return forbiddenResponse();
  try {
    cobrarMensalidade();
    return jsonResponse(true, 'Cobrança recorrente processada!');
  } catch(e) {
    return errorResponse('Erro: ' + e.message);
  }
}

// ============================================================
// ===== BILLING CONFIG + COBRAR AGORA + MODALIDADE→PLANO =====
// ============================================================

// ── Billing Config (stored in ConfigModulos sheet, key='billing') ──

/**
 * Lê configuração de cobrança do sistema.
 * Defaults: billingMode='fixed_day', defaultDueDay=10
 */
function getBillingConfig() {
  try {
    var sheet = getOrCreateModulesConfigSheet();
    var rows  = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] === 'billing') {
        try { return JSON.parse(rows[i][1]); } catch(e) {}
      }
    }
  } catch(e) {}
  return { billingMode: 'fixed_day', defaultDueDay: 10 };
}

function handleGetBillingConfig(data) {
  var adminEmail = requireAdmin(data);
  if (!adminEmail) return forbiddenResponse();
  return jsonResponse(true, null, { billingConfig: getBillingConfig() });
}

function handleSaveBillingConfig(data) {
  var adminEmail = requireAdmin(data);
  if (!adminEmail) return forbiddenResponse();
  try {
    var mode   = (data.billingMode || 'fixed_day').toString().trim();
    var dueDay = Math.min(28, Math.max(1, parseInt(data.defaultDueDay) || 10));
    if (['fixed_day','rolling_30_days'].indexOf(mode) === -1) {
      return jsonResponse(false, 'billingMode inválido');
    }
    var cfg = { billingMode: mode, defaultDueDay: dueDay };
    var sheet = getOrCreateModulesConfigSheet();
    var rows  = sheet.getDataRange().getValues();
    var now   = new Date();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] === 'billing') {
        sheet.getRange(i+1,2,1,2).setValues([[JSON.stringify(cfg), now]]);
        return jsonResponse(true, 'Configuração de cobrança salva!', { billingConfig: cfg });
      }
    }
    sheet.appendRow(['billing', JSON.stringify(cfg), now]);
    return jsonResponse(true, 'Configuração de cobrança salva!', { billingConfig: cfg });
  } catch(e) { return errorResponse('Erro: ' + e.message); }
}

// ── calcularProximaCobranca ──────────────────────────────────

/**
 * Calcula a próxima data de cobrança com base no billingMode.
 *
 * fixed_day:     usa diaVencimento do CT (ou defaultDueDay do billingConfig)
 * rolling_30:    lastPaymentDate + 30 dias
 *
 * @param {string}  lastPaymentDate  'dd/MM/yyyy' da última cobrança (pode ser '')
 * @param {object}  ctCfg            getGatewayConfig() do CT
 * @param {object}  billingCfg       getBillingConfig()
 * @returns {Date}
 */
function calcularProximaCobranca(lastPaymentDate, ctCfg, billingCfg) {
  var hoje   = new Date();
  hoje.setHours(0,0,0,0);
  var bCfg   = billingCfg || getBillingConfig();
  var mode   = bCfg.billingMode || 'fixed_day';

  if (mode === 'rolling_30_days' && lastPaymentDate) {
    var last = _parseDDMMYYYY(lastPaymentDate);
    if (last) {
      var prox = new Date(last);
      prox.setDate(prox.getDate() + 30);
      return prox <= hoje ? new Date(hoje.getTime() + 86400000) : prox;
    }
  }

  // fixed_day (default)
  var dia = ctCfg ? (ctCfg.diaVencimento || bCfg.defaultDueDay || 10) : (bCfg.defaultDueDay || 10);
  var prox = new Date(hoje.getFullYear(), hoje.getMonth(), dia);
  if (prox <= hoje) prox = new Date(hoje.getFullYear(), hoje.getMonth() + 1, dia);
  return prox;
}

// ── Anti-duplication guard ───────────────────────────────────

/**
 * Retorna true se o aluno já foi cobrado no período atual.
 * Definição de "período atual":
 *   - fixed_day:    já pagou no mês corrente
 *   - rolling_30:   lastPaymentDate < 30 dias atrás
 */
function _jaFoiCobradoNoPeriodo(men, billingCfg) {
  var status = (men.status || '').toUpperCase();
  if (status === 'PAGO') {
    var bCfg = billingCfg || getBillingConfig();
    var hoje = new Date(); hoje.setHours(0,0,0,0);
    if (bCfg.billingMode === 'rolling_30_days' && men.lastPaymentDate) {
      var last = _parseDDMMYYYY(men.lastPaymentDate);
      if (last) {
        var diff = Math.floor((hoje - last) / (1000*60*60*24));
        return diff < 30; // cobrado há menos de 30 dias → não cobra de novo
      }
    } else {
      // fixed_day: pagou no mesmo mês?
      var venc = _parseDDMMYYYY(men.vencimento);
      if (venc && venc.getMonth() >= hoje.getMonth() && venc.getFullYear() >= hoje.getFullYear()) {
        return true; // vencimento futuro = está em dia = não cobra
      }
    }
  }
  return false;
}

// ── cobrarAgoraAluno: primeira cobrança imediata ─────────────

/**
 * Cobra um aluno específico imediatamente:
 *   1. Valida plano
 *   2. Anti-duplication: não cobra se já pagou no período
 *   3. Tem cartão → tenta cobrar via assinatura MP
 *   4. Sem cartão (ou cartão falhou) → gera PIX
 *   5. Grava lastPaymentDate + nextChargeDate
 */
function cobrarAgoraAluno(email) {
  email = email.toString().trim().toLowerCase();
  var men = getMensalidadeAluno(email);
  if (!men || !men.planoId) {
    return { success: false, message: 'Aluno sem plano atribuído' };
  }

  var bCfg = getBillingConfig();
  if (_jaFoiCobradoNoPeriodo(men, bCfg)) {
    return { success: false, message: 'Aluno já foi cobrado neste período' };
  }

  var ct  = getCTDoAluno(email);
  var cfg = getGatewayConfig(ct);
  if (!cfg) return { success: false, message: 'CT sem gateway configurado' };

  var pl = getPlanoValor(men.planoId);
  if (!pl.valor) return { success: false, message: 'Plano sem valor definido' };

  var nome = getAlunoNome(email);
  var pts  = nome.split(' ');
  var prox = calcularProximaCobranca(men.lastPaymentDate || '', cfg, bCfg);

  // ── Lê cartão completo (customerId + bandeira + subscriptionId) ──────
  var cartao = null;
  try {
    var ss     = _getSpreadsheet();
    var cSheet = ss.getSheetByName('CartoesAlunos');
    if (cSheet) {
      var cRows = cSheet.getDataRange().getValues();
      for (var c = 1; c < cRows.length; c++) {
        if (cRows[c][0] && cRows[c][0].toString().trim().toLowerCase() === email) {
          cartao = {
            customerId:     cRows[c][2] ? cRows[c][2].toString().trim() : '',
            subscriptionId: cRows[c][3] ? cRows[c][3].toString().trim() : '',
            bandeira:       cRows[c][4] ? cRows[c][4].toString().trim() : '',
            ultimos4:       cRows[c][5] ? cRows[c][5].toString().trim() : ''
          };
          break;
        }
      }
    }
  } catch(eC) { Logger.log('[cobrarAgora] erro ao ler cartão: ' + eC.message); }

  // ── TEM CARTÃO CADASTRADO + GATEWAY COM TOKEN ────────────────────────
  if (cartao && cartao.customerId && cfg.accessToken && cfg.gateway === 'mercadopago') {
    try {
      // Cobrança direta com cartão salvo do cliente
      // MP exige: payer.type='customer' + payer.id=customerId + payment_method_id=bandeira
      var pmId = _mpBandeiraToPaymentMethodId(cartao.bandeira);
      var chargeResult = gw_mp_directCharge(cfg, {
        valor:       pl.valor,
        descricao:   'Mensalidade ' + ct + ' — ' + pl.nome,
        customerId:  cartao.customerId,
        pmId:        pmId,
        email:       email
      });

      if (chargeResult.status === 'approved') {
        upsertMensalidade(email, ct, men.planoId, men.gatewayId||'', 'PAGO', prox, chargeResult.id, 'Cartão');
        Logger.log('[cobrarAgora] ' + email + ': cartão aprovado id=' + chargeResult.id);
        return {
          success: true, metodo: 'Cartão',
          message: 'Cobrado via cartão (' + (cartao.bandeira||'') + ' ••••' + (cartao.ultimos4||'') + ')!',
          proximaCobranca: Utilities.formatDate(prox, 'America/Sao_Paulo', 'dd/MM/yyyy')
        };
      }

      // Cartão recusado — loga motivo e cai no PIX
      var motivo = chargeResult.statusDetail || chargeResult.status || 'recusado';
      Logger.log('[cobrarAgora] ' + email + ': cartão ' + motivo + ' → fallback PIX');
      // Marca PIX_FALLBACK para o aluno ver o aviso
      upsertMensalidade(email, ct, men.planoId, men.gatewayId||'', 'PENDENTE', prox,
        'Cartão recusado (' + motivo + ')', 'PIX_FALLBACK');

    } catch(eCard) {
      Logger.log('[cobrarAgora] ' + email + ' erro cobrança cartão: ' + eCard.message);
      // Continua para PIX
    }
  }

  // ── PIX DINÂMICO (gateway com token, sem cartão ou cartão falhou) ────
  if (cfg.accessToken && cfg.gateway !== 'pix_manual') {
    try {
      var pixResult = gw_createPix(cfg, {
        email: email, valor: pl.valor,
        descricao: 'Mensalidade ' + ct + ' — ' + pl.nome,
        nomeFirst: pts[0]||nome, nomeLast: pts.slice(1).join(' ')||'Aluno',
        cpf: '00000000000'
      });
      upsertMensalidade(email, ct, men.planoId, men.gatewayId||'', 'PENDENTE', prox, pixResult.externalId, 'PIX');
      Logger.log('[cobrarAgora] ' + email + ': PIX gerado ' + pixResult.externalId);
      return {
        success: true, metodo: 'PIX',
        message: 'PIX gerado!',
        pixCode:    pixResult.pixCode,
        qrBase64:   pixResult.qrBase64,
        valor:      pl.valor,
        proximaCobranca: Utilities.formatDate(prox, 'America/Sao_Paulo', 'dd/MM/yyyy')
      };
    } catch(ePix) {
      Logger.log('[cobrarAgora] ' + email + ' PIX erro: ' + ePix.message);
    }
  }

  // ── PIX MANUAL ───────────────────────────────────────────────────────
  upsertMensalidade(email, ct, men.planoId, men.gatewayId||'', 'PENDENTE', prox,
    'pix_manual_' + Date.now(), 'PIX');
  return {
    success: true, metodo: 'PIX_MANUAL',
    message: 'Aguardando pagamento via PIX manual',
    chavePix: cfg.chavePix || '',
    valor:    pl.valor,
    proximaCobranca: Utilities.formatDate(prox, 'America/Sao_Paulo', 'dd/MM/yyyy')
  };
}

/**
 * Cobrança direta com cartão salvo no Mercado Pago.
 * Usa payer.type='customer' + payer.id=customerId.
 * Retorna { id, status, statusDetail }
 */
function gw_mp_directCharge(cfg, p) {
  var r = mp_call(cfg, 'post', '/v1/payments', {
    transaction_amount: p.valor,
    description:        p.descricao,
    payment_method_id:  p.pmId || 'visa',
    payer: {
      type:  'customer',
      id:    p.customerId,
      email: p.email
    }
  });
  if (r.code !== 200 && r.code !== 201) {
    throw new Error('MP direct charge error ' + r.code + ': ' + JSON.stringify(r.body).substring(0, 120));
  }
  return {
    id:           r.body.id ? r.body.id.toString() : '',
    status:       (r.body.status || '').toLowerCase(),
    statusDetail: (r.body.status_detail || '').toLowerCase()
  };
}

/**
 * Mapeia bandeira do cartão para payment_method_id do Mercado Pago.
 */
function _mpBandeiraToPaymentMethodId(bandeira) {
  var map = {
    'visa':       'visa',
    'mastercard': 'master',
    'master':     'master',
    'amex':       'amex',
    'elo':        'elo',
    'hipercard':  'hipercard',
    'diners':     'diners'
  };
  var key = (bandeira || '').toLowerCase().trim();
  return map[key] || key || 'visa';
}

function handleCobrarAgoraAluno(data) {
  var adminEmail = requireAdmin(data);
  if (!adminEmail) return forbiddenResponse();
  if (!data.email) return jsonResponse(false, 'Email obrigatório');
  try {
    var result = cobrarAgoraAluno(data.email);
    return jsonResponse(result.success, result.message, result);
  } catch(e) { return errorResponse('Erro: ' + e.message); }
}

// ── Modalidades → Plano automático ──────────────────────────

/**
 * Salva mapeamento: combinação de modalidades → planoId
 * Armazenado em ConfigModulos key='modalidadesPlanoMap'
 * Formato: { "bjj_adulto": "plano_abc", "bjj_adulto,muay_thai": "plano_combo" }
 */
function handleSaveModalidadesPlanoMap(data) {
  var adminEmail = requireAdmin(data);
  if (!adminEmail) return forbiddenResponse();
  try {
    var mapa = data.mapa;
    if (typeof mapa === 'string') { try { mapa = JSON.parse(mapa); } catch(e) { return jsonResponse(false,'JSON inválido'); } }
    if (typeof mapa !== 'object') return jsonResponse(false,'mapa deve ser objeto');
    // Normaliza chaves: ordena modalidades alfabeticamente para consistência
    var normalizado = {};
    Object.keys(mapa).forEach(function(k) {
      var chave = k.split(',').map(function(m){ return m.trim().toLowerCase(); }).sort().join(',');
      normalizado[chave] = mapa[k];
    });
    var sheet = getOrCreateModulesConfigSheet();
    var rows  = sheet.getDataRange().getValues();
    var now   = new Date();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] === 'modalidadesPlanoMap') {
        sheet.getRange(i+1,2,1,2).setValues([[JSON.stringify(normalizado), now]]);
        return jsonResponse(true, 'Mapeamento salvo!');
      }
    }
    sheet.appendRow(['modalidadesPlanoMap', JSON.stringify(normalizado), now]);
    return jsonResponse(true, 'Mapeamento salvo!');
  } catch(e) { return errorResponse('Erro: ' + e.message); }
}

function handleGetModalidadesPlanoMap(data) {
  var adminEmail = requireAdmin(data);
  if (!adminEmail) return forbiddenResponse();
  return jsonResponse(true, null, { mapa: getModalidadesPlanoMap() });
}

function getModalidadesPlanoMap() {
  try {
    var sheet = getOrCreateModulesConfigSheet();
    var rows  = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] === 'modalidadesPlanoMap') {
        try { return JSON.parse(rows[i][1]); } catch(e) {}
      }
    }
  } catch(e) {}
  return {};
}

/**
 * Resolve o planoId para uma lista de modalidades.
 * Busca primeiro o combo exato, depois cada modalidade sozinha.
 * Retorna '' se não encontrar.
 */
function getPlanoParaModalidades(modalidades) {
  if (!modalidades || !modalidades.length) return '';
  var mapa = getModalidadesPlanoMap();
  if (!Object.keys(mapa).length) return '';
  // Normaliza lista
  var sorted = modalidades.map(function(m){ return m.trim().toLowerCase(); }).sort();
  // Tenta combo exato
  var chaveCombo = sorted.join(',');
  if (mapa[chaveCombo]) return mapa[chaveCombo];
  // Tenta cada modalidade sozinha (prioridade: primeira da lista)
  for (var i = 0; i < sorted.length; i++) {
    if (mapa[sorted[i]]) return mapa[sorted[i]];
  }
  return '';
}

/**
 * Atribui plano automaticamente a um aluno com base nas modalidades.
 * Chamado ao aprovar conta ou ao alterar modalidades do aluno.
 */
function autoAtribuirPlano(email) {
  try {
    var alunosSheet = getSheet('Alunos');
    var rows = alunosSheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0]||rows[i][0].toString().trim().toLowerCase()!==email) continue;
      var modalidadesStr = rows[i][31] ? rows[i][31].toString().trim() : ''; // col AF
      var modalidades    = modalidadesStr ? modalidadesStr.split(',').map(function(m){return m.trim();}).filter(Boolean) : [];
      if (!modalidades.length) return null;
      var planoId = getPlanoParaModalidades(modalidades);
      if (!planoId) return null;
      var ct  = rows[i][4] ? rows[i][4].toString().trim() : '';
      var cfg = getGatewayConfig(ct);
      if (!cfg) return null;
      var men   = getMensalidadeAluno(email) || {};
      var bCfg  = getBillingConfig();
      var prox  = calcularProximaCobranca(men.lastPaymentDate || '', cfg, bCfg);
      upsertMensalidade(email, ct, planoId, cfg.gatewayId||'', men.status||'PENDENTE', prox, men.externalId||'', men.metodo||'');
      Logger.log('[autoAtribuirPlano] ' + email + ': modalidades=' + modalidades + ' → plano=' + planoId);
      return planoId;
    }
  } catch(e) { Logger.log('autoAtribuirPlano: ' + e.message); }
  return null;
}

/**
 * Atualiza cron para usar billingConfig ao calcular próxima cobrança.
 * Substitui o calcularProximaCobranca inline do _processarCobrancaAluno.
 */
function _calcProxCobCron(men, cfg) {
  return calcularProximaCobranca(men.lastPaymentDate || '', cfg, getBillingConfig());
}


// ═══════════════════════════════════════════════════════════════
// MÓDULO: ASSINATURA RECORRENTE — Mercado Pago Preapproval v1.0
// Planilhas: PLANOS | LICENCIADOS
// ═══════════════════════════════════════════════════════════════

// PRODUÇÃO — Access Token da conta de assinatura IDESystems
var MP_ASN_TOKEN = 'APP_USR-8800693265225760-042705-7ffdcb2b7c7dd020d73e042c8960b17d-740325198';

// ─── Helpers de planilha ──────────────────────────────────────

function getPlanosSheet() {
  // PLANOS ficam SOMENTE na planilha MATRIX (IDESystems) — não na do cliente
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName('PLANOS');
  if (!sh) {
    sh = ss.insertSheet('PLANOS');
    sh.appendRow(['id_plano','nome','valor','frequencia','descricao']);
  }
  return sh;
}

function getLicenciadosSheet() {
  // LICENCIADOS ficam SOMENTE na planilha MATRIX (IDESystems) — não na do cliente
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName('LICENCIADOS');
  if (!sh) {
    sh = ss.insertSheet('LICENCIADOS');
    sh.appendRow(['email','plano','status','proximo_vencimento',
                  'subscription_id','customer_id','data_inicio_cobranca','modalidades_contrato']);
    sh.getRange(1,7).setBackground('#2a1a00').setFontColor('#f0a500').setFontWeight('bold');
    sh.getRange(1,8).setBackground('#0a2a1a').setFontColor('#4ade80').setFontWeight('bold')
      .setNote('Modalidades liberadas para este CT (IDs separados por vírgula). Ex: bjj_adulto,muay_thai\nSe vazio = acessa TODAS as modalidades ativas.');
    sh.setColumnWidth(7, 180);
    sh.setColumnWidth(8, 280);
  }
  // Garante que cols H e I existem em sheets já criadas
  var headers = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 9)).getValues()[0];
  if (headers.indexOf('modalidades_contrato') === -1) {
    sh.getRange(1, 8).setValue('modalidades_contrato')
      .setBackground('#0a2a1a').setFontColor('#4ade80').setFontWeight('bold');
    sh.setColumnWidth(8, 280);
  }
  if (headers.indexOf('sheet_id') === -1) {
    sh.getRange(1, 9).setValue('sheet_id')
      .setBackground('#0d1a2a').setFontColor('#60a5fa').setFontWeight('bold')
      .setNote('ID da planilha Google Sheets deste CT (abre.ms/sheets/{id})');
    sh.setColumnWidth(9, 320);
  }
  return sh;
}

function _getLicenciado(email) {
  var sh   = getLicenciadosSheet();
  var rows = sh.getDataRange().getValues();
  var low  = email.toString().toLowerCase().trim();
  for (var i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    if (rows[i][0].toString().toLowerCase().trim() !== low) continue;
    // Coluna G (index 6): data_inicio_cobranca — preenchida pelo admin
    // Formato aceito: dd/MM/yyyy ou yyyy-MM-dd ou Date object
    var rawData = rows[i][6];
    var dataInicioStr = '';
    if (rawData instanceof Date) {
      dataInicioStr = Utilities.formatDate(rawData, 'America/Sao_Paulo', 'dd/MM/yyyy');
    } else if (rawData) {
      dataInicioStr = rawData.toString().trim();
    }
    // Col H (index 7): modalidades_contrato — lista de IDs separados por vírgula
    // Col I (index 8): sheet_id — ID da planilha Google Sheets do CT
    var modContrato = rows[i][7] ? rows[i][7].toString().trim() : '';
    var sheetIdCT   = rows[i][8] ? rows[i][8].toString().trim() : '';
    return {
      rowIndex:             i + 1,
      email:                rows[i][0] ? rows[i][0].toString().trim() : '',
      plano:                rows[i][1] ? rows[i][1].toString().trim() : '',
      status:               rows[i][2] ? rows[i][2].toString().trim() : '',
      proximoVencimento:    rows[i][3] ? rows[i][3].toString().trim() : '',
      subscriptionId:       rows[i][4] ? rows[i][4].toString().trim() : '',
      customerId:           rows[i][5] ? rows[i][5].toString().trim() : '',
      dataInicioCobranca:   dataInicioStr,  // col G
      modalidadesContrato:  modContrato,    // col H
      sheetId:              sheetIdCT       // col I — ID da planilha do CT
    };
  }
  return null;
}

// Converte string dd/MM/yyyy ou yyyy-MM-dd para objeto Date (meio-dia BRT)
function _parseDataBR(str) {
  if (!str) return null;
  str = str.toString().trim();
  var d;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    var p = str.split('/');
    d = new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]), 12, 0, 0);
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    var q = str.split('-');
    d = new Date(parseInt(q[0]), parseInt(q[1]) - 1, parseInt(q[2]), 12, 0, 0);
  } else {
    d = new Date(str);
  }
  return isNaN(d.getTime()) ? null : d;
}

function salvarLicenciadoASN(email, plano, status, proximoVenc, subscriptionId, customerId) {
  var sh  = getLicenciadosSheet();
  var lic = _getLicenciado(email);
  // Preserva data_inicio_cobranca (col G) se já existir na planilha
  var dataInicio = (lic && lic.dataInicioCobranca) ? lic.dataInicioCobranca : '';
  var modContrato = (lic && lic.modalidadesContrato) ? lic.modalidadesContrato : '';
  var sheetIdCT   = (lic && lic.sheetId) ? lic.sheetId : '';
  var row = [
    email.toString().toLowerCase().trim(),
    plano          || '',
    status         || 'ATIVO',
    proximoVenc    || '',
    subscriptionId || '',
    customerId     || '',
    dataInicio,
    modContrato,   // col H — preserva modalidades_contrato
    sheetIdCT      // col I — preserva sheet_id
  ];
  if (lic) {
    sh.getRange(lic.rowIndex, 1, 1, 9).setValues([row]);
  } else {
    sh.appendRow(row);
  }
}

function atualizarLicenciadoASN(email, campos) {
  var sh  = getLicenciadosSheet();
  var lic = _getLicenciado(email);
  if (!lic) return;
  var row = [
    lic.email,
    campos.plano             !== undefined ? campos.plano             : lic.plano,
    campos.status            !== undefined ? campos.status            : lic.status,
    campos.proximoVencimento !== undefined ? campos.proximoVencimento : lic.proximoVencimento,
    campos.subscriptionId    !== undefined ? campos.subscriptionId    : lic.subscriptionId,
    campos.customerId        !== undefined ? campos.customerId        : lic.customerId,
    campos.dataInicioCobranca !== undefined ? campos.dataInicioCobranca : (lic.dataInicioCobranca || '')
  ];
  sh.getRange(lic.rowIndex, 1, 1, 7).setValues([row]);
}

function lerTodosPlanos() {
  var sh   = getPlanosSheet();
  var rows = sh.getDataRange().getValues();
  if (rows.length < 2) return [];
  // Detecta colunas pelos headers (robusto a planilhas com ordem diferente)
  var hdrs = rows[0].map(function(h){ return h ? h.toString().toLowerCase().trim() : ''; });
  function ci(opts) { for (var i=0;i<opts.length;i++){var x=hdrs.indexOf(opts[i]);if(x>=0)return x;} return -1; }
  var CI = ci(['id_plano','id','idplano']);             if(CI<0) CI=0;
  var CN = ci(['nome','name','plano','titulo','título']);if(CN<0) CN=1;
  var CV = ci(['valor','preco','preço','price','value']);if(CV<0) CV=2;
  var CF = ci(['frequencia','frequência','freq','period','periodo','período']); if(CF<0) CF=3;
  var CD = ci(['descricao','descrição','desc','description','detalhes']);       if(CD<0) CD=4;
  var out = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    var idV = r[CI] ? r[CI].toString().trim() : '';
    if (!idV) continue;
    var valN = parseFloat(r[CV]); if (isNaN(valN)) valN = 0;
    var freqS = r[CF] ? r[CF].toString().trim() : '';
    if (!isNaN(parseFloat(freqS)) && freqS !== '') freqS = 'mensal'; // ignora se for número
    var descS = r[CD] ? r[CD].toString().trim() : '';
    if (descS.length <= 2) descS = ''; // ignora emoji isolado
    out.push({
      id_plano:   idV,
      nome:       r[CN] ? r[CN].toString().trim() : idV,
      valor:      valN,
      frequencia: freqS || 'mensal',
      descricao:  descS
    });
  }
  return out;
}

// ─── Helpers Mercado Pago ─────────────────────────────────────

function mp_asn_call(method, path, body) {
  var url  = 'https://api.mercadopago.com' + path;
  var opts = {
    method:             method.toUpperCase(),
    headers: {
      'Authorization':    'Bearer ' + MP_ASN_TOKEN,
      'Content-Type':     'application/json',
      'X-Idempotency-Key': Utilities.getUuid()
    },
    muteHttpExceptions: true
  };
  if (body && (method === 'post' || method === 'put' || method === 'patch')) {
    opts.payload = JSON.stringify(body);
  }
  // Pequeno delay para evitar erro de quota de banda do GAS
  Utilities.sleep(300);
  var resp = UrlFetchApp.fetch(url, opts);
  var code = resp.getResponseCode();
  var text = resp.getContentText();
  var json = {};
  try { json = JSON.parse(text); } catch(e) { json = { raw: text.substring(0, 200) }; }
  Logger.log('[mp_call] ' + method.toUpperCase() + ' ' + path + ' → ' + code);
  return { code: code, body: json };
}

// ─── Fluxo MP correto ────────────────────────────────────────
// Frontend envia card_token gerado com Public Key
// Backend: customer → salvar cartão → preapproval
// Endpoint correto: /preapproval (sem /v1/)

function mp_criarOuBuscarCustomer(email, nome) {
  // Busca customer existente
  var search = mp_asn_call('get', '/v1/customers/search?email=' + encodeURIComponent(email));
  if (search.code === 200 && search.body.results && search.body.results.length > 0) {
    Logger.log('[mp_customer] found existing: ' + search.body.results[0].id);
    return search.body.results[0].id.toString();
  }
  // Cria novo
  var partes = (nome || 'Aluno').split(' ');
  var r = mp_asn_call('post', '/v1/customers', {
    email:      email,
    first_name: partes[0] || 'Aluno',
    last_name:  partes.slice(1).join(' ') || ''
  });
  if (r.code !== 200 && r.code !== 201) {
    throw new Error('Erro ao criar customer: ' + r.code + ' ' + JSON.stringify(r.body).substring(0,150));
  }
  Logger.log('[mp_customer] created: ' + r.body.id);
  return r.body.id.toString();
}

// mp_tokenizarCartao removido — tokenização feita no frontend com Public Key

function mp_salvarCartaoNoCustomer(customerId, cardToken) {
  // Associa o token ao customer → retorna card_id permanente
  var r = mp_asn_call('post', '/v1/customers/' + customerId + '/cards', {
    token: cardToken
  });
  if (r.code !== 200 && r.code !== 201) {
    throw new Error('Erro ao salvar cartão: ' + r.code + ' ' + JSON.stringify(r.body).substring(0,200));
  }
  Logger.log('[mp_card] card_id: ' + r.body.id);
  return r.body.id.toString();
}

function mp_criarPreapproval(email, cardToken, valor, nomeAluno, planoNome, dataInicioCobranca) {
  // start_date: usa data_inicio_cobranca da planilha se definida
  // Fallback: 7 dias a partir de hoje (período de teste padrão IDESystems)
  var start;
  var dataInicio = dataInicioCobranca ? _parseDataBR(dataInicioCobranca) : null;
  if (dataInicio && dataInicio.getTime() > new Date().getTime()) {
    start = dataInicio;
    Logger.log('[mp_preapproval] start_date via planilha: ' + dataInicioCobranca);
  } else {
    // 7 dias de trial padrão
    start = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
    Logger.log('[mp_preapproval] start_date padrão 7 dias trial');
  }
  var startStr = Utilities.formatDate(start, 'GMT', "yyyy-MM-dd'T'HH:mm:ss.000'Z'");

  var body = {
    payer_email:        email,
    card_token_id:      cardToken,
    back_url:           'https://www.mercadopago.com.br',
    reason:             'Assinatura ' + planoNome,
    external_reference: email,
    auto_recurring: {
      frequency:          1,
      frequency_type:     'months',
      start_date:         startStr,
      transaction_amount: parseFloat(valor),
      currency_id:        'BRL'
    },
    status: 'authorized'
  };

  Logger.log('[mp_preapproval] body: ' + JSON.stringify(body));
  var r = mp_asn_call('post', '/preapproval', body);
  Logger.log('[mp_preapproval] resp ' + r.code + ': ' + JSON.stringify(r.body).substring(0, 500));

  if (r.code !== 200 && r.code !== 201) {
    throw new Error('Erro ao criar assinatura: HTTP ' + r.code + ' — ' + JSON.stringify(r.body).substring(0, 400));
  }
  return {
    id:     r.body.id ? r.body.id.toString() : '',
    status: (r.body.status || 'authorized').toUpperCase()
  };
}

function mp_cancelarPreapproval(subscriptionId) {
  var r = mp_asn_call('patch', '/preapproval/' + subscriptionId, { status: 'cancelled' });
  // 200/201/204 = sucesso
  // 404/504 = não existe no MP (ex: criado em ambiente de teste, ou já cancelado lá)
  //           → trata como cancelado com sucesso para não bloquear o usuário
  if (r.code === 404 || r.code === 504) {
    Logger.log('[mp_cancelarPreapproval] subscription não encontrada no MP (code ' + r.code + ') — marcando como cancelada localmente: ' + subscriptionId);
    return true;
  }
  if (r.code !== 200 && r.code !== 201 && r.code !== 204) {
    throw new Error('Erro ao cancelar preapproval: ' + r.code + ' ' + JSON.stringify(r.body).substring(0,200));
  }
  return true;
}

function mp_atualizarPreapproval(subscriptionId, novoValor, novaRazao) {
  var r = mp_asn_call('patch', '/preapproval/' + subscriptionId, {
    reason: novaRazao,
    auto_recurring: { transaction_amount: parseFloat(novoValor) }
  });
  if (r.code === 404 || r.code === 504) {
    Logger.log('[mp_atualizarPreapproval] subscription não encontrada no MP (code ' + r.code + ') — atualizando apenas localmente: ' + subscriptionId);
    return true;
  }
  if (r.code !== 200 && r.code !== 201 && r.code !== 204) {
    throw new Error('Erro ao atualizar preapproval: ' + r.code + ' ' + JSON.stringify(r.body).substring(0,200));
  }
  return true;
}

// ─── Handlers ────────────────────────────────────────────────

function handleVerificarAdmin(data) {
  try {
    var email = sanitizeInput(data.email || '').toLowerCase().trim();
    if (!email) return jsonResponse(false, 'Email obrigatório');
    var sh   = getSheet('Alunos');
    var rows = sh.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0]) continue;
      if (rows[i][0].toString().toLowerCase().trim() !== email) continue;
      var v = rows[i][6];
      var isAdmin = (v === true || v === 'TRUE' || v === 1 || v === 'true');
      return jsonResponse(true, null, { isAdmin: isAdmin });
    }
    return jsonResponse(true, null, { isAdmin: false });
  } catch(e) { return errorResponse('verificarAdmin: ' + e.message); }
}

function handleGetPlanos(data) {
  try {
    return jsonResponse(true, null, { planos: lerTodosPlanos() });
  } catch(e) { return errorResponse('getPlanos: ' + e.message); }
}

function handleGetAssinatura(data) {
  try {
    var email = sanitizeInput(data.email || '').toLowerCase().trim();
    if (!email) return jsonResponse(false, 'Email obrigatório');
    var lic = _getLicenciado(email);

    // ── Calcula dias restantes de trial a partir de data_inicio_cobranca ──
    var emTrial          = false;
    var diasRestantesTrial = null;
    var dataInicioStr    = lic ? (lic.dataInicioCobranca || '') : '';

    if (!dataInicioStr) {
      // Sem data definida: trial padrão de 7 dias a partir de hoje (para exibição no perfil)
      // Não bloqueia — apenas informa. O campo só fica populado após o cliente criar conta.
    } else {
      var dataInicio = _parseDataBR(dataInicioStr);
      if (dataInicio) {
        var hoje      = new Date();
        var diffMs    = dataInicio.getTime() - hoje.getTime();
        var diffDias  = Math.ceil(diffMs / 86400000);
        if (diffDias > 0) {
          emTrial            = true;
          diasRestantesTrial = diffDias;
        }
      }
    }

    if (!lic || !lic.subscriptionId) {
      return jsonResponse(true, null, {
        assinatura:        null,
        emTrial:           emTrial,
        diasRestantesTrial: diasRestantesTrial,
        dataInicioCobranca: dataInicioStr
      });
    }

    var planos    = lerTodosPlanos();
    var planoInfo = null;
    for (var i = 0; i < planos.length; i++) {
      if (planos[i].id_plano === lic.plano) { planoInfo = planos[i]; break; }
    }

    return jsonResponse(true, null, {
      assinatura: {
        email:             lic.email,
        plano:             lic.plano,
        nomePlano:         planoInfo ? planoInfo.nome  : lic.plano,
        valor:             planoInfo ? planoInfo.valor : '',
        status:            lic.status,
        proximoVencimento: lic.proximoVencimento,
        subscriptionId:    lic.subscriptionId,
        customerId:        lic.customerId,
        dataInicioCobranca: dataInicioStr
      },
      emTrial:            emTrial,
      diasRestantesTrial: diasRestantesTrial,
      dataInicioCobranca: dataInicioStr
    });
  } catch(e) { return errorResponse('getAssinatura: ' + e.message); }
}

function handleCriarAssinatura(data) {
  try {
    var email  = sanitizeInput(data.email || '').toLowerCase().trim();
    var nome   = sanitizeInput(data.nomeAluno || 'Aluno');
    var planId = sanitizeInput(data.planoId  || '');
    if (!email || !planId) return jsonResponse(false, 'Email e planoId obrigatórios');

    var planos = lerTodosPlanos();
    var plano  = null;
    for (var i = 0; i < planos.length; i++) {
      if (planos[i].id_plano === planId) { plano = planos[i]; break; }
    }
    if (!plano) return jsonResponse(false, 'Plano não encontrado: ' + planId);

    // Dados do cartão não trafegam mais pelo servidor — apenas o card_token seguro
    // gerado pelo frontend via Mercado Pago Public Key

    // 2-step backend flow (card_token gerado no frontend com Public Key):
    // 1. preapproval com card_token_id diretamente (sem salvar cartão no customer)
    var cardToken = sanitizeInput(data.cardToken || '');
    if (!cardToken) return jsonResponse(false, 'Token do cartão ausente. Tente novamente.');

    // Lê data_inicio_cobranca da planilha LICENCIADOS (col G)
    // Admin preenche antes de o cliente assinar → sistema respeita a data
    var licExistente       = _getLicenciado(email);
    var dataInicioCobranca = licExistente ? (licExistente.dataInicioCobranca || '') : '';

    // Se não preenchida pelo admin, usa padrão de 7 dias
    if (!dataInicioCobranca) {
      var d7 = new Date();
      d7.setDate(d7.getDate() + 7);
      dataInicioCobranca = Utilities.formatDate(d7, 'America/Sao_Paulo', 'dd/MM/yyyy');
      Logger.log('[criarAssinatura] data_inicio não definida, usando +7 dias: ' + dataInicioCobranca);
    }

    var preapproval = mp_criarPreapproval(email, cardToken, plano.valor, nome, plano.nome, dataInicioCobranca);

    // Status: TRIAL enquanto start_date for futura, ATIVO se já passou
    var dataInicioParsed = _parseDataBR(dataInicioCobranca);
    var statusLocal = (dataInicioParsed && dataInicioParsed.getTime() > new Date().getTime())
                      ? 'TRIAL'
                      : (preapproval.status || 'ATIVO');

    // proximoVencimento = data_inicio_cobranca (primeira cobrança real)
    var proximoVenc = dataInicioCobranca;

    salvarLicenciadoASN(email, planId, statusLocal, proximoVenc, preapproval.id, '');

    // Auto-desbloqueia o trial no PropertiesService para o ctmId deste cliente
    try {
      var licReg = _getLicenciado(email);
      var clientSheetId = licReg ? (licReg.sheetId || '') : '';
      // Encontra o ctmId pelo sheet_id no registry
      _loadRegistry();
      var keys = Object.keys(CTM_REGISTRY);
      for (var ki = 0; ki < keys.length; ki++) {
        if (CTM_REGISTRY[keys[ki]] === clientSheetId || keys[ki] === _currentCtmId) {
          _setTrialCliente(keys[ki], 'desbloquear', 0, '');
          Logger.log('[criarAssinatura] Trial desbloqueado para ctmId: ' + keys[ki]);
          break;
        }
      }
    } catch(eUnlock) { Logger.log('[criarAssinatura] aviso unlock: ' + eUnlock.message); }

    Logger.log('[criarAssinatura] ' + email + ' → sub ' + preapproval.id + ' status=' + statusLocal + ' inicio=' + dataInicioCobranca);

    // Calcula dias restantes do trial para retornar ao frontend
    var diasRestantesTrial = null;
    if (statusLocal === 'TRIAL' && dataInicioParsed) {
      diasRestantesTrial = Math.ceil((dataInicioParsed.getTime() - new Date().getTime()) / 86400000);
    }

    return jsonResponse(true, 'Assinatura criada com sucesso!', {
      subscriptionId:     preapproval.id,
      proximoVencimento:  proximoVenc,
      emTrial:            statusLocal === 'TRIAL',
      diasRestantesTrial: diasRestantesTrial,
      dataInicioCobranca: dataInicioCobranca,
      assinatura: {
        email:              email,
        plano:              planId,
        nomePlano:          plano.nome,
        valor:              plano.valor,
        status:             statusLocal,
        proximoVencimento:  proximoVenc,
        subscriptionId:     preapproval.id,
        customerId:         '',
        dataInicioCobranca: dataInicioCobranca
      }
    });
  } catch(e) {
    Logger.log('[criarAssinatura] ERRO: ' + e.message);
    return jsonResponse(false, 'Erro ao criar assinatura: ' + e.message);
  }
}

function handleCancelarAssinatura(data) {
  try {
    var email = sanitizeInput(data.email || '').toLowerCase().trim();
    var subId = sanitizeInput(data.subscriptionId || '');
    if (!email || !subId) return jsonResponse(false, 'Email e subscriptionId obrigatórios');
    mp_cancelarPreapproval(subId);
    atualizarLicenciadoASN(email, { status: 'CANCELADO' });
    Logger.log('[cancelarAssinatura] ' + email + ' cancelou ' + subId);
    return jsonResponse(true, 'Assinatura cancelada com sucesso.');
  } catch(e) {
    Logger.log('[cancelarAssinatura] ERRO: ' + e.message);
    return jsonResponse(false, 'Erro ao cancelar: ' + e.message);
  }
}

function handleTrocarPlano(data) {
  try {
    var email       = sanitizeInput(data.email || '').toLowerCase().trim();
    var subId       = sanitizeInput(data.subscriptionId || '');
    var novoPlanoId = sanitizeInput(data.novoPlanoId   || '');
    if (!email || !subId || !novoPlanoId) {
      return jsonResponse(false, 'email, subscriptionId e novoPlanoId obrigatórios');
    }
    var planos    = lerTodosPlanos();
    var novoPlano = null;
    for (var i = 0; i < planos.length; i++) {
      if (planos[i].id_plano === novoPlanoId) { novoPlano = planos[i]; break; }
    }
    if (!novoPlano) return jsonResponse(false, 'Plano não encontrado: ' + novoPlanoId);

    var nomeAluno = email;
    try {
      var sh   = getSheet('Alunos');
      var rows = sh.getDataRange().getValues();
      for (var j = 1; j < rows.length; j++) {
        if (rows[j][0] && rows[j][0].toString().toLowerCase().trim() === email) {
          nomeAluno = rows[j][1] ? rows[j][1].toString().trim() : email;
          break;
        }
      }
    } catch(ex) {}

    mp_atualizarPreapproval(subId, novoPlano.valor,
      'Assinatura ' + novoPlano.nome + ' — ' + nomeAluno);
    atualizarLicenciadoASN(email, { plano: novoPlanoId });

    Logger.log('[trocarPlano] ' + email + ' → plano ' + novoPlanoId);
    return jsonResponse(true, 'Plano atualizado para ' + novoPlano.nome + '!');
  } catch(e) {
    Logger.log('[trocarPlano] ERRO: ' + e.message);
    return jsonResponse(false, 'Erro ao trocar plano: ' + e.message);
  }
}

// ═══════════════════════════════════════════════════════════════
// MÓDULO: NOVIDADES DO SISTEMA — Central de Assinatura
// Armazenamento: PropertiesService (NOVIDADES_JSON)
// Formato: [{titulo, texto, tipo, data}, ...]
// ═══════════════════════════════════════════════════════════════

function _getNovidades() {
  var props = PropertiesService.getScriptProperties();
  var raw   = props.getProperty('NOVIDADES_JSON') || '[]';
  try { return JSON.parse(raw); } catch(e) { return []; }
}

function _salvarNovidades(arr) {
  var props = PropertiesService.getScriptProperties();
  props.setProperty('NOVIDADES_JSON', JSON.stringify(arr));
}

// ── GET — retorna lista (mais recentes primeiro) ──────────────
function handleGetNovidades(data) {
  try {
    var items = _getNovidades();
    return jsonResponse(true, null, { novidades: items });
  } catch(e) {
    return errorResponse('getNovidades: ' + e.message);
  }
}

// ── PUBLICAR nova novidade ────────────────────────────────────
function handlePublicarNovidade(data) {
  try {
    var titulo = sanitizeInput(data.titulo || '').trim();
    var texto  = sanitizeInput(data.texto  || '').trim();
    var tipo   = sanitizeInput(data.tipo   || 'novo').trim();
    var dt     = sanitizeInput(data.data   || '').trim();

    if (!titulo) return jsonResponse(false, 'Título obrigatório');
    if (!texto)  return jsonResponse(false, 'Descrição obrigatória');

    // Data padrão: hoje
    if (!dt) {
      var hoje = new Date();
      dt = Utilities.formatDate(hoje, 'America/Sao_Paulo', 'dd/MM/yyyy');
    }

    var tiposValidos = ['novo', 'melhoria', 'fix', 'aviso'];
    if (tiposValidos.indexOf(tipo) < 0) tipo = 'novo';

    var nova = { titulo: titulo, texto: texto, tipo: tipo, data: dt };

    // Insere no início (mais recente primeiro), limite de 20
    var items = _getNovidades();
    items.unshift(nova);
    if (items.length > 20) items = items.slice(0, 20);
    _salvarNovidades(items);

    Logger.log('[publicarNovidade] "' + titulo + '" (' + tipo + ')');
    return jsonResponse(true, 'Novidade publicada!', { novidades: items });
  } catch(e) {
    return errorResponse('publicarNovidade: ' + e.message);
  }
}

// ── REMOVER novidade por índice ───────────────────────────────
function handleRemoverNovidade(data) {
  try {
    var idx = parseInt(data.index);
    if (isNaN(idx) || idx < 0) return jsonResponse(false, 'Índice inválido');

    var items = _getNovidades();
    if (idx >= items.length) return jsonResponse(false, 'Novidade não encontrada');

    var removida = items.splice(idx, 1);
    _salvarNovidades(items);

    Logger.log('[removerNovidade] idx=' + idx + ' titulo=' + (removida[0] ? removida[0].titulo : '?'));
    return jsonResponse(true, 'Removida com sucesso.', { novidades: items });
  } catch(e) {
    return errorResponse('removerNovidade: ' + e.message);
  }
}

// ════════════════════════════════════════════════════════════════
// COMBO ENDPOINT — asnCarregarTudo
// Retorna planos + assinatura + novidades em UMA SÓ chamada ao GAS
// Reduz de 3 round-trips (~15s) para 1 round-trip (~4s)
// ════════════════════════════════════════════════════════════════
function handleAsnCarregarTudo(data) {
  try {
    var email = sanitizeInput(data.email || '').toLowerCase().trim();
    if (!email) return jsonResponse(false, 'Email obrigatório');

    // ── 1. Planos ──────────────────────────────────────────────
    var planos = [];
    try { planos = lerTodosPlanos(); } catch(e) { Logger.log('[asnCarregarTudo] planos err: ' + e.message); }

    // ── 2. Assinatura do licenciado ────────────────────────────
    var assinatura   = null;
    var emTrial      = false;
    var diasTrial    = null;
    var dataInicioCob = '';
    try {
      var lic = _getLicenciado(email);
      if (lic) {
        dataInicioCob = lic.dataInicioCobranca || '';
        // Calcula trial a partir de data_inicio_cobranca
        if (dataInicioCob) {
          var dataInicioParsed = _parseDataBR(dataInicioCob);
          if (dataInicioParsed) {
            var diffDias = Math.ceil((dataInicioParsed.getTime() - new Date().getTime()) / 86400000);
            if (diffDias > 0) { emTrial = true; diasTrial = diffDias; }
          }
        }
        if (lic.subscriptionId) {
          var planoInfo = null;
          for (var i = 0; i < planos.length; i++) {
            if (planos[i].id_plano === lic.plano) { planoInfo = planos[i]; break; }
          }
          assinatura = {
            email:              lic.email,
            plano:              lic.plano,
            nomePlano:          planoInfo ? planoInfo.nome  : lic.plano,
            valor:              planoInfo ? planoInfo.valor : '',
            status:             lic.status,
            proximoVencimento:  lic.proximoVencimento,
            subscriptionId:     lic.subscriptionId,
            customerId:         lic.customerId,
            dataInicioCobranca: dataInicioCob
          };
        }
      }
    } catch(e) { Logger.log('[asnCarregarTudo] assinatura err: ' + e.message); }

    // ── 3. Novidades (PropertiesService — muito rápido) ────────
    var novidades = [];
    try { novidades = _getNovidades(); } catch(e) { Logger.log('[asnCarregarTudo] novidades err: ' + e.message); }

    return jsonResponse(true, null, {
      planos:             planos,
      assinatura:         assinatura,
      novidades:          novidades,
      emTrial:            emTrial,
      diasRestantesTrial: diasTrial,
      dataInicioCobranca: dataInicioCob
    });

  } catch(e) {
    Logger.log('[asnCarregarTudo] ERRO: ' + e.message);
    return errorResponse('asnCarregarTudo: ' + e.message);
  }
}

// ════════════════════════════════════════════════════════════════
// MÓDULO: CONTRATO DE MODALIDADES POR LICENCIADO
// SuperAdmin define quais modalidades cada CT pode usar
// Fonte única de verdade: planilha LICENCIADOS col H
// ════════════════════════════════════════════════════════════════

// GET todas as modalidades do catálogo (SuperAdmin — sem filtro)
function handleGetTodasModalidades(data) {
  var authEmail = requireSuperAdmin(data);
  if (!authEmail) return forbiddenResponse();
  try {
    var sheet = ensureModalidadesSheet();
    var rows  = sheet.getDataRange().getValues();
    var mods  = [];
    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0]) continue;
      var ativo = rows[i][7] === true || rows[i][7] === 'TRUE' || rows[i][7] === 'true';
      mods.push({
        id:       rows[i][0].toString().trim(),
        nome:     rows[i][1] ? rows[i][1].toString().trim() : '',
        icon:     rows[i][2] ? rows[i][2].toString().trim() : '🥋',
        cor:      rows[i][3] ? rows[i][3].toString().trim() : '#C9A23A',
        gradTipo: rows[i][6] ? rows[i][6].toString().trim() : 'nenhum',
        ativo:    ativo
      });
    }
    return jsonResponse(true, null, { modalidades: mods });
  } catch(e) { return errorResponse('getTodasModalidades: ' + e.message); }
}

// GET contrato de um licenciado específico (SuperAdmin)
function handleGetModalidadesContrato(data) {
  var authEmail = requireSuperAdmin(data);
  if (!authEmail) return forbiddenResponse();
  try {
    var targetEmail = sanitizeInput(data.targetEmail || '').toLowerCase().trim();
    if (!targetEmail) return jsonResponse(false, 'targetEmail obrigatório');
    var lic = _getLicenciado(targetEmail);
    if (!lic) return jsonResponse(true, null, { targetEmail: targetEmail, modalidadesContrato: '', lista: [] });
    var lista = lic.modalidadesContrato
      ? lic.modalidadesContrato.split(',').map(function(m){ return m.trim(); }).filter(Boolean)
      : [];
    return jsonResponse(true, null, {
      targetEmail:         targetEmail,
      modalidadesContrato: lic.modalidadesContrato || '',
      lista:               lista
    });
  } catch(e) { return errorResponse('getModalidadesContrato: ' + e.message); }
}

// SET contrato de modalidades para um licenciado (SuperAdmin)

// ════════════════════════════════════════════════════════════════
// LIMITES POR PLANO — lê da planilha PLANOS
// A descrição do plano define os limites:
//   max_alunos:     número máximo de alunos
//   max_modalidades: número máximo de modalidades no contrato
//   max_filiais:    número máximo de filiais/CTs
//   cobranca:       true se o plano inclui sistema de cobrança
//
// Mapa padrão (fallback se planilha não tiver esses dados):
//   basico:       { alunos:50,  modalidades:1, filiais:1, cobranca:false }
//   profissional: { alunos:100, modalidades:3, filiais:1, cobranca:true  }
//   premium:      { alunos:300, modalidades:5, filiais:3, cobranca:true  }
// ════════════════════════════════════════════════════════════════

var _limitesPlanoCacheObj = null;

function _getLimitesPlano(planoId) {
  // Mapa padrão baseado nos IDs conhecidos
  var DEFAULT = {
    'basico':       { alunos: 50,  modalidades: 1, filiais: 1, cobranca: false },
    'profissional': { alunos: 100, modalidades: 3, filiais: 1, cobranca: true  },
    'premium':      { alunos: 300, modalidades: 5, filiais: 3, cobranca: true  }
  };

  if (!planoId) return DEFAULT['profissional']; // fallback seguro

  var id = planoId.toString().trim().toLowerCase();

  // Retorna default se conhece o ID
  if (DEFAULT[id]) return DEFAULT[id];

  // Tenta ler da planilha PLANOS coluna de limites (se existir col F+)
  // Campos opcionais: max_alunos, max_modalidades, max_filiais, cobranca
  try {
    if (!_limitesPlanoCacheObj) {
      _limitesPlanoCacheObj = {};
      var sh   = getPlanosSheet();
      var rows = sh.getDataRange().getValues();
      var hdrs = rows[0].map(function(h){ return h ? h.toString().toLowerCase().trim() : ''; });
      var cId   = hdrs.indexOf('id_plano');      if(cId  <0) cId  = 0;
      var cAlun = hdrs.indexOf('max_alunos');
      var cMod  = hdrs.indexOf('max_modalidades');
      var cFil  = hdrs.indexOf('max_filiais');
      var cCob  = hdrs.indexOf('cobranca');
      for (var i = 1; i < rows.length; i++) {
        if (!rows[i][cId]) continue;
        var pid = rows[i][cId].toString().trim().toLowerCase();
        _limitesPlanoCacheObj[pid] = {
          alunos:      cAlun >= 0 && rows[i][cAlun] ? (parseInt(rows[i][cAlun]) || 9999) : 9999,
          modalidades: cMod  >= 0 && rows[i][cMod]  ? (parseInt(rows[i][cMod])  || 99)   : 99,
          filiais:     cFil  >= 0 && rows[i][cFil]  ? (parseInt(rows[i][cFil])  || 1)    : 1,
          cobranca:    cCob  >= 0 ? (rows[i][cCob] === true || rows[i][cCob] === 'TRUE' || rows[i][cCob] === 'true') : true
        };
      }
    }
    if (_limitesPlanoCacheObj[id]) return _limitesPlanoCacheObj[id];
  } catch(e) { Logger.log('[_getLimitesPlano] erro: ' + e.message); }

  // Último fallback: sem limite
  return { alunos: 9999, modalidades: 99, filiais: 99, cobranca: true };
}
function handleSetModalidadesContrato(data) {
  var authEmail = requireSuperAdmin(data);
  if (!authEmail) return forbiddenResponse();
  try {
    var targetEmail = sanitizeInput(data.targetEmail || '').toLowerCase().trim();
    var modIds      = data.modalidades; // array de IDs ou string separada por vírgula
    if (!targetEmail) return jsonResponse(false, 'targetEmail obrigatório');

    // Normaliza para string limpa separada por vírgula
    var modStr = '';
    if (Array.isArray(modIds)) {
      modStr = modIds.map(function(m){ return m.toString().trim().toLowerCase(); })
                     .filter(Boolean).join(',');
    } else if (modIds) {
      modStr = modIds.toString().split(',')
                .map(function(m){ return m.trim().toLowerCase(); })
                .filter(Boolean).join(',');
    }

    // Valida IDs contra o catálogo
    var sheet  = ensureModalidadesSheet();
    var rows   = sheet.getDataRange().getValues();
    var idsValidos = [];
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0]) idsValidos.push(rows[i][0].toString().trim().toLowerCase());
    }
    var modArr  = modStr ? modStr.split(',') : [];
    var invalidos = modArr.filter(function(m){ return idsValidos.indexOf(m) === -1; });
    if (invalidos.length > 0) {
      return jsonResponse(false, 'IDs inválidos (não existem na planilha Modalidades): ' + invalidos.join(', '));
    }

    // ── Valida limite de modalidades pelo plano do licenciado ──────
    var licParaLimite = _getLicenciado(targetEmail);
    var planoId       = licParaLimite ? (licParaLimite.plano || '') : '';
    var limites       = _getLimitesPlano(planoId);
    var maxMods       = limites.modalidades;
    // modArr vazio = acesso a todas (sem restrição = conta como 0 para fins de limite)
    if (modArr.length > 0 && maxMods < 99 && modArr.length > maxMods) {
      var nomePlano = planoId || 'atual';
      return jsonResponse(false,
        'Limite do plano ' + nomePlano + ': máximo ' + maxMods + ' modalidade(s). ' +
        'Selecionadas: ' + modArr.length + '. ' +
        'Faça upgrade para liberar mais modalidades.',
        { limite: maxMods, selecionadas: modArr.length, plano: planoId }
      );
    }

    // Aceita também sheet_id, plano, status e vencimento do formulário
    var newSheetId  = data.sheetId   ? sanitizeInput(data.sheetId).trim()  : null;
    var newPlano    = data.plano     ? sanitizeInput(data.plano).trim()    : null;
    var newStatus   = data.status    ? sanitizeInput(data.status).trim()   : null;
    var newVencimento = data.vencimento ? sanitizeInput(data.vencimento).trim() : null;

    // Garante que o licenciado existe; cria linha se necessário
    var lic = _getLicenciado(targetEmail);
    var sh  = getLicenciadosSheet();
    if (lic) {
      sh.getRange(lic.rowIndex, 8).setValue(modStr);  // col H: modalidades_contrato
      if (newSheetId  !== null) sh.getRange(lic.rowIndex, 9).setValue(newSheetId);   // col I
      if (newPlano    !== null) sh.getRange(lic.rowIndex, 2).setValue(newPlano);     // col B
      if (newStatus   !== null) sh.getRange(lic.rowIndex, 3).setValue(newStatus);    // col C
      if (newVencimento !== null) sh.getRange(lic.rowIndex, 4).setValue(newVencimento); // col D
    } else {
      sh.appendRow([
        targetEmail,
        newPlano     || '',
        newStatus    || 'TRIAL',
        newVencimento|| '',
        '', '', '',
        modStr,
        newSheetId   || ''
      ]);
    }

    Logger.log('[setModalidadesContrato] ' + targetEmail + ' → mods:' + (modStr || '(todas)') + ' sheetId:' + (newSheetId || '—'));
    return jsonResponse(true, 'Contrato atualizado!', {
      targetEmail:         targetEmail,
      modalidadesContrato: modStr,
      lista:               modStr ? modStr.split(',') : [],
      sheetId:             newSheetId
    });
  } catch(e) { return errorResponse('setModalidadesContrato: ' + e.message); }
}

// ════════════════════════════════════════════════════════════════
// getModalidadesCT — endpoint PÚBLICO (sem token)
// Usado no formulário de cadastro: retorna modalidades do contrato
// de um CT específico pelo nome, sem exigir login
// Fluxo: CT name → Alunos sheet (admin do CT) → LICENCIADOS (contrato) → Modalidades
// ════════════════════════════════════════════════════════════════
function handleGetModalidadesCT(data) {
  try {
    var ctName = sanitizeInput(data.ct || data.ctName || '').trim();
    if (!ctName) return jsonResponse(false, 'Nome do CT obrigatório');

    // 1. Encontra o email do admin deste CT na sheet Alunos
    var alunosSheet = getSheet('Alunos');
    var alunosRows  = alunosSheet.getDataRange().getValues();
    var adminEmail  = '';
    var ctLow       = ctName.toLowerCase();

    for (var i = 1; i < alunosRows.length; i++) {
      var rowCT    = alunosRows[i][4] ? alunosRows[i][4].toString().trim().toLowerCase() : ''; // col E = CT
      var rowAdmin = alunosRows[i][6] === true || alunosRows[i][6] === 'TRUE'; // col G = Admin
      if (rowAdmin && rowCT === ctLow) {
        adminEmail = alunosRows[i][0] ? alunosRows[i][0].toString().trim().toLowerCase() : '';
        break;
      }
    }

    // 2. Busca modalidades_contrato do admin na planilha LICENCIADOS
    var contratadas = null; // null = todas as ativas
    if (adminEmail) {
      var lic = _getLicenciado(adminEmail);
      if (lic && lic.modalidadesContrato) {
        contratadas = lic.modalidadesContrato
          .split(',')
          .map(function(m){ return m.trim().toLowerCase(); })
          .filter(Boolean);
      }
    }

    // 3. Lê catálogo de modalidades ativas e filtra pelo contrato
    var sheet = ensureModalidadesSheet();
    var rows  = sheet.getDataRange().getValues();
    var mods  = [];
    for (var j = 1; j < rows.length; j++) {
      if (!rows[j][0]) continue;
      var id    = rows[j][0].toString().trim().toLowerCase();
      var ativo = rows[j][7] === true || rows[j][7] === 'TRUE' || rows[j][7] === 'true';
      if (!ativo) continue;
      // Filtra pelo contrato se definido
      if (contratadas && contratadas.length > 0 && contratadas.indexOf(id) === -1) continue;
      mods.push({
        id:     id,
        nome:   rows[j][1] ? rows[j][1].toString().trim() : '',
        icon:   rows[j][2] ? rows[j][2].toString().trim() : '🥋',
        cor:    rows[j][3] ? rows[j][3].toString().trim() : '#C9A23A',
        corRGB: rows[j][4] ? rows[j][4].toString().trim() : '201,162,58'
      });
    }

    Logger.log('[getModalidadesCT] ct="' + ctName + '" admin=' + (adminEmail||'?') + ' mods=' + mods.length + (contratadas ? ' (contrato: ' + contratadas.join(',') + ')' : ' (todas)'));
    return jsonResponse(true, null, { modalidades: mods, ct: ctName });

  } catch(e) {
    Logger.log('[getModalidadesCT] ERRO: ' + e.message);
    return errorResponse('getModalidadesCT: ' + e.message);
  }
}

// ════════════════════════════════════════════════════════════════
// handleListarContratos — lista todos os licenciados com contrato ativo
// Retorna: email, plano, status, modalidades_contrato, nomeCT
// ════════════════════════════════════════════════════════════════
function handleListarContratos(data) {
  var authEmail = requireSuperAdmin(data);
  if (!authEmail) return forbiddenResponse();
  try {
    // ── Catálogo de modalidades ──────────────────────────────────────
    var modSheet = ensureModalidadesSheet();
    var modRows  = modSheet.getDataRange().getValues();
    var modMap   = {};
    for (var m = 1; m < modRows.length; m++) {
      if (!modRows[m][0]) continue;
      var mid = modRows[m][0].toString().trim().toLowerCase();
      modMap[mid] = {
        id:       mid,
        nome:     modRows[m][1] ? modRows[m][1].toString().trim() : mid,
        icon:     modRows[m][2] ? modRows[m][2].toString().trim() : '🥋',
        cor:      modRows[m][3] ? modRows[m][3].toString().trim() : '#C9A23A',
        corRGB:   modRows[m][4] ? modRows[m][4].toString().trim() : '201,162,58',
        gradTipo: modRows[m][6] ? modRows[m][6].toString().trim() : 'nenhum',
        ativo:    modRows[m][7] === true || modRows[m][7] === 'TRUE'
      };
    }

    // ── Monta índice LICENCIADOS por email ───────────────────────────
    var licSheet = getLicenciadosSheet();
    var licRows  = licSheet.getDataRange().getValues();
    var licMap   = {};
    for (var l = 1; l < licRows.length; l++) {
      if (!licRows[l][0]) continue;
      var le = licRows[l][0].toString().trim().toLowerCase();
      var rawDt = licRows[l][6];
      var dtStr = '';
      if (rawDt instanceof Date) dtStr = Utilities.formatDate(rawDt, 'America/Sao_Paulo', 'dd/MM/yyyy');
      else if (rawDt) dtStr = rawDt.toString().trim();
      licMap[le] = {
        plano:               licRows[l][1] ? licRows[l][1].toString().trim() : '',
        status:              licRows[l][2] ? licRows[l][2].toString().trim() : '',
        proximoVencimento:   licRows[l][3] ? licRows[l][3].toString().trim() : '',
        subscriptionId:      licRows[l][4] ? licRows[l][4].toString().trim() : '',
        dataInicioCobranca:  dtStr,
        modalidadesContrato: licRows[l][7] ? licRows[l][7].toString().trim() : '',
        sheetId:             licRows[l][8] ? licRows[l][8].toString().trim() : '',
        rowIndex:            l + 1
      };
    }

    // ── Fonte principal: TODOS os admins da sheet Alunos ────────────
    // Colunas Alunos: [0]=email [1]=nome [2]=CT [6]=Admin(TRUE/FALSE)
    var alunosSheet = getSheet('Alunos');
    var alunosRows  = alunosSheet.getDataRange().getValues();
    var contratos   = [];
    var emailsVisto = {};

    for (var a = 1; a < alunosRows.length; a++) {
      if (!alunosRows[a][0]) continue;
      var isAdm = alunosRows[a][6] === true || alunosRows[a][6] === 'TRUE'; // col G = Admin
      if (!isAdm) continue;

      var email  = alunosRows[a][0].toString().trim().toLowerCase();
      var nome   = alunosRows[a][1] ? alunosRows[a][1].toString().trim() : '';
      var ctNome = alunosRows[a][4] ? alunosRows[a][4].toString().trim() : ''; // col E = CT
      if (emailsVisto[email]) continue;
      emailsVisto[email] = true;

      var lic    = licMap[email] || {};
      var modStr = lic.modalidadesContrato || '';
      var lista  = modStr
        ? modStr.split(',').map(function(x){ return x.trim().toLowerCase(); }).filter(Boolean)
        : [];

      var modsDetalhes = lista.map(function(id) {
        return modMap[id] || { id:id, nome:id, icon:'🥋', cor:'#C9A23A', corRGB:'201,162,58', gradTipo:'nenhum', ativo:false };
      });

      var limCT = _getLimitesPlano(lic.plano || '');
      contratos.push({
        email:               email,
        nome:                nome,
        ctNome:              ctNome,
        plano:               lic.plano             || '',
        status:              lic.status            || 'SEM CONTRATO',
        proximoVencimento:   lic.proximoVencimento || '',
        subscriptionId:      lic.subscriptionId    || '',
        dataInicioCobranca:  lic.dataInicioCobranca|| '',
        modalidadesContrato: modStr,
        lista:               lista,
        modalidades:         modsDetalhes,
        totalModalidades:    lista.length,
        sheetId:             lic.sheetId           || '',
        emLicenciados:       !!licMap[email],
        limites:             limCT   // { alunos, modalidades, filiais, cobranca }
      });
    }

    // Ordena: ATIVO → TRIAL → PENDENTE → INATIVO → CANCELADO, depois por CT
    var ord = { ATIVO:0, TRIAL:1, PENDENTE:2, INATIVO:3, CANCELADO:4 };
    contratos.sort(function(a, b) {
      var oa = ord[a.status] !== undefined ? ord[a.status] : 5;
      var ob = ord[b.status] !== undefined ? ord[b.status] : 5;
      if (oa !== ob) return oa - ob;
      return (a.ctNome || a.email).localeCompare(b.ctNome || b.email);
    });

    Logger.log('[listarContratos] admins=' + contratos.length + ' licenciados=' + Object.keys(licMap).length);

    return jsonResponse(true, null, {
      contratos:     contratos,
      totalAtivos:   contratos.filter(function(c){ return c.status === 'ATIVO'; }).length,
      modCatalogo:   Object.values(modMap),
      systemSheetId: SHEET_ID
    });
  } catch(e) {
    Logger.log('[listarContratos] ERRO: ' + e.message);
    return errorResponse('listarContratos: ' + e.message);
  }
}


// ════════════════════════════════════════════════════════════════
// UTILITÁRIO — Execute no editor GAS: Executar → criarFaixasTodosClientes
// Cria a aba "Faixas" em TODAS as planilhas de clientes cadastrados
// ════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════
// UTILITÁRIO — Execute uma vez: moverSuperAdminParaAba()
// Move idesystemstecnologia@gmail.com de Alunos → SuperAdmins
// em TODAS as planilhas de clientes
// ══════════════════════════════════════════════════════════════════
function moverSuperAdminParaAba() {
  var SUPER_EMAIL = 'idesystemstecnologia@gmail.com';
  var resultados  = [];
  var saSheet     = getOrCreateSuperAdminsSheet();

  // Verifica se já existe na aba SuperAdmins
  var saRows = saSheet.getDataRange().getValues();
  var jaExiste = saRows.some(function(r) {
    return r[0] && r[0].toString().trim().toLowerCase() === SUPER_EMAIL;
  });

  if (!jaExiste) {
    // Adiciona na aba SuperAdmins usando a senha da planilha matrix
    _currentSheetId = SHEET_ID;
    try {
      var matrixAlunos = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Alunos');
      var mRows = matrixAlunos ? matrixAlunos.getDataRange().getValues() : [];
      var senhaHash = '';
      var nomeAdmin = 'IDE Systems';
      for (var m = 1; m < mRows.length; m++) {
        if (mRows[m][0] && mRows[m][0].toString().trim().toLowerCase() === SUPER_EMAIL) {
          senhaHash = mRows[m][5] ? mRows[m][5].toString() : '';
          nomeAdmin = mRows[m][1] ? mRows[m][1].toString() : 'IDE Systems';
          break;
        }
      }
      saSheet.appendRow([SUPER_EMAIL, nomeAdmin, senhaHash, true, new Date()]);
      resultados.push('✅ SuperAdmins: conta criada (' + nomeAdmin + ')');
    } catch(e) {
      resultados.push('❌ Erro ao criar em SuperAdmins: ' + e.message);
    }
  } else {
    resultados.push('ℹ️ SuperAdmins: já existe');
  }

  // Remove de TODAS as planilhas de clientes
  var todasPlanilhas = Object.keys(CTM_REGISTRY);
  for (var c = 0; c < todasPlanilhas.length; c++) {
    var ctmId   = todasPlanilhas[c];
    var sheetId = CTM_REGISTRY[ctmId];
    _currentSheetId = sheetId;
    try {
      var ss     = SpreadsheetApp.openById(sheetId);
      var alunos = ss.getSheetByName('Alunos');
      if (!alunos) { resultados.push('⚠️ ' + ctmId + ': sem aba Alunos'); continue; }
      var aRows = alunos.getDataRange().getValues();
      var found = false;
      for (var i = aRows.length - 1; i >= 1; i--) {
        if (aRows[i][0] && aRows[i][0].toString().trim().toLowerCase() === SUPER_EMAIL) {
          alunos.deleteRow(i + 1);
          found = true;
        }
      }
      resultados.push(found ? '✅ ' + ctmId + ': removido de Alunos' : '⚪ ' + ctmId + ': não estava em Alunos');
    } catch(e) {
      resultados.push('❌ ' + ctmId + ': ' + e.message);
    }
  }

  _currentSheetId = SHEET_ID;
  Logger.log('RESULTADO moverSuperAdminParaAba:\n' + resultados.join('\n'));
  return resultados.join('\n');
}

/**
 * UTILITÁRIO — Execute UMA VEZ no editor GAS para autorizar DriveApp
 * Sem isso, criar clientes via painel vai falhar silenciosamente.
 * Passos: selecione testarPermissoes → Executar → Autorizar
 */
/**
 * UTILITÁRIO — Lista todas as chaves de trial no PropertiesService
 * Use para diagnóstico quando um cliente está bloqueado sem motivo
 */
function listarTrialProps() {
  var props = PropertiesService.getScriptProperties().getProperties();
  var keys = Object.keys(props).filter(function(k){ return k.startsWith('TRIAL_'); });
  if (!keys.length) { Logger.log('Nenhuma prop TRIAL_ encontrada'); return; }
  keys.sort();
  for (var i = 0; i < keys.length; i++) {
    Logger.log(keys[i] + ' = ' + props[keys[i]]);
  }
}

/**
 * UTILITÁRIO — Libera um cliente específico (remove bloqueio e trial)
 * Preencha o CTMID antes de executar
 */
function liberarCliente() {
  var CTMID = 'levisbrazilianjiujitsu'; // ← troque pelo ctmId bloqueado
  var prefix = 'TRIAL_' + CTMID.toUpperCase() + '_';
  var props = PropertiesService.getScriptProperties();
  props.deleteProperty(prefix + 'BLOQUEADO');
  props.deleteProperty(prefix + 'DATA_EXP');
  props.deleteProperty(prefix + 'MOTIVO');
  props.deleteProperty(prefix + 'CRIADO_EM');
  // Também limpa possível DEFAULT
  props.deleteProperty('TRIAL_DEFAULT_BLOQUEADO');
  props.deleteProperty('TRIAL_DEFAULT_DATA_EXP');
  Logger.log('✅ Cliente liberado: ' + CTMID);
  listarTrialProps();
}

function testarPermissoes() {
  try {
    var file = DriveApp.getFileById(SHEET_ID);
    Logger.log('✅ DriveApp OK — planilha: ' + file.getName());
  } catch(e) {
    Logger.log('❌ DriveApp erro: ' + e.message);
  }
  try {
    SpreadsheetApp.openById(SHEET_ID);
    Logger.log('✅ SpreadsheetApp OK');
  } catch(e) {
    Logger.log('❌ SpreadsheetApp erro: ' + e.message);
  }
  Logger.log('✅ Permissões verificadas — pode criar clientes pelo painel agora');
}

function criarFaixasTodosClientes() {
  _loadRegistry();
  var resultados = [];
  var todasPlanilhas = { 'matrix': SHEET_ID };
  Object.keys(CTM_REGISTRY).forEach(function(ctmId) {
    todasPlanilhas[ctmId] = CTM_REGISTRY[ctmId];
  });
  var ids = Object.keys(todasPlanilhas);
  for (var i = 0; i < ids.length; i++) {
    var ctmId   = ids[i];
    var sheetId = todasPlanilhas[ctmId];
    _currentSheetId = sheetId;
    _currentCtmId   = ctmId;
    try {
      var sh = ensureFaixasSheet();
      var n  = sh.getLastRow() - 1;
      resultados.push('✅ ' + ctmId + ': ' + n + ' faixas criadas');
      Logger.log('✅ ' + ctmId + ' → ' + n + ' faixas');
    } catch(e) {
      resultados.push('❌ ' + ctmId + ': ' + e.message);
      Logger.log('❌ ' + ctmId + ': ' + e.message);
    }
  }
  _currentSheetId = SHEET_ID;
  _currentCtmId   = '';
  Logger.log('RESULTADO:\n' + resultados.join('\n'));
  return resultados.join('\n');
}

// ════════════════════════════════════════════════════════════════
// MÓDULO: FAIXAS / GRADUAÇÃO POR MODALIDADE
// Aba: "Faixas" na planilha
// Colunas: modalidade_id | ordem | faixa_id | label | emoji |
//          cor | corRGB | min_meses | max_grau | next_faixa | ativo
// ════════════════════════════════════════════════════════════════

function ensureFaixasSheet() {
  var ss = _getSpreadsheet();
  var sh = ss.getSheetByName('Faixas');
  if (!sh) {
    sh = ss.insertSheet('Faixas');
    // idade_min / idade_max: 0 = sem restrição | ex: kids = idade_max 15, adulto = idade_min 16
    var header = ['modalidade_id','ordem','faixa_id','label','emoji','cor','corRGB','min_meses','max_grau','next_faixa','ativo','idade_min','idade_max'];
    sh.getRange(1, 1, 1, header.length).setValues([header])
      .setFontWeight('bold').setBackground('#1a1a2e').setFontColor('#d4a829');
    sh.setFrozenRows(1);

    // cols: modId | ordem | faixa_id | label | emoji | cor | corRGB | min_meses | max_grau | next | ativo | idade_min | idade_max
    // idade_min=16 → só adulto | idade_max=15 → só kids | 0 = qualquer idade
    var defaults = [
      // ── BJJ — adulto (16+) ─────────────────────────────────────────────
      ['bjj_adulto',1,'Branca',         'Branca',               '⚪','#e8e8e8','232,232,232',0,  4,'Azul',           true,16,0],
      ['bjj_adulto',2,'Azul',           'Azul',                 '🔵','#1565C0','21,101,192', 24, 4,'Roxa',           true,16,0],
      ['bjj_adulto',3,'Roxa',           'Roxa',                 '🟣','#6A1B9A','106,27,154', 18, 4,'Marrom',         true,16,0],
      ['bjj_adulto',4,'Marrom',         'Marrom',               '🟤','#5D4037','93,64,55',   12, 4,'Preta',          true,16,0],
      ['bjj_adulto',5,'Preta',          'Preta',                '⚫','#1a1a1a','26,26,26',   36, 6,'Vermelha-Preta', true,16,0],
      ['bjj_adulto',6,'Vermelha-Preta', 'Vermelha/Preta (7°)', '🔴','#8b0000','139,0,0',    84, 0,'Vermelha-Branca',true,16,0],
      ['bjj_adulto',7,'Vermelha-Branca','Vermelha/Branca (8°)','🔴','#c0392b','192,57,43',  120,0,'Vermelha',       true,16,0],
      ['bjj_adulto',8,'Vermelha',       'Vermelha (9°)',        '🟥','#e53935','229,57,53',  0,  0,'',              true,16,0],
      // ── BJJ — kids (até 15 anos) ────────────────────────────────────────
      ['bjj_adulto',10,'Branca_kids',   'Branca (Kids)',        '⚪','#e8e8e8','232,232,232',0,4,'Cinza-Branca',  true,0,15],
      ['bjj_adulto',11,'Cinza-Branca',  'Cinza/Branca',        '⛹️','#bdbdbd','189,189,189',0,4,'Cinza',         true,0,15],
      ['bjj_adulto',12,'Cinza',         'Cinza',               '🦥','#9e9e9e','158,158,158',0,0,'Cinza-Preta',   true,0,15],
      ['bjj_adulto',13,'Cinza-Preta',   'Cinza/Preta',         '🖤','#757575','117,117,117',0,0,'Amarela-Branca',true,0,15],
      ['bjj_adulto',14,'Amarela-Branca','Amarela/Branca',      '🟡','#fff176','255,241,118',0,4,'Amarela',       true,0,15],
      ['bjj_adulto',15,'Amarela',       'Amarela',             '🟡','#fdd835','253,216,53', 0,0,'Amarela-Preta', true,0,15],
      ['bjj_adulto',16,'Amarela-Preta', 'Amarela/Preta',       '🥯','#f9a825','249,168,37', 0,0,'Laranja-Branca',true,0,15],
      ['bjj_adulto',17,'Laranja-Branca','Laranja/Branca',      '🟠','#ffb74d','255,183,77', 0,4,'Laranja',       true,0,15],
      ['bjj_adulto',18,'Laranja',       'Laranja',             '🟠','#fb8c00','251,140,0',  0,0,'Laranja-Preta', true,0,15],
      ['bjj_adulto',19,'Laranja-Preta', 'Laranja/Preta',       '🥯','#e65100','230,81,0',   0,0,'Verde-Branca',  true,0,15],
      ['bjj_adulto',20,'Verde-Branca',  'Verde/Branca',        '🟢','#81c784','129,199,132',0,4,'Verde',         true,0,15],
      ['bjj_adulto',21,'Verde',         'Verde',               '🟢','#43a047','67,160,71',  0,0,'Verde-Preta',   true,0,15],
      ['bjj_adulto',22,'Verde-Preta',   'Verde/Preta',         '🥯','#2e7d32','46,125,50',  0,0,'Azul',          true,0,15],
      // ── Judô ─────────────────────────────────────────────────────────────
      ['judo',1,'Branca', 'Branca (6° Kyu)', '⚪','#e8e8e8','232,232,232',0,0,'Amarela',true,0,0],
      ['judo',2,'Amarela','Amarela (5° Kyu)','🟡','#fdd835','253,216,53', 0,0,'Laranja', true,0,0],
      ['judo',3,'Laranja','Laranja (4° Kyu)','🟠','#fb8c00','251,140,0',  0,0,'Verde',   true,0,0],
      ['judo',4,'Verde',  'Verde (3° Kyu)',  '🟢','#2e7d32','46,125,50',  0,0,'Azul',    true,0,0],
      ['judo',5,'Azul',   'Azul (2° Kyu)',   '🔵','#1565c0','21,101,192', 0,0,'Marrom',  true,0,0],
      ['judo',6,'Marrom', 'Marrom (1° Kyu)', '🟤','#5d4037','93,64,55',   0,0,'Preta',   true,0,0],
      ['judo',7,'Preta',  'Preta (1°–5° Dan)','⚫','#1a1a1a','26,26,26',  0,5,'',        true,0,0],
      // ── Karatê ───────────────────────────────────────────────────────────
      ['karate',1,'Branca', 'Branca (10° Kyu)','⚪','#e8e8e8','232,232,232',0,0,'Amarela',true,0,0],
      ['karate',2,'Amarela','Amarela (9° Kyu)','🟡','#fdd835','253,216,53', 0,0,'Laranja', true,0,0],
      ['karate',3,'Laranja','Laranja (8° Kyu)','🟠','#fb8c00','251,140,0',  0,0,'Verde',   true,0,0],
      ['karate',4,'Verde',  'Verde (7° Kyu)',  '🟢','#2e7d32','46,125,50',  0,0,'Azul',    true,0,0],
      ['karate',5,'Azul',   'Azul (6° Kyu)',   '🔵','#1565c0','21,101,192', 0,0,'Roxa',    true,0,0],
      ['karate',6,'Roxa',   'Roxa (5° Kyu)',   '🟣','#6a1b9a','106,27,154', 0,0,'Marrom',  true,0,0],
      ['karate',7,'Marrom', 'Marrom (4° Kyu)', '🟤','#5d4037','93,64,55',   0,0,'Preta',   true,0,0],
      ['karate',8,'Preta',  'Preta (1°–9° Dan)','⚫','#1a1a1a','26,26,26',  0,9,'',        true,0,0],
      // ── Muay Thai — Prajied Simples (11 graus) ───────────────────────────
      ['muay_thai',1, '1', 'Branco (Grau 1)',   '🤍','#f5f5f5','245,245,245',0,0,'2',  true,0,0],
      ['muay_thai',2, '2', 'Amarelo (Grau 2)',  '🟡','#fdd835','253,216,53', 0,0,'3',  true,0,0],
      ['muay_thai',3, '3', 'Laranja (Grau 3)',  '🟠','#fb8c00','251,140,0',  0,0,'4',  true,0,0],
      ['muay_thai',4, '4', 'Verde (Grau 4)',    '🟢','#43a047','67,160,71',  0,0,'5',  true,0,0],
      ['muay_thai',5, '5', 'Azul (Grau 5)',     '🔵','#1565c0','21,101,192', 0,0,'6',  true,0,0],
      ['muay_thai',6, '6', 'Azul (Grau 6)',     '🔵','#1d4ed8','29,78,216',  0,0,'7',  true,0,0],
      ['muay_thai',7, '7', 'Vermelho (Grau 7)', '🔴','#dc2626','220,38,38',  0,0,'8',  true,0,0],
      ['muay_thai',8, '8', 'Vermelho (Grau 8)', '🔴','#b91c1c','185,28,28',  0,0,'9',  true,0,0],
      ['muay_thai',9, '9', 'Preto (Grau 9)',    '⚫','#1a1a1a','26,26,26',   0,0,'10', true,0,0],
      ['muay_thai',10,'10','Preto (Grau 10)',   '⚫','#111111','17,17,17',   0,0,'11', true,0,0],
      ['muay_thai',11,'11','Dourado (Grau 11)', '⭐','#C9A23A','201,162,58', 0,0,'',   true,0,0],
      // ── Muay Thai — Khan IFMA/WMC (16 níveis) ────────────────────────────
      ['muay_thai_khan', 1,'khan_1', '1° Khan Nueng — Branco',            '🤍','#f5f5f5','245,245,245', 3,0,'khan_2', true,0,0],
      ['muay_thai_khan', 2,'khan_2', '2° Khan Song — Amarelo',            '🟡','#fdd835','253,216,53',  3,0,'khan_3', true,0,0],
      ['muay_thai_khan', 3,'khan_3', '3° Khan Sam — Amarelo e Branco',    '🟡','#f9a825','249,168,37',  3,0,'khan_4', true,0,0],
      ['muay_thai_khan', 4,'khan_4', '4° Khan Sih — Verde',               '🟢','#2e7d32','46,125,50',   3,0,'khan_5', true,0,0],
      ['muay_thai_khan', 5,'khan_5', '5° Khan Han — Verde e Branco',      '🟢','#43a047','67,160,71',   3,0,'khan_6', true,0,0],
      ['muay_thai_khan', 6,'khan_6', '6° Khan Hok — Azul',                '🔵','#1565c0','21,101,192',  6,0,'khan_7', true,0,0],
      ['muay_thai_khan', 7,'khan_7', '7° Khan Jed — Azul e Branco',       '🔵','#1976d2','25,118,210',  6,0,'khan_8', true,0,0],
      ['muay_thai_khan', 8,'khan_8', '8° Khan Pad — Marron',              '🟤','#5d4037','93,64,55',    6,0,'khan_9', true,0,0],
      ['muay_thai_khan', 9,'khan_9', '9° Khan Kaoh — Marron e Branco',    '🟤','#795548','121,85,72',   6,0,'khan_10',true,0,0],
      ['muay_thai_khan',10,'khan_10','10° Khan Sib — Vermelho',           '🔴','#c62828','198,40,40',   6,0,'khan_11',true,0,0],
      ['muay_thai_khan',11,'khan_11','11° Khan Sib Ed — Vermelho e Branco','🔴','#e53935','229,57,53', 12,0,'khan_12',true,0,0],
      ['muay_thai_khan',12,'khan_12','12° Khan Sib Song — Preto',         '⚫','#1a1a1a','26,26,26',   24,0,'khan_13',true,0,0],
      ['muay_thai_khan',13,'khan_13','13° Khan Sib Sam — Preto e Branco', '⚫','#333333','51,51,51',   36,0,'khan_14',true,0,0],
      ['muay_thai_khan',14,'khan_14','14° Khan Sib Sih — Prata (Mestre)', '🪙','#9e9e9e','158,158,158', 0,0,'khan_15',true,0,0],
      ['muay_thai_khan',15,'khan_15','15° Khan Sib Han — Ouro (Grão-Mestre)','⭐','#C9A23A','201,162,58',0,0,'khan_16',true,0,0],
      ['muay_thai_khan',16,'khan_16','16° Khan Sib Hok — Ouro e Prata',  '⭐','#D4AF37','212,175,55',  0,0,'',       true,0,0],
      // ── Capoeira — Cordões ────────────────────────────────────────────────
      ['capoeira',1, 'sem-cordao', 'Sem Cordão',         '🪢','#e8e8e8','232,232,232',0,0,'branca-1',  true,0,0],
      ['capoeira',2, 'branca-1',   'Branca 1ª classe',   '⚪','#f5f5f5','245,245,245',0,0,'branca-2',  true,0,0],
      ['capoeira',3, 'branca-2',   'Branca 2ª classe',   '⚪','#e8e8e8','232,232,232',0,0,'amarela-1', true,0,0],
      ['capoeira',4, 'amarela-1',  'Amarela 1ª classe',  '🟡','#fdd835','253,216,53', 0,0,'amarela-2', true,0,0],
      ['capoeira',5, 'amarela-2',  'Amarela 2ª classe',  '🟡','#f9a825','249,168,37', 0,0,'azul-1',    true,0,0],
      ['capoeira',6, 'azul-1',     'Azul 1ª classe',     '🔵','#1565c0','21,101,192', 0,0,'azul-2',    true,0,0],
      ['capoeira',7, 'azul-2',     'Azul 2ª classe',     '🔵','#1976d2','25,118,210', 0,0,'verde-1',   true,0,0],
      ['capoeira',8, 'verde-1',    'Verde 1ª classe',    '🟢','#2e7d32','46,125,50',  0,0,'verde-2',   true,0,0],
      ['capoeira',9, 'verde-2',    'Verde 2ª classe',    '🟢','#43a047','67,160,71',  0,0,'marrom-1',  true,0,0],
      ['capoeira',10,'marrom-1',   'Marrom 1ª classe',   '🟤','#5d4037','93,64,55',   0,0,'marrom-2',  true,0,0],
      ['capoeira',11,'marrom-2',   'Marrom 2ª classe',   '🟤','#795548','121,85,72',  0,0,'vermelha',  true,0,0],
      ['capoeira',12,'vermelha',   'Vermelha (Mestre)',   '🔴','#c62828','198,40,40',  0,0,'',          true,0,0],
      // ── Kickboxing — WAKO ─────────────────────────────────────────────────
      ['kickboxing',1,'branca',  'Branca',            '⚪','#e8e8e8','232,232,232',0,0,'amarela', true,0,0],
      ['kickboxing',2,'amarela', 'Amarela',           '🟡','#fdd835','253,216,53', 0,0,'laranja', true,0,0],
      ['kickboxing',3,'laranja', 'Laranja',           '🟠','#fb8c00','251,140,0',  0,0,'verde',   true,0,0],
      ['kickboxing',4,'verde',   'Verde',             '🟢','#2e7d32','46,125,50',  0,0,'azul',    true,0,0],
      ['kickboxing',5,'azul',    'Azul',              '🔵','#1565c0','21,101,192', 0,0,'roxa',    true,0,0],
      ['kickboxing',6,'roxa',    'Roxa',              '🟣','#6a1b9a','106,27,154', 0,0,'marrom',  true,0,0],
      ['kickboxing',7,'marrom',  'Marrom',            '🟤','#5d4037','93,64,55',   0,0,'vermelha',true,0,0],
      ['kickboxing',8,'vermelha','Vermelha',          '🔴','#c62828','198,40,40',  0,0,'preta',   true,0,0],
      ['kickboxing',9,'preta',   'Preta (1°–9° Dan)', '⚫','#1a1a1a','26,26,26',   0,9,'',        true,0,0],
      // ── Taekwondo — WT/Kukkiwon ───────────────────────────────────────────
      ['taekwondo', 1,'geup_10','10° Geup — Branca',                  '⚪','#e8e8e8','232,232,232',0,0,'geup_9', true,0,0],
      ['taekwondo', 2,'geup_9', '9° Geup — Amarela',                  '🟡','#fdd835','253,216,53', 0,0,'geup_8', true,0,0],
      ['taekwondo', 3,'geup_8', '8° Geup — Amarela com listra verde', '🟡','#f9a825','249,168,37', 0,0,'geup_7', true,0,0],
      ['taekwondo', 4,'geup_7', '7° Geup — Verde',                    '🟢','#43a047','67,160,71',  0,0,'geup_6', true,0,0],
      ['taekwondo', 5,'geup_6', '6° Geup — Verde com listra azul',    '🟢','#2e7d32','46,125,50',  0,0,'geup_5', true,0,0],
      ['taekwondo', 6,'geup_5', '5° Geup — Azul',                     '🔵','#1565c0','21,101,192', 0,0,'geup_4', true,0,0],
      ['taekwondo', 7,'geup_4', '4° Geup — Azul com listra vermelha', '🔵','#1976d2','25,118,210', 0,0,'geup_3', true,0,0],
      ['taekwondo', 8,'geup_3', '3° Geup — Vermelha',                 '🔴','#c62828','198,40,40',  0,0,'geup_2', true,0,0],
      ['taekwondo', 9,'geup_2', '2° Geup — Vermelha com listra preta','🔴','#e53935','229,57,53',  0,0,'geup_1', true,0,0],
      ['taekwondo',10,'geup_1', '1° Geup — Vermelha (Poom/Dan)',      '🔴','#b71c1c','183,28,28',  0,0,'preta',  true,0,0],
      ['taekwondo',11,'preta',  'Preta (1°–9° Dan — Kukkiwon)',        '⚫','#1a1a1a','26,26,26',   0,9,'',       true,0,0],
    ];
    if (defaults.length > 0) {
      sh.getRange(2, 1, defaults.length, defaults[0].length).setValues(defaults);
    }
    sh.autoResizeColumns(1, header.length);
    sh.setColumnWidth(1,  140);
    sh.setColumnWidth(3,  130);
    sh.setColumnWidth(4,  200);
    sh.setColumnWidth(5,  50);
    sh.setColumnWidth(12, 80);
    sh.setColumnWidth(13, 80);
    Logger.log('[ensureFaixasSheet] Criada com ' + defaults.length + ' faixas + colunas idade_min/idade_max');
  } else {
    // Garante colunas idade_min/idade_max em sheets antigas
    var lastCol = sh.getLastColumn();
    if (lastCol < 12) {
      sh.getRange(1, 12).setValue('idade_min').setFontWeight('bold');
      sh.getRange(1, 13).setValue('idade_max').setFontWeight('bold');
      var nRows = sh.getLastRow() - 1;
      if (nRows > 0) sh.getRange(2, 12, nRows, 2).setValue(0);
      Logger.log('[ensureFaixasSheet] Colunas idade adicionadas a sheet existente');
    }
  }
  return sh;
}

// ── Retorna mapa { modalidade_id: [ {faixa_id, label, emoji, cor, idadeMin, idadeMax, ...} ] } ──
function getFaixasPorModalidade() {
  var sh   = ensureFaixasSheet();
  var rows = sh.getDataRange().getValues();
  var hdrs = rows[0].map(function(h){ return h ? h.toString().toLowerCase().trim() : ''; });

  function ci(name) { var i = hdrs.indexOf(name); return i >= 0 ? i : -1; }
  var cMod  = ci('modalidade_id'); if (cMod  < 0) cMod  = 0;
  var cOrd  = ci('ordem');         if (cOrd  < 0) cOrd  = 1;
  var cId   = ci('faixa_id');      if (cId   < 0) cId   = 2;
  var cLbl  = ci('label');         if (cLbl  < 0) cLbl  = 3;
  var cEmo  = ci('emoji');         if (cEmo  < 0) cEmo  = 4;
  var cCor  = ci('cor');           if (cCor  < 0) cCor  = 5;
  var cRGB  = ci('corgb');         if (cRGB  < 0) cRGB  = 6;
  var cMes  = ci('min_meses');     if (cMes  < 0) cMes  = 7;
  var cMaxG = ci('max_grau');      if (cMaxG < 0) cMaxG = 8;
  var cNext = ci('next_faixa');    if (cNext < 0) cNext = 9;
  var cAtiv = ci('ativo');         if (cAtiv < 0) cAtiv = 10;
  var cIMin = ci('idade_min');     // col L — 0 = sem restrição
  var cIMax = ci('idade_max');     // col M — 0 = sem restrição

  var mapa = {};
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (!r[cMod] || !r[cId]) continue;
    var ativo = r[cAtiv] === true || r[cAtiv] === 'TRUE' || r[cAtiv] === 'true';
    if (!ativo) continue;
    var modId = r[cMod].toString().trim().toLowerCase();
    if (!mapa[modId]) mapa[modId] = [];
    var maxGrau  = parseInt(r[cMaxG]); if (isNaN(maxGrau))  maxGrau  = 4;
    var idadeMin = cIMin >= 0 ? (parseInt(r[cIMin]) || 0) : 0;
    var idadeMax = cIMax >= 0 ? (parseInt(r[cIMax]) || 0) : 0;
    mapa[modId].push({
      id:        r[cId].toString().trim(),
      label:     r[cLbl]  ? r[cLbl].toString().trim()  : r[cId].toString().trim(),
      emoji:     r[cEmo]  ? r[cEmo].toString().trim()  : '🥋',
      cor:       r[cCor]  ? r[cCor].toString().trim()  : '#C9A23A',
      corRGB:    r[cRGB]  ? r[cRGB].toString().trim()  : '201,162,58',
      minMeses:  parseInt(r[cMes]) || 0,
      maxGrau:   maxGrau,
      next:      r[cNext] ? r[cNext].toString().trim() : '',
      ordem:     parseInt(r[cOrd]) || i,
      idadeMin:  idadeMin,
      idadeMax:  idadeMax
    });
  }
  Object.keys(mapa).forEach(function(k) {
    mapa[k].sort(function(a, b){ return a.ordem - b.ordem; });
  });
  return mapa;
}

/**
 * Retorna as faixas filtradas pela idade do aluno.
 * Regra BJJ: idade 0-15 → grupo kids; 16+ → grupo adulto.
 * Para modalidades sem restrição de idade (idadeMin=0 e idadeMax=0), retorna todas.
 *
 * @param {string} modId  — ID da modalidade (ex: 'bjj_adulto')
 * @param {number} idade  — Idade calculada a partir do nascimento
 * @returns {Array}
 */
function _getFaixasPorIdade(modId, idade) {
  var mapa   = getFaixasPorModalidade();
  var faixas = mapa[modId] || [];
  if (!faixas.length) return [];

  // Verifica se a modalidade usa filtro de idade
  var temFiltroIdade = faixas.some(function(f) {
    return f.idadeMin > 0 || f.idadeMax > 0;
  });
  if (!temFiltroIdade || !idade) return faixas; // sem filtro: retorna tudo

  return faixas.filter(function(f) {
    var minOk = f.idadeMin === 0 || idade >= f.idadeMin;
    var maxOk = f.idadeMax === 0 || idade <= f.idadeMax;
    return minOk && maxOk;
  });
}

/**
 * Calcula a idade em anos a partir de uma data de nascimento.
 * Aceita Date, string ISO, ou string dd/MM/yyyy.
 */
function _calcularIdade(nascimento) {
  if (!nascimento) return null;
  var d;
  if (nascimento instanceof Date) {
    d = nascimento;
  } else {
    var s = nascimento.toString().trim();
    var mBR = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (mBR) d = new Date(parseInt(mBR[3]), parseInt(mBR[2])-1, parseInt(mBR[1]));
    else d = new Date(s);
  }
  if (!d || isNaN(d.getTime())) return null;
  var hoje  = new Date();
  var idade = hoje.getFullYear() - d.getFullYear();
  var m     = hoje.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < d.getDate())) idade--;
  return idade;
}

// ── handleGetFaixas — retorna faixas filtradas por idade quando email informado ──
function handleGetFaixas(data) {
  try {
    var mapa = getFaixasPorModalidade();

    // Se email informado, filtra faixas do BJJ pela idade do aluno
    if (data && data.email) {
      var email = data.email.toString().trim().toLowerCase();
      var idade = null;
      try {
        var aluSheet = getSheet('Alunos');
        var aluRows  = aluSheet.getDataRange().getValues();
        for (var i = 1; i < aluRows.length; i++) {
          if (!aluRows[i][0]) continue;
          if (aluRows[i][0].toString().trim().toLowerCase() === email) {
            idade = _calcularIdade(aluRows[i][8]); // col I = nascimento
            break;
          }
        }
      } catch(e) {}

      if (idade !== null) {
        // Aplica filtro de idade nas modalidades que têm restrição
        Object.keys(mapa).forEach(function(modId) {
          mapa[modId] = _getFaixasPorIdade(modId, idade);
        });
        Logger.log('[getFaixas] email=' + email + ' idade=' + idade + ' → filtro aplicado');
      }
    }

    return jsonResponse(true, null, { faixas: mapa });
  } catch(e) {
    return errorResponse('getFaixas: ' + e.message);
  }
}



