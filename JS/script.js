const productData = {
    "buku tulis":   { harga: 20000, img: "./IMG/buku Tulis.jpg" },
    "pulpen":       { harga: 5000,  img: "./IMG/pulpen.jpg" },
    "pensil":       { harga: 3000,  img: "./IMG/pensil.jpg" },
    "penghapus":    { harga: 2000,  img: "./IMG/penghapus.jpg" },
    "pengaris":     { harga: 7000,  img: "./IMG/pengaris.jpg" },
    "tas sekolah":  { harga: 150000, img: "./IMG/tas sekolah.jpg" },
};

// Helper Penyimpanan
const getCart = () => JSON.parse(localStorage.getItem('cart_8mart') || '[]');
const saveCart = (cart) => {
    localStorage.setItem('cart_8mart', JSON.stringify(cart));
    updateCartBadge();
};

const getHistory = () => JSON.parse(localStorage.getItem('history_8mart') || '[]');
const saveHistory = (history) => localStorage.setItem('history_8mart', JSON.stringify(history));

// Format mata uang
const formatRupiah = (n) => 'Rp ' + n.toLocaleString('id-ID');

// Perbarui lencana keranjang
const updateCartBadge = () => {
    const total = getCart().reduce((s, i) => s + i.qty, 0);
    document.querySelectorAll('.cart-badge').forEach(b => {
        b.textContent = total;
        b.style.display = total > 0 ? 'inline-flex' : 'none';
    });
};

// Fungsi keranjang
function tambahKeKeranjang(nama) {
    const cart = getCart();
    const item = cart.find(i => i.nama === nama);
    if (item) {
        item.qty += 1;
    } else {
        const info = productData[nama];
        cart.push({ nama, harga: info.harga, img: info.img, qty: 1 });
    }
    saveCart(cart);
    alert(`${nama} ditambahkan ke keranjang!`);
}

function ubahJumlah(idx, delta) {
    const cart = getCart();
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    saveCart(cart);
    renderCart();
}

function hapusItem(idx) {
    const cart = getCart();
    cart.splice(idx, 1);
    saveCart(cart);
    renderCart();
}

function kosongkanKeranjang() {
    if (confirm('Yakin kosongkan keranjang?')) {
        saveCart([]);
        renderCart();
    }
}

function renderCart() {
    const cart = getCart();
    const container = document.getElementById('cart-content');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `<div class="empty-cart"><p>Keranjang kosong</p><a href="index.html" class="btn-secondary">Belanja Sekarang</a></div>`;
        return;
    }

    const subtotal = cart.reduce((s, i) => s + (i.harga * i.qty), 0);
    const rows = cart.map((item, idx) => `
        <tr>
            <td><img src="${item.img}" alt="${item.nama}" style="width:60px;height:60px;border-radius:0.5rem;"> ${item.nama}</td>
            <td>${formatRupiah(item.harga)}</td>
            <td><button class="btn-danger" onclick="ubahJumlah(${idx}, -1)">−</button> ${item.qty} <button class="btn-secondary" onclick="ubahJumlah(${idx}, 1)">+</button></td>
            <td>${formatRupiah(item.harga * item.qty)}</td>
            <td><button class="btn-danger" onclick="hapusItem(${idx})">🗑 Hapus</button></td>
        </tr>
    `).join('');

    container.innerHTML = `
        <table><thead><tr><th>Produk</th><th>Harga</th><th>Jumlah</th><th>Subtotal</th><th>Aksi</th></tr></thead><tbody>${rows}</tbody></table>
        <div class="total-display">Total: ${formatRupiah(subtotal)}</div>
        <button class="btn-secondary" onclick="kosongkanKeranjang()">Kosongkan</button>
        <a href="pembayaran.html" class="btn-beli">Lanjut Bayar</a>
    `;
}

function renderHistory() {
    const history = getHistory();
    const container = document.getElementById('history-content');
    if (!container) return;

    if (history.length === 0) {
        container.innerHTML = '<p class="empty-cart">Belum ada riwayat pembelian</p>';
        return;
    }

    const items = history.map((order, idx) => `
        <div class="history-item">
            <h4>Pembelian ${idx + 1} - ${new Date(order.date).toLocaleDateString('id-ID')}</h4>
            <p>Produk: ${order.items.map(i => `${i.nama} x${i.qty}`).join(', ')}</p>
            <p>Total: ${formatRupiah(order.total)}</p>
            <button class="btn-danger" onclick="hapusRiwayat(${idx})">🗑 Hapus</button>
        </div>
    `).join('');

    container.innerHTML = `<div class="history-list">${items}</div>`;
}

// Inisialisasi halaman
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    const title = document.title.toLowerCase();
    
    if (title.includes('keranjang')) {
        renderCart();
    } else if (title.includes('pembayaran')) {
        const form = document.getElementById('paymentForm');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const cart = getCart();
                if (cart.length === 0) {
                    alert('Keranjang kosong!');
                    return;
                }
                const total = cart.reduce((s, i) => s + (i.harga * i.qty), 0);
                const history = getHistory();
                history.push({ date: Date.now(), items: [...cart], total });
                saveHistory(history);
                saveCart([]);
                alert('Pembayaran berhasil!');
                window.location.href = 'riwayat.html';
            };
        }
    } else if (title.includes('riwayat')) {
        renderHistory();
    } else {
        document.querySelectorAll('.product-item').forEach(item => {
            const nama = item.querySelector('h3').textContent.trim().toLowerCase();
            const btnKeranjang = item.querySelector('.btn-keranjang');
            if (btnKeranjang) btnKeranjang.onclick = () => tambahKeKeranjang(nama);
            
            const btnBeli = item.querySelector('.btn-beli');
            if (btnBeli) btnBeli.onclick = () => beliLangsung(nama);
        });
    }
});

function cariProduk(query) {
    const q = query.trim().toLowerCase();
    const items = document.querySelectorAll('.product-item');
    items.forEach(item => {
        const nama = item.querySelector('h3').textContent.trim().toLowerCase();
        item.style.display = (q === '' || nama.includes(q)) ? '' : 'none';
    });
}

function hapusRiwayat(idx) {
    const history = getHistory();
    history.splice(idx, 1);
    saveHistory(history);
    renderHistory();
}

function beliLangsung(nama) {
    const cart = getCart();
    const item = cart.find(i => i.nama === nama);
    if (item) {
        item.qty += 1;
    } else {
        const info = productData[nama];
        cart.push({ nama, harga: info.harga, img: info.img, qty: 1 });
    }
    saveCart(cart);
    window.location.href = 'pembayaran.html';
}

// Pencarian produk
document.querySelector('input[name="p"]').addEventListener('input', (e) => {
    cariProduk(e.target.value);
});

