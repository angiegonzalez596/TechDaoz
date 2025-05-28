const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Producto = require('./models/Producto');
const Usuario = require('./models/Usuario');

const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://admin:angie123@cluster0.cddiawu.mongodb.net/tecnologiaDAOZ?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error(' Error de conexión:', err));

// Ruta para crear un producto
app.post('/productos', async (req, res) => {
  try {
    const nuevo = new Producto(req.body);
    await nuevo.save();
    res.json(nuevo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Ruta para crear un usuario
app.post('/usuarios', async (req, res) => {
  try {
    const nuevo = new Usuario(req.body);
    await nuevo.save();
    res.json(nuevo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// Ruta para obtener todos los productos
app.get('/productos', async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});
// Obtener 3 productos aleatorios
app.get('/productos-populares', async (req, res) => {
  try {
    const productos = await Producto.aggregate([{ $sample: { size: 6 } }]); // Cambia el número si quieres 6
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener productos populares', error });
  }
});


app.listen(3000, () => {
  console.log(' Servidor corriendo en http://localhost:3000');
});

