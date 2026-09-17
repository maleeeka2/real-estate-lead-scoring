const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const findings = [];

function walk(dir, results = []) {
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'coverage', 'playwright-report', 'test-results'].includes(entry.name)) continue;

    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) walk(full, results);
    else results.push(full);
  }

  return results;
}

function read(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return '';
  }
}

function add(id, title, severity, category, evidence, recommendation) {
  findings.push({
    id,
    title,
    severity,
    category,
    evidence,
    recommendation,
  });
}

const files = walk(ROOT);
const sourceFiles = files.filter(f =>
  /\.(js|jsx|ts|tsx|json|yml|yaml|env|md)$/.test(f)
);

const allText = sourceFiles.map(read).join('\n');
const appJs = files.find(f => f.endsWith(path.join('server', 'src', 'app.js')));
const appText = appJs ? read(appJs) : '';

/* ---------------- SECURITY ---------------- */

if (!appText.includes('helmet')) {
  add(
    'SEC-01',
    'Baseline HTTP security headers are not configured',
    'Medium',
    'Security',
    'server/src/app.js does not configure Helmet or an equivalent security-header middleware.',
    'Add Helmet or equivalent security headers and explicitly configure CSP/frame-ancestors, X-Content-Type-Options, Referrer-Policy and Permissions-Policy. Disable Express framework disclosure.'
  );
}

if (appText.includes('app.use(\'/uploads\'') && appText.includes('express.static')) {
  add(
    'UP-03',
    'Local uploads are served as public static files',
    'Medium',
    'server/src/app.js exposes the /uploads directory through express.static.',
    'Keep private uploads behind authenticated authorization or private object storage with signed URLs.'
  );
}

if (appText.includes('X-Powered-By') || appText.includes('express()')) {
  add(
    'SEC-02',
    'Express framework disclosure should be disabled',
    'Low',
    'The application uses Express and does not appear to explicitly disable x-powered-by.',
    'Use app.disable("x-powered-by") or equivalent security middleware.'
  );
}

/* ---------------- UPLOADS ---------------- */

const uploadMiddleware = files.find(f => f.endsWith(path.join('features', 'uploads', 'upload.middleware.js')));
const uploadController = files.find(f => f.endsWith(path.join('features', 'uploads', 'uploads.controller.js')));

const uploadText = uploadMiddleware ? read(uploadMiddleware) : '';
const uploadControllerText = uploadController ? read(uploadController) : '';

if (uploadText.includes('memoryStorage') && uploadText.includes('MAX_VIDEO_SIZE')) {
  add(
    'UP-02',
    'Large uploads are buffered entirely in memory',
    'High',
    'Performance / Resource Exhaustion',
    'Multer memoryStorage is used and video uploads permit up to 200 MB per file with up to 5 files.',
    'Stream large uploads directly to storage or enforce strict aggregate request limits.'
  );
}

if (
  uploadControllerText.includes('f.mimetype') &&
  !uploadControllerText.includes('file-type') &&
  !allText.includes('fileTypeFromBuffer') &&
  !allText.includes('magic-bytes')
) {
  add(
    'UP-01',
    'Upload validation relies on client-declared MIME type',
    'High',
    'Security',
    'Upload controllers validate f.mimetype but no binary/magic-byte inspection was detected.',
    'Validate actual file signatures server-side and keep MIME/extension checks as defense in depth.'
  );
}

/* ---------------- BILLING ---------------- */

const billing = files.find(f => f.endsWith(path.join('features', 'billing', 'billing.service.js')));
const propertyService = files.find(f => f.endsWith(path.join('features', 'property', 'property.service.js')));
const agencyService = files.find(f => f.endsWith(path.join('features', 'agency', 'agency.service.js')));

const billingText = billing ? read(billing) : '';
const propertyText = propertyService ? read(propertyService) : '';
const agencyText = agencyService ? read(agencyService) : '';

if (
  billingText.includes('countDocuments') &&
  billingText.includes('assertWithinLimit') &&
  (propertyText.includes('assertWithinLimit') || agencyText.includes('assertWithinLimit'))
) {
  add(
    'BILLING-01',
    'Subscription limit enforcement is not atomic',
    'High',
    'Business Logic / Concurrency',
    'The application counts current resources, checks the plan limit, and creates the resource in a later operation.',
    'Use atomic counters, database constraints, or appropriate transactional/concurrency control.'
  );
}

/* ---------------- PERFORMANCE ---------------- */

if (
  propertyText.includes('recommendProperties') &&
  propertyText.includes('.sort((a, b) => Math.abs')
) {
  add(
    'DB-01',
    'Recommendation ranking is performed in application memory',
    'Medium',
    'Performance / Scalability',
    'Recommendation candidates are loaded and then sorted in JavaScript by price distance before slicing.',
    'Push filtering/ranking/limiting into MongoDB aggregation/query logic where practical.'
  );
}

if (
  propertyText.includes('getAnalytics') &&
  propertyText.includes('Promise.all') &&
  propertyText.includes('mostViewed') &&
  propertyText.includes('highestPrice')
) {
  add(
    'DB-02',
    'Analytics endpoint performs multiple database operations per request',
    'Medium',
    'Performance / Scalability',
    'Analytics launches multiple property queries, a count and review aggregations concurrently.',
    'Consolidate queries where practical, verify indexes and consider caching non-real-time analytics.'
  );
}

/* ---------------- CI/CD ---------------- */

const workflowDir = path.join(ROOT, '.github', 'workflows');
const workflowFiles = fs.existsSync(workflowDir)
  ? fs.readdirSync(workflowDir).filter(f => /\.(yml|yaml)$/.test(f))
  : [];

