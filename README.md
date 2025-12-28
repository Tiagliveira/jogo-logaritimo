# 🎮 Jogo Logaritmo - Desafio de Lógica & Algoritmos

> **"Não é sorte, é lógica."** — Um projeto de Full Stack focado em Algoritmos de Busca, UX e Gamificação.

![Badge Concluído](https://img.shields.io/badge/STATUS-CONCLUÍDO-brightgreen)
![Node.js](https://img.shields.io/badge/Back--End-Node.js-339933)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57)

---

## Sobre o Projeto

Este projeto nasceu de um estudo profundo sobre **Lógica de Programação e Estrutura de Dados**, inspirado no conceito de **Complexidade de Algoritmos (Big O)** e Busca Binária.

O objetivo foi transformar um exercício clássico de terminal em uma aplicação web rica, com identidade visual própria, sistema de ranking e persistência de dados.

### O Conceito Matemático (Por que "Logaritmo"?)
Diferente de jogos de adivinhação baseados em sorte pura, este jogo educa o usuário intuitivamente a utilizar a **Busca Binária**.
* A quantidade de tentativas não é aleatória; ela é calculada matematicamente com base no tamanho do intervalo numérico do nível.
* O jogo prova que, com a estratégia certa (dividindo o problema ao meio), é possível encontrar qualquer número dentro do limite de tentativas.

---

## Regras de Negócio e Mecânicas de Jogo

Implementei um sistema robusto de gerenciamento de estado para controlar a progressão do usuário:

### 1. Sistema de Vidas vs. Tentativas (State Management)
O jogo diferencia falhas parciais de falhas totais:
* **❤️ 3 Vidas Globais:** O jogador inicia com 3 vidas.
* **🔢 Tentativas por Nível:** Calculadas dinamicamente.
* **Soft Reset:** Se as tentativas acabam, o jogador perde **1 Vida**, mas reinicia o **mesmo nível**.
* **Hard Reset (Game Over):** Se as 3 vidas acabarem, ocorre o reset total e o jogador volta para o **Nível 1**.

### 2. Feedback e Personalidade (UX)
A aplicação possui uma "alma" própria para engajar o usuário:
* **🤖 "Trash Talk":** O sistema provoca o usuário de forma bem-humorada quando ele comete erros lógicos (ex: chutar um número fora do intervalo).
* **🧭 Dicas Direcionais:** Feedback visual indicando se o número secreto é maior ou menor.
* **🏆 Recompensa Final:** Ao atingir o Nível 10, o sistema exibe uma mensagem motivacional (inspirada em Napoleon Hill), recompensando a persistência.

---

## Tecnologias Utilizadas

### Front-End
* **HTML5 & CSS3:** Animações nativas (`keyframes`) para números "nascendo" e feedback visual.
* **Design Responsivo:** Interface adaptada para Mobile e Desktop.

### Back-End
* **Node.js & Express:** API RESTful para gerenciar a lógica do jogo.
* **SQLite:** Banco de dados relacional para persistência do Ranking.
* **API Integration:** Integração com API externa para geração automática de **Avatars** baseados no nickname do usuário.

---

## Screenshots

<p align="center">
<img src="assets/imagenReadme.PNG" alt="Logo do Jogo" width="400px" margin="auto" />
</p>

---

## Como Rodar Localmente

```bash
# 1. Clone o repositório
git clone [https://github.com/Tiagliveira/jogo-logaritimo.git](https://github.com/Tiagliveira/jogo-logaritimo.git)

# 2. Instale as dependências
npm install

# 3. Inicie o servidor
npm start

# 4. Acesse no navegador
http://localhost:3000
---
````

## Endpoints da API (Resumo)
A lógica do jogo é servida através de uma API estruturada:

| Rota                  | Método | Descrição                                                                 |
|-----------------------|--------|---------------------------------------------------------------------------|
| `/cadastro`           | POST   | Cadastra novo jogador com ID e avatar                                     |
| `/login`              | POST   | Realiza login e retorna dados do jogador                                 |
| `/salvar-historico`   | POST   | Salva histórico de partidas em formato JSON                              |
| `/verificar-id`       | POST   | Verifica se um ID já está cadastrado                                     |
| `/atualizar-ranking`  | POST   | Atualiza nível e vidas, e salva novo ranking se for maior                |
| `/atualizar-nivel`    | POST   | Atualiza nível atual e vidas do jogador                                  |
| `/reiniciar-nivel`    | POST   | Reseta nível para 1 e vidas para 3                                       |
| `/ranking`            | GET    | Retorna os 10 jogadores com maior nível máximo                           |

---

## Links do Projeto

 [Acesse o jogo online aqui](https://jogo-logaritimo.onrender.com/)
 [Veja o código fonte no GitHub](https://github.com/Tiagliveira/jogo-logaritimo)

 ## 👨‍💻 Autor
Tiago Oliveira Desenvolvedor Full Stack em transição de carreira, apaixonado por transformar lógica complexa em experiências de usuário fluidas.
