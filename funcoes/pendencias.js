const aplicarExames = require('./exames');

const { 
  capitalizar,
  formatarListaPacientes
 } = require('./util');

// Exemplo em pendencias.js
function montarPendencia(clinica, paciente, exame, obs) {
  let frase;
  const pacientesFormatados = formatarListaPacientes(paciente);
  const infoExame = aplicarExames(exame);

  if (clinica === "-") {
    if (infoExame) {
      frase = infoExame.acao + ' ' + infoExame.artigo + ' ' + infoExame.nome + ' de ' + pacientesFormatados;
    } else if (exame && exame !== "-") {
      frase = capitalizar(exame) + ' de ' + pacientesFormatados;
    } else {
      frase = 'Ver sobre ' + pacientesFormatados;
    }
  } else {
    if (infoExame) {
      const artigo = infoExame.artigo2 || infoExame.artigo;
      frase = 'Ver com ' + capitalizar(clinica) + ' sobre ' + artigo + ' ' + infoExame.nome + ' de ' + pacientesFormatados;
    } else if (exame && exame !== "-") {
      frase = 'Ver com ' + capitalizar(clinica) + ' sobre ' + exame + ' de ' + pacientesFormatados;
    } else {
      frase = 'Ver com ' + capitalizar(clinica) + ' sobre ' + pacientesFormatados;
    }
  }

  if (obs) frase += ' (' + obs + ')';
  return frase;
}

function criarPendencia({ texto, clinica = '', paciente = '', sistema = '', exame = '', obs = '' }) {
  return {
    texto,
    clinica,
    paciente,
    sistema,
    exame,
    obs
  };
}

module.exports = {
  montarPendencia,
  criarPendencia
};