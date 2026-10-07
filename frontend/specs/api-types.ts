import type {
  BusinessType,
  Category,
  OperationType,
} from "../src/lib/financial-types";

/** Response body returned by `GET /api/metrics/facets`. */
export interface FacetsResponse {
  /** Operation types present in the dataset; currently `income` and `outcome`. */
  operation_types: OperationType[];
  /** Business segments present in the dataset: `B2B` and/or `B2C`. */
  business_types: BusinessType[];
  /** Categories present anywhere in the dataset; this list is not segmented by business type. */
  categories: Category[];
  /** Earliest movement date in ISO `YYYY-MM-DD` format. */
  min_date: string;
  /** Latest movement date in ISO `YYYY-MM-DD` format. */
  max_date: string;
}

/** One anomaly returned by `GET /api/metrics/alerts`. */
export interface AlertEntry {
  /** Aggregated period key; format depends on `group_by` (`YYYY-MM-DD`, `YYYY-Www`, or `YYYY-MM`). */
  period: string;
  /** Total outcome amount for the period, in the API's currency units. */
  outcome_total: number;
  /** Mean outcome of all preceding periods in the filtered summary, not a rolling three-period mean. */
  baseline_average: number;
  /** Relative increase over `baseline_average` as a ratio (for example, `0.3` means 30%). */
  increase_ratio: number;
}

/** Array response body returned by `GET /api/metrics/alerts`. */
export type AlertsResponse = AlertEntry[];

/** Client-derived row for the product's trailing-three-period anomaly table. */
export interface AlertTableRow {
  /** Aggregated period key, using the selected `group_by` format. */
  period: string;
  /** Outcome amount for this period, copied from the summary response. */
  outcome_total: number;
  /** Mean of the immediately preceding one to three available summary periods. */
  rolling_average: number;
  /** Relative increase over `rolling_average`, represented as a ratio. */
  increase_ratio: number;
}

/** One category aggregate returned by `GET /api/metrics/categories/top`. */
export interface CategoryEntry {
  /** Category identifier, one of the API's `Category` values. */
  category: Category;
  /** Operation type used to aggregate the category; comparison uses `income`. */
  operation_type: OperationType;
  /** Sum of amounts for this category in the selected operation, dates, and business segment. */
  total_amount: number;
}

/** Array response body returned by `GET /api/metrics/categories/top`. */
export type TopCategoriesResponse = CategoryEntry[];

/** One period aggregate returned by `GET /api/metrics/summary`. */
export interface MetricsSummaryEntry {
  /** Period key in the format selected by `group_by`. */
  period: string;
  /** Sum of income amounts for the period. */
  income: number;
  /** Sum of outcome amounts for the period. */
  outcome: number;
  /** Period net value: `income - outcome`. */
  net: number;
}

/** Array response body returned by `GET /api/metrics/summary`. */
export type MetricsSummaryResponse = MetricsSummaryEntry[];
