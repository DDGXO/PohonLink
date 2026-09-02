# SECURITY.md - Pohonlink

> Security policies, checklist, and sensitive areas.

---

## Sensitive Areas

- **Supabase service_role key**: Server-side only. Never exposed to client.
- **Auth sessions**: Managed by Supabase Auth + middleware refresh.
- **User IPs**: Stored as SHA-256 hash only. Never raw.
- **RLS**: Enforced on all tables. Admin routes verified server-side.
- **Input validation**: All user input sanitized before database queries.

## Security Checklist

### Authentication
- [ ] No hardcoded credentials in source code
- [ ] `.env.local` in `.gitignore`
- [ ] Service role key used only in API routes (server-side)
- [ ] Session refresh in middleware
- [ ] Protected routes redirect to login

### Input Sanitization
- [ ] No raw user input in SQL queries (use parameterized queries)
- [ ] No `dangerouslySetInnerHTML` anywhere
- [ ] URL validation for link creation
- [ ] Username validation (regex: lowercase alphanumeric + underscore + dash, 3-30 chars)
- [ ] Path traversal prevention (no `../` in user input)

### XSS Prevention
- [ ] React auto-escaping verified (no raw HTML rendering)
- [ ] No `javascript:` or `data:` URLs in link hrefs
- [ ] All user URLs prefixed with `https://` if no scheme provided

### Data Protection
- [ ] RLS enabled on all tables
- [ ] Users can only read/update own profile
- [ ] Users can only manage own links
- [ ] Users can only view own analytics
- [ ] Admin routes verify `role = 'admin'` server-side
- [ ] IP stored as SHA-256 hash only

### API Security
- [ ] Consistent JSON response format (`{ status, result/error }`)
- [ ] No HTTP 200 for errors
- [ ] Error messages don't expose internal mechanisms
- [ ] Rate limiting considered for tracking endpoints

### Dependencies
- [ ] `pnpm audit` run before deployment
- [ ] No known high/critical vulnerabilities

## Threat Model

| Threat | Mitigation |
| :--- | :--- |
| SQL Injection | Parameterized queries via Supabase client |
| XSS | React escaping + no raw HTML + URL scheme validation |
| IDOR | RLS policies + server-side auth checks |
| Session Hijacking | Supabase Auth session management + middleware refresh |
| Data Breach | RLS + minimal data collection + IP hashing |
| Click Fraud | Rate limiting + IP hashing |

## Audit Schedule

- Pre-deployment: Full security audit per this checklist
- Post-deployment: Monthly `pnpm audit` + review access logs
