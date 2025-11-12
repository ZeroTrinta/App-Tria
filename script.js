// ====================================================================
// App-Tria | script.js - PARTE 1: Dados e Variáveis
// Lógica de Triagem Inteligente (Pontuação de Risco)
// ====================================================================

// Array de perguntas focado em triagem e orientação de serviço (UBS, UPA, Emergência)
const quizData = [
    {
        question: "1. Qual dos seguintes sintomas você está sentindo AGORA?",
        options: [
            { text: "Febre baixa (até 38°C), dor de garganta leve, tosse ou dor de cabeça discreta.", type: "UBS" },
            { text: "Febre alta (acima de 39°C), vômitos persistentes, dores de cabeça moderada a forte (enxaqueca) ou dor abdominal moderada.", type: "UPA" },
            { text: "Dor no peito, falta de ar súbita, sangramento grave ou perda de consciência.", type: "EMERGENCIA" },
        ],
    },
    {
        question: "2. Se você tem tosse, qual a característica principal?",
        options: [
            { text: "Tosse seca ou leve, sem dificuldade de respirar. ", type: "UBS" },
            { text: "Tosse seca ou leve, com falta de ar leve. ", type: "UBS" },
            { text: "Tosse com secreção amarelada/esverdeada e febre que não passa. ", type: "UPA" },
            { text: "Tosse com secreção amarelada/esverdeada sem febre aparente. ", type: "UPA" },
            { text: "Não tenho tosse ou tenho falta de ar imediata.", type: "NEXT" },
        ],
    },
    {
        question: "3. Você está com dor? Descreva a intensidade e o início:",
        options: [
            { text: "Dor leve/moderada, que eu controlo com analgésicos comuns.", type: "UBS" },
            { text: "Dor moderada a forte, que não melhora e limita minhas atividades.", type: "UPA" },
            { text: "Dor súbita, insuportável e intensa (ex: dor de cabeça explosiva ou dor abdominal aguda).", type: "EMERGENCIA" },
            { text: "Não tenho dor", type: "NEXT" },
        ],
    },
    {
        question: "4. Seu objetivo principal hoje é:",
        options: [
            { text: "Renovar receitas, tomar vacinas ou fazer exames de rotina.", type: "UBS" },
            { text: "Avaliar um quadro agudo (doença que começou agora).", type: "NEXT" },
        ],
    },
    {
        question: "5. Seus sintomas começaram há quanto tempo?",
        options: [
            { text: "Há mais de 5 dias e estão estáveis/melhorando lentamente.", type: "UBS" },
            { text: "Nas últimas 48 horas e estão piorando rápido.", type: "UPA" },
            { text: "Menos de 24 horas, incapacitante/dor intensa.", type: "EMERGENCIA" },
        ],
    },
];

// Mapeamento dos resultados (Onde o paciente deve ir)
const resultsMap = {
    // Definimos a pontuação de risco para cada tipo de resposta
    "UBS": {
        title: "Recomendação: Unidade Básica de Saúde (UBS)",
        message: "Seu caso é classificado como de BAIXA COMPLEXIDADE. A UBS é o local ideal para acompanhamento de doenças crônicas, vacinas, exames de rotina e sintomas leves. Procure o seu posto de saúde mais próximo.",
        color: "#28a745",
        score: 1 
    },
    "UPA": {
        title: "Recomendação: Unidade de Pronto Atendimento (UPA)",
        message: "Seu caso é de MÉDIA COMPLEXIDADE e requer atenção rápida. A UPA tem capacidade para resolver a maioria das urgências, como febre persistente, vômitos ou suturas de cortes leves.",
        color: "#ffc107",
        score: 5
    },
    "EMERGENCIA": {
        title: "Recomendação: EMERGÊNCIA HOSPITALAR (Chame o SAMU/192)",
        message: "Seu caso é de ALTA COMPLEXIDADE. Dor no peito, falta de ar, sangramento incontrolável ou perda de consciência exigem atendimento IMEDIATO no hospital. Não dirija, chame o serviço de emergência. Não mova o paciente em caso de acidente/inconsciência.",
        color: "#dc3545ff",
        score: 100 // Pontuação alta, aciona o fim imediato
    },
    "NEXT": { // Tipo para continuar o quiz sem acumular risco (neutro)
        score: 0 
    }
};

let currentQuestionIndex = 0;
let userResult = ""; 
let quizEnded = false;
let riskScore = 0; // Variável para acumular a pontuação de risco

// Referências aos elementos do HTML
const questionTextElement = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextButton = document.getElementById('next-button');
const quizSection = document.getElementById('quiz');
const resultSection = document.getElementById('result');

