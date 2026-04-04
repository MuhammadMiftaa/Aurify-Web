# 💰 Issue: Money Flow — Budget (Full-Stack Integration)

> **Label:** `feature` `fullstack` `budget` `money-flow`
> **Priority:** High
> **Scope:** Protobuf + Transaction Service + BFF + Web frontend

---

## 📋 Overview

Mengintegrasikan halaman **Budget** (Money Flow) yang saat ini menggunakan mock data (`getDummyBudgets` dari `dummy-data.ts`) menjadi fully connected ke backend melalui BFF → Transaction Service. Fitur ini memungkinkan user untuk:

- Membuat budget **overall** atau **per kategori**, scoped ke **all wallet** atau **spesifik wallet**
- Memonitor progress spending terhadap budget limit **per bulan**
- Tracking **streak** — jumlah bulan berturut-turut di bawah budget
- CRUD operations: create, update, reset, delete budget
- Refresh cache untuk mendapat data terbaru

### Analisis Existing Infrastructure

Setelah menganalisis codebase saat ini:

- **Transaction Service** (Go + PostgreSQL) sudah punya akses ke data transaksi — ideal untuk menghitung `current_spent` secara real-time
- **Protobuf** `transaction.proto` memerlukan RPC dan message baru untuk Budget domain
- **BFF** memerlukan handler baru + route group `/budgets` dengan Redis cache layer mengikuti pattern `transactionHandler`
- **Frontend** `BudgetPage.tsx` sudah fully styled, hanya perlu migrasi dari `getDummyBudgets()` ke custom hook pattern

**Kesimpulan:** Diperlukan perubahan di semua layer:
1. Protobuf: Tambah RPC dan messages untuk Budget
2. Transaction Service: Tabel baru + repository + service + gRPC handler
3. BFF: Handler baru + cache keys + routes + DTOs + log constants
4. Web: Custom hook + migrasi page + API functions + types + tests

---

## ✅ Task Breakdown

### 1. Protobuf — Tambah Budget RPC & Messages

**File:** `protobuf/transaction/transaction.proto`

Tambahkan definisi baru untuk Budget domain di proto file:

**RPC baru di `TransactionService`:**
- `GetBudgets` — list semua budget user untuk period tertentu
- `CreateBudget` — buat budget baru (overall / per kategori)
- `UpdateBudget` — update budget limit (streak reset ke 0)
- `DeleteBudget` — hapus budget (streak reset ke 0)
- `ResetBudget` — reset current_spent tanpa mengubah limit

**Messages baru:**
- `Budget` — response message (id, scope, category_id, category_name, wallet_scope, wallet_id, wallet_name, monthly_limit, current_spent, period, streak_count, streak_active)
- `GetBudgetsRequest` — filter (period/year-month)
- `GetBudgetsResponse` — repeated Budget
- `CreateBudgetRequest` — scope, category_id, wallet_id, monthly_limit, period
- `UpdateBudgetRequest` — id, monthly_limit
- `BudgetID` — id string

**Setelah perubahan:**
- Generate ulang proto files menggunakan `./generate.sh transaction all`
- Commit dan push ke protobuf repository
- Tag versi baru berdasarkan latest tag (semver increment)
- Update `go.mod` dependency di transaction-service dan bff

---

### 2. Transaction Service — Database: Migrasi & Model

**Migration baru:** Buat migration file via `make migration name=create_budget_tables`

Tabel `user_budgets`:
| Column | Type | Constraint |
|---|---|---|
| id | UUID | PK, default uuid_generate_v4() |
| user_id | UUID | NOT NULL, INDEX |
| scope | VARCHAR(20) | NOT NULL (overall/category) |
| category_id | UUID | NULLABLE, FK → categories(id) |
| wallet_id | UUID | NULLABLE (null = all wallets) |
| monthly_limit | DECIMAL(18,2) | NOT NULL |
| period | VARCHAR(7) | NOT NULL (format: YYYY-MM) |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |
| deleted_at | TIMESTAMP | NULLABLE (soft delete) |

Unique constraint: `(user_id, scope, category_id, wallet_id, period)` — mencegah duplikasi budget pada scope yang sama.

