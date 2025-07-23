// ! Chave da API do TMDb (sua chave pessoal)
const apiKey = '772a5f2f8bc18e1283b4d475d7e94e52';

// ! Variáveis onde vai buscar os dados da API 
const urlFilmes = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=pt-BR&page=1`;


fetch(urlFilmes)
    .then(res => res.json())
    .then(filmes => {
        const filmesDestaques = filmes.results.slice(0, 5);
        const top10 = filmes.results.slice(0, 10);

        exibirBanner(filmesDestaques);
        listaFilmes(top10);
    })
    .catch(err => {
        console.error("Erro ao buscar dados:", err);
    });

//  ! Função para exibir o banner

function exibirBanner(filmesResults) {
    const containerBanners = document.querySelectorAll('.slide > .banner');
    const containerTextos = document.querySelectorAll('.slide > .text');
    const containerSlides = document.querySelectorAll('.slide');
    const btnPrev = document.querySelector('.prev');
    const btnNext = document.querySelector('.next');
    const dots = document.querySelectorAll('.dot');

    let slideAtual = 0;

    // ! Adiciona o banner
    containerBanners.forEach((filme, i) => {
        const imgBanner = document.createElement('img');
        imgBanner.classList.add('banner-item');

        const imagem = `https://image.tmdb.org/t/p/original${filmesResults[i].backdrop_path || filmesResults[i].poster_path}`;

        imgBanner.src = imagem;
        imgBanner.alt = filmesResults[i].title || filmesResults[i].name;

        filme.appendChild(imgBanner);
    });

    // ! Adiciona os textos

    containerTextos.forEach((texto, i) => {
        const titulo = filmesResults[i].title || filmesResults[i].name;
        const overview = filmesResults[i].overview;
        const tipo = filmesResults[i].type;
        const id = filmesResults[i].id;

        texto.innerHTML = `
            <h1 class="titulo-banner">${titulo}</h1>
            <p class="sinopse">${overview}</p>
            <button class="btn-banner" data-id="${id}" data-tipo="${tipo}">ver mais</button>
        `;
    });

    // ! Eventos dos botões
    btnPrev.addEventListener('click', () => {
        slideAtual = (slideAtual - 1 + containerSlides.length) % containerSlides.length;
        atualizarSlides();
    });

    btnNext.addEventListener('click', () => {
        slideAtual = (slideAtual + 1) % containerSlides.length;
        atualizarSlides();
    });

    // ! Atualiza slides e dots

    function atualizarSlides() {
        containerSlides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active-dot'));

        containerSlides[slideAtual].classList.add('active');
        if (dots[slideAtual]) {
            dots[slideAtual].classList.add('active-dot');
        }
    }

    // ! Evento de clique nos pontinhos

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            slideAtual = i;
            atualizarSlides();
        });
    })

    // ! Atualiza slides conm o tempo 

    setInterval(() => {
        containerSlides.forEach(slide => slide.classList.remove('active'));
        // ! O símbolo % é o operador de módulo (ou resto da divisão inteira).
        slideAtual = (slideAtual + 1) % containerSlides.length;
        atualizarSlides();
    }, 8000);

}

// ! function carrossel de filmes

function listaFilmes(top10) {
    const listaFilmes = document.querySelector('.lista-filmes');

    top10.forEach((filme, index) => {
        const cardFilme = document.createElement('div');
        cardFilme.classList.add('filme-item');
        cardFilme.dataset.id = filme.id;

        const imagem = `https://image.tmdb.org/t/p/w500${filme.poster_path || filme.backdrop_path}`;
        const titulo = filme.title || filme.name;

        cardFilme.innerHTML = `
            <div class="posicao">${index + 1}</div>
            <img src="${imagem}" alt="${titulo}" />
            
        `;

        listaFilmes.appendChild(cardFilme);

        // ! evento de click para redireconar para páginna detalhes

        cardFilme.addEventListener('click', () => {
            // ? Aqui você pode colocar o link da página do filme
            window.location.href = `detalhes.html?id=${filme.id}&tipo=movie`;
        });

    });

    scrollCarrossel('.filmes', '.lista-filmes', '.prev-filmes', '.next-filmes');

}


