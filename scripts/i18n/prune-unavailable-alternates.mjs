#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

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

export function pruneUnavailableEnglishAlternates(buildRoot, siteBaseUrl = '/') {
  const englishRoot = path.join(buildRoot, 'en');
  const normalizedBase = `/${siteBaseUrl.replace(/^\/+|\/+$/g, '')}`.replace(/^\/$/, '');
  const englishPrefix = `${normalizedBase}/en/`.replace(/\/+/g, '/');
  let removed = 0;

  for (const htmlPath of walkHtml(buildRoot)) {
    const original = fs.readFileSync(htmlPath, 'utf8');
    const updated = original.replace(
      /<link\b[^>]*\brel="alternate"[^>]*\bhreflang="en"[^>]*>/g,
      (tag) => {
        const href = /\bhref="([^"]+)"/.exec(tag)?.[1];
        if (!href) {
          return tag;
        }
        const pathname = new URL(href, 'https://example.invalid').pathname;
        if (!pathname.startsWith(englishPrefix)) {
          return tag;
        }
        const routePath = pathname.slice(englishPrefix.length);
        if (routeExists(englishRoot, routePath)) {
          return tag;
        }
        removed += 1;
        return '';
      },
    );
    if (updated !== original) {
      fs.writeFileSync(htmlPath, updated);
    }
  }
  return removed;
}

const isCommand = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isCommand) {
  const buildRoot = path.resolve(process.argv[2] ?? 'build');
  const siteBaseUrl = process.argv[3] ?? process.env.DEPLOY_BASE_URL ?? '/';
  const removed = pruneUnavailableEnglishAlternates(buildRoot, siteBaseUrl);
  console.log(`Removed ${removed} unavailable English alternate link(s).`);
}
