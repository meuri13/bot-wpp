// ===== BIBLIOTECAS =====
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

// ===== FUNÇÕES =====
const { 
  capitalizar,
  hoje,
  hojeBR,
  reagir
} = require('./funcoes/util');

const aplicarAtalhos = require('./funcoes/atalhos');
  
const aplicarExames = require('./funcoes/exames');

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

// ===== READY =====
client.on('ready', () => {
  console.log('Bot conectado!');
});

// ===== BOT =====
client.on('message_create', async msg => {
  //if (!msg.fromMe) return;

  const text = msg.body.toLowerCase().trim();

  // >>> NOVO: filtro pra só comandos
  const comandoValido = /^(\/p|\/pd|\/b|\/z|\/t|\/l|\/a|\/resumo|\/\?|\/\p?|\/del|\/debug|\/bs|\/edit|\/status|\/limpar)/;
  if (!comandoValido.test(text)) return;

  const diaData = getDia();

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
    await reagir(client, msg);
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
    await reagir(client, msg);
}

// ===== CADASTROS =====

if (text.startsWith('/z ')) {
  adicionarGuia(diaData.zoogene, text.slice(3));
  salvar();
    await reagir(client, msg);
}

if (text.startsWith('/t ')) {
  adicionarGuia(diaData.tecsa, text.slice(3));
  salvar();
  await reagir(client, msg);
}

if (text.startsWith('/l ')) {
  adicionarGuia(diaData.labpet, text.slice(3));
  salvar();
  await reagir(client, msg);
}

  // ===== ADM =====
  if (text.startsWith('/a ')) {
    diaData.adm.push(capitalizar(text.slice(3).trim()));
  salvar();
    await reagir(client, msg);
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

  // ===== EDIÇÃO POR CAMPO =====
  const campos = ['clinica', 'paciente', 'sistema', 'exame', 'obs'];

  if (campos.includes(partes[3]) && typeof item !== 'string') {
    const campo = partes[3];
    const valor = partes.slice(4).join(' ');

    const antigo = item[campo];

    item[campo] = valor;

    // atualiza a frase depois da mudança
    if (tipo === 'pd') {
      item.texto = montarPendencia(
        item.clinica,
        item.paciente,
        item.exame,
        item.obs
      );
    }

    if (tipo === 'p') {
      item.texto = montarPlano(
        item.clinica,
        item.paciente,
        item.sistema,
        item.exame,
        item.obs
      );
    }

    if (tipo === 'bs') {
      item.texto = montarBruna(
        item.paciente,
        item.sistema,
        item.exame,
        item.obs
      );
    }

    salvar();

    return msg.reply(
      `Editado:\n${campo}: ${antigo || '(vazio)'} → ${valor}\n\n${item.texto}`
    );
  }


  // ===== EDIÇÃO NORMAL (texto inteiro) =====
  const novoTexto = partes.slice(3).join(' ');

  const antigo = typeof item === 'string'
    ? item
    : item.texto;

  if (typeof item === 'string') {
    lista[index] = capitalizar(novoTexto);
  } else {
    item.texto = capitalizar(novoTexto);
  }

  salvar();

  msg.reply(
    `Editado:\nDe: ${antigo}\nPara: ${typeof item === 'string' ? lista[index] : item.texto}`
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

  if (lista && lista[index]) {
    const removido = lista.splice(index, 1);
    salvar();
    msg.reply(`Removido: ${removido}`);
  } else {
    msg.reply('Item não encontrado.');
  }
}

function textoPendencia(p) {
  return typeof p === 'string' ? p : p.texto;
}

// ===== RESUMO HOJE =====
if (text === '/resumo') {
  const diaISO = hoje();
  const diaBR = hojeBR();
  const d = getDia(diaISO);

  const temOutrasCoisas =
    d.pendencias.length > 0 ||
    d.planos.length > 0 ||
    d.bruna.length > 0 ||
    d.zoogene.length > 0 ||
    d.tecsa.length > 0 ||
    d.labpet.length > 0 ||
    d.adm.length > 0;

  let resposta = temOutrasCoisas ? `PENDÊNCIAS ${diaBR}\n` : '';

  // PENDÊNCIAS
  if (d.pendencias.length > 0) {
    d.pendencias.forEach(p => {
      resposta += `- ${textoPendencia(p)}\n`;
    });
  }

  // GUIAS
  const guiaZoogene = montarGuia(d.zoogene, 'Zoogene');
  const guiaTecsa = montarGuia(d.tecsa, 'Tecsa');
  const guiaLabpet = montarGuia(d.labpet, 'Labpet');

  if (guiaZoogene) resposta += `- ${guiaZoogene}\n`;
  if (guiaTecsa) resposta += `- ${guiaTecsa}\n`;
  if (guiaLabpet) resposta += `- ${guiaLabpet}\n`;

  // PLANOS / BRUNA / ADM
  function addSecao(titulo, lista) {
    if (lista.length === 0) return;

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
  if (d.buscas.length > 0) {
    resposta += `\nBUSCAS\n`;
    d.buscas.forEach(p => resposta += `- ${textoPendencia(p)}\n`);
  }

  msg.reply(resposta);
}

  // ===== RESUMO POR DATA =====
  if (text.startsWith('/resumo ')) {
    const dia = text.split(' ')[1];
    const d = data[dia];

    if (!d) return msg.reply("Sem dados nesse dia.");

    let resposta = `PENDÊNCIAS ${dia}\n`;

	if (d.pendencias.length > 0) {
  	d.pendencias.forEach(p => resposta += `- ${p}\n`);
  	resposta += `\n`;
}

    function addSecao(titulo, lista) {
      if (lista.length > 0) {
        resposta += `\n${titulo}\n`;
        lista.forEach(p => resposta += `- ${p}\n`);
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
});

// ===== EVITA CRASH =====
process.on('unhandledRejection', err => {
  console.log('Erro ignorado:', err.message);
});

// ===== START =====
client.initialize();