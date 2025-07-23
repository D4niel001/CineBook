const form = document.querySelector('#form-pesquisa');
const input = document.querySelector('#input-pesquisa');

const loader = document.querySelector('.loader');

let paginaAtual = 1;
let termoAtual = '';
let totalPaginas = 1;
let carregando = false;

function pesquisaEnter() {
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // evita recarregar a página

        const termo = input.value.trim();
        if (termo.length === 0) return;

        // Redireciona para a página de pesquisa com o termo
        window.location.href = `pesquisa.html?termo=${encodeURIComponent(termo)}`;
    });
}

function pesuisaAuto() {
    let timeout = null;

    input.addEventListener('input', () => {
        clearTimeout(timeout);
        const termo = input.value.trim();


        if (termo.length === 0) return;

        timeout = setTimeout(() => {
            window.location.href = `pesquisa.html?termo=${encodeURIComponent(termo)}`;

        }, 600);


    });

}

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const termo = params.get('termo');

    if (termo) {
        input.value = termo;
        input.focus(); // <- isso aqui garante que o cursor volte pro campo
        termoAtual = termo; // define o termo atual global
        paginaAtual = 1; // reset
        buscarResultados(termoAtual, paginaAtual);
    }
});

function buscarResultados(termo, pagina = 1) {
    const lista = document.querySelector('.lista-resultados');
    const apiKey = '772a5f2f8bc18e1283b4d475d7e94e52';
    const urlResults = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(termo)}&language=pt-BR&page=${pagina}`;

    carregando = true;
    loader.style.display = 'flex';

    fetch(urlResults)
        .then(res => res.json())
        .then(midias => {
            const resultados = midias.results;
            totalPaginas = midias.total_pages;
            
            if (pagina === 1) {
                lista.innerHTML = ''; // limpa resultados anteriores se for a primeira página
            }
            exibirResultados(resultados);
            carregando = false;

            if (paginaAtual >= totalPaginas) {
                loader.style.display = 'none';
            }

        })
        .catch(err => {
            console.error("Erro ao buscar dados:", err);
            carregando = false;
        });
}


function exibirResultados(dados) {
    const lista = document.querySelector('.lista-resultados');
    const secaoResultados = document.querySelector('.resultados');


    if (dados.length === 0) {
        lista.innerHTML = '<p>Nenhum resultado encontrado.</p>';
        secaoResultados.style.display = 'block';
        return
    }

    dados.forEach(item => {
        if (!item.poster_path || (item.media_type !== 'movie' && item.media_type !== 'tv')) return;

        const div = document.createElement('div');
        div.classList.add('card-resultado');

        const poster = item.poster_path;
        const titulo = item.title || item.name || 'Sem titulo';
        const imagem = `https://image.tmdb.org/t/p/w500${poster}`;
        const tipo = item.media_type;
        const tipoExibicao = tipo === 'movie' ? 'Filme' : 'Série';
        const id = item.id;



        if (item.media_type === 'movie') {
            div.innerHTML = `
            <img src="${imagem}" alt="${titulo}">
            <div class="textos">
                <h3>${titulo}</h3>
                <p>${tipoExibicao}</p>
            </div> 
        `;
        } else if (item.media_type === 'tv') {
            div.innerHTML = `
            <img src="${imagem}" alt="${titulo}">
            <div class="textos">
                <h3>${titulo}</h3>
                <p>${tipoExibicao}</p>
            </div> 
        `;
        }

        div.addEventListener('click', () => {
            window.location.href = `detalhes.html?id=${id}&tipo=${tipo}`;
        });

        lista.appendChild(div);

    });


    

}

/*  Esse trecho verifica se o usuário está perto do fim da página (100px antes), 
e se ainda há páginas disponíveis, chama a próxima. */

window.addEventListener('scroll', () => {
    const scrollPosicao = window.innerHeight + window.scrollY;
    const alturaTotal = document.body.offsetHeight;

    if (scrollPosicao >= alturaTotal - 100 && !carregando && paginaAtual < totalPaginas) {
        paginaAtual++;
        buscarResultados(termoAtual, paginaAtual);
    }
});

pesquisaEnter();
pesuisaAuto();
