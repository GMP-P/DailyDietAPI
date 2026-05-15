<h1 align="center"> Daily Diet API </h1>

<p align="center">
API desenvolvida como desafio prático para controle de dieta diária, permitindo o cadastro de usuários, registro de refeições e acompanhamento de métricas alimentares.
</p>

<p align="center">
  <a href="#-tecnologias">Tecnologias</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-projeto">Projeto</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-regras-da-aplicação">Regras da aplicação</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-como-executar">Como executar</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#memo-licença">Licença</a>
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/static/v1?label=license&message=MIT&color=49AA26&labelColor=000000">
</p>

<br>

## 🚀 Tecnologias

Esse projeto foi desenvolvido com as seguintes tecnologias:

- Node.js
- TypeScript
- Fastify
- Knex.js
- SQLite
- Vitest
- Supertest
- Zod

## 💻 Projeto

A Daily Diet API é uma aplicação para controle de dieta diária.

Através dela, é possível criar usuários, registrar refeições, informar se cada refeição está dentro ou fora da dieta e consultar métricas gerais sobre os hábitos alimentares do usuário.

Cada refeição pertence a um usuário específico, garantindo que apenas o próprio usuário possa visualizar, editar ou remover suas refeições.

## 📋 Regras da aplicação

A aplicação possui as seguintes funcionalidades:

- Criar um usuário
- Identificar o usuário entre as requisições
- Registrar uma refeição feita
- Editar uma refeição
- Apagar uma refeição
- Listar todas as refeições de um usuário
- Visualizar uma única refeição
- Recuperar métricas de um usuário

As refeições possuem as seguintes informações:

- Nome
- Descrição
- Data e hora
- Informação se está dentro ou fora da dieta
- Usuário relacionado

As métricas disponíveis são:

- Quantidade total de refeições registradas
- Quantidade total de refeições dentro da dieta
- Quantidade total de refeições fora da dieta
- Melhor sequência de refeições dentro da dieta

## ⚙️ Como executar

Clone o repositório:

```bash
git clone https://github.com/SEU_USUARIO/DailyDietAPI.git

```

Instale as dependências:

```bash
npm i

```

Execute as migrations:

```bash
npm run knex --migrate:latest

```