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

let ultimaAcao = null; // Suporte ao comando /undo

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
  console.log(`⏳ [4.5/5] Carregando WhatsApp Web: \({percent}% -\){message}`);
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
  const text = msg.body.toLowerCase().trim();

  // filtro pra só comandos
  const comandoValido = /^(\/p|\/pd|\/b|\/z|\/t|\/l|\/a|\/r|\/\?|\/p\?|\/del|\/debug|\/bs|\/edit|\/status|\/limpar|\/n|\/undo|\/rg)/;
  if (!comandoValido.test(text)) return;

  // ===== UNDO (DESFAZER ÚLTIMA AÇÃO) =====
  if (text === '/undo') {
    if (!ultimaAcao) {
      return msg.reply('Nenhuma ação recente para desfazer.');
    }

    const { tipo, item, categoria } = ultimaAcao;
    const lista = diaData[categoria];

    if (tipo === 'adicionar') {
      const index = lista.indexOf(item);
      if (index !== -1) {
        lista.splice(index, 1);
        salvar();
        ultimaAcao = null;
        await reagir(client, msg, '↩️');
        return msg.reply('Último item adicionado foi removido!');
      }
    }
    return msg.reply('Não foi possível desfazer a última ação.');
  }

  const diaData = getDia();

  // ===== REGISTRAR NOTA =====
  if (text.startsWith('/n ')) {
    const nota = msg.body.slice(3).trim();

    if (nota) {
      salvarNota(capitalizar(nota));
      await reagir(client, msg, '📝');
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
    msg.reply('✅ WhatsApp conectado');
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
      case 'pd': d.pendencias = []; break;
      case 'p': d.planos = []; break;
      case 'bs': d.bruna = []; break;
      case 'z': d.zoogene = []; break;
      case 't': d.tecsa = []; break;
      case 'l': d.labpet = []; break;
      case 'a': d.adm = []; break;
      case 'b': d.buscas = []; break;
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

// ===== EDITAR CORRIGIDO =====
  if (text.startsWith('/edit ')) {
    const partes = msg.body.trim().split(' ');
    const tipo = partes[1]?.toLowerCase();
    const index = parseInt(partes[2]) - 1;

    const mapa = { p: 'planos', pd: 'pendencias', b: 'buscas', z: 'zoogene', t: 'tecsa', l: 'labpet', a: 'adm', bs: 'bruna' };
    const lista = diaData[mapa[tipo]];

    if (!lista || isNaN(index) || !lista[index]) {
      return msg.reply('Item não encontrado ou número inválido.');
    }

    const item = lista[index];
    const campoBruto = partes[3] ? partes[3].toLowerCase() : null;

    let campoReal = null;
    if (campoBruto === 'clinica' || campoBruto === 'clínica') campoReal = 'clinica';
    if (campoBruto === 'paciente') campoReal = 'paciente';
    if (campoBruto === 'sistema') campoReal = 'sistema';
    if (campoBruto === 'exame') campoReal = 'exame';
    if (campoBruto === 'obs' || campoBruto === 'observacao' || campoBruto === 'observação') campoReal = 'obs';

    // EDIÇÃO DE CAMPO ESPECÍFICO (ex: /edit pd 1 clínica cvet)
    if (campoReal && typeof item !== 'string') {
      const valorBruto = partes.slice(4).join(' ');
      
      if (!valorBruto) {
        return msg.reply('Informe o novo valor para o campo.');
      }

      const valorComAtalhos = aplicarAtalhos(valorBruto);
      const antigo = item[campoReal] || '(vazio)';

      item[campoReal] = valorComAtalhos;

      if (tipo === 'pd') item.texto = montarPendencia(item.clinica, item.paciente, item.exame, item.obs);
      else if (tipo === 'p') item.texto = montarPlano(item.clinica, item.paciente, item.sistema, item.exame, item.obs);
      else if (tipo === 'bs') item.texto = montarBruna(item.paciente, item.sistema, item.exame, item.obs);

      salvar();

      const respostaMsg = 'Editado (*' + campoReal + '*):\n' +
                          'De: ' + antigo + '\n' +
                          'Para: *' + valorComAtalhos + '*\n\n' +
                          '*Resultado:* ' + (item.texto || '');

      return msg.reply(respostaMsg);
    }

    // EDIÇÃO DE TEXTO COMPLETO OU POR BARRAS
    const novoTextoBruto = partes.slice(3).join(' ');

    if (!novoTextoBruto) {
      return msg.reply('Digite o novo texto ou especifique o campo para editar.');
    }

    const antigo = typeof item === 'string'
      ? item
      : (item.texto || ((item.clinica || '') + ' ' + (item.paciente || '')).trim());

    const novoTextoComAtalhos = aplicarAtalhos(novoTextoBruto);

    if (typeof item === 'string') {
      lista[index] = capitalizar(novoTextoComAtalhos);
    } else {
      if (novoTextoComAtalhos.includes('/')) {
        const pedacos = novoTextoComAtalhos.split('/');
        
        if (tipo === 'pd') {
          item.clinica = aplicarAtalhos((pedacos[0] || '').trim());
          item.paciente = (pedacos[1] || '').trim();
          item.exame = aplicarAtalhos((pedacos[2] || '').trim());
          item.obs = (pedacos[3] || '').trim();
          item.texto = montarPendencia(item.clinica, item.paciente, item.exame, item.obs);
        } else if (tipo === 'p') {
          item.clinica = aplicarAtalhos((pedacos[0] || '').trim());
          item.paciente = (pedacos[1] || '').trim();
          item.sistema = aplicarAtalhos((pedacos[2] || '').trim());
          item.exame = aplicarAtalhos((pedacos[3] || '').trim());
          item.obs = (pedacos[4] || '').trim();
          item.texto = montarPlano(item.clinica, item.paciente, item.sistema, item.exame, item.obs);
        } else if (tipo === 'bs') {
          item.paciente = (pedacos[0] || '').trim();
          item.sistema = aplicarAtalhos((pedacos[1] || '').trim());
          item.exame = aplicarAtalhos((pedacos[2] || '').trim());
          item.obs = (pedacos[3] || '').trim();
          item.texto = montarBruna(item.paciente, item.sistema, item.exame, item.obs);
        }
      } else {
        item.texto = capitalizar(novoTextoComAtalhos);
      }
    }

    salvar();

    const textoFinal = typeof item === 'string' ? lista[index] : item.texto;

    const respostaFinal = 'Editado:\n' +
                          '*De:* ' + antigo + '\n' +
                          '*Para:* ' + textoFinal;

    return msg.reply(respostaFinal);
  }

  // ===== DEBUG =====
  if (text === '/debug') {
    const diaISO = hoje();
    const diaBR = hojeBR();
    const d = getDia(diaISO);

    let resposta = `PENDÊNCIAS ${diaBR}\n`;

    function addLista(l) {
      if (l.length > 0) {
        l.forEach((p, i) => {
          resposta += `\({i + 1}.\){p}\n`;
        });
      }
    }

    addLista(d.pendencias);

    function addSecao(titulo, l) {
      if (l.length > 0) {
        resposta += `\n${titulo}\n`;
        addLista(l);
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

// ===== DELETAR CORRIGIDO =====
  if (text.startsWith('/del ')) {
    const partes = text.split(' ');
    const tipo = partes[1]?.toLowerCase();
    const index = parseInt(partes[2]) - 1;

    const mapa = { p: 'planos', pd: 'pendencias', b: 'buscas', z: 'zoogene', t: 'tecsa', l: 'labpet', a: 'adm', bs: 'bruna' };
    const lista = diaData[mapa[tipo]];

    if (lista && !isNaN(index) && lista[index]) {
      const removido = lista.splice(index, 1)[0];
      salvar();

      const textoExibicao = typeof removido === 'object' ? (removido.texto || removido.paciente) : removido;

      return msg.reply(`Removido: *${textoExibicao}*`);
    } else {
      return msg.reply('Item não encontrado ou número inválido.');
    }
  }

  // ===== GERADOR DE RESUMO =====
  function gerarResumoPorDia(diaISO, diaExibicao) {
    const d = data[diaISO];
    if (!d) return `Sem dados para a data ${diaExibicao}.`;

    const temPendencias = d.pendencias && d.pendencias.length > 0;
    const temPlanos = d.planos && d.planos.length > 0;
    const temBruna = d.bruna && d.bruna.length > 0;
    const temZoogene = d.zoogene && d.zoogene.length > 0;
    const temTecsa = d.tecsa && d.tecsa.length > 0;
    const temLabpet = d.labpet && d.labpet.length > 0;
    const temAdm = d.adm && d.adm.length > 0;
    const temBuscas = d.buscas && d.buscas.length > 0;

    const temOutrasTarefas = temPendencias || temPlanos || temBruna || temZoogene || temTecsa || temLabpet || temAdm;

    if (!temOutrasTarefas && !temBuscas) return `Sem dados para a data ${diaExibicao}.`;

    let resposta = '';

    // Se só houver buscas
    if (!temOutrasTarefas && temBuscas) {
      resposta += `BUSCAS ${diaExibicao}\n`;
      d.buscas.forEach(b => resposta += `- ${b}\n`);
      return resposta.trim();
    }

    // Título Principal
    resposta += `PENDÊNCIAS ${diaExibicao}\n`;

    // 1. PENDÊNCIAS NORMAIS
    if (temPendencias) {
      const clinicasAgrupadas = {};
      d.pendencias.forEach(p => {
        const c = p.clinica || 'Geral';
        if (!clinicasAgrupadas[c]) clinicasAgrupadas[c] = [];
        clinicasAgrupadas[c].push(p.texto);
      });

      Object.keys(clinicasAgrupadas).forEach(c => {
        resposta += `- ${clinicasAgrupadas[c].join(' / ')}\n`;
      });
    }

    // 2. GUIAS / AMOSTRAS
    const gZ = montarGuia(d.zoogene || [], 'Zoogene');
    const gT = montarGuia(d.tecsa || [], 'Tecsa');
    const gL = montarGuia(d.labpet || [], 'Labpet');
    if (gZ) resposta += `- ${gZ}\n`;
    if (gT) resposta += `- ${gT}\n`;
    if (gL) resposta += `- ${gL}\n`;

    // Adiciona seções secundárias (só coloca subcabeçalho se houver pendências principais)
    const addSecao = (titulo, lista) => {
      if (!lista || lista.length === 0) return;

      if (temPendencias) {
        resposta += `\n${titulo}\n`;
      }
      
      lista.forEach(item => resposta += `- ${typeof item === 'string' ? item : item.texto}\n`);
    };

    addSecao("PLANOS", d.planos);
    addSecao("BRUNA SOUZA", d.bruna);
    addSecao("ADM", d.adm);

    if (temBuscas) {
      resposta += `\nBUSCAS\n`;
      d.buscas.forEach(b => resposta += `- ${b}\n`);
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

    let diaExibicao = argumento;
    if (argumento.includes('/')) {
      const partes = argumento.split('/');
      diaExibicao = `\({partes[0].padStart(2, '0')}/\){partes[1].padStart(2, '0')}`;
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