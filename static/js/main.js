// ── TOAST ──────────────────────────────────────────────────
function showToast(msg, type = '', ms = 3000) {
    const t = document.getElementById('toast');
    const m = document.getElementById('toastMsg');
    if (!t) return;
    m.textContent = msg;
    t.className = 'toast' + (type ? ' ' + type : '');
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), ms);
}

// ── MODAL ──────────────────────────────────────────────────
function openModal(id)  { const m = document.getElementById(id); if (m) m.classList.add('show'); }
function closeModal(id) { const m = document.getElementById(id); if (m) m.classList.remove('show'); }

// Klik overlay → tutup modal
document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('show');
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape')
        document.querySelectorAll('.modal-overlay.show').forEach(m => m.classList.remove('show'));
});

// ── FETCH HELPER ───────────────────────────────────────────
async function apiFetch(url, method = 'GET', body = null) {
    const opt = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opt.body = JSON.stringify(body);
    const res  = await fetch(url, opt);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server error');
    return data;
}

// ── FORMAT ─────────────────────────────────────────────────
function fRupiah(n) { return 'Rp ' + new Intl.NumberFormat('id-ID').format(n); }
function fNum(n)    { return new Intl.NumberFormat('id-ID').format(n); }
function esc(s)     { return String(s).replace(/&/g,'&amp;').replace(/'/g,'&#39;').replace(/"/g,'&quot;'); }

// ── SIDEBAR CLOCK (jalan di semua halaman) ──────────────────
function _updateJam() {
    const el = document.getElementById('jamDigital');
    if (!el) return;
    const n = new Date();
    el.textContent = [n.getHours(), n.getMinutes(), n.getSeconds()]
        .map(v => String(v).padStart(2,'0')).join(':');
}
function _updateTanggal() {
    const el = document.getElementById('tanggalHari');
    if (!el) return;
    el.textContent = new Intl.DateTimeFormat('id-ID', {
        weekday:'short', day:'numeric', month:'short', year:'numeric'
    }).format(new Date());
}
document.addEventListener('DOMContentLoaded', () => {
    _updateTanggal();
    _updateJam();
    setInterval(_updateJam, 1000);
});
