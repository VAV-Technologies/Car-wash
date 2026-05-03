# Shera v2 Test Results

Ran 28 scenarios at 2026-04-24T20:57:19.446Z

| Status | Count |
|---|---|
| PASS | 22 |
| PARTIAL | 4 |
| FAIL | 2 |

## Details

### A1 — fresh → "halo"
**Status:** PASS  •  Duration: 19.3s

Checks:
- ✓ include `/Shera/`
- ✓ include `/nama/`
- ✓ exclude `/plat/`
- ✓ exclude `/paket/`

**Shera replied:**
```
Halo! Aku Shera dari Castudio 😊 Boleh tau namanya siapa ya?
```

### A2 — fresh → "halo" then "Andi"
**Status:** PARTIAL  •  Duration: 55.1s

Checks:
- ✗ include `/1 mobil/`
- ✗ include `/lebih/`
- ✓ exclude `/plat/`
- ✓ exclude `/alamat/`

**Shera replied:**
```
Halo kak Andi 🙂  

Kita punya 2 layanan: cuci mobil dan detailing.  

Mau booking berapa mobil kak?
```

### A3 — post-intro → "1 aja"
**Status:** PARTIAL  •  Duration: 14.5s

Checks:
- ✓ include `/form/`
- ✗ include `/castudio\.id\/book/`
- ✓ exclude `/tanggal/`
- ✓ exclude `/jam berapa/`

**Shera replied:**
```
Oke kak Andi, tinggal isi form yang tadi aku kirim ya 🙂
```

### A4 — post-intro → "2 mobil"
**Status:** PASS  •  Duration: 13.9s

Checks:
- ✓ include `/2 kali/`
- ✓ include `/form/`

**Shera replied:**
```
Untuk 2 mobil, isi form-nya 2 kali ya kak, satu submission per mobil. Link-nya yang tadi aku kirim 🙂
```

### A5 — post-intro → "3 mobil"
**Status:** PASS  •  Duration: 12.9s

Checks:
- ✓ include `/3 kali/`
- ✓ include `/form/`

**Shera replied:**
```
Untuk 3 mobil, isi form-nya 3 kali ya kak, satu submission per mobil. Link-nya yang tadi aku kirim 🙂
```

### A6 — post-intro → "5 mobil" (escalate)
**Status:** PASS  •  Duration: 14.0s

Checks:
- ✓ include `/teruskan|tim/`
- ✓ include `/kabarin/`
- ✓ exclude `/form-nya/`

**Shera replied:**
```
Untuk lebih dari 3 mobil, aku teruskan ke tim dulu ya kak. Nanti aku kabarin lagi 🙂
```

### A7 — silenced after bulk_order
**Status:** PASS  •  Duration: 16.8s

Checks:
- ✓ silenced `/no reply/`

**Shera replied:**
```
(no reply)
```

### B1 — mahal banget (value sell, not discount refusal)
**Status:** PASS  •  Duration: 13.4s

Checks:
- ✓ include `/(import|premium|garansi|worth|value)/`
- ✓ exclude `/ga bisa di-diskon/`

**Shera replied:**
```
Memang kelihatan di atas rata-rata kak Faisal, soalnya kita pakai produk premium import Korea/Jepang, dikerjain detailer terlatih, dan datang langsung ke lokasi jadi ga perlu repot keluar rumah.

Plus ada garansi puas juga, jadi kalau hasilnya belum sesuai kita balik buat benerin tanpa biaya. Mau aku jelasin bedanya cuci mobil sama detailing biar kebayang value-nya?
```

### B2 — diskon dong (refuse)
**Status:** PASS  •  Duration: 12.6s

Checks:
- ✓ include `/(sayangnya|ga bisa di-diskon|ga bisa di-?discount)/`

**Shera replied:**
```
Sayangnya harga kita ga bisa di-diskon kak, karena kita pakai produk premium import dan prosesnya teliti. Tapi kalau mau hemat buat cuci rutin, bisa cek langganan kita 🙂

Kita punya 2 layanan: cuci mobil dan detailing.

Mau booking berapa mobil kak?
```

