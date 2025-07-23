// ! Chave da API do TMDb (sua chave pessoal)
const apiKey = '772a5f2f8bc18e1283b4d475d7e94e52';

// ! Variáveis onde vai buscar os dados da API 
const urlSeries = `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=pt-BR&page=1`;


fetch(urlSeries)
    .then(res => res.json())
    .then(series => {
        const seriesDestaques = series.results.slice(0, 5);
        const top10 = series.results.slice(0, 10);

        exibirBanner(seriesDestaques);
        listaSeries(top10);
    })
    .catch(err => {
        console.error("Erro ao buscar dados:", err);
    });

//  ! Função para exibir o banner

function exibirBanner(seriesResults) {
    const containerBanners = document.querySelectorAll('.slide > .banner');
    const containerTextos = document.querySelectorAll('.slide > .text');
    const containerSlides = document.querySelectorAll('.slide');
    const btnPrev = document.querySelector('.prev');
    const btnNext = document.querySelector('.next');
    const dots = document.querySelectorAll('.dot');

    let slideAtual = 0;

    // ! Adiciona o banner
    containerBanners.forEach((serie, i) => {
        const imgBanner = document.createElement('img');
        imgBanner.classList.add('banner-item');

        const imagem = `https://image.tmdb.org/t/p/original${seriesResults[i].backdrop_path || seriesResults[i].poster_path}`;

        imgBanner.src = imagem;
        imgBanner.alt = seriesResults[i].title || seriesResults[i].name;

        serie.appendChild(imgBanner);
    });

    // ! Adiciona os textos

    containerTextos.forEach((texto, i) => {
        const titulo = seriesResults[i].title || seriesResults[i].name;
        const overview = seriesResults[i].overview;
        const tipo = seriesResults[i].type;
        const id = seriesResults[i].id;

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


// ! function carrossel de Series

function listaSeries(top10) {
    const listaSeries = document.querySelector('.lista-series');

    top10.forEach((serie, index) => {
        const cardSerie = document.createElement('div');
        cardSerie.classList.add('serie-item');
        cardSerie.dataset.id = serie.id;

        const imagem = `https://image.tmdb.org/t/p/w500${serie.poster_path || serie.backdrop_path}`;
        const titulo = serie.title || serie.name;

        cardSerie.innerHTML = `
            <div class="posicao">${index + 1}</div>
            <img src="${imagem}" alt="${titulo}" />
            
        `;

        listaSeries.appendChild(cardSerie);

        // ! evento de click para redireconar para páginna detalhes

        cardSerie.addEventListener('click', () => {
            // ? Aqui você pode colocar o link da página da serie
            window.location.href = `detalhes.html?id=${serie.id}&tipo=tv`;
        });

    });

    scrollCarrossel('.series', '.lista-series', '.prev-series', '.next-series');

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



function buscarSeriesPopulares() {
    const url = `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=pt-BR&page=1`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            exibirSeriesPorGenero(data.results); // usa a mesma função para exibir
        })
        .catch(error => {
            console.error('Erro ao buscar séries populares:', error);
        });
}

function categoriasClick() {
    const linksCategorias = document.querySelectorAll('.categorias button');

    linksCategorias.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const generoId = link.dataset.genre;
            seriesPorGenero(generoId);
        });
    });

}

function seriesPorGenero(generoId) {
    const seriesContainer = document.querySelector('.series-categorias');
    seriesContainer.innerHTML = '<p>Carregando séries...</p>';

    const promises = [];

    for (let page = 1; page <= 5; page++) {
        const url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&with_genres=${generoId}&language=pt-BR&page=${page}`;
        promises.push(fetch(url).then(res => res.json()));
    }

    Promise.all(promises)
        .then(resultados => {
            const todasAsSeries = resultados.flatMap(r => r.results);
            exibirSeriesPorGenero(todasAsSeries);
        })
        .catch(error => {
            seriesContainer.innerHTML = '<p>Erro ao carregar séries.</p>';
            console.error('Erro ao buscar séries por gênero:', error);
        });
}

function exibirSeriesPorGenero(series) {
    const container = document.querySelector('.series-categorias');
    container.innerHTML = ''; // limpa

    const lista = document.createElement('div');
    lista.classList.add('lista-categorias'); // adicione essa classe no CSS se quiser estilizar
    container.appendChild(lista);

    series.forEach(serie => {
        const card = document.createElement('div');
        card.classList.add('categoria-item');

        const imagem = `https://image.tmdb.org/t/p/w500${serie.poster_path || serie.backdrop_path}`;
        const titulo = serie.title || serie.name;

        card.innerHTML = `
            <img src="${imagem}" alt="${titulo}">
            
        `;

        // evento de clique para abrir detalhes
        card.addEventListener('click', () => {
            window.location.href = `detalhes.html?id=${serie.id}&tipo=tv`;
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

buscarSeriesPopulares();
categoriasClick();

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