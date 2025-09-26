/**
 * Projeto: Jogo Logoritmos
 * Autor: Tiago Oliveira
 * Descrição: Script principal do jogo — controle de telas, cadastro, login, histórico e animações
 * Última atualização: 25/09/2025
 */
const API_URL = location.hostname === "localhost"
  ? "http://localhost:3000"
  : "https://seu-backend.vercel.app";
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
  const nome = nomeInput.value.trim();
  const logarDireto = document.getElementById("logarDireto").checked;
  const mensagem = document.getElementById("mensagemCadastro");
  const avatarCadastro = document.getElementById("avatarCadastro");

  if (!nome) {
    alert("Digite um nome válido!");
    return;
  }

  // Gera avatar aleatório com DiceBear
  const estilos = ["bottts", "adventurer", "fun-emoji", "lorelei", "thumbs", "shapes", "notionists"];
  const estiloAleatorio = estilos[Math.floor(Math.random() * estilos.length)];
  const avatarUrl = `https://api.dicebear.com/7.x/${estiloAleatorio}/svg?seed=${encodeURIComponent(nome)}`;

  // Envia dados para o backend hospedado na Vercel
  const resposta = await fetch(`${API_URL}/cadastro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: nome, avatar: avatarUrl }),
  });

  const texto = await resposta.text();

  if (resposta.ok) {
    // ✅ Cadastro bem-sucedido
    mensagem.textContent = "✅ " + texto;
    mensagem.style.color = "green";

    // Atualiza nome do jogador
    const nomeJogador = document.getElementById("nomeJogador");
    if (nomeJogador) {
      nomeJogador.textContent = `👤 Jogador: ${nome}`;
      console.log("Nome do jogador:", nome);
    }

    // Aguarda carregamento do avatar antes da transição
    const avatarBoasVindas = document.getElementById("avatarBoasVindas");
    const imgTemp = new Image();
    imgTemp.onload = () => {
      avatarBoasVindas.src = avatarUrl;
      avatarBoasVindas.style.display = "block";
      transicaoDeTela("formulario", "welcomeArea");
    };
    imgTemp.src = avatarUrl;

    // Atualiza avatares
    avatarCadastro.src = avatarUrl;
    avatarCadastro.style.display = "block";

    const avatarJogo = document.getElementById("avatarJogo");
    if (avatarJogo) {
      avatarJogo.src = avatarUrl;
      avatarJogo.style.display = "block";
    }

    // Salva dados localmente
    localStorage.setItem("estadoTela", "boasVindas");
    localStorage.setItem("nomeJogador", nome);
    localStorage.setItem("avatarJogador", avatarUrl);

    // Salva histórico inicial
    const palpitesIniciais = ["5", "8", "3"];
    salvarHistorico(nome, palpitesIniciais);

    nomeInput.value = nome;

    // Faz login automático após cadastro
    await login();

  } else if (texto === "Usuário já existe") {
    // ⚠️ Nome já cadastrado
    mensagem.textContent = "⚠️ Usuário já existe. Escolha outro nome.";
    mensagem.style.color = "orange";
    nomeInput.value = "";
    avatarCadastro.style.display = "none";

    document.getElementById("logarDireto").checked = false;
    atualizarBotao();

  } else {
    // ⚠️ Outro erro
    mensagem.textContent = "⚠️ " + texto;
    mensagem.style.color = "red";
    avatarCadastro.style.display = "none";
  }
}

// ==================================================
// FUNÇÃO: login
// Descrição: Realiza login do jogador e atualiza interface com dados do servidor
// ==================================================
async function login() {
  const nome = document.getElementById("nome").value;

  const resposta = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: nome }),
  });

  const mensagem = document.getElementById("mensagemCadastro");
  const avatarJogo = document.getElementById("avatarJogo");

  if (resposta.ok) {
    const dados = await resposta.json();

    currentLevel = dados.dados.nivel;
    lives = typeof dados.dados.vidas === "number" ? dados.dados.vidas : 3;
    atualizarVidas();

    mensagem.textContent = "🛸 " + dados.mensagem;
    mensagem.style.color = "blue";

    if (dados.dados && dados.dados.avatar) {
      avatarJogo.src = dados.dados.avatar;
      avatarJogo.style.display = "block";

      localStorage.setItem("avatarJogador", dados.dados.avatar);
      localStorage.setItem("nomeJogador", nome);
    }

    document.querySelector(".formulario").style.display = "none";
    document.getElementById("welcomeArea").style.display = "block";

    const avatarBoasVindas = document.getElementById("avatarBoasVindas");
    if (avatarBoasVindas) {
      avatarBoasVindas.src = dados.dados.avatar;
      avatarBoasVindas.style.display = "block";
    }

    const nomeJogador = document.getElementById("nomeJogador");
    if (nomeJogador) {
      nomeJogador.textContent = ` olá ${nome}`;
    }
  } else {
    mensagem.textContent = "🚫 " + (await resposta.text());
    mensagem.style.color = "red";
    avatarJogo.style.display = "none";
    console.log("Resposta do servidor:", resposta.status);
  }

  await carregarRanking();
}

// ==================================================
// FUNÇÃO: salvarHistorico
// Descrição: Envia histórico de palpites para o servidor (ranking e modo fácil)
// ==================================================
async function salvarHistorico(nomeDoJogador, palpites) {
  try {
    await fetch(`${API_URL}/salvar-historico`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: nomeDoJogador,
        historico: palpites,
      }),
    });
  } catch (err) {}
}

// ==================================================
// EVENTO: DOMContentLoaded
// Descrição: Executa ao carregar a página e exibe a tela correta com base no localStorage
// ==================================================
window.addEventListener("DOMContentLoaded", async () => {
  if (telaEmTransicao) return;
  atualizarBotao();

  const estado = localStorage.getItem("estadoTela");
  const nome = localStorage.getItem("nomeJogador");

  if (estado === "jogo" && nome) {
    document.getElementById("nome").value = nome;
    await login();
    document.getElementById("welcomeArea").style.display = "none";
    document.getElementById("gameArea").style.display = "block";
    iniciarNivel();
  } else if (estado === "boasVindas" && nome) {
    document.getElementById("nome").value = nome;
    document.querySelector(".formulario").style.display = "none";
    document.getElementById("welcomeArea").style.display = "block";
  } else {
    // Estado inicial
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
  const nome = document.getElementById("nome").value.trim();
  if (!nome) return alert("Digite seu nome!");

  // Salva estado e modo de jogo
  localStorage.setItem("estadoTela", "jogo");
  localStorage.setItem("nomeJogador", nome);

  const modoSelecionado = document.querySelector('input[name="modo"]:checked').value;
  localStorage.setItem("modoJogo", modoSelecionado);
  historicalShow = modoSelecionado === "facil";

  // Exibe tela do jogo e oculta as demais
  document.querySelector(".formulario").style.display = "none";
  document.getElementById("welcomeArea").style.display = "none";
  document.getElementById("gameArea").style.display = "block";

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
  iniciarNivel();
  atualizarVidas();
  carregarRanking();
}

// ==================================================
// FUNÇÃO: sairDoJogo
// Descrição: Retorna à tela de cadastro e limpa dados visuais
// ==================================================
function sairDoJogo() {
  localStorage.setItem("estadoTela", "formulario"); // ✅ atualiza estado

  document.getElementById("vidasContainer").textContent = "";
  document.getElementById("gameArea").style.display = "none";
  document.getElementById("welcomeArea").style.display = "none";
  document.querySelector(".formulario").style.display = "block";
}

// ==================================================
// EVENTO: DOMContentLoaded
// Descrição: Executa ao carregar a página e restaura estado salvo
// ==================================================
window.addEventListener("DOMContentLoaded", () => {
  atualizarBotao();
  carregarRanking();

  const estado = localStorage.getItem("estadoTela");
  const nome = localStorage.getItem("nomeJogador");
  const avatar = localStorage.getItem("avatarJogador");

  if (estado === "jogo" && nome && avatar) {
    document.querySelector(".formulario").style.display = "none";
    document.getElementById("welcomeArea").style.display = "none";
    document.getElementById("gameArea").style.display = "block";

    const avatarJogo = document.getElementById("avatarJogo");
    avatarJogo.src = avatar;
    avatarJogo.style.display = "block";

    const nomeJogador = document.getElementById("nomeJogador");
    nomeJogador.textContent = `👤 Jogador: ${nome}`;

    iniciarNivel();
    atualizarVidas();
    carregarRanking();
  }
});

// ==================================================
// FUNÇÃO: carregarRanking
// Descrição: Busca ranking do servidor e atualiza Top 3 e lista completa
// ==================================================
async function carregarRanking() {
  try {
    const resposta = await fetch(`${API_URL}/ranking`);
    const ranking = await resposta.json();

    const nomeAtual = localStorage.getItem("nomeJogador");
    const trofeus = ["🥇", "🥈", "🥉"]; // Troféus para os 3 primeiros
    const simbolosExtras = ["🎖️", "🎗️", "⭐", "🌟", "🔰", "🪐", "🚀"];


    // Atualiza Top 3
    const topRanking = document.getElementById("topRanking");
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

    // Atualiza ranking completo
    const listaCompleta = document.getElementById("listaRankingCompleto");
    listaCompleta.innerHTML = "";
    ranking.forEach((jogador, index) => {
      const li = document.createElement("li");

      if (jogador.id === nomeAtual) {
        li.style.backgroundColor = "#ff0000";
        li.style.fontWeight = "bold";
        li.style.color = "white"
        li.style.borderRadius = "50px"
        li.style.border = "2px solid black"
      }

      const simbolo = index < 3 
  ? trofeus[index] 
  : index < 10 
    ? simbolosExtras[index - 3] 
    : "";

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
  } catch (err) {
    console.error("Erro ao carregar ranking:", err);
  }
}

// ==================================================
// FUNÇÕES: mostrarRankingCompleto / fecharRanking
// Descrição: Controlam exibição da tela de ranking com animação
// ==================================================
function mostrarRankingCompleto() {
  const ranking = document.getElementById("rankingCompleto");
  ranking.classList.remove("fade-out");
  ranking.classList.add("fade-in");
  ranking.style.display = "block";
}

function fecharRanking() {
  const ranking = document.getElementById("rankingCompleto");
  ranking.classList.remove("fade-in");
  ranking.classList.add("fade-out");
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

  let coracoes = "";
  for (let i = 0; i < totalVidas; i++) {
    coracoes += i < lives ? coracaoCheio : coracaoVazio;
  }

  container.textContent = `${coracoes}`;
}

// ==================================================
// FUNÇÃO: reiniciarJogo
// Descrição: Reinicia o jogo após Game Over e reseta estado
// ==================================================
async function reiniciarJogo() {
  pararGameOverLoop();
  pararCoroaLoop();

  currentLevel = 1;
  lives = 3;
  estadoDeTransicao = false;

  atualizarVidas();
  iniciarNivel();

  document.getElementById("palpite").disabled = false;
  document.getElementById("enviarPalpite").disabled = false;

  const nomeJogador = localStorage.getItem("nomeJogador");

  await fetch(`${API_URL}/reiniciar-nivel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: nomeJogador }),
  });
  transicaoDeTela("gameOverArea", "gameArea");
}

