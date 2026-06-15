// ── PROSES WP ──────────────────────────────────────────────
async function prosesWP() {
    const btn = document.getElementById('btnHitung');
    const bobot = {
        bobot_harga:   parseFloat(document.getElementById('bHarga').value)   || 1,
        bobot_ram:     parseFloat(document.getElementById('bRam').value)     || 1,
        bobot_storage: parseFloat(document.getElementById('bStorage').value) || 1,
        bobot_baterai: parseFloat(document.getElementById('bBaterai').value) || 1,
        bobot_kamera:  parseFloat(document.getElementById('bKamera').value)  || 1,
    };

    if (Object.values(bobot).some(v => v <= 0)) {
        return showToast('⚠️ Bobot harus > 0!', 'error');
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spin"></span> Menghitung...';

    try {
        const res = await apiFetch('/api/hitung-wp', 'POST', bobot);
        tampilHasil(res);
        document.getElementById('hasilArea').scrollIntoView({ behavior:'smooth', block:'start' });
        showToast('✅ Perhitungan selesai!', 'success');
    } catch(e) {
        showToast('❌ ' + e.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '🧮 Hitung Ranking';
    }
}

// ── TAMPILKAN HASIL ─────────────────────────────────────────
function tampilHasil({ bobot_normalized, hasil, terbaik }) {
    const area = document.getElementById('hasilArea');
    area.style.display = 'flex';

    // Pemenang
    document.getElementById('wNama').textContent = terbaik.nama;
    document.getElementById('wV').textContent    = terbaik.nilai_v.toFixed(6);
    document.getElementById('wSpecs').innerHTML  = `
        <span>💰 ${fRupiah(terbaik.harga)}</span>
        <span>🧠 RAM ${terbaik.ram} GB</span>
        <span>💾 ${terbaik.storage} GB</span>
        <span>🔋 ${fNum(terbaik.baterai)} mAh</span>
        <span>📷 ${terbaik.kamera} MP</span>`;

    // Bobot normal
    const namaK = { harga:'💰 Harga', ram:'🧠 RAM', storage:'💾 Storage', baterai:'🔋 Baterai', kamera:'📷 Kamera' };
    document.getElementById('bnRow').innerHTML = Object.entries(bobot_normalized).map(([k,v]) => `
        <div class="bn-item">
            <div class="bn-lbl">${namaK[k]||k}</div>
            <div class="bn-val">${v.toFixed(4)}</div>
            <div class="bn-pct">${(v*100).toFixed(1)}%</div>
        </div>`).join('');

    // Tabel hasil
    document.getElementById('tbodyHasil').innerHTML = hasil.map(p => {
        let cls = '', badge = '';
        if      (p.ranking === 1) { cls = 'rank-1'; badge = '<span class="rnk gold">🥇</span>'; }
        else if (p.ranking === 2) { badge = '<span class="rnk silver">🥈</span>'; }
        else if (p.ranking === 3) { badge = '<span class="rnk bronze">🥉</span>'; }
        else                      { badge = `<span class="rnk">${p.ranking}</span>`; }

        return `
        <tr class="${cls}">
            <td>${badge}</td>
            <td><strong>${p.nama}</strong></td>
            <td>${fRupiah(p.harga)}</td>
            <td>${p.ram} GB</td>
            <td>${p.storage} GB</td>
            <td>${fNum(p.baterai)} mAh</td>
            <td>${p.kamera} MP</td>
            <td><strong style="color:var(--primary)">${p.nilai_s}</strong></td>
            <td><strong style="color:var(--success)">${p.nilai_v}</strong></td>
        </tr>`;
    }).join('');

    // Animasi
    area.style.opacity = '0';
    area.style.transform = 'translateY(16px)';
    area.style.transition = 'all .35s ease';
    requestAnimationFrame(() => {
        area.style.opacity = '1';
        area.style.transform = 'translateY(0)';
    });
}

// ── RESET ──────────────────────────────────────────────────
function resetBobot() {
    document.getElementById('bHarga').value   = 3;
    document.getElementById('bRam').value     = 4;
    document.getElementById('bStorage').value = 3;
    document.getElementById('bBaterai').value = 4;
    document.getElementById('bKamera').value  = 5;
    const area = document.getElementById('hasilArea');
    if (area) area.style.display = 'none';
    showToast('🔄 Bobot direset ke default');
}
