function capitalizar(txt = '') {
  if (!txt) return '';
  return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
}

function hoje() {
  const d = new Date();

  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function hojeBR() {
  const d = new Date();
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  });
}

// Converte DD/MM/AAAA, DD/MM/AA ou DD/MM para YYYY-MM-DD (formato do dados.json)
function converterParaISO(dataTexto) {
  if (!dataTexto) return hoje();

  let limpo = dataTexto.trim().replace(/-/g, '/');
  let partes = limpo.split('/');

  // Se digitar apenas DD/MM, insere o ano atual
  if (partes.length === 2) {
    const anoAtual = new Date().getFullYear();
    partes.push(anoAtual);
  }

  if (partes.length === 3) {
    let dia = partes[0].padStart(2, '0');
    let mes = partes[1].padStart(2, '0');
    let ano = partes[2].length === 2 ? `20${partes[2]}` : partes[2];
    return `${ano}-${mes}-${dia}`;
  }

  return dataTexto;
}

async function reagir(client, msg, emoji = '✅') {
  try {
    await client.sendReaction(msg.id._serialized, emoji);
  } catch (error) {
    console.log("Erro ao reagir:", error.message);
  }
}


module.exports = {
  capitalizar,
  hoje,
  hojeBR,
  converterParaISO,
  reagir
};