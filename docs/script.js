/**
 * Projeto: Jogo Logoritmos
 * Autor: Tiago Oliveira
 * Descrição: Script principal do jogo — controle de telas, cadastro, login, histórico e animações
 * Última atualização: 25/09/2025
 */
const API_URL = location.hostname === "localhost"
  ? "http://localhost:3000"
  : "https://jogo-logaritimo-api.vercel.app";
// ===============================
// Variáveis globais do jogo
// ===============================
let telaEmTransicao = false; // Controla se há uma transição de tela em andamento
let currentLevel = 1;        // Nível atual do jogador
let lives = 3;               // Número de vidas restantes
let number = 0;              // Número secreto do nível
let attempts = 0;            // Tentativas feitas no nível atual
let numberOfGuesses = 0;     // Total de palpites feitos
let history = [];            // Histórico de palpites
let nome = "";               // Nome do jogador
let historicalShow = true;   // Exibe histórico no modo fácil
let estadoDeTransicao = false; // Estado de transição visual
let confeteInterval, coracaoInterval, gameOverInterval, TrofeuInterval, coroaInterval; // Efeitos visuais

// ==================================================
// FUNÇÃO: transicaoDeTela
// Descrição: Realiza a transição visual entre duas telas com fade-out e fade-in
// ==================================================
function transicaoDeTela(telaAtualId, proximaTelaId) {
  telaEmTransicao = true;

  const atual = document.getElementById(telaAtualId);
  const proxima = document.getElementById(proximaTelaId);

  if (!atual || !proxima) return;

  atual.classList.add("fade-out");

  setTimeout(() => {
    atual.style.display = "none";
    atual.classList.remove("fade-out");

    proxima.style.display = "block";
    proxima.classList.add("fade-in");

    setTimeout(() => {
      proxima.classList.remove("fade-in");
      telaEmTransicao = false;
    }, 1000);
  }, 1000);
}

// ==================================================
// FUNÇÃO: atualizarBotao
// Descrição: Alterna entre "Login" e "Cadastrar usuário" com base no checkbox
// ==================================================
function atualizarBotao() {
  const checkbox = document.getElementById("logarDireto");
  const botao = document.getElementById("botaoPrincipal");

  if (checkbox.checked) {
    botao.textContent = "Login";
    botao.onclick = login;
  } else {
    botao.textContent = "Cadastrar usuário";
    botao.onclick = cadastrar;
  }
}

