# AWS 공공부문 기술 가이드 기여 안내

이 저장소는 AWS 공공부문 고객과 파트너가 활용할 수 있는 공개 기술 자료를 관리합니다. AWS Korea Public Sector 기술 기여자가 작성·관리하는 비공식 기술 자료이며, AWS 공식 문서를 대체하지 않습니다.

## 가장 중요한 공개 원칙

이 저장소의 모든 파일과 Git 이력은 불특정 독자가 볼 수 있다고 가정합니다.

- 웹 빌드에서 제외된 `draft`와 `review` 문서도 공개 가능한 내용만 포함해야 합니다.
- 고객별 자료, 고객 데이터, 실제 계정·리소스 식별자와 Amazon 내부 정보는 커밋하지 않습니다.
- 진짜 비공개 자료는 별도의 접근 통제된 저장소에서 관리합니다.
- 비공개 정보를 발견하면 새 커밋으로만 지우지 말고 저장소 관리자에게 Git 이력 점검을 요청합니다.

## 작업 도구

- Git
- GitHub CLI(`gh`)
- Node.js 22 (`.nvmrc` 기준)
- npm

## 문서 유형

이 저장소는 Docusaurus의 별도 `blog` 기능을 사용하지 않습니다. 여기서 “블로그 문서”는 `docs/` 아래에 작성하는 Markdown 기술 문서를 뜻합니다.

| `contentType` | 표시 이름 | 용도 |
|---|---|---|
| `overview` | 개요 | 서비스나 기술을 처음 이해하는 문서 |
| `getting-started` | 시작하기 | 도입에 필요한 개념과 준비사항 |
| `hands-on` | 실습 | 독자가 직접 실행하는 단계별 절차 |
| `architecture` | 아키텍처 | 여러 서비스를 조합한 설계와 선택 기준 |
| `performance-cost` | 성능·비용 분석 | 측정 조건과 결과를 포함한 분석 |
| `troubleshooting` | 문제 해결 | 증상, 원인, 확인 방법과 해결 절차 |
| `compliance` | 규제·거버넌스 | 보안, 규제와 운영 통제 안내 |
| `reference` | 참고 자료 | 명령어, 설정, 링크와 용어 정리 |
| `field-note` | 현장 기술 노트 | 특정 시점과 환경에서 얻은 실무 경험 |

현장 기술 노트도 검증 날짜, AWS 리전, 서비스·도구 버전, 관찰한 사실, 작성자의 해석과 일반화할 수 없는 조건을 밝혀야 합니다.

### 유형별 템플릿

| 문서 | 템플릿 | `contentType` |
|---|---|---|
| 서비스 개요, 시작 안내, 참고 자료, 문제 해결, 규제 안내 | `templates/docs/base.md` | `overview`, `getting-started`, `reference`, `troubleshooting`, `compliance` |
| 단계별 실습 | `templates/docs/hands-on.md` | `hands-on` |
| 아키텍처와 선택 기준 | `templates/docs/architecture.md` | `architecture` |
| 현장 관찰, 성능 또는 비용 분석 | `templates/docs/field-note.md` | `field-note`, `performance-cost` |

문서 유형은 페이지의 구성과 검증 기준을 결정합니다. `templates/docs/architecture.md`에는 `./_assets/architecture.png` 예시가 있으므로 실제 이미지를 같은 경로에 추가하거나, 이미지가 필요하지 않으면 해당 Markdown 이미지 줄을 삭제해야 합니다.

## 언어와 번역

- 한국어 문서는 설명 문장을 한국어로 작성합니다.
- 영어 문서는 자연스러운 영어 문장으로 작성합니다.
- AWS 서비스명, API 이름, 코드, 명령어와 파일명은 원래 표기를 유지합니다.
- 한·영 동시 발행을 권장하지만 필수로 강제하지 않습니다. 한 언어만 준비된 문서도 해당 언어에서 발행할 수 있습니다.
- 자동 번역은 초안으로 사용할 수 있지만 기술 검토와 언어 검토 전에는 발행하지 않습니다.
- 같은 문서의 번역본은 동일한 `contentId`, 상대 경로, `slug`와 명시적 문단 ID를 사용합니다.
- 원문이 변경되면 영향받는 번역을 `outdated`로 표시하고 다시 검토합니다.
- 전문 용어는 처음 등장할 때 일반 독자가 이해할 수 있는 말로 설명합니다.

번역 파일은 Docusaurus 표준 위치에 둡니다.

