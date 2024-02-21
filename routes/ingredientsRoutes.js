const express = require("express");
const router = express.Router();
const pool = require("../db-connection");

// Endpoint para obter todos os ingredientes
router.get("/", async (req, res) => {
  const client = await pool.connect();

  try {
    const ingredientsQuery = await client.query(
      "SELECT id, nome FROM ingredientes"
    );
    const ingredients = ingredientsQuery.rows.map((row) => ({
      id: row.id,
      descricao: row.nome,
    }));

    res.json(ingredients);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erro ao obter todos os ingredientes",
      error: error.message,
    });
  } finally {
    client.release();
  }
});

module.exports = router;
