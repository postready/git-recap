#!/usr/bin/env node

import fs from 'node:fs';
import { fetchCommits, formatPostReadyUpdates, formatSocialRecap, formatChangelog } from '../src/index.js';

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

// --- Color Palette ---

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// --- Help & Usage ---

function printHelp() {
  console.log(`
${c.bold}${c.cyan}git-recap${c.reset} v${pkg.version}
${c.dim}Turn technical git commits into clean, user-facing product updates & social posts.${c.reset}
${c.dim}Powered by PostReady — ${c.blue}https://postready.org${c.reset}

${c.bold}USAGE:${c.reset}
  $ git-recap [options]

${c.bold}OPTIONS:${c.reset}
  ${c.green}-f, --format <type>${c.reset}     Output format: updates (default, PostReady format),
                             social (X/LinkedIn post), changelog, html, json
  ${c.green}-s, --since <time>${c.reset}      Filter commits since (e.g. "yesterday", "7 days ago", "2026-10-01")
  ${c.green}-u, --until <time>${c.reset}      Filter commits until
  ${c.green}-r, --range <range>${c.reset}     Explicit git commit range (e.g. "v1.0.0..HEAD")
  ${c.green}-n, --count <num>${c.reset}       Max commits to inspect (default: 50)
  ${c.green}-t, --title <text>${c.reset}      Custom release title for the update
  ${c.green}-m, --summary <text>${c.reset}    Custom release summary description
  ${c.green}-h, --help${c.reset}              Show this help message
  ${c.green}-v, --version${c.reset}           Show version

${c.bold}EXAMPLES:${c.reset}
  $ git-recap --since "yesterday"
  $ git-recap --format social --since "7 days ago"
  $ git-recap --format html > update-snippet.html
  $ git-recap --range v1.0.0..HEAD --format changelog
`);
}

// --- Argument Parser ---

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    format: 'updates',
    since: null,
    until: null,
    range: null,
    maxCount: 50,
    title: null,
    summary: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '-h' || arg === '--help') {
      printHelp();
      process.exit(0);
    }
    if (arg === '-v' || arg === '--version') {
      console.log(`v${pkg.version}`);
      process.exit(0);
    }
    if (arg === '-f' || arg === '--format') {
      options.format = (args[++i] || 'updates').toLowerCase();
      continue;
    }
    if (arg === '-s' || arg === '--since') {
      options.since = args[++i];
      continue;
    }
    if (arg === '-u' || arg === '--until') {
      options.until = args[++i];
      continue;
    }
    if (arg === '-r' || arg === '--range') {
      options.range = args[++i];
      continue;
    }
    if (arg === '-n' || arg === '--count') {
      options.maxCount = parseInt(args[++i], 10) || 50;
      continue;
    }
    if (arg === '-t' || arg === '--title') {
      options.title = args[++i];
      continue;
    }
    if (arg === '-m' || arg === '--summary') {
      options.summary = args[++i];
      continue;
    }
  }

  return options;
}

// --- Execution ---

function main() {
  try {
    const opts = parseArgs();
    const commits = fetchCommits(opts);

    if (!commits.length) {
      console.log(`\n${c.yellow}No matching git commits found for the specified period.${c.reset}\n`);
      process.exit(0);
    }

    if (opts.format === 'json') {
      const result = formatPostReadyUpdates(commits, opts);
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    if (opts.format === 'html') {
      const result = formatPostReadyUpdates(commits, opts);
      console.log(result.html);
      return;
    }

    if (opts.format === 'social') {
      const social = formatSocialRecap(commits, opts);
      console.log(`\n${c.bold}${c.cyan}📱 Social Release Post (X / LinkedIn):${c.reset}\n`);
      console.log(social);
      console.log(`\n${c.dim}Copy and share directly. Formatted for PostReady.org${c.reset}\n`);
      return;
    }

    if (opts.format === 'changelog') {
      const cl = formatChangelog(commits, opts);
      console.log(cl);
      return;
    }

    // Default: PostReady Updates Page Format
    const result = formatPostReadyUpdates(commits, opts);
    console.log(`\n${c.bold}${c.cyan}🚀 PostReady Product Update (${result.items.length} items from ${commits.length} commits):${c.reset}\n`);
    console.log(`${c.bold}${result.formattedDate}: ${result.title}${c.reset}`);
    console.log(`${c.dim}${result.summary}${c.reset}\n`);
    result.items.forEach(item => {
      console.log(`  ${c.green}•${c.reset} ${item}`);
    });
    console.log(`\n${c.dim}Tip: Run with ${c.yellow}--format html${c.dim} to get copy-paste ready HTML for your updates page.${c.reset}`);
    console.log(`${c.dim}Powered by PostReady — ${c.cyan}https://postready.org${c.reset}\n`);
  } catch (err) {
    console.error(`\n${c.yellow}Error:${c.reset}`, err.message);
    process.exit(1);
  }
}

main();
