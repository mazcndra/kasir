import { useState, useRef, useMemo, useId, type ComponentType } from "react";
import {
  LayoutDashboard, Package, ShoppingCart, Plus, Trash2,
  Search, Edit3, X, Printer, TrendingUp, ShoppingBag,
  AlertTriangle, Check, Scan, Minus, Tag, CreditCard,
  ChevronRight, BarChart2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type Product = {
  id: string;
  barcode: string;
  name: string;
  category: string;
  price: number;
  stock: number;
};

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

type Transaction = {
  id: string;
  date: Date;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  cash: number;
  change: number;
  cashierName: string;
};

type View = "dashboard" | "products" | "kasir";

// ─── Seed Data ────────────────────────────────────────────────────────────────

const INITIAL_PRODUCTS: Product[] = [
  { id: "p1",  barcode: "8992388251054", name: "Indomie Goreng",            category: "Makanan",    price: 3500,  stock: 150 },
  { id: "p2",  barcode: "8999999020087", name: "Aqua 600ml",                category: "Minuman",    price: 4000,  stock: 200 },
  { id: "p3",  barcode: "8998866800006", name: "Teh Botol Sosro 450ml",     category: "Minuman",    price: 5500,  stock: 80  },
  { id: "p4",  barcode: "8992575000045", name: "Roti Tawar Sari Roti",      category: "Makanan",    price: 14500, stock: 30  },
  { id: "p5",  barcode: "8998333130013", name: "Susu Ultra Full Cream 250ml",category: "Minuman",   price: 6500,  stock: 60  },
  { id: "p6",  barcode: "8993251200006", name: "Biscuit Roma Marie",        category: "Snack",      price: 8500,  stock: 45  },
  { id: "p7",  barcode: "8990100139102", name: "Chitato Sapi Panggang",     category: "Snack",      price: 9500,  stock: 38  },
  { id: "p8",  barcode: "8992388020025", name: "Mie Sedaap Soto",           category: "Makanan",    price: 3200,  stock: 120 },
  { id: "p9",  barcode: "8886210100013", name: "Pocari Sweat 500ml",        category: "Minuman",    price: 8000,  stock: 55  },
  { id: "p10", barcode: "8992775340104", name: "Good Day Cappuccino",       category: "Minuman",    price: 2500,  stock: 90  },
  { id: "p11", barcode: "8994401000082", name: "Walls Paddle Pop",          category: "Frozen",     price: 5000,  stock: 18  },
  { id: "p12", barcode: "8990131000012", name: "Pepsodent 75g",             category: "Perawatan",  price: 12000, stock: 14  },
];

const WEEKLY_DATA = [
  { day: "Sen", revenue: 847500,  transactions: 42 },
  { day: "Sel", revenue: 923000,  transactions: 48 },
  { day: "Rab", revenue: 756500,  transactions: 35 },
  { day: "Kam", revenue: 1085000, transactions: 56 },
  { day: "Jum", revenue: 1234500, transactions: 64 },
  { day: "Sab", revenue: 1456000, transactions: 78 },
  { day: "Min", revenue: 1102000, transactions: 58 },
];

const HOURLY_DATA = [
  { hour: "08", revenue: 125000 },
  { hour: "09", revenue: 245000 },
  { hour: "10", revenue: 312000 },
  { hour: "11", revenue: 456000 },
  { hour: "12", revenue: 623000 },
  { hour: "13", revenue: 534000 },
  { hour: "14", revenue: 389000 },
  { hour: "15", revenue: 445000 },
  { hour: "16", revenue: 512000 },
  { hour: "17", revenue: 678000 },
  { hour: "18", revenue: 712000 },
  { hour: "19", revenue: 534000 },
  { hour: "20", revenue: 298000 },
  { hour: "21", revenue: 156000 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const formatDate = (d: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(d);

const generateId = () => `${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ active, onNavigate }: { active: View; onNavigate: (v: View) => void }) {
  const nav: { id: View; label: string; icon: ComponentType<{ className?: string }> }[] = [
    { id: "dashboard", label: "Dashboard",       icon: LayoutDashboard },
    { id: "products",  label: "Manajemen Produk", icon: Package         },
    { id: "kasir",     label: "Kasir",            icon: ShoppingCart    },
  ];

  return (
    <aside className="w-56 shrink-0 flex flex-col h-full" style={{ background: "#0f172a" }}>
      <div className="px-5 py-6 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-md">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-none" style={{ fontFamily: "var(--font-display)" }}>
              TokoPOS
            </p>
            <p className="text-white/30 text-xs mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
              v2.1.0
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
              active === id
                ? "bg-amber-500 text-white font-semibold shadow-sm"
                : "text-white/50 hover:text-white/90 hover:bg-white/5"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
            {active === id && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
          </button>
        ))}
      </nav>

      <div className="px-4 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
               style={{ background: "rgba(255,255,255,0.12)", fontFamily: "var(--font-mono)" }}>
            AD
          </div>
          <div>
            <p className="text-white text-xs font-medium">Administrator</p>
            <p className="text-white/35 text-xs">Kasir Utama</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ title, value, sub, icon: Icon, colorClass }: {
  title: string;
  value: string;
  sub: string;
  icon: ComponentType<{ className?: string }>;
  colorClass: string;
}) {
  return (
    <div className="bg-card rounded-xl p-5 border border-border hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest truncate">{title}</p>
          <p className="text-foreground text-2xl font-semibold mt-1.5 leading-none"
             style={{ fontFamily: "var(--font-mono)" }}>
            {value}
          </p>
          <p className="text-muted-foreground text-xs mt-1.5">{sub}</p>
        </div>
        <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// ─── Custom Chart Tooltip ─────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-xl border border-white/10"
         style={{ background: "#0f172a", color: "#fff" }}>
      <p className="font-medium mb-0.5 opacity-60">{label}</p>
      <p className="font-semibold" style={{ fontFamily: "var(--font-mono)" }}>
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

// ─── Area Chart (isolated so useId gives a unique gradient ID) ───────────────

function AreaChartCard() {
  const uid = useId().replace(/:/g, "");
  const gradId = `areaGrad-${uid}`;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={HOURLY_DATA}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#b45309" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#b45309" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
        <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#78716c", fontFamily: "var(--font-mono)" }}
               axisLine={false} tickLine={false} interval={2} />
        <YAxis hide />
        <Tooltip content={<ChartTooltip />} />
        <Area type="monotone" dataKey="revenue" stroke="#b45309" strokeWidth={2}
              fill={`url(#${gradId})`} dot={false} activeDot={{ r: 4, fill: "#b45309" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ transactions, products }: { transactions: Transaction[]; products: Product[] }) {
  const todayTx = transactions.filter(t => t.date.toDateString() === new Date().toDateString());
  const todayRevenue = todayTx.reduce((s, t) => s + t.total, 0);
  const todayItems   = todayTx.reduce((s, t) => s + t.items.reduce((a, i) => a + i.quantity, 0), 0);
  const lowStock     = products.filter(p => p.stock < 20).length;

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div>
        <h2 className="text-2xl font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          Dashboard
        </h2>
        <p className="text-muted-foreground text-sm mt-0.5">{formatDate(new Date())}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pendapatan Hari Ini"
          value={formatCurrency(todayRevenue || 1234500)}
          sub="+12.5% dari kemarin"
          icon={TrendingUp}
          colorClass="bg-amber-100 text-amber-600"
        />
        <StatCard
          title="Transaksi"
          value={String(todayTx.length || 64)}
          sub="transaksi hari ini"
          icon={CreditCard}
          colorClass="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Item Terjual"
          value={String(todayItems || 248)}
          sub="unit hari ini"
          icon={ShoppingBag}
          colorClass="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          title="Stok Menipis"
          value={String(lowStock)}
          sub="produk di bawah 20 unit"
          icon={AlertTriangle}
          colorClass="bg-red-100 text-red-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-card rounded-xl p-5 border border-border">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-foreground">Penjualan 7 Hari Terakhir</h3>
            <BarChart2 className="w-4 h-4 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={WEEKLY_DATA} barSize={30}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#78716c", fontFamily: "var(--font-mono)" }}
                     axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)", radius: 4 }} />
              <Bar dataKey="revenue" fill="#b45309" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-card rounded-xl p-5 border border-border">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-foreground">Tren Jam Ini</h3>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <AreaChartCard />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Transaksi Terbaru</h3>
          <span className="text-xs text-muted-foreground">{transactions.length} total</span>
        </div>
        {transactions.length === 0 ? (
          <div className="px-5 py-10 text-center text-muted-foreground text-sm">
            Belum ada transaksi. Mulai berjualan dari menu Kasir.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.slice(0, 6).map(tx => (
              <div key={tx.id}
                   className="px-5 py-3.5 flex items-center justify-between hover:bg-muted/25 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-mono)" }}>
                    {tx.id}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(tx.date)} &middot; {tx.items.length} item &middot; {tx.cashierName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-mono)" }}>
                    {formatCurrency(tx.total)}
                  </p>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                    Lunas
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Product Modal ────────────────────────────────────────────────────────────

function ProductModal({ product, onSave, onClose }: {
  product: Product | null;
  onSave: (p: Product) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    barcode:  product?.barcode  ?? "",
    name:     product?.name     ?? "",
    category: product?.category ?? "Makanan",
    price:    product?.price    ?? 0,
    stock:    product?.stock    ?? 0,
  });

  const CATEGORIES = ["Makanan", "Minuman", "Snack", "Frozen", "Perawatan", "Lainnya"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id: product?.id ?? generateId(), ...form });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
      <div className="bg-card rounded-2xl w-full max-w-md shadow-2xl border border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-base" style={{ fontFamily: "var(--font-display)" }}>
            {product ? "Edit Produk" : "Tambah Produk Baru"}
          </h2>
          <button onClick={onClose}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-widest">
              Barcode
            </label>
            <div className="relative">
              <Scan className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={form.barcode}
                onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))}
                className="w-full pl-9 pr-3 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-accent"
                style={{ fontFamily: "var(--font-mono)" }}
                placeholder="Scan atau ketik barcode"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-widest">
              Nama Produk
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-accent"
              placeholder="Nama lengkap produk"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-widest">
                Kategori
              </label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-accent"
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-widest">
                Stok
              </label>
              <input
                type="number"
                value={form.stock}
                onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-accent"
                style={{ fontFamily: "var(--font-mono)" }}
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-widest">
              Harga Jual (Rp)
            </label>
            <input
              type="number"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
              className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-accent"
              style={{ fontFamily: "var(--font-mono)" }}
              min="0"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors hover:opacity-90"
              style={{ background: "#0f172a" }}
            >
              {product ? "Simpan Perubahan" : "Tambah Produk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Product Management ───────────────────────────────────────────────────────

function ProductManagement({ products, setProducts }: {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}) {
  const [search,        setSearch]        = useState("");
  const [modal,         setModal]         = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode.includes(search) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (p: Product) => {
    setProducts(prev => {
      const exists = prev.find(x => x.id === p.id);
      return exists ? prev.map(x => x.id === p.id ? p : x) : [...prev, p];
    });
    setModal({ open: false, product: null });
  };

  const CATEGORY_COLORS: Record<string, string> = {
    Makanan:    "bg-orange-100 text-orange-700",
    Minuman:    "bg-blue-100 text-blue-700",
    Snack:      "bg-yellow-100 text-yellow-700",
    Frozen:     "bg-cyan-100 text-cyan-700",
    Perawatan:  "bg-purple-100 text-purple-700",
    Lainnya:    "bg-gray-100 text-gray-600",
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            Manajemen Produk
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {products.length} produk terdaftar &middot; {products.filter(p => p.stock < 20).length} stok rendah
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true, product: null })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors hover:opacity-90 shrink-0"
          style={{ background: "#0f172a" }}
        >
          <Plus className="w-4 h-4" />
          Tambah Produk
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama, barcode, kategori..."
          className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-accent"
        />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest">Barcode</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest">Nama Produk</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest">Kategori</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-widest">Harga</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-widest">Stok</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    Tidak ada produk yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-4 py-3 text-xs text-muted-foreground"
                      style={{ fontFamily: "var(--font-mono)" }}>
                    {p.barcode}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[p.category] ?? CATEGORY_COLORS.Lainnya}`}>
                      {p.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold" style={{ fontFamily: "var(--font-mono)" }}>
                    {formatCurrency(p.price)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className={`font-semibold text-sm ${p.stock < 20 ? "text-red-500" : "text-foreground"}`}
                            style={{ fontFamily: "var(--font-mono)" }}>
                        {p.stock}
                      </span>
                      {p.stock < 20 && (
                        <span className="text-xs bg-red-100 text-red-500 px-1.5 py-0.5 rounded font-medium">
                          Rendah
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setModal({ open: true, product: p })}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {deleteConfirm === p.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setProducts(prev => prev.filter(x => x.id !== p.id)); setDeleteConfirm(null); }}
                            className="px-2 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors font-medium"
                          >
                            Hapus
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 bg-muted text-foreground text-xs rounded-lg hover:bg-muted/80 transition-colors font-medium"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(p.id)}
                          className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal.open && (
        <ProductModal
          product={modal.product}
          onSave={handleSave}
          onClose={() => setModal({ open: false, product: null })}
        />
      )}
    </div>
  );
}

// ─── Receipt Modal ────────────────────────────────────────────────────────────

function ReceiptModal({ transaction, onClose }: { transaction: Transaction; onClose: () => void }) {
  const handlePrint = () => {
    const win = window.open("", "_blank", "width=440,height=700,scrollbars=yes");
    if (!win) return;

    const itemsHTML = transaction.items.map(item => `
      <div style="margin-bottom:6px;">
        <div style="display:flex;justify-content:space-between;">
          <span style="flex:1;padding-right:8px;word-break:break-word;">${item.name}</span>
          <span style="white-space:nowrap;">${formatCurrency(item.price * item.quantity)}</span>
        </div>
        <div style="color:#888;font-size:10px;margin-top:1px;">
          &nbsp;&nbsp;${item.quantity} pcs &times; ${formatCurrency(item.price)}
        </div>
      </div>
    `).join("");

    win.document.write(`
      <!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <title>Struk ${transaction.id}</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Courier New',Courier,monospace;font-size:11px;color:#000;
             width:300px;margin:0 auto;padding:20px 12px}
        .c{text-align:center}
        .store{font-size:15px;font-weight:bold;text-align:center;letter-spacing:1px}
        .sub{font-size:10px;text-align:center;color:#555;margin-top:2px}
        hr{border:none;border-top:1px dashed #888;margin:10px 0}
        .row{display:flex;justify-content:space-between;margin:3px 0}
        .bold{font-weight:bold}
        .total{font-size:13px;font-weight:bold}
        .change{font-size:13px;font-weight:bold;color:#16a34a}
        .footer{text-align:center;margin-top:14px;font-size:10px;color:#666;line-height:1.6}
        @media print{body{width:80mm}}
      </style>
      </head><body>
      <div class="store">TOKOPOS</div>
      <div class="sub">Jl. Raya Utama No. 123, Jakarta</div>
      <div class="sub">Telp: (021) 555-1234</div>
      <hr>
      <div class="row"><span>No. Struk</span><span class="bold">${transaction.id}</span></div>
      <div class="row"><span>Tanggal</span><span>${formatDate(transaction.date)}</span></div>
      <div class="row"><span>Kasir</span><span>${transaction.cashierName}</span></div>
      <hr>
      ${itemsHTML}
      <hr>
      <div class="row"><span>Subtotal</span><span>${formatCurrency(transaction.subtotal)}</span></div>
      ${transaction.discount > 0 ? `<div class="row"><span>Diskon</span><span>- ${formatCurrency(transaction.discount)}</span></div>` : ""}
      <div class="row total"><span>TOTAL</span><span>${formatCurrency(transaction.total)}</span></div>
      <hr>
      <div class="row"><span>Tunai</span><span>${formatCurrency(transaction.cash)}</span></div>
      <div class="row change"><span>Kembalian</span><span>${formatCurrency(transaction.change)}</span></div>
      <div class="footer">
        *** Terima kasih telah berbelanja ***<br>
        Barang yang telah dibeli<br>tidak dapat dikembalikan
      </div>
      <script>setTimeout(function(){window.print();},300);<\/script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
      <div className="bg-card rounded-2xl w-full max-w-sm shadow-2xl border border-border">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)" }}>
                Pembayaran Berhasil
              </h2>
              <p className="text-xs text-muted-foreground">Transaksi selesai</p>
            </div>
          </div>
          <button onClick={onClose}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt preview */}
        <div className="px-6 py-4 max-h-72 overflow-y-auto"
             style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
          <div className="text-center font-bold text-base mb-0.5">TOKOPOS</div>
          <div className="text-center text-xs text-muted-foreground mb-3">Jl. Raya Utama No. 123, Jakarta</div>

          <div className="border-t border-dashed border-border pt-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">No. Struk</span>
              <span className="font-semibold">{transaction.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal</span>
              <span>{formatDate(transaction.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kasir</span>
              <span>{transaction.cashierName}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-border pt-2 mt-2 space-y-2">
            {transaction.items.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs">
                  <span className="flex-1 pr-2 truncate">{item.name}</span>
                  <span className="font-semibold shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 ml-2">
                  {item.quantity}x {formatCurrency(item.price)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-border pt-2 mt-2 space-y-1 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(transaction.subtotal)}</span>
            </div>
            {transaction.discount > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Diskon</span>
                <span>- {formatCurrency(transaction.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm border-t border-border pt-1.5 mt-1">
              <span>TOTAL</span>
              <span>{formatCurrency(transaction.total)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tunai</span>
              <span>{formatCurrency(transaction.cash)}</span>
            </div>
            <div className="flex justify-between font-bold text-emerald-600">
              <span>Kembalian</span>
              <span>{formatCurrency(transaction.change)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors hover:opacity-90"
            style={{ background: "#0f172a" }}
          >
            <Printer className="w-4 h-4" />
            Cetak Struk
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Kasir View ───────────────────────────────────────────────────────────────

function KasirView({ products, setProducts, onTransactionComplete }: {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onTransactionComplete: (tx: Transaction) => void;
}) {
  const [cart,         setCart]         = useState<CartItem[]>([]);
  const [search,       setSearch]       = useState("");
  const [cashInput,    setCashInput]    = useState("");
  const [discountStr,  setDiscountStr]  = useState("0");
  const [receipt,      setReceipt]      = useState<Transaction | null>(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const barcodeRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.barcode.includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }, [search, products]);

  const subtotal  = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount  = Math.max(0, Number(discountStr) || 0);
  const total     = Math.max(0, subtotal - discount);
  const cash      = Number(cashInput) || 0;
  const change    = cash - total;
  const canPay    = cart.length > 0 && cash >= total && total > 0;

  const addToCart = (product: Product) => {
    if (product.stock < 1) return;
    setCart(prev => {
      const found = prev.find(i => i.productId === product.id);
      if (found) {
        if (found.quantity >= product.stock) return prev;
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(i => {
          if (i.productId !== productId) return i;
          const maxStock = products.find(p => p.id === productId)?.stock ?? Infinity;
          const newQty   = i.quantity + delta;
          if (newQty < 1) return null as unknown as CartItem;
          if (newQty > maxStock) return i;
          return { ...i, quantity: newQty };
        })
        .filter(Boolean)
    );
  };

  const handleBarcodeKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const p = products.find(x => x.barcode === barcodeInput.trim());
      if (p) addToCart(p);
      setBarcodeInput("");
    }
  };

  const handlePay = () => {
    if (!canPay) return;
    const tx: Transaction = {
      id: generateId(),
      date: new Date(),
      items: [...cart],
      subtotal,
      discount,
      total,
      cash,
      change,
      cashierName: "Admin",
    };
    setProducts(prev => prev.map(p => {
      const ci = cart.find(c => c.productId === p.id);
      return ci ? { ...p, stock: p.stock - ci.quantity } : p;
    }));
    onTransactionComplete(tx);
    setReceipt(tx);
    setCart([]);
    setCashInput("");
    setDiscountStr("0");
  };

  const QUICK_AMOUNTS = [5000, 10000, 20000, 50000, 100000];

  const CATEGORY_COLORS: Record<string, string> = {
    Makanan:   "text-orange-500",
    Minuman:   "text-blue-500",
    Snack:     "text-yellow-600",
    Frozen:    "text-cyan-500",
    Perawatan: "text-purple-500",
    Lainnya:   "text-gray-400",
  };

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* ── Left: Product Panel ── */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-border overflow-hidden">
        {/* Search bar */}
        <div className="px-4 py-3.5 border-b border-border bg-card shrink-0 space-y-2.5">
          <div className="flex gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama produk atau kategori..."
                className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-accent"
              />
            </div>
            <div className="relative shrink-0">
              <Scan className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                ref={barcodeRef}
                type="text"
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                onKeyDown={handleBarcodeKey}
                placeholder="Scan barcode..."
                className="pl-9 pr-3 py-2.5 w-44 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-accent"
                style={{ fontFamily: "var(--font-mono)" }}
              />
            </div>
          </div>
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
              <Package className="w-8 h-8 mb-2 opacity-30" />
              <p>Produk tidak ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map(p => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  disabled={p.stock < 1}
                  className={`text-left bg-card border rounded-xl p-3.5 transition-all group text-sm ${
                    p.stock < 1
                      ? "opacity-40 cursor-not-allowed border-border"
                      : "border-border hover:border-amber-400 hover:shadow-md cursor-pointer active:scale-95"
                  }`}
                >
                  <div className="w-full h-9 bg-muted/50 rounded-lg mb-2.5 flex items-center justify-center">
                    <Tag className={`w-4 h-4 transition-colors ${CATEGORY_COLORS[p.category] ?? "text-muted-foreground"} group-hover:scale-110`} />
                  </div>
                  <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2 mb-1.5 min-h-[2.5em]">
                    {p.name}
                  </p>
                  <p className="text-xs font-semibold text-amber-700" style={{ fontFamily: "var(--font-mono)" }}>
                    {formatCurrency(p.price)}
                  </p>
                  <p className={`text-xs mt-1 ${p.stock < 20 ? "text-red-400 font-medium" : "text-muted-foreground"}`}
                     style={{ fontFamily: "var(--font-mono)" }}>
                    Stok: {p.stock}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Cart Panel ── */}
      <div className="w-72 xl:w-80 shrink-0 flex flex-col bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base" style={{ fontFamily: "var(--font-display)" }}>
              Keranjang
            </h3>
            <span className="text-xs font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
                  style={{ fontFamily: "var(--font-mono)" }}>
              {cart.length} item
            </span>
          </div>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-10 text-sm">
              <ShoppingCart className="w-10 h-10 mb-3 opacity-20" />
              <p className="font-medium">Keranjang kosong</p>
              <p className="text-xs mt-1 opacity-60">Pilih produk dari panel kiri</p>
            </div>
          ) : (
            <div className="px-4 py-3 space-y-0">
              {cart.map(item => (
                <div key={item.productId}
                     className="flex items-start gap-2.5 py-3 border-b border-border/50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground leading-snug">{item.name}</p>
                    <p className="text-xs text-amber-700 mt-0.5 font-medium"
                       style={{ fontFamily: "var(--font-mono)" }}>
                      {formatCurrency(item.price)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
                      = {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 mt-0.5">
                    <button onClick={() => updateQty(item.productId, -1)}
                            className="w-6 h-6 bg-muted rounded-md flex items-center justify-center hover:bg-muted/70 transition-colors">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold" style={{ fontFamily: "var(--font-mono)" }}>
                      {item.quantity}
                    </span>
                    <button onClick={() => updateQty(item.productId, 1)}
                            className="w-6 h-6 bg-muted rounded-md flex items-center justify-center hover:bg-muted/70 transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                    <button onClick={() => setCart(prev => prev.filter(i => i.productId !== item.productId))}
                            className="w-6 h-6 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-md flex items-center justify-center transition-colors ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals and payment */}
        <div className="border-t border-border px-5 py-4 space-y-3 shrink-0">
          {/* Subtotal / discount */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground text-sm shrink-0">Diskon (Rp)</span>
              <input
                type="number"
                value={discountStr}
                onChange={e => setDiscountStr(e.target.value)}
                className="w-28 text-right px-2.5 py-1.5 bg-muted/60 border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:border-accent"
                style={{ fontFamily: "var(--font-mono)" }}
                min="0"
              />
            </div>
            <div className="flex justify-between font-bold text-base border-t border-border pt-2 mt-1">
              <span>Total Bayar</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Cash input */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Uang Tunai
            </label>
            <input
              type="number"
              value={cashInput}
              onChange={e => setCashInput(e.target.value)}
              placeholder="0"
              className="mt-1.5 w-full px-3 py-2.5 bg-muted/50 border border-border rounded-xl text-right text-sm font-semibold focus:outline-none focus:ring-2 focus:border-accent"
              style={{ fontFamily: "var(--font-mono)" }}
            />
            {/* Quick amounts */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {QUICK_AMOUNTS.map(v => (
                <button
                  key={v}
                  onClick={() => setCashInput(String(v))}
                  className="px-2.5 py-1 bg-muted text-xs font-semibold rounded-lg hover:bg-muted/70 transition-colors"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {v >= 1000 ? `${v / 1000}K` : v}
                </button>
              ))}
              <button
                onClick={() => setCashInput(String(total))}
                className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-100 transition-colors border border-amber-200"
              >
                Pas
              </button>
            </div>
          </div>

          {/* Change */}
          {cashInput !== "" && cash > 0 && (
            <div className={`rounded-xl px-4 py-2.5 flex justify-between items-center ${
              change >= 0 ? "bg-emerald-50 border border-emerald-100" : "bg-red-50 border border-red-100"
            }`}>
              <span className="text-sm font-medium text-foreground">Kembalian</span>
              <span className={`text-base font-bold ${change >= 0 ? "text-emerald-600" : "text-red-500"}`}
                    style={{ fontFamily: "var(--font-mono)" }}>
                {formatCurrency(Math.abs(change))}
                {change < 0 && <span className="text-xs ml-1">(kurang)</span>}
              </span>
            </div>
          )}

          {/* Pay button */}
          <button
            onClick={handlePay}
            disabled={!canPay}
            className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all ${
              canPay
                ? "text-white hover:opacity-90 active:scale-95 shadow-sm"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
            style={canPay ? { background: "#0f172a" } : {}}
          >
            {cart.length === 0
              ? "Pilih Produk Dahulu"
              : cashInput === "" || cash === 0
              ? "Masukkan Uang Tunai"
              : !canPay
              ? "Uang Tidak Cukup"
              : `Proses Bayar · ${formatCurrency(total)}`}
          </button>
        </div>
      </div>

      {receipt && (
        <ReceiptModal transaction={receipt} onClose={() => setReceipt(null)} />
      )}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [view,         setView]         = useState<View>("dashboard");
  const [products,     setProducts]     = useState<Product[]>(INITIAL_PRODUCTS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar active={view} onNavigate={setView} />

      <main className="flex-1 min-w-0 overflow-hidden flex flex-col">
        {view === "dashboard" && (
          <div className="flex-1 overflow-y-auto">
            <Dashboard transactions={transactions} products={products} />
          </div>
        )}
        {view === "products" && (
          <div className="flex-1 overflow-y-auto">
            <ProductManagement products={products} setProducts={setProducts} />
          </div>
        )}
        {view === "kasir" && (
          <div className="flex-1 flex overflow-hidden">
            <KasirView
              products={products}
              setProducts={setProducts}
              onTransactionComplete={tx => setTransactions(prev => [tx, ...prev])}
            />
          </div>
        )}
      </main>
    </div>
  );
}
