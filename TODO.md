# TODO - Fix tombol Edit penilaian HR

## Step 1
- Update `frontend/js/components/penilaian.js` agar render tabel penilaian yang sudah di-update benar-benar terlihat berubah.
- Ubah sorting baris per KPI/karyawan agar termasuk `tanggal_penilaian` (mis. DESC) sehingga baris terbaru tampil sesuai.

## Step 2
- Jalankan server dan lakukan uji end-to-end:
  1) login sebagai HR
  2) klik Edit pada salah satu baris penilaian
  3) ubah nilai, klik Simpan
  4) pastikan tabel memperlihatkan nilai terbaru pada baris yang diedit.