Tabel `budget_streaks`:
| Column | Type | Constraint |
|---|---|---|
| id | UUID | PK, default uuid_generate_v4() |
| user_id | UUID | NOT NULL, INDEX |
| budget_id | UUID | NOT NULL, FK → user_budgets(id) |
| streak_count | INTEGER | DEFAULT 0 |
| streak_active | BOOLEAN | DEFAULT false |
| last_evaluated_period | VARCHAR(7) | NULLABLE |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

**Model files baru:** `internal/types/model/budgets.go`
- `UserBudgets` struct — mengikuti pattern `Base` + fields sesuai tabel
- `BudgetStreaks` struct — mengikuti pattern `Base` + fields sesuai tabel

---

### 3. Transaction Service — Repository Layer

**File baru:** `internal/repository/budgets.go`

Implementasi repository interface dan functions mengikuti pattern dari `transactions.go`:
- `GetBudgetsByUserIDAndPeriod(userID, period)` — query user_budgets + join budget_streaks + hitung current_spent dari transaksi bulan tersebut
- `CreateBudget(budget)` — insert ke user_budgets + create budget_streaks entry
- `UpdateBudget(id, monthlyLimit)` — update limit + reset streak ke 0
- `DeleteBudget(id)` — soft delete budget + reset streak
- `ResetBudget(id)` — tidak ada perubahan di tabel budget, hanya mengembalikan response terbaru

**Catatan penting untuk `current_spent`:** Nilai `current_spent` **tidak disimpan di tabel** — dihitung secara real-time dari tabel `transactions` berdasarkan `user_id`, `period` (bulan/tahun), `wallet_id` (jika scoped), dan `category_id` (jika per-kategori) menggunakan `SUM(amount) WHERE category_type = 'expense'`.

---

### 4. Transaction Service — Service Layer

**File baru:** `internal/service/budgets.go`

Implementasi business logic mengikuti pattern dari `transactions.go`:
- `GetBudgets(userID, period)` — panggil repository, map ke proto response
- `CreateBudget(req)` — validasi (no duplikat scope+category+wallet+period), insert via repository
- `UpdateBudget(req)` — validasi ownership, update via repository, streak reset
- `DeleteBudget(id)` — validasi ownership, soft delete via repository
- `ResetBudget(id)` — validasi ownership, response saja (current_spent dihitung real-time)

**Unit test:** `internal/service/budgets_test.go` — mengikuti pattern mock dari `service/mocks/` dan assertion style dari `transactions_test.go`

---

### 5. Transaction Service — gRPC Handler

**File:** `interface/grpc/server/transaction.go`

Tambahkan handler methods baru untuk Budget RPCs:
- `GetBudgets(ctx, req)` — parse request, panggil service, return response
- `CreateBudget(ctx, req)` — parse + validate, panggil service
- `UpdateBudget(ctx, req)` — parse + validate, panggil service
- `DeleteBudget(ctx, req)` — parse, panggil service
- `ResetBudget(ctx, req)` — parse, panggil service

Ikuti pattern error handling dan logging dari handler yang sudah ada di file ini.

---

### 6. BFF — gRPC Client Extension

**File:** `interface/grpc/client/transaction.go`

Tambahkan methods baru di `TransactionClient` interface dan `transactionClientImpl`:
- `GetBudgets(ctx, req)` — timeout 10s
- `CreateBudget(ctx, req)` — timeout 15s
- `UpdateBudget(ctx, req)` — timeout 15s
- `DeleteBudget(ctx, req)` — timeout 10s
- `ResetBudget(ctx, req)` — timeout 10s

Mengikuti pattern `GetUserTransactions`, `CreateTransaction`, dll yang sudah ada.

---

### 7. BFF — HTTP Handler & Routes

**File baru:** `interface/http/handler/budget.go`

