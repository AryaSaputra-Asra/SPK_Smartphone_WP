// Jam real-time (update elemen di sidebar)
function updateJam() {
    const el = document.getElementById('jamDigital');
    if (!el) return;
    const n = new Date();
    el.textContent = [n.getHours(), n.getMinutes(), n.getSeconds()]
        .map(v => String(v).padStart(2, '0')).join(':');
}

// Tanggal Indonesia (update elemen di sidebar)
function updateTanggal() {
    const el = document.getElementById('tanggalHari');
    if (!el) return;
    el.textContent = new Intl.DateTimeFormat('id-ID', {
        weekday:'long', day:'numeric', month:'long', year:'numeric'
    }).format(new Date());
}

// Statistik dari API
async function muatStat() {
    try {
        const d = await apiFetch('/api/statistik');
        const el = document.getElementById('totalSmartphone');
        if (el) el.textContent = d.total;
    } catch(e) { /* silent */ }
}

document.addEventListener('DOMContentLoaded', () => {
    updateTanggal();
    updateJam();
    setInterval(updateJam, 1000);
    muatStat();
});
