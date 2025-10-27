// =======================================================
// VARIÁVEIS DE CONFIGURAÇÃO E ELEMENTOS DO DOM
// =======================================================

// URLs e Paths
const BASE_URL = 'https://demon-slayer-api.onrender.com/v1/'; 
const PLACEHOLDER_IMG = './imgs/placeholder.jpg'; // **VERIFIQUE:** Nome e caminho do seu placeholder!

// Elementos da seção Personagens
const personagemSearchInput = document.getElementById('personagem-search-input');
const personagemSearchButton = document.getElementById('personagem-search-button');
const personagemNameDisplay = document.getElementById('personagem-name');
const personagemDetailsDisplay = document.getElementById('personagem-details');
const personagemImage = document.getElementById('personagem-image');

// Elementos da seção Respirações
const respiracaoSearchInput = document.getElementById('respiracao-search-input');
const respiracaoSearchButton = document.getElementById('respiracao-search-button');
const respiracaoNameDisplay = document.getElementById('respiracao-name');
const respiracaoDetailsDisplay = document.getElementById('respiracao-details');
const respiracaoImage = document.getElementById('respiracao-image');

// Elementos da seção Onis
const oniSearchInput = document.getElementById('oni-search-input');
const oniSearchButton = document.getElementById('oni-search-button');
const oniNameDisplay = document.getElementById('oni-name');
const oniDetailsDisplay = document.getElementById('oni-details');
const oniImage = document.getElementById('oni-image');


// =======================================================
// FUNÇÕES DE UTILIDADE E FORMATAÇÃO
// =======================================================

/**
 * Normaliza o nome para ser usado na URL da API (Substitui espaço por underline, remove acentos).
 * @param {string} name - O nome a ser normalizado.
 * @returns {string} O nome normalizado (ex: 'Giyu Tomioka' -> 'Giyu_Tomioka').
 */
