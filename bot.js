// ===== BIBLIOTECAS =====
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

console.log('🚀 [1/5] Iniciando o script do Bot...');

// ===== FUNÇÕES =====
const { 
  capitalizar,
  hoje,
  hojeBR,
  converterParaISO,
  reagir
} = require('./funcoes/util');

const aplicarAtalhos = require('./funcoes/atalhos');
  
const {
  montarPendencia,
  criarPendencia
} = require('./funcoes/pendencias');

const {
  montarPlano,
} = require('./funcoes/planos');

const {
  montarBruna,
} = require('./funcoes/bruna');

const {
  adicionarGuia,
  montarGuia
} = require('./funcoes/guias');

console.log('📂 [2/5] Módulos e funções carregados com sucesso.');

// ===== CLIENT =====
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  }
});

// ===== BANCO =====
let data = {};
if (fs.existsSync('dados.json')) {
  data = JSON.parse(fs.readFileSync('dados.json'));
}

function salvar() {
  fs.writeFileSync('dados.json', JSON.stringify(data, null, 2));
}

// ===== NOTAS PRIVADAS =====
function salvarNota(texto) {
  fs.appendFileSync('notas.txt', `- ${texto}\n`, 'utf-8');
}

// ===== DATA =====

function getDia(dia = hoje()) {
  if (!data[dia]) {
    data[dia] = {
      planos: [],
      pendencias: [],
      buscas: [],
      zoogene: [],
      tecsa: [],
      labpet: [],
      adm: [],
      bruna: []
    };
  }
  return data[dia];
}

// ===== UTILS =====

function atualizarTextoPendencia(p) {
  if (p.sistema !== undefined && p.clinica !== undefined) {
    // plano
    if (p.clinica && p.sistema) {
      p.texto = montarPlano(
        p.clinica,
        p.paciente,
        p.sistema,
        p.exame,
        p.obs
      );
    }
    // pendência
    else if (p.clinica) {
      p.texto = montarPendencia(
        p.clinica,
        p.paciente,
        p.exame,
        p.obs
      );
    }
    // bruna
    else {
      p.texto = montarBruna(
        p.paciente,
        p.sistema,
        p.exame,
        p.obs
      );
    }
  }

  return p;
}

// ===== QR =====
client.on('qr', qr => {
  console.log('Escaneie o QR abaixo:');
  qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
  console.log('🔑 [4/5] Autenticado com sucesso! Carregando sessão do WhatsApp...');
});

client.on('loading_screen', (percent, message) => {
  console.log(`⏳ [4.5/5] Carregando WhatsApp Web: ${percent}% - ${message}`);
});

// ===== READY =====
client.on('ready', async () => {
  console.log('Bot conectado!');

  const ID_GRUPO = '120363409733602218@g.us';

  try {
    // Tenta enviar a notificação no grupo (gera notificação na barra)
    await client.sendMessage(ID_GRUPO, '🟢 Bot conectado e operacional!');
    console.log('📢 Notificação de inicialização enviada no grupo!');
  } catch (error) {
    console.warn('⚠️ Falha ao enviar no grupo. Tentando enviar no privado...');
    
    try {
      // Plano B: Se o grupo falhar, envia direto no seu número privado
      const meuNumero = client.info.wid._serialized;
      await client.sendMessage(meuNumero, '🟢 Bot conectado e operacional!');
      console.log('📱 Notificação enviada no privado.');
    } catch (errPrivado) {
      console.error('❌ Erro ao enviar mensagem no privado:', errPrivado.message || errPrivado);
    }
  }
});

client.on('auth_failure', (msg) => {
  console.error('❌ [ERRO DE AUTENTICAÇÃO] Falha ao autenticar:', msg);
});

client.on('disconnected', (reason) => {
  console.warn('⚠️ [DESCONECTADO] O bot foi desconectado:', reason);
});

