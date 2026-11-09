import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';

export const supportedLocales = ['ko', 'en'];

const require = createRequire(import.meta.url);
// Run the CLI entry point with the current Node binary instead of
// node_modules/.bin/docusaurus, which is a .cmd shim on Windows.
const docusaurusBin = require.resolve('@docusaurus/core/bin/docusaurus.mjs');

export function assertSupportedLocale(locale) {
  if (!supportedLocales.includes(locale)) {
    throw new Error(`Unsupported locale '${locale}'. Expected one of: ${supportedLocales.join(', ')}.`);
  }
}

/**
 * Runs a Docusaurus command for one locale. DOCS_BUILD_LOCALE selects which
 * documents config/i18n-content.js includes, so it must match --locale.
 * Exits the process with the command's status when it fails.
 */
export function runDocusaurus(command, locale, extraArgs, {cwd}) {
  assertSupportedLocale(locale);
  const result = spawnSync(
    process.execPath,
    [docusaurusBin, command, '--locale', locale, ...extraArgs],
    {
      cwd,
      env: {...process.env, DOCS_BUILD_LOCALE: locale},
      stdio: 'inherit',
    },
  );
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