// ==================================================
// FUNÇÃO: cadastrar
// Descrição: Cadastra novo jogador, gera avatar, envia dados ao backend e atualiza interface
// ==================================================
async function cadastrar() {
  const nomeInput = document.getElementById("nome");
  const nome = nomeInput?.value.trim();
  const logarDireto = document.getElementById("logarDireto")?.checked;
  const mensagem = document.getElementById("mensagemCadastro");
  const avatarCadastro = document.getElementById("avatarCadastro");

  if (!nome || nome.length < 3) {
    alert("Digite um nome válido com pelo menos 3 caracteres!");
    return;
  }

  const estilos = ["bottts", "adventurer", "fun-emoji", "lorelei", "thumbs", "shapes", "notionists"];
  const estiloAleatorio = estilos[Math.floor(Math.random() * estilos.length)];
  const avatarUrl = `https://api.dicebear.com/7.x/${estiloAleatorio}/png?seed=${encodeURIComponent(nome)}`;

  let respostaCadastro;
  try {
    respostaCadastro = await fetch(`${API_URL}/api/cadastro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: nome, avatar: avatarUrl }),
    });
  } catch (err) {
    mensagem.textContent = "🚫 Erro de conexão com o servidor";
    mensagem.style.color = "red";
    return;
  }

  const texto = await respostaCadastro.text();

  if (respostaCadastro.ok) {
    mensagem.textContent = "✅ " + texto;
    mensagem.style.color = "green";

    localStorage.setItem("estadoTela", "boasVindas");
    localStorage.setItem("avatarJogador", avatarUrl);
    localStorage.setItem("nomeJogador", nome);

    const nomeJogador = document.getElementById("nomeJogador");
    if (nomeJogador) nomeJogador.textContent = `👤 Jogador: ${nome}`;

    const avatarBoasVindas = document.getElementById("avatarBoasVindas");
    const imgTemp = new Image();
    imgTemp.onload = () => {
      if (avatarBoasVindas) {
        avatarBoasVindas.src = avatarUrl;
        avatarBoasVindas.style.display = "block";
      }
      transicaoDeTela("formulario", "welcomeArea");
    };
    imgTemp.src = avatarUrl;

    if (avatarCadastro) {
      avatarCadastro.src = avatarUrl;
      avatarCadastro.style.display = "block";
    }

    const avatarJogo = document.getElementById("avatarJogo");
    if (avatarJogo) {
      avatarJogo.src = avatarUrl;
      avatarJogo.style.display = "block";
    }

    salvarHistorico(nome, ["5", "8", "3"]);
    nomeInput.value = nome;

    await login(); // login automático
  } else if (texto === "Usuário já existe") {
    mensagem.textContent = "⚠️ Usuário já existe. Escolha outro nome.";
    mensagem.style.color = "orange";
    nomeInput.value = "";
    if (avatarCadastro) avatarCadastro.style.display = "none";
    if (document.getElementById("logarDireto")) {
      document.getElementById("logarDireto").checked = false;
    }
    atualizarBotao();
  } else {
    mensagem.textContent = "⚠️ " + texto;
    mensagem.style.color = "red";
    if (avatarCadastro) avatarCadastro.style.display = "none";
  }
}

// ==================================================
// FUNÇÃO: login
// Descrição: Realiza login do jogador e atualiza interface com dados do servidor
// ==================================================
async function login() {
  const nome = document.getElementById("nome")?.value.trim();
  const mensagem = document.getElementById("mensagemCadastro");
  const avatarJogo = document.getElementById("avatarJogo");

  let respostaLogin;
  try {
    respostaLogin = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: nome }),
    });
  } catch (err) {
    mensagem.textContent = "🚫 Erro de conexão com o servidor";
    mensagem.style.color = "red";
    return;
  }

  try {
    const dados = await respostaLogin.json();

    currentLevel = dados.dados.nivel;
    lives = typeof dados.dados.vidas === "number" ? dados.dados.vidas : 3;
    atualizarVidas();

    mensagem.textContent = "🛸 " + dados.mensagem;
    mensagem.style.color = "blue";

    if (dados.dados.avatar) {
      if (avatarJogo) {
        avatarJogo.src = dados.dados.avatar;
        avatarJogo.style.display = "block";
      }
      localStorage.setItem("avatarJogador", dados.dados.avatar);
      localStorage.setItem("nomeJogador", nome);
    }

    const avatarBoasVindas = document.getElementById("avatarBoasVindas");
    if (avatarBoasVindas) {
      avatarBoasVindas.src = dados.dados.avatar;
      avatarBoasVindas.style.display = "block";
    }

    const nomeJogador = document.getElementById("nomeJogador");
    if (nomeJogador) nomeJogador.textContent = `Olá ${nome}`;

    document.querySelector(".formulario").style.display = "none";
    document.getElementById("welcomeArea").style.display = "block";
  } catch (err) {
    const texto = await respostaLogin.text();
    mensagem.textContent = "🚫 " + texto;
    mensagem.style.color = "red";
    if (avatarJogo) avatarJogo.style.display = "none";
    console.log("Resposta do servidor:", respostaLogin.status);
  }

  try {
    await carregarRanking();
  } catch (err) {
    console.warn("Erro ao carregar ranking:", err);
  }
}

// ==================================================
// FUNÇÃO: salvarHistorico
// Descrição: Envia histórico de palpites para o servidor (ranking e modo fácil)
// ==================================================
async function salvarHistorico(nomeDoJogador, palpites) {
  if (!nomeDoJogador || !Array.isArray(palpites)) {
    console.warn("Dados inválidos para salvar histórico");
    return;
  }

  try {
    const resposta = await fetch(`${API_URL}/api/salvar-historico`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: nomeDoJogador,
        historico: palpites,
      }),
    });

    if (!resposta.ok) {
      const erro = await resposta.text();
      console.warn("Erro ao salvar histórico:", erro);
    } else {
      console.log("📚 Histórico salvo com sucesso para", nomeDoJogador);
    }
  } catch (err) {
    console.error("🚫 Falha na comunicação com o servidor:", err);
  }
}

// ==================================================
// EVENTO: DOMContentLoaded
// Descrição: Executa ao carregar a página e exibe a tela correta com base no localStorage
// ==================================================
window.addEventListener("DOMContentLoaded", async () => {
  if (typeof telaEmTransicao !== "undefined" && telaEmTransicao) return;

  atualizarBotao();

  const estado = localStorage.getItem("estadoTela");
  const nome = localStorage.getItem("nomeJogador");

  if (nome) {
    document.getElementById("nome").value = nome;
  }

  try {
    if (estado === "jogo" && nome) {
      await login();
      document.getElementById("welcomeArea").style.display = "none";
      document.getElementById("gameArea").style.display = "block";
      iniciarNivel();
    } else if (estado === "boasVindas" && nome) {
      document.querySelector(".formulario").style.display = "none";
      document.getElementById("welcomeArea").style.display = "block";
    } else {
      // Estado inicial
      document.querySelector(".formulario").style.display = "block";
      document.getElementById("welcomeArea").style.display = "none";
      document.getElementById("gameArea").style.display = "none";
    }
  } catch (err) {
    console.error("🚫 Erro ao restaurar estado da tela:", err);
    // fallback para estado inicial
    document.querySelector(".formulario").style.display = "block";
    document.getElementById("welcomeArea").style.display = "none";
    document.getElementById("gameArea").style.display = "none";
  }
});

// ==================================================
// FUNÇÃO: entrarNoJogo
// Descrição: Inicia o jogo após o jogador escolher o modo e preencher o nome
// ==================================================
function entrarNoJogo() {
  const nomeInput = document.getElementById("nome");
  const nome = nomeInput?.value.trim();

  if (!nome || nome.length < 3) {
    alert("Digite um nome válido com pelo menos 3 caracteres!");
    return;
  }

  // Salva estado e modo de jogo
  localStorage.setItem("estadoTela", "jogo");
  localStorage.setItem("nomeJogador", nome);

  const modoSelecionado = document.querySelector('input[name="modo"]:checked')?.value;
  if (!modoSelecionado) {
    alert("Selecione um modo de jogo!");
    return;
  }

  localStorage.setItem("modoJogo", modoSelecionado);
  historicalShow = modoSelecionado === "facil";

  // Exibe tela do jogo e oculta as demais
  document.querySelector(".formulario")?.style.setProperty("display", "none");
  document.getElementById("welcomeArea")?.style.setProperty("display", "none");
  document.getElementById("gameArea")?.style.setProperty("display", "block");

  // Sincroniza avatar e nome
  const avatarUrl = localStorage.getItem("avatarJogador");
  const avatarJogo = document.getElementById("avatarJogo");
  if (avatarJogo && avatarUrl) {
    avatarJogo.src = avatarUrl;
    avatarJogo.style.display = "block";
  }

  const nomeJogador = document.getElementById("nomeJogador");
  if (nomeJogador) {
    nomeJogador.textContent = `👤 Jogador: ${nome}`;
  }

  // Inicia lógica do jogo
  try {
    iniciarNivel();
    atualizarVidas();
    carregarRanking();
  } catch (err) {
    console.error("🚫 Erro ao iniciar o jogo:", err);
    alert("Ocorreu um erro ao iniciar o jogo. Tente novamente.");
  }
}

// ==================================================
// FUNÇÃO: sairDoJogo
// Descrição: Retorna à tela de cadastro e limpa dados visuais
// ==================================================
function sairDoJogo() {
  // Atualiza estado da tela para voltar ao formulário
  localStorage.setItem("estadoTela", "formulario");

  // Oculta áreas do jogo e boas-vindas
  document.getElementById("gameArea")?.style.setProperty("display", "none");
  document.getElementById("welcomeArea")?.style.setProperty("display", "none");

  // Exibe formulário de entrada
  document.querySelector(".formulario")?.style.setProperty("display", "block");

  // Limpa apenas a interface visual (não os dados do jogador)
  const vidasContainer = document.getElementById("vidasContainer");
  if (vidasContainer) vidasContainer.textContent = "";

  // NÃO zera currentLevel, lives, histórico ou avatar
  // Esses dados permanecem salvos no localStorage e backend

  console.log("👋 Jogador saiu do jogo, dados preservados");
}

// ==================================================
// EVENTO: DOMContentLoaded
// Descrição: Executa ao carregar a página e restaura estado salvo
// ==================================================
window.addEventListener("DOMContentLoaded", async () => {
  atualizarBotao();

  const estado = localStorage.getItem("estadoTela");
  const nome = localStorage.getItem("nomeJogador");
  const avatar = localStorage.getItem("avatarJogador");

  // Sempre tenta carregar o ranking, mesmo fora do jogo
  try {
    await carregarRanking();
  } catch (err) {
    console.warn("⚠️ Erro ao carregar ranking:", err);
  }

  if (estado === "jogo" && nome && avatar) {
    document.querySelector(".formulario")?.style.setProperty("display", "none");
    document.getElementById("welcomeArea")?.style.setProperty("display", "none");
    document.getElementById("gameArea")?.style.setProperty("display", "block");

    const avatarJogo = document.getElementById("avatarJogo");
    if (avatarJogo) {
      avatarJogo.src = avatar;
      avatarJogo.style.display = "block";
    }

    const nomeJogador = document.getElementById("nomeJogador");
    if (nomeJogador) {
      nomeJogador.textContent = `👤 Jogador: ${nome}`;
    }

    try {
      await login(); // garante que dados do backend estejam atualizados
      iniciarNivel();
      atualizarVidas();
    } catch (err) {
      console.error("🚫 Erro ao restaurar sessão do jogador:", err);
      alert("Ocorreu um erro ao restaurar seu jogo. Tente novamente.");
      localStorage.setItem("estadoTela", "formulario");
      document.querySelector(".formulario")?.style.setProperty("display", "block");
      document.getElementById("gameArea")?.style.setProperty("display", "none");
    }
  }
});


// ==================================================
// FUNÇÃO: carregarRanking
// Descrição: Busca ranking do servidor e atualiza Top 3 e lista completa
// ==================================================
async function carregarRanking() {
  try {
    const resposta = await fetch(`${API_URL}/api/ranking`);
    if (!resposta.ok) throw new Error("Resposta inválida do servidor");

    const ranking = await resposta.json();
    const nomeAtual = localStorage.getItem("nomeJogador");

    const trofeus = ["🥇", "🥈", "🥉"];
    const simbolosExtras = ["🎖️", "🎗️", "⭐", "🌟", "🔰", "🪐", "🚀"];

    // Atualiza Top 3
    const topRanking = document.getElementById("topRanking");
    if (topRanking) {
      topRanking.innerHTML = "";
      ranking.slice(0, 3).forEach((jogador, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <div class="miniRanking">
            <p class="trofeu">${trofeus[index]}</p>
            <div class="avatarMiniRanking">
              <img src="${jogador.avatar}" alt="Avatar de ${jogador.id}">
            </div>
            ${jogador.id} - Nível Máximo ${jogador.nivelMaximo}
          </div>
        `;
        topRanking.appendChild(li);
      });
    }

    // Atualiza ranking completo
    const listaCompleta = document.getElementById("listaRankingCompleto");
    if (listaCompleta) {
      listaCompleta.innerHTML = "";
      ranking.forEach((jogador, index) => {
        const li = document.createElement("li");

        if (jogador.id === nomeAtual) {
          Object.assign(li.style, {
            backgroundColor: "#ff0000",
            fontWeight: "bold",
            color: "white",
            borderRadius: "50px",
            border: "2px solid black"
          });
        }

        const simbolo =
          index < 3 ? trofeus[index] :
          index < 10 ? simbolosExtras[index - 3] :
          "";

        li.innerHTML = `
          <div class="RankingGeal">
            <p class="simbolos">${simbolo}</p>
            <div class="avatarRankingGeral">
              <img src="${jogador.avatar}" alt="Avatar de ${jogador.id}">
            </div>
            ${jogador.id} - Nível Máximo ${jogador.nivelMaximo}
          </div>
        `;
        listaCompleta.appendChild(li);
      });
    }
  } catch (err) {
    console.error("🚫 Erro ao carregar ranking:", err);
    const listaCompleta = document.getElementById("listaRankingCompleto");
    if (listaCompleta) {
      listaCompleta.innerHTML = "<li>⚠️ Não foi possível carregar o ranking.</li>";
    }
  }
}

