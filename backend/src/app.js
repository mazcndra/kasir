const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const transaksiRoutes = require('./routes/transaksiRoutes');
const barangRoutes = require('./routes/barangRoutes');

const app = express();

// Middleware Keamanan & Parser
app.use(helmet()); // Mengamankan header HTTP
app.use(cors());   // Mengizinkan request dari frontend (localhost:3000)
app.use(express.json());

// Routes
app.use('/api/transaksi', transaksiRoutes);
app.use('/api/barang', barangRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server Kasir running on port ${PORT}`);
});