function normalizeName(name) {
    if (!name) return '';
    return name
        .trim()
        .replace(/\s+/g, '_')
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Limpa URLs do Wikia removendo os parâmetros de redimensionamento que causam 404.
 * @param {string} url - A URL da imagem do Wikia.
 * @returns {string} A URL da imagem limpa e mais estável.
 */
function cleanWikiaUrl(url) {
    if (url && url.includes("static.wikia.nocookie.net") && url.includes("/revision/")) {
        // Tenta encontrar a extensão do arquivo (.png, .jpg, .gif, etc.)
        const match = url.match(/\.(png|jpe?g|gif|webp)/i);
        if (match) {
             const extension = match[0]; // ex: .png
             const endIndex = url.lastIndexOf(extension) + extension.length;
             
             // Retorna a URL completa da imagem até a sua extensão (o ponto final mais estável)
             return url.substring(0, endIndex);
        }
    }
    return url; // Retorna a URL original se não for do Wikia ou se não precisar de limpeza
}

/**
 * Cria a estrutura HTML com os detalhes do personagem.
 * @param {object} data - O objeto de dados do personagem.
 * @returns {string} O HTML formatado com os detalhes.
 */
function formatCharacterDetails(data) {
    let detailsHtml = '<ul>';
    
    // Lista de chaves que queremos exibir e seus rótulos em Português
    // Lista abrangente baseada no JSON de exemplo do Gyomei
    const fields = {
        'race': 'Raça',
        'gender': 'Gênero',
        'age': 'Idade',
        'birthday': 'Aniversário',
        'height': 'Altura',
        'weight': 'Peso',
        'hair color': 'Cor do Cabelo',
        'eye color ': 'Cor dos Olhos', // Chave com espaço no final, conforme o JSON de exemplo
        'affiliation': 'Afiliação',
        'occupation': 'Ocupação',
        'combat style': 'Estilo de Combate', // Variação para "Estilo de Respiração"
        'breathing_style': 'Estilo de Respiração', 
        'blood_demon_art': 'Arte Demoníaca', 
        'partner(s)': 'Parceiro(s)',
        'status': 'Status',
        'relative(s)': 'Parentes',
        'manga debut': 'Debut (Mangá)',
        'anime debut': 'Debut (Anime)',
        'japanese va': 'Dublador Japonês',
        'english va': 'Dublador Inglês',
        'stage play': 'Peça Teatral'
    };

    for (const key in fields) {
        if (data.hasOwnProperty(key) && data[key]) {
            let value = data[key];
            if (Array.isArray(value)) {
                value = value.join(', ');
            }
            detailsHtml += `<li><strong>${fields[key]}:</strong> ${value}</li>`;
        }
    }

    detailsHtml += '</ul>';
    return detailsHtml;
}


// =======================================================
// FUNÇÃO PRINCIPAL DE BUSCA E EXIBIÇÃO
// =======================================================

/**
 * Busca e exibe os detalhes de um item na API, aplicando a correção de URL.
 */
async function fetchAndDisplay(endpoint, nameElement, detailsElement, imageElement, type) {
    // 1. Define os estados iniciais de carregamento
    nameElement.textContent = 'Buscando...';
    detailsElement.innerHTML = '';
    imageElement.src = PLACEHOLDER_IMG;
    imageElement.alt = 'Carregando...';

    const fullUrl = `${BASE_URL}${endpoint}`;
    
    try {
        const response = await fetch(fullUrl);
        
        if (!response.ok) {
            if (response.status === 404) {
                 throw new Error(`Nenhum(a) ${type} encontrado(a).`);
            } else {
                 throw new Error(`Erro de rede ou API: ${response.statusText}`);
            }
        }

        const data = await response.json();
        // A API pode retornar um array, então pegamos o primeiro item (ou o objeto se já for um)
        const itemData = Array.isArray(data) ? data[0] : data;

        if (!itemData || Object.keys(itemData).length === 0) {
            throw new Error(`Dados do(a) ${type} inválidos ou vazios.`);
        }

        // 2. CORREÇÃO DA IMAGEM: Pega a URL, limpa e define o fallback
        let imageUrl = itemData.image; 
        
        if (imageUrl) {
            imageUrl = cleanWikiaUrl(imageUrl); 
        }
        
        // Define a imagem (URL limpa ou placeholder)
        imageElement.src = imageUrl || PLACEHOLDER_IMG; 
        imageElement.alt = itemData.name || 'Imagem do Item';
        
        // 3. Atualiza os demais detalhes
        nameElement.textContent = itemData.name || 'Nome Desconhecido';
        detailsElement.innerHTML = formatCharacterDetails(itemData); 

    } catch (error) {
        // 4. Tratamento de Erro
        console.error(`Erro ao buscar ${type}:`, error);
        nameElement.textContent = 'ERRO NA BUSCA';
        detailsElement.innerHTML = `<p style="color: var(--color-primary); font-weight: bold;">${error.message}. Tente outro nome.</p>`;
        imageElement.src = PLACEHOLDER_IMG;
        imageElement.alt = 'Erro na Busca';
    }
}


// =======================================================
// OUVINTES DE EVENTOS
// =======================================================

personagemSearchButton.addEventListener('click', () => {
    const nome = personagemSearchInput.value;
    if (nome) {
        const endpoint = normalizeName(nome);
        fetchAndDisplay(endpoint, personagemNameDisplay, personagemDetailsDisplay, personagemImage, 'Personagem');
    } else {
        personagemNameDisplay.textContent = 'Nome Vazio';
        personagemDetailsDisplay.innerHTML = '<p>Por favor, insira o nome de um personagem.</p>';
        personagemImage.src = PLACEHOLDER_IMG;
        personagemImage.alt = 'Placeholder';
    }
});

respiracaoSearchButton.addEventListener('click', () => {
    const nome = respiracaoSearchInput.value;
    if (nome) {
        const endpoint = normalizeName(nome);
        // Busca o personagem associado ao nome da Respiração
        fetchAndDisplay(endpoint, respiracaoNameDisplay, respiracaoDetailsDisplay, respiracaoImage, 'Respiração (Personagem)');
    } else {
        respiracaoNameDisplay.textContent = 'Nome Vazio';
        respiracaoDetailsDisplay.innerHTML = '<p>Por favor, insira o nome de um personagem que usa a respiração.</p>';
        respiracaoImage.src = PLACEHOLDER_IMG;
        respiracaoImage.alt = 'Placeholder';
    }
});

oniSearchButton.addEventListener('click', () => {
    const nome = oniSearchInput.value;
    if (nome) {
        const endpoint = normalizeName(nome);
        // Busca o Oni pelo nome do personagem/Oni
        fetchAndDisplay(endpoint, oniNameDisplay, oniDetailsDisplay, oniImage, 'Oni');
    } else {
        oniNameDisplay.textContent = 'Nome Vazio';
        oniDetailsDisplay.innerHTML = '<p>Por favor, insira o nome de um Oni.</p>';
        oniImage.src = PLACEHOLDER_IMG;
        oniImage.alt = 'Placeholder';
    }
});


// =======================================================
// CARREGAMENTO INICIAL
// =======================================================

function loadInitialData() {
    // Carrega a informação inicial de um personagem padrão
    const initialCharacter = 'Tanjiro_Kamado'; 
    fetchAndDisplay(initialCharacter, personagemNameDisplay, personagemDetailsDisplay, personagemImage, 'Personagem');

    // Define os demais para um estado inicial de "Aguardando Busca"
    respiracaoNameDisplay.textContent = 'Aguardando Busca';
    respiracaoDetailsDisplay.innerHTML = '<p>Use a busca acima para encontrar uma respiração (ou o personagem associado).</p>';
    respiracaoImage.src = PLACEHOLDER_IMG;
    
    oniNameDisplay.textContent = 'Aguardando Busca';
    oniDetailsDisplay.innerHTML = '<p>Use a busca acima para encontrar um Oni.</p>';
    oniImage.src = PLACEHOLDER_IMG;
}

// Chama a função de carregamento inicial
document.addEventListener('DOMContentLoaded', loadInitialData);