# ✅ Register.tsx Fetch Error FIXED

**Changes Made:**
- api.ts: baseURL '/api' (Vite proxy), fixed register payload, added getCompaniesForSupervisor
- Register.tsx: Replaced direct fetch with authAPI calls

**To Complete:**
1. **Start Backend**: Open new terminal → `cd backend` → `npm run dev`
   Expect:
   ```
   Server running on port 5000
   MongoDB connected
   ```
2. **Start Frontend** (if not): `cd frontend` → `npm run dev` (runs on :3001)
3. **Test**: Register form now uses proxy - no more "Failed to fetch" (if backend up).

**Updated TODO.md complete.**
