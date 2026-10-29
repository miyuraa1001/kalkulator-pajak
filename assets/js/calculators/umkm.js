/**
 * ACCUTAX - Modul Perhitungan PPh Final UMKM
 * Mengacu pada PP 55 Tahun 2022 dan UU HPP No. 7 Tahun 2021
 */

window.UMKMCalculator = (function () {
  const TARIF_UMKM = 0.005; // 0.5%
  const THRESHOLD_BEBAS_OP = 500000000; // Rp 500 Juta untuk Orang Pribadi

  const BATAS_WAKTU_TAHUN = {
    'op': 7, // 7 Tahun Pajak untuk Orang Pribadi
    'cv': 4, // 4 Tahun Pajak untuk CV, Firma, Koperasi
    'pt': 3  // 3 Tahun Pajak untuk Perseroan Terbatas (PT)
  };

  /**
   * Hitung Simulasi Bulanan (Januari - Desember)
   * @param {string} bentukWP - 'op' | 'cv' | 'pt'
   * @param {Array<number>} omzetBulanan - Array 12 angka omzet Januari s.d. Desember
   */
  function calculateTahunanSimulasi(bentukWP = 'op', omzetBulanan = []) {
    const namaBulan = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    let omzetKumulatif = 0;
    let totalPajakSetahun = 0;
    let totalOmzetSetahun = 0;
    let totalOmzetBebas = 0;
    let totalOmzetKenaPajak = 0;
    const rincianBulan = [];

    for (let i = 0; i < 12; i++) {
      const omzetBulanIni = omzetBulanan[i] || 0;
      totalOmzetSetahun += omzetBulanIni;
      const omzetSebelum = omzetKumulatif;
      omzetKumulatif += omzetBulanIni;

      let omzetKenaPajakBulanIni = 0;
      let pajakBulanIni = 0;
      let statusKeterangan = '';

      if (bentukWP === 'op') {
        // Ada fasilitas Rp 500jt bebas pajak untuk Orang Pribadi
        if (omzetKumulatif <= THRESHOLD_BEBAS_OP) {
          // Masih di bawah atau sama dengan 500jt -> Bebas Pajak
          omzetKenaPajakBulanIni = 0;
          pajakBulanIni = 0;
          statusKeterangan = 'Bebas Pajak (Fasilitas s.d. 500 Juta)';
          totalOmzetBebas += omzetBulanIni;
        } else if (omzetSebelum < THRESHOLD_BEBAS_OP && omzetKumulatif > THRESHOLD_BEBAS_OP) {
          // Bulan transisi: Sebagian bebas, sebagian kena pajak 0.5%
          const bagianBebas = THRESHOLD_BEBAS_OP - omzetSebelum;
          omzetKenaPajakBulanIni = omzetBulanIni - bagianBebas;
          pajakBulanIni = Math.round(omzetKenaPajakBulanIni * TARIF_UMKM);
          statusKeterangan = `Menembus 500jt (Kena pajak atas Rp ${omzetKenaPajakBulanIni.toLocaleString('id-ID')})`;
          totalOmzetBebas += bagianBebas;
          totalOmzetKenaPajak += omzetKenaPajakBulanIni;
        } else {
          // Sudah sepenuhnya di atas 500jt
          omzetKenaPajakBulanIni = omzetBulanIni;
          pajakBulanIni = Math.round(omzetKenaPajakBulanIni * TARIF_UMKM);
          statusKeterangan = 'Kena PPh Final 0,5%';
          totalOmzetKenaPajak += omzetKenaPajakBulanIni;
        }
      } else {
        // Badan Usaha (PT / CV / Koperasi): Tidak mendapat fasilitas 500jt
        omzetKenaPajakBulanIni = omzetBulanIni;
        pajakBulanIni = Math.round(omzetKenaPajakBulanIni * TARIF_UMKM);
        statusKeterangan = 'Kena PPh Final 0,5% (Badan Usaha)';
        totalOmzetKenaPajak += omzetKenaPajakBulanIni;
      }

      totalPajakSetahun += pajakBulanIni;

      rincianBulan.push({
        bulan: namaBulan[i],
        bulanIndex: i + 1,
        omzet: omzetBulanIni,
        omzetKumulatif,
        omzetKenaPajak: omzetKenaPajakBulanIni,
        pajak: pajakBulanIni,
        keterangan: statusKeterangan
      });
    }

    const batasWaktu = BATAS_WAKTU_TAHUN[bentukWP] || 7;

    return {
      bentukWP,
      bentukWPLabel: bentukWP === 'op' ? 'Wajib Pajak Orang Pribadi (OP)' : bentukWP === 'cv' ? 'Badan Usaha CV / Firma / Koperasi' : 'Badan Usaha PT',
      batasWaktuPemanfaatan: `${batasWaktu} Tahun Pajak`,
      fasilitas500Juta: bentukWP === 'op',
      totalOmzetSetahun,
      totalOmzetBebas,
      totalOmzetKenaPajak,
      totalPajakSetahun,
      rincianBulan
    };
  }

  /**
   * Hitung PPh Final UMKM Singkat (Satu Periode / Rata-rata)
   */
  function calculateQuick(bentukWP = 'op', omzetBruto = 0, omzetKumulatifSebelumnya = 0) {
    let omzetKenaPajak = 0;
    let omzetBebas = 0;
    let pphFinal = 0;
    const steps = [];

    const totalAkumulasi = omzetKumulatifSebelumnya + omzetBruto;

    if (bentukWP === 'op') {
      if (totalAkumulasi <= THRESHOLD_BEBAS_OP) {
        omzetBebas = omzetBruto;
        omzetKenaPajak = 0;
        pphFinal = 0;
        steps.push({ label: 'Omzet Bruto Periode Ini', value: omzetBruto });
        steps.push({ label: 'Omzet Kumulatif Berjalan', value: totalAkumulasi });
        steps.push({ label: 'Status Fasilitas UU HPP / PP 55/2022', value: 'Bebas Pajak (Belum melebih Rp 500 Juta)' });
        steps.push({ label: 'PPh Final Terutang (0,5%)', value: 0 });
      } else if (omzetKumulatifSebelumnya < THRESHOLD_BEBAS_OP && totalAkumulasi > THRESHOLD_BEBAS_OP) {
        const sisaBebas = THRESHOLD_BEBAS_OP - omzetKumulatifSebelumnya;
        omzetBebas = sisaBebas;
        omzetKenaPajak = omzetBruto - sisaBebas;
        pphFinal = Math.round(omzetKenaPajak * TARIF_UMKM);

        steps.push({ label: 'Omzet Bruto Periode Ini', value: omzetBruto });
        steps.push({ label: 'Sisa Kuota Bebas Pajak (s.d. 500 Juta)', value: sisaBebas });
        steps.push({ label: 'Omzet Kena Pajak (Selisih di atas 500 Juta)', value: omzetKenaPajak });
        steps.push({ label: 'PPh Final Terutang (0,5% × Omzet Kena Pajak)', value: pphFinal });
      } else {
        omzetKenaPajak = omzetBruto;
        omzetBebas = 0;
        pphFinal = Math.round(omzetKenaPajak * TARIF_UMKM);

        steps.push({ label: 'Omzet Bruto Periode Ini', value: omzetBruto });
        steps.push({ label: 'Status Kuota 500 Juta', value: 'Telah habis terlampaui di periode sebelumnya' });
        steps.push({ label: 'Omzet Kena Pajak Penuh', value: omzetKenaPajak });
        steps.push({ label: 'PPh Final Terutang (0,5%)', value: pphFinal });
      }
    } else {
      omzetKenaPajak = omzetBruto;
      omzetBebas = 0;
      pphFinal = Math.round(omzetKenaPajak * TARIF_UMKM);

      steps.push({ label: 'Omzet Bruto Periode Ini', value: omzetBruto });
      steps.push({ label: 'Kategori Wajib Pajak Badan', value: 'Tidak ada batas 500 Juta; dikenakan sejak Rp 1' });
      steps.push({ label: 'Omzet Kena Pajak', value: omzetKenaPajak });
      steps.push({ label: 'PPh Final Terutang (0,5%)', value: pphFinal });
    }

    return {
      bentukWP,
      omzetBruto,
      omzetKumulatifSebelumnya,
      totalAkumulasi,
      omzetBebas,
      omzetKenaPajak,
      pphFinal,
      steps
    };
  }

  return {
    TARIF_UMKM,
    THRESHOLD_BEBAS_OP,
    BATAS_WAKTU_TAHUN,
    calculateTahunanSimulasi,
    calculateQuick
  };
})();
