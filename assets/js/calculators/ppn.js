/**
 * ACCUTAX - Modul Perhitungan PPN (Pajak Pertambahan Nilai)
 * Mengacu pada UU HPP No. 7/2021, PMK 71/2022, dan aturan PPN terbaru di Indonesia
 */

window.PPNCalculator = (function () {
  const TARIF_PPN_STANDAR = 0.11; // 11%

  // Kategori Besaran Tertentu / DPP Nilai Lain (PMK 71/2022 dsb)
  const BESARAN_TERTENTU = {
    'standar': { label: 'Standar Umum (11%)', rate: 0.11, dppFactor: 1.0 },
    'kirim-paket': { label: 'Jasa Pengiriman Paket (1,1% / DPP 10%)', rate: 0.011, dppFactor: 0.10 },
    'biro-wisata': { label: 'Jasa Biro Perjalanan Wisata (1,1% / DPP 10%)', rate: 0.011, dppFactor: 0.10 },
    'kendaraan-bekas': { label: 'Penyerahan Kendaraan Bermotor Bekas (1,1% / DPP 10%)', rate: 0.011, dppFactor: 0.10 },
    'freight-forwarding': { label: 'Jasa Pengurusan Transportasi / Freight (1,1% / DPP 10%)', rate: 0.011, dppFactor: 0.10 }
  };

  /**
   * Hitung PPN Tunggal (Exclude / Include / Nilai Lain / WAPU)
   */
  function calculateSingle(params) {
    const {
      tipeHitung = 'exclude', // 'exclude' | 'include'
      kategori = 'standar',
      nominal = 0,
      jenisWapu = 'non-wapu' // 'non-wapu' | 'pemerintah' | 'bumn'
    } = params;

    const config = BESARAN_TERTENTU[kategori] || BESARAN_TERTENTU['standar'];
    let dpp = 0;
    let ppn = 0;
    let totalBayar = 0;
    let dipungutWapu = false;
    let keteranganWapu = '';
    const steps = [];

    if (tipeHitung === 'exclude') {
      // Nilai adalah Harga Barang / DPP Awal
      if (kategori === 'standar') {
        dpp = nominal;
        ppn = Math.round(dpp * TARIF_PPN_STANDAR);
        totalBayar = dpp + ppn;

        steps.push({ label: 'Dasar Pengenaan Pajak (DPP)', value: dpp });
        steps.push({ label: 'Tarif PPN (UU HPP)', value: '11%' });
        steps.push({ label: 'PPN Terutang (11% × DPP)', value: ppn });
        steps.push({ label: 'Total Nilai Faktur (DPP + PPN)', value: totalBayar });
      } else {
        // Besaran Tertentu
        dpp = Math.round(nominal * config.dppFactor);
        ppn = Math.round(nominal * config.rate);
        totalBayar = nominal + ppn;

        steps.push({ label: 'Nilai Transaksi', value: nominal });
        steps.push({ label: `Kategori: ${config.label}`, value: `Tarif Efektif ${(config.rate * 100).toFixed(1)}%` });
        steps.push({ label: 'Dasar Pengenaan Pajak (DPP Efektif)', value: dpp });
        steps.push({ label: 'PPN Terutang', value: ppn });
        steps.push({ label: 'Total Tagihan', value: totalBayar });
      }
    } else {
      // Include PPN (Nilai sudah termasuk PPN)
      if (kategori === 'standar') {
        dpp = Math.round(nominal / (1 + TARIF_PPN_STANDAR));
        ppn = nominal - dpp;
        totalBayar = nominal;

        steps.push({ label: 'Total Pembayaran (Termasuk PPN)', value: totalBayar });
        steps.push({ label: 'Dasar Pengenaan Pajak (DPP = Total / 1,11)', value: dpp });
        steps.push({ label: 'PPN Terutang (Total - DPP)', value: ppn });
      } else {
        dpp = Math.round(nominal / (1 + config.rate));
        ppn = nominal - dpp;
        totalBayar = nominal;

        steps.push({ label: 'Total Pembayaran (Termasuk PPN)', value: totalBayar });
        steps.push({ label: `Kategori: ${config.label}`, value: `Tarif ${(config.rate * 100).toFixed(1)}%` });
        steps.push({ label: 'Dasar Pengenaan Pajak (DPP)', value: dpp });
        steps.push({ label: 'PPN Terutang', value: ppn });
      }
    }

    // Evaluasi WAPU (Wajib Pungut)
    if (jenisWapu === 'pemerintah') {
      // Batas pemungutan instansi pemerintah: Di atas Rp 2.000.000 (tidak termasuk PPN)
      if (dpp > 2000000) {
        dipungutWapu = true;
        keteranganWapu = 'PPN dipungut dan disetor langsung oleh Bendahara Instansi Pemerintah (PMK 59/2022). Penjual hanya menerima pembayaran senilai DPP.';
      } else {
        dipungutWapu = false;
        keteranganWapu = 'Nilai belanja s.d. Rp 2.000.000 tidak dipungut Bendahara Pemerintah; PPN disetor sendiri oleh PKP Rekanan.';
      }
    } else if (jenisWapu === 'bumn') {
      // Batas pemungutan BUMN: Di atas Rp 10.000.000
      if (dpp > 10000000) {
        dipungutWapu = true;
        keteranganWapu = 'PPN dipungut dan disetor oleh BUMN Pemungut (PMK 8/2021). Rekanan menerima pembayaran DPP.';
      } else {
        dipungutWapu = false;
        keteranganWapu = 'Nilai transaksi s.d. Rp 10.000.000 tidak dipungut BUMN; PPN dibayarkan ke PKP Rekanan.';
      }
    }

    return {
      tipeHitung,
      kategori,
      kategoriLabel: config.label,
      dpp,
      ppn,
      totalBayar,
      jenisWapu,
      dipungutWapu,
      keteranganWapu,
      kasDiterimaPenjual: dipungutWapu ? dpp : totalBayar,
      steps
    };
  }

  /**
   * Rekonsiliasi SPT Masa PPN (Pajak Keluaran vs Pajak Masukan)
   */
  function calculateRekonsiliasi(pajakKeluaran, pajakMasukan, kompensasiBulanLalu = 0) {
    const selisih = pajakKeluaran - pajakMasukan;
    const hasilAkhir = selisih - kompensasiBulanLalu;
    const isKurangBayar = hasilAkhir > 0;
    const isLebihBayar = hasilAkhir < 0;

    return {
      pajakKeluaran,
      pajakMasukan,
      kompensasiBulanLalu,
      selisih,
      hasilAkhir: Math.abs(hasilAkhir),
      status: isKurangBayar ? 'Kurang Bayar (KB)' : isLebihBayar ? 'Lebih Bayar (LB)' : 'Nihil',
      keterangan: isKurangBayar
        ? 'Wajib disetor ke kas negara sebelum batas akhir pelaporan SPT Masa PPN.'
        : isLebihBayar
        ? 'Dapat dikompensasikan ke masa pajak berikutnya atau dimohonkan restitusi.'
        : 'Pajak Keluaran sama dengan Pajak Masukan (Nihil).'
    };
  }

  return {
    TARIF_PPN_STANDAR,
    BESARAN_TERTENTU,
    calculateSingle,
    calculateRekonsiliasi
  };
})();