function scrollCarrossel(containerSelector, listaSelector, btnPrevSelector, btnNextSelector) {
    const container = document.querySelector(containerSelector + ' ' + listaSelector);
    const btnPrev = document.querySelector(containerSelector + ' ' + btnPrevSelector);
    const btnNext = document.querySelector(containerSelector + ' ' + btnNextSelector);

    if (!container || !btnPrev || !btnNext) return;

    const scrollStep = 2300;

    btnNext.addEventListener('click', () => {
        container.scrollBy({
            left: scrollStep,
            behavior: 'smooth'
        });
    });

    btnPrev.addEventListener('click', () => {
        container.scrollBy({
            left: -scrollStep,
            behavior: 'smooth'
        });
    });

}

// ! Filtro de categorias 



function buscarFilmesPopulares() {
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=pt-BR&page=1`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            exibirFilmesPorGenero(data.results); // usa a mesma função
        });
}

function categoriasClick() {
    const linksCategorias = document.querySelectorAll('.categorias button');

    linksCategorias.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const generoId = link.dataset.genre;
            filmesPorGenero(generoId);
        });
    });

}

function filmesPorGenero(generoId) {
    const filmesContainer = document.querySelector('.filmes-categorias');
    filmesContainer.innerHTML = '<p>Carregando filmes...</p>';

    const promises = [];

    for (let page = 1; page <= 5; page++) {
        const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${generoId}&language=pt-BR&page=${page}`;
        promises.push(fetch(url).then(res => res.json()));

    }

    Promise.all(promises)
        .then(resultados => {
            // * flatMap para juntar todos os arrays em um só
            const todosOsFilmes = resultados.flatMap(r => r.results); // junta tudo
            exibirFilmesPorGenero(todosOsFilmes);
        })
        .catch(error => {
            filmesContainer.innerHTML = '<p>Erro ao carregar filmes.</p>';
            console.error('Erro ao buscar filmes por gênero:', error);
        });

}

function exibirFilmesPorGenero(filmes) {
    const container = document.querySelector('.filmes-categorias');
    container.innerHTML = ''; // limpa

    const lista = document.createElement('div');
    lista.classList.add('lista-categorias'); // adicione essa classe no CSS se quiser estilizar
    container.appendChild(lista);

    filmes.forEach(filme => {
        const card = document.createElement('div');
        card.classList.add('categoria-item');

        const imagem = `https://image.tmdb.org/t/p/w500${filme.poster_path || filme.backdrop_path}`;
        const titulo = filme.title || filme.name;

        card.innerHTML = `
            <img src="${imagem}" alt="${titulo}">
            
        `;

        // evento de clique para abrir detalhes
        card.addEventListener('click', () => {
            window.location.href = `detalhes.html?id=${filme.id}&tipo=movie`;
        });

        lista.appendChild(card);
    });


    // ? animação para suavisar

    const cards = lista.querySelectorAll('.categoria-item');
    requestAnimationFrame(() => {
        cards.forEach(card => {
            card.classList.add('aparecer');
        });
    });
}

categoriasClick();
buscarFilmesPopulares();

function menuAtivo() {
    const botoes = document.querySelectorAll('.categorias button');
    

    botoes.forEach(botao => {
        botao.addEventListener('click', () => {
            // Remove a classe 'ativo' de todos os botões
            botoes.forEach(btn => btn.classList.remove('ativo'));

            // Adiciona a classe 'ativo' apenas no botão clicado
            botao.classList.add('ativo');

            // Aqui você pode chamar a função que filtra os filmes da categoria
            // ex: filtrarFilmesPorGenero(botao.dataset.genre);
        });
    });


}

menuAtivo();