Buat `budgetHandler` struct mengikuti pattern `transactionHandler`:
- Inject `TransactionClient` + `WalletClient` + `Cache`
- `GetBudgets` — GET `/budgets?period=2026-03`, cache dengan key `BudgetList(userID, period)`
- `CreateBudget` — POST `/budgets`, parse body, panggil gRPC, invalidate budget cache
- `UpdateBudget` — PUT `/budgets/:id`, parse body, panggil gRPC, invalidate cache
- `DeleteBudget` — DELETE `/budgets/:id`, panggil gRPC, invalidate cache
- `ResetBudget` — POST `/budgets/:id/reset`, panggil gRPC, invalidate cache

**File baru:** `interface/http/routes/budgets.go`

Route group `/budgets` dengan `AuthMiddleware()`:
```
GET    /budgets          → GetBudgets
POST   /budgets          → CreateBudget
PUT    /budgets/:id      → UpdateBudget
DELETE /budgets/:id      → DeleteBudget
POST   /budgets/:id/reset → ResetBudget
```

---

### 8. BFF — Cache Keys, DTOs, Log Constants

**File:** `internal/cache/key_builder.go`

Tambahkan cache key builders:
- `BudgetList(userID, period)` — `"budget:{userID}:list:{period}"`
- `BudgetAllPattern(userID)` — `"budget:{userID}:*"` untuk invalidation

**File:** `internal/types/dto/dto.go`

Tambahkan DTOs:
- `CreateBudgetRequest` — scope, category_id, wallet_id, monthly_limit, period
- `UpdateBudgetRequest` — monthly_limit

**File:** `internal/utils/data/log.go`

Tambahkan log constants:
- `BudgetService = "budget"`
- `LogGetBudgetsFailed`, `LogCreateBudgetFailed`, `LogUpdateBudgetFailed`, `LogDeleteBudgetFailed`, `LogResetBudgetFailed`

**File:** `internal/utils/data/constant.go`

Tambahkan error constants:
- `ErrBudgetRequired = "Budget ID is required"`

**File:** `interface/http/handler/cache.go`

Tambahkan `"budget"` case di `invalidationsForService()` dan `allServices` slice, serta update error message validation string.

---

### 9. Web — Types

**File baru:** `src/types/budget.ts`

Pindahkan dan perluas `BudgetItem` type dari `dummy-data.ts`:
```ts
export interface BudgetItem {
  id: string;
  scope: "overall" | "category";
  category_id?: string;
  category_name?: string;
  wallet_scope: "all" | string;
  wallet_id?: string;
  wallet_name?: string;
  monthly_limit: number;
  current_spent: number;
  period: string;
  streak_count: number;
  streak_active: boolean;
}

export interface CreateBudgetPayload { ... }
export interface UpdateBudgetPayload { ... }
```

---

### 10. Web — API Layer

**File baru:** `src/lib/budget-api.ts`

Buat budget API functions mengikuti pattern dari `wallet-transaction-api.ts` (menggunakan `bffCall` helper):
- `fetchBudgets(token, period)` — GET `/budgets?period=...`
- `createBudget(token, payload)` — POST `/budgets`
- `updateBudget(token, id, payload)` — PUT `/budgets/:id`
- `deleteBudget(token, id)` — DELETE `/budgets/:id`
- `resetBudget(token, id)` — POST `/budgets/:id/reset`

---

### 11. Web — Custom Hook `useBudget`

**File baru:** `src/hooks/useBudget.ts`

Buat custom hook mengikuti pattern dari `useWallet.ts` dan `useTransaction.ts`:
- `useBudgetList(period)` — fetch budgets, return `AsyncState<BudgetItem[]>` + `refetch()`
  - Demo mode: return `getDummyBudgets()` saat `isDemo === true`
  - Live mode: fetch via `fetchBudgets(token, period)`
- `useBudgetMutations()` — return `{ createBudget, updateBudget, deleteBudget, resetBudget }` functions
  - Setiap mutation menampilkan toast success/error mengikuti pattern yang ada
  - Invalidate cache setelah mutation berhasil

Ikuti pola `useAuth()` + `useDemo()`, `fetchRef` pattern, dan error handling dari hooks yang sudah ada.

---

### 12. Web — Integrasi `BudgetPage.tsx`

**File:** `src/pages/BudgetPage.tsx`

