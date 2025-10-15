// Array de perguntas focado em triagem e orientação de serviço (UBS, UPA, Emergência)
const quizData = [
    {
        question: "Qual dos seguintes sintomas você está sentindo AGORA?",
        options: [
            { text: "Febre baixa (até 38°C), dor de garganta leve ou dor de cabeça discreta.", type: "UBS" },
            { text: "Febre alta (acima de 39°C), vômitos persistentes ou dor abdominal moderada.", type: "UPA" },
            { text: "Dor no peito, falta de ar súbita, sangramento grave ou perda de consciência.", type: "EMERGENCIA" },
        ],
    },
    {
        question: "Seus sintomas começaram há quanto tempo?",
        options: [
            { text: "Mais de 3 dias.", type: "UBS" },
            { text: "Nas últimas 24 a 48 horas e estão piorando rápido.", type: "UPA" },
            { text: "Menos de 24 horas, mas parecem risco de vida (dor intensa).", type: "EMERGENCIA" },
        ],
    },
    {
        question: "Você precisa de receita ou acompanhamento para doença crônica (Diabetes, Hipertensão, etc.)?",
        options: [
            { text: "Sim, é a minha única necessidade hoje.", type: "UBS" },
            { text: "Não. Estou com um quadro agudo (doença nova).", type: "NEXT" }, // Manda para próxima pergunta
        ],
    },
    // Se precisar de mais perguntas, adicione aqui...
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
let userResult = ""; // Irá armazenar o tipo de recomendação final
let quizEnded = false;

// Referências aos elementos do HTML
const questionTextElement = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextButton = document.getElementById('next-button');
const quizSection = document.getElementById('quiz');
const resultSection = document.getElementById('result');
const scoreDisplay = document.getElementById('score-display');
const totalQuestionsDisplay = document.getElementById('total-questions-display');

// --- Funções Principais ---

function startQuiz() {
    currentQuestionIndex = 0;
    userResult = "";
    quizEnded = false;
    resultSection.classList.add('hidden');
    quizSection.classList.remove('hidden');
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

    // Desabilita todos os botões após a escolha
    Array.from(optionsContainer.children).forEach(button => {
        button.disabled = true;
        // Marca a opção escolhida visualmente (opcional, pode ser adaptado)
        if (button !== selectedButton) {
             button.style.opacity = '0.7';
        }
    });
    
    // Armazena o resultado. Se o tipo não for "NEXT", o quiz pode encerrar.
    userResult = selectedType;
    
    // Habilita o botão para avançar (ou finalizar)
    nextButton.disabled = false;
    
    // Atualiza o texto do botão
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
    resultSection.querySelector('p').innerHTML = `
        ${resultData.message}
        <br><br>
        **Lembre-se: Em caso de dúvida, procure o serviço de saúde mais próximo.**
    `;

    // Remove o display de pontuação que não é necessário neste tipo de quiz
    // scoreDisplay.textContent = 0; 
    // totalQuestionsDisplay.textContent = quizData.length;
}

// --- Event Listeners e Inicialização ---

nextButton.addEventListener('click', nextQuestion);

// Inicia o quiz ao carregar a página
startQuiz();