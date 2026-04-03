# 🗂️ Issue: Money Flow — Categories (Full-Stack Integration)

> **Label:** `feature` `fullstack` `categories` `money-flow`
> **Priority:** High
> **Scope:** Web frontend + BFF + Analytics Service + Protobuf (jika diperlukan)

---

## 📋 Overview

Mengintegrasikan halaman **Categories** (Money Flow) yang saat ini menggunakan mock data (`getDummyCategoryBreakdown` dari `dummy-data.ts`) menjadi fully connected ke backend melalui BFF → Analytics Service. Fitur ini menampilkan **semua** kategori income/expense (tidak terbatas 5 seperti dashboard), dengan filter by wallet, date range, sorting, dan pagination.

### Analisis Existing Infrastructure

Setelah menganalisis codebase saat ini:

- **Analytics Service** sudah punya endpoint `getUserTransaction` yang mengembalikan **semua** kategori (tanpa `$limit`) — sudah support filter `wallet_id` dan `date_option` (exact date, date range, year/month/day)
- **Protobuf** `GetUserTransactionsRequest` dan `GetUserTransactionsResponse` sudah memadai — field `category_type` sudah ada di response `TransactionCategory`
- **BFF** sudah punya handler `GetUserTransactions` (`POST /dashboard/transactions`) dengan Redis cache
- **Frontend** memfilter `category_type` (income/expense) secara client-side di `useDashboard.ts` — ini pattern yang sudah terbukti
- **Protobuf sudah cukup** — tidak perlu menambah RPC atau field baru, karena endpoint dan response existing sudah cover kebutuhan Categories

**Kesimpulan:** Tidak perlu perubahan di protobuf maupun analytics service. Yang diperlukan hanya:
1. Web: Migrasi dari dummy data ke real API call
2. BFF: Sudah memiliki endpoint yang diperlukan (reuse `/dashboard/transactions`)
3. Tests: Update untuk merefleksikan integrasi baru

---

## ✅ Task Breakdown

### 1. Web — Custom Hook `useCategories`

**File baru:** `src/hooks/useCategories.ts`

Buat custom hook baru mengikuti pattern dari `useDashboard.ts` (`useTransactions` hook):
- Accept parameter: `GlobalFilter` (walletID, range) + `categoryType` (income/expense)
- Reuse `fetchUserTransactions` dari `dashboard-api.ts` — endpoint yang sama dengan dashboard
- Demo mode: Tetap gunakan dummy data dari `getDummyCategoryBreakdown` saat `isDemo === true`
- Live mode: Fetch via `fetchUserTransactions`, filter response by `category_type` client-side, lalu hitung `percentage` per kategori
- Return type: `AsyncState<CategoryBreakdownItem[]>` + `refetch()`
- Ikuti pola `useAuth()` + `useDemo()`, `fetchRef` pattern, dan error handling dari hooks yang sudah ada

**Catatan:** Hook ini pada dasarnya meng-extend logika `useTransactions` namun memperkaya response dengan menghitung `percentage` dan meng-map ke tipe `CategoryBreakdownItem` yang sudah dipakai di `CategoriesPage.tsx`

---

### 2. Web — Integrasi `CategoriesPage.tsx` dengan Hook Baru

**File:** `src/pages/CategoriesPage.tsx`

Migrasi dari dummy data ke hook baru:
- Ganti `getDummyCategoryBreakdown(categoryTab)` dengan `useCategories(filter, categoryTab)`
- Implement `GlobalFilter` state (walletID dari dropdown, dateRange dari date inputs) — pattern sama seperti `DashboardPage`
- Gunakan `loading` state dari hook untuk menampilkan `CategoriesSkeleton`
- Gunakan `error` state untuk menampilkan error message
- Hapus simulated loading (`setTimeout`) karena loading state sekarang berasal dari hook
- Wallet dropdown: Gunakan `useWallets()` hook yang sudah ada (dari `useDashboard.ts`) untuk populate dropdown secara real-time, bukan dari `DUMMY_DASHBOARD_WALLETS`
- Date range: Kirim sebagai filter ke hook

---

### 3. Web — Update Types (jika perlu)

**File:** `src/types/dashboard.ts`

Periksa apakah tipe `TransactionCategory` dan tipe yang sudah ada cukup untuk kebutuhan Categories page. Tipe `CategoryBreakdownItem` saat ini di-define di `dummy-data.ts` — pertimbangkan untuk memindahkannya ke `types/` agar lebih clean, atau cukup derive dari `TransactionCategory` yang sudah ada di hook.

---

### 4. Web — Playwright E2E Test

**File:** `tests/categories.spec.ts`

Tambahkan E2E test mengikuti pattern dari `tests/auth.spec.ts`:
- Test navigasi ke `/categories` dari sidebar
- Test toggle antara expense/income tab
- Test bahwa table/card menampilkan data (minimal section terrender)
- Test filter wallet dropdown dan date range berfungsi tanpa error
- Test sorting header (amount, transactions) memicu perubahan urutan
- Test responsive view (desktop table vs mobile cards)

---

### 5. BFF — Verifikasi & Sesuaikan Handler (jika diperlukan)

**File:** `interface/http/handler/dashboard.go`

