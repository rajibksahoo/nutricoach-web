# Assignment & Schedule Visibility — Design

**Date:** 2026-06-11 · **Status:** Approved by user · **Branch:** `feat/assignment-visibility`

## Problem

The workout builder can assign workouts to clients and schedule them for dates, but the UI
only POSTs — there is no way to see who a workout is assigned to, what a client has
scheduled, or to undo either. The backend endpoints for all of this already exist
(`WorkoutAssignmentController` under `/api/v1/library`); this is frontend-only wiring.

Endpoint asymmetry shapes the design: assignments are queryable **per workout**
(`GET /workouts/{id}/assignments`), schedules **per client** (`GET /clients/{id}/schedules`).
Each surface maps 1:1 to its endpoint. No backend changes.

## Design

### 1. API layer — `lib/workout-builder-api.ts`

Four additions in the module's existing style (typed, `ApiEnvelope`-unwrapping):

| Function | Endpoint |
|---|---|
| `listAssignments(workoutId)` | `GET /api/v1/library/workouts/{id}/assignments` |
| `unassignWorkout(workoutId, assignmentId)` | `DELETE /api/v1/library/workouts/{id}/assignments/{assignmentId}` |
| `listClientSchedules(clientId)` | `GET /api/v1/library/clients/{clientId}/schedules` |
| `unscheduleWorkout(scheduleId)` | `DELETE /api/v1/library/schedules/{scheduleId}` |

Types mirror the backend records: `Assignment { id, clientId, workoutId, assignedAt, notes }`,
`Schedule { id, clientId, workoutId, date, notes }`. DTOs carry IDs only — names are joined
client-side from the clients/workouts lists both screens already fetch.

### 2. Assign modal — `workout-builder/_components/assign-schedule-modals.tsx`

On open, `AssignWorkoutModal` fetches assignments for the target workout.

- New **"Currently assigned (N)"** section above the picker: client name (joined from the
  clients prop), assigned date, optional note, ✕ to unassign — optimistic removal + toast,
  refetch on error.
- Already-assigned clients render disabled/"Assigned" in the picker (prevents duplicates).
- Loading: small spinner row. Fetch failure: toast, section hidden.

### 3. Training tab — `components/clients/ClientsScreen.tsx`

Replaces the "coming soon" placeholder for **Training only** (other stub tabs unchanged).

- Lazy-fetches the selected client's schedules + the workout list (once each per session)
  when the tab opens.
- Two groups: **Upcoming** (date ≥ today) and **Past**. Row: workout name, formatted date,
  note, ✕ to unschedule.
- Empty state: "No workouts scheduled yet — schedule one from the Workout Builder."
- Mock-fallback env (no API URL): empty state.
- Styling follows the screen's existing card/token idiom. The design bundle's JSX prototypes
  no longer exist locally and the ported screen stubbed this tab, so the visual reference is
  the surrounding screen itself.

### 4. Error handling & UX

- Toasts on all failures (existing pattern).
- No confirm dialog on unassign/unschedule — both are trivially reversible.
- No fake training stats (`train7/30`, "last workout"): those need completion tracking that
  doesn't exist. Stat slots stay "Not tracked".

## Out of scope

Per-client assignment list (no endpoint), workout completion tracking, schedule editing
(delete + re-create covers it).

## Verification

1. `npx tsc --noEmit` clean.
2. Manual (backend `local` profile + seeded clients): assign a workout → reopen modal →
   listed, picker shows "Assigned"; unassign → gone. Schedule → appears under the client's
   Training tab (Upcoming); unschedule → gone.
