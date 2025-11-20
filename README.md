# 🎮 Jogo logaritimo – API com Node.js, Express e SQLite
<p align="center">
<img src="assets/imagenReadme.PNG" alt="Logo do Jogo" width="400px" margin="auto" />
</p>
Este é o backend de um jogo desenvolvido como projeto de estudo, utilizando Node.js com Express e banco de dados SQLite. A aplicação está hospedada na plataforma Render e oferece funcionalidades completas de cadastro, login, ranking e histórico de jogadores.

---

## Tecnologias Utilizadas

- **Node.js + Express** – Servidor leve e eficiente
- **SQLite3** – Banco de dados local e persistente
- **Render** – Hospedagem gratuita com suporte a arquivos
- **CORS** – Liberação de acesso entre domínios
- **dotenv** – Gerenciamento de variáveis de ambiente

---

## Funcionalidades da API

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
