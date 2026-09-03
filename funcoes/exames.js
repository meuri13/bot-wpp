const exames = {
    //bioquímicos
    "bioqs":{
      nome: "bioquímicos",
      artigo: "os",
      acao: "Rodar"
    },
    "bioq":{
      nome: "bioquímico",
      artigo: "o",
      acao: "Rodar"
    }, 
    "ggt": {
      nome: "GGT",
      artigo: "a",
      acao: "Repetir"
    },
    "tgp": {
      nome: "TGP",
      artigo: "a",
      acao: "Repetir"
    },
    "tgo": {
      nome: "TGO",
      artigo: "o",
      acao: "Repetir"
    },
    "ur":{
      nome: "ureia",
      artigo: "a",
      acao: "Repetir"
    },
    "creat":{
      nome: "creatinina",
      artigo: "a",
      acao: "Repetir"
    },
    "gli":{
      nome: "glicose",
      artigo: "a",
      acao: "rodar"
    },
    "bili":{
      nome: "bilirrubina",
      artigo: "a",
      acao: "Rodar"
    },
    "fal":{
      nome: "FALC",
      artigo: "a",
      acao: "Repetir"
    },

    //hemograma+testes etc
    "hemo": {
      nome: "hemograma",
      artigo: "de",
      artigo2: "o",
      acao: "Ler a lâmina"
    },
    "coag":{
      nome: "coagulograma",
      artigo: "o",
      acao: "Fazer"
    },
    "4dx":{
      nome: "4DX",
      artigo: "o",
      acao: "Fazer"
    },
    "fiv":{
      nome: "Fiv/Felv",
      artigo: "o",
      acao: "Fazer"
    },

    //citologia
    "cito":{
      nome: "citologia",
      artigo: "a",
      acao: "Ler"
    },
    "citoc":{
      nome: "citologia de ouvido",
      artigo: "a",
      acao: "Ler"
    },
    "citoe":{
      nome: "citologia de esporo",
      artigo: "a",
      acao: "Ler"
    },

    //fezes
    "pfez":{
      nome: "parasitológico",
      artigo: "o",
      acao: "Fazer"
    },

    //externos
    "pcr": {
      nome: "PCR",
      artigo: "pra",
      acao: "Separar o material"
    },
};
  
function aplicarExames(texto) {
  if (!texto) return null;

  const chave = texto.toLowerCase().trim();

  return exames[chave] || null;
}

module.exports = aplicarExames;