// 健康评分统一口径：全站唯一的阈值来源
// 分级与边界归属（评分下限 0，上限 100）：
//   正常  ≥ 70
//   关注  40 – 69（含边界 40，计入优先巡检）
//   预警  < 40
// 该规则只依赖评分本身，与统计周期（日/周/月）和历史数据点数量无关，
// 任何视图、报表、清单必须引用此处常量与函数，禁止各自硬编码阈值。

export const HEALTH_SCORE_MIN = 0;
export const HEALTH_SCORE_MAX = 100;

/** 预警线：低于该分数为预警（高优先级） */
export const HEALTH_WARNING_THRESHOLD = 40;
/** 正常线：达到该分数为正常（无需优先巡检） */
export const HEALTH_NORMAL_THRESHOLD = 70;

export type HealthLevel = 'warning' | 'attention' | 'normal';

/** 将评分钳制到 [0, 100] 区间，统一评分上下限 */
export function clampHealthScore(score: number): number {
  return Math.max(HEALTH_SCORE_MIN, Math.min(HEALTH_SCORE_MAX, score));
}

/** 统一分级：边界值 40 归入关注，70 归入正常 */
export function getHealthLevel(score: number): HealthLevel {
  if (score >= HEALTH_NORMAL_THRESHOLD) return 'normal';
  if (score >= HEALTH_WARNING_THRESHOLD) return 'attention';
  return 'warning';
}

/** 优先巡检 = 预警 + 关注（即未达到正常线的全部设备，含边界 40 分） */
export function isPriorityInspection(score: number): boolean {
  return getHealthLevel(score) !== 'normal';
}
