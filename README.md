# Flash Inggris

Aplikasi berbasis web untuk belajar bahasa Inggris menggunakan metode flashcard, kuis, dan terjemahan berbasis AI.

## Fitur dan Fungsi
- **Flashcard**: Menampilkan kata dalam bahasa Inggris dan terjemahannya dalam bahasa Indonesia, lengkap dengan contoh penggunaan.
- **Quiz**: Menguji pemahaman pengguna dengan pilihan soal dari 10 hingga 100 soal.
- **Word List**: Memungkinkan pengguna mencari dan menambahkan kata baru.
- **Terjemahan AI**: Menggunakan API GLHF untuk memberikan terjemahan dan pengucapan yang akurat.
- **Pengaturan**: Memungkinkan pengaturan API Key dan model GLHF.
- **Tanpa Login**: Pengguna dapat langsung menggunakan aplikasi tanpa perlu mendaftar.

## Technology Stack
- **Frontend**: React.js
- **Backend**: Node.js dengan Express
- **Database**: Supabase
- **APIs**: OpenAI (GLHF) untuk terjemahan dan pengucapan

## Prerequisites
Sebelum memulai, pastikan Anda telah menginstal:
- Node.js
- npm (Node Package Manager)
- Supabase account untuk pengaturan database

## Installation Instructions
1. Clone repositori ini:
   ```bash
   git clone https://github.com/bimapopo345/flash-inggris.git
   ```
2. Masuk ke direktori proyek:
   ```bash
   cd flash-inggris
   ```
3. Instal dependensi yang diperlukan:
   ```bash
   npm install
   ```
4. Buat file `.env.local` di root proyek Anda dan tambahkan konfigurasi berikut:
   ```plaintext
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   GLHF_API_KEY=your_glhf_api_key
   ```

## Usage Guide
1. Jalankan server backend:
   ```bash
   node server.js
   ```
2. Jalankan aplikasi frontend:
   ```bash
   npm start
   ```
3. Akses aplikasi melalui browser Anda di `http://localhost:3000`.

## API Documentation
API yang digunakan untuk mendapatkan terjemahan dan pengucapan:
- **Endpoint**: `/api/glhf`
- **Method**: POST
- **Body**:
  ```json
  {
    "prompt": "Your prompt here",
    "model": "hf:meta-llama/Meta-Llama-3.1-405B-Instruct"
  }
  ```
- **Response**:
  ```json
  {
    "message": "AI generated response"
  }
  ```

## Contributing Guidelines
Kontribusi sangat diterima! Jika Anda ingin berkontribusi, silakan lakukan langkah-langkah berikut:
1. Fork repositori ini.
2. Buat cabang baru (`git checkout -b feature-branch`).
3. Lakukan perubahan yang diperlukan.
4. Commit perubahan Anda (`git commit -m 'Add new feature'`).
5. Push ke cabang Anda (`git push origin feature-branch`).
6. Buat pull request.

## License Information
Lisensi untuk proyek ini belum ditentukan. Silakan hubungi pemilik repositori untuk informasi lebih lanjut.

## Contact/Support Information
Jika Anda memiliki pertanyaan atau membutuhkan dukungan, Anda dapat menghubungi:
- [bimapopo345](https://github.com/bimapopo345) di GitHub.