- 한국어 기본 문서: `docs/<path>.md`
- 영어 번역: `i18n/en/docusaurus-plugin-content-docs/current/<path>.md`
- 향후 일본어 번역: `i18n/ja/docusaurus-plugin-content-docs/current/<path>.md`

사이트 설정에서 활성화된 언어만 운영 빌드에 포함됩니다. 새 언어는 해당 언어의 홈페이지, 내비게이션, 검색과 검토된 문서가 준비된 뒤 활성화합니다.

내부 문서 링크에는 루트 절대 주소보다 상대 Markdown 링크를 사용합니다. 상대 링크는 현재 언어의 대응 문서로 연결하기 쉽습니다.

## 문서 메타데이터

새 문서는 `templates/docs/`의 유형별 템플릿에서 시작합니다. 프런트 매터는 Markdown 파일 맨 위의 `---` 사이에 있는 문서 설정입니다. 실습 문서 예시는 다음과 같습니다.

```yaml
---
draft: true
title: "AWS HealthOmics 예제 워크플로 실행하기"
description: "예제 워크플로를 AWS HealthOmics에 등록하고 결과를 검증하는 단계별 가이드"
slug: /omics-on-aws/aws-healthomics/healthomics-example-workflow
keywords:
  - AWS HealthOmics
  - workflow
tags:
  - aws-healthomics
  - workflow
customProps:
  contentId: healthomics-example-workflow
  locale: ko
  sourceLocale: ko
  publicationStatus: draft
  translationStatus: source
  sectors:
    - healthcare-life-sciences
    - education-research
  audiences:
    - customer
    - partner
    - researcher
  contentType: hands-on
  level: intermediate
  awsServices:
    - AWS HealthOmics
    - Amazon S3
  maintainers:
    - <GITHUB_LOGIN>
  lastReviewed: null
---
```

`<GITHUB_LOGIN>`은 예시 표시입니다. 그대로 두면 검증에 실패하므로 문서를 관리할 실제 GitHub 로그인으로 반드시 바꿉니다.

주요 규칙:

- `slug`는 `/`로 시작하고 영문 소문자, 숫자, 하이픈을 사용합니다. 끝에는 `/`를 붙이지 않습니다.
- `contentId`는 문서마다 고유하며 번역본에서도 동일해야 합니다.
- `maintainers`에는 문서 최신성을 관리할 GitHub 로그인을 적습니다.
- `lastReviewed`에는 실제 기술 검토를 마친 날짜를 `YYYY-MM-DD`로 기록합니다.
- 작성 중에는 `draft: true`와 `publicationStatus: draft`를 함께 둡니다.
- 발행할 때 `draft: true`를 제거하고 `publicationStatus: published`로 변경합니다.

허용되는 메타데이터 값은 [프런트 매터 스키마](schemas/doc-frontmatter.schema.json)에서 확인할 수 있습니다.

### 발행 상태

| 상태 | 운영 사이트 | 의미 |
|---|---:|---|
| `draft` | 제외 | 작성 중 |
| `review` | 제외 | 기술 또는 언어 검토 중 |
| `published` | 포함 | 해당 언어에서 검토 완료 |
| `archived` | 제한적 포함 | 기존 주소는 유지하지만 현재 권장하지 않음 |

`publicationStatus`가 `draft` 또는 `review`이면 Docusaurus의 최상위 `draft: true`도 함께 설정해야 합니다. `published` 또는 `archived`로 전환할 때는 `draft`를 제거하거나 `false`로 바꿉니다. 검증기가 두 값을 비교해 발행 상태와 실제 빌드 동작이 어긋나는 것을 차단합니다.

### 번역 상태

| 상태 | 의미 |
|---|---|
| `source` | 이 파일이 원문 |
| `current` | 현재 원문을 반영한 번역 |
| `needs-review` | 번역은 있으나 검토 전 |
| `outdated` | 원문 변경 이후 다시 검토하지 않음 |

번역본에는 번역이 기준으로 삼은 원문의 Git 커밋을 `translatedFrom`에 기록합니다.

## 기술 문서 작성 원칙

