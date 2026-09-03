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

async function reagir(client, msg) {
  try {
    console.log("Tentando reagir...");
    await client.sendReaction(msg.id.$1, '✅');
    console.log("Reação enviada");
  } catch (error) {
    console.log("Erro ao reagir");
    console.error(error);
  }
}


module.exports = {
  capitalizar,
  hoje,
  hojeBR,
  reagir
};