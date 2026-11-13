import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import * as budgets from 'aws-cdk-lib/aws-budgets';
import { Construct } from 'constructs';

export interface RumBudgetStackProps extends StackProps {
  /** Monthly limit in USD. */
  readonly monthlyLimitUsd: number;
  /** E-mail addresses that receive the alerts (passed as context, not committed). */
  readonly emails: string[];
  /** Cost Explorer USAGE_TYPE of the billed RUM events (region prefix + "CW:RUM-events"). */
  readonly usageType: string;
}

/**
 * Monthly cost budget for CloudWatch RUM events ($1 per 100,000 events after the one-time
 * 1 million free events). Alerts at 80% of the limit (actual), and when the actual or the
 * forecasted spend reaches 100%.
 *
 * Filtered on the RUM events usage type, not on the CloudWatch service: this account also
 * runs other CloudWatch workloads that cost far more than the RUM limit. The usage type is
 * region-specific (ap-northeast-2 = APN2); the free-trial events are a different usage type
 * (APN2-CW:RUM-free-events), so the budget stays at $0 until the free events are used up.
 * AWS Budgets is a global service served from us-east-1.
 */
export class RumBudgetStack extends Stack {
  constructor(scope: Construct, id: string, props: RumBudgetStackProps) {
    super(scope, id, props);

    const subscribers = props.emails.map((address) => ({ subscriptionType: 'EMAIL', address }));
    const notification = (
      notificationType: 'ACTUAL' | 'FORECASTED',
      threshold: number,
    ): budgets.CfnBudget.NotificationWithSubscribersProperty => ({
      notification: {
        notificationType,
        comparisonOperator: 'GREATER_THAN',
        threshold,
        thresholdType: 'PERCENTAGE',
      },
      subscribers,
    });

    const budgetName = 'aws-ps-tech-docs-cloudwatch-rum';
    new budgets.CfnBudget(this, 'Budget', {
      budget: {
        budgetName,
        budgetType: 'COST',
        timeUnit: 'MONTHLY',
        budgetLimit: { amount: props.monthlyLimitUsd, unit: 'USD' },
        costFilters: { UsageType: [props.usageType] },
      },
      notificationsWithSubscribers: [
        notification('ACTUAL', 80),
        notification('ACTUAL', 100),
        notification('FORECASTED', 100),
      ],
    });

    new CfnOutput(this, 'BudgetName', { value: budgetName });
  }
}