Migrasi dari dummy data ke hook baru:
- Ganti `getDummyBudgets()` + `useMemo` dengan `useBudgetList(selectedPeriod)`
- Ganti simulated loading (`setTimeout`) dengan loading state dari hook
- Modal submit handlers: ganti `toast("Demo mode")` dengan mutation calls dari `useBudgetMutations()`
  - Demo mode: tetap tampilkan toast demo via modal `onSubmit` check `isDemo`
  - Live mode: panggil actual API (create/update/delete/reset)
- Tambahkan refresh button di header (mengikuti pattern halaman lain)
  - Panggil `refreshCache("budget", token)` dari `cache-api.ts` + `refetch()`
- Wallet dropdown di `SetBudgetForm`: gunakan `useWalletList()` hook yang sudah ada
- Category dropdown: gunakan `useCategories()` hook yang sudah ada (dari `useTransaction.ts`)
- Period selector: kirim sebagai parameter ke `useBudgetList()`

---

### 13. Web — Playwright E2E Test

**File baru:** `tests/budget.spec.ts`

Tambahkan E2E test mengikuti pattern dari `tests/auth.spec.ts`:
- Test navigasi ke `/budget` dari sidebar
- Test overall budget card terrender dengan progress bar
- Test streak panel terrender (active/inactive state)
- Test category budget cards terrender dalam grid
- Test modal "Set Budget" terbuka dan form elements visible
- Test modal "Reset Budget" confirmation dialog
- Test modal "Delete Budget" confirmation dialog
- Test responsive view (desktop grid vs mobile stack)

---

### 14. BFF & Transaction Service — Unit Tests

**Transaction Service:**
- `internal/service/budgets_test.go` — test GetBudgets, CreateBudget, UpdateBudget, DeleteBudget, ResetBudget
- Ikuti pattern mock dari `service/mocks/` dan assertion style yang ada
- Test case: validasi duplikat, ownership check, streak reset behavior

**BFF:**
- Verifikasi handler mengikuti pattern yang sudah ada (tidak perlu test file terpisah jika mengikuti existing pattern 1:1)

---

## 📐 Data Flow

```
BudgetPage.tsx
  └── useBudgetList(period)
        ├── [Demo mode] → getDummyBudgets()
        └── [Live mode] → fetchBudgets(token, period)
                            └── GET ${BFF}/budgets?period=2026-03
                                  └── BFF handler.GetBudgets()
                                        ├── Redis cache check
                                        └── gRPC → Transaction Service
                                              └── service.GetBudgets(userID, period)
                                                    └── PostgreSQL query
                                                          ├── user_budgets (config)
                                                          ├── budget_streaks (streak data)
                                                          └── transactions (SUM current_spent)
```

**Mutation flow (Create/Update/Delete/Reset):**
```
BudgetPage.tsx → Modal Submit
  └── useBudgetMutations()
        ├── [Demo mode] → toast("Demo mode — data is read-only")
        └── [Live mode] → API call (POST/PUT/DELETE)
                            └── BFF handler → gRPC → Transaction Service
                                  └── Service logic + cache invalidation
                                        └── refetch() budget list
```

---

## 🔗 File Dependencies Map

