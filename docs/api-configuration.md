# API Configuration dengan Ngrok

Panduan untuk mengkonfigurasi API endpoint menggunakan ngrok atau backend eksternal.

## 🎯 Cara Kerja

Project ini sudah dikonfigurasi untuk support API eksternal melalui environment variable `NEXT_PUBLIC_API_URL`. Jika tidak di-set, akan otomatis menggunakan API route internal Next.js (`/api`).

## 📦 File-File yang Terkait

- **`src/lib/constants.ts`** - Konfigurasi `API_BASE_URL` dan helper `getApiUrl()`
- **`src/lib/api-client.ts`** - API client helper untuk fetch data
- **`.env.local`** - File untuk set environment variable (buat sendiri dari `.env.example`)

## 🚀 Setup Ngrok

### 1. Install Ngrok

```bash
# Download dari https://ngrok.com/download
# Atau via chocolatey (Windows):
choco install ngrok

# Atau via npm:
npm install -g ngrok
```

### 2. Jalankan Backend API

```bash
# Contoh: jika backend di port 8000
python manage.py runserver 8000
# atau
npm run backend:dev
```

### 3. Expose dengan Ngrok

```bash
# Expose backend API port
ngrok http 8000

# Ngrok akan memberikan URL seperti:
# https://abc123.ngrok-free.app
```

### 4. Configure Frontend

Buat file `.env.local` (jika belum ada):

```bash
# Copy dari example
cp .env.example .env.local
```

Edit `.env.local` dan tambahkan:

```env
# Ganti dengan URL ngrok Anda
NEXT_PUBLIC_API_URL=https://abc123.ngrok-free.app/api
```

### 5. Restart Dev Server

```bash
# Stop server (Ctrl+C)
# Lalu jalankan lagi
npm run dev
```

## 💡 Contoh Penggunaan di Code

### Cara 1: Menggunakan API Client Helper

```typescript
import { apiClient } from "@/lib/api-client";

// GET request
const sosialisasi = await apiClient.get("/sosialisasi");

// POST request
const result = await apiClient.post("/sosialisasi", {
  title: "Event Baru",
  date: "2024-01-01"
});
```

### Cara 2: Menggunakan getApiUrl() Manual

```typescript
import { getApiUrl } from "@/lib/constants";

const response = await fetch(getApiUrl("/sosialisasi"));
const data = await response.json();
```

### Cara 3: Di React Hook

```typescript
import { apiClient } from "@/lib/api-client";
import { useEffect, useState } from "react";

export function useSosialisasiData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/sosialisasi")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
```

## 🔧 Konfigurasi Berbagai Skenario

### Development dengan Backend Lokal

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Production dengan Backend Terpisah

```env
# .env.local
NEXT_PUBLIC_API_URL=https://api.klinikpkp.go.id/api
```

### Ngrok untuk Testing

```env
# .env.local
NEXT_PUBLIC_API_URL=https://abc123.ngrok-free.app/api
```

### Default (Internal Next.js API)

```env
# .env.local
# Kosongi atau hapus NEXT_PUBLIC_API_URL
# Akan otomatis gunakan /api route internal
```

## 🔐 Keamanan

1. **JANGAN commit `.env.local`** - file ini sudah ada di `.gitignore`
2. **Gunakan `NEXT_PUBLIC_`** hanya untuk nilai yang aman ditampilkan di browser
3. **API keys sensitif** tidak boleh pakai prefix `NEXT_PUBLIC_`
4. **Ngrok free** memiliki limit request dan session timeout

## 🐛 Troubleshooting

### Error: CORS blocked

Jika menggunakan backend terpisah, pastikan CORS sudah dikonfigurasi di backend:

```python
# Django example
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://abc123.ngrok-free.app",
]
```

### URL tidak berubah setelah set env

Restart dev server setelah mengubah `.env.local`:

```bash
# Ctrl+C untuk stop
npm run dev
```

### Ngrok session expired

Ngrok free memiliki limit session 2 jam. Untuk session permanen, upgrade ke paid plan atau restart ngrok dan update `.env.local` dengan URL baru.

## 📚 Referensi

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Ngrok Documentation](https://ngrok.com/docs)
- [CORS Configuration](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
