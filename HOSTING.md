# 호스팅과 배포

`main`에 병합되면 같은 소스를 세 곳에 배포합니다. 정식 호스트는 아직 정하지 않았습니다.

| 호스팅 | 배포 방식 | 주소 | `baseUrl` | 옛 주소 301 | 설정 위치 |
|---|---|---|---|---|---|
| **Amazon CloudFront** | AWS CodePipeline(`main` push 트리거) | `*.cloudfront.net` 기본 도메인 | `/` | ✅ CloudFront Function | `infra/` |
| **GitHub Pages** | GitHub Actions `Deploy to GitHub Pages` | [aws-ps-korea-tech.github.io/technical-documents](https://aws-ps-korea-tech.github.io/technical-documents/) | `/technical-documents/` | ❌ 404 | `.github/workflows/deploy-pages.yml` |
| **Netlify** | Netlify Git 연동(`main`과 PR 미리보기) | [aws-ps-tech-docusaurus.netlify.app](https://aws-ps-tech-docusaurus.netlify.app/) | `/` | ✅ `_redirects` | `netlify.toml` |

세 곳 모두 `npm run build`로 한국어 사이트와 영어 사이트(`/en/`)를 함께 빌드하고, `build/`를 게시합니다.

## 옛 주소 리디렉션

`static/_redirects`에는 옛 BookStack 주소와 이전 영어 주소의 301 규칙이 있습니다(경로 113개, 끝 슬래시 변형 포함 226줄).

- **CloudFront**: `infra/lib/redirect-function.js`가 `static/_redirects`를 viewer-request CloudFront Function으로 변환합니다. 함수 크기 한도는 10KB이며, `infra` 테스트는 90%(9,216바이트)를 넘으면 실패합니다.
- **Netlify**: `build/_redirects`를 그대로 읽어 301로 응답합니다.
- **GitHub Pages**: 서버 측 리디렉션이 없습니다. 서브패스(`/technical-documents/`)로 서빙되므로 옛 주소는 404가 됩니다.

## Amazon CloudFront

- 구성과 배포 명령은 [`infra/README.md`](infra/README.md)에 있습니다. 스택은 `AwsPsTechDocsSite`(S3, CloudFront, WAF, CloudFront Function)와 `AwsPsTechDocsPipeline`(CodePipeline, CodeBuild)입니다.
- 파이프라인 소스는 AWS CodeConnections(GitHub)입니다. `aws-ps-korea-tech` 조직에 AWS Connector for GitHub 앱이 설치되어 있어야 `main` push로 자동 실행됩니다. 앱이 없으면 수동 실행만 됩니다.
- CodeBuild가 빌드 산출물에서 NUL 바이트를 제거하고 `infra/scripts/check-build.js`로 검사한 뒤 S3에 동기화합니다. 해시가 붙은 `assets/`와 `en/assets/`는 1년 immutable 캐시로, 나머지는 재검증 캐시로 올립니다.
- `DEPLOY_URL`은 파이프라인이 CloudFront 도메인으로 설정합니다. 사용자 지정 도메인으로 전환하면 CDK 컨텍스트 `siteUrl`로 지정합니다.

  ```bash
  npx cdk deploy AwsPsTechDocsPipeline -c codeConnectionArn=<CodeConnections ARN> -c siteUrl=https://<도메인>
  ```

## GitHub Pages

- Settings → Pages → Source를 GitHub Actions로 둡니다.
- 워크플로가 `DEPLOY_URL=https://aws-ps-korea-tech.github.io`, `DEPLOY_BASE_URL=/technical-documents/`로 빌드합니다.
- 옛 주소 301이 동작하지 않으므로, GitHub Pages만 쓰려면 처음부터 `slug`를 바꾸지 않는 것이 중요합니다.

## Netlify

- Netlify 사이트가 이 저장소에 Git으로 연결되어 있고, `netlify.toml`(`npm run build`, `build`, Node 22)을 사용합니다. PR마다 미리보기 배포가 만들어집니다.
- `DEPLOY_BASE_URL`을 설정하지 않으므로 루트(`/`)로 서빙합니다.
- Netlify는 빌드 환경에 `DEPLOY_URL`을 배포마다 고유한 주소로 자동 설정합니다. 이 저장소도 같은 이름의 변수를 사이트 주소로 쓰기 때문에, Netlify 빌드의 canonical과 `og:url`은 `https://<배포 ID>--aws-ps-tech-docusaurus.netlify.app/...`를 가리킵니다.

## 운영 중인 사이트의 주소 설정

- 각 사이트는 자기 주소를 canonical, `og:url`, sitemap에 씁니다(`DEPLOY_URL`로 주입). 같은 내용이 여러 주소에 있으므로 검색엔진에는 중복으로 보일 수 있습니다. 정식 호스트를 정하면 나머지 호스팅을 정리하거나 `noindex`를 적용하세요.
- `static/robots.txt`에는 `Sitemap:` 줄을 두지 않습니다. 사이트마다 주소가 달라 하나로 고정할 수 없으므로, 각 사이트의 `/sitemap.xml`을 검색 콘솔에 직접 제출하세요.
- 호스팅을 하나 정리할 때는 해당 설정(`infra/`, `.github/workflows/deploy-pages.yml`, `netlify.toml`)과 `docusaurus.config.js`의 기본 `siteUrl`을 함께 정리합니다.
