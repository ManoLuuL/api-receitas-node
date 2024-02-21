const express = require("express");
const { Client } = require("pg");
const app = express();
const userRoutes = require("./routes/userRoutes");
const loginRoutes = require("./routes/loginRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const ingredientsRoutes = require("./routes/ingredientsRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Express" });
});
app.use("/user", userRoutes);
app.use("/login", loginRoutes);
app.use("/receitas", recipeRoutes);
app.use("/ingredientes", ingredientsRoutes);
app.use("/favorite", favoriteRoutes);

const client = new Client({
  host: "ep-white-mud-691983-pooler.ap-southeast-1.postgres.vercel-storage.com",
  user: "default",
  password: "r7PNKsU5qVdg",
  database: "verceldb",
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

client
  .connect()
  .then(() => {
    console.log("Conectado ao banco de dados PostgreSQL");
    const server = app.listen(3000, () => {
      console.log(`Servidor rodando na porta ${server.address().port}`);
    });
  })
  .catch((err) => console.error("Erro ao conectar ao banco de dados:", err));