- 문서 첫 부분에서 독자가 해결하려는 문제와 읽은 뒤 얻게 될 결과를 설명합니다.
- 명령어는 그대로 복사해 실행할 수 있어야 합니다.
- 명령어에서 `...` 또는 “앞과 동일”을 사용하지 않습니다.
- 실제 값에는 `<ACCOUNT_ID>`, `<AWS_REGION>`, `<VPC_ID>`처럼 의미가 분명한 자리표시자를 사용하고 값을 확인하는 방법을 설명합니다.
- 정적 액세스 키, 비밀 키, 세션 토큰과 비밀번호를 문서나 이미지에 넣지 않습니다.
- 인증은 AWS CLI 프로필, IAM 역할 또는 해당 서비스가 권장하는 방식을 사용합니다. IAM은 누가 어떤 AWS 작업을 할 수 있는지 제어하는 권한 체계입니다.
- 비용이 발생하는 실습에는 리소스 정리 절차를 포함합니다.
- 실행하지 않은 명령이나 검증하지 않은 결과를 검증된 것처럼 표현하지 않습니다.
- 한 번만 실행한 측정 결과를 “항상”, “매번” 또는 “일관되게”라고 표현하지 않습니다.
- AWS 서비스 기능, 리전, 제한과 가격처럼 바뀔 수 있는 정보에는 확인 날짜와 공식 출처를 표시합니다.

## 출처

출처는 다음 순서로 우선합니다.

1. AWS 공식 설명서
2. AWS 공식 블로그와 GitHub 저장소
3. 서비스 제공자가 관리하는 공식 설명서
4. 재현 가능한 직접 실험
5. 제3자 자료

성능·비용 결과에는 측정 날짜, 리전, 서비스·도구 버전, 입력 조건, 반복 횟수와 실제 측정인지 계산인지 구분해 기록합니다.

## 실습 문서

실습에는 다음 항목을 포함합니다.

- 대상 독자와 사전 지식
- 필요한 계정, 도구와 IAM 권한 범위
- 검증한 리전, 날짜와 버전
- 단계별 절차와 예상 결과
- 성공 확인 방법
- 자주 발생하는 오류
- 비용이 발생하는 리소스
- 리소스 정리 절차
- 운영 환경 적용 전 주의사항

## 이미지와 첨부 자료

- 실제 계정 ID, 사용자 이름, 이메일, 고객 데이터와 리소스 ID를 제거합니다.
- 브라우저 주소창, 터미널 프롬프트와 내부 URL을 확인합니다.
- 이미지마다 내용을 설명하는 대체 텍스트를 작성합니다.
- 이미지 안에 설명 문구가 있으면 언어별 이미지를 사용합니다.
- 외부 이미지 링크보다 저장소에서 관리하는 이미지를 사용합니다.
- 고객 화면이나 고객 데이터를 사용하지 않습니다.

## 규제 문서

- 법률 또는 규제 자문으로 표현하지 않습니다.
- AWS의 책임과 고객의 책임을 구분합니다.
- AWS 인증서를 내려받는 것과 고객이 인증을 획득하는 것을 혼동하지 않습니다.
- 적용 여부는 고객 환경과 감사기관의 판단에 따라 달라질 수 있음을 밝힙니다.
- 공식 규제·인증 자료와 확인 날짜를 포함합니다.

## 문서 게시 절차

전체 흐름은 다음과 같습니다.

1. 문서 유형에 맞는 템플릿을 복사합니다.
2. 원문 언어와 고유한 `contentId`를 정합니다.
3. `publicationStatus: draft`로 작성합니다.
4. 기술 내용, 명령어, 링크와 공개 가능성을 확인합니다.
5. 번역이 있으면 동일한 상대 경로와 `contentId`로 추가합니다.
6. 기술·언어 검토가 끝난 언어만 `published`로 변경합니다.
7. 로컬 검사를 실행하고 결과를 PR에 기록합니다.

아래는 한국어 문서를 처음 게시하는 단계별 절차입니다.

### 1. 저장소 준비

새로 클론하는 경우:

```bash
REPO_URL="https://github.com/aws-ps-korea-tech/technical-documents.git"
REPO_DIR="$HOME/technical-documents"
git clone "$REPO_URL" "$REPO_DIR"
cd "$REPO_DIR"
npm ci
```

기존 클론을 사용하는 경우:

```bash
REPO_DIR="$HOME/technical-documents"
cd "$REPO_DIR"
git status --short
git switch main
git pull --ff-only origin main
npm ci
```

예상하지 않은 로컬 변경이 있으면 덮어쓰거나 삭제하지 말고 먼저 변경의 목적을 확인하세요.

### 2. 브랜치와 문서 생성

다음 변수의 예시 값을 새 문서에 맞게 바꾼 뒤 실행합니다.