// ===== BOT =====
client.on('message_create', async msg => {
  //if (!msg.fromMe) return;

  const text = msg.body.toLowerCase().trim();

  // >>> NOVO: filtro pra só comandos
  const comandoValido = /^(\/p|\/pd|\/b|\/z|\/t|\/l|\/a|\/r|\/\?|\/\p?|\/del|\/debug|\/bs|\/edit|\/status|\/limpar|\/n)/;
  if (!comandoValido.test(text)) return;

  const diaData = getDia();

  // ===== REGISTRAR NOTA =====
if (text.startsWith('/n ')) {
  const nota = msg.body.slice(3).trim();

  if (nota) {
    salvarNota(capitalizar(nota));
    await reagir(client, msg, '📝'); // Reage com ✅ para confirmar o recebimento
  }
}

  // ===== AJUDA =====
  if (text === '/?') {
  let resposta = `COMANDOS DISPONÍVEIS:\n\n`;

  resposta += `Pendência = /pd clinica / paciente / exame (-) / (obs)\n`;
  resposta += `Ex: /pd cvet / thor / swab\n\n`;

  resposta += `Planos = /p clinica / paciente / sistema (-) / exame (-) / (obs)\n`;
  resposta += `Ex: /p buturi / amora / plamev / hemograma\n\n`;

  resposta += `Bruna Souza = /bs paciente / sistema (-) / exame (-) / (obs)\n`;
  resposta += `Ex: /bs amora / plamev / hemograma\n\n`;

  msg.reply(resposta);
    }

  if (text === '/p?') {
  let resposta = `PLANOS:\n\n`;

  resposta += `Eupet = eup\n`;
  resposta += `Pet Top = pt\n`;
  resposta += `Plamev = pla\n`;
  resposta += `Pet Love = plo\n`;
  resposta += `AuHappy = ah\n\n`;

  msg.reply(resposta);
    }
  
// ===== STATUS =====
if (text === '/status') {
  const agora = new Date();

  const hora = agora.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const data = agora.toLocaleDateString('pt-BR');

  msg.reply(
`✅ WhatsApp conectado`
  );
}

// ===== LIMPAR =====
if (text.startsWith('/limpar')) {
  const tipo = text.slice(8).trim();

  if (!tipo) {
    await msg.reply(
      'Use:\n/limpar pd\n/limpar p\n/limpar bs\n/limpar tudo'
    );
    return;
  }

  const d = getDia(hoje());

  switch (tipo) {
    case 'pd':
      d.pendencias = [];
      break;

    case 'p':
      d.planos = [];
      break;

    case 'bs':
      d.bruna = [];
      break;

    case 'z':
      d.zoogene = [];
      break;

    case 't':
      d.tecsa = [];
      break;

    case 'l':
      d.labpet = [];
      break;

    case 'a':
      d.adm = [];
      break;

    case 'b':
      d.buscas = [];
      break;

    case 'tudo':
      d.pendencias = [];
      d.planos = [];
      d.bruna = [];
      d.zoogene = [];
      d.tecsa = [];
      d.labpet = [];
      d.adm = [];
      d.buscas = [];
      break;

    default:
      await msg.reply('Categoria inválida.');
      return;
  }

  salvar();
    await reagir(client, msg, '🧹');
  }

  // ===== PENDENCIAS =====
  if (text.startsWith('/pd ')) {
    const partes = text.slice(4).split('/');
    let [clinica, paciente, exame, obs] = partes.map(p => p?.trim());
    clinica = aplicarAtalhos(clinica);
    
    const frase = montarPendencia(clinica, paciente, exame, obs);

    diaData.pendencias.push(criarPendencia({
      texto: frase,
      clinica,
      paciente,
      exame,
      obs
    }));

  salvar();
    await reagir(client, msg);
      }

  // ===== PLANOS =====
  if (text.startsWith('/p ')) {
    const partes = text.slice(3).split('/');
    let [clinica, paciente, sistema, exame, obs] = partes.map(p => p?.trim());
    clinica = aplicarAtalhos(clinica);
    sistema = aplicarAtalhos(sistema);

    const frase = montarPlano(clinica, paciente, sistema, exame, obs);

    diaData.planos.push(criarPendencia({
    texto: frase,
    clinica,
    paciente,
    sistema,
    exame,
    obs
  }));

  salvar();
    await reagir(client, msg);
      }

// ===== BRUNA SOUZA =====
  if (text.startsWith('/bs ')) {
    const partes = text.slice(4).split('/');
    let [paciente, sistema, exame, obs] = partes.map(p => p?.trim());
    sistema = aplicarAtalhos(sistema);

    const frase = montarBruna(paciente, sistema, exame, obs);

     diaData.bruna.push(criarPendencia({
      texto: frase,
      paciente,
      sistema,
      exame,
      obs
    }));
    
  salvar();
    await reagir(client, msg);
      }

  // ===== BUSCAS =====
if (text.startsWith('/b ')) {
  let clinica = text.slice(3).trim();

  clinica = aplicarAtalhos(clinica);

  diaData.buscas.push(capitalizar(clinica));
  salvar();
    await reagir(client, msg, '🏍️');
}

// ===== CADASTROS =====

if (text.startsWith('/z ')) {
  adicionarGuia(diaData.zoogene, text.slice(3));
  salvar();
    await reagir(client, msg, '📝');
}

if (text.startsWith('/t ')) {
  adicionarGuia(diaData.tecsa, text.slice(3));
  salvar();
  await reagir(client, msg, '📝');
}

if (text.startsWith('/l ')) {
  adicionarGuia(diaData.labpet, text.slice(3));
  salvar();
  await reagir(client, msg, '📝');
}

  // ===== ADM =====
  if (text.startsWith('/a ')) {
    diaData.adm.push(capitalizar(text.slice(3).trim()));
  salvar();
    await reagir(client, msg, '📌');
      }

// ===== EDITAR =====
if (text.startsWith('/edit ')) {
  const partes = text.split(' ');

  const tipo = partes[1];
  const index = parseInt(partes[2]) - 1;

  if (isNaN(index)) {
    return msg.reply('Número inválido.');
  }

  const mapa = {
    p: 'planos',
    pd: 'pendencias',
    b: 'buscas',
    z: 'zoogene',
    t: 'tecsa',
    l: 'labpet',
    a: 'adm',
    bs: 'bruna'
  };

  const lista = diaData[mapa[tipo]];

  if (!lista || !lista[index]) {
    return msg.reply('Item não encontrado.');
  }

  const item = lista[index];

  // Helper local para processar atalhos com seguranca
  const processarTexto = (txt) => {
    if (typeof aplicarAtalhos === 'function') {
      return aplicarAtalhos(txt);
    }
    return txt;
  };

  // ===== PRIORIDADE 1: EDIÇÃO POR CAMPO ESPECÍFICO (/edit pd 1 clinica cvet) =====
  const camposValidos = ['clinica', 'paciente', 'sistema', 'exame', 'obs'];
  const campoInformado = partes[3] ? partes[3].toLowerCase() : null;

  if (campoInformado && camposValidos.includes(campoInformado) && typeof item !== 'string') {
    const valorBruto = partes.slice(4).join(' ');
    
    if (!valorBruto) {
      return msg.reply(`Informe o novo valor para o campo *${campoInformado}*.`);
    }

    const valorComAtalhos = processarTexto(valorBruto);
    const antigo = item[campoInformado];

    // Atualiza o campo especifico
    item[campoInformado] = valorComAtalhos;

    // Recalcula a frase completa com base nas suas funcoes de montagem
    if (tipo === 'pd' && typeof montarPendencia === 'function') {
      item.texto = montarPendencia(item.clinica, item.paciente, item.exame, item.obs);
    } else if (tipo === 'p' && typeof montarPlano === 'function') {
      item.texto = montarPlano(item.clinica, item.paciente, item.sistema, item.exame, item.obs);
    } else if (tipo === 'bs' && typeof montarBruna === 'function') {
      item.texto = montarBruna(item.paciente, item.sistema, item.exame, item.obs);
    }

    salvar();

    return msg.reply(
      `Editado (*${campoInformado}*):\nDe: ${antigo || '(vazio)'}\nPara: *${valorComAtalhos}*\n\n*Resultado:* ${item.texto || ''}`
    );
  }

  // ===== OPÇÃO SECUNDÁRIA: TEXTO INTEIRO OU BARRAS =====
  const novoTextoBruto = partes.slice(3).join(' ');

  if (!novoTextoBruto) {
    return msg.reply('Digite o novo texto ou especifique o campo para editar.');
  }

  const antigo = typeof item === 'string'
    ? item
    : (item.texto || `${item.clinica || ''} ${item.paciente || ''}`.trim());

  const novoTextoComAtalhos = processarTexto(novoTextoBruto);

  if (typeof item === 'string') {
    // Listas de texto simples (buscas, adm, etc.)
    lista[index] = typeof capitalizar === 'function' ? capitalizar(novoTextoComAtalhos) : novoTextoComAtalhos;
  } else {
    // Se for objeto e usar estrutura por barras (ex: /edit pd 1 cvet/thor/hemo)
    if (novoTextoComAtalhos.includes('/')) {
      const pedacos = novoTextoComAtalhos.split('/');
      item.clinica = processarTexto((pedacos[0] || '').trim());
      item.paciente = (pedacos[1] || '').trim();
      item.exame = processarTexto((pedacos[2] || '').trim());
      item.obs = (pedacos[3] || '').trim();

      if (tipo === 'pd' && typeof montarPendencia === 'function') {
        item.texto = montarPendencia(item.clinica, item.paciente, item.exame, item.obs);
      } else if (tipo === 'p' && typeof montarPlano === 'function') {
        item.texto = montarPlano(item.clinica, item.paciente, item.sistema, item.exame, item.obs);
      }
    } else {
      // Texto corrido livre (ex: /edit pd 1 Ver com Cvet sobre o exame de Thor)
      item.texto = typeof capitalizar === 'function' ? capitalizar(novoTextoComAtalhos) : novoTextoComAtalhos;
    }
  }

  salvar();

  const textoFinal = typeof item === 'string' ? lista[index] : item.texto;

  msg.reply(
    `Editado:\n*De:* ${antigo}\n*Para:* ${textoFinal}`
  );
}

// ===== DEBUG =====
if (text === '/debug') {
  const diaISO = hoje();
  const diaBR = hojeBR();
  const d = getDia(diaISO);

  let resposta = `PENDÊNCIAS ${diaBR}\n`;

  function addLista(lista) {
    if (lista.length > 0) {
      lista.forEach((p, i) => {
        resposta += `${i + 1}. ${p}\n`;
      });
    }
  }

  // PENDÊNCIAS
  addLista(d.pendencias);

  function addSecao(titulo, lista) {
    if (lista.length > 0) {
      resposta += `\n${titulo}\n`;
      addLista(lista);
    }
  }

  addSecao("PLANOS", d.planos);
  addSecao("BRUNA SOUZA", d.bruna);
  addSecao("ZOOGENE", d.zoogene);
  addSecao("TECSA", d.tecsa);
  addSecao("LABPET", d.labpet);
  addSecao("ADM", d.adm);
  addSecao("BUSCAS", d.buscas);

  msg.reply(resposta);
}

// ===== DELETAR =====
if (text.startsWith('/del ')) {
  const partes = text.split(' ');
  const tipo = partes[1]; // Ex: 'pd', 'p', 'b', etc.
  const index = parseInt(partes[2]) - 1;

  if (isNaN(index)) {
    return msg.reply('Número inválido.');
  }

  const mapa = {
    p: 'planos',
    pd: 'pendencias',
    b: 'buscas',
    z: 'zoogene',
    t: 'tecsa',
    l: 'labpet',
    a: 'adm',
    bs: 'bruna'
  };

  const lista = diaData[mapa[tipo]];

  if (lista && lista[index]) {
    // [0] extrai o item do array retornado pelo splice
    const removido = lista.splice(index, 1)[0]; 
    salvar();

    // Se for objeto (com clinica/paciente), formata o texto. Se for string simples, usa direto.
    let textoExibicao = removido;
    if (typeof removido === 'object' && removido !== null) {
      const clinica = removido.clinica ? `${removido.clinica} - ` : '';
      const paciente = removido.paciente || removido.texto || '';
      textoExibicao = `${clinica}${paciente}`.trim();
    }

    msg.reply(`Removido: ${textoExibicao}`);
  } else {
    msg.reply('Item não encontrado.');
  }
}

function textoPendencia(p) {
  return typeof p === 'string' ? p : p.texto;
}

// ===== GERADOR DE RESUMO =====
function gerarResumoPorDia(diaISO, diaExibicao) {
  const d = data[diaISO];

  if (!d) return `Sem dados para a data ${diaExibicao}.`;

  const temPendencias = (d.pendencias && d.pendencias.length > 0);
  const temPlanos = (d.planos && d.planos.length > 0);
  const temBruna = (d.bruna && d.bruna.length > 0);
  const temZoogene = (d.zoogene && d.zoogene.length > 0);
  const temTecsa = (d.tecsa && d.tecsa.length > 0);
  const temLabpet = (d.labpet && d.labpet.length > 0);
  const temAdm = (d.adm && d.adm.length > 0);
  const temBuscas = (d.buscas && d.buscas.length > 0);

  const temCoisas = temPendencias || temPlanos || temBruna || temZoogene || temTecsa || temLabpet || temAdm || temBuscas;

  if (!temCoisas) return `Sem dados para a data ${diaExibicao}.`;

  let resposta = `PENDÊNCIAS ${diaExibicao}\n`;

  // PENDÊNCIAS
  if (temPendencias) {
    d.pendencias.forEach(p => {
      resposta += `- ${textoPendencia(p)}\n`;
    });
  }

  // GUIAS (Agrupadas via montarGuia)
  const guiaZoogene = montarGuia(d.zoogene || [], 'Zoogene');
  const guiaTecsa = montarGuia(d.tecsa || [], 'Tecsa');
  const guiaLabpet = montarGuia(d.labpet || [], 'Labpet');

  if (guiaZoogene) resposta += `- ${guiaZoogene}\n`;
  if (guiaTecsa) resposta += `- ${guiaTecsa}\n`;
  if (guiaLabpet) resposta += `- ${guiaLabpet}\n`;

  // PLANOS / BRUNA / ADM (1 a 3 itens entram direto na lista principal, 4+ criam seção própria)
  function addSecao(titulo, lista) {
    if (!lista || lista.length === 0) return;

    if (lista.length < 4) {
      lista.forEach(p => resposta += `- ${textoPendencia(p)}\n`);
    } else {
      resposta += `\n${titulo}\n`;
      lista.forEach(p => resposta += `- ${textoPendencia(p)}\n`);
    }
  }

  addSecao("PLANOS", d.planos);
  addSecao("BRUNA SOUZA", d.bruna);
  addSecao("ADM", d.adm);

  // BUSCAS
  if (temBuscas) {
    resposta += `\nBUSCAS\n`;
    d.buscas.forEach(p => resposta += `- ${textoPendencia(p)}\n`);
  }

  return resposta.trim();
}

// ===== RESUMO HOJE (/r ou /resumo) =====
if (text === '/r' || text === '/resumo') {
  const diaISO = hoje();
  const diaBR = hojeBR();
  const resposta = gerarResumoPorDia(diaISO, diaBR);
  return msg.reply(resposta);
}

// ===== RESUMO POR DATA (/r DATA ou /resumo DATA) =====
if (text.startsWith('/r ') || text.startsWith('/resumo ')) {
  const argumento = text.replace(/^\/(r|resumo)\s+/, '').trim();
  const diaISO = converterParaISO(argumento);

  // Formata o cabeçalho de exibição para o padrão DD/MM
  let diaExibicao = argumento;
  if (argumento.includes('/')) {
    const partes = argumento.split('/');
    diaExibicao = `${partes[0].padStart(2, '0')}/${partes[1].padStart(2, '0')}`;
  }

  const resposta = gerarResumoPorDia(diaISO, diaExibicao);
  return msg.reply(resposta);
}
});

// ===== EVITA CRASH =====
process.on('unhandledRejection', err => {
  console.log('Erro ignorado:', err.message);
});

// ===== START =====
console.log('🌐 [3/5] Inicializando cliente e abrindo navegador...');
client.initialize();