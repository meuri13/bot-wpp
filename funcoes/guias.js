const { capitalizar } = require('./util');

function adicionarGuia(lista, paciente) {
  if (!paciente) return lista;

  lista.push(capitalizar(paciente.trim()));

  return lista;
}

function montarGuia(lista, laboratorio) {
  if (!lista || lista.length === 0) return null;

  const pacientes = lista.map(capitalizar);

  let nomes;

  if (pacientes.length === 1) {
    nomes = pacientes[0];
  } else if (pacientes.length === 2) {
    nomes = `${pacientes[0]} e ${pacientes[1]}`;
  } else {
    nomes = `${pacientes.slice(0, -1).join(', ')} e ${pacientes[pacientes.length - 1]}`;
  }

  const artigo = pacientes.length === 1 ? 'a guia' : 'as guias';

  return `Fazer ${artigo} de ${nomes} no ${laboratorio}`;
}

module.exports = {
  adicionarGuia,
  montarGuia
};