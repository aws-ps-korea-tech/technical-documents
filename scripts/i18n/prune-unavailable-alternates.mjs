#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

function walkHtml(directory, files = []) {
  if (!fs.existsSync(directory)) {
    return files;
  }
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walkHtml(absolutePath, files);
    } else if (entry.name.endsWith('.html')) {
      files.push(absolutePath);
    }
  }
  return files;
}

function isFile(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function routeExists(outputRoot, routePath) {
  let decoded;
  try {
    decoded = decodeURIComponent(routePath);
  } catch {
    // Malformed percent-encoding cannot name a generated page.
    return false;
  }
  const normalized = decoded.replace(/^\/+|\/+$/g, '');
  if (!normalized) {
    return isFile(path.join(outputRoot, 'index.html'));
  }
  // A bare directory is not a page: parent folders of nested English documents
  // exist even when the folder itself has no index.html.
  return (
    isFile(path.join(outputRoot, normalized)) ||
    isFile(path.join(outputRoot, normalized, 'index.html')) ||
    isFile(path.join(outputRoot, `${normalized}.html`))
  );
}

// Attribute parsing that does not depend on attribute order, quote style or
// case, so a Docusaurus or Helmet upgrade cannot make the scan silently match
// nothing.
const LINK_TAG = /<link\b[^>]*>/gi;
const ATTRIBUTE = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function parseAttributes(tag) {
  const attributes = {};
  const body = tag.replace(/^<link\b/i, '').replace(/\/?>$/, '');
  for (const match of body.matchAll(ATTRIBUTE)) {
    attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? '';
  }
  return attributes;
}

function isEnglishAlternate(attributes) {
  const rel = (attributes.rel ?? '').toLowerCase().split(/\s+/);
  return rel.includes('alternate') && (attributes.hreflang ?? '').toLowerCase() === 'en';
}

function englishPrefixFor(siteBaseUrl) {
  const normalizedBase = `/${siteBaseUrl.replace(/^\/+|\/+$/g, '')}`.replace(/^\/$/, '');
  return `${normalizedBase}/en/`.replace(/\/+/g, '/');
}

function classify(tag, englishRoot, englishPrefix) {
  const attributes = parseAttributes(tag);
  if (!isEnglishAlternate(attributes)) {
    return 'other';
  }
  if (!attributes.href) {
    return 'available';
  }
  let pathname;
  try {
    pathname = new URL(attributes.href, 'https://example.invalid').pathname;
  } catch {
    return 'unavailable';
  }
  if (!pathname.startsWith(englishPrefix)) {
    return 'available';
  }
  return routeExists(englishRoot, pathname.slice(englishPrefix.length))
    ? 'available'
    : 'unavailable';
}

/**
 * Counts every English hreflang alternate in the build and lists the pages
 * whose English alternate points at a route that does not exist.
 */
export function scanEnglishAlternates(buildRoot, siteBaseUrl = '/') {
  const englishRoot = path.join(buildRoot, 'en');
  const englishPrefix = englishPrefixFor(siteBaseUrl);
  let total = 0;
  const unavailable = [];
  for (const htmlPath of walkHtml(buildRoot)) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    for (const [tag] of html.matchAll(LINK_TAG)) {
      const kind = classify(tag, englishRoot, englishPrefix);
      if (kind === 'other') {
        continue;
      }
      total += 1;
      if (kind === 'unavailable') {
        unavailable.push(path.relative(buildRoot, htmlPath).split(path.sep).join('/'));
      }
    }
  }
  return {total, unavailable};
}

export function pruneUnavailableEnglishAlternates(buildRoot, siteBaseUrl = '/') {
  const englishRoot = path.join(buildRoot, 'en');
  const englishPrefix = englishPrefixFor(siteBaseUrl);
  let removed = 0;

  for (const htmlPath of walkHtml(buildRoot)) {
    const original = fs.readFileSync(htmlPath, 'utf8');
    const updated = original.replace(LINK_TAG, (tag) => {
      if (classify(tag, englishRoot, englishPrefix) !== 'unavailable') {
        return tag;
      }
      removed += 1;
      return '';
    });
    if (updated !== original) {
      fs.writeFileSync(htmlPath, updated);
    }
  }
  return removed;
}

/**
 * Fails when the build has no English alternates at all (the markup the scan
 * expects has changed) or still advertises an English page that does not exist.
 * Returns the number of English alternates that remain.
 */
export function assertEnglishAlternates(buildRoot, siteBaseUrl = '/') {
  const {total, unavailable} = scanEnglishAlternates(buildRoot, siteBaseUrl);
  if (total === 0) {
    throw new Error(
      'No hreflang="en" alternate links found in the build. The generated markup may have changed; update scripts/i18n/prune-unavailable-alternates.mjs.',
    );
  }
  if (unavailable.length > 0) {
    throw new Error(
      `${unavailable.length} page(s) still advertise an unavailable English alternate: ${unavailable.slice(0, 5).join(', ')}`,
    );
  }
  return total;
}

const isCommand = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isCommand) {
  const buildRoot = path.resolve(process.argv[2] ?? 'build');
  const siteBaseUrl = process.argv[3] ?? process.env.DEPLOY_BASE_URL ?? '/';
  const removed = pruneUnavailableEnglishAlternates(buildRoot, siteBaseUrl);
  const total = assertEnglishAlternates(buildRoot, siteBaseUrl);
  console.log(`Removed ${removed} unavailable English alternate link(s); ${total} remain.`);
}
