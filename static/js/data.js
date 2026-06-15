// ── LOAD TABLE ─────────────────────────────────────────────
async function loadTable() {
    const tbody = document.getElementById('tbodyPhone');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="8" class="tbl-empty">⏳ Memuat data...</td></tr>';
    try {
        const data = await apiFetch('/api/smartphone');
        if (!data.length) {
            tbody.innerHTML = '<tr><td colspan="8" class="tbl-empty">📭 Belum ada data. Klik "Tambah" untuk menambahkan.</td></tr>';
            return;
        }
        tbody.innerHTML = data.map((p, i) => `
            <tr>
                <td>${i + 1}</td>
                <td><strong>${p.nama}</strong></td>
                <td>${fRupiah(p.harga)}</td>
                <td>${p.ram} GB</td>
                <td>${p.storage} GB</td>
                <td>${fNum(p.baterai)} mAh</td>
                <td>${p.kamera} MP</td>
                <td>
                    <div class="act-btns">
                        <button class="btn-edit" onclick="bukaEdit(${p.id},'${esc(p.nama)}',${p.harga},${p.ram},${p.storage},${p.baterai},${p.kamera})">✏️ Edit</button>
                        <button class="btn-del"  onclick="bukaHapus(${p.id},'${esc(p.nama)}')">🗑️ Hapus</button>
                    </div>
                </td>
            </tr>`).join('');
    } catch(e) {
        tbody.innerHTML = `<tr><td colspan="8" class="tbl-empty">❌ ${e.message}</td></tr>`;
    }
}

// ── TAMBAH ─────────────────────────────────────────────────
function bukaModalTambah() {
    ['aNama','aHarga','aRam','aStorage','aBaterai','aKamera'].forEach(id => {
        document.getElementById(id).value = '';
    });
    openModal('mTambah');
    setTimeout(() => document.getElementById('aNama').focus(), 100);
}

async function simpanTambah() {
    const body = {
        nama:    document.getElementById('aNama').value.trim(),
        harga:   document.getElementById('aHarga').value,
        ram:     document.getElementById('aRam').value,
        storage: document.getElementById('aStorage').value,
        baterai: document.getElementById('aBaterai').value,
        kamera:  document.getElementById('aKamera').value,
    };
    if (!body.nama || !body.harga || !body.ram || !body.storage || !body.baterai || !body.kamera) {
        return showToast('⚠️ Semua field wajib diisi!', 'error');
    }
    try {
        await apiFetch('/api/smartphone', 'POST', body);
        closeModal('mTambah');
        showToast('✅ Smartphone berhasil ditambahkan!', 'success');
        loadTable();
    } catch(e) { showToast('❌ ' + e.message, 'error'); }
}

// ── EDIT ───────────────────────────────────────────────────
function bukaEdit(id, nama, harga, ram, storage, baterai, kamera) {
    document.getElementById('eId').value      = id;
    document.getElementById('eNama').value    = nama;
    document.getElementById('eHarga').value   = harga;
    document.getElementById('eRam').value     = ram;
    document.getElementById('eStorage').value = storage;
    document.getElementById('eBaterai').value = baterai;
    document.getElementById('eKamera').value  = kamera;
    openModal('mEdit');
}

async function simpanEdit() {
    const id   = document.getElementById('eId').value;
    const body = {
        nama:    document.getElementById('eNama').value.trim(),
        harga:   document.getElementById('eHarga').value,
        ram:     document.getElementById('eRam').value,
        storage: document.getElementById('eStorage').value,
        baterai: document.getElementById('eBaterai').value,
        kamera:  document.getElementById('eKamera').value,
    };
    if (!body.nama || !body.harga || !body.ram || !body.storage || !body.baterai || !body.kamera) {
        return showToast('⚠️ Semua field wajib diisi!', 'error');
    }
    try {
        await apiFetch(`/api/smartphone/${id}`, 'PUT', body);
        closeModal('mEdit');
        showToast('✅ Data berhasil diperbarui!', 'success');
        loadTable();
    } catch(e) { showToast('❌ ' + e.message, 'error'); }
}

// ── HAPUS ──────────────────────────────────────────────────
function bukaHapus(id, nama) {
    document.getElementById('hId').value       = id;
    document.getElementById('hNama').textContent = `"${nama}"`;
    openModal('mHapus');
}

async function konfirmasiHapus() {
    const id = document.getElementById('hId').value;
    try {
        await apiFetch(`/api/smartphone/${id}`, 'DELETE');
        closeModal('mHapus');
        showToast('✅ Smartphone berhasil dihapus!', 'success');
        loadTable();
    } catch(e) { showToast('❌ ' + e.message, 'error'); }
}

document.addEventListener('DOMContentLoaded', loadTable);
