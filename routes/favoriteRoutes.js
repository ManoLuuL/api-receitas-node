const pool = require("../db-connection");
const express = require("express");
const router = express.Router();

// Função para buscar os detalhes de uma receita no banco de dados
async function searchRecipeDetails(client, recipe_id) {
  const recipeQuery = await client.query(
    "SELECT * FROM Receitas WHERE id = $1",
    [recipe_id]
  );
  const recipe = recipeQuery.rows[0];

  if (!recipe) {
    return null;
  }

  // Consulta para buscar os ingredientes da receita
  const ingredientsQuery = await client.query(
    "SELECT ingredientes.nome, ingredientes.unidade_de_medida, ingrediente_receita.quantidade FROM ingredientes INNER JOIN ingrediente_receita ON ingredientes.id = ingrediente_receita.id_ingrediente WHERE ingrediente_receita.id_receita = $1",
    [recipe_id]
  );
  const recipe_ingredients = ingredientsQuery.rows.map((row) => ({
    nome: row.nome,
    unidade_de_medida: row.unidade_de_medida,
    quantidade: row.quantidade,
  }));

  const recipe_details = {
    id: recipe.id,
    nome: recipe.nome,
    modo_de_preparo: recipe.modo_de_preparo,
    rendimento: recipe.rendimento,
    diabetico: recipe.diabetico,
    vegetariano: recipe.vegetariano,
    vegano: recipe.vegano,
    alergico_a_lactose: recipe.alergico_a_lactose,
    ingredientes: recipe_ingredients,
  };

  return recipe_details;
}

router.post("/", async (req, res) => {
  try {
    const { id_usuario, id_receita } = req.body;

    if (!id_usuario || !id_receita) {
      return res
        .status(400)
        .json({ message: "Informe o ID do usuário e o ID da receita" });
    }

    const client = await pool.connect();

    // Inserir os dados na tabela Receitas_Favoritas
    await client.query(
      "INSERT INTO receitas_favoritas (id_usuario, id_receita) VALUES ($1, $2)",
      [id_usuario, id_receita]
    );
    client.release();

    res.json({ message: "Receita favorita salva com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erro ao salvar a receita favorita",
      error: error.message,
    });
  }
});

router.post("/check", async (req, res) => {
  try {
    const { id_usuario, id_receita } = req.body;

    if (!id_usuario || !id_receita) {
      return res
        .status(400)
        .json({ message: "Informe o ID do usuário e o ID da receita" });
    }

    const client = await pool.connect();

    // Verificar se a receita está na tabela de favoritas
    const result = await client.query(
      "SELECT 1 FROM receitas_favoritas WHERE id_usuario = $1 AND id_receita = $2",
      [id_usuario, id_receita]
    );
    const favorita = result.rows.length > 0;

    client.release();

    res.json({ favorita });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erro ao verificar se a receita é favorita",
      error: error.message,
    });
  }
});

router.post("/remover", async (req, res) => {
  try {
    const { id_usuario, id_receita } = req.body;

    if (!id_usuario || !id_receita) {
      return res
        .status(400)
        .json({ message: "Informe o ID do usuário e o ID da receita" });
    }

    const client = await pool.connect();

    // Remover a receita da lista de favoritas
    await client.query(
      "DELETE FROM receitas_favoritas WHERE id_usuario = $1 AND id_receita = $2",
      [id_usuario, id_receita]
    );
    client.release();

    res.json({
      message: "Receita removida da lista de favoritas com sucesso!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erro ao remover a receita da lista de favoritas",
      error: error.message,
    });
  }
});

router.get("/:id_usuario", async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const client = await pool.connect();

    const result = await client.query(
      "SELECT id_receita FROM receitas_favoritas WHERE id_usuario = $1",
      [id_usuario]
    );
    const recipes_favorite_ids = result.rows.map((row) => row.id_receita);

    const recipes_favorites = [];
    for (const recipe_id of recipes_favorite_ids) {
      const recipe_details = await searchRecipeDetails(client, recipe_id);
      if (recipe_details) {
        recipes_favorites.push(recipe_details);
      }
    }

    client.release();

    res.json(recipes_favorites);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erro ao buscar as receitas favoritas",
      error: error.message,
    });
  }
});

module.exports = router;
