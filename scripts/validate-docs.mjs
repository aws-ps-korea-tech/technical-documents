#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import Ajv2020 from 'ajv/dist/2020.js';
import {
  addIssue,
  findLine,
  getChangedFiles,
  isExternalTarget,
  isPublished,
  loadBaseline,
  loadDocuments,
  parseChangedFrom,
  reportIssues,
  scanCodeFences,
  stripTargetSuffix,
} from './lib/docs-validation.mjs';

const projectRoot = process.cwd();
const changedFrom = parseChangedFrom();
const changedFiles = getChangedFiles(projectRoot, changedFrom);
const baseline = loadBaseline(projectRoot);
const documents = loadDocuments(projectRoot);
const schema = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'schemas', 'doc-frontmatter.schema.json'), 'utf8'),
);
const ajv = new Ajv2020({allErrors: true, strict: false});
const validateFrontMatter = ajv.compile(schema);
const issues = [];
const contentIds = new Map();
const slugs = new Map();

// Read the docs plugin options that decide which files are built and how their
// URLs are derived, so route comparison follows the real site configuration.
function loadDocsOptions() {
  const configPath = path.join(projectRoot, 'docusaurus.config.js');
  if (!fs.existsSync(configPath)) {
    return {};
  }
  try {
    const config = createRequire(import.meta.url)(configPath);
    for (const preset of config.presets ?? []) {
      const options = Array.isArray(preset) ? preset[1] : null;
      if (options?.docs) {
        return options.docs;
      }
    }
  } catch (error) {
    console.log(`WARNING docusaurus.config.js를 읽지 못해 제외 규칙 없이 비교합니다: ${error.message}`);
  }
  return {};
}

// Minimal glob support for the patterns used in docs.exclude: "**" and "*".
function globToRegExp(pattern) {
  const source = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*\//g, '\u0000')
    .replace(/\*\*/g, '\u0001')
    .replace(/\*/g, '[^/]*')
    .replace(/\u0000/g, '(?:.*/)?')
    .replace(/\u0001/g, '.*');
  return new RegExp(`^${source}$`);
}

const docsOptions = loadDocsOptions();
const excludeMatchers = (docsOptions.exclude ?? []).map(globToRegExp);
const stripNumberPrefix = docsOptions.numberPrefixParser !== false;

function addDocumentIssue(document, rule, message, options = {}) {
  addIssue(issues, {
    document,
    rule,
    message,
    changedFiles,
    baseline,
    ...options,
  });
}

function validateDate(document, value, field) {
  if (value == null) {
    return;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    addDocumentIssue(document, 'INVALID_DATE', `${field}에 YYYY-MM-DD 형식의 실제 날짜를 입력하세요.`);
    return;
  }
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    addDocumentIssue(document, 'INVALID_DATE', `${field}에 실제 날짜를 입력하세요.`);
  }
}

function validateSlug(document) {
  const slug = document.data.slug;
  if (typeof slug !== 'string') {
    return;
  }
  if (slug.includes('//') || (slug.length > 1 && slug.endsWith('/'))) {
    addDocumentIssue(
      document,
      'NON_CANONICAL_SLUG',
      'slug에는 연속 슬래시나 불필요한 끝 슬래시를 사용할 수 없습니다.',
    );
  }
}

const NUMBER_PREFIX = /^\d+\s*[-_.]\s*/;

// Reproduces the URL Docusaurus assigns to a document so that a slug can be
// compared with routes derived from other files' paths. Checked against the
// permalinks of all 112 documents in a real build (0 mismatches).
// - An explicit slug starting with "/" is used as is; any other slug is
//   resolved relative to the document's directory.
// - Without a slug the path is used, minus number prefixes ("1-foo" -> "foo"),
//   and index/README/<same name as the parent folder> map to the folder URL.
function resolveRoute(document) {
  const relativePath = document.relativeDocPath;
  const directory = path.posix.dirname(relativePath);
  const slug = document.data.slug;
  if (typeof slug === 'string') {
    const joined = slug.startsWith('/')
      ? slug
      : path.posix.join('/', directory === '.' ? '' : directory, slug);
    const normalized = path.posix.normalize(joined);
    return normalized.length > 1 ? normalized.replace(/\/+$/, '') : normalized;
  }
  const strip = (name) => (stripNumberPrefix ? name.replace(NUMBER_PREFIX, '') : name);
  const base = strip(path.posix.basename(relativePath, path.posix.extname(relativePath)));
  const isIndex =
    ['index', 'readme'].includes(base.toLowerCase()) ||
    base === strip(path.posix.basename(directory));
  const directories = directory === '.' ? [] : directory.split('/').map(strip);
  return `/${(isIndex ? directories : [...directories, base]).join('/')}`;
}