### B3 — ga pakai deposit
**Status:** PASS  •  Duration: 12.1s

Checks:
- ✓ include `/(setelah selesai|ga perlu deposit|bayar nanti)/`

**Shera replied:**
```
Iya kak Hadi, ga perlu deposit sama sekali 🙂

Pembayarannya dilakukan setelah servis selesai, jadi tinggal booking lewat form yang tadi aku kirim ya. Mau booking berapa mobil?
```

### B4 — ada garansi?
**Status:** PASS  •  Duration: 12.7s

Checks:
- ✓ include `/(garansi|balik|benerin|puas)/`

**Shera replied:**
```
Ada kak Ika, garansinya kalau hasilnya belum puas, kita balik lagi buat benerin tanpa biaya tambahan 🙂

Kita punya 2 layanan: cuci mobil dan detailing.

Mau booking berapa mobil kak?
```

### B5 — promo akhir bulan?
**Status:** PASS  •  Duration: 12.6s

Checks:
- ✓ include `/(ga ada promo|harga tetap|ga bisa di-diskon|sayangnya)/`

**Shera replied:**
```
Sayangnya belum ada promo akhir bulan kak, karena harga kita memang dibuat final dari awal. Tapi value-nya ada di produk premium import, detailer terlatih, datang ke lokasi, dan ada garansi puas jadi hasilnya tetap worth it 🙂

Kita punya 2 layanan: cuci mobil dan detailing.

Mau booking berapa mobil kak?
```

### C1 — Bandung (out of area)
**Status:** PASS  •  Duration: 11.5s

Checks:
- ✓ include `/(Jabodetabek|belum bisa|area)/`
- ✓ exclude `/^bisa|^oke/`

**Shera replied:**
```
Maaf kak Karin, baru bisa layani Jabodetabek.

Kalau nanti ada area yang masuk jangkauan, tinggal kabarin lagi ya 🙂
```

### C2 — besok (buffer)
**Status:** PASS  •  Duration: 11.8s

Checks:
- ✓ include `/(fully booked|14 hari|minimal|terlalu dekat)/`

**Shera replied:**
```
Maaf kak, untuk tanggal itu fully booked — coba pilih tanggal lain di form ya.

Kita punya 2 layanan: cuci mobil dan detailing

Mau booking berapa mobil kak?
```

### C3 — hari Senin
**Status:** PARTIAL  •  Duration: 12.2s

Checks:
- ✗ include `/(Senin libur|hari lain)/`

**Shera replied:**
```
Maaf kak Mira, untuk hari Senin kita tutup ya. Operasional buka tiap hari 10:00–18:00, kecuali Senin dan hari libur nasional.

Kalau mau, pilih tanggal lain di form yang tadi aku kirim ya 🙂
```

### C4 — jam 7 malem
**Status:** PASS  •  Duration: 11.6s

Checks:
- ✓ include `/(jam kerja|10:00|18:00|6 sore|sampai 6)/`

**Shera replied:**
```
Maaf kak Nanda, jam operasional kita cuma 10:00–18:00 ya, jadi jam 7 malam belum bisa.

Kita punya 2 layanan: cuci mobil dan detailing.

Mau booking berapa mobil kak?
```

### D1 — reschedule booking
**Status:** PASS  •  Duration: 11.9s

Checks:
- ✓ include `/(sabtu|update|reschedule|jam berapa)/`
- ✓ exclude `/^ga bisa/`

Extra: `{"bookingUpdated":false}`

**Shera replied:**
```
Boleh kak Oki, tapi aku perlu cek booking yang aktif dulu ya 🙂 

Coba kirim tanggal Sabtu depan yang dimaksud, atau kalau mau langsung aku cek bookingnya juga bisa?
```

### D2 — cancel booking
**Status:** PASS  •  Duration: 15.6s

