# Automated Engineering QA Audit

Generated: 2026-09-16T10:35:14.669Z

Candidate findings detected: **13**

> This is an automated candidate scan. Each finding should be reviewed and verified before being treated as a confirmed defect.

## 1. UP-02 — Large uploads are buffered entirely in memory

- **Severity:** High
- **Category:** Performance / Resource Exhaustion
- **Evidence:** Multer memoryStorage is used and video uploads permit up to 200 MB per file with up to 5 files.
- **Recommendation:** Stream large uploads directly to storage or enforce strict aggregate request limits.

## 2. BILLING-01 — Subscription limit enforcement is not atomic

- **Severity:** High
- **Category:** Business Logic / Concurrency
- **Evidence:** The application counts current resources, checks the plan limit, and creates the resource in a later operation.
- **Recommendation:** Use atomic counters, database constraints, or appropriate transactional/concurrency control.

## 3. CI-01 — UI end-to-end tests are not part of CI

- **Severity:** High
- **Category:** CI/CD / Testing
- **Evidence:** GitHub Actions workflow does not execute Playwright or Cypress tests.
- **Recommendation:** Run the E2E suite on pull requests and main-branch pushes.

## 4. CI-02 — API contract tests are not part of CI

- **Severity:** High
- **Category:** CI/CD / API Testing
- **Evidence:** GitHub Actions workflow does not execute the Newman/Postman API collection.
- **Recommendation:** Run API contract tests automatically in CI.

## 5. SEC-01 — Baseline HTTP security headers are not configured

- **Severity:** Medium
- **Category:** Security
- **Evidence:** server/src/app.js does not configure Helmet or an equivalent security-header middleware.
- **Recommendation:** Add Helmet or equivalent security headers and explicitly configure CSP/frame-ancestors, X-Content-Type-Options, Referrer-Policy and Permissions-Policy. Disable Express framework disclosure.

## 6. UP-03 — Local uploads are served as public static files

- **Severity:** Medium
- **Category:** server/src/app.js exposes the /uploads directory through express.static.
- **Evidence:** Keep private uploads behind authenticated authorization or private object storage with signed URLs.
- **Recommendation:** undefined

## 7. DB-01 — Recommendation ranking is performed in application memory

- **Severity:** Medium
- **Category:** Performance / Scalability
- **Evidence:** Recommendation candidates are loaded and then sorted in JavaScript by price distance before slicing.
- **Recommendation:** Push filtering/ranking/limiting into MongoDB aggregation/query logic where practical.

## 8. DB-02 — Analytics endpoint performs multiple database operations per request

- **Severity:** Medium
- **Category:** Performance / Scalability
- **Evidence:** Analytics launches multiple property queries, a count and review aggregations concurrently.
- **Recommendation:** Consolidate queries where practical, verify indexes and consider caching non-real-time analytics.

## 9. CI-03 — Performance regression testing is not part of CI

- **Severity:** Medium
- **Category:** CI/CD / Performance
- **Evidence:** No k6 or JMeter execution was detected in GitHub Actions.
- **Recommendation:** Add a lightweight performance smoke/baseline job and keep full load tests on a controlled schedule.

## 10. CI-04 — Dependency security scanning is absent from CI

- **Severity:** Medium
- **Category:** CI/CD / Supply Chain
- **Evidence:** GitHub Actions does not contain an automated dependency vulnerability check.
- **Recommendation:** Add npm audit with an appropriate policy or a dedicated dependency scanner.

## 11. CI-05 — CI runs coverage without an explicit workflow-level coverage gate

- **Severity:** Medium
- **Category:** Testing / CI
- **Evidence:** Coverage is generated but no coverage threshold is declared in the workflow.
- **Recommendation:** Define and enforce meaningful coverage thresholds in Jest configuration.

## 12. SEC-02 — Express framework disclosure should be disabled

- **Severity:** Low
- **Category:** The application uses Express and does not appear to explicitly disable x-powered-by.
- **Evidence:** Use app.disable("x-powered-by") or equivalent security middleware.
- **Recommendation:** undefined

## 13. CODE-01 — Unresolved TODO/FIXME/HACK markers exist in source

- **Severity:** Low
- **Category:** Maintainability
- **Evidence:** 5 marker(s) detected.
- **Recommendation:** Review each marker, resolve it or convert it into a tracked engineering issue.

## Scan Statistics

- Files scanned: 433
- Source/config files analyzed: 371
- Automated test files detected: 46
- GitHub Actions workflows detected: 1
