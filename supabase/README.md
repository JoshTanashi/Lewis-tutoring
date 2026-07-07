# Supabase backend

Project: **lewis-tutoring** (`uatzbulkyoyuntghqcno`, region `eu-west-1`).

## Migration history (authoritative copy lives in the project)

Applied via the Supabase MCP; pull locally any time with `supabase db pull`:

| Version | Name |
| --- | --- |
| 20260706172157 | core_identity — roles, profiles, students, subjects, enrollments, RLS helpers, signup trigger |
| 20260706172216 | scheduling — availability_slots, lessons, attendance |
| 20260706172237 | private_lesson_notes — tutor-only notes table (staff-only RLS) |
| 20260706172304 | academics — homework (+submissions), assessments, badges, streaks, journey_events + auto-journal triggers |
| 20260706172324 | money — packages, invoices (LT-YYYY-NNNN autonumber), payments (raw ITN ledger), waitlist |
| 20260706172344 | comms_audit_settings — messages, announcements, motivational_messages, audit_logs + triggers, settings |
| 20260707051101 | kpi_views — v_admin_kpis, v_monthly_revenue, v_student_overview, v_subject_performance (security_invoker) |
| 20260707051126 | seed_catalog — subjects, packages, badges, availability template, settings, motivational messages |
| 20260707051231 | rpcs — join_waitlist (anon), create_invoice_for_package (server-side pricing + sibling discount) |
| 20260707051543 | lockdown_function_grants — least-privilege EXECUTE on SECURITY DEFINER functions |

## Edge functions (`supabase/functions/`)

| Function | JWT | Purpose |
| --- | --- | --- |
| `auth-signup` | no | Parent signup with auto-confirmed email (no SMTP needed) |
| `create-kid` | yes | Parent creates a kid login (username + 6-digit PIN → `<username>@kids.lewistutoring.co.za`) |
| `payfast-itn` | no | PayFast payment webhook: logs every ITN raw, then signature → postback → amount checks before marking the invoice paid |

Live PayFast credentials go in edge function secrets (`PAYFAST_MODE=live`,
`PAYFAST_PASSPHRASE=...`) — sandbox defaults are baked in for testing.

## Security model (RLS)

- `parent` sees/edits only their own family; can book lessons (`scheduled` only) and buy packages via RPC (price always computed server-side).
- `student` (kid login) sees only themself: lessons, homework, badges, streaks, journey.
- `tutor` sees all students, grades, finances; cannot touch settings/audit.
- `super_admin` (Michaela + Joshua, assigned by email at signup) sees everything, incl. audit logs and settings.
- Roles can only be changed by a super admin (enforced by trigger), never self-assigned.
- Payments table is written exclusively by the service role in the ITN webhook.
