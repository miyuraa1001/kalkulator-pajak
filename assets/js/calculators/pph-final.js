/**
 * ACCUTAX - Modul Perhitungan PPh Final Pasal 4 Ayat (2)
 * Mengacu pada UU PPh Pasal 4(2), PP 34/2016, PP 34/2017, PP 9/2022
 */

window.PPhFinalCalculator = (function () {
  const OBJEK_FINAL = {
    'sewa-properti': {
      label: 'Sewa Tanah dan/atau Bangunan (PP 34/2017)',
      rate: 0.10,
      deskripsi: 'Dipungut 10% dari jumlah bruto nilai persewaan termasuk service charge.'
    },
    'jual-properti': {
      label: 'Pengalihan Hak atas Tanah & Bangunan / Jual Beli Rumah (PP 34/2016)',
      rate: 0.025,
      deskripsi: 'Dipungut 2,5% dari nilai pengalihan (harga transaksi atau NJOP mana yang lebih tinggi).'
    },
    'konstruksi-kecil': {
      label: 'Jasa Konstruksi - Kualifikasi Usaha Kecil (PP 9/2022)',
      rate: 0.0175,
      deskripsi: 'Dipungut 1,75% untuk penyedia jasa bersertifikasi kualifikasi kecil.'
    },
    'konstruksi-menengah': {
      label: 'Jasa Konstruksi - Kualifikasi Menengah / Besar (PP 9/2022)',
      rate: 0.0265,
      deskripsi: 'Dipungut 2,65% untuk kontraktor bersertifikasi menengah atau besar.'
    },
    'konstruksi-tanpa': {
      label: 'Jasa Konstruksi - Tanpa Sertifikat / Kualifikasi (PP 9/2022)',
      rate: 0.04,
      deskripsi: 'Dipungut 4% untuk pekerjaan konstruksi oleh penyedia tanpa kualifikasi.'
    },
    'konsultan-konstruksi': {
      label: 'Konsultansi Konstruksi / Perencana / Pengawas Bersertifikat',
      rate: 0.035,
      deskripsi: 'Dipungut 3,5% untuk konsultansi konstruksi dengan sertifikasi usaha.'
    },
    'bunga-deposito': {
      label: 'Bunga Deposito / Tabungan & Diskonto SBI',
      rate: 0.20,
      deskripsi: 'Dipungut 20% atas penghasilan bunga simpanan perbankan.'
    },
    'hadiah-undian': {
      label: 'Hadiah Undian (Lotere, Lucky Draw)',
      rate: 0.25,
      deskripsi: 'Dipungut 25% bersifat final atas nilai bruto hadiah undian.'
    }
  };

  function calculate(params) {
    const {
      jenisObjek = 'sewa-properti',
      nominalBruto = 0
    } = params;

    const item = OBJEK_FINAL[jenisObjek] || OBJEK_FINAL['sewa-properti'];
    const pphFinal = Math.round(nominalBruto * item.rate);
    const kasBersih = nominalBruto - pphFinal;

    const steps = [
      { label: 'Kategori Objek PPh Final', value: item.label },
      { label: 'Nilai Bruto Transaksi', value: nominalBruto },
      { label: 'Tarif PPh Final (Pasal 4 ayat 2)', value: `${(item.rate * 100).toFixed(2)}%` },
      { label: 'PPh Final Terutang', value: pphFinal },
      { label: 'Nilai Bersih Diterima Pemilik Penghasilan', value: kasBersih }
    ];

    return {
      jenisObjek,
      label: item.label,
      deskripsi: item.deskripsi,
      nominalBruto,
      tarifPersen: item.rate * 100,
      pphFinal,
      kasBersih,
      steps
    };
  }

  return {
    OBJEK_FINAL,
    calculate
  };
})();
