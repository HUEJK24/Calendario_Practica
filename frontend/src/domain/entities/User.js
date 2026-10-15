export class User {
  constructor({ id, email, createdAt, updatedAt }) {
    this.id = id;
    this.email = email;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromApi(json) {
    if (!json) return null;
    return new User({
      id: json.id,
      email: json.email,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt,
    });
  }
}
