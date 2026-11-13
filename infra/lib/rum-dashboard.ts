import { Duration } from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';

export interface RumDashboardProps {
  /** Name of the RUM app monitor (value of the application_name dimension). */
  readonly appMonitorName: string;
  readonly dashboardName: string;
}

/**
 * CloudWatch dashboard for the RUM app monitor: traffic, Core Web Vitals (p75, the
 * statistic Google uses for the "good / needs improvement / poor" thresholds), page load
 * time, errors and ingest volume. Only the default AWS/RUM metrics are used, which RUM
 * publishes at no extra metric charge.
 */
export class RumDashboard extends Construct {
  readonly dashboard: cloudwatch.Dashboard;

  constructor(scope: Construct, id: string, props: RumDashboardProps) {
    super(scope, id);

    const metric = (metricName: string, statistic: string, label: string, period = Duration.hours(1)) =>
      new cloudwatch.Metric({
        namespace: 'AWS/RUM',
        metricName,
        dimensionsMap: { application_name: props.appMonitorName },
        statistic,
        label,
        period,
      });

    const single = (title: string, m: cloudwatch.IMetric) =>
      new cloudwatch.SingleValueWidget({ title, metrics: [m], width: 4, height: 3, setPeriodToTimeRange: true });

    const vital = (title: string, m: cloudwatch.IMetric, unit: string, good: number, poor: number) =>
      new cloudwatch.GraphWidget({
        title,
        left: [m],
        leftYAxis: { label: unit, min: 0 },
        leftAnnotations: [
          { value: good, label: `good ≤ ${good}`, color: '#2ca02c' },
          { value: poor, label: `poor > ${poor}`, color: '#d62728' },
        ],
        width: 8,
        height: 6,
      });

    this.dashboard = new cloudwatch.Dashboard(this, 'Dashboard', {
      dashboardName: props.dashboardName,
      defaultInterval: Duration.days(7),
      periodOverride: cloudwatch.PeriodOverride.AUTO,
    });

    this.dashboard.addWidgets(
      new cloudwatch.TextWidget({
        markdown:
          `# ${props.appMonitorName} — CloudWatch RUM\n` +
          'Real user data from the CloudFront-hosted site (no cookies, 100% sampling). ' +
          'Core Web Vitals use p75. RUM keeps the raw events for 30 days; cost is $1 per 100,000 events.',
        width: 24,
        height: 2,
      }),
      single('Sessions', metric('SessionCount', 'Sum', 'Sessions')),
      single('Page views', metric('PageViewCount', 'Sum', 'Page views')),
      single('JS errors', metric('JsErrorCount', 'Sum', 'JS errors')),
      single('HTTP 4xx', metric('Http4xxCount', 'Sum', 'HTTP 4xx')),
      single('HTTP 5xx', metric('Http5xxCount', 'Sum', 'HTTP 5xx')),
      single('Ingested (bytes)', metric('RumEventPayloadSize', 'Sum', 'Payload bytes')),
    );

    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Sessions and page views',
        left: [metric('SessionCount', 'Sum', 'Sessions'), metric('PageViewCount', 'Sum', 'Page views')],
        leftYAxis: { min: 0 },
        width: 12,
        height: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'Errors',
        left: [
          metric('JsErrorCount', 'Sum', 'JS errors'),
          metric('Http4xxCount', 'Sum', 'HTTP 4xx'),
          metric('Http5xxCount', 'Sum', 'HTTP 5xx'),
        ],
        leftYAxis: { min: 0 },
        width: 12,
        height: 6,
      }),
    );

    this.dashboard.addWidgets(
      vital('Largest Contentful Paint (p75)', metric('WebVitalsLargestContentfulPaint', 'p75', 'LCP p75'), 'ms', 2500, 4000),
      vital('First Input Delay (p75)', metric('WebVitalsFirstInputDelay', 'p75', 'FID p75'), 'ms', 100, 300),
      vital('Cumulative Layout Shift (p75)', metric('WebVitalsCumulativeLayoutShift', 'p75', 'CLS p75'), 'score', 0.1, 0.25),
    );

    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Page load duration',
        left: [
          metric('PerformanceNavigationDuration', 'p50', 'p50'),
          metric('PerformanceNavigationDuration', 'p90', 'p90'),
        ],
        leftYAxis: { label: 'ms', min: 0 },
        width: 12,
        height: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'Apdex-style satisfaction (navigation)',
        left: [
          metric('NavigationSatisfiedTransaction', 'Sum', 'Satisfied'),
          metric('NavigationToleratedTransaction', 'Sum', 'Tolerated'),
          metric('NavigationFrustratedTransaction', 'Sum', 'Frustrated'),
        ],
        stacked: true,
        leftYAxis: { min: 0 },
        width: 12,
        height: 6,
      }),
    );
  }
}
