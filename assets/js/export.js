/**
 * ACCUTAX - Export & Document Printing System
 * Menghasilkan Dokumen Bukti Potong Resmi (1721-A1, 1721-VIII, Bupot PPh 23, Lembar Perhitungan Pajak)
 */

window.ExportModule = (function () {
  function formatIDR(num) {
    if (num === 0) return 'Rp 0';
    if (!num) return '-';
    return 'Rp ' + Math.floor(num).toLocaleString('id-ID');
  }

  function printDocument(htmlContent, title = "Cetak Dokumen Pajak - ACCUTAX") {
    const printWindow = window.open('', '_blank', 'width=950,height=850');
    if (!printWindow) {
      alert("Pop-up browser terblokir. Harap izinkan pop-up untuk mencetak dokumen.");
      return;
    }

    const doc = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 10mm;
          }
          * {
            box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif;
          }
          body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #000000;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-size: 10pt;
          }
          .a4-container {
            width: 100%;
            max-width: 210mm;
            margin: 0 auto;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8.5pt;
          }
          th, td {
            border: 1px solid #000000;
            padding: 4px 6px;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .bg-header { background-color: #e2e8f0 !important; font-weight: bold; }
          .bg-sub { background-color: #f1f5f9 !important; font-weight: bold; }
          .box-char {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 1px solid #000;
            text-align: center;
            line-height: 16px;
            margin-right: 2px;
            font-size: 8pt;
            font-weight: bold;
          }
          @media print {
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="a4-container">
          ${htmlContent}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            }, 500);
          };
        <\/script>
      </body>
      </html>
    `;

    printWindow.document.write(doc);
    printWindow.document.close();
  }

  /**
   * Cetak Bukti Potong PPh 21 (Formulir 1721-A1 / 1721-VIII)
   */
  function printPPh21(data) {
    if (!data) {
      alert("Harap lakukan perhitungan PPh 21 terlebih dahulu.");
      return;
    }

    const now = new Date();
    const isMasa = data.mode === 'masa';
    const formNum = isMasa ? '1721 - VIII' : '1721 - A1';
    const masaStart = isMasa ? '01' : '01';
    const masaEnd = isMasa ? String(now.getMonth() + 1).padStart(2, '0') : '12';
    const tahunPajak = String(now.getFullYear());

    const content = `
      <div style="border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 8px;">
        <table style="border: none;">
          <tr>
            <td style="width: 20%; border: none; text-align: center; vertical-align: middle;">
              <img src="assets/images/branding/logo-djp.png" style="width: 75px; height: auto;" alt="Logo DJP">
            </td>
            <td style="border: none; text-align: center; vertical-align: middle;">
              <div style="font-size: 11pt; font-weight: bold;">KEMENTERIAN KEUANGAN REPUBLIK INDONESIA</div>
              <div style="font-size: 10pt; font-weight: bold;">DIREKTORAT JENDERAL PAJAK</div>
              <div style="font-size: 11pt; font-weight: bold; margin-top: 4px;">BUKTI PEMOTONGAN PAJAK PENGHASILAN PASAL 21</div>
              <div style="font-size: 13pt; font-weight: bold; color: #881337;">FORMULIR ${formNum}</div>
              <div style="font-size: 9pt; margin-top: 2px;">
                Masa Pajak: 
                <span class="box-char">${masaStart[0]}</span><span class="box-char">${masaStart[1]}</span> s.d.
                <span class="box-char">${masaEnd[0]}</span><span class="box-char">${masaEnd[1]}</span> |
                Tahun Pajak: 
                <span class="box-char">${tahunPajak[0]}</span><span class="box-char">${tahunPajak[1]}</span><span class="box-char">${tahunPajak[2]}</span><span class="box-char">${tahunPajak[3]}</span>
              </div>
            </td>
            <td style="width: 25%; border: 1px solid #000; font-size: 8pt; vertical-align: top; padding: 6px;">
              <div class="font-bold">Nomor Bukti Potong:</div>
              <div style="border: 1px dashed #666; height: 26px; margin-top: 4px; padding: 3px; font-family: monospace;">1.1-24-00001</div>
            </td>
          </tr>
        </table>
      </div>

      <div class="bg-header" style="border: 1px solid #000; padding: 4px 8px; margin-bottom: 4px;">A. IDENTITAS PENERIMA PENGHASILAN YANG DIPOTONG</div>
      <table style="margin-bottom: 8px;">
        <tr>
          <td style="width: 50%;"><strong>1. NPWP / NIK:</strong> ${data.npwp || '00.000.000.0-000.000'}</td>
          <td style="width: 50%;"><strong>2. Status PTKP:</strong> ${data.statusPTKP || 'TK/0'}</td>
        </tr>
        <tr>
          <td colspan="2"><strong>3. Nama Wajib Pajak:</strong> ${(data.nama || 'WAJIB PAJAK ORANG PRIBADI').toUpperCase()}</td>
        </tr>
        <tr>
          <td><strong>4. Jenis Pegawai:</strong> ${data.jenisPegawai || 'Pegawai Tetap'}</td>
          <td><strong>5. Metode Pajak:</strong> ${isMasa ? `Metode TER (${data.terKategori || 'A'})` : 'Pasal 17 UU HPP'}</td>
        </tr>
      </table>

      <div class="bg-header" style="border: 1px solid #000; padding: 4px 8px; margin-bottom: 4px;">B. RINCIAN PENGHASILAN DAN PENGHITUNGAN PPh PASAL 21</div>
      <table style="margin-bottom: 8px;">
        <tr class="bg-sub">
          <th style="width: 6%;">NO</th>
          <th>URAIAN PENGHASILAN &amp; PENGURANG</th>
          <th style="width: 26%;">JUMLAH (RUPIAH)</th>
        </tr>
        <tr>
          <td class="text-center font-bold">1</td>
          <td>Penghasilan Bruto (Gaji, Tunjangan, Bonus/THR, Natura)</td>
          <td class="text-right font-bold">${formatIDR(data.bruto)}</td>
        </tr>
        ${!isMasa ? `
        <tr>
          <td class="text-center">2</td>
          <td>Pengurang: Biaya Jabatan (5% Bruto, Maks. Rp 6.000.000/thn)</td>
          <td class="text-right">${formatIDR(data.biayaJabatan || 0)}</td>
        </tr>
        <tr>
          <td class="text-center">3</td>
          <td>Pengurang: Iuran Pensiun / THT / Zakat Sah</td>
          <td class="text-right">${formatIDR(data.iuranPensiun || 0)}</td>
        </tr>
        <tr class="bg-sub">
          <td class="text-center font-bold">4</td>
          <td>Jumlah Penghasilan Neto</td>
          <td class="text-right font-bold">${formatIDR(data.penghasilanNeto)}</td>
        </tr>
        <tr>
          <td class="text-center">5</td>
          <td>Penghasilan Tidak Kena Pajak (PTKP)</td>
          <td class="text-right">${formatIDR(data.ptkp)}</td>
        </tr>
        <tr class="bg-sub">
          <td class="text-center font-bold">6</td>
          <td>Penghasilan Kena Pajak (PKP Dibulatkan ke Bawah)</td>
          <td class="text-right font-bold">${formatIDR(data.pkp)}</td>
        </tr>
        ` : `
        <tr>
          <td class="text-center">2</td>
          <td>Kategori Tarif Efektif Rata-Rata (TER)</td>
          <td class="text-right font-bold">Kategori ${data.terKategori} (${data.terTarif}%)</td>
        </tr>
        `}
        <tr class="bg-header" style="font-size: 10pt;">
          <td class="text-center font-bold">★</td>
          <td class="font-bold">PPh Pasal 21 Terutang ${isMasa ? 'Masa Ini' : 'Setahun'}</td>
          <td class="text-right font-bold" style="color: #881337;">${formatIDR(data.pphFinal)}</td>
        </tr>
        ${!isMasa && data.pphTelahDipotong ? `
        <tr>
          <td class="text-center font-bold">-</td>
          <td>PPh Pasal 21 yang Telah Dipotong Sebelumnya (Jan-Nov)</td>
          <td class="text-right">${formatIDR(data.pphTelahDipotong)}</td>
        </tr>
        <tr class="bg-sub font-bold">
          <td class="text-center">★</td>
          <td>${data.selisihDesember >= 0 ? 'PPh 21 Kurang Bayar (Masa Desember)' : 'PPh 21 Lebih Bayar (Masa Desember)'}</td>
          <td class="text-right" style="color: ${data.selisihDesember >= 0 ? '#b45309' : '#047857'};">${formatIDR(Math.abs(data.selisihDesember))}</td>
        </tr>
        ` : ''}
      </table>

      <div class="bg-header" style="border: 1px solid #000; padding: 4px 8px; margin-bottom: 4px;">C. IDENTITAS PEMOTONG PAJAK</div>
      <table>
        <tr>
          <td style="width: 60%; vertical-align: top;">
            <div><strong>NPWP Pemotong:</strong> 00.000.000.0-000.000</div>
            <div style="margin-top: 4px;"><strong>Nama Pemotong:</strong> PT KONSULTAN PAJAK INDONESIA / ACCUTAX</div>
            <div style="margin-top: 4px; font-size: 8pt; color: #555;">Dokumen ini diterbitkan secara otomatis dan sah melalui Sistem Kalkulasi Pajak ACCUTAX sesuai regulasi perpajakan yang berlaku.</div>
          </td>
          <td style="width: 40%; text-align: center; vertical-align: top;">
            <div>Diterbitkan di: Bandar Lampung</div>
            <div>Tanggal: ${now.toLocaleDateString('id-ID')}</div>
            <div style="margin-top: 35px; font-weight: bold; text-decoration: underline;">Tanda Tangan &amp; Cap Perusahaan</div>
          </td>
        </tr>
      </table>
    `;

    printDocument(content, `Bukti Potong PPh 21 - ${data.nama || 'ACCUTAX'}`);
  }

  /**
   * Cetak Bukti Potong PPh 23
   */
  function printPPh23(data) {
    if (!data) return;
    const now = new Date();

    const content = `
      <div style="border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 8px;">
        <table style="border: none;">
          <tr>
            <td style="width: 20%; border: none; text-align: center;">
              <img src="assets/images/branding/logo-djp.png" style="width: 75px; height: auto;" alt="Logo DJP">
            </td>
            <td style="border: none; text-align: center;">
              <div style="font-size: 11pt; font-weight: bold;">DIREKTORAT JENDERAL PAJAK</div>
              <div style="font-size: 12pt; font-weight: bold; margin-top: 2px;">BUKTI PEMOTONGAN PAJAK PENGHASILAN PASAL 23</div>
              <div style="font-size: 10pt; color: #555;">(BUPOT UNIFIKASI PASAL 23)</div>
            </td>
            <td style="width: 25%; border: 1px solid #000; padding: 6px; font-size: 8pt;">
              <div>Tahun Pajak: ${now.getFullYear()}</div>
              <div>Masa Pajak: ${String(now.getMonth() + 1).padStart(2, '0')}</div>
            </td>
          </tr>
        </table>
      </div>

      <div class="bg-header" style="padding: 4px 8px; margin-bottom: 4px;">A. IDENTITAS PIHAK YANG DIPOTONG</div>
      <table style="margin-bottom: 8px;">
        <tr><td style="width: 30%;"><strong>NPWP / NIK:</strong></td><td>${data.npwp || '00.000.000.0-000.000'}</td></tr>
        <tr><td><strong>Nama Rekanan / WP:</strong></td><td>${(data.nama || 'REKANAN / WAJIB PAJAK').toUpperCase()}</td></tr>
        <tr><td><strong>Status NPWP:</strong></td><td>${data.statusNPWP === 'ada' ? 'Memiliki NPWP (Tarif Standar)' : 'Tanpa NPWP (+100%)'}</td></tr>
      </table>

      <div class="bg-header" style="padding: 4px 8px; margin-bottom: 4px;">B. RINCIAN OBJEK DAN PEMOTONGAN PPh PASAL 23</div>
      <table style="margin-bottom: 8px;">
        <tr class="bg-sub">
          <th>KODE &amp; JENIS PENGHASILAN</th>
          <th style="width: 22%;">JUMLAH BRUTO</th>
          <th style="width: 14%;">TARIF (%)</th>
          <th style="width: 24%;">PPh 23 DIPOTONG</th>
        </tr>
        <tr>
          <td>
            <div class="font-bold">${data.objekLabel}</div>
            <div style="font-size: 8pt; color: #555;">${data.deskripsi || ''}</div>
          </td>
          <td class="text-right font-bold">${formatIDR(data.dpp)}</td>
          <td class="text-center font-bold">${data.tarifPersen}%</td>
          <td class="text-right font-bold" style="color: #881337;">${formatIDR(data.pph23)}</td>
        </tr>
      </table>

      <div class="bg-header" style="padding: 4px 8px; margin-bottom: 4px;">C. LEMBAR PENGESAHAN PEMOTONG</div>
      <table>
        <tr>
          <td style="width: 60%;">
            <div><strong>Jumlah Kas Bersih Dibayarkan:</strong> ${formatIDR(data.kasDiterimaRekanan)}</div>
            <div style="margin-top: 4px; font-size: 8pt;">Metode Pajak: ${data.metode === 'gross-up' ? 'Gross-Up (Ditanggung Pemotong)' : 'Gross (Dipotong dari Nilai Kontrak)'}</div>
          </td>
          <td style="text-align: center;">
            <div>Tanggal: ${now.toLocaleDateString('id-ID')}</div>
            <div style="margin-top: 35px; font-weight: bold; text-decoration: underline;">Pemotong Pajak Berwenang</div>
          </td>
        </tr>
      </table>
    `;

    printDocument(content, `Bukti Potong PPh 23 - ${data.nama || 'ACCUTAX'}`);
  }

  /**
   * Cetak Lembar Analisis PPN / PPh Final UMKM
   */
  function printTaxSummary(title, summaryData, steps = []) {
    const now = new Date();
    const rowsHtml = steps.map((s, idx) => `
      <tr>
        <td class="text-center">${idx + 1}</td>
        <td>${s.label}</td>
        <td class="text-right font-bold">${typeof s.value === 'number' ? formatIDR(s.value) : s.value}</td>
      </tr>
    `).join('');

    const content = `
      <div style="border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px; text-align: center;">
        <h2 style="margin: 0; font-size: 14pt; color: #881337;">ACCUTAX ENTERPRISE TAX REPORT</h2>
        <div style="font-size: 11pt; font-weight: bold; margin-top: 4px;">${title.toUpperCase()}</div>
        <div style="font-size: 9pt; color: #555;">Tanggal Perhitungan: ${now.toLocaleString('id-ID')}</div>
      </div>

      <div class="bg-header" style="padding: 4px 8px; margin-bottom: 4px;">RINCIAN KALKULASI &amp; PERATURAN PERPAJAKAN BERLAKU</div>
      <table style="margin-bottom: 12px;">
        <tr class="bg-sub">
          <th style="width: 8%;">NO</th>
          <th>KOMPONEN KALKULASI</th>
          <th style="width: 35%;">NILAI / KETERANGAN</th>
        </tr>
        ${rowsHtml}
      </table>

      <div style="border: 1px solid #cbd5e1; background: #f8fafc; padding: 10px; border-radius: 6px; font-size: 8.5pt; color: #334155;">
        <strong>Catatan Regulasi:</strong> Hasil kalkulasi ini dihitung berdasarkan Undang-Undang Harmonisasi Peraturan Perpajakan (UU HPP No. 7/2021) dan peraturan turunan terbaru. Dokumen ini dapat digunakan sebagai lembar kerja rekonsiliasi fiskal dan perencanaan pembayaran pajak Anda.
      </div>
    `;

    printDocument(content, title);
  }

  return {
    formatIDR,
    printPPh21,
    printPPh23,
    printTaxSummary
  };
})();
