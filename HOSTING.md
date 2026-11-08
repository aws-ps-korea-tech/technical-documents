# Docusaurus — 호스팅 옵션별 배포 설정

| 플랫폼 | build | output | baseUrl | 301 | 설정 |
|---|---|---|---|---|---|
| **Cloudflare Pages** (권장) | `npm run build` | `build` | `/` | ✅ | 대시보드 |
| **Netlify** | (netlify.toml) | `build` | `/` | ✅ | `netlify.toml` |
| **GitHub Pages** | (자동) | `build` | `/technical-documents/` | ❌ meta | workflow (DEPLOY_BASE_URL=/technical-documents/) |

## Cloudflare Pages (권장)
- Connect to Git → `docusaurus`. Build: `npm run build`, Output: `build`. 환경변수 없음(루트). `static/_redirects` 자동 301.

## Netlify
- Import from Git → `docusaurus`. `netlify.toml` 자동 인식.

## GitHub Pages
- Settings→Pages→Source=GitHub Actions. `.github/workflows/deploy-pages.yml`이 main에 push될 때마다 `DEPLOY_URL`·`DEPLOY_BASE_URL=/technical-documents/`로 빌드해 배포합니다.
- 현재 CloudFront(`infra/`)와 GitHub Pages를 동시에 운영합니다. 운영 결과를 본 뒤 한쪽을 유지할 예정입니다. 한쪽을 정리할 때는 이 워크플로(또는 `infra/`)를 함께 제거하세요.
- 서브패스로 서빙되므로 `static/_redirects`의 옛 URL 301은 동작하지 않습니다.

> 루트 서빙(CF/Netlify)일 때만 `static/_redirects` 108개가 진짜 301로 동작합니다.
