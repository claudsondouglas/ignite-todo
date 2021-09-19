const express = require('express');
const cors = require('cors');

const { v4: uuid } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  request.user = users.find(user => user.username === request.headers.username)
  return !!!request.user ? response.status(400).json({ error: 'User not found!'}) : next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  if(users.some(user => user.username === username)) return response.status(400).json({ error: 'User already exists!'})

  const account = {
    id: uuid(),
    name: name,
    username: username,
    todos: []
  }

  users.push(account)

  return response.status(201).json(account);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const todo = { 
    id: uuid(),
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(todo);

  response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const { title, deadline } = request.body

  const todo = user.todos.find(todo => todo.id === id)
  
  if(!!!todo) return response.status(404).json({ error: 'todo doesn\'t exists!'})

  todo.title = title;
  todo.deadline = new Date(deadline)
  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const { title, deadline } = request.body

  const todo = user.todos.find(todo => todo.id === id)
  
  if(!!!todo) return response.status(404).json({ error: 'todo doesn\'t exists!'})

  todo.done = true;
  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todo = user.todos.find(todo => todo.id === id)
  
  if(!!!todo) return response.status(404).json({ error: 'todo doesn\'t exists!'})
  user.todos.splice(todo, 1)
  return response.status(204).send();
});

module.exports = app;