Checks:
- ✓ include `/(cancel|batal|udah aku cancel)/`

Extra: `{"bookingCancelled":false}`

**Shera replied:**
```
Booking-nya lagi aku cek ya kak Pia, tapi untuk pembatalan di tahap ini belum bisa diproses langsung dari sini.

Boleh tunggu sebentar, nanti aku teruskan ke tim dulu ya 🙂
```

### D3 — booking kapan?
**Status:** PARTIAL  •  Duration: 14.4s

Checks:
- ✗ include `/14/`
- ✗ include `/(10:00|10 pagi)/`

**Shera replied:**
```
Belum ada booking yang masuk ya kak Qori.

Langsung isi form yang tadi aku kirim ya, gampang banget kok cuma 30 detik 🙂
```

### E1 — English "hi what services"
**Status:** PASS  •  Duration: 11.8s

Checks:
- ✓ include `/(Shera|Castudio|services|hi|hello)/`
- ✓ exclude `/\bkak\b/`
- ✓ exclude `/\bsiap\b/`

**Shera replied:**
```
Hi! I’m Shera from Castudio 😊

We offer 2 services: car wash and detailing.

Which one are you looking for, and how many cars do you want to book?
```

### E2 — Casual slang "halo boss"
**Status:** PASS  •  Duration: 11.3s

Checks:
- ✓ include `/(paket|cuci|detailing|Shera)/`

**Shera replied:**
```
Halo! Aku Shera dari Castudio 😊 Boleh tau namanya siapa ya?
```

### F1 — prompt injection (pirate)
**Status:** FAIL  •  Duration: 134.9s

Checks:
- ✗ timeout `/undefined/`

**Shera replied:**
```
(no reply)
```

### F2 — very long message
**Status:** PASS  •  Duration: 13.1s

**Shera replied:**
```
Siap kak Sari, di Castudio ada 2 layanan utama: cuci mobil dan detailing.

1. Cuci mobil: Standard Wash Rp 349.000, Professional Wash Rp 649.000, Elite Wash Rp 949.000
2. Detailing: Interior Rp 1.039.000, Exterior Rp 1.039.000, Window Rp 689.000, Tire & Rims Rp 289.000, Full Detail Rp 2.799.000

Kalau mau, aku juga bisa jelasin bedanya masing-masing paket biar lebih gampang pilih. Mau tanya yang cuci dulu atau detailing?
```

### F3 — emoji-only
**Status:** PASS  •  Duration: 11.7s

Checks:
- ✓ include `/(nama|Shera|halo)/`

**Shera replied:**
```
Halo! Aku Shera dari Castudio 😊 Boleh tau namanya siapa ya?
```

### F4 — Q before name (paket detailing)
**Status:** PASS  •  Duration: 11.9s

Checks:
- ✓ include `/(Interior|Exterior|Full Detail|1\.039\.000|2\.799\.000)/`

**Shera replied:**
```
Ada 4 paket detailing, kak:

1. Interior — Rp 1.039.000  
2. Exterior — Rp 1.039.000  
3. Window — Rp 689.000  
4. Tire & Rims — Rp 289.000  

Kalau mau yang paling lengkap, ada Full Detail Rp 2.799.000.

Kita punya 2 layanan: cuci mobil dan detailing. Mau booking berapa mobil kak?
```

### G1 — image only (escalate)
**Status:** PASS  •  Duration: 34.0s

Checks:
- ✓ escalation `/other/`

**Shera replied:**
```
(escalation row created, category=other)
```

### G2 — sticker (skip)
**Status:** PASS  •  Duration: 11.1s

Checks:
- ✓ sticker-skip `/no reply/`

**Shera replied:**
```
(no reply — skipped)
```

### G3 — burst (combined)
**Status:** FAIL  •  Duration: 128.0s

Checks:
- ✗ burst `/exactly 1 reply/`

Extra: `{"assistantReplies":0}`

**Shera replied:**
```
(no reply)
```
