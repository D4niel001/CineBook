// Chave da API do TMDb (sua chave pessoal)
const apiKey = '772a5f2f8bc18e1283b4d475d7e94e52';

// Pega os parâmetros da URL (query string)
const params = new URLSearchParams(window.location.search);

// Pega o parâmetro 'tipo', que indica se é 'movie' (filme) ou 'tv' (série)
const tipo = params.get('tipo');

// Pega o parâmetro 'id', que indica o ID do filme ou série selecionado
const id = params.get('id');

// ! variável de trailers criada globalmente para adicionar o conteúdo
let trailersFiltrados = [];

// Verifica se os dois parâmetros obrigatórios existem na URL

if (id && tipo) {

    // Monta a URL da API para buscar detalhes do filme ou série
    // A URL varia conforme o tipo ('movie' ou 'tv') e o ID passado

    const urlDetalhes = `https://api.themoviedb.org/3/${tipo}/${id}?api_key=${apiKey}&language=pt-BR`;
    const urlRecomendados = `https://api.themoviedb.org/3/${tipo}/${id}/recommendations?api_key=${apiKey}&language=pt-BR&page=1`;
    const urlProviders = `https://api.themoviedb.org/3/${tipo}/${id}/watch/providers?api_key=${apiKey}`;
    const urlVideos = `https://api.themoviedb.org/3/${tipo}/${id}/videos?api_key=${apiKey}`;
    const urlCreditos = tipo === 'tv'
        ? `https://api.themoviedb.org/3/tv/${id}/aggregate_credits?api_key=${apiKey}&language=pt-BR`
        : `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${apiKey}&language=pt-BR`;

    Promise.all([
        fetch(urlDetalhes).then(res => res.json()),
        fetch(urlCreditos).then(res => res.json()),
        fetch(urlRecomendados).then(res => res.json()),
        fetch(urlProviders).then(res => res.json()),
        fetch(urlVideos).then(res => res.json())
    ])
        .then(([detalhes, creditos, relacionados, providers, trailers]) => {


            // ! teste para saber se tem algum traielr disnível 
            if (trailers?.results?.length > 0) {
                trailers.results.forEach(video => {
                    console.log(`Título: ${video.name}`);
                    console.log(`Tipo: ${video.type}`);
                    console.log(`Site: ${video.site}`);
                    console.log(`Key: ${video.key}`);
                    console.log('----------------------------');
                });
            } else {
                console.warn("Nenhum vídeo encontrado em trailers.results");
            }

            trailers.results.forEach(video => {
                console.log(video); // veja se iso_639_1 aparece
            });

            // ! seleciona os diretores 
            const diretores = creditos.crew.filter(p => p.job === "Director").map(d => d.name);

            // ! chama a função para exibir o banner
            baner(detalhes);

            // ! chama a função para exibir os atores
            const atoresPrincipais = creditos.cast.slice(0, 20); // Pega os 20 primeiros
            carrosselAtores(atoresPrincipais, '.carrossel-atores');

            // ! chama a função para exibir midias relacionadas
            const relacionadosList = relacionados.results.slice(0, 20) || [];
            exibirRelacionados(relacionadosList, '.lista-relacionados')

            // ! Para pegar os provedores das mídias
            const provedoresBrasil = providers.results.BR?.flatrate || [];

            // ! chama as funções para exibir os detalhes de filmes e séries
            if (tipo === 'movie') {
                exibirDetalhesFilmes(detalhes, diretores, provedoresBrasil);
            } else if (tipo === 'tv') {
                exibirDetalhesSeries(detalhes, provedoresBrasil);
            }

            // ! redefinindo variável global

            const tiposTrailers = ['Trailer','Opening Credits', 'Teaser', 'Clip', 'Featurette', 'Intro']

            trailersFiltrados = trailers.results
                .filter(video => video.site === 'YouTube' && tiposTrailers.includes(video.type))
                .sort((a, b) => {
                    // ! para prizar o trailer
                    
                    return a.type === 'Trailer' ? -1 : b.type === 'Trailer' ? 1 : 0;


                })



            exibirTrailer(trailersFiltrados);

        })
        .catch(err => console.error("Erro ao buscar dados:", err));

} else {
    // ! Se faltar o tipo ou id na URL, avisa no console
    console.error('Parâmetros tipo ou id não encontrados na URL');
}

