import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { JWT_EXPIRATION, JWT_SECRET_KEY } from "./settings.mjs";

import { insertUser, getUser } from "./db.mjs";

export const registerUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  const existingUser = await getUser.get({ $username: username });
  if (existingUser) {
    return res.status(400).json({ error: "Username already exists" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = await insertUser.get({
    $id: crypto.randomUUID(),
    $username: username,
    $password: hashedPassword,
  });

  return res
    .status(201)
    .json({ id: newUser.id, username: newUser.username });
};

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  const user = await getUser.get({ $username: username });

  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const token = jwt.sign(
    { user: { id: user.id, username: user.username } },
    JWT_SECRET_KEY,
    {
      expiresIn: JWT_EXPIRATION,
    }
  );

  res.json({
    username: user.username,
    token,
  });
};