const getLaporanHariIni = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const data = await Transaksi.aggregate([
      { $match: { tanggal: { $gte: start } } },
      { $group: { _id: null, totalPendapatan: { $sum: "$total_harga" } } }
    ]);

    res.json(data[0] || { totalPendapatan: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};