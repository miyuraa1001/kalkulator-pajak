/**
 * ACCUTAX - Modul Perhitungan PPh Pasal 23
 * Mengacu pada UU PPh, UU HPP, dan PMK 141/PMK.03/2015
 */

window.PPh23Calculator = (function () {
  const OBJEK_PPH23 = {
    'jasa': {
      label: 'Jasa Teknik, Manajemen, Konsultan, IT & Jasa Lainnya (PMK 141)',
      baseRate: 0.02,
      deskripsi: 'Dipungut 2% atas penghasilan bruto tidak termasuk PPN.'
    },
    'sewa': {
      label: 'Sewa Harta Selain Tanah dan/atau Bangunan (Kendaraan, Mesin, dsb.)',
      baseRate: 0.02,
      deskripsi: 'Dipungut 2% atas imbalan sewa alat, kendaraan, mesin, dsb.'
    },
    'dividen': {
      label: 'Dividen (Diterima oleh Wajib Pajak Badan Dalam Negeri)',
      baseRate: 0.15,
      deskripsi: 'Dipungut 15% atas dividen yang tidak memenuhi syarat bebas pajak UU Cipta Kerja.'
    },
    'bunga': {
      label: 'Bunga Pinjaman Selain Perbankan',
      baseRate: 0.15,
      deskripsi: 'Dipungut 15% atas bunga pinjaman antar perusahaan atau pihak ketiga.'
    },
    'royalti': {
      label: 'Royalti atas Penggunaan Hak Cipta / Paten / Merek',
      baseRate: 0.15,
      deskripsi: 'Dipungut 15% atas hak kekayaan intelektual atau lisensi.'
    },
    'hadiah': {
      label: 'Hadiah, Penghargaan, dan Bonus (Selain Objek PPh 21)',
      baseRate: 0.15,
      deskripsi: 'Dipungut 15% atas hadiah perlombaan atau penghargaan yang diterima badan.'
    }
  };

  function calculate(params) {
    const {
      jenisObjek = 'jasa',
      nominalBruto = 0,
      statusNPWP = 'ada', // 'ada' | 'tidak-ada'
      metode = 'gross' // 'gross' | 'gross-up'
    } = params;

    const objek = OBJEK_PPH23[jenisObjek] || OBJEK_PPH23['jasa'];
    let tarifEfektif = objek.baseRate;
    let sanksiNPWP = false;

    // Ketentuan Non-NPWP: 100% lebih tinggi (Pasal 23 ayat 1a)
    if (statusNPWP === 'tidak-ada') {
      tarifEfektif = tarifEfektif * 2.0;
      sanksiNPWP = true;
    }

    let dpp = nominalBruto;
    let pph23 = 0;
    let kasDiterimaRekanan = 0;
    let totalBebanPerusahaan = 0;
    const steps = [];

    if (metode === 'gross') {
      // Pemotongan normal: Nilai bruto dipotong PPh 23
      pph23 = Math.round(dpp * tarifEfektif);
      kasDiterimaRekanan = dpp - pph23;
      totalBebanPerusahaan = dpp;

      steps.push({ label: 'Nilai Transaksi (Bruto)', value: dpp });
      steps.push({ label: `Objek: ${objek.label}`, value: `Tarif Normal ${(objek.baseRate * 100)}%` });
      if (sanksiNPWP) {
        steps.push({ label: 'Sanksi Tidak Ber-NPWP (+100%)', value: `Tarif Efektif ${(tarifEfektif * 100)}%` });
      }
      steps.push({ label: 'PPh 23 Dipotong', value: pph23 });
      steps.push({ label: 'Jumlah Bersih Dibayarkan ke Rekanan', value: kasDiterimaRekanan });
    } else {
      // Metode Gross-Up: Nilai dinaikkan agar rekanan menerima nilai penuh
      const dppGrossUp = Math.round(nominalBruto / (1 - tarifEfektif));
      pph23 = Math.round(dppGrossUp * tarifEfektif);
      kasDiterimaRekanan = nominalBruto;
      totalBebanPerusahaan = dppGrossUp;

      steps.push({ label: 'Nilai Bersih Diharapkan Rekanan', value: nominalBruto });
      steps.push({ label: `Tarif PPh 23 Diterapkan`, value: `${(tarifEfektif * 100)}%` });
      steps.push({ label: 'DPP Gross-Up (Nilai / (1 - Tarif))', value: dppGrossUp });
      steps.push({ label: 'PPh 23 Ditanggung Perusahaan', value: pph23 });
      steps.push({ label: 'Total Pengeluaran Perusahaan (Gross-Up)', value: totalBebanPerusahaan });
    }

    return {
      jenisObjek,
      objekLabel: objek.label,
      deskripsi: objek.deskripsi,
      metode,
      statusNPWP,
      sanksiNPWP,
      tarifPersen: tarifEfektif * 100,
      dpp: metode === 'gross-up' ? totalBebanPerusahaan : dpp,
      pph23,
      kasDiterimaRekanan,
      totalBebanPerusahaan,
      steps
    };
  }

  return {
    OBJEK_PPH23,
    calculate
  };
})();

