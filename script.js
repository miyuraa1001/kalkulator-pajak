
document.addEventListener("DOMContentLoaded", function() {

    // ------------------------------------------
    // BAGIAN 1: SELEKSI SEMUA ELEMEN HTML
    // ------------------------------------------
    // Ambil semua elemen input penghasilan
    const inputGaji = document.getElementById('gaji');
    const inputTunjanganPph = document.getElementById('tunjanganPph');
    const inputTunjanganLain = document.getElementById('tunjanganLain');
    const inputHonorarium = document.getElementById('honorarium');
    const inputPremiAsuransi = document.getElementById('premiAsuransi');
    const inputNatura = document.getElementById('natura');
    const inputBonus = document.getElementById('bonus');
    
    // Ambil elemen input status
    const selectStatusPtkp = document.getElementById('statusPtkp');
    
    // Ambil tombol
    const tombolHitung = document.getElementById('tombolHitung');
    
    // Ambil semua elemen output (hasil)
    const outputBruto = document.getElementById('penghasilanBruto');
    const outputKategori = document.getElementById('kategoriTer');
    const outputTarif = document.getElementById('tarifTer');
    const outputPph21 = document.getElementById('pph21');
    const checkTanpaNpwp = document.getElementById('tanpaNpwp');

    // Kumpulan semua input penghasilan untuk mempermudah
    const semuaInputPenghasilan = [
        inputGaji, inputTunjanganPph, inputTunjanganLain,
        inputHonorarium, inputPremiAsuransi, inputNatura, inputBonus
    ];

    // ------------------------------------------
    // BAGIAN 2: DATA & ATURAN PAJAK (TER)
    // ------------------------------------------

    // Peta untuk menentukan Kategori TER berdasarkan status PTKP
    // Sesuai PMK 168/2023
    const kategoriPtkpMap = {
        'TK/0': 'A',
        'TK/1': 'A',
        'TK/2': 'B',
        'TK/3': 'B',
        'K/0': 'A',
        'K/1': 'B',
        'K/2': 'B',
        'K/3': 'C'
    };

    /* !! ================================================================== !!
    !! PENTING: TABEL TARIF DI BAWAH INI HANYA CONTOH (DATA TIDAK LENGKAP) !!
    !! ================================================================== !!
    Kamu harus mengisi tabel 'tarifKategoriA', 'tarifKategoriB', dan 
    'tarifKategoriC' dengan data LENGKAP dari Lampiran PMK 168 Tahun 2023.
    Struktur datanya adalah:
    { batasAtas: (batas atas penghasilan bruto), tarif: (tarif pajaknya) }
    
    Contoh: { batasAtas: 5400000, tarif: 0.00 } berarti
    Penghasilan 0 s.d. 5.400.000 kena tarif 0%
    */

    
    const tarifKategoriA = [
        { batasAtas: 5400000, tarif: 0.00 },
        { batasAtas: 5650000, tarif: 0.0025 },
        { batasAtas: 5950000, tarif: 0.0050 },
        { batasAtas: 6300000, tarif: 0.0075 },
        { batasAtas: 6750000, tarif: 0.01 },
        { batasAtas: 7500000, tarif: 0.0125 },
        { batasAtas: 8550000, tarif: 0.015 },
        { batasAtas: 9650000, tarif: 0.0175 },
        { batasAtas: 10050000, tarif: 0.02 },
        { batasAtas: 10350000, tarif: 0.0225 },
        { batasAtas: 10700000, tarif: 0.025 },
        { batasAtas: 11050000, tarif: 0.03 },
        { batasAtas: 11600000, tarif: 0.035 },
        { batasAtas: 12500000, tarif: 0.04},
        { batasAtas: 13750000, tarif: 0.05 },
        { batasAtas: 15100000, tarif: 0.06 },
        { batasAtas: 16950000, tarif: 0.07 },
        { batasAtas: 19750000, tarif: 0.08 },
        { batasAtas: 24150000, tarif: 0.09 },
        { batasAtas: 26450000, tarif: 0.10 },
        { batasAtas: 28000000, tarif: 0.11 },
        { batasAtas: 30050000, tarif: 0.12 },
        { batasAtas: 32400000, tarif: 0.13 },
        { batasAtas: 35400000, tarif: 0.14 },
        { batasAtas: 39100000, tarif: 0.15 },
        { batasAtas: 43850000, tarif: 0.16 },
        { batasAtas: 47800000, tarif: 0.17 },
        { batasAtas: 51400000, tarif: 0.18 },
        { batasAtas: 56300000, tarif: 0.19 },
        { batasAtas: 62200000, tarif: 0.20 },
        { batasAtas: 68600000, tarif: 0.21 },
        { batasAtas: 77500000, tarif: 0.22 },
        { batasAtas: 89000000, tarif: 0.23 },
        { batasAtas: 103000000, tarif: 0.24 },
        { batasAtas: 125000000, tarif: 0.25 },
        { batasAtas: 157000000, tarif: 0.26 },
        { batasAtas: 206000000, tarif: 0.27 },
        { batasAtas: 337000000, tarif: 0.28 },
        { batasAtas: 454000000, tarif: 0.29 },
        { batasAtas: 550000000, tarif: 0.30 },
        { batasAtas: 695000000, tarif: 0.31 },
        { batasAtas: 910000000, tarif: 0.32 },
        { batasAtas: 1400000000, tarif: 0.33 },
        { batasAtas: Infinity, tarif: 0.34 } // 'Infinity' untuk lapisan tertinggi
    ];

    const tarifKategoriB = [
        { batasAtas: 6200000, tarif: 0.00 },
        { batasAtas: 6500000, tarif: 0.0025 },
        { batasAtas: 6850000, tarif: 0.0050 },
        { batasAtas: 7300000, tarif: 0.0075 },
        { batasAtas: 9200000, tarif: 0.01 },
        { batasAtas: 10750000, tarif: 0.015 },
        { batasAtas: 11250000, tarif: 0.02 },
        { batasAtas: 11600000, tarif: 0.025 },
        { batasAtas: 12600000, tarif: 0.03 },
        { batasAtas: 13600000, tarif: 0.04 },
        { batasAtas: 14950000, tarif: 0.05 },
        { batasAtas: 16400000, tarif: 0.06 },
        { batasAtas: 18450000, tarif: 0.07 },
        { batasAtas: 21850000, tarif: 0.08 },
        { batasAtas: 26000000, tarif: 0.09 },
        { batasAtas: 27700000, tarif: 0.10 },
        { batasAtas: 29350000, tarif: 0.11 },
        { batasAtas: 31450000, tarif: 0.12 },
        { batasAtas: 33950000, tarif: 0.13 },
        { batasAtas: 37100000, tarif: 0.14 },
        { batasAtas: 41100000, tarif: 0.15 },
        { batasAtas: 45800000, tarif: 0.16 },
        { batasAtas: 49500000, tarif: 0.17 },
        { batasAtas: 53800000, tarif: 0.18 },
        { batasAtas: 58500000, tarif: 0.19 },
        { batasAtas: 64000000, tarif: 0.20 },
        { batasAtas: 71000000, tarif: 0.21 },
        { batasAtas: 80000000, tarif: 0.22 },
        { batasAtas: 93000000, tarif: 0.23 },
        { batasAtas: 109000000, tarif: 0.24 },
        { batasAtas: 129000000, tarif: 0.25 },
        { batasAtas: 163000000, tarif: 0.26 },
        { batasAtas: 211000000, tarif: 0.27 },
        { batasAtas: 374000000, tarif: 0.28 },
        { batasAtas: 459000000, tarif: 0.29 },
        { batasAtas: 555000000, tarif: 0.30 },
        { batasAtas: 704000000, tarif: 0.31 },
        { batasAtas: 957000000, tarif: 0.32 },
        { batasAtas: 1405000000, tarif: 0.33 },
        { batasAtas: Infinity, tarif: 0.34 }
    ];

    // HARAP LENGKAPI TABEL INI DARI PMK 168/2023
    const tarifKategoriC = [
        { batasAtas: 6600000, tarif: 0.00 },
        { batasAtas: 6950000, tarif: 0.0025 },
        { batasAtas: 7350000, tarif: 0.0050 },
        { batasAtas: 7800000, tarif: 0.0075 },
        { batasAtas: 8850000, tarif: 0.01 },
        { batasAtas: 9800000, tarif: 0.0125 },
        { batasAtas: 10950000, tarif: 0.015 },
        { batasAtas: 11200000, tarif: 0.0175 },
        { batasAtas: 12050000, tarif: 0.02 },
        { batasAtas: 12950000, tarif: 0.03 },
        { batasAtas: 14150000, tarif: 0.04 },
        { batasAtas: 15550000, tarif: 0.05 },
        { batasAtas: 17050000, tarif: 0.06 },
        { batasAtas: 19500000, tarif: 0.07 },
        { batasAtas: 22700000, tarif: 0.08 },
        { batasAtas: 26600000, tarif: 0.09 },
        { batasAtas: 28100000, tarif: 0.10 },
        { batasAtas: 30100000, tarif: 0.11 },
        { batasAtas: 32600000, tarif: 0.12 },
        { batasAtas: 35400000, tarif: 0.13 },
        { batasAtas: 38900000, tarif: 0.14 },
        { batasAtas: 43000000, tarif: 0.15 },
        { batasAtas: 47400000, tarif: 0.16 },
        { batasAtas: 51200000, tarif: 0.17 },
        { batasAtas: 55800000, tarif: 0.18 },
        { batasAtas: 60400000, tarif: 0.19 },
        { batasAtas: 66700000, tarif: 0.20 },
        { batasAtas: 74500000, tarif: 0.21 },
        { batasAtas: 83200000, tarif: 0.22 },
        { batasAtas: 95600000, tarif: 0.23 },
        { batasAtas: 110000000, tarif: 0.24 },
        { batasAtas: 134000000, tarif: 0.25 },
        { batasAtas: 165000000, tarif: 0.26 },
        { batasAtas: 221000000, tarif: 0.27 },
        { batasAtas: 390000000, tarif: 0.28 },
        { batasAtas: 463000000, tarif: 0.29 },
        { batasAtas: 561000000, tarif: 0.30 },
        { batasAtas: 709000000, tarif: 0.31 },
        { batasAtas: 965000000, tarif: 0.32 },
        { batasAtas: 1419000000, tarif: 0.33 },
        { batasAtas: Infinity, tarif: 0.34 }
    ];

    // ------------------------------------------
    // BAGIAN 3: FUNGSI UTAMA KALKULATOR (VERSI BARU DENGAN NPWP)
    // ------------------------------------------

    function hitungPajak() {
        // 1. Hitung Total Penghasilan Bruto
        let penghasilanBruto = 0;
        semuaInputPenghasilan.forEach(input => {
            penghasilanBruto += Number(input.value) || 0;
        });
        outputBruto.value = formatRupiah(penghasilanBruto);

        // 2. Tentukan Kategori TER
        const statusPtkp = selectStatusPtkp.value;
        const kategori = kategoriPtkpMap[statusPtkp];
        outputKategori.value = kategori; 

        // 3. Tentukan Tarif Efektif
        const tarif = cariTarifTer(kategori, penghasilanBruto);
        outputTarif.value = (tarif * 100).toFixed(2) + '%';

        // 4. Hitung PPh 21 Terutang (Gunakan 'let' agar bisa diubah)
        let pph21 = Math.floor(penghasilanBruto * tarif);
        
        // 5. [BARU] Terapkan Sanksi 20% jika tidak punya NPWP
        // PPh 21 terutang menjadi 120% (1.2x) dari PPh 21 normal.
        if (checkTanpaNpwp.checked) {
            pph21 = Math.floor(pph21 * 1.2);
        }

        // 6. Tampilkan Hasil Akhir PPh 21
        outputPph21.value = formatRupiah(pph21);
    }

    // ------------------------------------------
    // BAGIAN 4: FUNGSI-FUNGSI PEMBANTU
    // ------------------------------------------

    // Fungsi untuk mencari tarif di tabel berdasarkan kategori dan bruto
    function cariTarifTer(kategori, bruto) {
        let tabelTarif;

        if (kategori === 'A') {
            tabelTarif = tarifKategoriA;
        } else if (kategori === 'B') {
            tabelTarif = tarifKategoriB;
        } else { // Kategori C
            tabelTarif = tarifKategoriC;
        }

        // Loop melalui tabel tarif yang sesuai
        for (const lapisan of tabelTarif) {
            if (bruto <= lapisan.batasAtas) {
                return lapisan.tarif;
            }
        }
        return 0; // Jika terjadi error (seharusnya tidak terjadi jika tabel benar)
    }

    // Fungsi untuk mengubah angka (mis: 1500000) menjadi format Rupiah (mis: "Rp 1.500.000")
    function formatRupiah(angka) {
        return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    
    // Fungsi untuk menghitung subtotal bruto secara otomatis saat diketik
    function updateBrutoSubtotal() {
        let penghasilanBruto = 0;
        semuaInputPenghasilan.forEach(input => {
            penghasilanBruto += Number(input.value) || 0;
        });
        outputBruto.value = formatRupiah(penghasilanBruto);
    }


    // ------------------------------------------
    // BAGIAN 5: HUBUNGKAN FUNGSI KE TOMBOL
    // ------------------------------------------

    // Saat tombol "Hitung" diklik, jalankan fungsi hitungPajak
    tombolHitung.addEventListener('click', hitungPajak);
    
    // [Fitur Tambahan]
    // Saat pengguna mengetik di salah satu kotak penghasilan,
    // update subtotal Penghasilan Bruto secara otomatis.
    semuaInputPenghasilan.forEach(input => {
        input.addEventListener('input', updateBrutoSubtotal);
    });

});