/**
 * ACCUTAX - Modul Perhitungan PPh Pasal 25 (Angsuran Pajak Bulanan)
 * Mengacu pada UU PPh Pasal 25, UU HPP No. 7/2021
 */

window.PPh25Calculator = (function () {
  /**
   * Hitung Angsuran PPh 25
   */
  function calculate(params) {
    const {
      kategoriWP = 'badan', // 'badan' | 'op-usaha' | 'oppt'
      pphTerutangSPT = 0,
      kreditPph21 = 0,
      kreditPph22 = 0,
      kreditPph23 = 0,
      kreditPph24 = 0,
      omzetBulananOPPT = 0,
      jumlahBulan = 12
    } = params;

    const steps = [];

    if (kategoriWP === 'oppt') {
      // Orang Pribadi Pengusaha Tertentu: 0.75% x Omzet Bulanan per tempat usaha
      const tarifOPPT = 0.0075; // 0.75%
      const angsuranBulanan = Math.round(omzetBulananOPPT * tarifOPPT);

      steps.push({ label: 'Kategori Wajib Pajak', value: 'Wajib Pajak Orang Pribadi Pengusaha Tertentu (OPPT)' });
      steps.push({ label: 'Peredaran Bruto (Omzet) Bulan Ini', value: omzetBulananOPPT });
      steps.push({ label: 'Tarif PPh 25 OPPT (Pasal 25 ayat 7)', value: '0,75%' });
      steps.push({ label: 'Rumus Angsuran', value: `0,75% × Rp ${omzetBulananOPPT.toLocaleString('id-ID')}` });
      steps.push({ label: 'PPh 25 Wajib Disetor Tiap Bulan', value: angsuranBulanan });

      return {
        kategoriWP,
        kategoriLabel: 'Orang Pribadi Pengusaha Tertentu (OPPT)',
        omzetBulananOPPT,
        totalKreditPajak: 0,
        sisaPPhTerutang: 0,
        angsuranBulanan,
        angsuranSetahun: angsuranBulanan * 12,
        keterangan: 'Angsuran PPh 25 disetorkan paling lambat tanggal 15 bulan berikutnya dan dapat dikreditkan pada SPT Tahunan.',
        steps
      };
    }

    // Skema Umum: Badan atau Orang Pribadi Usaha/Bebas
    const totalKreditPajak = kreditPph21 + kreditPph22 + kreditPph23 + kreditPph24;
    const sisaPPhTerutang = Math.max(0, pphTerutangSPT - totalKreditPajak);
    const angsuranBulanan = Math.round(sisaPPhTerutang / (jumlahBulan || 12));

    const namaKategori = kategoriWP === 'badan' ? 'Wajib Pajak Badan' : 'Wajib Pajak Orang Pribadi Usaha/Bebas';

    steps.push({ label: 'Kategori Wajib Pajak', value: namaKategori });
    steps.push({ label: 'PPh Terutang Berdasarkan SPT Tahunan Tahun Lalu', value: pphTerutangSPT });
    steps.push({ label: 'Kredit Pajak PPh 21 (Pemotongan Kerja)', value: kreditPph21 });
    steps.push({ label: 'Kredit Pajak PPh 22 (Impor/Bendahara)', value: kreditPph22 });
    steps.push({ label: 'Kredit Pajak PPh 23 (Jasa/Sewa/Dividen)', value: kreditPph23 });
    steps.push({ label: 'Kredit Pajak PPh 24 (Pajak Luar Negeri)', value: kreditPph24 });
    steps.push({ label: 'Total Kredit Pajak (Kredit Pengurang)', value: totalKreditPajak });
    steps.push({ label: 'Dasar Penghitungan Angsuran (Sisa PPh Terutang)', value: sisaPPhTerutang });
    steps.push({ label: `Angsuran Tiap Bulan (${sisaPPhTerutang.toLocaleString('id-ID')} / ${jumlahBulan} bln)`, value: angsuranBulanan });

    return {
      kategoriWP,
      kategoriLabel: namaKategori,
      pphTerutangSPT,
      totalKreditPajak,
      sisaPPhTerutang,
      angsuranBulanan,
      angsuranSetahun: angsuranBulanan * 12,
      keterangan: angsuranBulanan > 0
        ? 'Wajib disetor paling lambat tanggal 15 setiap bulan. Bukti setor NTPN dicatat sebagai kredit pajak di akhir tahun.'
        : 'PPh terutang telah tercover penuh oleh kredit pajak tahun lalu. Angsuran PPh 25 adalah Nihil.',
      steps
    };
  }

  return {
    calculate
  };
})();

