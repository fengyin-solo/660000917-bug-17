import type { HealthPeriod } from '../types';

/**
 * 健康评分与巡检判定的唯一口径来源。
 * 看板内所有统计、筛选、配色、文案都必须走这里的常量与函数，
 * 切换统计周期（日/周/月）、无历史数据或分数刚好落在分界值时均保持一致。
 */

/** 评分取值范围（含边界） */
export const HEALTH_SCORE_MIN = 0;
export const HEALTH_SCORE_MAX = 100;

/**
 * 健康等级分界（整数分，边界值归高一档）：
 * - 预警 critical：[0, 40)
 * - 关注 attention：[40, 70)
 * - 正常 normal：[70, 100]
 */
export const HEALTH_ATTENTION_MIN = 40;
export const HEALTH_NORMAL_MIN = 70;

export type HealthLevel = 'critical' | 'attention' | 'normal';

/** 把评分限制在 [HEALTH_SCORE_MIN, HEALTH_SCORE_MAX]，保证评分上限恒为 100 */
export function clampHealthScore(score: number): number {
  if (!Number.isFinite(score)) return HEALTH_SCORE_MIN;
  return Math.max(HEALTH_SCORE_MIN, Math.min(HEALTH_SCORE_MAX, Math.round(score)));
}

/** 统一的健康等级判定，边界值（40 / 70）归高一档 */
export function getHealthLevel(score: number): HealthLevel {
  const s = clampHealthScore(score);
  if (s < HEALTH_ATTENTION_MIN) return 'critical';
  if (s < HEALTH_NORMAL_MIN) return 'attention';
  return 'normal';
}

/** 是否需要优先巡检：预警 + 关注，即 [0, 69]，70 分及以上不纳入 */
export function isPriorityInspection(score: number): boolean {
  return getHealthLevel(score) !== 'normal';
}

/** 统计周期配置：周期只改变历史窗口，不改变任何评分阈值 */
export const HEALTH_PERIODS: Record<HealthPeriod, { label: string; chartLabel: string; hours: number }> = {
  day: { label: '日', chartLabel: '近24小时', hours: 24 },
  week: { label: '周', chartLabel: '近7天', hours: 24 * 7 },
  month: { label: '月', chartLabel: '近30天', hours: 24 * 30 },
};

export const DEFAULT_HEALTH_PERIOD: HealthPeriod = 'day';
