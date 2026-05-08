const express = require('express');
const router = express.Router();
// Import controller jika sudah ada, jika belum gunakan dummy response dulu
// const { getBarang, addBarang } = require('../controllers/barangController');

router.get('/', (req, res) => {
    res.json({ message: "Route Barang Berhasil diakses" });
});

module.exports = router;