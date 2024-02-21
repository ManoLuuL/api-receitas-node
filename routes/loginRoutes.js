const express = require("express");
const router = express.Router();
const pool = require("../db-connection");

router.post("/", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const client = await pool.connect();

    const loginQuery = await client.query(
      "SELECT * FROM users WHERE email = $1 AND senha = $2",
      [email, senha]
    );
    const userData = loginQuery.rows[0];

    if (userData) {
      delete userData.senha;
      res.status(200).json({ message: "Login Bem-sucedido!", data: userData });
    } else {
      res.status(401).json({ message: "Credenciais inválidas", data: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message, data: false });
  }
});

module.exports = router;
