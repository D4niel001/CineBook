
// ! Chave da API do TMDb (sua chave pessoal)
const apiKey = '772a5f2f8bc18e1283b4d475d7e94e52';

// ! Variáveis onde vai buscar os dados da API 
const urlTrending = `https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}&language=pt-BR`;
const urlFilmes = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=pt-BR&page=1`;
const urlSeries = `https://api.themoviedb.org/3/trending/tv/day?api_key=${apiKey}`;

Promise.all([
    fetch(urlTrending).then(res => res.json()),
    fetch(urlFilmes).then(res => res.json()),
    fetch(urlSeries).then(res => res.json())

])
    .then(([destaques, filmes, series]) => {

        // ! pega as mídeias em alta entre filmes e séries
        const midias = destaques.results.slice(0, 6);
        //console.log(midias);

        bannerInicio(midias);

        // ! pega uma lista de filmes em alta
        const filmesPopulares = filmes.results.slice(0, 20);
        //console.log(listaFilmes)
        listaFilmes(filmesPopulares);

        // ! pega uma lista de series em alta
        const seriesPopulares = series.results.slice(0, 20);
        //console.log(seriesPopulares);
        listaSeries(seriesPopulares);

    })
    .catch(err => console.error("Erro ao buscar dados:", err));


//  * Função style scroll

const menu = document.querySelector('.menu');

function scrollStyle() {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            menu.classList.add('scrolled');
        } else {
            menu.classList.remove('scrolled')
        }
    })
}

scrollStyle();



//  * Função para exibir o banner

function bannerInicio(midiasBanners) {
    const containerBanners = document.querySelectorAll('.slide > .banner');
    const containerTextos = document.querySelectorAll('.slide > .text');
    const containerSlides = document.querySelectorAll('.slide');
    const btnPrev = document.querySelector('.prev');
    const btnNext = document.querySelector('.next');
    const dots = document.querySelectorAll('.dot');



    let slideAtual = 0;

    // ! Adiciona o banner
    containerBanners.forEach((midia, i) => {
        const imgBanner = document.createElement('img');
        imgBanner.classList.add('banner-item');

        const imagem = `https://image.tmdb.org/t/p/original${midiasBanners[i].backdrop_path || midiasBanners[i].poster_path}`;

        imgBanner.src = imagem;
        imgBanner.alt = midiasBanners[i].title || midiasBanners[i].name;

        midia.appendChild(imgBanner);
    });

    // ! Adiciona os textos

    containerTextos.forEach((texto, i) => {

        const titulo = midiasBanners[i].title || midiasBanners[i].name;
        const overview = midiasBanners[i].overview;
        const tipo = midiasBanners[i].media_type; // * "movie" ou "tv"
        const id = midiasBanners[i].id;

        texto.innerHTML = `
            <h1 class="titulo-banner">${titulo}</h1>
            <p class="sinopse">${overview}</p>
            <button class="btn-banner" data-id="${id}" data-tipo="${tipo}">ver mais</button>
        `;

    });

    // ! Eventos dos botões

    btnNext.addEventListener('click', () => {

        slideAtual = (slideAtual + 1) % containerSlides.length;

        atualizarSlide();
    });

    btnPrev.addEventListener('click', () => {

        slideAtual = (slideAtual - 1 + containerSlides.length) % containerSlides.length;

        atualizarSlide();

    });

    const btnBanner = document.querySelectorAll('.btn-banner');

    btnBanner.forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const tipo = btn.dataset.tipo;
            window.location.href = `detalhes.html?id=${id}&tipo=${tipo}`;
        });
    });

    // ! Atualiza slides e dots

    function atualizarSlide() {
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
            atualizarSlide();
        });
    });

    // ! atualiza o banner automático

    setInterval(() => {
        containerSlides.forEach(slide => slide.classList.remove('active'));

        // ! O símbolo % é o operador de módulo (ou resto da divisão inteira).
        slideAtual = (slideAtual + 1) % containerSlides.length;
        atualizarSlide();

    }, 8000);


}


// * function carrossel de filmes

function listaFilmes(filmes) {
    const listaContainer = document.querySelector('.lista-filmes');

    filmes.forEach(filme => {
        const filmeItem = document.createElement('div');
        filmeItem.classList.add('filme-item');
        filmeItem.dataset.id = filme.id;

        const posterFilme = filme.poster_path;

        filmeItem.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${posterFilme}" alt="${filme.title}">
        `;

        listaContainer.appendChild(filmeItem);

        filmeItem.addEventListener('click', () => {
            // Aqui você pode colocar o link da página do filme
            window.location.href = `detalhes.html?id=${filme.id}&tipo=movie`;
        });

    });

    scrollCarrossel('.filmes', '.lista-filmes', '.prev-filmes', '.next-filmes');

}

// ! function carrossel de filmes

function listaSeries(series) {
    const listaContainer = document.querySelector('.lista-series');

    series.forEach(serie => {
        const serieItem = document.createElement('div');
        serieItem.classList.add('serie-item');
        serieItem.dataset.id = serie.id;


        const posterSerie = serie.poster_path;

        serieItem.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${posterSerie}" alt="${serie.title}">
        `;

        listaContainer.appendChild(serieItem);

        serieItem.addEventListener('click', () => {
            // Aqui você pode colocar o link da página do filme
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

    const scrollStep = 2000;

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


