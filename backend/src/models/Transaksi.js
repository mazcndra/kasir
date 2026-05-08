const mongoose = require('mongoose');

const transaksiSchema = new mongoose.Schema({
  kode_transaksi: { type: String, unique: true },
  total_harga: { type: Number, required: true },
  bayar: { type: Number, required: true },
  kembalian: { type: Number, required: true },
  // Detail barang disimpan langsung di sini
  items: [{
    barang_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Barang' },
    nama_produk: String,
    qty: Number,
    harga_satuan: Number
  }],
  tanggal: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaksi', transaksiSchema);