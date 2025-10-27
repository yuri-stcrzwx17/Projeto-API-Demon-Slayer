// =======================================================
// CONFIGURAÇÃO E ELEMENTOS DO DOM
// =======================================================

// URLs e Paths
const BASE_URL = 'https://demon-slayer-api.onrender.com/v1/';
const PLACEHOLDER_IMG = './imgs/placeholder.jpg'; // Verifique o nome e o caminho!

// Personagens
const personagemSearchInput = document.getElementById('personagem-search-input');
const personagemSearchButton = document.getElementById('personagem-search-button');
const personagemNameDisplay = document.getElementById('personagem-name');
const personagemDetailsDisplay = document.getElementById('personagem-details');
const personagemImage = document.getElementById('personagem-image');

// Respirações
const respiracaoSearchInput = document.getElementById('respiracao-search-input');
const respiracaoSearchButton = document.getElementById('respiracao-search-button');
const respiracaoNameDisplay = document.getElementById('respiracao-name');
const respiracaoDetailsDisplay = document.getElementById('respiracao-details');
const respiracaoImage = document.getElementById('respiracao-image');

// Onis
const oniSearchInput = document.getElementById('oni-search-input');
const oniSearchButton = document.getElementById('oni-search-button');
const oniNameDisplay = document.getElementById('oni-name');
const oniDetailsDisplay = document.getElementById('oni-details');
const oniImage = document.getElementById('oni-image');


// =======================================================
// FUNÇÕES DE UTILIDADE
// =======================================================

// Normaliza o nome para a URL (remove acentos e substitui espaços por "_")
function normalizeName(name) {
    if (!name) return '';
    return name
        .trim()
        .replace(/\s+/g, '_')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

// Limpa URLs quebradas do Wikia
function cleanWikiaUrl(url) {
    if (url && url.includes('static.wikia.nocookie.net') && url.includes('/revision/')) {
        const match = url.match(/\.(png|jpe?g|gif|webp)/i);
        if (match) {
            const extension = match[0];
            const endIndex = url.lastIndexOf(extension) + extension.length;
            return url.substring(0, endIndex);
        }
    }
    return url;
}

// Formata os detalhes do personagem
function formatCharacterDetails(data) {
    let detailsHtml = '<ul>';

    const fields = {
        race: 'Raça',
        gender: 'Gênero',
        age: 'Idade',
        birthday: 'Aniversário',
        height: 'Altura',
        weight: 'Peso',
        'hair color': 'Cor do Cabelo',
        'eye color ': 'Cor dos Olhos',
        affiliation: 'Afiliação',
        occupation: 'Ocupação',
        'combat style': 'Estilo de Combate',
        breathing_style: 'Estilo de Respiração',
        blood_demon_art: 'Arte Demoníaca',
        'partner(s)': 'Parceiro(s)',
        status: 'Status',
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

async function fetchAndDisplay(endpoint, nameElement, detailsElement, imageElement, type) {
    nameElement.textContent = 'Buscando...';
    detailsElement.innerHTML = '';
    imageElement.src = PLACEHOLDER_IMG;
    imageElement.alt = 'Carregando...';

    // Define a rota correta da API
    let fullUrl = '';
    if (type.includes('Personagem')) {
        fullUrl = `${BASE_URL}characters/${endpoint}`;
    } else if (type.includes('Respiração')) {
        fullUrl = `${BASE_URL}breathings/${endpoint}`;
    } else if (type.includes('Oni')) {
        fullUrl = `${BASE_URL}demons/${endpoint}`;
    }

    console.log(`🔗 Buscando em: ${fullUrl}`);

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
        const itemData = Array.isArray(data) ? data[0] : data;

        if (!itemData || Object.keys(itemData).length === 0) {
            throw new Error(`Dados do(a) ${type} inválidos ou vazios.`);
        }

        // Corrige imagem
        let imageUrl = itemData.image;
        if (imageUrl) imageUrl = cleanWikiaUrl(imageUrl);

        imageElement.src = imageUrl || PLACEHOLDER_IMG;
        imageElement.alt = itemData.name || 'Imagem do Item';

        // Exibe nome e detalhes
        nameElement.textContent = itemData.name || 'Nome Desconhecido';
        detailsElement.innerHTML = formatCharacterDetails(itemData);
    } catch (error) {
        console.error(`❌ Erro ao buscar ${type}:`, error);
        nameElement.textContent = 'ERRO NA BUSCA';
        detailsElement.innerHTML = `<p style="color: var(--color-primary); font-weight: bold;">${error.message}. Tente outro nome.</p>`;
        imageElement.src = PLACEHOLDER_IMG;
        imageElement.alt = 'Erro na Busca';
    }
}


// =======================================================
// EVENTOS DE CLIQUE
// =======================================================

// Personagem
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

// Respiração
respiracaoSearchButton.addEventListener('click', () => {
    const nome = respiracaoSearchInput.value;
    if (nome) {
        const endpoint = normalizeName(nome);
        fetchAndDisplay(endpoint, respiracaoNameDisplay, respiracaoDetailsDisplay, respiracaoImage, 'Respiração');
    } else {
        respiracaoNameDisplay.textContent = 'Nome Vazio';
        respiracaoDetailsDisplay.innerHTML = '<p>Por favor, insira o nome de uma respiração ou do personagem associado.</p>';
        respiracaoImage.src = PLACEHOLDER_IMG;
        respiracaoImage.alt = 'Placeholder';
    }
});

// Oni
oniSearchButton.addEventListener('click', () => {
    const nome = oniSearchInput.value;
    if (nome) {
        const endpoint = normalizeName(nome);
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
    const initialCharacter = 'Tanjiro_Kamado';
    fetchAndDisplay(initialCharacter, personagemNameDisplay, personagemDetailsDisplay, personagemImage, 'Personagem');

    respiracaoNameDisplay.textContent = 'Aguardando Busca';
    respiracaoDetailsDisplay.innerHTML = '<p>Use a busca acima para encontrar uma respiração.</p>';
    respiracaoImage.src = PLACEHOLDER_IMG;

    oniNameDisplay.textContent = 'Aguardando Busca';
    oniDetailsDisplay.innerHTML = '<p>Use a busca acima para encontrar um Oni.</p>';
    oniImage.src = PLACEHOLDER_IMG;
}

document.addEventListener('DOMContentLoaded', loadInitialData);