// * Para mudar o estilo com scroll 

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

// * função adiciona o banner na pagina 

function baner(detalhes) {
    // ! Seleciona a div onde o banner será inserido (com classe 'banner-detalhes')
    const banner = document.querySelector('.banner-detalhes');

    const div = document.createElement('div');
    div.classList.add('banner');
    div.innerHTML = `<img src="https://image.tmdb.org/t/p/original${detalhes.backdrop_path || detalhes.poster_path}" alt="Banner ${detalhes.title || detalhes.name}">
            `;

    banner.appendChild(div);
}


// * Função apar formatar o tempo de duração 

function formatarDuracao(minutos) {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
}

// * Função formatar data

function formatarDataBr(dataISO) {

    const [ano, mes, dia] = dataISO.split('-');

    return `${dia}/${mes}/${ano}`;

}

// * Função resume sinopse

function resumirSinopse(texto, limite = 200) {
    if (!texto) return '';

    // Tenta cortar no primeiro ponto final
    const pontoFinal = texto.indexOf('.');
    if (pontoFinal !== -1 && pontoFinal < limite) {
        return texto.slice(0, pontoFinal + 1) // inclui o ponto final
    }

    // Se não tiver ponto ou for muito longe, corta pelo limite de caracteres
    let resumo = texto.slice(0, limite);

    // Evita cortar no meio da palavra
    const ultimoEspaco = resumo.lastIndexOf(' ');
    if (ultimoEspaco !== -1) {
        resumo = resumo.slice(0, ultimoEspaco);
    }
    return resumo + '...';
}

//  * Função traduz o status da série 

function traduzirStatus(status) {
    const traducoes = {
        'Returning Series': 'Em exibição',
        'Ended': 'Finalizada',
        'Canceled': 'Cancelada',
        'In Production': 'Em produção',
        'Planned': 'Planejando',
        "Pilot": "Piloto"
    };

    return traducoes[status] || status; // retorna o original se não achar tradução
}

// * Função onde vai exibir os detalhes dos filmes 

function exibirDetalhesFilmes(filme, diretores, provedores) {
    const detalhesContainer = document.querySelector('.detalhes');
    const posterFilme = filme.poster_path;
    const nomeFilme = filme.title;
    const generos = filme.genres.slice(0, 3).map(g => g.name).join(', ');
    const duracaoFormatada = formatarDuracao(filme.runtime);
    // O slice pega os 4 primeiros digitos que é o ano 
    const anoLancamento = filme.release_date.slice(0, 4);
    const dataFormatada = formatarDataBr(filme.release_date);
    // Formatando para pegar apenas a primeira casa decimal
    const avaliacao = parseFloat(filme.vote_average.toFixed(1));
    // A ? faz com que se o array estiver vazio não da erro 
    const estudios = filme.production_companies[0]?.name || 'Estúdio desconhecido';
    const nomesDiretores = diretores.join(', ');
    const fraseEfeito = filme.tagline ? `- ${filme.tagline}` : '';
    const sinopseOriginal = filme.overview;
    const sinopse = resumirSinopse(sinopseOriginal);

    let ondeAssistir = '';

    if (provedores.length > 0) {
        ondeAssistir = provedores.slice(0, 3).map(p => `<img src="https://image.tmdb.org/t/p/w45${p.logo_path}" alt="${p.provider_name}" title="${p.provider_name}">`).join(' ');
    } else if (provedores.length === 2) {
        const imgPoster = document.querySelector('.poster-filme > img');
        if (imgPoster) {
            imgPoster.style.borderBottomLeftRadius = '10px';
            imgPoster.style.borderBottomRightRadius = '10px';
        }
    }


    const divPosterFilme = document.createElement('div');
    divPosterFilme.classList.add('poster-filme');
    divPosterFilme.innerHTML = `
    <img src="https://image.tmdb.org/t/p/w500${posterFilme}" alt="Poster do filme ${nomeFilme}">
    <div class="provedores">${ondeAssistir}</div>
    `;

    const divDadosFilmes = document.createElement('div');
    divDadosFilmes.classList.add('dados-filmes');

    divDadosFilmes.innerHTML = `
        <h1 class="titulo-filme">${nomeFilme} <span>(${anoLancamento}) <i class="bi bi-bookmark-star"></i> ${avaliacao}</span></h1>
        <p>${dataFormatada} (BR) &#8226  ${generos} &#8226 ${duracaoFormatada}</p>
        <p>${estudios}</p>
        <p class="topico">${fraseEfeito}</p>
        <h2 class="sinopse-topico">Sinopse:</h2>
        <p class="sinopse">${sinopse}</p>
        <h2 class="topico">Diretores:</h2>
        <p>${nomesDiretores}</p>
        <button class="btn-trailer"><i class="bi bi-play-circle-fill"></i> Assistir trailer</button>
        
        
    `;

    detalhesContainer.appendChild(divPosterFilme);
    detalhesContainer.appendChild(divDadosFilmes);

    // ! a função do modau é chamada após criar o botão 
    modalController();

}

