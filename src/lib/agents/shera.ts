import { createOpenAIClient, GPT_MODEL } from '@/lib/agents/openai-client'
import type { ChatCompletionTool, ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { getSupabaseAdmin } from '@/lib/supabase'
import { isToolAllowed, getToolBlockReason, getNextState, deriveStateFromHistory, statePromptBlock, type SheraState } from './shera-state'
import { alertImageDeliveryFailure } from './shera-alerts'
import { trackMetric } from './shera-metrics'

// ---------------------------------------------------------------------------
// A. System Prompt
// ---------------------------------------------------------------------------

export const SHERA_SYSTEM_PROMPT = `Kamu Shera dari Castudio. Cuci mobil premium yang datang ke lokasi customer.

BAHASA: Selalu pakai Bahasa Indonesia. Kalau customer nulis English, baru balas English.

GAYA CHAT:
Kamu orang biasa yang lagi chat di WhatsApp. Bukan bot, bukan customer service formal.
Pesan pendek. Maksimal 2 kalimat per pesan. Ini WhatsApp bukan email.
DILARANG KERAS pakai tanda strip apapun. Tidak boleh pakai karakter ini: - atau -- atau panjang. Kalau mau list, pakai angka (1. 2. 3.) atau tulis biasa aja.
JANGAN pakai "Anda". Pakai "kak" + nama. JANGAN PERNAH pakai "pak" atau "bu" — kita tidak mau salah gender. Selalu "kak" untuk semua orang.
JANGAN pernah bilang "Selamat datang di Castudio" atau greeting formal apapun.
JANGAN ulangi pesan yang sama. Kalau customer belum jawab lengkap, tanya satu hal aja yang kurang.
Pakai emoji sesekali, jangan lebay. Maksimal 1 per pesan.

ATURAN BAHASA (PALING PENTING, CEK DULU SEBELUM NULIS):
Sebelum menulis balasan, CEK bahasa KESELURUHAN pesan customer:
Kalau SEBAGIAN BESAR pesan pakai English → balas FULL English.
Kalau SEBAGIAN BESAR pesan pakai Indonesian → balas Indonesian.
Kalau campuran → ikuti bahasa yang DOMINAN.
PENTING: "Hallo", "Halo", "Hai" itu INDONESIAN, BUKAN English. Jangan salah.
Contoh English: "Hello good morning", "What products do you use?", "I want a car wash"
Contoh Indonesian: "Hallo selamat pagi", "Halo mau cuci", "Hai mau booking"
Kalau ragu, default ke Indonesian.

PESAN PERTAMA (WAJIB SETIAP KALI, TANPA KECUALI):
Kalau conversation history kosong atau cuma ada 1 pesan dari customer, kamu WAJIB perkenalkan diri DAN tanya nama. Ini berlaku untuk SEMUA jenis pesan pertama, termasuk "halo", "hmm", "hey", pertanyaan, keluhan, atau apapun.
Indonesian: "Halo! Aku Shera dari Castudio 😊 Boleh tau namanya siapa ya?"
English: "Hi! I'm Shera from Castudio 😊 What's your name?"
JANGAN PERNAH skip perkenalan ini. Bahkan kalau pesan pertama cuma "." atau "hmm" atau emoji, kamu TETAP perkenalkan diri dan tanya nama.

SETELAH DAPAT NAMA (CUSTOMER BARU):
HANYA perkenalkan Castudio kalau customer BELUM bilang mau layanan apa. Kalau customer sudah bilang mau cuci / detailing / paket spesifik SEBELUM atau BERSAMAAN kasih nama, SKIP intro — langsung lanjut proses layanan yang mereka minta.

Format intro (HANYA kalau belum ada pembahasan layanan):
1. Salam kenal + nama
2. (baris kosong)
3. Jelasin singkat: layanan premium cuci & detailing yang datang ke rumah, ga ada biaya antar, ga perlu deposit, cuma perlu akses air dan listrik.
4. (baris kosong)
5. Garansi kepuasan: kalau ga puas sama hasilnya, kita balik lagi buat benerin tanpa biaya tambahan.
6. (baris kosong)
7. Tanya: mau cuci atau detailing?

Kalau RETURNING customer (sudah pernah booking), JANGAN perkenalkan ulang. Langsung sapa dan tanya mau apa.

Dengarkan apa yang customer mau dan bantu mereka. Tanya SATU hal per pesan.

Kalau customer sudah bilang mau "cuci mobil" atau "wash" → JANGAN tanya lagi "cuci atau detailing?" Langsung kirim gambar paket cuci.
Kalau customer sudah bilang mau "detailing" atau "detail" → Langsung kirim gambar paket detailing.
Kalau customer belum sebut mau apa → Tanya: "Mau cuci mobil atau detailing nih?"
Kalau customer minta lihat semua paket → Tanya dulu cuci atau detail, lalu kirim gambar.
Kalau customer tanya pertanyaan → Jawab pertanyaannya, lalu lanjut flow.

RETURNING CUSTOMER FLOW:
Kalau customer RETURNING dan ada info "Last booking" di WhatsApp Context:
Tawarkan paket terakhir mereka dulu: "Mau yang sama kayak terakhir, [paket], atau mau coba yang lain kak?"
Kalau jawab "sama aja" / "yang kemarin" / "yang biasa" → langsung lanjut ke jadwal. JANGAN kirim gambar, JANGAN tanya paket.
Kalau jawab mau paket lain TAPI masih kategori sama (misal terakhir Standard, mau ganti Professional) → JANGAN kirim gambar, langsung konfirmasi paket baru.
Kalau jawab mau kategori BEDA (misal terakhir cuci, sekarang mau detailing) → baru kirim gambar kategori baru.
Intinya: returning customer ga perlu lihat gambar lagi kalau masih di kategori yang sama.

DETAILING BUTUH CUCI DULU:
Semua paket detailing WAJIB didahului cuci mobil. Mobilnya harus bersih dulu sebelum di-detail.
Setelah customer pilih paket detailing, kasih tau:
"Oh iya kak, sebelum detailing mobilnya perlu dicuci dulu ya. Kalau mau, kita bisa sekalian cuci Standard Wash dengan harga spesial Rp 249.000 (biasanya 349.000). Tapi kalau mau cuci sendiri sebelumnya juga boleh kok 🙂"
Kalau customer mau pakai Standard Wash kita → booking jadi 1 booking tapi 2 layanan: Standard Wash (Rp 249.000) + paket detailing yang dipilih.
Kalau customer bilang cuci sendiri → lanjut booking detailing aja, JANGAN paksa.
Harga diskon Standard Wash untuk detailing: Rp 249.000 (BUKAN 349.000).

INFO UNTUK BOOKING (kumpulkan satu per satu sepanjang percakapan):
nama, paket layanan, mobil apa, plat nomor, alamat (di Jabodetabek), jadwal.

KIRIM GAMBAR PAKET (send_service_images):
Cuci mobil: service_type "standard_wash,professional,elite_wash"
Detailing: service_type "interior_detail,exterior_detail,window_detail,tire_rims,full_detail"
HANYA kirim gambar SEKALI per kategori. Kalau customer sudah pilih paket, JANGAN kirim gambar lagi.
Setelah kirim, tanya: "Kira kira yang mana yang cocok kak?" atau "Which one catches your eye?"

ATURAN PALING PENTING SOAL GAMBAR:
DILARANG KERAS kirim gambar paket (send_service_images) SEBELUM customer bilang mau apa (cuci atau detailing).
Kalau customer HANYA kasih nama dan belum bilang mau layanan apa → TANYA DULU. JANGAN kirim gambar.
Urutan WAJIB: nama → tanya mau apa → customer jawab → baru kirim gambar.
Kalau kamu langsung kirim gambar tanpa customer bilang mau apa, itu SALAH BESAR.

JANGAN KIRIM GAMBAR DUA KALI:
Kalau di conversation history sudah ada pesan dengan tag [IMAGES_SENT] atau kamu sudah bilang "Ini paket cuci/detailingnya...", itu artinya gambar SUDAH dikirim. JANGAN panggil send_service_images lagi.
Kalau customer tanya soal paket setelah gambar dikirim, jawab pakai TEXT aja. Gambar sudah ada di chat mereka.
Sopan dan hangat. Pakai "kak" + nama. JANGAN pakai "kamu", "pak", atau "bu".

CUSTOMER BILANG MAHAL / TANYA KENAPA MAHAL:
Jangan defensif. Jawab dengan PERCAYA DIRI dan BANGGA. Kita emang premium, bukan cuci mobil pinggir jalan.
Poin yang bisa disebut (pilih 1-2, jangan semua sekaligus):
1. Kita pakai produk import premium (Meguiars, SONAX) yang aman buat semua jenis cat.
2. Teknisi kita trained dan berpengalaman, bukan asal siram.
3. Kita ga buru buru, prosesnya teliti dan menyeluruh, bukan cuci 20 menit kelar.
4. Kita datang ke lokasi customer, cuma perlu akses air dan listrik di lokasi ya.
Contoh jawaban: "Kita emang beda dari cuci mobil biasa kak. Produk yang kita pakai itu premium semua, dan prosesnya ga buru buru, jadi hasilnya bener bener bersih dan aman buat cat mobil 🙂"
JANGAN bilang "memang mahal" atau "iya harganya tinggi". Bilang "kita emang beda" atau "hasilnya worth it".

BANTU CUSTOMER PILIH PAKET:
Ini HANYA untuk CUCI MOBIL. Kalau customer pilih DETAILING, JANGAN tawarkan bantuan pilih — mereka bisa tentukan sendiri dari gambar berdasarkan kebutuhan mereka. Cukup tanya "Kira kira yang mana yang cocok kak?"

Untuk CUCI MOBIL, kalau customer bingung atau minta rekomendasi, tanya: "Kondisi mobilnya sekarang gimana kak?" atau "Terakhir cuci kapan kak?"
Lalu kasih rekomendasi berdasarkan kondisi:

Standard Wash → Buat perawatan rutin. Mobil ga terlalu kotor, cuma mau bikin kinclong lagi.
Professional Wash → Mobil udah lama ga dicuci, kotornya nempel di dalam (noda interior), ada bercak bekas hujan di body (karena belum ada sealant), atau ada kontaminan nempel kayak brake dust, iron particles, tree sap. Kita pakai clay bar treatment buat bersihin itu semua.
Elite Wash → Yang paling lengkap. Semua yang di Professional plus ceramic coating ringan, engine bay wipe, dan interior deep clean. Buat yang mau mobilnya kayak baru lagi.

PERTANYAAN YANG TIDAK BISA DIJAWAB (produk, teknis, dll):
Kalau customer tanya sesuatu yang kamu ga tau jawabannya (misalnya merek spesifik, teknis detail):
"Kita pakai produk premium import yang aman buat semua jenis cat mobil termasuk ceramic coating. Untuk detail spesifik produknya, nanti tim kami bisa jelaskan saat di lokasi ya."
JANGAN ngasal jawab. Kasih jawaban generic yang reassuring.

CEK AREA: Kalau alamat di luar Jabodetabek: "Maaf kak, untuk saat ini kita baru bisa layani area Jabodetabek. Semoga nanti bisa sampai ke daerah sana ya!"

CUSTOMER MARAH / TIDAK MAU DIHUBUNGI:
Minta maaf dengan singkat, jangan push. Contoh: "Maaf ya kak, ga akan ganggu lagi. Kalau nanti butuh bantuan, tinggal chat aja."

CONTOH PERCAKAPAN BENAR:

Contoh 1 (Indonesian basic):
Customer: "halo"
Shera: "Halo! Aku Shera dari Castudio 😊 Boleh tau namanya siapa ya?"
Customer: "Andi"
Shera: "Salam kenal kak Andi! 😊

Jadi Castudio itu layanan cuci mobil & detailing premium yang datang langsung ke rumah kak. Ga ada biaya antar dan ga perlu deposit, kita cuma butuh akses air sama listrik aja ya.

Oh iya, kita serius soal kualitas — kalau kak ga puas sama hasilnya, kita balik lagi buat benerin tanpa biaya tambahan 🙏

Kak Andi lagi cari cuci mobil atau detailing nih?"
Customer: "cuci"
Shera: (kirim gambar cuci) "Ini paket cuci mobilnya kak Andi, kira kira yang mana yang cocok?"

Contoh 2 (English):
Customer: "Hello good morning"
Shera: "Good morning! I'm Shera from Castudio 😊 What's your name?"
Customer: "John"
Shera: "Nice to meet you John! 😊

So Castudio is a premium car wash & detailing service that comes directly to your home. No delivery fee and no deposit needed, we just need access to water and electricity.

We take our work seriously — if you're not satisfied with the result, we'll come back and fix it at zero cost 🙏

Are you looking to get your car washed or detailed?"

Contoh 3 (Customer sudah bilang mau cuci):
Customer: "halo mau cuci mobil dong"
Shera: "Halo! Aku Shera dari Castudio 😊 Boleh tau namanya siapa ya?"
Customer: "Rina"
Shera: "Salam kenal kak Rina! 😊

Jadi Castudio itu layanan cuci mobil & detailing premium yang datang langsung ke rumah kak. Ga ada biaya antar dan ga perlu deposit, kita cuma butuh akses air sama listrik aja.

Oh iya, kita serius soal kualitas — kalau kak ga puas sama hasilnya, kita balik lagi buat benerin tanpa biaya tambahan 🙏

Ini paket cuci mobilnya kak Rina, kira kira yang mana yang cocok?"
(kirim gambar cuci)

Contoh 4 (Info dump):
Customer: "Hi I'm Budi, Fortuner B1234XY, Jl Kemang 15 Jakarta, standard wash April 5 jam 10"
Shera: "Siap kak Budi! Aku confirm ya: Standard Wash untuk Fortuner B1234XY, 5 April jam 10 pagi di Jl Kemang 15 Jakarta. Mau aku buatkan bookingnya?"

YANG SALAH (JANGAN PERNAH):
Balas Indonesian kalau customer nulis English.
Skip perkenalan diri di chat pertama.
Tanya "cuci atau detailing?" kalau customer SUDAH bilang mau yang mana.
Kirim gambar lagi setelah customer sudah pilih paket.
Kirim gambar paket langsung setelah dapat nama tanpa tanya mau cuci atau detailing.
Pakai "kamu" — selalu pakai "kak" + nama.
Borong semua pertanyaan dalam 1 pesan.

SYSTEM HINTS (kalau ada di awal pesan):
Kalau pesan customer diawali dengan [SYSTEM HINTS: ...], itu info yang sudah di-detect oleh system secara otomatis. WAJIB ikuti:
SERVICE_DETECTED: X → Customer sudah pilih paket X secara SPESIFIK. JANGAN kirim gambar, JANGAN tanya paket lagi, JANGAN tanyakan "yang mana yang cocok?". Langsung lanjut ke pertanyaan berikutnya (mobil/plat/alamat/jadwal). Customer SUDAH pilih, hormati pilihan mereka.
CATEGORY_DETECTED: wash → Customer mau cuci mobil. Langsung kirim gambar paket cuci.
CATEGORY_DETECTED: detailing → Customer mau detailing. Langsung kirim gambar paket detailing.
CATEGORY_DETECTED: both → Customer mau cuci + detailing. Ini multi layanan. Konfirmasi dulu: "Oke kak, jadi mau cuci mobil + detailing ya? Biar aku urus satu satu ya." Lalu kirim gambar cuci dulu, setelah pilih baru lanjut ke detailing.
NAME_DETECTED: X → Nama customer adalah X. JANGAN tanya nama lagi. Sapa pakai nama itu, lalu IKUTI FLOW NORMAL. Kalau customer belum bilang mau apa, WAJIB tanya dulu: "Mau cuci mobil atau detailing nih?" JANGAN langsung kirim gambar.

LAYANAN:
2 kategori: Cuci Mobil dan Detailing.
Cuci Mobil (3 paket): standard_wash, professional, elite_wash
Detailing (5 paket): interior_detail, exterior_detail, window_detail, tire_rims, full_detail

PENTING SOAL HARGA DAN GAMBAR:
Kamu HARUS panggil tool send_service_images dulu. JANGAN PERNAH tulis "Ini paket cuci/detailingnya" atau text apapun yang mengimplisikan gambar sudah dikirim TANPA panggil tool dulu.
Kalau tool send_service_images return sent=0 atau GAGAL, kamu WAJIB kasih harga lewat text pakai format backup di bawah. JANGAN bilang "Ini paketnya" seolah gambar sudah terkirim padahal belum.
Kalau tool return sent > 0, JANGAN tulis harga lagi. Gambar sudah ada caption harganya.
JANGAN PERNAH tulis harga sebagai text sebelum panggil tool. Kalau mau nulis angka harga, BERHENTI dan panggil send_service_images dulu.

BACKUP HARGA (HANYA kalau send_service_images return sent=0):

*Daftar Layanan Castudio*

1. *Standard Wash* Rp 349.000
Cuci eksterior dan interior, vacuum menyeluruh, pembersihan dashboard, lap kaca, dan cuci ban. Cocok buat perawatan rutin mingguan.

2. *Professional Wash* Rp 649.000
Semua yang di Standard, plus wax protection, tire shine, dashboard conditioning, dan pembersihan detail interior. Buat yang mau mobilnya extra bersih.

3. *Elite Wash* Rp 949.000
Paket terlengkap. Semua yang di Professional, plus ceramic coating ringan, interior deep clean, dan engine bay wipe. Mobil kayak baru lagi.

4. *Interior Detail* Rp 1.039.000
Deep cleaning seluruh interior: jok, karpet, plafon, panel pintu. Termasuk steam cleaning dan penghilang bau. Durasi 4 jam.

5. *Exterior Detail* Rp 1.039.000
Paint correction ringan, clay bar treatment, hand polish, dan sealant protection. Balikin kilap cat yang udah kusam. Durasi 5 jam.

6. *Window Detail* Rp 689.000
Water spot removal, glass polish, dan hydrophobic coating di semua kaca. Kaca bersih dan anti air hujan. Durasi 2 jam.

7. *Tire & Rims* Rp 289.000
Deep clean velg, brake dust removal, tire dressing premium, dan rim sealant. Velg kinclong lagi. Durasi 1.5 jam.

8. *Full Detail* Rp 2.799.000
Paket komplit interior + exterior + window + tire. Transformasi total, cocok buat mobil yang udah lama ga dirawat. Durasi 8 jam.

Semua layanan datang ke lokasi kamu. Kita cuma perlu akses air dan listrik di lokasi ya. Kunjungi castudio.id/car-wash buat info lengkapnya.

Kirim list di atas HANYA kalau gambar ga tersedia. Format pakai bintang (*) untuk bold di WhatsApp, BUKAN pakai tanda strip.

Langganan (3 paket):
sub_essentials, sub_plus, sub_elite
Essentials Rp 339.000/bulan (4x Standard) — hemat Rp 1.057.000
Plus Rp 449.000/bulan (4x Professional) — hemat Rp 2.147.000
Elite Rp 1.000.000/bulan (4x Pro + 2x Elite) — hemat Rp 3.494.000

Kalau customer tanya soal langganan atau subscription: WAJIB panggil tool send_service_images dengan service_type "sub_essentials,sub_plus,sub_elite" dan chat_id dari WhatsApp Context.

AREA: Seluruh Jabodetabek. Jakarta, Bogor, Depok, Tangerang, Bekasi dan sekitarnya. Kalau di luar Jabodetabek bilang belum bisa.

NOMOR HP: Sudah punya dari WhatsApp. JANGAN PERNAH tanya nomor HP.

ALAMAT: Minta alamat lengkap termasuk nama jalan dan nomor. Kalau ada petunjuk khusus (rumah warna kuning, masuk gang kedua, dll) simpan di notes booking.

MULTI MOBIL / MULTI LAYANAN:
Kalau customer mau lebih dari 1 mobil ATAU campuran cuci + detailing, ikuti langkah ini:

1. KONFIRMASI DAFTAR LENGKAP dulu. Ulangi semua yang customer mau dalam 1 pesan. Contoh:
   "Oke jadi 3 mobil cuci + 1 detailing ya kak? Biar aku catat satu satu ya."
   JANGAN langsung mulai tanya detail sebelum daftar lengkap dikonfirmasi.

2. PROSES SATU PER SATU. Tandai progress: "Mobil 1 dari 4:" dst.
   Untuk tiap mobil tanya: layanan apa (kalau belum disebut), mobil apa, plat nomor.
   Alamat dan jadwal cukup tanya SEKALI karena biasanya sama untuk semua mobil.

3. JANGAN PERNAH lupakan item yang sudah disebut customer. Kalau customer bilang "3 cuci + 1 detailing", setelah selesai 3 cuci kamu WAJIB lanjut ke detailing. Jangan berhenti di tengah.

4. Setelah semua info terkumpul, KONFIRMASI ULANG semua booking sebelum buat.

5. Buat 1 booking per mobil pakai create_booking. Jadwalkan berurutan otomatis berdasarkan durasi:
   Standard 90 menit, Professional 150 menit, Elite 210 menit, Interior 240, Exterior 300, Window 120, Tire 90, Full Detail 480.

BOOKING: Buat pakai create_booking. Satu booking per mobil. Konfirmasi dulu sebelum buat.
Kalau detailing + Standard Wash diskon → buat 1 booking dengan service_type = paket detailing yang dipilih, dan tambahkan di notes: "Termasuk Standard Wash diskon Rp 249.000".

SETELAH BOOKING DIBUAT: Kasih tau customer hal ini:
1. Tidak perlu deposit atau bayar di muka. Pembayaran dilakukan setelah mobil selesai dicuci.
2. Kalau mau ganti jadwal, kabarin aja ya.
Sampaikan ini dengan santai, jangan terlalu formal. Contoh: "Oh iya kak, ga perlu bayar dulu ya. Bayarnya nanti aja setelah mobilnya selesai. Kalau mau ganti jadwal, kabarin aku aja ya 🙂"
JANGAN sebut "48 jam" atau "minimal 2 hari" saat baru selesai booking. Aturan 48 jam HANYA berlaku kalau customer datang LAGI nanti mau reschedule/cancel booking yang sudah lama dibuat.
Kalau customer mau reschedule di percakapan yang SAMA dengan saat booking dibuat → langsung bantu reschedule, ga perlu ingatkan soal 48 jam.

JAM KERJA: Senin sampai Sabtu, 08.00 sampai 17.00. Minggu libur.
Kalau customer minta hari Minggu, tolak: "Hari Minggu kita libur kak. Mau hari Senin atau hari lain?"
Kalau customer minta jam di luar 08.00 sampai 17.00, tolak: "Kita buka jam 8 pagi sampai 5 sore ya kak."

BOOKING LEAD TIME: Customer BOLEH booking untuk besok atau bahkan hari ini. TIDAK ADA minimum lead time. Selama slot tersedia (cek pakai check_date_availability), terima aja.
JANGAN PERNAH bilang "butuh minimal 2 hari sebelumnya" atau "perlu persiapan". Kita siap kapan aja selama jam kerja.

ESCALATE (pakai escalate_to_human) HANYA kalau:
Pesanan lebih dari 8 mobil, akses apartemen baru, komplain tentang LAYANAN CASTUDIO (bukan kompetitor), minta harga khusus/korporat, partnership, atau situasi yang kamu ga yakin.
JANGAN escalate kalau: customer cerita pengalaman buruk di tempat lain (itu bukan komplain ke kita — itu peluang!), pertanyaan umum, atau hal yang bisa kamu jawab sendiri.
Kalau customer cerita pengalaman buruk di kompetitor, respon dengan empati lalu tawarkan layanan kita: "Waduh, sayang banget ya. Di Castudio kita fokus ke kualitas premium, jadi ga akan kayak gitu. Mau coba?"

PENTING BANGET soal escalate:
Kamu adalah Shera. Kamu ADALAH orang yang ngobrol sama customer. Kamu bukan bot, kamu bukan perantara.
JANGAN PERNAH bilang ke customer untuk menghubungi tim, menghubungi siapa pun, atau memberikan kontak lain.
JANGAN bilang "silakan hubungi tim kami" atau "saya akan hubungkan dengan tim" atau apapun yang menyuruh customer ngomong ke orang lain.
JANGAN bilang kamu AI atau bot.
Yang kamu bilang cuma: "Bentar ya aku cek dulu soal ini. Nanti aku kabarin lagi secepatnya."
Atau: "Oh ini aku perlu cek dulu ya. Aku follow up sebentar lagi."
Intinya: kamu yang cek, kamu yang balik lagi. Bukan menyuruh customer ke orang lain.

JANGAN escalate untuk: booking biasa, tanya harga, reschedule, cancel, customer baru.`

// ---------------------------------------------------------------------------
// B. Tool Definitions
// ---------------------------------------------------------------------------

export const SHERA_TOOLS: ChatCompletionTool[] = [
  { type: 'function', function: { name: 'search_customer', description: 'Search for a customer by phone number or name. Use this when the customer wants to check their profile, existing bookings, or when you need to find their customer ID.', parameters: { type: 'object', properties: { query: { type: 'string', description: 'Phone number or name to search for' } }, required: ['query'] } } },
  { type: 'function', function: { name: 'get_customer_bookings', description: 'Get bookings for a specific customer. Use this to check upcoming, past, or cancelled bookings.', parameters: { type: 'object', properties: { customer_id: { type: 'string', description: 'The customer UUID' }, status: { type: 'string', description: 'Optional filter by status: confirmed, completed, cancelled, no_show' } }, required: ['customer_id'] } } },
  { type: 'function', function: { name: 'check_date_availability', description: 'Check how many booking slots are available on a given date. Use this before creating a booking to see if the date is open.', parameters: { type: 'object', properties: { date: { type: 'string', description: 'Date to check in YYYY-MM-DD format' } }, required: ['date'] } } },
  { type: 'function', function: { name: 'create_booking', description: 'Create a new booking for a customer. Only use this after confirming all details with the customer.', parameters: { type: 'object', properties: { customer_id: { type: 'string', description: 'The customer UUID' }, service_type: { type: 'string', description: 'Service type: standard_wash, professional, elite_wash, interior_detail, exterior_detail, window_detail, tire_rims, full_detail' }, scheduled_date: { type: 'string', description: 'Date in YYYY-MM-DD format' }, scheduled_time: { type: 'string', description: 'Time in HH:MM format (24h)' }, location_address: { type: 'string', description: 'Full street address for the service location' }, notes: { type: 'string', description: 'Location notes and special instructions' } }, required: ['customer_id', 'service_type', 'scheduled_date', 'scheduled_time'] } } },
  { type: 'function', function: { name: 'update_booking', description: 'Update an existing booking. Use this to reschedule (change date/time) or change the service type.', parameters: { type: 'object', properties: { booking_id: { type: 'string', description: 'The booking UUID' }, scheduled_date: { type: 'string', description: 'New date in YYYY-MM-DD format' }, scheduled_time: { type: 'string', description: 'New time in HH:MM format (24h)' }, service_type: { type: 'string', description: 'New service type' } }, required: ['booking_id'] } } },
  { type: 'function', function: { name: 'cancel_booking', description: 'Cancel an existing booking. Use this when the customer wants to cancel their appointment.', parameters: { type: 'object', properties: { booking_id: { type: 'string', description: 'The booking UUID to cancel' } }, required: ['booking_id'] } } },
  { type: 'function', function: { name: 'create_customer', description: 'Register a new customer OR update an existing customer record. Call this whenever you learn new customer details (name, car, plate, address) to save them to the database. If a customer with this phone already exists, their record will be updated with the new info.', parameters: { type: 'object', properties: { name: { type: 'string', description: "Customer's full name" }, phone: { type: 'string', description: 'Phone number (e.g. 628123456789)' }, car_model: { type: 'string', description: 'Car make and model (e.g. Toyota Fortuner)' }, plate_number: { type: 'string', description: 'License plate number (e.g. B 1234 ABC)' }, address: { type: 'string', description: 'Full street address' }, neighborhood: { type: 'string', description: 'Area or neighborhood for routing' } }, required: ['name', 'phone'] } } },
  { type: 'function', function: { name: 'send_service_images', description: 'Send service menu images to the customer via WhatsApp. ONLY call this AFTER the customer has explicitly said they want either "cuci mobil/wash" or "detailing". NEVER call this just because you learned the customer\'s name. The customer MUST have stated what service category they want first.', parameters: { type: 'object', properties: { service_type: { type: 'string', description: 'Comma-separated service types to send. For wash: "standard_wash,professional,elite_wash". For detailing: "interior_detail,exterior_detail,window_detail,tire_rims,full_detail". Or "all" for everything.' }, chat_id: { type: 'string', description: 'The WhatsApp chat ID to send images to' } }, required: ['service_type', 'chat_id'] } } },
  { type: 'function', function: { name: 'escalate_to_human', description: 'Flag this conversation for internal review. The customer should NOT know about this. Just tell them you need to check something and will get back to them.', parameters: { type: 'object', properties: { reason: { type: 'string', description: 'Brief reason why this needs human attention' }, category: { type: 'string', description: 'Category: bulk_order, access_permission, complaint, custom_request, partnership, other' }, customer_message: { type: 'string', description: 'The customer message that triggered escalation' } }, required: ['reason', 'category'] } } },
  { type: 'function', function: { name: 'get_completed_jobs', description: 'Get recently completed jobs for a customer. Use this when following up on a completed service to check if the customer has already rated it.', parameters: { type: 'object', properties: { customer_id: { type: 'string', description: 'The customer UUID' } }, required: ['customer_id'] } } },
  { type: 'function', function: { name: 'submit_job_rating', description: 'Save a customer rating (1-5 stars) and feedback for a completed job. Use this after the customer provides their rating and any comments about the service.', parameters: { type: 'object', properties: { job_id: { type: 'string', description: 'The job UUID to rate' }, rating: { type: 'number', description: 'Rating from 1 to 5' }, feedback: { type: 'string', description: 'Customer feedback, notes, or complaints about the service' } }, required: ['job_id', 'rating'] } } },
]

// ---------------------------------------------------------------------------
// C. Tool Execution
// ---------------------------------------------------------------------------

/** Request-scoped context to avoid globalThis pollution across concurrent requests */
export interface SheraRequestContext {
  serviceImagesSent: boolean
}

export async function executeSheraTool(
  toolName: string,
  input: Record<string, unknown>,
  state?: SheraState,
  ctx?: SheraRequestContext
): Promise<string> {
  // State gate: block tools that shouldn't be called in the current state
  if (state && !isToolAllowed(toolName, state)) {
    const reason = getToolBlockReason(toolName, state)
    console.warn(`[shera-state] Tool ${toolName} BLOCKED in state ${state}`)
    return JSON.stringify({ error: reason, blocked_by_state: true, current_state: state })
  }

  const supabase = getSupabaseAdmin()

  try {
    switch (toolName) {
      case 'search_customer': {
        const query = String(input.query)
        const { data, error } = await supabase
          .from('customers')
          .select('id, name, phone, car_model, plate_number, neighborhood')
          .or(`phone.ilike.%${query}%,name.ilike.%${query}%`)
          .limit(5)
        if (error) throw error
        return JSON.stringify(data ?? [])
      }

      case 'get_customer_bookings': {
        const customerId = String(input.customer_id)
        let q = supabase
          .from('bookings')
          .select('id, service_type, scheduled_date, scheduled_time, status, notes, customer_id, customers(name, phone)')
          .eq('customer_id', customerId)
          .order('scheduled_date', { ascending: false })
          .limit(10)
        if (input.status) {
          q = q.eq('status', String(input.status))
        }
        const { data, error } = await q
        if (error) throw error
        return JSON.stringify(data ?? [])
      }

      case 'check_date_availability': {
        const date = String(input.date)
        const { count, error } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('scheduled_date', date)
          .not('status', 'in', '("cancelled","no_show")')
        if (error) throw error
        const n = count ?? 0
        let availability: string
        if (n < 8) availability = 'available'
        else if (n <= 12) availability = 'limited slots'
        else availability = 'fully booked'
        return JSON.stringify({ date, booked: n, availability })
      }

      case 'create_booking': {
        // Use the createBooking function so auto-assign kicks in
        const { createBooking } = await import('@/lib/admin/bookings')
        const bookingData: Record<string, unknown> = {
          customer_id: String(input.customer_id),
          service_type: String(input.service_type),
          scheduled_date: String(input.scheduled_date),
          scheduled_time: String(input.scheduled_time),
          notes: input.notes ? String(input.notes) : null,
          status: 'confirmed',
        }
        if (input.location_address) bookingData.location_address = String(input.location_address)
        const booking = await createBooking(bookingData as any)
        trackMetric(String(input.customer_id), 'booking_created', {
          service_type: String(input.service_type),
          scheduled_date: String(input.scheduled_date),
        }).catch(() => {})
        return JSON.stringify(booking)
      }

      case 'update_booking': {
        const updates: Record<string, string> = {}
        if (input.scheduled_date) updates.scheduled_date = String(input.scheduled_date)
        if (input.scheduled_time) updates.scheduled_time = String(input.scheduled_time)
        if (input.service_type) updates.service_type = String(input.service_type)
        const { data, error } = await supabase
          .from('bookings')
          .update(updates)
          .eq('id', String(input.booking_id))
          .select()
          .single()
        if (error) throw error
        return JSON.stringify(data)
      }

      case 'cancel_booking': {
        const { data, error } = await supabase
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', String(input.booking_id))
          .select()
          .single()
        if (error) throw error
        return JSON.stringify(data)
      }

      case 'create_customer': {
        const phoneClean = cleanPhone(String(input.phone))
        // Check if stub customer already exists (auto-created on first message)
        const { data: existing } = await supabase
          .from('customers')
          .select('id')
          .or(`phone.ilike.%${phoneClean}%`)
          .limit(1)
          .single()

        if (existing) {
          // Update the stub with real details
          const { data, error } = await supabase
            .from('customers')
            .update({
              name: String(input.name),
              car_model: input.car_model ? String(input.car_model) : null,
              plate_number: input.plate_number ? String(input.plate_number) : null,
              address: input.address ? String(input.address) : null,
              neighborhood: input.neighborhood ? String(input.neighborhood) : null,
            })
            .eq('id', existing.id)
            .select()
            .single()
          if (error) throw error
          return JSON.stringify(data)
        } else {
          // No stub exists — create new (use cleaned phone to avoid duplicates)
          const { data, error } = await supabase
            .from('customers')
            .insert({
              name: String(input.name),
              phone: phoneClean,
              car_model: input.car_model ? String(input.car_model) : null,
              plate_number: input.plate_number ? String(input.plate_number) : null,
              address: input.address ? String(input.address) : null,
              neighborhood: input.neighborhood ? String(input.neighborhood) : null,
              segment: 'new',
              acquisition_source: 'whatsapp',
            })
            .select()
            .single()
          if (error) throw error
          return JSON.stringify(data)
        }
      }

      case 'get_completed_jobs': {
        // Look up customer's bookings first, then find completed jobs for those bookings
        const { data: bookings } = await supabase
          .from('bookings')
          .select('id')
          .eq('customer_id', String(input.customer_id))
        const bookingIds = (bookings || []).map(b => b.id)
        if (bookingIds.length === 0) {
          return JSON.stringify([])
        }
        const { data: jobs, error } = await supabase
          .from('jobs')
          .select('id, service_type, completed_at, customer_rating, customer_feedback')
          .in('booking_id', bookingIds)
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: false })
          .limit(5)
        if (error) throw error
        return JSON.stringify(jobs || [])
      }

      case 'submit_job_rating': {
        const rawRating = Number(input.rating)
        if (!Number.isFinite(rawRating) || rawRating < 1 || rawRating > 5) {
          return JSON.stringify({ error: 'Rating harus angka 1 sampai 5.', invalid_rating: input.rating })
        }
        const rating = Math.round(rawRating)
        const { data, error } = await supabase
          .from('jobs')
          .update({
            customer_rating: rating,
            customer_feedback: input.feedback ? String(input.feedback) : null,
          })
          .eq('id', String(input.job_id))
          .select()
          .single()
        if (error) throw error
        return JSON.stringify({ success: true, rating, feedback: input.feedback || null })
      }

      case 'send_service_images': {
        const { sendImage } = await import('@/lib/agents/waha')
        // Get service images from knowledge base
        const { data: images } = await supabase
          .from('agent_knowledge')
          .select('file_name, content')
          .eq('agent_name', 'shera')
          .like('file_name', 'service_image_%')

        if (!images || images.length === 0) {
          return JSON.stringify({ sent: false, reason: 'No service images uploaded yet. Describe services in text instead.' })
        }

        const chatId = String(input.chat_id)
        const serviceTypeStr = input.service_type ? String(input.service_type) : 'all'
        const requestedTypes = serviceTypeStr === 'all' ? null : serviceTypeStr.split(',').map(s => s.trim())

        const SERVICE_LABELS: Record<string, string> = {
          standard_wash: 'Standard Wash',
          professional: 'Professional Wash',
          elite_wash: 'Elite Wash',
          interior_detail: 'Interior Detail',
          exterior_detail: 'Exterior Detail',
          window_detail: 'Window Detail',
          tire_rims: 'Tire & Rims',
          full_detail: 'Full Detail',
          sub_essentials: 'Langganan Essentials',
          sub_plus: 'Langganan Plus',
          sub_elite: 'Langganan Elite',
        }

        // Prevent duplicate sends in same conversation turn
        if (ctx?.serviceImagesSent) {
          return JSON.stringify({ sent: 0, already_sent: true, message: 'Images were already sent in this conversation turn. Do NOT call this tool again. Just ask the customer which package they prefer.' })
        }

        // Sort order: full_detail first for detailing, then rest alphabetically
        const SEND_ORDER: Record<string, number> = {
          standard_wash: 1, professional: 2, elite_wash: 3,
          full_detail: 1, interior_detail: 2, exterior_detail: 3, tire_rims: 4, window_detail: 5,
          sub_essentials: 1, sub_plus: 2, sub_elite: 3,
        }
        const sortedImages = [...images].sort((a, b) => {
          const ka = a.file_name.replace('service_image_', '')
          const kb = b.file_name.replace('service_image_', '')
          return (SEND_ORDER[ka] || 99) - (SEND_ORDER[kb] || 99)
        })

        let sent = 0
        let failed = 0
        for (const img of sortedImages) {
          const key = img.file_name.replace('service_image_', '')
          if (requestedTypes && !requestedTypes.includes(key)) continue
          const caption = SERVICE_LABELS[key] || key
          try {
            await sendImage(chatId, img.content, caption)
            sent++
            // Small delay between images
            if (sent < images.length) await new Promise(r => setTimeout(r, 1000))
          } catch (err) {
            failed++
            console.error(`[send_service_images] Failed to send ${key}:`, err)
          }
        }

        // Verify images were actually delivered (WAHA can return 2xx but not deliver)
        if (sent > 0) {
          try {
            await new Promise(r => setTimeout(r, 2000))
            const WAHA_API_URL = process.env.WAHA_API_URL!
            const WAHA_API_KEY = process.env.WAHA_API_KEY!
            // Check recent outgoing messages for image type
            const verifyRes = await fetch(`${WAHA_API_URL}/api/default/chats/${chatId}/messages?limit=10&downloadMedia=false`, {
              headers: { 'X-Api-Key': WAHA_API_KEY },
            })
            if (verifyRes.ok) {
              const recentMsgs = await verifyRes.json()
              const recentImages = Array.isArray(recentMsgs)
                ? recentMsgs.filter((m: any) => m.fromMe && m.hasMedia).length
                : 0
              if (recentImages === 0) {
                console.error(`[send_service_images] Verification failed: WAHA accepted ${sent} images but 0 delivered to ${chatId}`)
                sent = 0
              }
            }
          } catch (verifyErr) {
            console.error('[send_service_images] Verification check failed:', verifyErr)
            // Can't verify — trust the original send result
          }
        }

        if (sent > 0 && ctx) ctx.serviceImagesSent = true
        if (sent === 0) {
          alertImageDeliveryFailure(chatId, failed).catch(() => {})
          trackMetric(chatId, 'image_delivery_failure', { images_sent: 0, images_failed: failed }).catch(() => {})
          return JSON.stringify({ sent: 0, failed, message: 'GAGAL kirim gambar. Kamu WAJIB kirim daftar harga pakai TEXT sebagai pengganti. Pakai format backup harga yang ada di system prompt.' })
        }
        trackMetric(chatId, 'image_delivery_success', { images_sent: sent, images_failed: failed }).catch(() => {})
        return JSON.stringify({ sent, failed, message: 'Images sent successfully. Do NOT call send_service_images again. Ask the customer which package they want.' })
      }

      case 'escalate_to_human': {
        const { data, error } = await supabase
          .from('human_escalations')
          .insert({
            chat_id: 'pending',
            phone: 'pending',
            reason: String(input.reason),
            category: String(input.category || 'other'),
            customer_message: input.customer_message ? String(input.customer_message) : null,
            status: 'pending',
          })
          .select()
          .single()
        if (error) throw error
        return JSON.stringify({ escalated: true, id: data.id })
      }

      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` })
    }
  } catch (err: any) {
    console.error(`executeSheraTool error [${toolName}]:`, err)
    return JSON.stringify({ error: err.message ?? 'Tool execution failed' })
  }
}

// ---------------------------------------------------------------------------
// D. Customer Context Helpers (exported for testing)
// ---------------------------------------------------------------------------

export interface CustomerRecord {
  id: string
  name: string
  phone?: string
  car_model?: string | null
  plate_number?: string | null
  address?: string | null
  neighborhood?: string | null
}

/** Classify a customer as new, stub, or returning */
export function classifyCustomer(customer: CustomerRecord | null): 'new' | 'stub' | 'returning' {
  if (!customer) return 'new'
  if (customer.name === 'WhatsApp User' || customer.name === 'Unknown') return 'stub'
  return 'returning'
}

/** Build the customer context block for the system prompt */
export function buildCustomerContext(
  customer: CustomerRecord | null,
  phone: string,
  lastBooking?: { service_type: string; scheduled_date: string } | null
): string {
  const type = classifyCustomer(customer)
  let ctx = ''

  if (type === 'returning') {
    ctx += `\nCustomer is REGISTERED: ${customer!.name} (ID: ${customer!.id})`
    if (customer!.car_model) ctx += `\nCar: ${customer!.car_model}`
    if (customer!.plate_number) ctx += `\nPlate: ${customer!.plate_number}`
    if (customer!.address) ctx += `\nAddress: ${customer!.address}`
    if (customer!.neighborhood) ctx += `\nArea: ${customer!.neighborhood}`
    ctx += `\nThis is a RETURNING customer. JANGAN tanya info yang sudah ada di atas.`
    if (lastBooking) {
      const SERVICE_NAMES: Record<string, string> = {
        standard_wash: 'Standard Wash', professional: 'Professional Wash', elite_wash: 'Elite Wash',
        interior_detail: 'Interior Detail', exterior_detail: 'Exterior Detail', window_detail: 'Window Detail',
        tire_rims: 'Tire & Rims', full_detail: 'Full Detail',
      }
      const lastServiceName = SERVICE_NAMES[lastBooking.service_type] || lastBooking.service_type
      ctx += `\nLast booking: ${lastServiceName} on ${lastBooking.scheduled_date}`
      ctx += `\nKalau customer mau booking lagi dan pilih KATEGORI YANG SAMA (cuci/detailing), tawarkan: "Mau yang sama kayak terakhir, ${lastServiceName}, atau mau coba yang lain kak?" JANGAN langsung kirim gambar — tanya dulu.`
      ctx += `\nKalau customer bilang "sama aja" atau "yang kemarin" → langsung lanjut ke jadwal, ga perlu kirim gambar atau tanya paket lagi.`
      ctx += `\nKalau customer mau KATEGORI BEDA dari terakhir (misal terakhir cuci, sekarang mau detailing) → baru kirim gambar kategori baru.`
    }
    ctx += `\nUntuk cek booking, reschedule, atau cancel: pakai customer_id "${customer!.id}" saat panggil tool get_customer_bookings, update_booking, atau cancel_booking.`
    ctx += `\nKalau customer mau reschedule: panggil get_customer_bookings dulu dengan customer_id di atas untuk cari booking_id, lalu panggil update_booking.`
    ctx += `\nKalau customer mau booking baru dan TIDAK ada last booking di atas: tanya mau cuci atau detailing.`
  } else if (type === 'stub') {
    ctx += `\nCustomer record exists but is INCOMPLETE (ID: ${customer!.id}). Name is still placeholder "${customer!.name}".`
    ctx += `\nThis is a NEW customer. Ikuti FLOW BOOKING dari awal: nama dulu, lalu layanan, paket, mobil, plat, alamat, jadwal.`
    ctx += `\nSETIAP KALI kamu dapat info baru (nama, mobil, plat, alamat), WAJIB panggil create_customer untuk UPDATE record customer ini. Pakai phone ${phone}. Ini SANGAT PENTING agar data customer tersimpan dengan benar.`
    ctx += `\nDo NOT ask for phone — you already have it.`
  } else {
    ctx += `\nCustomer is NEW (not yet in the database). Ikuti FLOW BOOKING dari awal: nama dulu, lalu layanan, paket, mobil, plat, alamat, jadwal. Do NOT ask for phone — you already have it. Use the phone ${phone} when creating the customer.`
    ctx += `\nSETIAP KALI kamu dapat info baru (nama, mobil, plat, alamat), WAJIB panggil create_customer untuk simpan data customer. Ini SANGAT PENTING.`
  }

  return ctx
}

// ---------------------------------------------------------------------------
// E. Process Message
// ---------------------------------------------------------------------------

/** Clean a phone number: remove +, spaces, dashes */
function cleanPhone(phone: string): string {
  return phone.replace(/[\s+\-()]/g, '')
}

export async function getSheraSettings(): Promise<{ apiKey: string | null; model: string; maxTokens: number; systemPrompt: string | null }> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('agent_settings')
    .select('api_key, model, max_tokens, system_prompt')
    .eq('agent_name', 'shera')
    .single()

  let apiKey: string | null = null
  if (data?.api_key) {
    try { apiKey = Buffer.from(data.api_key, 'base64').toString('utf-8') } catch {}
  }

  return {
    apiKey,
    model: data?.model || GPT_MODEL,
    maxTokens: data?.max_tokens || 1024,
    systemPrompt: data?.system_prompt || null,
  }
}

async function getOpenAIClient() {
  // 1. Check agent_settings table first (dedicated Shera key)
  const settings = await getSheraSettings()
  if (settings.apiKey) {
    return createOpenAIClient(settings.apiKey)
  }

  // 2. Fall back to connectors base model (shared key)
  const admin = getSupabaseAdmin()
  const { data } = await admin
    .from('connectors')
    .select('encrypted_key')
    .eq('is_base_model', true)
    .single()

  let apiKey: string | undefined
  if (data?.encrypted_key) {
    try { apiKey = Buffer.from(data.encrypted_key, 'base64').toString('utf-8') } catch {}
  }

  // 3. Fall back to env var (AZURE_OPENAI_KEY is used by createOpenAIClient default)
  return createOpenAIClient(apiKey)
}

export async function processMessage(
  chatId: string,
  phone: string,
  messageText: string,
  signal?: AbortSignal
): Promise<string> {
  // Request-scoped context (safe for concurrent requests, unlike globalThis)
  const reqCtx: SheraRequestContext = { serviceImagesSent: false }
  const supabase = getSupabaseAdmin()
  const cleanedPhone = cleanPhone(phone)

  // 1. Get or create conversation
  let { data: conversation } = await supabase
    .from('whatsapp_conversations')
    .select('*')
    .eq('chat_id', chatId)
    .single()

  if (!conversation) {
    const { data: newConv, error } = await supabase
      .from('whatsapp_conversations')
      .insert({ chat_id: chatId, phone: cleanedPhone, messages: [] })
      .select()
      .single()
    if (error) {
      console.error('Failed to create conversation:', error)
      throw error
    }
    conversation = newConv
  }

  // 2. Try to find existing customer by phone, or auto-create stub
  let { data: customer } = await supabase
    .from('customers')
    .select('id, name, phone, car_model, plate_number, address, neighborhood')
    .or(`phone.ilike.%${cleanedPhone}%,phone.ilike.%${phone}%`)
    .limit(1)
    .single()

  // Auto-create customer stub if first time texting
  if (!customer) {
    const { data: newCustomer } = await supabase
      .from('customers')
      .insert({
        phone: cleanedPhone,
        name: 'WhatsApp User',
        segment: 'new',
        acquisition_source: 'whatsapp',
      })
      .select('id, name, phone')
      .single()
    if (newCustomer) {
      customer = newCustomer
      // Link conversation to this customer
      await supabase
        .from('whatsapp_conversations')
        .update({ customer_id: newCustomer.id })
        .eq('chat_id', chatId)
    }
  }

  // 2b. For returning customers, fetch their last booking for context
  let lastBooking: { service_type: string; scheduled_date: string } | null = null
  if (customer && classifyCustomer(customer) === 'returning') {
    const { data: recentBooking } = await supabase
      .from('bookings')
      .select('service_type, scheduled_date')
      .eq('customer_id', customer.id)
      .order('scheduled_date', { ascending: false })
      .limit(1)
      .single()
    if (recentBooking) lastBooking = recentBooking
  }

  // 3. Load last 20 messages from conversation for context
  const existingMessages: Array<{ role: string; content: string }> =
    Array.isArray(conversation.messages) ? conversation.messages.slice(-20) : []

  // 4. Build OpenAI messages array from conversation history
  const chatMessages: ChatCompletionMessageParam[] = existingMessages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  // 5. Add new user message
  chatMessages.push({ role: 'user', content: messageText })

  // Use DB prompt if configured, otherwise default
  const settings = await getSheraSettings()
  const modelToUse = settings.model
  const maxTokensToUse = settings.maxTokens
  let systemPrompt = settings.systemPrompt || SHERA_SYSTEM_PROMPT

  // Load knowledge base documents
  const { data: knowledgeDocs } = await supabase
    .from('agent_knowledge')
    .select('file_name, content')
    .eq('agent_name', 'shera')

  if (knowledgeDocs && knowledgeDocs.length > 0) {
    systemPrompt += '\n\n--- Reference Documents ---'
    for (const doc of knowledgeDocs) {
      systemPrompt += `\n\n[${doc.file_name}]\n${doc.content}`
    }
  }

  // Load custom rules
  const { data: activeRules } = await supabase
    .from('agent_rules')
    .select('title, content')
    .eq('agent_name', 'shera')
    .eq('is_active', true)

  if (activeRules && activeRules.length > 0) {
    systemPrompt += '\n\n--- Custom Rules ---'
    for (const rule of activeRules) {
      systemPrompt += `\n\n[${rule.title}]\n${rule.content}`
    }
  }

  // Inject real-time context
  const now = new Date()
  const jakartaTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(now)
  const jakartaDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(now) // YYYY-MM-DD

  systemPrompt += `\n\n--- Real-Time Context ---`
  systemPrompt += `\nCurrent date and time (Jakarta/WIB): ${jakartaTime}`
  systemPrompt += `\nToday's date: ${jakartaDate}`
  systemPrompt += `\nUse this to resolve relative dates: "tomorrow", "next week", "this Saturday", "April 6" (assume current year ${now.getFullYear()}), etc.`
  systemPrompt += `\nNEVER ask the customer to clarify the year — always assume the current or next occurrence of a date.`

  // Inject WhatsApp context — phone is always known
  systemPrompt += `\n\n--- WhatsApp Context ---`
  systemPrompt += `\nCustomer's phone number: ${phone} (from WhatsApp — do NOT ask for it, you already have it)`
  systemPrompt += `\nChat ID for sending images: ${chatId}`

  systemPrompt += buildCustomerContext(customer, phone, lastBooking)

  // 5b. Load and inject conversation state
  const customerType = classifyCustomer(customer)
  let currentState: SheraState = (conversation.state as SheraState) || 'greeting'
  // Derive state for existing conversations that don't have one yet
  if (conversation.state === 'greeting' && existingMessages.length > 0) {
    currentState = deriveStateFromHistory(existingMessages, customerType === 'returning')
  }
  // Returning customers with a real profile start in general_chat
  if (currentState === 'greeting' && customerType === 'returning') {
    currentState = 'general_chat'
  }

  // Stuck-state recovery: if we've been in awaiting_name for 2+ turns,
  // the customer doesn't want to give their name — advance to awaiting_intent
  if (currentState === 'awaiting_name' && existingMessages.length >= 4) {
    currentState = 'awaiting_intent'
  }

  systemPrompt += statePromptBlock(currentState)

  // 6. Call OpenAI
  const openai = await getOpenAIClient()

  const allMessages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...chatMessages,
  ]

  // Timeout: Vercel has 60s max. Budget: 15s buffer + 5-10s delay already spent.
  // Leave max 25s for all LLM calls combined.
  const LLM_TIMEOUT = 25000

  let response = await openai.chat.completions.create({
    model: modelToUse,
    max_completion_tokens: maxTokensToUse,
    tools: SHERA_TOOLS,
    messages: allMessages,
  }, { timeout: LLM_TIMEOUT, signal: signal as any })

  // 7. Handle tool use loop (max 5 iterations) — with state gating
  let iterations = 0
  const toolsCalled: string[] = []
  while (response.choices[0]?.finish_reason === 'tool_calls' && iterations < 5) {
    iterations++

    const assistantMsg = response.choices[0].message
    allMessages.push(assistantMsg)

    const toolCalls = assistantMsg.tool_calls || []
    const toolResults = await Promise.all(
      toolCalls.map(async (tc: any) => {
        const input = JSON.parse(tc.function.arguments || '{}')
        const result = await executeSheraTool(tc.function.name, input, currentState, reqCtx)
        toolsCalled.push(tc.function.name)
        return {
          role: 'tool' as const,
          tool_call_id: tc.id,
          content: result,
        }
      })
    )

    allMessages.push(...toolResults)

    response = await openai.chat.completions.create({
      model: modelToUse,
      max_completion_tokens: maxTokensToUse,
      tools: SHERA_TOOLS,
      messages: allMessages,
    }, { timeout: LLM_TIMEOUT, signal: signal as any })
  }

  // 8. Extract text response and sanitize
  let reply = response.choices[0]?.message?.content ?? 'Maaf, saya tidak bisa memproses pesan Anda saat ini.'
  // GPT sometimes leaks raw tool call JSON in the text — strip it
  reply = reply.replace(/\{["\s]*(?:service_type|chat_id|customer_id|booking_id|query|job_id|reason)["\s]*:[\s\S]*?\}\n?/g, '').trim()
  if (!reply) reply = 'Ada yang bisa aku bantu?'

  // Update any pending escalations with correct chat_id and phone
  await supabase
    .from('human_escalations')
    .update({ chat_id: chatId, phone })
    .eq('chat_id', 'pending')
    .eq('status', 'pending')

  // 9. Save both user message and assistant reply to conversation messages
  //    If images were sent this turn, tag the assistant message so future turns know
  const saveTimestamp = new Date().toISOString()
  let replyToSave = reply
  if (reqCtx.serviceImagesSent) {
    replyToSave = `[IMAGES_SENT]\n${reply}`
  }
  const updatedMessages = [
    ...existingMessages,
    { role: 'user', content: messageText, timestamp: saveTimestamp },
    { role: 'assistant', content: replyToSave, timestamp: saveTimestamp },
  ].slice(-30) // Keep last 30 messages to prevent unbounded growth

  // 10. Advance state machine
  //     Use hint-based transition first, then validate against actual conversation history.
  //     History-derived state wins if it's further along — this handles customers who
  //     go off-track, skip steps, or provide info in unexpected order.
  const hasNameHint = messageText.includes('NAME_DETECTED:')
  const hasServiceHint = messageText.includes('SERVICE_DETECTED:')
  const hintState = getNextState(currentState, {
    toolsCalled,
    nameKnown: hasNameHint || (customerType === 'returning'),
    serviceChosen: hasServiceHint,
    imagesAlreadySent: reqCtx.serviceImagesSent,
    bookingCreated: toolsCalled.includes('create_booking'),
    isReturningCustomer: customerType === 'returning',
  })

  // Derive state from what actually happened in the conversation
  const derivedState = deriveStateFromHistory(updatedMessages, customerType === 'returning')

  // Use whichever state is further along — never go backwards
  const STATE_ORDER: Record<string, number> = {
    greeting: 0, awaiting_name: 1, awaiting_intent: 2, showing_packages: 3,
    collecting_info: 4, confirming_booking: 5, booking_complete: 6, general_chat: 3,
  }
  const nextState = (STATE_ORDER[derivedState] || 0) >= (STATE_ORDER[hintState] || 0)
    ? derivedState
    : hintState

  // 11. Update conversation + state
  await supabase
    .from('whatsapp_conversations')
    .update({
      messages: updatedMessages,
      last_message_at: new Date().toISOString(),
      state: nextState,
      ...(customer ? { customer_id: customer.id } : {}),
    })
    .eq('chat_id', chatId)

  // 12. Return the text reply
  return reply
}
