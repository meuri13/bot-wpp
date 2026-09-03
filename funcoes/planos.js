const aplicarExames = require('./exames');

const { capitalizar } = require('./util');

function montarPlano(clinica, paciente, sistema, exame, obs) {
  let frase;

  const infoExame = aplicarExames(exame);

  if (infoExame) {
    const artigo = infoExame.artigo2 || infoExame.artigo;

    frase = `Ver se ${capitalizar(clinica)} lançou ${artigo} ${infoExame.nome} de ${capitalizar(paciente)} no ${capitalizar(sistema)}`;
  } else if (exame && exame !== '-') {
    frase = `Ver se ${capitalizar(clinica)} lançou o ${exame} de ${capitalizar(paciente)} no ${capitalizar(sistema)}`;
  } else if (sistema && sistema !== '-') {
    frase = `Ver se ${capitalizar(clinica)} lançou ${capitalizar(paciente)} no ${capitalizar(sistema)}`;
  } else {
    frase = `Ver com ${capitalizar(clinica)} sobre ${capitalizar(paciente)}`;
  }

  if (obs) frase += ` (${obs})`;

  return frase;
}

module.exports = {
  montarPlano
};