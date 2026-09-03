

  const atalhos = {
    //CLINICAS
    "amg" : "Amigo Bicho",
    "bs":"Bruna Souza",
    "cia": "Cia do Animal",
    "ceme":"Cemevet",
    "cemep":"Cemevet prado",
    "center":"Pet Center",
    "cmv":"CMV melo",
    "deng":"Dengosso",
    "dia":"Diamante Pet",
    "eco": "Ecopet Aldeia",
    "ecozn":"Ecopet Zn",
    "filho":"Pet Filhos",
    "friend":"Pet Friends",
    "friendly":"Dra. Pet Friendly",
    "king":"King Pet",
    "mania":"Bicho Mania",
    "poli":"Polivet",
    "quintal": "Quintal Pet",
    "renata":"Renata Torres",
    "samara":"Samara Viana",
    "town": "Pet Town",
    "villa":"Villa Pet",

    //PLANOS
    "eup":"Eu Pet",
    "pt":"Pet top",
    "pla":"Plamev",
    "plo":"Pet love",
    "ah":"AuHappy",
    
  };

  function aplicarAtalhos(texto) {
  if (!texto) return texto;
  
  const chave = texto.toLowerCase().trim();

  return atalhos[chave] || texto;
}

module.exports = aplicarAtalhos;