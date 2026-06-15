# ============================================================
# app.py - File utama Flask SPK Smartphone (Metode WP)
# ============================================================

from flask import Flask, render_template, request, jsonify
import sqlite3, os, math

app = Flask(__name__)
DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')

# ── DB HELPERS ──────────────────────────────────────────────
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute('''CREATE TABLE IF NOT EXISTS smartphone (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        nama    TEXT    NOT NULL,
        harga   REAL    NOT NULL,
        ram     REAL    NOT NULL,
        storage REAL    NOT NULL,
        baterai REAL    NOT NULL,
        kamera  REAL    NOT NULL
    )''')
    if conn.execute('SELECT COUNT(*) FROM smartphone').fetchone()[0] == 0:
        conn.executemany(
            'INSERT INTO smartphone (nama,harga,ram,storage,baterai,kamera) VALUES (?,?,?,?,?,?)',
            [
                ('Samsung Galaxy A54',  4999000, 8, 256, 5000, 50),
                ('Xiaomi Redmi Note 12',2799000, 6, 128, 5000, 50),
                ('iPhone 13',          11999000, 6, 128, 3227, 12),
                ('OPPO Reno 8',         4499000, 8, 256, 4500, 50),
                ('Realme 10 Pro',       3499000, 8, 256, 5000,108),
            ]
        )
    conn.commit(); conn.close()

# ── PAGES ────────────────────────────────────────────────────
@app.route('/')
def dashboard():
    conn = get_db()
    total = conn.execute('SELECT COUNT(*) FROM smartphone').fetchone()[0]
    conn.close()
    return render_template('dashboard.html', total=total)

@app.route('/data')
def data_smartphone():
    conn = get_db()
    rows = conn.execute('SELECT * FROM smartphone ORDER BY id').fetchall()
    conn.close()
    return render_template('data.html', smartphones=rows)

@app.route('/perhitungan')
def perhitungan():
    return render_template('perhitungan.html')

@app.route('/tentang')
def tentang():
    return render_template('tentang.html')

# ── API CRUD ─────────────────────────────────────────────────
@app.route('/api/smartphone', methods=['GET'])
def api_get_all():
    conn = get_db()
    rows = [dict(r) for r in conn.execute('SELECT * FROM smartphone ORDER BY id').fetchall()]
    conn.close()
    return jsonify(rows)

@app.route('/api/smartphone/<int:id>', methods=['GET'])
def api_get_one(id):
    conn = get_db()
    row = conn.execute('SELECT * FROM smartphone WHERE id=?', (id,)).fetchone()
    conn.close()
    return jsonify(dict(row)) if row else (jsonify({'error':'Not found'}), 404)

@app.route('/api/smartphone', methods=['POST'])
def api_tambah():
    d = request.get_json()
    try:
        conn = get_db()
        conn.execute('INSERT INTO smartphone (nama,harga,ram,storage,baterai,kamera) VALUES (?,?,?,?,?,?)',
            (d['nama'], float(d['harga']), float(d['ram']), float(d['storage']), float(d['baterai']), float(d['kamera'])))
        conn.commit(); conn.close()
        return jsonify({'message':'OK'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/smartphone/<int:id>', methods=['PUT'])
def api_edit(id):
    d = request.get_json()
    try:
        conn = get_db()
        conn.execute('UPDATE smartphone SET nama=?,harga=?,ram=?,storage=?,baterai=?,kamera=? WHERE id=?',
            (d['nama'], float(d['harga']), float(d['ram']), float(d['storage']), float(d['baterai']), float(d['kamera']), id))
        conn.commit(); conn.close()
        return jsonify({'message':'OK'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/smartphone/<int:id>', methods=['DELETE'])
def api_hapus(id):
    try:
        conn = get_db()
        conn.execute('DELETE FROM smartphone WHERE id=?', (id,))
        conn.commit(); conn.close()
        return jsonify({'message':'OK'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ── API WP ───────────────────────────────────────────────────
@app.route('/api/hitung-wp', methods=['POST'])
def hitung_wp():
    """
    Weighted Product:
    1. Normalisasi bobot: W = w / Σw
    2. Vektor S: S_i = Π(X_ij)^Wj  → Benefit +Wj, Cost -Wj
    3. Vektor V: V_i = S_i / ΣS_i
    4. Rank by V descending
    """
    d = request.get_json()
    w_raw = {
        'harga':   float(d.get('bobot_harga',   1)),
        'ram':     float(d.get('bobot_ram',     1)),
        'storage': float(d.get('bobot_storage', 1)),
        'baterai': float(d.get('bobot_baterai', 1)),
        'kamera':  float(d.get('bobot_kamera',  1)),
    }
    total_w = sum(w_raw.values())
    w = {k: v/total_w for k, v in w_raw.items()}

    conn = get_db()
    phones = conn.execute('SELECT * FROM smartphone').fetchall()
    conn.close()
    if not phones:
        return jsonify({'error': 'Tidak ada data'}), 400

    hasil = []
    for p in phones:
        s = (p['harga']   ** (-w['harga'])   *
             p['ram']     **  w['ram']        *
             p['storage'] **  w['storage']    *
             p['baterai'] **  w['baterai']    *
             p['kamera']  **  w['kamera'])
        hasil.append({**dict(p), 'nilai_s': s})

    total_s = sum(x['nilai_s'] for x in hasil)
    for x in hasil:
        x['nilai_v'] = x['nilai_s'] / total_s

    hasil.sort(key=lambda x: x['nilai_v'], reverse=True)
    for i, x in enumerate(hasil):
        x['ranking']  = i + 1
        x['nilai_s']  = round(x['nilai_s'], 6)
        x['nilai_v']  = round(x['nilai_v'], 6)

    return jsonify({
        'bobot_normalized': {k: round(v, 4) for k,v in w.items()},
        'hasil':   hasil,
        'terbaik': hasil[0]
    })

@app.route('/api/statistik')
def statistik():
    conn = get_db()
    total = conn.execute('SELECT COUNT(*) FROM smartphone').fetchone()[0]
    conn.close()
    return jsonify({'total': total})


# ── RUN ──────────────────────────────────────────────────────
if __name__ == '__main__':
    init_db()
    print("=" * 45)
    print("  SPK Smartphone → http://127.0.0.1:5000")
    print("=" * 45)
    app.run(debug=True, port=5000)
