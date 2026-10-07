import type { BusinessType, OperationType } from "../src/lib/financial-types";

/** Optional inclusive date bounds shared by date-filtered metrics requests. */
export interface DateRangeFilter {
  /** Inclusive start date in `YYYY-MM-DD` format; omit or leave undefined for no lower bound. */
  start_date?: string;
  /** Inclusive end date in `YYYY-MM-DD` format; omit or leave undefined for no upper bound. */
  end_date?: string;
}

/** Query parameters accepted by `GET /api/metrics/alerts`. */
export interface AlertsParams extends DateRangeFilter {
  /** Alert threshold as a ratio. API accepts values >= 0; dashboard input constrains it to 0.01–1.0; default is 0.3. */
  threshold?: number;
  /** Aggregation period: `day`, `week`, or `month`; defaults to `month`. */
  group_by?: "day" | "week" | "month";
  /** Optional business segment filter: `B2B` or `B2C`. */
  business_type?: BusinessType;
}

/** Query parameters accepted by `GET /api/metrics/categories/top`. */
export interface TopCategoriesParams extends DateRangeFilter {
  /** Operation to aggregate: `income` or `outcome`; comparison requests use `income`. */
  operation_type?: OperationType;
  /** Maximum number of categories to return; API accepts integers from 1 through 20; defaults to 5. */
  limit?: number;
  /** Optional business segment filter: `B2B` or `B2C`; issue separate requests for each panel. */
  business_type?: BusinessType;
}

/** Query parameters accepted by `GET /api/metrics/summary`, used for aggregate income totals. */
export interface SummaryParams extends DateRangeFilter {
  /** Aggregation period: `day`, `week`, or `month`; defaults to `month`. */
  group_by?: "day" | "week" | "month";
  /** Operation filter: `income` or `outcome`. */
  operation_type?: OperationType;
  /** Optional business segment filter: `B2B` or `B2C`. */
  business_type?: BusinessType;
}
