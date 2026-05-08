const express = require('express');
const router = express.Router();

// Contoh route kosong agar tidak error
router.post('/', (req, res) => {
    res.json({ message: "Route Transaksi Berhasil" });
});

module.exports = router;