Endpoint `POST /dashboard/transactions` **sudah ada** dan sudah berfungsi. Verifikasi bahwa:
- Request body dari frontend (dengan `walletID` dan `dateOption.range`) ter-parse dengan benar
- Response mengembalikan semua kategori (bukan top-5)
- Redis cache key (`DashboardTransactions`) bekerja dengan benar untuk variasi filter baru
- Logging menggunakan konstanta dari `data/log.go`

**Jika BFF sudah benar:** Tidak ada perubahan yang diperlukan — cukup tulis test untuk memvalidasi.

---

### 6. BFF — Unit Test Handler Dashboard

**Direktori:** Tambahkan test file sesuai pattern Go test yang digunakan project (periksa apakah sudah ada `_test.go` di handler directory)

Test `GetUserTransactions` handler:
- Test parse request body dengan berbagai variasi filter (walletID, dateOption.range, dateOption.year/month)
- Test cache hit scenario (return cached response)
- Test cache miss → gRPC call → cache set
- Test error handling (gRPC error → mapped HTTP error)
- Ikuti pattern test yang sudah ada di project

---

### 7. Analytics Service — Verifikasi Query

**File:** `src/service.ts` → `getUserTransaction()`

Fungsi ini **sudah mengembalikan semua kategori** (tidak ada `$limit`). Verifikasi:
- Query aggregation pipeline mengembalikan semua kategori (tidak ada limit)
- Filter `walletID` dan `dateOption` bekerja sesuai spesifikasi
- Response format sesuai dengan yang diharapkan frontend setelah melalui gRPC transformation

**Jika sudah benar:** Tidak perlu perubahan — existing test suite (`__tests__/getUserTransaction.test.ts`) sudah cover skenario ini.

---

### 8. Analytics Service — Tambah Test Scenario (jika perlu)

**File:** `src/__tests__/getUserTransaction.test.ts`

Periksa test yang sudah ada dan tambahkan test case yang mungkin belum ter-cover:
- Test response mengembalikan kedua tipe kategori (income + expense) dalam satu response
- Test bahwa tidak ada limit pada jumlah kategori yang dikembalikan
- Test kombinasi filter wallet + date range
- Ikuti pattern mock (`jest.unstable_mockModule`) dan assertion yang sudah ada

---

## 📐 Data Flow

```
CategoriesPage.tsx
  └── useCategories(filter, categoryType)
        ├── [Demo mode] → getDummyCategoryBreakdown(type)
        └── [Live mode] → fetchUserTransactions(token, { walletID, dateOption })
                            └── POST ${BFF}/dashboard/transactions
                                  └── BFF handler.GetUserTransactions()
                                        ├── Redis cache check
                                        └── gRPC → Analytics Service
                                              └── service.getUserTransaction()
                                                    └── MongoDB aggregation (all categories)
```

---

## 🔗 File Dependencies Map

| Layer | File | Action |
|---|---|---|
| **Web — Hook** | `src/hooks/useCategories.ts` | **NEW** — custom hook untuk categories |
| **Web — Page** | `src/pages/CategoriesPage.tsx` | **MODIFY** — ganti dummy → hook |
| **Web — Types** | `src/types/dashboard.ts` | **VERIFY** — pastikan tipe cukup |
| **Web — API** | `src/lib/dashboard-api.ts` | **REUSE** — `fetchUserTransactions()` sudah ada |
| **Web — Test** | `tests/categories.spec.ts` | **NEW** — E2E test |
| **BFF — Handler** | `interface/http/handler/dashboard.go` | **VERIFY** — pastikan endpoint benar |
| **BFF — Test** | handler test file | **NEW/EXTEND** — test handler |
| **Analytics — Service** | `src/service.ts` | **VERIFY** — pastikan query benar |
| **Analytics — Test** | `src/__tests__/getUserTransaction.test.ts` | **EXTEND** — tambah test case |

---

## 🎨 Catatan Frontend

- CategoriesPage sudah fully styled (hitam-emas, responsive, sort headers, mobile cards)
- Perubahan hanya di data layer: mengganti inline dummy data dengan hook call
- Komponen `CategoriesSkeleton`, `SortHeader`, `CategoryCard` tidak perlu diubah
- Filter wallet dropdown perlu dipindahkan dari static `DUMMY_DASHBOARD_WALLETS` ke `useWallets()` hook

---

## 🧪 Verification Checklist

- [ ] Categories page menampilkan data dari backend (bukan dummy) saat login dengan user real
- [ ] Demo mode tetap berfungsi dengan dummy data saat user dalam mode demo
- [ ] Toggle income/expense memfilter data dengan benar
- [ ] Filter wallet dropdown berfungsi (semua wallet + per wallet)
- [ ] Date range filter mengembalikan data sesuai periode yang dipilih
- [ ] Sorting by amount dan transaction count bekerja
- [ ] Loading skeleton muncul saat fetching
- [ ] Error state ditampilkan jika request gagal
- [ ] Redis cache di BFF bekerja (second request lebih cepat)
- [ ] Semua test (E2E, unit) pass
- [ ] Tidak ada console error atau warning
- [ ] Logging di setiap layer menggunakan konstanta yang sudah didefinisikan