| Layer | File | Action |
|---|---|---|
| **Protobuf** | `protobuf/transaction/transaction.proto` | **MODIFY** — tambah Budget RPCs & messages |
| **Protobuf** | `protobuf/transaction/*.pb.go, *_pb.js, etc.` | **REGENERATE** — via `generate.sh` |
| **TX Service — Model** | `internal/types/model/budgets.go` | **NEW** — Budget & Streak models |
| **TX Service — Migration** | `config/db/migrations/xxx_create_budget_tables.sql` | **NEW** — DDL tabel |
| **TX Service — Repo** | `internal/repository/budgets.go` | **NEW** — Budget repository |
| **TX Service — Service** | `internal/service/budgets.go` | **NEW** — Budget business logic |
| **TX Service — Service Test** | `internal/service/budgets_test.go` | **NEW** — unit tests |
| **TX Service — gRPC** | `interface/grpc/server/transaction.go` | **MODIFY** — tambah Budget handlers |
| **BFF — gRPC Client** | `interface/grpc/client/transaction.go` | **MODIFY** — tambah Budget methods |
| **BFF — Handler** | `interface/http/handler/budget.go` | **NEW** — Budget HTTP handlers |
| **BFF — Routes** | `interface/http/routes/budgets.go` | **NEW** — Budget route group |
| **BFF — Cache** | `internal/cache/key_builder.go` | **MODIFY** — tambah Budget keys |
| **BFF — Cache Handler** | `interface/http/handler/cache.go` | **MODIFY** — tambah "budget" service |
| **BFF — DTOs** | `internal/types/dto/dto.go` | **MODIFY** — tambah Budget DTOs |
| **BFF — Logs** | `internal/utils/data/log.go` | **MODIFY** — tambah Budget log constants |
| **BFF — Constants** | `internal/utils/data/constant.go` | **MODIFY** — tambah Budget error constant |
| **Web — Types** | `src/types/budget.ts` | **NEW** — Budget type definitions |
| **Web — API** | `src/lib/budget-api.ts` | **NEW** — Budget API functions |
| **Web — Hook** | `src/hooks/useBudget.ts` | **NEW** — Budget custom hook |
| **Web — Page** | `src/pages/BudgetPage.tsx` | **MODIFY** — migrasi dummy → hook |
| **Web — Dummy Data** | `src/lib/dummy-data.ts` | **KEEP** — tetap ada untuk demo mode |
| **Web — Test** | `tests/budget.spec.ts` | **NEW** — E2E test |

---

## 🎨 Catatan Frontend

- BudgetPage sudah fully styled (hitam-emas, responsive, progress bars, streak panel dengan green fire SVG, modal system)
- Perubahan utama di data layer: mengganti inline dummy data dengan hook call
- Komponen `BudgetSkeleton`, `BudgetProgressBar`, `StreakPanel`, `BudgetCategoryCard`, `Modal`, `SetBudgetForm`, `ConfirmDialog` **tidak perlu diubah strukturnya**
- `SetBudgetForm` perlu penambahan: wallet dropdown dari `useWalletList()` dan category dropdown dari `useCategories()`
- Tambahkan refresh button di header mengikuti pattern halaman lain
- Demo mode: semua mutation menampilkan toast read-only, list tetap dari dummy data

---

## ⚙️ Urutan Pengerjaan

1. **Protobuf** → define, generate, commit, tag, push
2. **Transaction Service** → update dependency, migration, model, repository, service, gRPC handler, tests
3. **BFF** → update dependency, gRPC client, handler, routes, cache keys, DTOs, log constants, cache handler
4. **Web** → types, API layer, custom hook, page integration, E2E tests

---

## 🧪 Verification Checklist

- [ ] Proto file valid dan berhasil di-generate untuk Go, Node.js, PHP
- [ ] Migration berhasil membuat tabel `user_budgets` dan `budget_streaks`
- [ ] Transaction Service: GetBudgets mengembalikan data dengan current_spent yang dihitung dari transaksi
- [ ] Transaction Service: CreateBudget berhasil + streak entry dibuat
- [ ] Transaction Service: UpdateBudget berhasil + streak reset ke 0
- [ ] Transaction Service: DeleteBudget soft-delete berhasil
- [ ] Transaction Service: ResetBudget mengembalikan data fresh
- [ ] BFF: Endpoint `/budgets` berfungsi dengan Redis cache
- [ ] BFF: Cache invalidation bekerja saat mutation + saat refresh via `/cache/refresh?service=budget`
- [ ] Web: Budget page menampilkan data dari backend saat login user real
- [ ] Web: Demo mode tetap berfungsi dengan dummy data
- [ ] Web: CRUD modals berfungsi (create, edit, reset, delete)
- [ ] Web: Refresh button menghapus cache dan memuat data terbaru
- [ ] Web: Period selector memfilter budget per bulan
- [ ] Web: Loading skeleton muncul saat fetching
- [ ] Web: Error state ditampilkan jika request gagal
- [ ] Semua unit test + E2E test pass
- [ ] Tidak ada console error atau warning
- [ ] Logging di setiap layer menggunakan konstanta yang sudah didefinisikan
