const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

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
function hoje() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function hojeBR() {
  const d = new Date();
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  });
}

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
function capitalizar(txt = '') {
  if (!txt) return '';
  return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
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
  const comandoValido = /^(\/p|\/pd|\/b|\/z|\/t|\/l|\/a|\/resumo|\/\?|\/del|\/debug|\/bs|\/edit)/;
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

  resposta += `Zoogene = /z paciente\n`;
  resposta += `Tecsa = /t paciente\n`;
  resposta += `Labpet = /l paciente\n\n`;

  resposta += `Buscas = /b clínica\n`;
  resposta += `Adm = /a texto\n\n`;

  resposta += `Editar = /edit sessão número novo texto\n`;
  resposta += `Ex: /edit bs 1 amora / pettop / hemograma\n\n`;

  resposta += `Deletar = /del sessão número\n`;
  resposta += `Ex: /del pd 1\n\n`;

  resposta += `Pendências = /resumo`;

  msg.reply(resposta);
    }
  
  // ===== PENDENCIAS =====
  if (text.startsWith('/pd ')) {
    const partes = text.slice(4).split('/');
    const [clinica, paciente, exame, obs] = partes.map(p => p?.trim());

    let frase;

    if (exame && exame !== '-') {
      frase = `Ver com ${capitalizar(clinica)} sobre ${exame} de ${capitalizar(paciente)}`;
    } else {
      frase = `Ver com ${capitalizar(clinica)} sobre ${capitalizar(paciente)}`;
    }

    if (obs) frase += ` (${obs})`;

    diaData.pendencias.push(frase);
    salvar();
  }


  // ===== PLANOS =====
  if (text.startsWith('/p ')) {
    const partes = text.slice(3).split('/');
    const [clinica, paciente, sistema, exame, obs] = partes.map(p => p?.trim());

    let frase;

    if (exame && exame !== '-') {
      frase = `Ver se ${capitalizar(clinica)} lançou o ${exame} de ${capitalizar(paciente)} no ${capitalizar(sistema)}`;
    } else if (sistema && sistema !== '-') {
      frase = `Ver se ${capitalizar(clinica)} lançou ${capitalizar(paciente)} no ${capitalizar(sistema)}`;
    } else {
      frase = `Ver com ${capitalizar(clinica)} sobre ${capitalizar(paciente)}`;
    }

    if (obs) frase += ` (${obs})`;

    diaData.planos.push(frase);
    salvar();
  }

// ===== BRUNA SOUZA =====
  if (text.startsWith('/bs ')) {
    const partes = text.slice(4).split('/');
    const [paciente, sistema, exame, obs] = partes.map(p => p?.trim());

    let frase;

    if (exame && exame !== '-') {
      frase = `Ver se lançou o ${exame} de ${capitalizar(paciente)} no ${capitalizar(sistema)}`;
    } else if (sistema && sistema !== '-') {
      frase = `Ver se lançou ${capitalizar(paciente)} no ${capitalizar(sistema)}`;
    } else {
      frase = `Ver sobre ${capitalizar(paciente)}`;
    }

    if (obs) frase += ` (${obs})`;

    diaData.bruna.push(frase);
    salvar();
  }

  // ===== BUSCAS =====
  if (text.startsWith('/b ')) {
    diaData.buscas.push(capitalizar(text.slice(3).trim()));
    salvar();
  }

  // ===== CADASTROS =====
  if (text.startsWith('/z ')) {
    diaData.zoogene.push(capitalizar(text.slice(3).trim()));
    salvar();
  }

  if (text.startsWith('/t ')) {
    diaData.tecsa.push(capitalizar(text.slice(3).trim()));
    salvar();
  }

  if (text.startsWith('/l ')) {
    diaData.labpet.push(capitalizar(text.slice(3).trim()));
    salvar();
  }

  // ===== ADM =====
  if (text.startsWith('/a ')) {
    diaData.adm.push(capitalizar(text.slice(3).trim()));
    salvar();
  }

// ===== EDITAR =====
if (text.startsWith('/edit ')) {
  const partes = text.split(' ');

  const tipo = partes[1];
  const index = parseInt(partes[2]) - 1;

if (isNaN(index)) {
  return msg.reply('Número inválido.');
}

  const novoTexto = partes.slice(3).join(' ');

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
    const antigo = lista[index];
    lista[index] = capitalizar(novoTexto);
    salvar();

    msg.reply(`Editado:\nDe: ${antigo}\nPara: ${lista[index]}`);
  } else {
    msg.reply('Item não encontrado.');
  }
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

  // ===== RESUMO HOJE =====
  if (text === '/resumo') {
    const diaISO = hoje();
    const diaBR = hojeBR();
    const d = getDia(diaISO);

    let resposta = `PENDÊNCIAS ${diaBR}\n`;

	if (d.pendencias.length > 0) {
  	d.pendencias.forEach(p => resposta += `- ${p}\n`);
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