// ==================================================
// FUNÇÕES: mostrarRankingCompleto / fecharRanking
// Descrição: Controlam exibição da tela de ranking com animação
// ==================================================
function mostrarRankingCompleto() {
  const ranking = document.getElementById("rankingCompleto");
  if (!ranking) return;

  ranking.classList.remove("fade-out");
  ranking.classList.add("fade-in");
  ranking.style.display = "block";
}

function fecharRanking() {
  const ranking = document.getElementById("rankingCompleto");
  if (!ranking) return;

  ranking.classList.remove("fade-in");
  ranking.classList.add("fade-out");

  // Aguarda o fim da animação para esconder o elemento
  setTimeout(() => {
    ranking.style.display = "none";
  }, 300); // tempo deve bater com a duração da animação CSS
}


// ==================================================
// FUNÇÃO: atualizarVidas
// Descrição: Atualiza visual dos corações com base nas vidas restantes
// ==================================================
function atualizarVidas() {
  const container = document.getElementById("vidasContainer");
  if (!container) return;

  const coracaoCheio = "❤️";
  const coracaoVazio = "🤍";
  const totalVidas = 3;

  const vidasAtuais = typeof lives === "number" ? lives : 0;
  const coracoes = Array.from({ length: totalVidas }, (_, i) =>
    i < vidasAtuais ? coracaoCheio : coracaoVazio
  ).join("");

  container.textContent = coracoes;
}