// ====================================================================
// App-Tria | script.js - PARTE 2: Funções e Lógica
// Implementação do fluxo e da pontuação
// ====================================================================

// --- Funções Principais ---

function startQuiz() {
    currentQuestionIndex = 0;
    userResult = "";
    quizEnded = false;
    riskScore = 0; // ZERA PONTUAÇÃO DE RISCO
    resultSection.classList.add('hidden');
    quizSection.classList.remove('hidden');
    
    // Configura o texto do resultado para o HTML
    document.getElementById('result-message-text').innerHTML = '';

    loadQuestion();
}

function loadQuestion() {
    const currentQuestion = quizData[currentQuestionIndex];
    
    // Atualiza o texto da pergunta
    questionTextElement.textContent = currentQuestion.question;
    
    // Limpa as opções anteriores
    optionsContainer.innerHTML = '';
    
    // Desabilita o botão "Próxima Pergunta" até que uma opção seja escolhida
    nextButton.disabled = true; 
    nextButton.textContent = "Próxima Pergunta"; 
    
    // Cria os botões de opção
    currentQuestion.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option.text;
        button.classList.add('option-button');
        button.dataset.type = option.type; // Armazena o tipo de triagem
        
        // Adiciona o evento de clique
        button.addEventListener('click', selectOption);
        optionsContainer.appendChild(button);
    });
}

function selectOption(e) {
    if (quizEnded) return;

    const selectedButton = e.target;
    const selectedType = selectedButton.dataset.type;

    // 1. Permite a mudança de seleção:
    Array.from(optionsContainer.children).forEach(button => {
        button.classList.remove('selected'); 
        button.disabled = false; // Permite o clique em outro botão
    });
    
    // 2. Adiciona o destaque 'selected' ao botão clicado
    selectedButton.classList.add('selected');

    // Armazena o tipo para a lógica do botão 'Ver Recomendação'
    userResult = selectedType; 
    
    nextButton.disabled = false;
    
    // Atualiza o texto do botão de acordo com a escolha (se for Emergência, termina)
    if (selectedType === "EMERGENCIA" || currentQuestionIndex === quizData.length - 1) {
        nextButton.textContent = "Ver Recomendação";
    } else {
        nextButton.textContent = "Próxima Pergunta";
    }
}

function nextQuestion() {
    
    // Garante que uma opção foi selecionada antes de prosseguir
    const selectedOption = optionsContainer.querySelector('.selected');
    if (!selectedOption) {
        alert("Por favor, selecione uma opção para continuar.");
        return;
    }

    const selectedType = selectedOption.dataset.type;
    
    // 1. ACUMULAR A PONTUAÇÃO DE RISCO:
    // Pega a pontuação do tipo selecionado e adiciona ao score total
    riskScore += resultsMap[selectedType].score; 

    // 2. TRATAMENTO DE FIM IMEDIATO (EMERGÊNCIA)
    if (selectedType === "EMERGENCIA") {
        endQuiz("EMERGENCIA");
        return;
    }
    
    // 3. AVANÇA PARA A PRÓXIMA PERGUNTA
    currentQuestionIndex++;
    
    if (currentQuestionIndex < quizData.length) {
        loadQuestion();
    } else {
        // 4. FIM DO QUIZ: Usa a pontuação acumulada para definir o resultado final
        
        let finalType = "";
        
        // Se a pontuação acumulada for 7 ou mais, o caso é de UPA (média complexidade)
        if (riskScore >= 7) { 
            finalType = "UPA";
        } else {
            // Caso contrário, o risco é baixo ou neutro, e a UBS é suficiente
            finalType = "UBS"; 
        }
        
        endQuiz(finalType);
    }
}

function endQuiz(finalType) {
    quizEnded = true;
    quizSection.classList.add('hidden');
    resultSection.classList.remove('hidden');

    const resultData = resultsMap[finalType];
    
    // Atualiza o conteúdo da seção de resultado com a recomendação
    resultSection.querySelector('h2').textContent = resultData.title;
    resultSection.querySelector('h2').style.color = resultData.color;
    
    // Atualiza a mensagem na tag <p> com id="result-message-text"
    document.getElementById('result-message-text').innerHTML = `
        ${resultData.message}
        <br><br>
        **Sua pontuação de risco foi: ${riskScore}**
        <br><br>
        **Lembre-se: Em caso de dúvida, procure o serviço de saúde mais próximo.**
    `;
}

// --- Event Listeners e Inicialização ---

nextButton.addEventListener('click', nextQuestion);

// Inicia o quiz ao carregar a página
startQuiz();