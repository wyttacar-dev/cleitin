export const chargeStyles = {
  leve: {
    label: "Leve",
    description: "Cobranças gentis, sem drama.",
    phrases: [
      "Passando para lembrar dessa tarefa.",
      "Um passinho agora deixa o dia mais leve.",
      "Sua tarefa está te esperando com paciência.",
      "Bora cuidar disso sem pressa, mas sem sumir.",
    ],
  },
  motivador: {
    label: "Motivador",
    description: "Energia de treinador com café.",
    phrases: [
      "Você consegue fechar essa agora.",
      "Missão pequena, vitória grande. Vai lá.",
      "Seu eu do futuro vai agradecer essa entrega.",
      "Foco no próximo clique: concluir.",
    ],
  },
  acido: {
    label: "Ácido",
    description: "Sinceridade com risada de canto.",
    phrases: [
      "Essa tarefa não vai se fazer sozinha.",
      "Você marcou como importante e agora está ignorando?",
      "Bora resolver isso antes que vire lenda.",
      "A tarefa envelheceu mais rápido que sua desculpa.",
    ],
  },
  ignorante: {
    label: "Ignorante engraçado",
    description: "Bronca teatral, zero elegância.",
    phrases: [
      "Ei, campeão da procrastinação, mexe essa agenda.",
      "A tarefa está atrasada e já pediu reconhecimento de firma.",
      "Levanta esse dedo e conclui logo, lenda urbana.",
      "Seu pet está julgando em silêncio. Mentira, é em voz alta.",
    ],
  },
};

export const smartPhrases = {
  upcoming: {
    leve: "Ei, so passando pra lembrar da sua tarefa.",
    motivador: "Bora, essa tarefa te aproxima do seu objetivo.",
    acido: "Voce marcou isso como importante e agora esta fingindo que esqueceu?",
    ignorante: "Meu parceiro, a tarefa esta chegando. Vai fazer bonito ou vai decorar a lista?",
  },
  overdue: {
    leve: "Essa tarefa passou do horario. Ainda da para recuperar.",
    motivador: "Atrasou, mas nao acabou. Fecha essa agora e volta para o jogo.",
    acido: "A tarefa era pra agora. Bora parar de enrolar.",
    ignorante: "Meu parceiro, a tarefa ja criou raiz ai. Vai fazer ou vai adotar ela?",
  },
  completed: {
    leve: "Boa. Uma tarefa a menos pesando na cabeca.",
    motivador: "Isso. Missao concluida e XP na conta.",
    acido: "Finalmente. O Cleitin ja estava preparando o julgamento.",
    ignorante: "Agora sim. Milagre operacional detectado.",
  },
  multipleOverdue: {
    leve: "Tem varias tarefas atrasadas. Escolhe uma e comeca pequeno.",
    motivador: "Varias atrasaram, mas da para retomar. Prioriza a mais importante.",
    acido: "A fila atrasou e a desculpa nao vai organizar nada.",
    ignorante: "Tem tarefa fazendo condominio ai. Resolve uma antes que vire bairro.",
  },
  inactive: {
    leve: "Passei para ver se voce ainda esta no plano de hoje.",
    motivador: "Volta aqui e fecha a proxima missao. Seu dia ainda rende.",
    acido: "Sumiu do app e achou que o Cleitin nao ia notar?",
    ignorante: "Abre o app, meu parceiro. A produtividade nao vai brotar no susto.",
  },
};

export function pickPhrase(style = "leve", seed = Date.now()) {
  const list = chargeStyles[style]?.phrases ?? chargeStyles.leve.phrases;
  return list[Math.abs(seed) % list.length];
}

export function pickSmartPhrase(type, style = "leve") {
  return smartPhrases[type]?.[style] ?? smartPhrases[type]?.leve ?? pickPhrase(style);
}
