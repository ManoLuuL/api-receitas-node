class User {
  constructor({
    id,
    nome,
    email,
    senha,
    idade,
    diabetico,
    vegetariano,
    vegano,
    alergico_a_lactose,
  }) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.senha = senha;
    this.idade = idade;
    this.diabetico = diabetico;
    this.vegetariano = vegetariano;
    this.vegano = vegano;
    this.alergico_a_lactose = alergico_a_lactose;
  }
}

module.exports = User;