function exibirDetalhesSeries(serie, provedores) {
    const detalhesContainer = document.querySelector('.detalhes');
    const posterSerie = serie.poster_path;
    const nomeSerie = serie.name;
    const anoLancamento = serie.first_air_date?.slice(0, 4) || 'Ano desconhecido';
    const dataFormatada = formatarDataBr(serie.first_air_date);
    const generos = serie.genres.slice(0, 3).map(g => g.name).join(', ');
    const temporadas = serie.number_of_seasons;
    const numeroEp = serie.number_of_episodes;
    const avaliacao = parseFloat(serie.vote_average.toFixed(1));
    const estudios = serie.production_companies.slice(0, 1).map(e => e.name).join(', ');
    const fraseEfeito = serie.tagline ? `- ${serie.tagline}` : '';
    const sinopse = serie.overview;
    const status = traduzirStatus(serie.status);
    const criadores = serie.created_by.map(c => c.name).join(', ');

    let ondeAssistir = '';

    if (provedores.length > 0) {
        ondeAssistir = provedores.slice(0, 3).map(p => `<img src="https://image.tmdb.org/t/p/w45${p.logo_path}" alt="${p.provider_name}" title="${p.provider_name}">`).join(' ');
    }


    const divPosterSerie = document.createElement('div');
    divPosterSerie.classList.add('poster-serie');
    divPosterSerie.innerHTML = `
    <img src="https://image.tmdb.org/t/p/w500${posterSerie}" alt="Poster do filme ${nomeSerie}">
    <div class="provedores">${ondeAssistir}</div>
    `;

    const divDetalhesSeries = document.createElement('div');
    divDetalhesSeries.classList.add('dados-series');
    divDetalhesSeries.innerHTML = `
        <h1 class="titulo-serie">${nomeSerie} <span>(${anoLancamento}) <i class="bi bi-bookmark-star"></i> ${avaliacao}</span></h1>
        <p>${dataFormatada} (BR) &#8226  ${generos} </p>
        <p> Temporadas: ${temporadas} &#8226 Número de episódios: ${numeroEp} &#8226 ${status}</p>
        <p>${estudios}</p>
        <p class="topico"> ${fraseEfeito}</p>
        <h2 class="sinopse-topico">Sinopse:</h2>
        <p class="sinopse">${sinopse}</p>
        <h2>Criadores:</h2>
        <p>${criadores}</p>
        <button class="btn-trailer"><i class="bi bi-play-circle-fill"></i> Assistir trailer</button>
        
        
    `;

    detalhesContainer.appendChild(divPosterSerie);
    detalhesContainer.appendChild(divDetalhesSeries);

    // ! a função do modau é chamada após criar o botão 
    modalController();

}

