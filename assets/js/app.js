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
   * Router Tampilan Halaman (SPA Sections)
   */
  window.showSection = function (sectionId) {
    const validSections = ['home', 'kalkulator', 'artikel', 'forum', 'tentang'];
    let targetId = sectionId || 'home';
    if (!validSections.includes(targetId)) targetId = 'home';

    // Sembunyikan semua page-section
    document.querySelectorAll('.page-section').forEach(sec => {
      sec.classList.add('hidden');
    });

    const target = document.getElementById(targetId) || document.getElementById('home');
    if (target) {
      target.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Jika membuka kalkulator, default tampilkan hub KPI cards
    if (targetId === 'kalkulator') {
      const hub = document.getElementById('kalkulator-hub');
      const workspace = document.getElementById('kalkulator-workspace');
      if (hub) hub.classList.remove('hidden');
      if (workspace) workspace.classList.add('hidden');
    }

    // Update active nav styling
    document.querySelectorAll('.nav-link-btn').forEach(link => {
      const href = link.getAttribute('href') || '';
      const linkSection = href.replace('#', '');
      if (linkSection === targetId) {
        link.className = "nav-link-btn px-3.5 py-2 text-sm font-bold text-rose-900 bg-rose-50 rounded-xl transition-all";
      } else {
        link.className = "nav-link-btn px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-rose-900 hover:bg-rose-50 rounded-xl transition-all";
      }
    });

    // Tutup mobile drawer jika terbuka
    const drawer = document.getElementById('mobile-drawer');
    if (drawer && !drawer.classList.contains('hidden')) {
      drawer.classList.add('hidden');
    }
  };

  /**
   * Buka Lembar Kerja Kalkulator Pajak Tertentu (dari KPI Card)
   */
  window.openTaxCalculator = function (taxName) {
    // Pastikan section kalkulator aktif
    const kalkulatorSec = document.getElementById('kalkulator');
    if (kalkulatorSec && kalkulatorSec.classList.contains('hidden')) {
      document.querySelectorAll('.page-section').forEach(sec => sec.classList.add('hidden'));
      kalkulatorSec.classList.remove('hidden');
    }

    const hub = document.getElementById('kalkulator-hub');
    const workspace = document.getElementById('kalkulator-workspace');
    if (hub) hub.classList.add('hidden');
    if (workspace) workspace.classList.remove('hidden');

    window.switchTaxTab(taxName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Kembali ke Hub Katalog KPI Cards
   */
  window.backToTaxHub = function () {
    const hub = document.getElementById('kalkulator-hub');
    const workspace = document.getElementById('kalkulator-workspace');
    if (workspace) workspace.classList.add('hidden');
    if (hub) hub.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

    // 4. Update KPI per jenis pajak saat dibuka
    if (tabName === 'pph21' && window.updatePPh21KPI) window.updatePPh21KPI();
    if (tabName === 'ppn' && window.updatePPNKPI) window.updatePPNKPI();
    if (tabName === 'pph23' && window.updatePPh23KPI) window.updatePPh23KPI();
    if (tabName === 'pph25' && window.updatePPh25KPI) window.updatePPh25KPI();
    if (tabName === 'umkm' && window.updateUMKMKPI) window.updateUMKMKPI();
    if (tabName === 'pph-final' && window.updatePPhFinalKPI) window.updatePPhFinalKPI();
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
      if (btnMasa) btnMasa.className = "flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-rose-900 text-white shadow-sm transition-all cursor-pointer";
      if (btnTahunan) btnTahunan.className = "flex-1 py-3 px-4 rounded-xl font-semibold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all cursor-pointer";
      if (secMasa) secMasa.classList.remove('hidden');
      if (secTahunan) secTahunan.classList.add('hidden');
      if (badgeRegulasi) badgeRegulasi.textContent = "PP 58/2023 & PMK 168/2023 (Metode TER)";
    } else {
      if (btnMasa) btnMasa.className = "flex-1 py-3 px-4 rounded-xl font-semibold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all cursor-pointer";
      if (btnTahunan) btnTahunan.className = "flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-rose-900 text-white shadow-sm transition-all cursor-pointer";
      if (secMasa) secMasa.classList.add('hidden');
      if (secTahunan) secTahunan.classList.remove('hidden');
      if (badgeRegulasi) badgeRegulasi.textContent = "Pasal 17 UU HPP (Masa Pajak Terakhir / True-up)";
      updatePPh21TahunanPreview();
    }

    if (window.updatePPh21KPI) window.updatePPh21KPI();
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

  /**
   * ==============================================================
   * MODUL EDUKASI & DYNAMIC KPI ORANG AWAM
   * ==============================================================
   */

  // 1. Update KPI & Edukasi PPh 21
  window.updatePPh21KPI = function () {
    const mode = window.currentTaxState.activeModePPh21 || 'masa';
    const statusPTKP = document.getElementById('pph21-ptkp')?.value || 'TK0';
    const jenisPegawai = document.getElementById('pph21-jenis-pegawai')?.value || 'tetap';
    const statusNPWP = document.getElementById('pph21-npwp')?.value || 'ada';

    const kpiMetode = document.getElementById('kpi-pph21-metode');
    const kpiMetodeDesc = document.getElementById('kpi-pph21-metode-desc');
    const kpiTarif = document.getElementById('kpi-pph21-tarif');
    const kpiTarifDesc = document.getElementById('kpi-pph21-tarif-desc');
    const kpiPtkp = document.getElementById('kpi-pph21-ptkp');
    const kpiPtkpDesc = document.getElementById('kpi-pph21-ptkp-desc');
    const kpiWaktu = document.getElementById('kpi-pph21-waktu');
    const kpiWaktuDesc = document.getElementById('kpi-pph21-waktu-desc');
    const eduTitle = document.getElementById('pph21-edu-title');
    const eduDesc = document.getElementById('pph21-edu-desc');
    const badge = document.getElementById('pph21-kpi-badge');

    let katLabel = 'Kategori A';
    if (['TK2', 'TK3', 'K1', 'K2'].includes(statusPTKP)) katLabel = 'Kategori B';
    if (statusPTKP === 'K3') katLabel = 'Kategori C';

    if (mode === 'masa') {
      if (kpiMetode) kpiMetode.textContent = 'TER PP 58/2023';
      if (kpiMetodeDesc) kpiMetodeDesc.textContent = `Tarif Efektif (${katLabel})`;
      if (kpiTarif) kpiTarif.textContent = '0% s.d. 34%';
      if (kpiTarifDesc) kpiTarifDesc.textContent = 'Dikalikan langsung bruto sebulan';
      if (kpiPtkp) kpiPtkp.textContent = 'Gaji \u2264 Rp 5,4 Jt';
      if (kpiPtkpDesc) kpiPtkpDesc.textContent = 'Tarif 0% (Bebas Potongan Pajak)';
      if (kpiWaktu) kpiWaktu.textContent = 'Masa Jan – Nov';
      if (kpiWaktuDesc) kpiWaktuDesc.textContent = 'Potong langsung pada slip gaji';
      if (badge) badge.textContent = `Metode TER Bulanan (${katLabel})`;

      if (eduTitle) eduTitle.textContent = 'Panduan Orang Awam: Cara Kerja TER Bulanan (Jan – Nov)';
      let text = `Mulai 1 Januari 2024 melalui PP 58/2023 & PMK 168/2023, potongan gaji bulanan dibuat sangat praktis! Gaji kotor sebulan Anda langsung dikalikan persentase tarif TER sesuai status tanggungan Anda (${katLabel}) tanpa perlu repot menghitung pengurangan PTKP bulanan.`;
      if (jenisPegawai !== 'tetap') {
        text += ' <em>(Catatan: Untuk tenaga lepas/bukan pegawai, pajak dihitung dari 50% honor bruto).</em>';
      }
      if (statusNPWP === 'tidak-ada') {
        text += ' <strong class="text-rose-900 block mt-1">Perhatian: Tanpa NPWP dikenakan tarif 20% lebih tinggi.</strong>';
      }
      if (eduDesc) eduDesc.innerHTML = text;
    } else {
      if (kpiMetode) kpiMetode.textContent = 'Pasal 17 UU HPP';
      if (kpiMetodeDesc) kpiMetodeDesc.textContent = 'Tarif Progresif Tahunan';
      if (kpiTarif) kpiTarif.textContent = '5% s.d. 35%';
      if (kpiTarifDesc) kpiTarifDesc.textContent = '5 Lapisan Tarif Penghasilan';
      if (kpiPtkp) kpiPtkp.textContent = 'Biaya Jabatan + PTKP';
      if (kpiPtkpDesc) kpiPtkpDesc.textContent = 'Maks Biaya Jabatan Rp 6 Jt/thn';
      if (kpiWaktu) kpiWaktu.textContent = 'Masa Desember';
      if (kpiWaktuDesc) kpiWaktuDesc.textContent = 'True-Up (Pajak Riil Setahun - Jan-Nov)';
      if (badge) badge.textContent = 'Rekonsiliasi Desember (Pasal 17)';

      if (eduTitle) eduTitle.textContent = 'Panduan Orang Awam: Mengapa Potongan Desember Berbeda? (True-Up)';
      let text = 'Di bulan Desember, perusahaan menghitung total pajak riil Anda selama 1 tahun penuh memakai tarif progresif Pasal 17 UU HPP. Total pajak setahun tersebut lalu dikurangi jumlah pajak yang sudah dipotong dari bulan Januari hingga November. Selisih itulah yang dipotong di bulan Desember, sehingga total setahun pas dan Anda bebas dari utang pajak.';
      if (statusNPWP === 'tidak-ada') {
        text += ' <strong class="text-rose-900 block mt-1">Perhatian: Tanpa NPWP dikenakan penalti tarif 20% lebih tinggi.</strong>';
      }
      if (eduDesc) eduDesc.innerHTML = text;
    }
  };

  // 2. Update KPI & Edukasi PPN
  window.updatePPNKPI = function () {
    const tipeHitung = document.getElementById('ppn-tipe')?.value || 'exclude';
    const kategori = document.getElementById('ppn-kategori')?.value || 'standar';
    const wapu = document.getElementById('ppn-wapu')?.value || 'non-wapu';

    const kpiTarif = document.getElementById('kpi-ppn-tarif');
    const kpiTarifDesc = document.getElementById('kpi-ppn-tarif-desc');
    const kpiMetode = document.getElementById('kpi-ppn-metode');
    const kpiMetodeDesc = document.getElementById('kpi-ppn-metode-desc');
    const kpiWapu = document.getElementById('kpi-ppn-wapu');
    const kpiWapuDesc = document.getElementById('kpi-ppn-wapu-desc');
    const eduTitle = document.getElementById('ppn-edu-title');
    const eduDesc = document.getElementById('ppn-edu-desc');
    const badge = document.getElementById('ppn-kpi-badge');

    const isBesaranTertentu = kategori !== 'standar';

    if (kpiTarif) {
      kpiTarif.textContent = isBesaranTertentu ? '1,1% Efektif' : '11%';
      if (kpiTarifDesc) kpiTarifDesc.textContent = isBesaranTertentu ? 'Besaran Tertentu PMK 71' : 'Tarif Standar UU HPP';
    }

    if (kpiMetode) {
      kpiMetode.textContent = tipeHitung === 'exclude' ? 'Exclude PPN' : 'Include PPN';
      if (kpiMetodeDesc) kpiMetodeDesc.textContent = tipeHitung === 'exclude' ? 'Harga Dasar + Pajak 11%' : 'Harga di Nota Sudah Termasuk Pajak';
    }

    if (kpiWapu) {
      if (wapu === 'pemerintah') {
        kpiWapu.textContent = 'WAPU Pemerintah';
        if (kpiWapuDesc) kpiWapuDesc.textContent = 'Dipungut Bendahara jika > Rp 2 Juta';
      } else if (wapu === 'bumn') {
        kpiWapu.textContent = 'WAPU BUMN';
        if (kpiWapuDesc) kpiWapuDesc.textContent = 'Dipungut BUMN jika > Rp 10 Juta';
      } else {
        kpiWapu.textContent = 'Non-WAPU';
        if (kpiWapuDesc) kpiWapuDesc.textContent = 'Swasta Biasa (Setor Mandiri)';
      }
    }

    if (badge) {
      badge.textContent = isBesaranTertentu ? 'PMK 71/2022 (Besaran Tertentu)' : (tipeHitung === 'exclude' ? 'Exclude PPN (11%)' : 'Include PPN (11%)');
    }

    if (eduTitle) {
      if (tipeHitung === 'exclude') {
        eduTitle.textContent = 'Panduan Orang Awam: Exclude PPN (Harga Belum Termasuk Pajak)';
      } else {
        eduTitle.textContent = 'Panduan Orang Awam: Include PPN (Harga Sudah Termasuk Pajak)';
      }
    }

    let text = '';
    if (tipeHitung === 'exclude') {
      text = '<strong>Exclude PPN:</strong> Harga yang tertera adalah harga murni barang/jasa sebelum pajak. Pembeli wajib membayar: <code>Harga Barang + (11% \u00D7 Harga Barang)</code>. Contoh: Harga Rp 10.000.000, PPN Rp 1.100.000, Total Tagihan Rp 11.100.000.';
    } else {
      text = '<strong>Include PPN:</strong> Harga yang dibayar pembeli di kasir/tagihan sudah menyerap pajak 11%. Untuk mengetahui harga asli barang (DPP), rumusnya adalah <code>(100 / 111) \u00D7 Total Bayar</code>. Contoh: Total bayar Rp 11.100.000, harga dasar asli adalah Rp 10.000.000 dan nilai PPN Rp 1.100.000.';
    }

    if (isBesaranTertentu) {
      text += '<br><strong class="text-emerald-900 block mt-1.5">\u2728 Ketentuan PMK 71/2022:</strong> Jasa pengiriman paket, biro perjalanan wisata, dan penjualan kendaraan bekas dikenakan DPP Nilai Lain 10%, sehingga beban PPN efektifnya sangat ringan, yaitu hanya 1,1% dari nilai tagihan!';
    }

    if (wapu === 'pemerintah') {
      text += '<br><strong class="text-amber-900 block mt-1.5">\uD83C\uDFDB\uFE0F Aturan WAPU Pemerintah:</strong> Karena pembeli adalah instansi pemerintah dengan nilai transaksi > Rp 2 Juta, bendahara pemerintah yang akan menyetor PPN langsung ke kas negara. Anda sebagai penjual hanya menerima harga pokok murni.';
    } else if (wapu === 'bumn') {
      text += '<br><strong class="text-amber-900 block mt-1.5">\uD83C\uDFE2 Aturan WAPU BUMN:</strong> Karena pembeli adalah BUMN dengan transaksi > Rp 10 Juta, pihak BUMN yang memungut dan menyetorkan PPN Anda langsung ke negara.';
    }

    if (eduDesc) eduDesc.innerHTML = text;
  };

  // 3. Update KPI & Edukasi PPh 23
  window.updatePPh23KPI = function () {
    const objek = document.getElementById('pph23-objek')?.value || 'jasa';
    const metode = document.getElementById('pph23-metode')?.value || 'gross';
    const npwp = document.getElementById('pph23-npwp')?.value || 'ada';

    const kpiTarif = document.getElementById('kpi-pph23-tarif');
    const kpiTarifDesc = document.getElementById('kpi-pph23-tarif-desc');
    const kpiNpwp = document.getElementById('kpi-pph23-npwp');
    const eduTitle = document.getElementById('pph23-edu-title');
    const eduDesc = document.getElementById('pph23-edu-desc');
    const badge = document.getElementById('pph23-kpi-badge');

    const isPasif = ['dividen', 'bunga', 'royalti', 'hadiah'].includes(objek);
    const tarifDasar = isPasif ? 15 : 2;
    const tarifEfektif = npwp === 'tidak-ada' ? tarifDasar * 2 : tarifDasar;

    if (kpiTarif) {
      kpiTarif.textContent = `${tarifEfektif}%`;
      if (kpiTarifDesc) kpiTarifDesc.textContent = isPasif ? 'Objek Dividen/Bunga/Royalti' : 'Objek Jasa/Sewa Alat';
    }

    if (kpiNpwp) {
      kpiNpwp.textContent = npwp === 'tidak-ada' ? '+100% (2x Lipat)' : 'Tarif Standar';
    }

    if (badge) {
      badge.textContent = `Tarif ${tarifEfektif}% (${metode.toUpperCase()})`;
    }

    if (eduTitle) {
      eduTitle.textContent = metode === 'gross' ? 'Panduan Orang Awam: Metode Gross (Pajak Dipotong dari Rekanan)' : 'Panduan Orang Awam: Metode Gross-Up (Perusahaan Menanggung Pajak)';
    }

    let text = '';
    if (metode === 'gross') {
      text = `<strong>Metode Gross:</strong> Pajak sebesar ${tarifEfektif}% dipotong langsung dari honor tagihan rekanan. Rekanan menerima sisa kas bersih yang sudah berkurang. Contoh: Tagihan jasa Rp 10.000.000, dipotong Rp ${(tarifEfektif * 100000).toLocaleString('id-ID')}, rekanan menerima bersih Rp ${((100 - tarifEfektif) * 100000).toLocaleString('id-ID')}.`;
    } else {
      text = `<strong>Metode Gross-Up:</strong> Jika rekanan meminta terima bersih utuh (misal harus tetap terima Rp 10.000.000), nominal kontrak dinaikkan (*gross-up*) secara resmi menjadi Rp ${Math.round(10000000 / (1 - tarifEfektif/100)).toLocaleString('id-ID')}. Setelah dipotong ${tarifEfektif}%, sisa bersih rekanan tetap utuh Rp 10.000.000, dan pembayaran pajak tersebut diakui sah sebagai biaya (*tax-deductible*) perusahaan.`;
    }

    if (npwp === 'tidak-ada') {
      text += `<br><strong class="text-rose-900 block mt-1.5">\u26A0\uFE0F Sanksi Tanpa NPWP:</strong> Rekanan yang tidak memiliki NPWP dikenakan tarif 100% lebih tinggi (tarif normal ${tarifDasar}% naik dua kali lipat menjadi ${tarifEfektif}%).`;
    }

    if (eduDesc) eduDesc.innerHTML = text;
  };

  // 4. Update KPI & Edukasi PPh 25
  window.updatePPh25KPI = function () {
    const kategori = document.getElementById('pph25-kategori')?.value || 'badan';

    const kpiTujuan = document.getElementById('kpi-pph25-tujuan');
    const kpiTujuanDesc = document.getElementById('kpi-pph25-tujuan-desc');
    const kpiDasar = document.getElementById('kpi-pph25-dasar');
    const kpiDasarDesc = document.getElementById('kpi-pph25-dasar-desc');
    const eduTitle = document.getElementById('pph25-edu-title');
    const eduDesc = document.getElementById('pph25-edu-desc');
    const badge = document.getElementById('pph25-kpi-badge');

    if (kategori === 'oppt') {
      if (kpiTujuan) kpiTujuan.textContent = '0,75% dari Omzet';
      if (kpiTujuanDesc) kpiTujuanDesc.textContent = 'Tarif Sederhana OPPT Bulanan';
      if (kpiDasar) kpiDasar.textContent = 'Omzet Tiap Toko/Cabang';
      if (kpiDasarDesc) kpiDasarDesc.textContent = 'Dikalikan 0,75% per outlet per bulan';
      if (badge) badge.textContent = 'OPPT (0,75% Omzet Gerai)';

      if (eduTitle) eduTitle.textContent = 'Panduan Orang Awam: Apa itu OPPT (Orang Pribadi Pengusaha Tertentu)?';
      if (eduDesc) {
        eduDesc.innerHTML = 'Khusus bagi pengusaha perorangan yang memiliki satu atau lebih tempat usaha/toko/kios retail di pusat perdagangan atau ruko. Penghitungan angsuran PPh 25-nya sangat mudah: Anda tidak perlu menghitung laba rugi rumit, melainkan cukup menyetor <strong>0,75% dari omzet bulanan masing-masing gerai</strong> paling lambat tanggal 15 bulan berikutnya.';
      }
    } else {
      const isBadan = kategori === 'badan';
      if (kpiTujuan) kpiTujuan.textContent = 'Cicilan Bulanan (1/12)';
      if (kpiTujuanDesc) kpiTujuanDesc.textContent = isBadan ? 'WP Badan (PT, CV, Koperasi)' : 'WP Orang Pribadi Usaha/Bebas';
      if (kpiDasar) kpiDasar.textContent = 'SPT Tahun Lalu';
      if (kpiDasarDesc) kpiDasarDesc.textContent = 'PPh Terutang dikurangi Kredit Pajak';
      if (badge) badge.textContent = isBadan ? 'WP Badan (Cicilan 1/12)' : 'WP OP Usaha (Cicilan 1/12)';

      if (eduTitle) eduTitle.textContent = isBadan ? 'Panduan Orang Awam: Cicilan Pajak Bulanan WP Badan' : 'Panduan Orang Awam: Cicilan Pajak Bulanan Orang Pribadi Usaha';
      if (eduDesc) {
        eduDesc.innerHTML = 'Agar di akhir tahun pembukuan Anda tidak kaget membayar pajak dalam nominal besar sekaligus, negara mewajibkan mencicil pajak tiap bulan melalui PPh 25. Nilai cicilan dihitung dari <strong>(Pajak Terutang di SPT Tahunan lalu \u2212 Kredit Pajak PPh 21, 22, 23, 24) dibagi 12 bulan</strong>.';
      }
    }
  };

  // 5. Update KPI & Edukasi PPh Final UMKM
  window.updateUMKMKPI = function () {
    const bentukWP = document.getElementById('umkm-bentuk-wp')?.value || 'op';
    const modeHitung = document.getElementById('umkm-mode-hitung')?.value || 'tahunan';

    const kpiFasilitas = document.getElementById('kpi-umkm-fasilitas');
    const kpiFasilitasDesc = document.getElementById('kpi-umkm-fasilitas-desc');
    const kpiWaktu = document.getElementById('kpi-umkm-waktu');
    const kpiWaktuDesc = document.getElementById('kpi-umkm-waktu-desc');
    const eduTitle = document.getElementById('umkm-edu-title');
    const eduDesc = document.getElementById('umkm-edu-desc');
    const badge = document.getElementById('umkm-kpi-badge');

    if (bentukWP === 'op') {
      if (kpiFasilitas) kpiFasilitas.textContent = 's.d. Rp 500 Juta';
      if (kpiFasilitasDesc) kpiFasilitasDesc.textContent = 'Bebas Pajak (Tarif 0% / Gratis!)';
      if (kpiWaktu) kpiWaktu.textContent = 'Maksimal 7 Tahun';
      if (kpiWaktuDesc) kpiWaktuDesc.textContent = 'Sejak Terdaftar NPWP';
      if (badge) badge.textContent = 'UMKM OP (Fasilitas Bebas 500 Jt)';

      if (eduTitle) eduTitle.textContent = '\uD83C\uDF89 Kabar Baik: Omzet s.d. Rp 500 Juta Bebas Pajak untuk Orang Pribadi!';
      let text = 'Sesuai PP 55/2022 dan UU HPP, jika Anda adalah pengusaha UMKM Orang Pribadi, omzet kumulatif Anda dari bulan Januari hingga mencapai Rp 500 Juta <strong>TIDAK KENA PAJAK SAMA SEKALI (Rp 0 / GRATIS)</strong>! Pajak 0,5% hanya dihitung dari selisih omzet yang melewati angka Rp 500 Juta tersebut. Fasilitas ini dapat Anda nikmati hingga 7 tahun pajak.';
      if (modeHitung === 'tahunan') {
        text += '<br><span class="text-xs text-emerald-800 block mt-1.5">\uD83D\uDCCA Gunakan tabel simulasi 12 bulan di bawah untuk melihat secara otomatis di bulan ke berapa omzet Anda mulai melebihi Rp 500 Juta.</span>';
      }
      if (eduDesc) eduDesc.innerHTML = text;
    } else {
      const isPT = bentukWP === 'pt';
      if (kpiFasilitas) kpiFasilitas.textContent = 'Tanpa Batas 500 Jt';
      if (kpiFasilitasDesc) kpiFasilitasDesc.textContent = 'Langsung 0,5% dari Rupiah Pertama';
      if (kpiWaktu) kpiWaktu.textContent = isPT ? 'Maksimal 3 Tahun' : 'Maksimal 4 Tahun';
      if (kpiWaktuDesc) kpiWaktuDesc.textContent = isPT ? 'Perseroan Terbatas (PT)' : 'CV / Firma / Koperasi';
      if (badge) badge.textContent = isPT ? 'UMKM PT (Masa 3 Tahun)' : 'UMKM CV/Koperasi (Masa 4 Tahun)';

      if (eduTitle) eduTitle.textContent = '\uD83D\uDCCC Ketentuan UMKM untuk Badan Usaha (CV / PT / Koperasi)';
      let text = `Fasilitas bebas pajak omzet Rp 500 Juta hanya diberikan oleh pemerintah untuk Wajib Pajak Orang Pribadi. Untuk Badan Usaha seperti ${isPT ? 'PT (berlaku maks 3 tahun)' : 'CV/Firma/Koperasi (berlaku maks 4 tahun)'}, tarif 0,5% langsung dikenakan dari rupiah pertama omzet setiap bulannya.`;
      if (eduDesc) eduDesc.innerHTML = text;
    }
  };

  // 6. Update KPI & Edukasi PPh Final 4(2)
  window.updatePPhFinalKPI = function () {
    const objek = document.getElementById('pphfinal-objek')?.value || 'sewa-properti';

    const kpiSewa = document.getElementById('kpi-pphfinal-sewa');
    const kpiSewaDesc = document.getElementById('kpi-pphfinal-sewa-desc');
    const eduTitle = document.getElementById('pphfinal-edu-title');
    const eduDesc = document.getElementById('pphfinal-edu-desc');
    const badge = document.getElementById('pphfinal-kpi-badge');

    const descriptions = {
      'sewa-properti': {
        rate: '10%',
        title: 'Panduan Orang Awam: Sewa Tanah dan/atau Bangunan (10%)',
        desc: 'Meliputi sewa ruko, rumah, kantor, tanah, gudang, kios, apartemen, atau kamar kos. Jika penyewa adalah perusahaan/badan, penyewa wajib memotong 10% dan memberi Bukti Potong. Jika penyewa orang pribadi biasa, pemilik properti wajib menyetor sendiri ke bank paling lambat tanggal 15 bulan berikutnya.'
      },
      'jual-properti': {
        rate: '2,5%',
        title: 'Panduan Orang Awam: Jual Beli / Pengalihan Properti (2,5%)',
        desc: 'Dikenakan tarif 2,5% atas nilai tertinggi antara harga transaksi riil vs NJOP tanah dan bangunan. Pajak ini wajib disetor oleh penjual dan divalidasi oleh kantor pajak (KPP) sebelum Notaris/PPAT dapat menandatangani Akta Jual Beli (AJB).'
      },
      'konstruksi-kecil': {
        rate: '1,75%',
        title: 'Panduan Orang Awam: Jasa Konstruksi Pelaksana Kualifikasi Kecil (1,75%)',
        desc: 'Sesuai PP 9/2022, kontraktor pelaksana yang memiliki sertifikat badan usaha kualifikasi kecil dikenakan tarif PPh Final 1,75% dari nilai kontrak bruto.'
      },
      'konstruksi-menengah': {
        rate: '2,65%',
        title: 'Panduan Orang Awam: Jasa Konstruksi Menengah / Besar (2,65%)',
        desc: 'Sesuai PP 9/2022, kontraktor pelaksana dengan kualifikasi usaha menengah atau besar dikenakan tarif PPh Final 2,65% dari nilai kontrak bruto.'
      },
      'konstruksi-tanpa': {
        rate: '4%',
        title: 'Panduan Orang Awam: Jasa Konstruksi Tanpa Sertifikasi (4%)',
        desc: 'Pelaksana pekerjaan konstruksi yang belum memiliki sertifikat kualifikasi usaha dikenakan sanksi tarif lebih tinggi yaitu 4% dari bruto (PP 9/2022).'
      },
      'konsultan-konstruksi': {
        rate: '3,5%',
        title: 'Panduan Orang Awam: Jasa Konsultansi Konstruksi (3,5%)',
        desc: 'Dikenakan kepada perencana atau pengawas konstruksi bersertifikat kualifikasi usaha sebesar 3,5% dari kontrak bruto (atau 6% jika tanpa sertifikat).'
      },
      'bunga-deposito': {
        rate: '20%',
        title: 'Panduan Orang Awam: Bunga Deposito & Tabungan Bank (20%)',
        desc: 'Dipotong langsung oleh pihak bank atas bunga deposito, giro, atau tabungan bernilai di atas Rp 7,5 Juta. Nilai bunga yang masuk ke rekening Anda adalah nilai bersih.'
      },
      'hadiah-undian': {
        rate: '25%',
        title: 'Panduan Orang Awam: Pajak Hadiah Undian (25%)',
        desc: 'Dipotong langsung oleh penyelenggara kuis atau undian berhadiah dari nilai bruto hadiah (baik uang maupun barang) sebelum hadiah diserahkan kepada pemenang.'
      }
    };

    const item = descriptions[objek] || descriptions['sewa-properti'];

    if (kpiSewa) kpiSewa.textContent = item.rate;
    if (kpiSewaDesc) kpiSewaDesc.textContent = objek.replace('-', ' ').toUpperCase();
    if (badge) badge.textContent = `Tarif ${item.rate} (PPh Final)`;
    if (eduTitle) eduTitle.textContent = item.title;
    if (eduDesc) eduDesc.textContent = item.desc;
  };

  // Inisialisasi saat DOM siap
  document.addEventListener('DOMContentLoaded', function () {
    setupCurrencyInputs();

    // Event listeners untuk dropdown interaktif & dynamic update
    const pph21Ptkp = document.getElementById('pph21-ptkp');
    if (pph21Ptkp) pph21Ptkp.addEventListener('change', updatePPh21KPI);

    const pph21Pegawai = document.getElementById('pph21-jenis-pegawai');
    if (pph21Pegawai) pph21Pegawai.addEventListener('change', updatePPh21KPI);

    const pph21Npwp = document.getElementById('pph21-npwp');
    if (pph21Npwp) pph21Npwp.addEventListener('change', updatePPh21KPI);

    const ppnTipe = document.getElementById('ppn-tipe');
    if (ppnTipe) ppnTipe.addEventListener('change', updatePPNKPI);

    const ppnKategori = document.getElementById('ppn-kategori');
    if (ppnKategori) ppnKategori.addEventListener('change', updatePPNKPI);

    const ppnWapu = document.getElementById('ppn-wapu');
    if (ppnWapu) ppnWapu.addEventListener('change', updatePPNKPI);

    const pph23Objek = document.getElementById('pph23-objek');
    if (pph23Objek) pph23Objek.addEventListener('change', updatePPh23KPI);

    const pph23Npwp = document.getElementById('pph23-npwp');
    if (pph23Npwp) pph23Npwp.addEventListener('change', updatePPh23KPI);

    const pph23Metode = document.getElementById('pph23-metode');
    if (pph23Metode) pph23Metode.addEventListener('change', updatePPh23KPI);

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
        updatePPh25KPI();
      });
    }

    // Event listener bentuk WP UMKM
    const umkmWP = document.getElementById('umkm-bentuk-wp');
    if (umkmWP) umkmWP.addEventListener('change', updateUMKMKPI);

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
        updateUMKMKPI();
      });
    }

    // Event listener PPh Final 4(2) objek
    const pphFinalObjek = document.getElementById('pphfinal-objek');
    if (pphFinalObjek) pphFinalObjek.addEventListener('change', updatePPhFinalKPI);

    // Inisialisasi modul Auth & Forum
    if (window.AuthModule) AuthModule.updateUI();
    if (window.ForumModule) ForumModule.init();

    // Inisialisasi awal seluruh KPI & Edukasi Awam
    updatePPh21KPI();
    updatePPNKPI();
    updatePPh23KPI();
    updatePPh25KPI();
    updateUMKMKPI();
    updatePPhFinalKPI();

    // Default tab
    switchTaxTab('pph21');

    // Routing hash listener
    window.addEventListener('hashchange', function () {
      const hash = window.location.hash.replace('#', '') || 'home';
      window.showSection(hash);
    });

    // Jalankan section awal sesuai hash URL
    const initialHash = window.location.hash.replace('#', '') || 'home';
    window.showSection(initialHash);
  });

})();

