# Infrastructure (AWS CDK)

CDK app for hosting this Docusaurus site on Amazon CloudFront and for redirecting
`awspstech.kr` to `aws-ps-tech.kr`. Netlify hosting is unaffected.

| Stack | Region | Contents |
|---|---|---|
| `AwsPsTechDocsSite` | us-east-1 | Private S3 bucket (OAC), CloudFront distribution, WAF web ACL, CloudFront Function, CloudFront flat-rate **Free** plan subscription |
| `AwsPsTechDocsPipeline` | Region of the GitHub connection | CodePipeline (V2) + CodeBuild: deploys on every push to `main` |
| `AwsPsTechDocsRum` | ap-northeast-2 | CloudWatch RUM app monitor (no cookies, 100% sampling) with Cognito guest access, and the `aws-ps-tech-docs-rum` CloudWatch dashboard (traffic, Core Web Vitals p75, load time, errors) |
| `AwsPsTechDocsRumBudget` | us-east-1 | Monthly $5 cost budget on the RUM events usage type (`APN2-CW:RUM-events`) with e-mail alerts at 80% / 100% actual and 100% forecast. Only synthesized with `-c budgetEmails=a@example.com` (addresses are not committed); change the limit with `-c rumBudgetUsd=10` |
| `AwspstechZone` | us-east-1 | Route 53 hosted zone for `awspstech.kr` |
| `AwspstechRedirect` | us-east-1 | Pay-as-you-go CloudFront + ACM certificate: `awspstech.kr`, `www.awspstech.kr` -> `https://aws-ps-tech.kr/` (301). Only synthesized with `-c awspstechCutover=true` |

No account IDs or ARNs are committed: the account comes from the deploying profile and
the GitHub connection ARN is passed on the command line.

## Edge logic: one CloudFront Function

`lib/redirect-function.js` turns `../static/_redirects` into a viewer-request function:

- `/books/...` (old BookStack URLs) -> **301** to the new path (compact table)
- other entries in `static/_redirects` (for example earlier English URLs) -> **301** from a direct table
- everything else -> appends `index.html` to directory-style URLs (S3 with OAC has no index documents)

Targets are stored decoded and percent-encoded at the edge with `encodeURI()`, so the
`Location` header is percent-encoded.

The CloudFront Functions size quota is 10 KB and cannot be raised; generation fails if the
table outgrows it, and `npm test` fails above 90% (9,216 bytes). Today: 113 redirects,
8,720 bytes. The next step would be CloudFront KeyValueStore, which is not included in the
Free plan.

```bash
npm test   # every line of static/_redirects plus index.html rewrites and the size headroom
```

## Deploy pipeline

On every push to `main` CodeBuild runs `npm ci`, `npm run build`, strips NUL bytes that
Docusaurus 3.9 can emit in sidebar labels, republishes the CloudFront Function when
`static/_redirects` changed, syncs `build/` to S3 (hashed `assets/` and `en/assets/` as
immutable, the rest with revalidation) and invalidates `/*`.

The source action uses AWS CodeConnections. Pushes to `main` trigger the pipeline only when
the AWS Connector for GitHub app is installed on the `aws-ps-korea-tech` organization with
access to this repository; otherwise the pipeline runs only when started manually.

## Commands

Requires Node 22 and credentials for the target account (for example an SSO profile).

```bash
cd infra
npm ci
CONN=<CodeConnections ARN with access to the GitHub repository>

npx cdk deploy AwsPsTechDocsSite AwspstechZone AwsPsTechDocsPipeline -c codeConnectionArn=$CONN
```

### awspstech.kr redirect (two steps)

1. `AwspstechZone` creates the hosted zone with records that mirror the current hosting.kr DNS
   (apex A to the hosting.kr forwarder, `www` and `*` CNAME to GitBook), so changing the name
   servers alone changes nothing. Set the four `NameServers` output values at the registrar.
2. After the name servers resolve to Route 53 (the ACM DNS validation needs it):

   ```bash
   npx cdk deploy AwspstechZone AwspstechRedirect -c awspstechCutover=true -c codeConnectionArn=$CONN
   ```

   This removes the interim apex/`www` records and points both names at the redirect
   distribution. `www.awspstech.kr` (GitBook) stops serving at that point.

### aws-ps-tech.kr cutover (not done yet)

The site is served on its `*.cloudfront.net` name. `aws-ps-tech.kr` and `www.aws-ps-tech.kr`
are still attached to the BookStack Lightsail distribution; a CloudFront hostname can be
attached to only one distribution, so the aliases must be removed there before they are
added to `AwsPsTechDocsSite` (with an ACM certificate) and DNS is switched.
