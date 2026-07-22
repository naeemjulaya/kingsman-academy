const descriptions: Record<string, string> = {
  "alga": "Estudo da diversidade, morfologia, classificação e importância ecológica das algas, com ligação aos ecossistemas aquáticos e às suas aplicações biológicas e económicas.",
  "algebra linear": "Explore matrizes, determinantes, sistemas de equações lineares, espaços vetoriais e transformações lineares, desenvolvendo bases sólidas para a resolução de problemas científicos e de engenharia.",
  "analise matematica": "Desenvolva o domínio de limites, derivadas, integrais e equações diferenciais através de uma abordagem rigorosa, prática e orientada para a resolução de exercícios.",
  "analise matematica ii": "Aprofunde cálculo integral, equações diferenciais e séries, consolidando técnicas essenciais para a modelação e resolução de problemas de engenharia.",
  "bioestatistica": "Aprenda a organizar, analisar e interpretar dados biológicos e de saúde, aplicando probabilidade, inferência estatística e testes de hipóteses a situações reais.",
  "bioquimica": "Compreenda as bases moleculares da vida, desde a estrutura e função das biomoléculas até às principais vias metabólicas e aos mecanismos de regulação celular.",
  "bioquimica i": "Estude a estrutura e função de proteínas, enzimas, hidratos de carbono, lípidos e ácidos nucleicos, construindo uma base sólida para compreender o metabolismo celular.",
  "electronica analogica": "Compreenda o funcionamento de díodos, transístores, amplificadores e circuitos analógicos, combinando fundamentos teóricos com análise e resolução prática de circuitos.",
  "eletronica analogica": "Compreenda o funcionamento de díodos, transístores, amplificadores e circuitos analógicos, combinando fundamentos teóricos com análise e resolução prática de circuitos.",
  "electronica digital": "Aprenda sistemas de numeração, álgebra booleana, portas lógicas e circuitos combinatórios e sequenciais, desenvolvendo fundamentos essenciais para sistemas digitais.",
  "eletronica digital": "Aprenda sistemas de numeração, álgebra booleana, portas lógicas e circuitos combinatórios e sequenciais, desenvolvendo fundamentos essenciais para sistemas digitais.",
  "entomologia": "Conheça a diversidade, anatomia, fisiologia, classificação e ecologia dos insetos, incluindo a sua importância agrícola, ambiental, económica e sanitária.",
  "fisica": "Consolide os princípios fundamentais da mecânica, energia, oscilações, ondas, termodinâmica e eletromagnetismo através de explicações claras e exercícios aplicados.",
  "fisiologia animal": "Compreenda o funcionamento integrado dos sistemas animais, explorando os mecanismos de regulação, adaptação e manutenção do equilíbrio fisiológico dos organismos.",
  "quimica organica": "Domine a estrutura, nomenclatura, propriedades e reatividade dos compostos orgânicos, com enfoque em mecanismos de reação, síntese e resolução de exercícios.",
};

function normalizeCourseName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function getCourseDescription(name: string, databaseDescription?: string | null) {
  const savedDescription = databaseDescription?.trim();
  if (savedDescription) return savedDescription;

  return descriptions[normalizeCourseName(name)]
    ?? "Conheça os conteúdos fundamentais desta cadeira com explicações estruturadas, acompanhamento próximo e exercícios orientados para o sucesso académico.";
}
