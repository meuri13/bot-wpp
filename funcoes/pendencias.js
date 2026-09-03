const aplicarExames = require('./exames');

const { capitalizar } = require('./util');

function montarPendencia(clinica, paciente, exame, obs) {
  let frase;

  const infoExame = aplicarExames(exame);

  // Pendência interna (sem clínica)
  if (clinica === "-") {

    if (infoExame) {
      frase = `${infoExame.acao} ${infoExame.artigo} ${infoExame.nome} de ${capitalizar(paciente)}`;
    } else if (exame && exame !== "-") {
      frase = `${capitalizar(exame)} de ${capitalizar(paciente)}`;
    } else {
      frase = `Ver sobre ${capitalizar(paciente)}`;
    }

  }

  // Pendência com clínica
  else {

    if (infoExame) {
      const artigo = infoExame.artigo2 || infoExame.artigo;

      frase = `Ver com ${capitalizar(clinica)} sobre ${artigo} ${infoExame.nome} de ${capitalizar(paciente)}`;
    } else if (exame && exame !== "-") {
      frase = `Ver com ${capitalizar(clinica)} sobre ${exame} de ${capitalizar(paciente)}`;
    } else {
      frase = `Ver com ${capitalizar(clinica)} sobre ${capitalizar(paciente)}`;
    }

  }

  if (obs) frase += ` (${obs})`;

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