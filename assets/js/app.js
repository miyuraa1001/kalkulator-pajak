/**
 * ACCUTAX - Central Application Controller
 * Mengatur interaksi UI, routing kalkulator multi-pajak, format mata uang, dan integrasi modul
 */

(function () {
  'use strict';

  // Global state perhitungan aktif
  window.currentTaxState = {
    activeTab: 'pph21',
    activeModePPh21: 'masa', // 'masa' | 'tahunan'
    lastResult: null,
    lastCalcType: null
  };

  /**
   * Helper format mata uang Rupiah
   */
  function formatCurrency(amount) {
    if (amount === 0) return 'Rp 0';
    if (!amount) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  function parseCurrency(str) {
    if (!str) return 0;
    if (typeof str === 'number') return str;
    const clean = str.replace(/[^\d]/g, '');
    return parseInt(clean, 10) || 0;
  }

  /**
   * Currency Input Masking
   */
  function setupCurrencyInputs() {
    const inputs = document.querySelectorAll('.currency-mask');
    inputs.forEach(input => {
      // Mencegah double listener
      if (input.dataset.masked) return;
      input.dataset.masked = 'true';

      input.addEventListener('input', function () {
        const raw = parseCurrency(this.value);
        this.dataset.raw = raw;
        if (raw > 0) {
          this.value = 'Rp ' + raw.toLocaleString('id-ID');
        } else {
          this.value = '';
        }

        // Khusus PPh 21 Tahunan: update auto biaya jabatan dan preview setahun
        if (this.classList.contains('pph21-annual-component')) {
          updatePPh21TahunanPreview();
        }
      });

      input.addEventListener('focus', function () {
        const raw = parseCurrency(this.value);
        if (raw > 0) {
          this.value = raw.toString();
        }
      });

      input.addEventListener('blur', function () {
        const raw = parseCurrency(this.value);
        this.dataset.raw = raw;
        if (raw > 0) {
          this.value = 'Rp ' + raw.toLocaleString('id-ID');
        } else {
          this.value = '';
        }
      });
    });
  }

  function getRawInputValue(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    if (el.dataset && el.dataset.raw !== undefined) {
      return parseInt(el.dataset.raw, 10) || 0;
    }
    return parseCurrency(el.value);
  }

  function setRawInputValue(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    el.dataset.raw = val;
    el.value = val > 0 ? 'Rp ' + val.toLocaleString('id-ID') : '';
  }

  /**
   * Switcher Tab Kalkulator Multi-Pajak
   */
  window.switchTaxTab = function (tabName) {
    window.currentTaxState.activeTab = tabName;

    // 1. Update tombol tab UI
    document.querySelectorAll('.tax-tab-btn').forEach(btn => {
      if (btn.dataset.tab === tabName) {
        btn.className = "tax-tab-btn active";
      } else {
        btn.className = "tax-tab-btn";
      }
    });

    // 2. Tampilkan panel yang bersangkutan
    document.querySelectorAll('.tax-panel').forEach(panel => {
      panel.classList.add('hidden');
    });

    const targetPanel = document.getElementById(`panel-${tabName}`);
    if (targetPanel) {
      targetPanel.classList.remove('hidden');
    }

    // 3. Sembunyikan hasil perhitungan lama sampai user klik hitung
    const resultBox = document.getElementById('unified-result-container');
    if (resultBox) {
      resultBox.classList.add('hidden');
    }
  };

  /**
   * Switcher Mode PPh 21: Masa (TER) vs Tahunan (Pasal 17)
   */
  window.switchPPh21Mode = function (mode) {
    window.currentTaxState.activeModePPh21 = mode;

    const btnMasa = document.getElementById('btn-mode-masa');
    const btnTahunan = document.getElementById('btn-mode-tahunan');
    const secMasa = document.getElementById('pph21-sec-masa');
    const secTahunan = document.getElementById('pph21-sec-tahunan');
    const badgeRegulasi = document.getElementById('pph21-badge-regulasi');

    if (mode === 'masa') {
      if (btnMasa) btnMasa.className = "flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-rose-900 text-white shadow-sm transition-all";
      if (btnTahunan) btnTahunan.className = "flex-1 py-3 px-4 rounded-xl font-semibold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all";
      if (secMasa) secMasa.classList.remove('hidden');
      if (secTahunan) secTahunan.classList.add('hidden');
      if (badgeRegulasi) badgeRegulasi.textContent = "PP 58/2023 & PMK 168/2023 (Metode TER)";
    } else {
      if (btnMasa) btnMasa.className = "flex-1 py-3 px-4 rounded-xl font-semibold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all";
      if (btnTahunan) btnTahunan.className = "flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-rose-900 text-white shadow-sm transition-all";
      if (secMasa) secMasa.classList.add('hidden');
      if (secTahunan) secTahunan.classList.remove('hidden');
      if (badgeRegulasi) badgeRegulasi.textContent = "Pasal 17 UU HPP (Masa Pajak Terakhir / True-up)";
      updatePPh21TahunanPreview();
    }
  };

  /**
   * Preview Otomatis PPh 21 Tahunan (Pengurang, Biaya Jabatan & TER Jan-Nov)
   */
  function updatePPh21TahunanPreview() {
    const gaji = getRawInputValue('pph21-tahunan-gaji');
    const tunjangan = getRawInputValue('pph21-tahunan-tunjangan');
    const bonus = getRawInputValue('pph21-tahunan-bonus'); // sudah tahunan
    const natura = getRawInputValue('pph21-tahunan-natura');

    const totalGajiThn = gaji * 12;
    const totalTunjanganThn = tunjangan * 12;
    const totalNaturaThn = natura * 12;
    const totalBrutoThn = totalGajiThn + totalTunjanganThn + bonus + totalNaturaThn;

    // Biaya Jabatan 5% maks 6jt/thn
    const biayaJabatan = Math.min(Math.round(totalBrutoThn * 0.05), 6000000);
    const bjField = document.getElementById('pph21-tahunan-biaya-jabatan');
    if (bjField) bjField.value = formatCurrency(biayaJabatan);

    // Estimasi kredit Jan-Nov jika pegawai tetap
    const statusPTKP = document.getElementById('pph21-ptkp')?.value || 'TK0';
    const statusNPWP = document.getElementById('pph21-npwp')?.value || 'ada';
    const brutoSebulanRata = totalBrutoThn / 12;

    if (window.PPh21Calculator) {
      const terKat = PPh21Calculator.getTERCategory(statusPTKP);
      const terRate = PPh21Calculator.getTERRate(terKat, brutoSebulanRata);
      let pphSebulan = Math.round(brutoSebulanRata * (terRate / 100));
      if (statusNPWP === 'tidak-ada') pphSebulan = Math.round(pphSebulan * 1.2);
      const estimasiKreditJanNov = pphSebulan * 11;

      const kreditField = document.getElementById('pph21-tahunan-terpotong');
      if (kreditField && !kreditField.dataset.userEdited) {
        setRawInputValue('pph21-tahunan-terpotong', estimasiKreditJanNov);
      }
    }
  }

  /**
   * Eksekusi Perhitungan PPh 21
   */
  window.submitPPh21 = function (e) {
    if (e) e.preventDefault();
    const mode = window.currentTaxState.activeModePPh21;
    const nama = document.getElementById('pph21-nama')?.value || 'Wajib Pajak';
    const npwp = document.getElementById('pph21-npwp-nomor')?.value || '';
    const statusNPWP = document.getElementById('pph21-npwp')?.value || 'ada';
    const statusPTKP = document.getElementById('pph21-ptkp')?.value || 'TK0';
    const jenisPegawai = document.getElementById('pph21-jenis-pegawai')?.value || 'tetap';

    let result = null;

    if (mode === 'masa') {
      const gajiPokok = getRawInputValue('pph21-masa-gaji');
      const tunjangan = getRawInputValue('pph21-masa-tunjangan');
      const bonus = getRawInputValue('pph21-masa-bonus');
      const lembur = getRawInputValue('pph21-masa-lembur');
      const natura = getRawInputValue('pph21-masa-natura');

      if ((gajiPokok + tunjangan + bonus + lembur + natura) <= 0) {
        alert("Harap masukkan komponen penghasilan bruto minimal satu kolom.");
        return;
      }

      result = PPh21Calculator.calculateMasa({
        jenisPegawai,
        statusPTKP,
        statusNPWP,
        gajiPokok,
        tunjangan,
        bonus,
        lembur,
        natura
      });

      result.mode = 'masa';
      result.nama = nama;
      result.npwp = npwp;
      result.statusPTKP = statusPTKP;
      result.jenisPegawai = jenisPegawai === 'tetap' ? 'Pegawai Tetap' : jenisPegawai === 'bukan-pegawai-berkesinambungan' ? 'Bukan Pegawai (Berkesinambungan)' : 'Bukan Pegawai (Tidak Berkesinambungan)';

      showCalculationResult({
        title: "Hasil Perhitungan PPh 21 Masa (Metode TER)",
        primaryLabel: "PPh 21 Terutang Masa Ini",
        primaryValue: result.pphFinal,
        statusType: result.pphFinal > 0 ? "warning" : "success",
        statusText: result.pphFinal > 0 ? "Kurang Bayar (Wajib Dipotong)" : "Nihil",
        kpis: [
          { label: "Total Bruto", value: formatCurrency(result.bruto) },
          { label: "Kategori TER", value: result.terKategori === '-' ? 'Pasal 17' : `TER ${result.terKategori}` },
          { label: "Tarif Pajak", value: `${result.terTarif}%` },
          { label: "Status NPWP", value: statusNPWP === 'ada' ? 'Memiliki NPWP' : 'Non-NPWP (+20%)' }
        ],
        steps: result.steps,
        onPrint: () => ExportModule.printPPh21(result)
      });
    } else {
      // Tahunan
      const gaji = getRawInputValue('pph21-tahunan-gaji');
      const tunjangan = getRawInputValue('pph21-tahunan-tunjangan');
      const bonus = getRawInputValue('pph21-tahunan-bonus');
      const natura = getRawInputValue('pph21-tahunan-natura');
      const iuranPensiun = getRawInputValue('pph21-tahunan-iuran') * 12;
      const zakat = getRawInputValue('pph21-tahunan-zakat') * 12;
      const pph21TelahDipotong = getRawInputValue('pph21-tahunan-terpotong');

      if ((gaji + tunjangan + bonus + natura) <= 0) {
        alert("Harap masukkan penghasilan bulanan minimal satu kolom.");
        return;
      }

      result = PPh21Calculator.calculateTahunan({
        jenisPegawai,
        statusPTKP,
        statusNPWP,
        gajiSetahun: gaji * 12,
        tunjanganSetahun: tunjangan * 12,
        bonusSetahun: bonus,
        naturaSetahun: natura * 12,
        iuranPensiunSetahun: iuranPensiun,
        zakatSetahun: zakat,
        pph21TelahDipotong
      });

      result.mode = 'tahunan';
      result.nama = nama;
      result.npwp = npwp;
      result.statusPTKP = statusPTKP;
      result.bruto = result.brutoSetahun;
      result.pphFinal = result.pphSetahunFinal;
      result.pphTelahDipotong = pph21TelahDipotong;

      const isKurang = result.selisihDesember >= 0;

      showCalculationResult({
        title: "Hasil Perhitungan PPh 21 Masa Terakhir (Desember)",
        primaryLabel: isKurang ? "PPh 21 Kurang Bayar (Masa Desember)" : "PPh 21 Lebih Bayar (Masa Desember)",
        primaryValue: Math.abs(result.selisihDesember),
        statusType: isKurang ? "warning" : "success",
        statusText: isKurang ? "Kurang Bayar" : "Lebih Bayar",
        kpis: [
          { label: "Bruto Setahun", value: formatCurrency(result.brutoSetahun) },
          { label: "Penghasilan Neto", value: formatCurrency(result.penghasilanNeto) },
          { label: "PPh 21 Setahun", value: formatCurrency(result.pphSetahunFinal) },
          { label: "Kredit Jan-Nov", value: formatCurrency(pph21TelahDipotong) }
        ],
        steps: result.steps,
        onPrint: () => ExportModule.printPPh21(result)
      });
    }

    window.currentTaxState.lastResult = result;
    window.currentTaxState.lastCalcType = 'pph21';
  };

  /**
   * Eksekusi Perhitungan PPN
   */
  window.submitPPN = function (e) {
    if (e) e.preventDefault();
    const tipeHitung = document.getElementById('ppn-tipe')?.value || 'exclude';
    const kategori = document.getElementById('ppn-kategori')?.value || 'standar';
    const nominal = getRawInputValue('ppn-nominal');
    const jenisWapu = document.getElementById('ppn-wapu')?.value || 'non-wapu';

    if (nominal <= 0) {
      alert("Harap masukkan nilai transaksi / harga.");
      return;
    }

    const result = PPNCalculator.calculateSingle({
      tipeHitung,
      kategori,
      nominal,
      jenisWapu
    });

    showCalculationResult({
      title: "Hasil Perhitungan PPN (UU HPP 11%)",
      primaryLabel: "PPN Terutang (11%)",
      primaryValue: result.ppn,
      statusType: "info",
      statusText: result.dipungutWapu ? "Dipungut WAPU" : "Wajib Dipungut",
      kpis: [
        { label: "Dasar Pengenaan Pajak (DPP)", value: formatCurrency(result.dpp) },
        { label: "PPN (11%)", value: formatCurrency(result.ppn) },
        { label: "Total Nilai Faktur", value: formatCurrency(result.totalBayar) },
        { label: "Diterima Penjual", value: formatCurrency(result.kasDiterimaPenjual) }
      ],
      notice: result.keteranganWapu,
      steps: result.steps,
      onPrint: () => ExportModule.printTaxSummary("Laporan Perhitungan PPN", result, result.steps)
    });

    window.currentTaxState.lastResult = result;
    window.currentTaxState.lastCalcType = 'ppn';
  };

  /**
   * Eksekusi Perhitungan PPh 23
   */
  window.submitPPh23 = function (e) {
    if (e) e.preventDefault();
    const jenisObjek = document.getElementById('pph23-objek')?.value || 'jasa';
    const nominalBruto = getRawInputValue('pph23-nominal');
    const statusNPWP = document.getElementById('pph23-npwp')?.value || 'ada';
    const metode = document.getElementById('pph23-metode')?.value || 'gross';
    const namaRekanan = document.getElementById('pph23-nama')?.value || 'Rekanan / Penyedia Jasa';

    if (nominalBruto <= 0) {
      alert("Harap masukkan nilai transaksi / kontrak.");
      return;
    }

    const result = PPh23Calculator.calculate({
      jenisObjek,
      nominalBruto,
      statusNPWP,
      metode
    });
    result.nama = namaRekanan;

    showCalculationResult({
      title: "Hasil Pemotongan PPh Pasal 23",
      primaryLabel: "PPh 23 Dipotong",
      primaryValue: result.pph23,
      statusType: "warning",
      statusText: `Tarif ${result.tarifPersen}%`,
      kpis: [
        { label: "Nilai Dasar (DPP)", value: formatCurrency(result.dpp) },
        { label: "Tarif Pajak", value: `${result.tarifPersen}%` },
        { label: "Diterima Rekanan", value: formatCurrency(result.kasDiterimaRekanan) },
        { label: "Beban Perusahaan", value: formatCurrency(result.totalBebanPerusahaan) }
      ],
      notice: result.sanksiNPWP ? "Dikenakan tarif 100% lebih tinggi karena rekanan tidak memiliki NPWP." : "",
      steps: result.steps,
      onPrint: () => ExportModule.printPPh23(result)
    });

    window.currentTaxState.lastResult = result;
    window.currentTaxState.lastCalcType = 'pph23';
  };

  /**
   * Eksekusi Perhitungan PPh 25
   */
  window.submitPPh25 = function (e) {
    if (e) e.preventDefault();
    const kategoriWP = document.getElementById('pph25-kategori')?.value || 'badan';
    const pphTerutangSPT = getRawInputValue('pph25-terutang-spt');
    const kreditPph21 = getRawInputValue('pph25-kredit-21');
    const kreditPph22 = getRawInputValue('pph25-kredit-22');
    const kreditPph23 = getRawInputValue('pph25-kredit-23');
    const kreditPph24 = getRawInputValue('pph25-kredit-24');
    const omzetBulananOPPT = getRawInputValue('pph25-omzet-oppt');

    if (kategoriWP === 'oppt' && omzetBulananOPPT <= 0) {
      alert("Harap masukkan omzet bulanan tempat usaha untuk OPPT.");
      return;
    }
    if (kategoriWP !== 'oppt' && pphTerutangSPT <= 0) {
      alert("Harap masukkan PPh Terutang SPT Tahunan tahun lalu.");
      return;
    }

    const result = PPh25Calculator.calculate({
      kategoriWP,
      pphTerutangSPT,
      kreditPph21,
      kreditPph22,
      kreditPph23,
      kreditPph24,
      omzetBulananOPPT
    });

    showCalculationResult({
      title: "Hasil Perhitungan Angsuran PPh Pasal 25",
      primaryLabel: "Angsuran PPh 25 per Bulan",
      primaryValue: result.angsuranBulanan,
      statusType: result.angsuranBulanan > 0 ? "info" : "success",
      statusText: result.angsuranBulanan > 0 ? "Wajib Disetor Tiap Tgl 15" : "Nihil",
      kpis: [
        { label: "Kategori WP", value: result.kategoriLabel },
        { label: "Dasar Angsuran", value: formatCurrency(result.sisaPPhTerutang || result.omzetBulananOPPT) },
        { label: "Angsuran Bulanan", value: formatCurrency(result.angsuranBulanan) },
        { label: "Total Setahun (×12)", value: formatCurrency(result.angsuranSetahun) }
      ],
      notice: result.keterangan,
      steps: result.steps,
      onPrint: () => ExportModule.printTaxSummary("Laporan Angsuran PPh Pasal 25", result, result.steps)
    });

    window.currentTaxState.lastResult = result;
    window.currentTaxState.lastCalcType = 'pph25';
  };

  /**
   * Eksekusi Perhitungan PPh Final UMKM (PP 55/2022)
   */
  window.submitUMKM = function (e) {
    if (e) e.preventDefault();
    const bentukWP = document.getElementById('umkm-bentuk-wp')?.value || 'op';
    const modeHitung = document.getElementById('umkm-mode-hitung')?.value || 'tahunan';

    if (modeHitung === 'singkat') {
      const omzetBruto = getRawInputValue('umkm-omzet-singkat');
      const omzetSebelum = getRawInputValue('umkm-omzet-kumulatif-lalu');

      if (omzetBruto <= 0) {
        alert("Harap masukkan omzet bulan ini.");
        return;
      }

      const result = UMKMCalculator.calculateQuick(bentukWP, omzetBruto, omzetSebelum);

      showCalculationResult({
        title: "Hasil Perhitungan PPh Final UMKM 0,5% (PP 55/2022)",
        primaryLabel: "PPh Final Terutang Bulan Ini (0,5%)",
        primaryValue: result.pphFinal,
        statusType: result.pphFinal > 0 ? "warning" : "success",
        statusText: result.pphFinal === 0 ? "Bebas Pajak (Fasilitas 500 Juta)" : "Kurang Bayar (0,5%)",
        kpis: [
          { label: "Bentuk Usaha", value: bentukWP === 'op' ? 'Orang Pribadi (Bebas s.d 500 Juta)' : 'Badan Usaha' },
          { label: "Omzet Bulan Ini", value: formatCurrency(result.omzetBruto) },
          { label: "Omzet Kena Pajak", value: formatCurrency(result.omzetKenaPajak) },
          { label: "Total Akumulasi", value: formatCurrency(result.totalAkumulasi) }
        ],
        steps: result.steps,
        onPrint: () => ExportModule.printTaxSummary("Laporan PPh Final UMKM 0.5%", result, result.steps)
      });
    } else {
      // 12 Bulan Simulasi
      const omzetBulan = [];
      for (let m = 1; m <= 12; m++) {
        omzetBulan.push(getRawInputValue(`umkm-m${m}`));
      }

      const totalOmzetInput = omzetBulan.reduce((a, b) => a + b, 0);
      if (totalOmzetInput <= 0) {
        alert("Harap isi omzet per bulan pada tabel simulasi.");
        return;
      }

      const result = UMKMCalculator.calculateTahunanSimulasi(bentukWP, omzetBulan);

      // Render tabel simulasi di hasil
      const tableRows = result.rincianBulan.map(r => `
        <tr class="border-b border-slate-100 hover:bg-slate-50">
          <td class="py-2.5 px-3 font-semibold text-slate-800">${r.bulan}</td>
          <td class="py-2.5 px-3 text-right">${formatCurrency(r.omzet)}</td>
          <td class="py-2.5 px-3 text-right text-slate-500">${formatCurrency(r.omzetKumulatif)}</td>
          <td class="py-2.5 px-3 text-right font-medium text-slate-700">${formatCurrency(r.omzetKenaPajak)}</td>
          <td class="py-2.5 px-3 text-right font-bold text-rose-900">${formatCurrency(r.pajak)}</td>
          <td class="py-2.5 px-3 text-xs text-slate-500">${r.keterangan}</td>
        </tr>
      `).join('');

      const customHtml = `
        <div class="mt-6 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
          <div class="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-800 text-sm flex justify-between items-center">
            <span>Tabel Simulasi 12 Bulan (Januari s.d. Desember)</span>
            <span class="text-xs font-semibold px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full">PP 55/2022</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-100/70 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th class="py-2.5 px-3">Bulan</th>
                  <th class="py-2.5 px-3 text-right">Omzet</th>
                  <th class="py-2.5 px-3 text-right">Akumulasi</th>
                  <th class="py-2.5 px-3 text-right">DPP Kena Pajak</th>
                  <th class="py-2.5 px-3 text-right">PPh 0,5%</th>
                  <th class="py-2.5 px-3">Status Insentif</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </div>
        </div>
      `;

      showCalculationResult({
        title: "Hasil Simulasi PPh Final UMKM 0,5% Setahun (PP 55/2022)",
        primaryLabel: "Total PPh Final UMKM Terutang Setahun",
        primaryValue: result.totalPajakSetahun,
        statusType: "info",
        statusText: `Batas Waktu: ${result.batasWaktuPemanfaatan}`,
        kpis: [
          { label: "Bentuk Wajib Pajak", value: result.bentukWPLabel },
          { label: "Total Omzet Setahun", value: formatCurrency(result.totalOmzetSetahun) },
          { label: "Omzet Bebas Pajak", value: formatCurrency(result.totalOmzetBebas) },
          { label: "Omzet Kena Pajak", value: formatCurrency(result.totalOmzetKenaPajak) }
        ],
        customHtml,
        onPrint: () => ExportModule.printTaxSummary("Simulasi PPh Final UMKM 12 Bulan", result, [
          { label: "Total Omzet Setahun", value: result.totalOmzetSetahun },
          { label: "Omzet Bebas Pajak (Fasilitas)", value: result.totalOmzetBebas },
          { label: "Omzet Kena Pajak", value: result.totalOmzetKenaPajak },
          { label: "Total PPh Final Disetor (0,5%)", value: result.totalPajakSetahun }
        ])
      });
    }

    window.currentTaxState.lastCalcType = 'umkm';
  };

  /**
   * Eksekusi Perhitungan PPh Final Pasal 4 Ayat (2)
   */
  window.submitPPhFinal = function (e) {
    if (e) e.preventDefault();
    const jenisObjek = document.getElementById('pphfinal-objek')?.value || 'sewa-properti';
    const nominalBruto = getRawInputValue('pphfinal-nominal');

    if (nominalBruto <= 0) {
      alert("Harap masukkan nilai transaksi bruto.");
      return;
    }

    const result = PPhFinalCalculator.calculate({
      jenisObjek,
      nominalBruto
    });

    showCalculationResult({
      title: "Hasil Perhitungan PPh Final Pasal 4 Ayat (2)",
      primaryLabel: "PPh Final Terutang",
      primaryValue: result.pphFinal,
      statusType: "warning",
      statusText: `Tarif ${result.tarifPersen}%`,
      kpis: [
        { label: "Objek Pajak", value: result.label },
        { label: "Nilai Bruto", value: formatCurrency(result.nominalBruto) },
        { label: "Tarif Pajak Final", value: `${result.tarifPersen}%` },
        { label: "Kas Bersih Diterima", value: formatCurrency(result.kasBersih) }
      ],
      notice: result.deskripsi,
      steps: result.steps,
      onPrint: () => ExportModule.printTaxSummary("Laporan PPh Final Pasal 4(2)", result, result.steps)
    });

    window.currentTaxState.lastResult = result;
    window.currentTaxState.lastCalcType = 'pph-final';
  };

  /**
   * Display Universal Result Card
   */
  function showCalculationResult(config) {
    const container = document.getElementById('unified-result-container');
    if (!container) return;

    const titleEl = document.getElementById('result-title');
    const primaryLabelEl = document.getElementById('result-primary-label');
    const primaryValueEl = document.getElementById('result-primary-value');
    const statusBadgeEl = document.getElementById('result-status-badge');
    const kpiGridEl = document.getElementById('result-kpi-grid');
    const stepsListEl = document.getElementById('result-steps-list');
    const noticeBoxEl = document.getElementById('result-notice-box');
    const noticeTextEl = document.getElementById('result-notice-text');
    const customAreaEl = document.getElementById('result-custom-area');
    const printBtn = document.getElementById('btn-print-result');

    if (titleEl) titleEl.textContent = config.title;
    if (primaryLabelEl) primaryLabelEl.textContent = config.primaryLabel;
    if (primaryValueEl) primaryValueEl.textContent = formatCurrency(config.primaryValue);

    if (statusBadgeEl) {
      statusBadgeEl.textContent = config.statusText;
      if (config.statusType === 'warning') {
        statusBadgeEl.className = "px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold uppercase tracking-wider";
      } else if (config.statusType === 'success') {
        statusBadgeEl.className = "px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider";
      } else {
        statusBadgeEl.className = "px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wider";
      }
    }

    if (kpiGridEl && config.kpis) {
      kpiGridEl.innerHTML = config.kpis.map(kpi => `
        <div class="result-stat-box">
          <div class="text-xs text-slate-500 font-medium">${kpi.label}</div>
          <div class="text-base sm:text-lg font-bold text-slate-900 mt-1 truncate" title="${kpi.value}">${kpi.value}</div>
        </div>
      `).join('');
    }

    if (stepsListEl && config.steps) {
      stepsListEl.innerHTML = config.steps.map(s => `
        <div class="flex justify-between items-center py-2 border-b border-slate-100 text-xs sm:text-sm">
          <span class="text-slate-600">${s.label}</span>
          <span class="font-bold text-slate-900">${typeof s.value === 'number' ? formatCurrency(s.value) : s.value}</span>
        </div>
      `).join('');
    }

    if (noticeBoxEl && noticeTextEl) {
      if (config.notice) {
        noticeTextEl.textContent = config.notice;
        noticeBoxEl.classList.remove('hidden');
      } else {
        noticeBoxEl.classList.add('hidden');
      }
    }

    if (customAreaEl) {
      customAreaEl.innerHTML = config.customHtml || '';
    }

    if (printBtn) {
      printBtn.onclick = config.onPrint || (() => window.print());
    }

    container.classList.remove('hidden');
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Modal Artikel Handlers
   */
  window.openArticleModal = function (id) {
    const modal = document.getElementById(`modal-artikel-${id}`);
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeArticleModal = function (id) {
    const modal = document.getElementById(`modal-artikel-${id}`);
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = 'auto';
    }
  };

  /**
   * Mobile Menu Drawer
   */
  window.toggleMobileNav = function () {
    const menu = document.getElementById('mobile-drawer');
    if (menu) {
      menu.classList.toggle('hidden');
    }
  };

  /**
   * Quick Fill Pre-populated Data untuk Simulasi UMKM
   */
  window.fillSampleUMKM = function () {
    const sample = [35000000, 42000000, 50000000, 60000000, 55000000, 70000000, 80000000, 75000000, 90000000, 85000000, 95000000, 110000000];
    for (let i = 1; i <= 12; i++) {
      setRawInputValue(`umkm-m${i}`, sample[i - 1]);
    }
  };

  // Inisialisasi saat DOM siap
  document.addEventListener('DOMContentLoaded', function () {
    setupCurrencyInputs();

    // Event listener dropdown PPh 25
    const pph25Cat = document.getElementById('pph25-kategori');
    if (pph25Cat) {
      pph25Cat.addEventListener('change', function () {
        const isOPPT = this.value === 'oppt';
        const secSPT = document.getElementById('pph25-sec-spt');
        const secOPPT = document.getElementById('pph25-sec-oppt');
        if (isOPPT) {
          if (secSPT) secSPT.classList.add('hidden');
          if (secOPPT) secOPPT.classList.remove('hidden');
        } else {
          if (secSPT) secSPT.classList.remove('hidden');
          if (secOPPT) secOPPT.classList.add('hidden');
        }
      });
    }

    // Event listener mode UMKM (Singkat vs 12 Bulan)
    const umkmMode = document.getElementById('umkm-mode-hitung');
    if (umkmMode) {
      umkmMode.addEventListener('change', function () {
        const isSingkat = this.value === 'singkat';
        const secSingkat = document.getElementById('umkm-sec-singkat');
        const secTahunan = document.getElementById('umkm-sec-tahunan');
        if (isSingkat) {
          if (secSingkat) secSingkat.classList.remove('hidden');
          if (secTahunan) secTahunan.classList.add('hidden');
        } else {
          if (secSingkat) secSingkat.classList.add('hidden');
          if (secTahunan) secTahunan.classList.remove('hidden');
        }
      });
    }

    // Inisialisasi modul Auth & Forum
    if (window.AuthModule) AuthModule.updateUI();
    if (window.ForumModule) ForumModule.init();

    // Default tab
    switchTaxTab('pph21');
  });

})();