// A document is built unless it has the top-level `draft: true` or matches
// docs.exclude in docusaurus.config.js. Only default-locale docs are matched
// against exclude; translation files live under i18n/ and are never excluded.
function isBuiltIntoSite(document) {
  if (document.data.draft === true) {
    return false;
  }
  return !(
    document.rootSource === 'default' &&
    excludeMatchers.some((matcher) => matcher.test(document.relativeDocPath))
  );
}

function validatePublicationStatus(document) {
  const status = document.data?.customProps?.publicationStatus;
  if (['draft', 'review'].includes(status) && document.data.draft !== true) {
    addDocumentIssue(
      document,
      'DRAFT_BUILD_FLAG_MISSING',
      `publicationStatus '${status}' 문서는 실제 빌드 제외를 위해 최상위 draft: true가 필요합니다.`,
    );
  }
  if (['published', 'archived'].includes(status) && document.data.draft === true) {
    addDocumentIssue(
      document,
      'PUBLISHED_MARKED_DRAFT',
      `publicationStatus '${status}' 문서는 최상위 draft: true를 사용할 수 없습니다.`,
    );
  }
}

function validateImages(document) {
  const imagePattern = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  const {fencedLines} = scanCodeFences(document.content);
  for (const match of document.content.matchAll(imagePattern)) {
    const [, altText, rawTarget] = match;
    const contentLine = findLine(document.content, match.index);
    // Image syntax inside a code block is an example, not an image.
    if (fencedLines.has(contentLine)) {
      continue;
    }
    const line = contentLine + document.contentLineOffset;
    if (!altText.trim()) {
      addDocumentIssue(
        document,
        'IMAGE_ALT_MISSING',
        '이미지의 내용을 설명하는 대체 텍스트를 입력하세요.',
        {line},
      );
    }

    if (isExternalTarget(rawTarget) || rawTarget.startsWith('data:')) {
      continue;
    }
    let decodedTarget;
    try {
      decodedTarget = decodeURIComponent(rawTarget);
    } catch {
      addDocumentIssue(
        document,
        'IMAGE_PATH_INVALID',
        `이미지 경로의 퍼센트 인코딩이 올바르지 않습니다: ${rawTarget}`,
        {line},
      );
      continue;
    }
    const target = stripTargetSuffix(decodedTarget);
    const resolved = target.startsWith('/')
      ? path.join(projectRoot, 'static', target)
      : path.resolve(path.dirname(document.absolutePath), target);
    if (!fs.existsSync(resolved)) {
      addDocumentIssue(
        document,
        'IMAGE_NOT_FOUND',
        `이미지 파일을 찾을 수 없습니다: ${rawTarget}`,
        {line},
      );
    }
  }
}

function validateFences(document) {
  const {blocks} = scanCodeFences(document.content);

  for (const block of blocks) {
    if (block.closeLine === null) {
      addDocumentIssue(
        document,
        'UNCLOSED_CODE_FENCE',
        '닫히지 않은 코드 블록이 있습니다.',
        {line: block.openLine + document.contentLineOffset},
      );
    }
    if (block.info === '') {
      addDocumentIssue(
        document,
        'CODE_FENCE_LANGUAGE_MISSING',
        '코드 블록 시작 줄에 bash, json, yaml 같은 언어를 지정하세요.',
        {
          line: block.openLine + document.contentLineOffset,
          severity: 'warning',
        },
      );
    }
  }
}

function validateHeadingIds(document) {
  const seen = new Map();
  const headingPattern = /^#{2,6}\s+.+?\s+\{#([a-z0-9][a-z0-9-]*)\}\s*$/gm;
  const {fencedLines} = scanCodeFences(document.content);
  for (const match of document.content.matchAll(headingPattern)) {
    const headingId = match[1];
    const contentLine = findLine(document.content, match.index);
    if (fencedLines.has(contentLine)) {
      continue;
    }
    const line = contentLine + document.contentLineOffset;
    if (seen.has(headingId)) {
      addDocumentIssue(
        document,
        'DUPLICATE_HEADING_ID',
        `문단 ID '${headingId}'가 같은 문서에서 중복됩니다.`,
        {line},
      );
    }
    seen.set(headingId, line);
  }
}