// ==================================================
// FUNÇÃO: continuarJogo
// Descrição: Continua o jogo após perder uma vida e atualiza servidor
// ==================================================
async function continuarJogo() {
  estadoDeTransicao = false;

  pararCoracaoLoop();

  const nomeJogador = localStorage.getItem("nomeJogador");

  await fetch(`${API_URL}/atualizar-nivel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: nomeJogador,
      nivelAtual: currentLevel,
      vidas: lives,
    }),
  });

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

  const nomeJogador = localStorage.getItem("nomeJogador");

  try {
    await fetch(`${API_URL}/atualizar-nivel`, {
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
  pararConfetesLoop();
  pararTrofeuLoop();
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
  transicaoDeTela("gameArea", "rankingArea");
}

function voltarDoRanking() {
  localStorage.setItem("estadoTela", "jogo");
  transicaoDeTela("rankingArea", "gameArea");
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
  document.getElementById("nomeFinal").textContent = nomeJogador;
  document.getElementById("nomeFinal2").textContent = nomeJogador;

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
  nome = document.getElementById("nome").value.trim();
  if (!nome) return alert("Digite seu nome!");

  document.getElementById(
    "avatar"
  ).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${nome}`;
  document.getElementById("avatar").style.display = "block";

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
    nivelInfo.innerHTML = `🧠 Nível ${currentLevel} — Adivinhe entre ${min} e ${max}.<br> Você tem ${attempts} tentativas.`;
  }

  const mensagemJogo = document.getElementById("mensagemJogo");
  if (mensagemJogo) {
    mensagemJogo.innerHTML = "";
  }

  const historico = document.getElementById("historico");
  if (historico) {
    historico.innerHTML = "";
  }
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
    await fetch(`${API_URL}/atualizar-nivel`, {
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
  let selectedPhrases =
    remainingAttempts >= 5
      ? attemptPhrases5
      : remainingAttempts >= 2
      ? attemptPhrases3
      : attemptPhrases1;

  return selectedPhrases[
    Math.floor(Math.random() * selectedPhrases.length)
  ].replace("{X}", remainingAttempts);
}

// ==================================================
// EVENTO: Enter no input de palpite
// Descrição: Permite enviar palpite pressionando Enter
// ==================================================
document.getElementById("palpite")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); 
      jogar(); 
    }
  });

