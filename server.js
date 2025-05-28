// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb+srv://admin:angie123@cluster0.cddiawu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.log(err));

// Modelo de Producto
const Producto = mongoose.model('Producto', {
  nombre: String,
  categoria: String,
  precio: Number,
  descripcion: String,
  imagen: String
});

// Ruta para obtener productos
app.get('/productos', async (req, res) => {
  const productos = await Producto.find();
  res.json(productos);
});

// Ruta para agregar un producto (opcional)
app.post('/productos', async (req, res) => {
  const nuevo = new Producto(req.body);
  await nuevo.save();
  res.json(nuevo);
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