const workflows = workflowFiles.map(f => read(path.join(workflowDir, f))).join('\n');

if (workflowFiles.length > 0 && !workflows.includes('playwright test') && !workflows.includes('cypress')) {
  add(
    'CI-01',
    'UI end-to-end tests are not part of CI',
    'High',
    'CI/CD / Testing',
    'GitHub Actions workflow does not execute Playwright or Cypress tests.',
    'Run the E2E suite on pull requests and main-branch pushes.'
  );
}

if (workflowFiles.length > 0 && !workflows.includes('newman') && !workflows.includes('postman')) {
  add(
    'CI-02',
    'API contract tests are not part of CI',
    'High',
    'CI/CD / API Testing',
    'GitHub Actions workflow does not execute the Newman/Postman API collection.',
    'Run API contract tests automatically in CI.'
  );
}

if (workflowFiles.length > 0 && !workflows.includes('k6') && !workflows.includes('jmeter')) {
  add(
    'CI-03',
    'Performance regression testing is not part of CI',
    'Medium',
    'CI/CD / Performance',
    'No k6 or JMeter execution was detected in GitHub Actions.',
    'Add a lightweight performance smoke/baseline job and keep full load tests on a controlled schedule.'
  );
}

if (
  workflowFiles.length > 0 &&
  !workflows.includes('npm audit') &&
  !workflows.includes('audit-ci') &&
  !workflows.includes('snyk')
) {
  add(
    'CI-04',
    'Dependency security scanning is absent from CI',
    'Medium',
    'CI/CD / Supply Chain',
    'GitHub Actions does not contain an automated dependency vulnerability check.',
    'Add npm audit with an appropriate policy or a dedicated dependency scanner.'
  );
}

/* ---------------- OBSERVABILITY ---------------- */

if (
  sourceFiles.some(f => f.includes(path.join('server', 'src'))) &&
  allText.includes('console.error') &&
  !allText.includes('winston') &&
  !allText.includes('pino')
) {
  add(
    'OBS-01',
    'Structured application logging is not evident',
    'Low',
    'Observability',
    'Server source contains console-based error logging and no common structured logging library was detected.',
    'Adopt structured logs with request/correlation IDs and centralized log collection.'
  );
}

/* ---------------- CODE QUALITY ---------------- */

const todoMatches = [];
for (const file of sourceFiles) {
  const text = read(file);
  const lines = text.split(/\r?\n/);

  lines.forEach((line, index) => {
    if (/\b(TODO|FIXME|HACK)\b/i.test(line)) {
      todoMatches.push(`${path.relative(ROOT, file)}:${index + 1}: ${line.trim()}`);
    }
  });
}

if (todoMatches.length > 0) {
  add(
    'CODE-01',
    'Unresolved TODO/FIXME/HACK markers exist in source',
    'Low',
    'Maintainability',
    `${todoMatches.length} marker(s) detected.`,
    'Review each marker, resolve it or convert it into a tracked engineering issue.'
  );
}

/* ---------------- TESTING ---------------- */

const testFiles = files.filter(f =>
  /\.(test|spec)\.(js|jsx|ts|tsx)$/.test(f)
);

if (testFiles.length === 0) {
  add(
    'TEST-01',
    'Automated test coverage is absent',
    'High',
    'Testing',
    'No automated test files were detected.',
    'Introduce unit, integration and E2E coverage.'
  );
}

if (
  workflowFiles.length > 0 &&
  workflows.includes('test:coverage') &&
  !workflows.includes('coverageThreshold')
) {
  add(
    'CI-05',
    'CI runs coverage without an explicit workflow-level coverage gate',
    'Medium',
    'Testing / CI',
    'Coverage is generated but no coverage threshold is declared in the workflow.',
    'Define and enforce meaningful coverage thresholds in Jest configuration.'
  );
}

/* ---------------- CONFIGURATION ---------------- */

const envExample = files.find(f =>
  /(^|[\\/])\.env\.example$/.test(f)
);

if (!envExample) {
  add(
    'CONFIG-01',
    'No .env.example configuration template detected',
    'Low',
    'Configuration / Developer Experience',
    'No .env.example file was detected during the repository scan.',
    'Provide a sanitized environment-variable template documenting required configuration.'
  );
}

/* ---------------- REPORT ---------------- */

const severityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };

findings.sort((a, b) =>
  (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9)
);

const lines = [
  '# Automated Engineering QA Audit',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  `Candidate findings detected: **${findings.length}**`,
  '',
  '> This is an automated candidate scan. Each finding should be reviewed and verified before being treated as a confirmed defect.',
  '',
];

findings.forEach((f, i) => {
  lines.push(`## ${i + 1}. ${f.id} — ${f.title}`);
  lines.push('');
  lines.push(`- **Severity:** ${f.severity}`);
  lines.push(`- **Category:** ${f.category}`);
  lines.push(`- **Evidence:** ${f.evidence}`);
  lines.push(`- **Recommendation:** ${f.recommendation}`);
  lines.push('');
});

lines.push('## Scan Statistics');
lines.push('');
lines.push(`- Files scanned: ${files.length}`);
lines.push(`- Source/config files analyzed: ${sourceFiles.length}`);
lines.push(`- Automated test files detected: ${testFiles.length}`);
lines.push(`- GitHub Actions workflows detected: ${workflowFiles.length}`);
lines.push('');

const output = path.join(ROOT, 'ENGINEERING_REVIEW_AUTOMATED.md');
fs.writeFileSync(output, lines.join('\n'));

console.log(`\nAutomated QA audit complete.`);
console.log(`Candidate findings: ${findings.length}`);
console.log(`Report: ${output}`);
