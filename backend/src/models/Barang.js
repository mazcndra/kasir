const mongoose = require('mongoose');

const barangSchema = new mongoose.Schema({
  barcode: { type: String, required: true, unique: true },
  nama_produk: { type: String, required: true },
  harga_jual: { type: Number, required: true },
  stok: { type: Number, default: 0 },
  kategori: String,
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Barang', barangSchema);