//  * Função que vai criar e exibir o carrossel na página

function carrosselAtores(atores, containerLista) {
    const container = document.querySelector(containerLista);

    if (!container || !atores) return;

    const carrossel = document.createElement('div');
    carrossel.classList.add('lista-atores')

    atores.forEach(ator => {
        const atorItem = document.createElement('div');
        atorItem.classList.add('ator-item');

        const imagem = ator.profile_path
            ? `https://image.tmdb.org/t/p/w185${ator.profile_path}`
            : 'https://placehold.co/185x278/444/eee?text=Ator+Desconhecido';


        atorItem.innerHTML = `
            <img src="${imagem}" alt="${ator.name}">
            <p class = "nome-ator">${ator.name}</p>
        `;
        carrossel.appendChild(atorItem);

    });

    container.appendChild(carrossel);


    scrollCarrosel('.carrossel-atores', '.lista-atores', '.prev', '.next');

}

// * Função para ativar o scroll do carrossel 

function scrollCarrosel(containerSelector, listaSelector, btnPrevSelector, btnNextSelector) {
    const container = document.querySelector(containerSelector + ' ' + listaSelector);
    const btnPrev = document.querySelector(containerSelector + ' ' + btnPrevSelector);
    const btnNext = document.querySelector(containerSelector + ' ' + btnNextSelector);

    // ! Se algum dos elementos não existir, a função para aqui
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





// * Função para exibir filmes relacionados

function exibirRelacionados(midiasRelacionados, relacionadosContainer) {
    const container = document.querySelector(relacionadosContainer);

    if (!container || !midiasRelacionados) return;

    const carrosselRelacionados = document.createElement('div');
    carrosselRelacionados.classList.add('lista-relacionada');

    const relacionadosFiltrado = midiasRelacionados
        .filter(midia => midia.poster_path);

    relacionadosFiltrado.forEach(midia => {
        const filmeSerieItem = document.createElement('div');
        filmeSerieItem.classList.add('midia-item');

        const tipo = midia.media_type || (midia.title ? 'movie' : 'tv');

        filmeSerieItem.addEventListener('click', () => {
            window.location.href = `detalhes.html?id=${midia.id}&tipo=${tipo}`;
        });

        filmeSerieItem.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${midia.poster_path}" alt="${midia.title || midia.name}">
        <p class = "nome-midia">${midia.title || midia.name}</p>
      `;

        carrosselRelacionados.appendChild(filmeSerieItem);

    });

    container.appendChild(carrosselRelacionados);

    scrollCarrosel('.midia-relacionada', '.lista-relacionada', '.prev-midia', '.next-midia');

}

// * Função para exibir o modal do trailer

function modalController() {

    document.addEventListener('click', (e) => {
        const modal = document.querySelector('.modal-container');
        const videoContainer = document.querySelector('.video-container');

        if (e.target.closest('.btn-trailer')) {
            document.querySelector('.modal-container').style.display = 'flex';
            exibirTrailer(trailersFiltrados);
        } else if (e.target.classList.contains('fechar-modal') || e.target === modal) {
            document.querySelector('.modal-container').style.display = 'none';
            videoContainer.innerHTML = '';
        }
    });
}


// * Função para exibir os trailers no modal

function exibirTrailer(trailers) {

    if (trailers.length > 0) {

        const primeiroTrailer = trailers[0];
        const trailerKey = primeiroTrailer.key;

        const iframe = `<iframe 
        src="https://www.youtube.com/embed/${trailerKey}" 
        title="${primeiroTrailer.name}" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
        </iframe>`;

        const videoContainer = document.querySelector('.video-container');
        videoContainer.innerHTML = iframe;
    }


}


/*

todo: *** Demanda atual ***

? Resolver o problema de alguns filmes e séries não exibe o trailer

* ***  Ideiais ***

// Botar um background nos provedores estilo vidro (transparente)
* 


! *** Bugs ***

! Algumas midias não exibe o elenco
! Algumas midias exibe poucos atores 
!
!


*/