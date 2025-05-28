const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  descripcion: { type: String, required: true },
  imagen: { type: String, required: true },
  categoria: { type: String, required: true },
});

module.exports = mongoose.model('Producto', productoSchema);
