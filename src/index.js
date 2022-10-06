const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const foundUser = users.find((user) => user.username === username);

  request.user = foundUser;

  foundUser ? next() : response.status(404).json({ error: "User not found" });
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  if (users.find((user) => user.username === username))
    return response.status(400).json({ error: "Username already registered" });

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;

  return response.json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { id } = request.params;

  const { user } = request;

  const foundTodo = user.todos.find((todo) => todo.id === id);

  if (!foundTodo)
    return response.status(404).json({ error: "ToDo item not found" });

  foundTodo.title = title;
  foundTodo.deadline = new Date(deadline);

  return response.json(foundTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const foundTodo = user.todos.find((todo) => todo.id === id);

  if (!foundTodo)
    return response.status(404).json({ error: "ToDo item not found" });

  foundTodo.done = true;

  return response.json(foundTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { user } = request;

  const foundTodo = user.todos.find((todo) => todo.id === id);

  if (!foundTodo)
    return response.status(404).json({ error: "ToDo item not found" });

  user.todos.splice(foundTodo, 1);

  return response.status(204).json(user);
});

module.exports = app;