const express = require('express');
const bodyParser = require('body-parser');
const connection = require('./connection');
const cors = require('cors');

const app = express();
const port = 3000;

// Configurar bodyParser para poder leer JSON y urlencoded
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/tics',require('./routes/routes.server'))
// Manejar otras rutas
app.use((req, res) => {
  res.status(404).send('Ruta no encontrada');
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
