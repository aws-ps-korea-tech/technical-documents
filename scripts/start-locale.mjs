#!/usr/bin/env node

// Starts the dev server for one locale with the matching document set.
// Usage: node scripts/start-locale.mjs <ko|en> [docusaurus start options]
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {runDocusaurus} from './lib/docusaurus-cli.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [locale = 'ko', ...extraArgs] = process.argv.slice(2);

runDocusaurus('start', locale, extraArgs, {cwd: projectRoot});
