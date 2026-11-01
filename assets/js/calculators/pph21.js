/**
 * ACCUTAX - Modul Perhitungan PPh 21
 * Mengacu pada PP 58/2023, PMK 168/2023, dan UU HPP No. 7/2021 (Pasal 17)
 */

window.PPh21Calculator = (function () {
  // Nilai PTKP Tahunan (PMK 101/PMK.010/2016)
  const PTKP_VALUES = {
    'TK0': 54000000,
    'TK1': 58500000,
    'TK2': 63000000,
    'TK3': 67500000,
    'K0': 58500000,
    'K1': 63000000,
    'K2': 67500000,
    'K3': 72000000
  };

  // Keterangan Deskripsi Status PTKP (PMK 101/PMK.010/2016)
  const PTKP_DESCRIPTIONS = {
    'TK0': 'TK/0 - Tidak Kawin, Tanpa Tanggungan (Rp 54.000.000)',
    'TK1': 'TK/1 - Tidak Kawin, 1 Tanggungan (Rp 58.500.000)',
    'TK2': 'TK/2 - Tidak Kawin, 2 Tanggungan (Rp 63.000.000)',
    'TK3': 'TK/3 - Tidak Kawin, 3 Tanggungan (Rp 67.500.000)',
    'K0': 'K/0 - Kawin, Tanpa Tanggungan (Rp 58.500.000)',
    'K1': 'K/1 - Kawin, 1 Tanggungan (Rp 63.000.000)',
    'K2': 'K/2 - Kawin, 2 Tanggungan (Rp 67.500.000)',
    'K3': 'K/3 - Kawin, 3 Tanggungan (Rp 72.000.000)'
  };

  function getPTKPLabel(ptkp) {
    return PTKP_DESCRIPTIONS[ptkp] || 'TK/0 - Tanpa Tanggungan';
  }

  // Tarif Progresif Pasal 17 ayat (1) huruf a UU HPP
  const TAX_BRACKETS_PASAL_17 = [
    { min: 0, max: 60000000, rate: 0.05 },
    { min: 60000000, max: 250000000, rate: 0.15 },
    { min: 250000000, max: 500000000, rate: 0.25 },
    { min: 500000000, max: 5000000000, rate: 0.30 },
    { min: 5000000000, max: Infinity, rate: 0.35 }
  ];

  // Tabel TER PP 58/2023
  const TER_TABLE = {
    'A': [
      { limit: 5400000, rate: 0 },
      { limit: 5650000, rate: 0.25 },
      { limit: 5950000, rate: 0.5 },
      { limit: 6300000, rate: 0.75 },
      { limit: 6750000, rate: 1.0 },
      { limit: 7500000, rate: 1.25 },
      { limit: 8550000, rate: 1.5 },
      { limit: 9650000, rate: 1.75 },
      { limit: 10050000, rate: 2.0 },
      { limit: 10350000, rate: 2.25 },
      { limit: 10700000, rate: 2.5 },
      { limit: 11050000, rate: 3.0 },
      { limit: 11600000, rate: 3.5 },
      { limit: 12500000, rate: 4.0 },
      { limit: 13750000, rate: 5.0 },
      { limit: 15100000, rate: 6.0 },
      { limit: 16950000, rate: 7.0 },
      { limit: 19750000, rate: 8.0 },
      { limit: 24150000, rate: 9.0 },
      { limit: 26450000, rate: 10.0 },
      { limit: 28000000, rate: 11.0 },
      { limit: 30050000, rate: 12.0 },
      { limit: 32400000, rate: 13.0 },
      { limit: 35400000, rate: 14.0 },
      { limit: 39100000, rate: 15.0 },
      { limit: 43850000, rate: 16.0 },
      { limit: 47800000, rate: 17.0 },
      { limit: 51400000, rate: 18.0 },
      { limit: 56300000, rate: 19.0 },
      { limit: 62200000, rate: 20.0 },
      { limit: 68600000, rate: 21.0 },
      { limit: 77500000, rate: 22.0 },
      { limit: 89000000, rate: 23.0 },
      { limit: 103000000, rate: 24.0 },
      { limit: 125000000, rate: 25.0 },
      { limit: 157000000, rate: 26.0 },
      { limit: 206000000, rate: 27.0 },
      { limit: 337000000, rate: 28.0 },
      { limit: 454000000, rate: 29.0 },
      { limit: 550000000, rate: 30.0 },
      { limit: 695000000, rate: 31.0 },
      { limit: 910000000, rate: 32.0 },
      { limit: 1400000000, rate: 33.0 },
      { limit: Infinity, rate: 34.0 }
    ],
    'B': [
      { limit: 6200000, rate: 0 },
      { limit: 6500000, rate: 0.25 },
      { limit: 6850000, rate: 0.5 },
      { limit: 7300000, rate: 0.75 },
      { limit: 9200000, rate: 1.0 },
      { limit: 10750000, rate: 1.5 },
      { limit: 11250000, rate: 2.0 },
      { limit: 11600000, rate: 2.5 },
      { limit: 12600000, rate: 3.0 },
      { limit: 13600000, rate: 4.0 },
      { limit: 14950000, rate: 5.0 },
      { limit: 16400000, rate: 6.0 },
      { limit: 18450000, rate: 7.0 },
      { limit: 21850000, rate: 8.0 },
      { limit: 26000000, rate: 9.0 },
      { limit: 27700000, rate: 10.0 },
      { limit: 29350000, rate: 11.0 },
      { limit: 31450000, rate: 12.0 },
      { limit: 33950000, rate: 13.0 },
      { limit: 37100000, rate: 14.0 },
      { limit: 41100000, rate: 15.0 },
      { limit: 45800000, rate: 16.0 },
      { limit: 49500000, rate: 17.0 },
      { limit: 53800000, rate: 18.0 },
      { limit: 58500000, rate: 19.0 },
      { limit: 64000000, rate: 20.0 },
      { limit: 71000000, rate: 21.0 },
      { limit: 80000000, rate: 22.0 },
      { limit: 93000000, rate: 23.0 },
      { limit: 109000000, rate: 24.0 },
      { limit: 129000000, rate: 25.0 },
      { limit: 163000000, rate: 26.0 },
      { limit: 211000000, rate: 27.0 },
      { limit: 374000000, rate: 28.0 },
      { limit: 459000000, rate: 29.0 },
      { limit: 555000000, rate: 30.0 },
      { limit: 704000000, rate: 31.0 },
      { limit: 957000000, rate: 32.0 },
      { limit: 1405000000, rate: 33.0 },
      { limit: Infinity, rate: 34.0 }
    ],
    'C': [
      { limit: 6600000, rate: 0 },
      { limit: 6950000, rate: 0.25 },
      { limit: 7350000, rate: 0.5 },
      { limit: 7800000, rate: 0.75 },
      { limit: 8850000, rate: 1.0 },
      { limit: 9800000, rate: 1.5 },
      { limit: 11200000, rate: 2.0 },
      { limit: 12050000, rate: 2.5 },
      { limit: 12950000, rate: 3.0 },
      { limit: 14150000, rate: 4.0 },
      { limit: 15550000, rate: 5.0 },
      { limit: 17050000, rate: 6.0 },
      { limit: 19500000, rate: 7.0 },
      { limit: 22700000, rate: 8.0 },
      { limit: 26600000, rate: 9.0 },
      { limit: 28100000, rate: 10.0 },
      { limit: 30100000, rate: 11.0 },
      { limit: 32600000, rate: 12.0 },
      { limit: 35400000, rate: 13.0 },
      { limit: 38900000, rate: 14.0 },
      { limit: 43000000, rate: 15.0 },
      { limit: 47400000, rate: 16.0 },
      { limit: 51200000, rate: 17.0 },
      { limit: 55800000, rate: 18.0 },
      { limit: 60400000, rate: 19.0 },
      { limit: 66700000, rate: 20.0 },
      { limit: 74500000, rate: 21.0 },
      { limit: 83200000, rate: 22.0 },
      { limit: 95600000, rate: 23.0 },
      { limit: 110000000, rate: 24.0 },
      { limit: 134000000, rate: 25.0 },
      { limit: 169000000, rate: 26.0 },
      { limit: 221000000, rate: 27.0 },
      { limit: 390000000, rate: 28.0 },
      { limit: 463000000, rate: 29.0 },
      { limit: 561000000, rate: 30.0 },
      { limit: 709000000, rate: 31.0 },
      { limit: 965000000, rate: 32.0 },
      { limit: 1419000000, rate: 33.0 },
      { limit: Infinity, rate: 34.0 }
    ]
  };

  function getTERCategory(ptkp) {
    if (['TK0', 'TK1', 'K0'].includes(ptkp)) return 'A';
    if (['TK2', 'TK3', 'K1', 'K2'].includes(ptkp)) return 'B';
    if (['K3'].includes(ptkp)) return 'C';
    return 'A';
  }

  function getTERRate(category, bruto) {
    const list = TER_TABLE[category] || TER_TABLE['A'];
    const item = list.find(r => bruto <= r.limit);
    return item ? item.rate : 0;
  }

  function calculatePasal17(pkp) {
    let tax = 0;
    let sisa = Math.max(0, pkp);
    const details = [];

    for (let i = 0; i < TAX_BRACKETS_PASAL_17.length; i++) {
      if (sisa <= 0) break;
      const b = TAX_BRACKETS_PASAL_17[i];
      const kena = Math.min(sisa, b.max - b.min);
      const taxLapis = kena * b.rate;
      tax += taxLapis;
      details.push({
        lapis: i + 1,
        rate: b.rate * 100,
        nominal: kena,
        pajak: taxLapis
      });
      sisa -= kena;
    }

    return { total: tax, details: details };
  }

  /**
   * Hitung PPh 21 Masa (Metode TER PP 58/2023 & PMK 168/2023)
   */
  function calculateMasa(params) {
    const {
      jenisPegawai = 'tetap',
      statusPTKP = 'TK0',
      statusNPWP = 'ada',
      gajiPokok = 0,
      tunjangan = 0,
      bonus = 0,
      lembur = 0,
      natura = 0,
      iuranPensiun = 0,
      zakat = 0
    } = params;

    const bruto = gajiPokok + tunjangan + bonus + lembur + natura;
    let pphNormal = 0;
    let pphFinal = 0;
    let terKategori = '-';
    let terTarif = 0;
    let dpp = bruto;
    let pkp = 0;
    const steps = [];

    // Bagian I: Rincian Penghasilan Bruto Sebulan
    steps.push({ isHeader: true, title: 'I. Rincian Komponen Penghasilan Bruto Sebulan' });
    steps.push({ label: 'Gaji Pokok / Upah Sebulan', value: gajiPokok });
    if (tunjangan > 0) steps.push({ label: 'Tunjangan Tetap & Variabel', value: tunjangan });
    if (bonus > 0) steps.push({ label: 'Bonus / THR / Insentif Bulan Ini', value: bonus });
    if (lembur > 0) steps.push({ label: 'Uang Lembur & Premi Asuransi (JKK/JKM)', value: lembur });
    if (natura > 0) steps.push({ label: 'Natura / Fasilitas Kenikmatan (PMK 66/2023)', value: natura });
    steps.push({ isTotal: true, label: 'Total Penghasilan Bruto Sebulan', value: bruto });

    if (jenisPegawai === 'tetap') {
      terKategori = getTERCategory(statusPTKP);
      terTarif = getTERRate(terKategori, bruto);
      pphNormal = Math.round(bruto * (terTarif / 100));

      steps.push({ isHeader: true, title: 'II. Penentuan Tarif Efektif Rata-Rata (PP 58/2023)' });
      steps.push({ label: `Status PTKP Wajib Pajak`, value: statusPTKP, subtext: getPTKPLabel(statusPTKP) });
      steps.push({ label: 'Kategori TER Bulanan', value: `Kategori TER ${terKategori}` });
      steps.push({ label: 'Tarif Efektif yang Berlaku (TER)', value: `${terTarif}%`, badge: 'PP 58/2023' });
      steps.push({
        isTotal: true,
        label: 'PPh 21 Terutang Pokok Sebulan',
        value: pphNormal,
        subtext: `Perhitungan: ${terTarif}% × Rp ${bruto.toLocaleString('id-ID')}`
      });
    } else if (jenisPegawai === 'bukan-pegawai-berkesinambungan') {
      // DPP = 50% x Bruto (PMK 168/2023 Pasal 10 & 11)
      dpp = Math.round(bruto * 0.5);
      const ptkpSebulan = Math.round((PTKP_VALUES[statusPTKP] || 54000000) / 12);
      pkp = Math.max(0, Math.floor((dpp - ptkpSebulan) / 1000) * 1000);
      const p17 = calculatePasal17(pkp);
      pphNormal = Math.round(p17.total);

      steps.push({ isHeader: true, title: 'II. Dasar Pengenaan Pajak & PTKP (PMK 168/2023)' });
      steps.push({ label: 'Dasar Pengenaan Pajak (DPP = 50% × Bruto)', value: dpp, badge: '50% Bruto' });
      steps.push({ label: `Pengurangan PTKP Sebulan (${statusPTKP})`, value: ptkpSebulan, badge: 'PTKP/12' });
      steps.push({ isTotal: true, label: 'Penghasilan Kena Pajak (PKP Dibulatkan)', value: pkp });

      steps.push({ isHeader: true, title: 'III. Perhitungan Tarif Progresif (Pasal 17 UU HPP)' });
      if (pkp === 0) {
        steps.push({ label: 'PKP Kurang dari atau Sama dengan Rp 0', value: 'Nihil (Bebas Potongan)' });
      } else {
        p17.details.forEach(d => {
          steps.push({ label: `Lapis ${d.lapis} Tarif ${d.rate}% (Rp ${d.nominal.toLocaleString('id-ID')})`, value: d.pajak, badge: `${d.rate}%` });
        });
      }
      steps.push({ isTotal: true, label: 'PPh 21 Terutang Pokok', value: pphNormal });
    } else {
      // Bukan Pegawai Tidak Berkesinambungan (Freelance Lepas): DPP = 50% x Bruto, Tanpa PTKP
      dpp = Math.round(bruto * 0.5);
      pkp = Math.floor(dpp / 1000) * 1000;
      const p17 = calculatePasal17(pkp);
      pphNormal = Math.round(p17.total);

      steps.push({ isHeader: true, title: 'II. Dasar Pengenaan Pajak (PMK 168/2023)' });
      steps.push({ label: 'Dasar Pengenaan Pajak (DPP = 50% × Bruto)', value: dpp, badge: '50% Bruto' });
      steps.push({ isTotal: true, label: 'PKP Kumulatif (Tanpa PTKP)', value: pkp });

      steps.push({ isHeader: true, title: 'III. Perhitungan Tarif Progresif (Pasal 17 UU HPP)' });
      p17.details.forEach(d => {
        steps.push({ label: `Lapis ${d.lapis} Tarif ${d.rate}% (Rp ${d.nominal.toLocaleString('id-ID')})`, value: d.pajak, badge: `${d.rate}%` });
      });
      steps.push({ isTotal: true, label: 'PPh 21 Terutang Pokok', value: pphNormal });
    }

    // Bagian Penalti NPWP & Rekapitulasi Akhir
    steps.push({ isHeader: true, title: 'IV. Rekapitulasi Pemotongan & Gaji Bersih (Take Home Pay)' });
    let sanksiNPWP = 0;
    if (statusNPWP === 'tidak-ada') {
      sanksiNPWP = Math.round(pphNormal * 0.2);
      pphFinal = pphNormal + sanksiNPWP;
      steps.push({
        label: 'Sanksi Tidak Memiliki NPWP (+20%)',
        value: sanksiNPWP,
        badge: 'Pasal 21 (5a)',
        subtext: `Tambahan penalti 20% × Rp ${pphNormal.toLocaleString('id-ID')}`
      });
    } else {
      pphFinal = pphNormal;
      steps.push({ label: 'Status Kepemilikan NPWP', value: 'Memiliki NPWP / NIK Valid (Tarif Standar)' });
    }

    steps.push({
      isHighlight: true,
      label: 'Total PPh 21 Dipotong Perusahaan (Bulan Ini)',
      value: pphFinal,
      badge: pphFinal > 0 ? 'Dipotong dari Gaji' : 'Nihil'
    });

    const takeHomePay = Math.max(0, bruto - pphFinal);
    steps.push({
      isHighlight: true,
      isNeto: true,
      label: 'Take Home Pay (Gaji Bersih Diterima Pegawai)',
      value: takeHomePay,
      badge: 'Gaji Bersih',
      subtext: 'Penghasilan kotor sebulan setelah dipotong PPh 21'
    });

    return {
      bruto,
      dpp,
      pkp,
      terKategori,
      terTarif,
      pphNormal,
      sanksiNPWP,
      pphFinal,
      takeHomePay,
      steps
    };
  }

  /**
   * Hitung PPh 21 Masa Pajak Terakhir (Desember / Berhenti Bekerja)
   * Sesuai Ketentuan Pasal 17 ayat (1) huruf a UU HPP & PMK 168/2023
   */
  function calculateTahunan(params) {
    const {
      jenisPegawai = 'tetap',
      statusPTKP = 'TK0',
      statusNPWP = 'ada',
      gajiSetahun = 0,
      tunjanganSetahun = 0,
      bonusSetahun = 0,
      naturaSetahun = 0,
      iuranPensiunSetahun = 0,
      zakatSetahun = 0,
      pph21TelahDipotong = 0
    } = params;

    const brutoSetahun = gajiSetahun + tunjanganSetahun + bonusSetahun + naturaSetahun;
    let biayaJabatan = 0;
    let totalPengurang = 0;
    let penghasilanNeto = brutoSetahun;
    let ptkp = PTKP_VALUES[statusPTKP] || 54000000;
    let pkp = 0;
    const steps = [];

    // Bagian I: Bruto Setahun Penuh
    steps.push({ isHeader: true, title: 'I. Rincian Penghasilan Bruto Setahun Penuh (12 Bulan)' });
    steps.push({ label: 'Gaji Pokok Setahun (12 Bulan)', value: gajiSetahun });
    if (tunjanganSetahun > 0) steps.push({ label: 'Tunjangan Setahun (12 Bulan)', value: tunjanganSetahun });
    if (bonusSetahun > 0) steps.push({ label: 'Bonus, THR & Insentif Total Setahun', value: bonusSetahun });
    if (naturaSetahun > 0) steps.push({ label: 'Natura / Kenikmatan Setahun', value: naturaSetahun });
    steps.push({ isTotal: true, label: 'Total Penghasilan Bruto Setahun Penuh', value: brutoSetahun });

    // Bagian II: Pengurang Penghasilan Bruto Sah (Pasal 21 ayat 3 UU PPh)
    steps.push({ isHeader: true, title: 'II. Pengurang Penghasilan Bruto Sah (UU PPh Pasal 21 ayat 3)' });
    if (jenisPegawai === 'tetap') {
      // Biaya Jabatan: 5% dari Bruto, maksimal Rp 500.000/bln atau Rp 6.000.000/thn
      biayaJabatan = Math.min(Math.round(brutoSetahun * 0.05), 6000000);
      totalPengurang = biayaJabatan + iuranPensiunSetahun + zakatSetahun;
      penghasilanNeto = Math.max(0, brutoSetahun - totalPengurang);
      pkp = Math.max(0, Math.floor((penghasilanNeto - ptkp) / 1000) * 1000);

      steps.push({
        label: 'Biaya Jabatan (5% dari Bruto, Maks. Rp 6.000.000/Tahun)',
        value: biayaJabatan,
        badge: 'Maks. 6 Jt'
      });
      if (iuranPensiunSetahun > 0) {
        steps.push({ label: 'Iuran Pensiun / JHT / THT Setahun', value: iuranPensiunSetahun });
      }
      if (zakatSetahun > 0) {
        steps.push({ label: 'Zakat / Sumbangan Keagamaan Wajib Setahun (Badan Resmi)', value: zakatSetahun });
      }
      steps.push({ isTotal: true, label: 'Total Pengurang Penghasilan Sah Setahun', value: totalPengurang });
    } else if (jenisPegawai === 'bukan-pegawai-berkesinambungan') {
      penghasilanNeto = Math.round(brutoSetahun * 0.5);
      pkp = Math.max(0, Math.floor((penghasilanNeto - ptkp) / 1000) * 1000);
      steps.push({ label: 'Dasar Pengenaan Pajak (50% dari Bruto Setahun)', value: penghasilanNeto, badge: '50% Bruto' });
    } else {
      penghasilanNeto = Math.round(brutoSetahun * 0.5);
      pkp = Math.floor(penghasilanNeto / 1000) * 1000;
      steps.push({ label: 'Dasar Pengenaan Pajak (50% dari Bruto Setahun)', value: penghasilanNeto, badge: '50% Bruto' });
    }

    // Bagian III: Penghasilan Bersih & Penghasilan Kena Pajak (PKP)
    steps.push({ isHeader: true, title: 'III. Penghasilan Bersih & Penghasilan Kena Pajak (PKP)' });
    steps.push({ label: 'Penghasilan Bersih / Neto Setahun', value: penghasilanNeto });
    steps.push({
      label: `Penghasilan Tidak Kena Pajak (PTKP ${statusPTKP})`,
      value: ptkp,
      badge: 'PMK 101/2016',
      subtext: getPTKPLabel(statusPTKP)
    });
    steps.push({
      isTotal: true,
      label: 'Penghasilan Kena Pajak (PKP Dibulatkan)',
      value: pkp,
      subtext: 'Dibulatkan ke bawah ke ribuan penuh sesuai Pasal 17 UU HPP'
    });

    // Bagian IV: Perhitungan Tarif Progresif Pasal 17
    steps.push({ isHeader: true, title: 'IV. Perhitungan Pajak Progresif (UU HPP No. 7/2021 Pasal 17)' });
    const p17 = calculatePasal17(pkp);
    let pphSetahunNormal = Math.round(p17.total);
    let sanksiNPWP = 0;
    let pphSetahunFinal = pphSetahunNormal;

    if (pkp === 0) {
      steps.push({ label: 'Penghasilan Kena Pajak (PKP) = Rp 0', value: 'Nihil (Bebas Pajak)', badge: 'Bebas Pajak' });
    } else {
      p17.details.forEach(d => {
        steps.push({
          label: `Lapis ${d.lapis} Tarif ${d.rate}% (Nominal Kena: Rp ${d.nominal.toLocaleString('id-ID')})`,
          value: d.pajak,
          badge: `${d.rate}%`
        });
      });
    }

    if (statusNPWP === 'tidak-ada') {
      sanksiNPWP = Math.round(pphSetahunNormal * 0.2);
      pphSetahunFinal = pphSetahunNormal + sanksiNPWP;
      steps.push({
        label: 'Sanksi Tidak Memiliki NPWP (+20%)',
        value: sanksiNPWP,
        badge: 'Pasal 21 (5a)',
        subtext: `Tambahan penalti 20% × Rp ${pphSetahunNormal.toLocaleString('id-ID')}`
      });
    }

    steps.push({
      isTotal: true,
      label: 'Total PPh 21 Terutang Setahun Penuh',
      value: pphSetahunFinal,
      subtext: 'Kewajiban pajak riil selama 1 tahun pajak (Januari – Desember)'
    });

    // Bagian V: True-Up & Rekonsiliasi Masa Desember
    steps.push({ isHeader: true, title: 'V. True-Up & Rekonsiliasi Masa Terakhir (Desember)' });
    steps.push({ label: 'Total PPh 21 Riil Setahun Penuh', value: pphSetahunFinal });
    steps.push({ label: 'Kredit PPh 21 Telah Dipotong (Januari – November / TER)', value: pph21TelahDipotong });

    const selisihDesember = pphSetahunFinal - pph21TelahDipotong;
    if (selisihDesember >= 0) {
      steps.push({
        isHighlight: true,
        label: 'PPh 21 Kurang Bayar Masa Desember (Wajib Dipotong)',
        value: selisihDesember,
        badge: 'Kurang Bayar',
        subtext: 'Dipungut pada slip gaji bulan Desember untuk melunasi pajak setahun'
      });
    } else {
      steps.push({
        isHighlight: true,
        isNeto: true,
        label: 'PPh 21 Lebih Bayar Masa Desember (Dapat Dikembalikan)',
        value: Math.abs(selisihDesember),
        badge: 'Lebih Bayar',
        subtext: 'Pajak Jan–Nov lebih besar dari kewajiban riil setahun; dikembalikan ke karyawan'
      });
    }

    return {
      brutoSetahun,
      biayaJabatan,
      totalPengurang,
      penghasilanNeto,
      ptkp,
      pkp,
      pphSetahunFinal,
      pph21TelahDipotong,
      selisihDesember,
      steps
    };
  }

  return {
    PTKP_VALUES,
    PTKP_DESCRIPTIONS,
    getPTKPLabel,
    getTERCategory,
    getTERRate,
    calculatePasal17,
    calculateMasa,
    calculateTahunan
  };
})();

