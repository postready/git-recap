import { execFileSync } from 'node:child_process';

// --- Commit Parser & Filter ---

const NOISE_PATTERNS = [
  /^merge (branch|pull request)/i,
  /^chore(\(release\)|\(deps\)|\(lint\))?:/i,
  /^bump version/i,
  /^v?\d+\.\d+\.\d+$/
];

export function parseGitLog(rawOutput) {
  if (!rawOutput || !rawOutput.trim()) return [];

  const lines = rawOutput.split('\n');
  const commits = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split('|');
    if (parts.length < 4) continue;

    const [hash, authorDate, authorName, ...subjectParts] = parts;
    const subject = subjectParts.join('|').trim();

    if (NOISE_PATTERNS.some(p => p.test(subject))) {
      continue;
    }

    commits.push({
      hash: hash.trim(),
      date: authorDate.trim(),
      author: authorName.trim(),
      subject: subject
    });
  }

  return commits;
}

export function fetchCommits(options = {}) {
  const {
    cwd = process.cwd(),
    since = null,
    until = null,
    range = null,
    maxCount = 100
  } = options;

  const args = ['log', '--no-merges', `--format=%h|%as|%an|%s`, `-n`, String(maxCount)];

  if (range) {
    args.push(range);
  } else {
    if (since) args.push(`--since=${since}`);
    if (until) args.push(`--until=${until}`);
  }

  try {
    const raw = execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    return parseGitLog(raw);
  } catch (err) {
    return [];
  }
}

// --- Natural Language Harmonizer ---

export function humanizeCommitMessage(subject) {
  if (!subject) return '';

  let clean = subject
    .replace(/^(feat|fix|perf|refactor|docs|style|test)(\([^)]+\))?:\s*/i, '')
    .trim();

  clean = clean.replace(/\(#\d+\)$/, '').trim();

  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    if (!/[.!?]$/.test(clean)) {
      clean += '.';
    }
  }

  return clean;
}

// --- Formatters ---

export function formatPostReadyUpdates(commits, options = {}) {
  const {
    title = null,
    summary = null
  } = options;

  const today = new Date();
  const dateIso = today.toISOString().split('T')[0];
  const dateFormatted = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const items = commits.map(c => humanizeCommitMessage(c.subject)).filter(Boolean);

  const fallbackTitle = items.length > 0
    ? items[0].replace(/\.$/, '')
    : 'Platform Improvements & Updates';

  const finalTitle = title || fallbackTitle;
  const finalSummary = summary || `A summary of ${items.length} new capabilities, performance upgrades, and workflow fixes.`;

  const markdown = `### ${dateFormatted}: ${finalTitle}\n*${finalSummary}*\n\n` +
    items.map(i => `- ${i}`).join('\n');

  const html = `<details class="group border-t border-zinc-200 dark:border-zinc-800">
  <summary class="flex cursor-pointer list-none items-start gap-4 rounded-md py-5 outline-none">
    <div class="min-w-0 flex-1">
      <time dateTime="${dateIso}" class="text-xs tabular-nums text-muted-foreground">${dateFormatted}</time>
      <h2 class="mt-1.5 text-xl font-semibold text-balance">${finalTitle}</h2>
      <p class="mt-2 text-sm leading-6 text-muted-foreground">${finalSummary}</p>
    </div>
  </summary>
  <ul class="mb-6 max-w-[65ch] list-disc space-y-2 pl-5 text-sm leading-6 marker:text-zinc-400">
${items.map(i => `    <li>${i}</li>`).join('\n')}
  </ul>
</details>`;

  return {
    date: dateIso,
    formattedDate: dateFormatted,
    title: finalTitle,
    summary: finalSummary,
    items,
    markdown,
    html
  };
}

export function formatSocialRecap(commits, options = {}) {
  const items = commits.map(c => humanizeCommitMessage(c.subject)).filter(Boolean);
  const dateFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const header = `What we shipped recently (${dateFormatted}):\n`;
  const bullets = items.slice(0, 5).map(i => `• ${i.replace(/\.$/, '')}`).join('\n');
  const footer = `\n\nTry it live on https://postready.org\n#buildinpublic #devtools`;

  return `${header}\n${bullets}${footer}`;
}

export function formatChangelog(commits, options = {}) {
  const { version = 'Unreleased' } = options;
  const dateIso = new Date().toISOString().split('T')[0];

  const features = [];
  const fixes = [];
  const other = [];

  commits.forEach(c => {
    const raw = c.subject.toLowerCase();
    const clean = humanizeCommitMessage(c.subject);
    if (!clean) return;

    if (raw.startsWith('feat')) {
      features.push(`- ${clean} (${c.hash})`);
    } else if (raw.startsWith('fix')) {
      fixes.push(`- ${clean} (${c.hash})`);
    } else {
      other.push(`- ${clean} (${c.hash})`);
    }
  });

  let output = `## [${version}] - ${dateIso}\n\n`;
  if (features.length) output += `### Added\n${features.join('\n')}\n\n`;
  if (fixes.length) output += `### Fixed\n${fixes.join('\n')}\n\n`;
  if (other.length) output += `### Improvements\n${other.join('\n')}\n\n`;

  return output.trim();
}
