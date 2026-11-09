#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {assertSupportedLocale, runDocusaurus} from './lib/docusaurus-cli.mjs';
import {
  assertEnglishAlternates,
  pruneUnavailableEnglishAlternates,
} from './i18n/prune-unavailable-alternates.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const buildRoot = path.join(projectRoot, 'build');
const stagingRoot = path.join(projectRoot, '.locale-build');
const requestedLocale = process.argv[2] ?? null;

if (requestedLocale) {
  assertSupportedLocale(requestedLocale);
}

function runBuild(locale, outputDirectory) {
  console.log(`Building ${locale} site into ${path.relative(projectRoot, outputDirectory)}...`);
  runDocusaurus('build', locale, ['--out-dir', outputDirectory], {cwd: projectRoot});
}

if (requestedLocale) {
  fs.rmSync(buildRoot, {recursive: true, force: true});
  runBuild(requestedLocale, buildRoot);
  process.exit(0);
}

fs.rmSync(buildRoot, {recursive: true, force: true});
fs.rmSync(stagingRoot, {recursive: true, force: true});

const koreanStage = path.join(stagingRoot, 'ko');
const englishStage = path.join(stagingRoot, 'en');
runBuild('ko', koreanStage);
runBuild('en', englishStage);

const englishOutput = path.join(englishStage, 'en');
if (!fs.existsSync(path.join(koreanStage, 'index.html'))) {
  throw new Error('Korean build did not produce its root index.html.');
}
if (!fs.existsSync(path.join(englishOutput, 'index.html'))) {
  throw new Error('English build did not produce en/index.html.');
}

fs.cpSync(koreanStage, buildRoot, {recursive: true});
fs.cpSync(englishOutput, path.join(buildRoot, 'en'), {recursive: true});
const siteBaseUrl = process.env.DEPLOY_BASE_URL || '/';
const removedAlternates = pruneUnavailableEnglishAlternates(buildRoot, siteBaseUrl);
// Fail closed if the scan found nothing (markup changed) or left a dangling alternate.
const remainingAlternates = assertEnglishAlternates(buildRoot, siteBaseUrl);
fs.rmSync(stagingRoot, {recursive: true, force: true});
console.log(
  `Combined Korean and English sites in build/; removed ${removedAlternates} unavailable English alternate link(s), ${remainingAlternates} remain.`,
);