// ==================================================
// FUNÇÃO: reiniciarJogo
// Descrição: Reinicia o jogo após Game Over e reseta estado
// ==================================================
async function reiniciarJogo() {
  pararGameOverLoop?.();
  pararCoroaLoop?.();

  currentLevel = 1;
  lives = 3;
  estadoDeTransicao = false;

  atualizarVidas();
  iniciarNivel();

  document.getElementById("palpite")?.removeAttribute("disabled");
  document.getElementById("enviarPalpite")?.removeAttribute("disabled");

  const nomeJogador = localStorage.getItem("nomeJogador");
  if (!nomeJogador) {
    console.warn("⚠️ Nome do jogador não encontrado no localStorage");
    return;
  }

  try {
    const resposta = await fetch(`${API_URL}/api/reiniciar-nivel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: nomeJogador }),
    });

    if (!resposta.ok) {
      const erro = await resposta.text();
      console.error("🚫 Erro ao reiniciar nível:", erro);
    }
  } catch (err) {
    console.error("🚫 Falha na comunicação com o servidor:", err);
  }

  transicaoDeTela("gameOverArea", "gameArea");
}

// ==================================================
// FUNÇÃO: continuarJogo
// Descrição: Continua o jogo após perder uma vida e atualiza servidor
// ==================================================
async function continuarJogo() {
  estadoDeTransicao = false;
  pararCoracaoLoop?.();

  const nomeJogador = localStorage.getItem("nomeJogador");
  if (!nomeJogador) {
    console.warn("⚠️ Nome do jogador não encontrado no localStorage");
    return;
  }

  try {
    const resposta = await fetch(`${API_URL}/api/atualizar-nivel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: nomeJogador,
        nivelAtual: currentLevel,
        vidas: lives,
      }),
    });

    if (!resposta.ok) {
      const erro = await resposta.text();
      console.error("🚫 Erro ao atualizar nível:", erro);
    }
  } catch (err) {
    console.error("🚫 Falha na comunicação com o servidor:", err);
  }

  iniciarNivel();
  transicaoDeTela("vidaPerdidaArea", "gameArea");
}

