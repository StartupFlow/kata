class Product {
  constructor(id, label, price, createdAt, updatedAt) {
    this._id = id;
    this.label = label;
    this.price = price;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toCsv() {
    return `${this._id},${this.label},${this.price},${this.createdAt.toISOString()},${this.updatedAt.toISOString()}`;
  }

  static fromCsv(csvLine) {
    const parts = csvLine.split(',');
    return new Product(
      parts[0],
      parts[1],
      Number(parts[2]),
      new Date(parts[3]),
      new Date(parts[4]),
    );
  }
}

module.exports = {
  Product
}