```bash
REPO_DIR="$HOME/technical-documents"
TOPIC_SLUG="healthomics-example-workflow"
COLLECTION="omics-on-aws/aws-healthomics"
DOCUMENT_NAME="healthomics-example-workflow"
BRANCH_NAME="docs/${TOPIC_SLUG}"
DOCUMENT_PATH="docs/${COLLECTION}/${DOCUMENT_NAME}.md"
cd "$REPO_DIR"
git switch main
git pull --ff-only origin main
git switch -c "$BRANCH_NAME"
mkdir -p "$(dirname "$DOCUMENT_PATH")"
cp templates/docs/hands-on.md "$DOCUMENT_PATH"
```

이 예시는 `contentType: hands-on` 실습 문서를 만들기 때문에 `hands-on.md`를 사용합니다. 다른 유형이면 앞의 템플릿 표에서 해당 파일을 선택합니다.

### 3. 프런트 매터 작성

[문서 메타데이터](#문서-메타데이터)의 예시와 주요 규칙에 따라 작성합니다. 작성 중에는 `draft: true`와 `publicationStatus: draft`를 함께 둡니다.

### 4. 본문 작성

프런트 매터의 `title`이 페이지 제목이므로 같은 H1을 본문에 다시 쓰지 않습니다. 본문은 H2부터 시작합니다.

```markdown
## 한눈에 보기 {#summary}

이 문서가 해결하는 문제와 독자가 얻게 될 결과를 설명합니다.

## 사전 준비 {#prerequisites}

필요한 계정, 도구와 IAM 권한을 설명합니다.

## 결과 확인 {#verification}

성공 여부를 확인하는 방법을 설명합니다.

## 리소스 정리 {#cleanup}

비용이 계속 발생하는 리소스와 안전한 정리 순서를 설명합니다.
```

위 본문은 구조를 보여 주는 발췌 예시입니다. 실제 문서에서는 선택한 템플릿의 나머지 필수 절을 유지하고 내용을 채웁니다.

작성 기준:

- 모든 H2~H6 제목에 영문 소문자·숫자·하이픈으로 된 `{#heading-id}`를 붙입니다.
- 전문 용어는 처음 등장할 때 일상적인 말로 설명합니다.
- 명령어는 그대로 복사해 실행할 수 있도록 모든 인수를 씁니다.
- 명령어에서 `...`나 “앞과 동일”을 사용하지 않습니다.
- 코드 블록에는 `bash`, `json`, `yaml`, `python`, `text` 같은 언어를 지정합니다.
- 검증하지 않은 명령이나 결과를 검증된 것처럼 표현하지 않습니다.
- 가격, 리전, 버전과 측정 결과에는 확인 날짜와 공식 출처를 표시합니다.
- 실습에는 성공 확인과 비용 발생 리소스 정리 절차를 포함합니다.

자세한 내용은 [기술 문서 작성 원칙](#기술-문서-작성-원칙)을 따릅니다.

### 5. 이미지 추가

```bash
DOCUMENT_PATH="docs/omics-on-aws/aws-healthomics/healthomics-example-workflow.md"
ASSET_DIR="$(dirname "$DOCUMENT_PATH")/_assets"
mkdir -p "$ASSET_DIR"
cp "$HOME/Downloads/workflow-result.png" "$ASSET_DIR/workflow-result.png"
```

본문에서 상대 경로로 참조합니다.

```markdown
![워크플로 실행이 완료된 상태와 출력 위치](./_assets/workflow-result.png)
```

이미지는 바이너리 파일이므로 공개 안전성 검사기가 화면 속 문자열을 자동으로 읽지 않습니다. 커밋 전에 실제 파일을 열어 픽셀을 직접 확인합니다.

이미지에서 다음 정보를 제거합니다.

- 실제 AWS 계정 ID, ARN, VPC·서브넷·보안 그룹 ID, 버킷명과 엔드포인트
- 고객명, 이메일, 사용자 이름과 고객 데이터
- 비밀 키, 토큰, 비밀번호와 서명된 URL
- 내부 URL과 작성자 컴퓨터의 절대 경로

### 6. 메뉴에 연결

기존 컬렉션 아래에 추가한 한국어 문서는 `sidebars.js`의 **전체 문서**에서 자동으로 발견됩니다.

| 추가 노출 위치 | 수정 파일 |
|---|---|
| 새 최상위 컬렉션 | `sidebars.js` |
| 분야별 목록 | `docs/sectors/<sector>.md` |
| 기술 주제별 목록 | `docs/topics/<topic>.md` |
| 홈페이지 대표 자료 | `src/pages/index.jsx` |

모든 글을 홈페이지에 노출하지 않습니다. 홈페이지에는 주요 진입점과 대표 자료만 선별합니다.

### 7. 초안을 발행 상태로 전환

기술 내용, 문체, 출처와 공개 안전성을 검토한 후 다음처럼 바꿉니다.

```yaml
publicationStatus: published
lastReviewed: "<YYYY-MM-DD>"
```

최상위 `draft: true` 줄은 제거합니다.

### 8. 전체 검증

```bash
REPO_DIR="$HOME/technical-documents"
cd "$REPO_DIR"
git fetch https://github.com/aws-ps-korea-tech/technical-documents.git main
BASE_SHA="$(git merge-base HEAD FETCH_HEAD)"
npm run check
node scripts/validate.mjs --changed-from "$BASE_SHA"
node infra/scripts/strip-nul.js build
node infra/scripts/check-build.js build
npm --prefix infra ci --no-audit --no-fund
npm --prefix infra run build
npm --prefix infra test
git diff --check
```

`npm run check`는 검증기 테스트, 문서·다국어·공개 안전성 검사와 한국어·영어 전체 빌드를 실행합니다. 작성 중 한 언어만 빠르게 빌드하려면 `npm run build:ko` 또는 `npm run build:en`을 사용합니다.

기존 문서의 경고는 표시될 수 있습니다. 새 문서 또는 수정한 문서에서 `ERROR`가 나오면 PR을 만들기 전에 해결해야 합니다.

### 9. 로컬 미리보기

```bash
npm run build
npm run serve -- --host 127.0.0.1 --port 4173 --no-open
```

- 한국어: `http://127.0.0.1:4173/`
- 영어: `http://127.0.0.1:4173/en/`

개발 서버를 언어별로 실행할 수도 있습니다. `npm start`는 한국어, `npm run start:en`은 영어 사이트를 띄웁니다. 영어 문서는 `DOCS_BUILD_LOCALE`로 선택되므로 `npm start -- --locale en`만으로는 영어 문서가 나오지 않으며, 개발 서버는 한 번에 한 언어만 제공하므로 언어 전환 링크는 `npm run build` 후 `npm run serve`로 확인합니다. 새 메타데이터가 있는 `draft` 또는 `review` 문서는 언어별 선별 목록에서 제외되므로 Docusaurus 개발 서버에는 나타나지 않습니다. 작성 중에는 편집기의 Markdown 미리보기를 사용하고, 실제 기술 검토를 마친 뒤 `publicationStatus: published`와 실제 `lastReviewed` 날짜를 설정한 다음 사이트 화면을 확인합니다. 미리보기만을 위해 검토 날짜를 임의로 작성하지 않습니다.

```bash
npm start -- --host 127.0.0.1 --port 3000
```

```bash
npm run start:en -- --host 127.0.0.1 --port 3001
```

### 10. 커밋과 PR 생성

```bash
REPO_DIR="$HOME/technical-documents"
BRANCH_NAME="docs/healthomics-example-workflow"
DOCUMENT_PATH="docs/omics-on-aws/aws-healthomics/healthomics-example-workflow.md"
cd "$REPO_DIR"
git status --short
git diff --check
git add "$DOCUMENT_PATH"
git commit -m "Add AWS HealthOmics example workflow guide"
git push origin "$BRANCH_NAME"
gh pr create --repo aws-ps-korea-tech/technical-documents --base main --head "$BRANCH_NAME" --web
```

이미지, 메뉴 또는 설정을 수정했다면 해당 파일을 이름으로 지정해 `git add`에 추가합니다. `git add .`이나 `git add -A`로 의도하지 않은 파일을 함께 올리지 않습니다.

원본 저장소에 쓰기 권한이 없다면 개인 포크에 브랜치를 푸시합니다. `<GITHUB_LOGIN>`은 실제 GitHub 로그인으로 바꿉니다.

```bash
REPO_DIR="$HOME/technical-documents"
GITHUB_LOGIN="<GITHUB_LOGIN>"
BRANCH_NAME="docs/healthomics-example-workflow"
cd "$REPO_DIR"
gh repo fork aws-ps-korea-tech/technical-documents --clone=false
git remote get-url personal >/dev/null 2>&1 || git remote add personal "https://github.com/${GITHUB_LOGIN}/technical-documents.git"
git push personal "$BRANCH_NAME"
gh pr create --repo aws-ps-korea-tech/technical-documents --base main --head "${GITHUB_LOGIN}:${BRANCH_NAME}" --web
```

## 영어 번역 게시

영어 번역은 한국어 원문이 `main`에 병합된 뒤 별도 PR로 만드는 방식을 권장합니다.

### 1. 원문 커밋 확인

```bash
REPO_DIR="$HOME/technical-documents"
KOREAN_DOCUMENT_PATH="docs/omics-on-aws/aws-healthomics/healthomics-example-workflow.md"
cd "$REPO_DIR"
git switch main
git pull --ff-only origin main
SOURCE_REVISION="$(git log -1 --format=%H -- "$KOREAN_DOCUMENT_PATH")"
printf '%s\n' "$SOURCE_REVISION"
```

### 2. 같은 상대 경로에 영어 파일 생성

```bash
BRANCH_NAME="translate/en-healthomics-example-workflow"
ENGLISH_DOCUMENT_PATH="i18n/en/docusaurus-plugin-content-docs/current/${KOREAN_DOCUMENT_PATH#docs/}"
git switch -c "$BRANCH_NAME"
mkdir -p "$(dirname "$ENGLISH_DOCUMENT_PATH")"
cp "$KOREAN_DOCUMENT_PATH" "$ENGLISH_DOCUMENT_PATH"
```

영어 파일에서 다음 항목을 설정합니다.

```yaml
customProps:
  contentId: healthomics-example-workflow
  locale: en
  sourceLocale: ko
  publicationStatus: published
  translationStatus: current
  translatedFrom: <SOURCE_REVISION>
  lastReviewed: "<YYYY-MM-DD>"
```

`<SOURCE_REVISION>`과 `<YYYY-MM-DD>`는 그대로 두지 않습니다. 앞에서 확인한 실제 원문 커밋 SHA와 실제 영문 기술 검토 날짜로 바꾸고, 최상위 `draft: true`가 남아 있지 않은지 확인합니다. 다음 항목은 반드시 같아야 합니다.

- `docs/`와 `i18n/en/docusaurus-plugin-content-docs/current/` 뒤의 상대 경로
- `contentId`
- `slug`
- 모든 H2~H6의 문단 ID

영문 문서를 공개하려면 다음 파일도 수정합니다.

- `sidebars.en.js`: 발행된 영문 문서의 ID 추가. 예: `omics-on-aws/aws-healthomics/healthomics-example-workflow`
- `config/i18n-routes.json`: 발행된 영문 문서의 `slug` 추가
- `scripts/__tests__/i18n-content.test.mjs`: `English build includes only reviewed localized documents` 테스트의 예상 문서 목록에 상대 경로를 알파벳 순서로 추가

`draft` 또는 `review` 상태의 번역은 사이드바와 `config/i18n-routes.json`에 추가하지 않습니다. 세 파일을 갱신한 뒤 `npm run test:validators`로 발행 문서, 경로 목록과 테스트 기대값이 일치하는지 확인합니다.

번역 파일 옆의 `_assets`에 필요한 이미지를 복사하고 영문 대체 텍스트를 작성합니다.

```bash
KOREAN_DOCUMENT_PATH="docs/omics-on-aws/aws-healthomics/healthomics-example-workflow.md"
ENGLISH_DOCUMENT_PATH="i18n/en/docusaurus-plugin-content-docs/current/${KOREAN_DOCUMENT_PATH#docs/}"
IMAGE_FILE="workflow-result.png"
SOURCE_ASSET_DIR="$(dirname "$KOREAN_DOCUMENT_PATH")/_assets"
ENGLISH_ASSET_DIR="$(dirname "$ENGLISH_DOCUMENT_PATH")/_assets"
mkdir -p "$ENGLISH_ASSET_DIR"
cp "$SOURCE_ASSET_DIR/$IMAGE_FILE" "$ENGLISH_ASSET_DIR/$IMAGE_FILE"
```

자동 번역만 완료된 상태에서는 `publicationStatus: review`, `translationStatus: needs-review`, `draft: true`를 사용합니다.

## PR 검사와 병합

```bash
PR_NUMBER="<PR_NUMBER>"
gh pr checks "$PR_NUMBER" --repo aws-ps-korea-tech/technical-documents
gh pr view "$PR_NUMBER" --repo aws-ps-korea-tech/technical-documents --json state,mergeable,mergeStateStatus,reviewDecision,statusCheckRollup
```

다음 조건을 모두 만족해야 합니다.

- Draft PR이 아님
- `mergeable`이 `MERGEABLE`
- `mergeStateStatus`가 `CLEAN`
- `build` 통과
- `validate` 통과
- 검토 의견과 변경 요청 처리 완료

권한이 있고 검토 정책상 직접 병합해도 되는 경우에만 실행합니다.

```bash
PR_NUMBER="<PR_NUMBER>"
gh pr merge "$PR_NUMBER" --repo aws-ps-korea-tech/technical-documents --squash --delete-branch
```

`main`에 직접 푸시하지 않습니다.

## 병합 후 게시 확인

```bash
PR_NUMBER="<PR_NUMBER>"
gh pr view "$PR_NUMBER" --repo aws-ps-korea-tech/technical-documents --json state,mergedAt,mergedBy,mergeCommit,url
gh run list --repo aws-ps-korea-tech/technical-documents --branch main --workflow "Validate documentation" --limit 3
gh run list --repo aws-ps-korea-tech/technical-documents --branch main --workflow "Deploy to GitHub Pages" --limit 3
```

GitHub Pages URL:

```text
한국어: https://aws-ps-korea-tech.github.io/technical-documents/<SLUG_WITHOUT_LEADING_SLASH>/
영어:   https://aws-ps-korea-tech.github.io/technical-documents/en/<SLUG_WITHOUT_LEADING_SLASH>/
```

익명 사용자 관점에서 페이지, 링크, 이미지, 검색과 언어 전환을 확인합니다.

GitHub Pages 배포가 실패하면 먼저 실패 로그를 확인합니다. `<RUN_ID>`는 실패한 Actions 실행 화면이나 `gh run list`에서 확인한 숫자로 바꿉니다.

```bash
RUN_ID="<RUN_ID>"
gh run view "$RUN_ID" --repo aws-ps-korea-tech/technical-documents --log-failed
```

네트워크나 GitHub Pages 동기화 같은 일시적 실패인 경우에만 실패한 작업을 다시 실행합니다. 문서·빌드 오류라면 먼저 원인을 수정합니다.

```bash
RUN_ID="<RUN_ID>"
gh run rerun "$RUN_ID" --repo aws-ps-korea-tech/technical-documents --failed
```

CloudFront 사이트도 운영 중입니다. AWS 조회 권한이 있으면 스택 출력에서 현재 도메인을 얻어 같은 문서를 익명으로 확인합니다. `<AWS_PROFILE>`은 대상 계정을 조회할 수 있는 최소 권한 CLI 프로필로 바꾸고, `<DOCUMENT_SLUG>`은 앞에 `/`가 있는 실제 문서 slug로 바꿉니다.

```bash
AWS_PROFILE="<AWS_PROFILE>"
AWS_REGION="us-east-1"
STACK_NAME="AwsPsTechDocsSite"
DOCUMENT_SLUG="/omics-on-aws/aws-healthomics/healthomics-example-workflow"
CLOUDFRONT_DOMAIN="$(aws cloudformation describe-stacks --profile "$AWS_PROFILE" --region "$AWS_REGION" --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='DistributionDomain'].OutputValue | [0]" --output text)"
curl --fail --silent --show-error --location "https://${CLOUDFRONT_DOMAIN}${DOCUMENT_SLUG}" >/dev/null
curl --fail --silent --show-error --location "https://${CLOUDFRONT_DOMAIN}/en${DOCUMENT_SLUG}" >/dev/null
```

두 번째 `curl`은 영어판을 함께 발행한 경우에 실행합니다. CloudFront 확인이 실패하면 콘텐츠를 다시 배포하기 전에 CodePipeline 상태를 먼저 확인합니다. `<PIPELINE_REGION>`은 `AwsPsTechDocsPipeline`을 배포한 리전으로 바꿉니다.

```bash
AWS_PROFILE="<AWS_PROFILE>"
PIPELINE_REGION="<PIPELINE_REGION>"
PIPELINE_NAME="aws-ps-tech-docs"
aws codepipeline get-pipeline-state --profile "$AWS_PROFILE" --region "$PIPELINE_REGION" --name "$PIPELINE_NAME"
```

AWS 조회 권한이 없으면 CloudFront 검증을 완료했다고 보고하지 말고 확인하지 못한 항목으로 남깁니다.

## 기존 주소를 변경할 때

공개된 `slug`는 가능한 한 유지합니다. 변경이 불가피하면 `static/_redirects`에 이전 주소를 추가합니다.

```text
/old/path  /new/path/  301
/old/path/  /new/path/  301
```

그 뒤 리디렉션 함수를 검사합니다.

```bash
npm --prefix infra run build
npm --prefix infra test
```

CloudFront Function의 서비스 제한은 10KB이며, 저장소 테스트는 90%인 9,216바이트를 초과하면 실패해 여유를 확보합니다. 테스트 출력의 `functionBytes`가 이 기준을 넘으면 PR이 차단됩니다. `/books/` 이외의 직접 리디렉션은 끝 슬래시를 정규화하지만, 호스팅별 동작을 명확히 하기 위해 필요한 주소 형태를 테스트해야 합니다. GitHub Pages는 `static/_redirects`를 처리하지 않으므로 처음부터 안정적인 `slug`를 선택하는 것이 중요합니다.

## 기존 문서

새 문서는 모든 규칙을 처음부터 적용합니다. 기존 문서는 수정할 때 새 기준으로 전환합니다.

- 수정하지 않은 기존 문서의 위반은 경고로만 표시되고 CI를 막지 않습니다. 이 경우 별도 예외 등록이 필요하지 않습니다.
- 기존 문서를 한 줄이라도 수정하면 그 파일은 새 기준 전체를 적용받습니다. 새 메타데이터가 없으면 `FRONT_MATTER_SCHEMA` 오류가 나므로, 수정할 때 메타데이터와 위반 사항을 함께 정리해야 합니다.
- 수정한 파일에는 `config/doc-validation-baseline.json`의 예외가 적용되지 않습니다. 이 파일은 수정하지 않은 파일에 대한 추적용 기록이며, 파일과 규칙을 구체적으로 적고 넓은 디렉터리 예외나 모든 규칙을 허용하는 예외는 사용하지 않습니다.
- AWS 액세스 키로 보이는 값(`AWS_ACCESS_KEY`)은 수정 여부와 관계없이 항상 CI를 막습니다. 발견하면 즉시 제거하고 키를 폐기하세요.

## 자주 발생하는 오류

| 오류 | 해결 방법 |
|---|---|
| `FRONT_MATTER_SCHEMA` | 템플릿과 `schemas/doc-frontmatter.schema.json`을 기준으로 필수 값 수정 |
| `DUPLICATE_SLUG` 또는 duplicate route | 다른 문서와 겹치지 않는 `slug` 선택 |
| `NON_CANONICAL_SLUG` | 연속 슬래시와 끝 슬래시 제거 |
| `DRAFT_BUILD_FLAG_MISSING` | 초안·검토 상태에 최상위 `draft: true` 추가 |
| `PUBLISHED_MARKED_DRAFT` | 발행 문서에서 `draft: true` 제거 |
| `IMAGE_ALT_MISSING` | 이미지가 전달하는 내용을 대체 텍스트로 작성 |
| `IMAGE_NOT_FOUND` | 이미지 상대 경로, 파일명 대소문자와 번역본 `_assets` 확인 |
| `TRANSLATION_PATH_MISMATCH` | 원문과 번역의 상대 경로를 동일하게 맞춤 |
| `TRANSLATION_SLUG_MISMATCH` | 원문과 번역의 `slug`를 동일하게 맞춤 |
| `TRANSLATED_FROM_MISSING` | 원문이 병합된 뒤 실제 커밋 SHA 기록 |
| `EXPLICIT_HEADING_IDS_MISSING` | 모든 H2~H6에 같은 `{#shared-id}` 추가 |
| `AWS_ACCOUNT_ID`, `AWS_ARN`, `AWS_RESOURCE_ID` | 실제 식별자를 일반 자리표시자로 교체 |
| `AWS_ACCESS_KEY` | 즉시 제거하고 실제 키라면 폐기 |
| `INTERNAL_URL` | 공개 AWS 문서나 공개 GitHub 링크로 교체 |

## 게시 전 최종 확인

- [ ] 문서 유형에 맞는 템플릿을 사용했다.
- [ ] 프런트 매터 필수 항목을 모두 작성했다.
- [ ] `slug`와 `contentId`가 고유하다.
- [ ] 모든 H2~H6에 명시적 문단 ID가 있다.
- [ ] 코드 블록마다 언어를 지정했다.
- [ ] 전문 용어를 일반 독자가 이해할 수 있게 설명했다.
- [ ] 가격·리전·측정 정보에 날짜와 공식 출처가 있다.
- [ ] 이미지에 대체 텍스트가 있다.
- [ ] 고객 정보, 실제 AWS 식별자, 자격 증명과 내부 정보가 없다.
- [ ] `npm run check`와 인프라 검사가 성공했다.
- [ ] PR의 `build`와 `validate`가 통과했다.
- [ ] 병합 후 공개 URL을 익명 사용자 관점에서 확인했다.
