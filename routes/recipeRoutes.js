const express = require("express");
const router = express.Router();
const pool = require("../db-connection");

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

// Endpoint para buscar todas as receitas
router.get("/", async (req, res) => {
  const client = await pool.connect();

  try {
    // Consulta para buscar todos os IDs das receitas
    const recipeQuery = await client.query("SELECT id FROM receitas");
    const recipes_ids = recipeQuery.rows.map((row) => row.id);

    const all_recipes = [];
    for (const recipe_id of recipes_ids) {
      const recipe_details = await searchRecipeDetails(client, recipe_id);
      if (recipe_details) {
        all_recipes.push(recipe_details);
      }
    }

    res.json(all_recipes);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erro ao buscar receitas", error: error.message });
  } finally {
    client.release();
  }
});

// Endpoint para buscar receitas com determinados ingredientes usando POST
router.post("/", async (req, res) => {
  const { ingredientes_ids } = req.body;

  if (!ingredientes_ids || ingredientes_ids.length === 0) {
    return res.status(400).json({
      message: "Informe os IDs dos ingredientes no corpo da requisição",
    });
  }

  const client = await pool.connect();

  try {
    // Consulta para buscar as receitas que possuem pelo menos um dos ingredientes fornecidos
    const recipesQuery = await client.query(
      "SELECT DISTINCT id_receita FROM ingrediente_receita WHERE id_ingrediente = ANY($1)",
      [ingredientes_ids]
    );
    const recipes_ids = recipesQuery.rows.map((row) => row.id_receita);

    const all_recipes = [];
    for (const recipe_id of recipes_ids) {
      const recipe_details = await searchRecipeDetails(client, recipe_id);
      if (recipe_details) {
        all_recipes.push(recipe_details);
      }
    }

    if (all_recipes.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhuma receita encontrada com esses ingredientes" });
    }

    res.json(all_recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erro ao buscar receitas por ingredientes",
      error: error.message,
    });
  } finally {
    client.release();
  }
});

// Endpoint para buscar receitas por ingredientes e restrições usando POST
router.post("/buscar_por_ingredientes_e_restricoes", async (req, res) => {
  try {
    const { ingredientes_ids, restricoes = [] } = req.body;

    if (!ingredientes_ids || ingredientes_ids.length === 0) {
      return res.status(400).json({
        message: "Informe os IDs dos ingredientes no corpo da requisição",
      });
    }

    const client = await pool.connect();

    // Monta a condição para as restrições
    let condition_restrictions = "";
    for (const restriction of restricoes) {
      if (
        ["diabetico", "vegetariano", "vegano", "alergico_a_lactose"].includes(
          restriction.toLowerCase()
        )
      ) {
        condition_restrictions += ` AND ${restriction.toLowerCase()} = TRUE`;
      }
    }

    // Filtra as receitas se houver pelo menos um ingrediente fornecido
    // Caso contrário, traz todas as receitas
    let query;
    if (ingredientes_ids.length > 0) {
      query = `
          SELECT DISTINCT id_receita 
          FROM ingrediente_receita 
          JOIN receitas ON ingrediente_receita.id_receita = receitas.id
          WHERE id_ingrediente = ANY($1) ${condition_restrictions}
        `;
    } else {
      query = `
          SELECT DISTINCT id
          FROM receitas
          WHERE 1=1 ${condition_restrictions}
        `;
    }

    const { rows: recipes_ids } = await client.query(query, [ingredientes_ids]);

    const all_recipes = [];
    for (const recipe_id of recipes_ids) {
      const recipe_details = await searchRecipeDetails(
        client,
        recipe_id.id_receita
      );
      if (recipe_details) {
        all_recipes.push(recipe_details);
      }
    }

    if (all_recipes.length === 0) {
      return res.status(404).json({
        message:
          "Nenhuma receita encontrada com esses ingredientes e restrições",
      });
    }

    res.json(all_recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erro ao buscar receitas por ingredientes e restrições",
      error: error.message,
    });
  } finally {
    client.release();
  }
});

router.get("/buscar", async (req, res) => {
  try {
    const nome = req.query.nome;

    if (!nome) {
      return res
        .status(400)
        .json({ message: "Informe um nome de receita para pesquisa" });
    }

    const client = await pool.connect();

    const receitasQuery = await client.query(
      "SELECT id FROM receitas WHERE nome ILIKE $1",
      [`%${nome}%`]
    );
    const receitas_ids = receitasQuery.rows.map((row) => row.id);

    const todas_as_receitas = [];
    for (const receita_id of receitas_ids) {
      const detalhes_da_receita = await searchRecipeDetails(client, receita_id);
      if (detalhes_da_receita) {
        todas_as_receitas.push(detalhes_da_receita);
      }
    }

    if (todas_as_receitas.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhuma receita encontrada com esse nome" });
    }

    res.json(todas_as_receitas);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erro ao buscar receitas por nome",
      error: error.message,
    });
  } finally {
    client.release();
  }
});

module.exports = router;
