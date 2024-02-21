const express = require("express");
const router = express.Router();
const User = require("../models/User");
const pool = require("../db-connection");

router.get("/", async (req, res) => {
  const client = await pool.connect();

  try {
    const result = await client.query("SELECT * FROM users");
    const users = result.rows;
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

router.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT * FROM users WHERE id = $1", [
      user_id,
    ]);
    const user = result.rows[0];
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "Usuário não encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

router.post("/", async (req, res) => {
  const user_data = req.body;

  try {
    const user = new User(user_data);

    const client = await pool.connect();
    const result = await client.query(
      "INSERT INTO users (nome, email, senha, idade, diabetico, vegetariano, vegano, alergico_a_lactose) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
      [
        user.nome,
        user.email,
        user.senha,
        user.idade,
        user.diabetico,
        user.vegetariano,
        user.vegano,
        user.alergico_a_lactose,
      ]
    );

    const user_id = result.rows[0].id;
    user.id = user_id;

    res.status(201).json({
      message: "Usuário criado com sucesso!",
      data: true,
      user: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Erro ao criar usuário: ${error.message}`,
      data: false,
    });
  }
});

router.put("/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const user_data = req.body;

  try {
    const client = await pool.connect();

    // Verifica se o usuário existe antes de atualizar
    const existingUserQuery = await client.query(
      "SELECT * FROM users WHERE id = $1",
      [user_id]
    );
    const existingUser = existingUserQuery.rows[0];

    if (!existingUser) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Cria um objeto com os campos a serem atualizados
    const updateFields = {
      nome: user_data.nome || existingUser.nome,
      email: user_data.email || existingUser.email,
      idade: user_data.idade || existingUser.idade,
      diabetico: user_data.diabetico || existingUser.diabetico,
      vegetariano: user_data.vegetariano || existingUser.vegetariano,
      vegano: user_data.vegano || existingUser.vegano,
      alergico_a_lactose:
        user_data.alergico_a_lactose || existingUser.alergico_a_lactose,
    };

    // Atualiza o usuário
    await client.query(
      "UPDATE users SET nome = $1, email = $2, idade = $3, diabetico = $4, vegetariano = $5, vegano = $6, alergico_a_lactose = $7 WHERE id = $8",
      [
        updateFields.nome,
        updateFields.email,
        updateFields.idade,
        updateFields.diabetico,
        updateFields.vegetariano,
        updateFields.vegano,
        updateFields.alergico_a_lactose,
        user_id,
      ]
    );

    res.status(200).json({ message: "Usuário atualizado com sucesso" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: `Erro ao atualizar usuário: ${error.message}` });
  }
});

router.put("/:user_id/change-password", async (req, res) => {
  const { user_id } = req.params;
  const { nova_senha: new_password } = req.body;

  try {
    if (!new_password)
      return res.status(400).json({ message: "Nova senha não fornecida!" });

    const client = await pool.connect();

    const existingUserQuery = await client.query(
      "SELECT * FROM users WHERE id = $1",
      [user_id]
    );
    const existingUser = existingUserQuery.rows[0];

    if (!existingUser)
      return res.status(400).json({ message: "Usuário não encontrado!" });

    await client.query("UPDATE users SET senha = $1 WHERE id = $2", [
      new_password,
      user_id,
    ]);

    res
      .status(200)
      .json({ message: "Senha do usuário atualizada com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erro ao atualizar a senha do usuário: ${error.message}",
    });
  }
});

module.exports = router;