function validateRequiredSections(document) {
  const props = document.data?.customProps ?? {};
  if (!isPublished(document) || props.contentType !== 'hands-on') {
    return;
  }
  if (!/(?:\{#verification\}|^##\s+(?:결과 확인|Verification)\b)/im.test(document.content)) {
    addDocumentIssue(
      document,
      'HANDS_ON_VERIFICATION_MISSING',
      '발행된 실습 문서에는 결과 확인 절차가 필요합니다.',
    );
  }
  if (!/(?:\{#cleanup\}|^##\s+(?:리소스 정리|Clean(?:up| up))\b)/im.test(document.content)) {
    addDocumentIssue(
      document,
      'HANDS_ON_CLEANUP_MISSING',
      '발행된 실습 문서에는 비용 발생 리소스의 정리 절차가 필요합니다.',
    );
  }
}

for (const document of documents) {
  if (document.parseError) {
    addDocumentIssue(
      document,
      'FRONT_MATTER_PARSE_ERROR',
      `프런트 매터를 읽을 수 없습니다: ${document.parseError.message}`,
    );
    continue;
  }

  const hasNewMetadata = Boolean(document.data?.customProps?.contentId);
  if (!hasNewMetadata && !changedFiles.has(document.projectPath)) {
    addDocumentIssue(
      document,
      'LEGACY_METADATA_PENDING',
      '기존 문서에 새 메타데이터가 아직 적용되지 않았습니다.',
      {severity: 'warning'},
    );
  } else if (!validateFrontMatter(document.data)) {
    for (const error of validateFrontMatter.errors ?? []) {
      addDocumentIssue(
        document,
        'FRONT_MATTER_SCHEMA',
        `${error.instancePath || '/'} ${error.message}`,
      );
    }
  }

  const props = document.data?.customProps ?? {};
  validateDate(document, props.lastReviewed, 'lastReviewed');
  validateSlug(document);
  validatePublicationStatus(document);

  if (props.contentId) {
    const existing = contentIds.get(`${props.contentId}:${props.locale}`);
    if (existing) {
      addDocumentIssue(
        document,
        'DUPLICATE_CONTENT_ID_LOCALE',
        `contentId '${props.contentId}'와 locale '${props.locale}' 조합이 ${existing}에도 있습니다.`,
      );
    } else {
      contentIds.set(`${props.contentId}:${props.locale}`, document.projectPath);
    }
  }

  // Legacy documents have no publicationStatus, but Docusaurus still routes them
  // unless they are excluded from the build, so compare the URL of every document,
  // including URLs derived from file paths (a new slug can collide with them).
  if (isBuiltIntoSite(document)) {
    const locale = props.locale ?? document.rootLocale ?? 'ko';
    const route = resolveRoute(document);
    const slugKey = `${locale}:${route}`;
    const existing = slugs.get(slugKey);
    if (existing) {
      const message = (other) =>
        `문서 주소 '${route}'가 ${other.projectPath}와 중복됩니다.`;
      addDocumentIssue(document, 'DUPLICATE_SLUG', message(existing));
      // Report on the earlier document too, so a legacy/new collision is blocking
      // when the new (strict) document is the one that appears first.
      addDocumentIssue(existing, 'DUPLICATE_SLUG', message(document));
    } else {
      slugs.set(slugKey, document);
    }
  }

  if (!document.content.trim()) {
    addDocumentIssue(document, 'EMPTY_DOCUMENT', '문서 본문이 비어 있습니다.');
  }

  const firstHeading = document.content.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (firstHeading && firstHeading === document.data.title) {
    addDocumentIssue(
      document,
      'DUPLICATE_TITLE_HEADING',
      '프런트 매터 제목과 첫 번째 H1이 중복됩니다. 새 문서에서는 H1을 제거하세요.',
      {severity: 'warning'},
    );
  }

  validateImages(document);
  validateFences(document);
  validateHeadingIds(document);
  validateRequiredSections(document);
}

const result = reportIssues(issues, 'Document validation');
if (result.errors > 0) {
  process.exitCode = 1;
}
