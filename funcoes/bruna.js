const aplicarExames = require('./exames');

const { capitalizar } = require('./util');

function montarBruna(paciente, sistema, exame, obs) {
  let frase;

  const infoExame = aplicarExames(exame);

  if (infoExame && sistema && sistema !== '-') {
    const artigo = infoExame.artigo2 || infoExame.artigo;

    frase = `Ver se lançou ${artigo} ${infoExame.nome} de ${capitalizar(paciente)} no ${capitalizar(sistema)}`;
  } else if (infoExame) {
    const artigo = infoExame.artigo2 || infoExame.artigo;

    frase = `Ver se lançou ${artigo} ${infoExame.nome} de ${capitalizar(paciente)}`;
  } else if (exame && exame !== '-') {
    frase = `Ver se lançou o ${exame} de ${capitalizar(paciente)}`;
  } else if (sistema && sistema !== '-') {
    frase = `Ver se lançou ${capitalizar(paciente)} no ${capitalizar(sistema)}`;
  } else {
    frase = `Ver sobre ${capitalizar(paciente)}`;
  }

  if (obs && obs !== '-') frase += ` (${obs})`;

  return frase;
}

module.exports = {
  montarBruna
};