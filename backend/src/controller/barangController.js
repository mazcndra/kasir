const Barang = require('../models/Barang');

// Ambil semua data barang
const getBarang = async (req, res) => {
  try {
    const barang = await Barang.find().sort({ updated_at: -1 });
    res.json(barang);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tambah barang baru
const addBarang = async (req, res) => {
  try {
    const barangBaru = new Barang(req.body);
    await barangBaru.save();
    res.status(201).json(barangBaru);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getBarang, addBarang };