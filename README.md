# AWS Public Sector Technical Documents

AWS 공공부문 고객과 파트너를 위한 공개 기술 가이드, 실습, 아키텍처와 현장 기술 노트를 관리하는 저장소입니다. [Docusaurus](https://docusaurus.io/)로 한국어 사이트와 검토된 문서만 모은 영어 사이트를 함께 빌드합니다.

- [한국어 사이트](https://aws-ps-korea-tech.github.io/technical-documents/)
- [English site](https://aws-ps-korea-tech.github.io/technical-documents/en/)

> 이 저장소의 자료는 AWS Korea Public Sector 기술 기여자가 작성·관리하는 비공식 기술 자료이며 AWS 공식 문서를 대체하지 않습니다. 최신 기능, 제공 리전과 요금은 [AWS 공식 문서](https://docs.aws.amazon.com/)에서 확인하세요.

## 다루는 내용

문서는 독자가 AWS 서비스명을 몰라도 찾을 수 있도록 분야와 기술 주제로 묶여 있습니다.

| 구분 | 내용 |
|---|---|
| 분야별 가이드 | 정부·공공기관, 교육·연구, 헬스케어·생명과학 |
| 기술 주제 | AI·머신러닝, 데이터·스토리지·전송, 컴퓨팅·고성능 컴퓨팅, 워크플로·자동화, 보안·규제 준수 |
| 문서 유형 | 개요, 시작하기, 실습, 아키텍처, 성능·비용 분석, 문제 해결, 규제·거버넌스, 참고 자료, 현장 기술 노트 |
| 언어 | 한국어가 기본입니다. 기술·언어 검토를 마친 문서만 영어판으로 발행합니다. |

## 저장소 구조

| 경로 | 용도 |
|---|---|
| `docs/` | 한국어 원문과 한국어 전용 문서 |
| `i18n/en/docusaurus-plugin-content-docs/current/` | 검토된 영어 번역 |
| `templates/docs/` | 문서 유형별 시작 템플릿 |
| `schemas/doc-frontmatter.schema.json` | 문서 메타데이터 스키마 |
| `sidebars.js` | 한국어 사이드바 |
| `sidebars.en.js` | 영어 사이드바 |
| `config/i18n-routes.json` | 영어판이 실제로 존재하는 공개 경로 |
| `src/pages/index.jsx` | 한국어·영어 홈페이지 |
| `static/_redirects` | 이전 주소의 301 리디렉션 |
| `scripts/` | 빌드와 검증 도구 |
| `infra/` | CloudFront 호스팅과 배포 파이프라인(AWS CDK), 배포 전 산출물 검사와 리디렉션 테스트 |

## 로컬에서 실행하기

Node.js 22(`.nvmrc` 기준)와 npm이 필요합니다.

```bash
npm ci
npm run build
npm run serve -- --host 127.0.0.1 --port 4173 --no-open
```

- 한국어: `http://127.0.0.1:4173/`
- 영어: `http://127.0.0.1:4173/en/`

`npm run check`는 검증기 테스트, 문서·다국어·공개 안전성 검사와 한국어·영어 전체 빌드를 한 번에 실행합니다.

## 배포

`main`에 병합되면 GitHub Actions가 GitHub Pages에, AWS CodePipeline이 CloudFront에 각각 배포합니다. 두 사이트는 현재 함께 운영 중입니다. 호스팅별 설정과 차이는 [호스팅 안내](HOSTING.md)와 [`infra/README.md`](infra/README.md)를 참고하세요.

## 기여하기

이 저장소의 모든 파일과 Git 이력은 공개됩니다. 웹 빌드에서 제외되는 초안에도 고객 정보, 실제 AWS 식별자, 자격 증명과 공개할 수 없는 정보를 넣지 마세요.

- [기여 안내](CONTRIBUTING.md): 작성 기준, 메타데이터, 문서 게시와 번역 절차, PR 검사와 배포 확인
- [AI 에이전트 작업 규칙](AGENTS.md): 이 저장소에서 작업하는 AI 에이전트가 따르는 규칙
