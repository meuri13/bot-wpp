const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

// ===== CLIENT =====
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: false,
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
      adm: []
    };
  }
  return data[dia];
}

// ===== UTILS =====
function capitalizar(txt = '') {
  return txt.replace(/\b\w/g, l => l.toUpperCase());
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
  if (!msg.fromMe) return;

  const text = msg.body.toLowerCase().trim();

  // >>> NOVO: filtro pra só comandos
  const comandoValido = /^(\/p|\/pd|\/b|\/z|\/t|\/l|\/a|\/resumo)/;
  if (!comandoValido.test(text)) return;

  const diaData = getDia();

  // ===== PLANOS =====
  if (text.startsWith('/p ')) {
    const partes = text.slice(3).split('/');
    const [clinica, paciente, sistema, exame, obs] = partes.map(p => p?.trim());

    let frase;

    if (exame) {
      frase = `Ver se ${capitalizar(clinica)} lançou o ${exame} de ${capitalizar(paciente)} no ${capitalizar(sistema)}`;
    } else if (sistema) {
      frase = `Ver se ${capitalizar(clinica)} lançou ${capitalizar(paciente)} no ${capitalizar(sistema)}`;
    } else {
      frase = `Ver com ${capitalizar(clinica)} sobre ${capitalizar(paciente)}`;
    }

    if (obs) frase += ` (${obs})`;

    diaData.planos.push(frase);
    salvar();
  }

  // ===== PENDENCIAS =====
  if (text.startsWith('/pd ')) {
    const partes = text.slice(4).split('/');
    const [clinica, paciente, exame, obs] = partes.map(p => p?.trim());

    let frase = `Ver com ${capitalizar(clinica)} sobre ${exame || ''} de ${capitalizar(paciente)}`;
    if (obs) frase += ` (${obs})`;

    diaData.pendencias.push(frase);
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

  // ===== RESUMO HOJE =====
  if (text === '/resumo') {
    const diaISO = hoje();
    const diaBR = hojeBR();
    const d = getDia(diaISO);

    let resposta = `PENDÊNCIAS ${diaBR}\n`;

    function addSecao(titulo, lista) {
      if (lista.length > 0) {
        resposta += `\n${titulo}\n`;
        lista.forEach(p => resposta += `- ${p}\n`);
      }
    }

    addSecao("PENDÊNCIAS", d.pendencias);
    addSecao("PLANOS", d.planos);
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

    function addSecao(titulo, lista) {
      if (lista.length > 0) {
        resposta += `\n${titulo}\n`;
        lista.forEach(p => resposta += `- ${p}\n`);
      }
    }

    addSecao("PENDÊNCIAS", d.pendencias);
    addSecao("PLANOS", d.planos);
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