import * as db  from "./db.mjs";
import crypto from "crypto";

export const allTodos = (req, res) => {
  const userId = req.user.user.id;
  const allTodos = db.getAllTodos.all({ $userId: userId });

  return res.status(200).json(
    allTodos.map((todo) => ({
      id: todo.id,
      text: todo.text,
      done: Boolean(todo.done),
    }))
  );
}

export const createTodo = (req, res) => {
  const text = req.body.text?.trim();
  const userId = req.user.user.id; 

  if (!text || text.length === 0) {
    return res.status(400).json({ error: "Text is required" });
  }

  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  const newId = crypto.randomUUID();

  const newTodo = db.insertTodo.get({ $id: newId, $text: text, $userId: userId });

  return res.status(201).json({
    id: newTodo.id,
    text: newTodo.text,
    done: Boolean(newTodo.done),
    userId: newTodo.userId,
  });
};

export const updateTodo = (req, res) => {
  const id = req.params.id;
  const userId = req.user.user.id;

  const todo = db.getTodo.get({ $id: id, $userId: userId });

  if (!todo) {
    return res.status(404).json({ error: "Todo not found or not owned by user" });
  }

  const isTextUpdated = req.body.text !== undefined && req.body.text !== null;
  const isDoneUpdated = req.body.done !== undefined && req.body.done !== null;

  if (!isTextUpdated && !isDoneUpdated) {
    return res.status(400).json({ error: "Text or done is required" });
  }

  const newText = isTextUpdated ? req.body.text.trim() : todo.text;
  const newDone = isDoneUpdated ? Boolean(req.body.done) : todo.done;

  if (isTextUpdated && newText.length === 0) {
    return res.status(400).json({ error: "Text should not be empty" });
  }

  const updatedTodo = db.updateTodo.get({
    $id: id,
    $text: newText,
    $done: newDone,
    $userId: userId,
  });

  if (!updatedTodo) {
    return res.status(404).json({ error: "Todo not found or not owned by user during update" });
  }

  return res.status(200).json({
    id: updatedTodo.id,
    text: updatedTodo.text,
    done: Boolean(updatedTodo.done),
    userId: updatedTodo.userId,
  });
}