// ====================================================================
// App-Tria | script.js
// Lógica de Triagem e Encaminhamento de Saúde (UBS, UPA, Emergência)
// ====================================================================

// Array de perguntas focado em triagem e orientação de serviço (UBS, UPA, Emergência)
const quizData = [
    {
        question: "1. Qual dos seguintes sintomas você está sentindo AGORA?",
        options: [
            { text: "Febre baixa (até 38°C), dor de garganta leve ou dor de cabeça discreta.", type: "UBS" },
            { text: "Febre alta (acima de 39°C), vômitos persistentes ou dor abdominal moderada.", type: "UPA" },
            { text: "Dor no peito, falta de ar súbita, sangramento grave ou perda de consciência.", type: "EMERGENCIA" },
        ],
    },
    {
        question: "2. Se você tem tosse, qual a característica principal?",
        options: [
            { text: "Tosse seca ou leve, sem dificuldade de respirar. ", type: "UBS" },
            { text: "Tosse com secreção amarelada/esverdeada e febre que não passa. ", type: "UPA" },
            { text: "Não tenho tosse ou tenho falta de ar imediata.", type: "NEXT" },
        ],
    },
    {
        question: "3. Você está com dor. Descreva a intensidade e o início:",
        options: [
            { text: "Dor leve/moderada, que eu controlo com analgésicos comuns.", type: "UBS" },
            { text: "Dor moderada a forte, que não melhora e limita minhas atividades.", type: "UPA" },
            { text: "Dor súbita, insuportável e intensa (ex: dor de cabeça explosiva ou dor abdominal aguda).", type: "EMERGENCIA" },
        ],
    },
    {
        question: "4. Seu objetivo principal hoje é:",
        options: [
            { text: "Renovar receitas, pegar vacinas ou fazer exames de rotina.", type: "UBS" },
            { text: "Avaliar um quadro agudo (doença que começou agora).", type: "NEXT" },
        ],
    },
    {
        question: "5. Seus sintomas começaram há quanto tempo?",
        options: [
            { text: "Há mais de 5 dias e estão estáveis/melhorando lentamente.", type: "UBS" },
            { text: "Nas últimas 48 horas e estão piorando rápido.", type: "UPA" },
            { text: "Menos de 24 horas, mas parecem risco de vida (dor intensa).", type: "EMERGENCIA" },
        ],
    },
];

// Mapeamento dos resultados (Onde o paciente deve ir)
const resultsMap = {
    "UBS": {
        title: "Recomendação: Unidade Básica de Saúde (UBS)",
        message: "Seu caso é classificado como de BAIXA COMPLEXIDADE. A UBS é o local ideal para acompanhamento de doenças crônicas, vacinas, exames de rotina e sintomas leves. Procure o seu posto de saúde mais próximo.",
        color: "#28a745" // Verde
    },
    "UPA": {
        title: "Recomendação: Unidade de Pronto Atendimento (UPA)",
        message: "Seu caso é de MÉDIA COMPLEXIDADE e requer atenção rápida. A UPA tem capacidade para resolver a maioria das urgências, como febre persistente, vômitos, ou suturas de cortes leves.",
        color: "#ffc107" // Amarelo/Laranja
    },
    "EMERGENCIA": {
        title: "Recomendação: EMERGÊNCIA HOSPITALAR (Chame o SAMU/192)",
        message: "Seu caso é de ALTA COMPLEXIDADE. Dor no peito, falta de ar, sangramento incontrolável ou perda de consciência exigem atendimento IMEDIATO no hospital. Não dirija, chame o serviço de emergência.",
        color: "#dc3545" // Vermelho
    }
};

let currentQuestionIndex = 0;
let userResult = ""; 
let quizEnded = false;

// Referências aos elementos do HTML
const questionTextElement = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextButton = document.getElementById('next-button');
const quizSection = document.getElementById('quiz');
const resultSection = document.getElementById('result');

// Nota: Removendo scoreDisplay e totalQuestionsDisplay, pois não são relevantes para triagem

// --- Funções Principais ---

function startQuiz() {
    currentQuestionIndex = 0;
    userResult = "";
    quizEnded = false;
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
    nextButton.textContent = "Próxima Pergunta"; // Reseta o texto do botão
    
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

    // 1. Remove o destaque 'selected' e desabilita todos os botões
    Array.from(optionsContainer.children).forEach(button => {
        button.disabled = true;
        button.classList.remove('selected'); // LIMPA o estilo de seleção anterior
    });
    
    // 2. Adiciona o destaque 'selected' ao botão clicado
    selectedButton.classList.add('selected');

    // Armazena o resultado. 
    userResult = selectedType;
    
    // Habilita o botão para avançar (ou finalizar)
    nextButton.disabled = false;
    
    // Atualiza o texto do botão de acordo com a escolha
    if (userResult !== "NEXT" || currentQuestionIndex === quizData.length - 1) {
        nextButton.textContent = "Ver Recomendação";
    } else {
        nextButton.textContent = "Próxima Pergunta";
    }
}

function nextQuestion() {
    
    // Se o resultado for uma emergência ou UBS/UPA (não for 'NEXT'), finaliza
    if (userResult !== "NEXT") {
        endQuiz(userResult);
        return;
    }
    
    // Avança para a próxima pergunta
    currentQuestionIndex++;
    
    // Verifica se há mais perguntas
    if (currentQuestionIndex < quizData.length) {
        loadQuestion();
    } else {
        // Se todas as perguntas foram respondidas e o último foi 'NEXT', 
        // mas não chegou em um final específico, assume-se UBS (o mais seguro)
        endQuiz("UBS"); 
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
    
    // O innerHTML é atualizado na tag <p> com id="result-message-text"
    document.getElementById('result-message-text').innerHTML = `
        ${resultData.message}
        <br><br>
        **Lembre-se: Em caso de dúvida, procure o serviço de saúde mais próximo.**
    `;

    // Garante que o display de pontuação seja ocultado no CSS
}

// --- Event Listeners e Inicialização ---

nextButton.addEventListener('click', nextQuestion);

// Inicia o quiz ao carregar a página
startQuiz();