// ==================================================
// FUNÇÃO: limparInputPalpite
// Descrição: Limpa o campo de input do palpite
// ==================================================
function limparInputPalpite() {
  const input = document.getElementById("palpite");
  if (input) input.value = "";
}

// ==================================================
// FUNÇÃO: continuarVitoria
// Descrição: Avança para o próximo nível após vitória
// ==================================================
async function continuarVitoria() {
  estadoDeTransicao = false;
  pararConfetesLoop?.();
  pararTrofeuLoop?.();

  const nomeJogador = localStorage.getItem("nomeJogador");
  if (!nomeJogador) {
    console.warn("⚠️ Nome do jogador não encontrado no localStorage");
    return;
  }

  try {
    const resposta = await fetch(`${API_URL}/api/atualizar-nivel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: nomeJogador,
        nivelAtual: currentLevel,
        vidas: lives,
      }),
    });

    if (!resposta.ok) {
      const erro = await resposta.text();
      console.error("🚫 Erro ao atualizar nível após vitória:", erro);
    } else {
      await carregarRanking();
    }
  } catch (err) {
    console.error("🚫 Falha na comunicação com o servidor:", err);
  }

  transicaoDeTela("vitoriaArea", "gameArea");

  // Aguarda fim da animação antes de iniciar novo nível
  setTimeout(() => {
    iniciarNivel();
  }, 1000);
}

// ==================================================
// FUNÇÕES: mostrarRankingCompleto / voltarDoRanking
// Descrição: Controlam transição entre tela de jogo e ranking
// ==================================================
function mostrarRankingCompleto() {
  const rankingArea = document.getElementById("rankingArea");
  const gameArea = document.getElementById("gameArea");

  if (rankingArea && gameArea) {
    transicaoDeTela("gameArea", "rankingArea");
  } else {
    console.warn("⚠️ Áreas de ranking ou jogo não encontradas.");
  }
}

function voltarDoRanking() {
  const rankingArea = document.getElementById("rankingArea");
  const gameArea = document.getElementById("gameArea");

  if (rankingArea && gameArea) {
    localStorage.setItem("estadoTela", "jogo");
    transicaoDeTela("rankingArea", "gameArea");
  } else {
    console.warn("⚠️ Áreas de ranking ou jogo não encontradas.");
  }
}

// ==================================================
// FUNÇÕES DE EFEITO VISUAL: Confetes, Coração, Game Over, Troféu, Coroa
// Descrição: Criam e controlam animações visuais durante o jogo
// ==================================================
function estourarConfetes() {
  const container = document.getElementById("confeteExplosao");
  container.innerHTML = "";

  for (let i = 0; i < 40; i++) {
    const confete = document.createElement("span");
    confete.style.left = Math.random() * 100 + "%";
    confete.style.top = Math.random() * 20 + "%";
    confete.style.setProperty("--hue", Math.floor(Math.random() * 360));
    container.appendChild(confete);
  }

  setTimeout(() => {
    container.innerHTML = "";
  }, 2000);
}

function iniciarConfetesLoop() {
  estourarConfetes(); // dispara imediatamente
  confeteInterval = setInterval(estourarConfetes, 5000);
}

function pararConfetesLoop() {
  clearInterval(confeteInterval);
}

function estourarCoracao() {
  const el = document.getElementById("explosaoCoracao");
  el.innerHTML = ""; // limpa antes de criar novo

  const heart = document.createElement("span");
  heart.textContent = "💔";
  heart.classList.add("coracaoAnimado");

  void heart.offsetWidth;// Reinicia animação
  el.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, 1200);
}

function iniciarCoracaoLoop() {
  estourarCoracao(); // dispara imediatamente
  coracaoInterval = setInterval(estourarCoracao, 3000); // repete a cada 3s
}

function pararCoracaoLoop() {
  clearInterval(coracaoInterval);
}

function estourarGameOver() {
  const el = document.getElementById("explosaoGameOver");
  el.innerHTML = "";

  const ghost = document.createElement("span");
  ghost.textContent = "👻"; // ou "💀"
  ghost.classList.add("gameOverAnimado");

  void ghost.offsetWidth;

  el.appendChild(ghost);

  setTimeout(() => {
    ghost.remove();
  }, 2000);
}

function iniciarGameOverLoop() {
  estourarGameOver();
  gameOverInterval = setInterval(estourarGameOver, 3000);
}

function pararGameOverLoop() {
  clearInterval(gameOverInterval);
}

function estourarTrofeu() {
  const el = document.getElementById("explosaoTrofeu");
  el.innerHTML = "";

  const trofeu = document.createElement("span");
  trofeu.textContent = "🏆";
  trofeu.classList.add("trofeuAnimado");

  void trofeu.offsetWidth;

  el.appendChild(trofeu);

  setTimeout(() => {
    el.innerHTML = "";
  }, 1500);
}

function iniciarTrofeuLoop() {
  estourarTrofeu(); // dispara imediatamente
  TrofeuInterval = setInterval(estourarTrofeu, 3000); // repete a cada 3s
}

function pararTrofeuLoop() {
  clearInterval(TrofeuInterval);
}

function estourarCoroaFinal() {
  const el = document.getElementById("explosaoCoroa");
  el.innerHTML = "";

  const coroa = document.createElement("span");
  coroa.textContent = "👑";
  coroa.classList.add("coroaAnimada");

  void coroa.offsetWidth;

  el.appendChild(coroa);

  setTimeout(() => {
    el.innerHTML = "";
  }, 2000);
}

function iniciarCoroaLoop() {
  estourarCoroaFinal(); // dispara imediatamente
  coroaInterval = setInterval(estourarCoroaFinal, 3000); // repete a cada 3 segundos
}

function pararCoroaLoop() {
  clearInterval(coroaInterval);
}

// ==================================================
// FUNÇÃO: mostrarTelaMotivacional
// Descrição: Exibe tela final com mensagem personalizada
// ==================================================
function mostrarTelaMotivacional() {
  const nomeJogador = localStorage.getItem("nomeJogador") || "Jogador";

  const nomeFinal = document.getElementById("nomeFinal");
  const nomeFinal2 = document.getElementById("nomeFinal2");

  if (nomeFinal) nomeFinal.textContent = nomeJogador;
  if (nomeFinal2) nomeFinal2.textContent = nomeJogador;

  transicaoDeTela("vitoriaFinalArea", "telaMotivacional");
}

// ==================================================
// FRASES DE INTERAÇÃO COM O JOGADOR
// Descrição: Mensagens dinâmicas para cada situação do jogo
// ==================================================
const kickeItDown = [
  "🔻 Chutou baixo! Tenta mais alto.",
  "🎯 Ainda não, sobe esse numero!",
  "😎Quase lá, tenta um pouco mais alto!",
  "🧊Tá frio, mas sobe mais um pouco!",
  "🔥Tá esquentando, mas tenta mais alto!",
];

const kickedUp = [
  "🔺 Chutou alto! Tenta mais baixo.",
  "🎯Ainda não, desce esse numero!",
  "😎Quase lá, tenta um pouco mais baixo!",
  "🧊Tá frio, mas desce mais um pouco!",
  "🔥Tá esquentando, mas tenta mais baixo!",
];

const victory = [
  "🎉 Parabéns!, você acertou, vamos para Proxima?",
  "👏 Mandou bem, acertou em cheio.",
  "💪 Você é bom nisso, acertou em cheio",
  "🎉 Você é fera! vamos para o proximo nivel.",
];

const defait = [
  "💀 Game Over! Tente novamente.",
  "😵‍💫 Não foi dessa vez, mas não desista.",
  "👻 O numero secreto te assombrou dessa vez, tente novamente.",
  "💥 Você errou! mas não desista, tente novamente.",
];

const incentive = [
  "🚀 Vamos lá, você consegue!",
  "🔥 Não desista, você está quase lá!",
  "🌟 Acredite em si mesmo, você é capaz!",
  "💡 Cada tentativa te aproxima do sucesso!",
];

const attemptPhrases5 = [
  `🎯 Você ainda tem {X} tentativas. Respira e vai com calma.`,
  `💪 Tá tranquilo! {X} chances pra mostrar seu talento.`,
  `🧠 Use a cabeça, ainda tem {X} tentativas pra acertar.`,
  `😎 Jogo só começou! {X} chances na manga.`,
  `🚀 Bora aquecer! Ainda restam {X} tentativas.`,
];

const attemptPhrases3 = [
  `⚠️ Só {X} tentativas restantes. Começa a focar!`,
  `⏳ Tá ficando apertado… {X} chances pra virar o jogo.`,
  `🔍 Pensa bem! Só restam {X} tentativas.`,
  `🧩 Tá na metade do caminho. {X} chances pra resolver.`,
  `🎮 Jogo tá pegando ritmo! {X} tentativas restantes.`,
];

const attemptPhrases1 = [
  `🚨 Última chance! É agora ou nunca.`,
  `💣 Só {X} tentativa! Cada palpite conta.`,
  `🧊 Tá no limite! {X} chance pra salvar o jogo.`,
  `🔥 Tudo ou nada! {X} tentativa restantes.`,
  `🎯 Mira com precisão… só {X} chance sobrando`,
];

const outOfBounds = [
  "🧠 Esse número nem existe nesse nível, campeão!",
  "😅 Tá zuando, mane? Escolhe um número válido!",
  "📉 Esse chute foi tão fora que saiu do jogo.",
  "🚫 Número inválido! Joga dentro das regras, vai.",
];

const Bozz = [
  "🏆 Você venceu o chefão!",
  "🎉 Parabéns, campeão! Você dominou todos os níveis.",
  "👑 Agora é oficial: você é o mestre dos números!",
];
const gameOver = [
  "💀 O universo te apagou. Tudo recomeça.",
  "🧠 Brilhante... se errar fosse talento, você seria campeão.",
  "🚀 A nave explodiu. Missão abortada.",
  "🔁 Game Over. Mas a próxima tentativa pode ser lendária.",
];

// ==================================================
// FUNÇÃO: iniciarJogo
// Descrição: Inicia o jogo e exibe avatar gerado
// ==================================================
function iniciarJogo() {
  const nomeInput = document.getElementById("nome");
  const nome = nomeInput?.value.trim();

  if (!nome || nome.length < 3) {
    alert("Digite um nome válido com pelo menos 3 caracteres!");
    return;
  }

  const avatar = document.getElementById("avatar");
  if (avatar) {
    avatar.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(nome)}`;
    avatar.style.display = "block";
  }

  localStorage.setItem("nomeJogador", nome); // salva para uso posterior
  iniciarNivel();
}

// ==================================================
// FUNÇÃO: iniciarNivel
// Descrição: Define número secreto, tentativas e atualiza interface
// ==================================================
function iniciarNivel() {
  const min = 1;
  const max = multipliedByLevel(currentLevel);

  number = getNumberRandon(min, max);
  attempts = Math.ceil(Math.log2(max - min + 1));
  numberOfGuesses = 0;
  history = [];

  const nivelInfo = document.getElementById("nivelInfo");
  if (nivelInfo) {
    nivelInfo.innerHTML = `
      🧠 Nível ${currentLevel} — Adivinhe entre ${min} e ${max}.<br>
      Você tem ${attempts} tentativas.
    `;
  }

  const mensagemJogo = document.getElementById("mensagemJogo");
  if (mensagemJogo) mensagemJogo.textContent = "";

  const historico = document.getElementById("historico");
  if (historico) historico.textContent = "";

  atualizarVidas();
}

// ==================================================
// FUNÇÃO: jogar
// Descrição: Processa o palpite do jogador, verifica acerto, atualiza vidas e controla transições
// ==================================================
async function jogar() {
  if (estadoDeTransicao) return;
  const palpite = parseInt(document.getElementById("palpite").value);
  const mensagem = document.getElementById("mensagemJogo");
  const historico = document.getElementById("historico");

  // Validação do palpite
  if (isNaN(palpite)) {
    mensagem.innerHTML = "🚫 Digite um número válido!";
    return;
  }

  limparInputPalpite();

  const min = 1;
  const max = multipliedByLevel(currentLevel);

  // Verifica se o palpite está fora do intervalo permitido
  if (palpite < min || palpite > max) {
    mensagem.innerHTML = randomPhrase(outOfBounds);
    return;
  }

  // Verifica se o número já foi tentado
  if (history.includes(palpite)) {
    mensagem.innerHTML = "⚠️ Você já tentou esse número!";
    return;
  }

  history.push(palpite);
  numberOfGuesses++;
  const remainingAttempts = attempts - numberOfGuesses;

  // ==================================================
  // PALPITE CORRETO
  // ==================================================
  if (palpite === number) {
  limparInputPalpite();
  currentLevel++;

  try {
    await fetch(`${API_URL}/api/atualizar-nivel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: nomeJogador,
        nivelAtual: currentLevel,
        vidas: lives,
      }),
    });
    await carregarRanking();
  } catch (err) {}

  estadoDeTransicao = true;

  if (currentLevel > 10) {
    // Vitória final
    transicaoDeTela("gameArea", "vitoriaFinalArea");
    iniciarConfetesLoop();
    iniciarCoroaLoop();
    document.getElementById("mensagemFinalVitoria").innerHTML = `
      ${randomPhrase(Bozz)}<br> O número era ${number}.<br> 👑 Você zerou o jogo!
    `;
  } else {
    // Vitória comum
    transicaoDeTela("gameArea", "vitoriaArea"); 
    iniciarConfetesLoop();
    iniciarTrofeuLoop();
    document.getElementById("mensagemVitoria").innerHTML = `
      ${randomPhrase(victory)}<br> O número era ${number}.<br> 🎉 Vamos para o nível ${currentLevel}...
    `;
  }

  return;
}

  // ==================================================
  // PALPITE INCORRETO — mostra dica
  // ==================================================
  if (palpite < number) {
    mensagem.innerHTML = `${randomPhrase(kickeItDown)} <br>
    ${tentativePhraseGenerator(remainingAttempts)}`;
  } else {
    mensagem.innerHTML = `${randomPhrase(
      kickedUp
    )} <br> ${tentativePhraseGenerator(remainingAttempts)}`;
  }

  // Exibe histórico se modo fácil estiver ativado
  if (historicalShow) {
    historico.innerHTML = `📜 Palpites anteriores: ${history.join(", ")}`;
  }

  document.getElementById("palpite").value = "";

  // ==================================================
  // VERIFICA SE ACABARAM AS TENTATIVAS
  // ==================================================
  if (remainingAttempts === 0) {
    lives--;
    atualizarVidas();

    const nomeJogador = localStorage.getItem("nomeJogador");

    if (lives === 0) {
      // Game Over
      currentLevel = 1;
      estadoDeTransicao = true;

      const mensagemFinal = randomPhrase(gameOver);
      transicaoDeTela("gameArea", "gameOverArea");
      iniciarGameOverLoop();
      document.getElementById(
        "mensagemFinal"
      ).innerHTML = `${mensagemFinal} <br> O número era ${number}.`;

      document.getElementById("palpite").disabled = true;
      document.getElementById("enviarPalpite").disabled = true;

      limparInputPalpite();
      return;
    }
    if (lives > 0) {
      // Perdeu uma vida
      estadoDeTransicao = true;
      transicaoDeTela("gameArea", "vidaPerdidaArea");
      iniciarCoracaoLoop();
      document.getElementById(
        "mensagemVidaPerdida"
      ).innerHTML = `${randomPhrase(
        defait
      )}<br> O número secreto era ${number}. <br> Vidas restantes: ${lives} ❤️`;
      return;
    }
  }
}

// ==================================================
// FUNÇÕES AUXILIARES
// ==================================================

// Gera número aleatório entre min e max
function getNumberRandon(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Define o intervalo de números com base no nível
function multipliedByLevel(level) {
  if (level <= 5) return level * 20;
  if (level <= 9) return level * 100;
  return 1000;
}

// Seleciona frase aleatória de um array
function randomPhrase(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Gera frase de incentivo com base nas tentativas restantes
function tentativePhraseGenerator(remainingAttempts) {
  const selectedPhrases =
    remainingAttempts >= 5
      ? attemptPhrases5
      : remainingAttempts >= 2
      ? attemptPhrases3
      : attemptPhrases1;

  return randomPhrase(selectedPhrases).replace("{X}", remainingAttempts);
}

// ==================================================
// EVENTO: Enter no input de palpite
// ==================================================
const inputPalpite = document.getElementById("palpite");
if (inputPalpite) {
  inputPalpite.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      jogar();
    }
  });
}

