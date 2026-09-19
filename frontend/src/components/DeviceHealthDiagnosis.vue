<template>
  <div style="width:420px;padding:16px;overflow:auto;border-left:1px solid #e0e0e0;display:flex;flex-direction:column;height:100vh;box-sizing:border-box;background:#f5f5f5">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-shrink:0">
      <h3 style="margin:0;display:flex;align-items:center;gap:8px;font-size:16px;color:#1b5e20">
        <span style="font-size:20px">🏥</span>
        设备健康诊断
      </h3>
      <span :style="{ padding:'4px 10px', borderRadius:'12px', fontSize:'12px', fontWeight:600,
        background: getHealthScoreBgColor(store.healthSummary.avgHealthScore),
        color: getHealthScoreTextColor(store.healthSummary.avgHealthScore) }">
        综合评分 {{ store.healthSummary.avgHealthScore }}
      </span>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;flex-shrink:0">
      <div style="background:#fff;padding:12px;border-radius:8px;border:1px solid #e0e0e0">
        <div style="font-size:11px;color:#888;margin-bottom:4px">平均在线率</div>
        <div style="font-size:20px;font-weight:700;color:#2e7d32">{{ store.healthSummary.avgOnlineRate }}%</div>
      </div>
      <div style="background:#fff;padding:12px;border-radius:8px;border:1px solid #e0e0e0">
        <div style="font-size:11px;color:#888;margin-bottom:4px">平均电量</div>
        <div :style="{ fontSize:'20px', fontWeight:700, color: store.healthSummary.avgBatteryLevel < 30 ? '#e65100' : '#1565c0' }">
          {{ store.healthSummary.avgBatteryLevel }}%
        </div>
      </div>
      <div style="background:#fff;padding:12px;border-radius:8px;border:1px solid #e0e0e0">
        <div style="font-size:11px;color:#888;margin-bottom:4px">待处理异常</div>
        <div :style="{ fontSize:'20px', fontWeight:700, color: store.healthSummary.totalAlertCount > 0 ? '#c62828' : '#2e7d32' }">
          {{ store.healthSummary.totalAlertCount }}
        </div>
      </div>
      <div style="background:#fff;padding:12px;border-radius:8px;border:1px solid #e0e0e0">
        <div style="font-size:11px;color:#888;margin-bottom:4px">需优先巡检</div>
        <div :style="{ fontSize:'20px', fontWeight:700, color: store.healthSummary.highPriorityCount > 0 ? '#c62828' : '#2e7d32' }">
          {{ store.healthSummary.highPriorityCount + store.healthSummary.mediumPriorityCount }} 台
        </div>
      </div>
    </div>

    <div style="display:flex;gap:6px;margin-bottom:12px;flex-shrink:0">
      <button @click="activeTab = 'overview'"
        :style="{ flex:1, padding:'8px', borderRadius:'6px', border:'1px solid ' + (activeTab === 'overview' ? '#1976d2' : '#ddd'),
          background: activeTab === 'overview' ? '#e3f2fd' : '#fff', color: activeTab === 'overview' ? '#1976d2' : '#666',
          cursor:'pointer', fontSize:'12px', fontWeight:500 }">
        📊 趋势分析
      </button>
      <button @click="activeTab = 'priority'"
        :style="{ flex:1, padding:'8px', borderRadius:'6px', border:'1px solid ' + (activeTab === 'priority' ? '#1976d2' : '#ddd'),
          background: activeTab === 'priority' ? '#e3f2fd' : '#fff', color: activeTab === 'priority' ? '#1976d2' : '#666',
          cursor:'pointer', fontSize:'12px', fontWeight:500 }">
        ⚠️ 优先巡检
      </button>
      <button @click="activeTab = 'records'"
        :style="{ flex:1, padding:'8px', borderRadius:'6px', border:'1px solid ' + (activeTab === 'records' ? '#1976d2' : '#ddd'),
          background: activeTab === 'records' ? '#e3f2fd' : '#fff', color: activeTab === 'records' ? '#1976d2' : '#666',
          cursor:'pointer', fontSize:'12px', fontWeight:500 }">
        📋 异常记录
      </button>
    </div>

    <div v-if="activeTab === 'overview'" style="flex:1;overflow:auto;display:flex;flex-direction:column;gap:12px">
      <div v-if="selectedDevice" style="background:#fff;padding:12px;border-radius:8px;border:1px solid #e0e0e0">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:14px">📱</span>
            <span style="font-weight:600;font-size:13px">{{ selectedDevice.deviceName }}</span>
          </div>
          <button @click="selectedDevice = null" style="background:none;border:none;cursor:pointer;color:#999;font-size:16px">×</button>
        </div>
        <div style="display:flex;gap:12px;margin-bottom:10px">
          <div style="flex:1">
            <div style="font-size:10px;color:#888;margin-bottom:2px">健康评分</div>
            <div :style="{ fontSize:'18px', fontWeight:700, color: getHealthScoreTextColor(selectedDevice.healthScore) }">
              {{ selectedDevice.healthScore }}
            </div>
          </div>
          <div style="flex:1">
            <div style="font-size:10px;color:#888;margin-bottom:2px">健康趋势</div>
            <div :style="{ fontSize:'14px', fontWeight:600, color: getTrendColor(selectedDevice.healthTrend) }">
              {{ getTrendIcon(selectedDevice.healthTrend) }} {{ getTrendText(selectedDevice.healthTrend) }}
            </div>
          </div>
          <div style="flex:1">
            <div style="font-size:10px;color:#888;margin-bottom:2px">在线时长</div>
            <div style="font-size:14px;font-weight:600;color:#1565c0">{{ selectedDevice.onlineHours }}h</div>
          </div>
        </div>
        <div v-if="selectedDevice.recommendations.length > 0" style="margin-top:8px">
          <div style="font-size:11px;color:#e65100;font-weight:600;margin-bottom:4px">💡 巡检建议</div>
          <div v-for="(rec, idx) in selectedDevice.recommendations" :key="idx"
            style="font-size:11px;color:#666;padding:4px 8px;background:#fff8e1;border-radius:4px;margin-bottom:4px">
            {{ rec }}
          </div>
        </div>
      </div>

      <div v-else style="background:#fff;padding:12px;border-radius:8px;border:1px solid #e0e0e0">
        <div style="font-size:12px;color:#666;text-align:center">
          👇 点击下方设备查看详细健康趋势
        </div>
      </div>

      <div style="background:#fff;padding:12px;border-radius:8px;border:1px solid #e0e0e0">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <h4 style="margin:0;font-size:13px;color:#333;display:flex;align-items:center;gap:6px">
            🔋 电量趋势
          </h4>
          <span style="font-size:11px;color:#888">最近24小时</span>
        </div>
        <div ref="batteryChartRef" style="width:100%;height:120px"></div>
      </div>

      <div style="background:#fff;padding:12px;border-radius:8px;border:1px solid #e0e0e0">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <h4 style="margin:0;font-size:13px;color:#333;display:flex;align-items:center;gap:6px">
            🌡️ 温度波动
          </h4>
          <span style="font-size:11px;color:#888">最近24小时</span>
        </div>
        <div ref="tempChartRef" style="width:100%;height:120px"></div>
      </div>

      <div style="background:#fff;padding:12px;border-radius:8px;border:1px solid #e0e0e0">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <h4 style="margin:0;font-size:13px;color:#333;display:flex;align-items:center;gap:6px">
            ⏱️ 在线时长统计
          </h4>
          <span style="font-size:11px;color:#888">最近24小时</span>
        </div>
        <div v-if="selectedDevice" style="display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;align-items:center;gap:8px">
            <div style="flex:1">
              <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
                <span style="color:#2e7d32">在线时长</span>
                <span style="font-weight:600;color:#2e7d32">{{ selectedDevice.onlineHours }}小时</span>
              </div>
              <div style="height:8px;background:#e0e0e0;border-radius:4px;overflow:hidden">
                <div :style="{ height:'100%', background:'#4caf50', width: getOnlinePercent(selectedDevice) + '%', transition:'width 0.5s' }"></div>
              </div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="flex:1">
              <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
                <span style="color:#c62828">离线时长</span>
                <span style="font-weight:600;color:#c62828">{{ selectedDevice.offlineHours }}小时</span>
              </div>
              <div style="height:8px;background:#e0e0e0;border-radius:4px;overflow:hidden">
                <div :style="{ height:'100%', background:'#e53935', width: (100 - getOnlinePercent(selectedDevice)) + '%', transition:'width 0.5s' }"></div>
              </div>
            </div>
          </div>
          <div style="display:flex;gap:12px;margin-top:4px">
            <div style="flex:1;text-align:center;padding:8px;background:#f1f8e9;border-radius:6px">
              <div style="font-size:18px;font-weight:700;color:#2e7d32">{{ getOnlinePercent(selectedDevice) }}%</div>
              <div style="font-size:10px;color:#666">在线率</div>
            </div>
            <div style="flex:1;text-align:center;padding:8px;background:#e3f2fd;border-radius:6px">
              <div style="font-size:18px;font-weight:700;color:#1565c0">{{ selectedDevice.alertCount }}</div>
              <div style="font-size:10px;color:#666">异常次数</div>
            </div>
          </div>
        </div>
        <div v-else style="text-align:center;padding:20px;color:#999;font-size:12px">
          请选择设备查看在线时长统计
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'priority'" style="flex:1;overflow:auto;display:flex;flex-direction:column;gap:8px">
      <div style="background:#fff;padding:10px 12px;border-radius:8px;border:1px solid #e0e0e0;display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:12px;color:#666">按健康状态排序（低分优先）</span>
        <span style="font-size:11px;color:#999">共 {{ store.deviceHealthList.length }} 台设备</span>
      </div>

      <div v-for="health in store.deviceHealthList" :key="health.deviceId"
        @click="handleDeviceClick(health)"
        @mouseenter="handleHover(health.deviceId)"
        @mouseleave="handleHover(null)"
        :style="{ display:'flex', alignItems:'center', gap:'10px', padding:'12px',
          borderRadius:'8px', border:'2px solid ' + getPriorityBorderColor(health),
          background: store.highlightedDeviceId === health.deviceId ? '#e3f2fd' : '#fff',
          cursor:'pointer', transition:'all 0.2s ease' }">
        <div :style="{ width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'12px', fontWeight:700, flexShrink:0,
          background: getPriorityRankBg(health.priorityRank),
          color: health.priorityRank <= 3 ? '#fff' : '#666' }">
          {{ health.priorityRank }}
        </div>

        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-weight:600;font-size:13px;color:#333;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              {{ health.deviceName }}
            </span>
            <span :style="{ fontSize:'10px', padding:'1px 6px', borderRadius:'8px',
              background: getHealthScoreBgColor(health.healthScore),
              color: getHealthScoreTextColor(health.healthScore) }">
              {{ health.healthScore }}分
            </span>
            <span :style="{ fontSize:'12px', color: getTrendColor(health.healthTrend) }">
              {{ getTrendIcon(health.healthTrend) }}
            </span>
          </div>
          <div style="display:flex;gap:10px;font-size:11px;color:#888">
            <span>🔋 {{ health.batteryLevel }}%</span>
            <span>🌡️ {{ health.temperatureLevel }}°C</span>
            <span>⏱️ {{ health.onlineHours }}h在线</span>
          </div>
          <div style="margin-top:6px">
            <div style="height:4px;background:#e0e0e0;border-radius:2px;overflow:hidden">
              <div :style="{ height:'100%', background: getHealthScoreColor(health.healthScore),
                width: getScorePercent(health.healthScore) + '%', transition:'width 0.5s' }"></div>
            </div>
          </div>
        </div>

        <div style="flex-shrink:0;text-align:right">
          <div v-if="health.alertCount > 0"
            :style="{ fontSize:'10px', padding:'2px 6px', borderRadius:'8px',
              background:'#ffebee', color:'#c62828', fontWeight:600 }">
            ⚠️ {{ health.alertCount }}
          </div>
          <div v-if="health.lastAbnormalTime" style="font-size:10px;color:#999;margin-top:4px">
            {{ formatAbnormalTime(health.lastAbnormalTime) }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'records'" style="flex:1;overflow:auto;display:flex;flex-direction:column;gap:8px">
      <div style="background:#fff;padding:10px 12px;border-radius:8px;border:1px solid #e0e0e0;display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:12px;color:#666">最近异常记录</span>
        <span style="font-size:11px;color:#999">最近20条</span>
      </div>

      <div v-if="store.recentAbnormalRecords.length === 0"
        style="text-align:center;padding:40px 20px;background:#fff;border-radius:8px;border:1px solid #e0e0e0;color:#999;font-size:13px">
        <div style="font-size:32px;margin-bottom:8px">✅</div>
        <div>暂无异常记录</div>
      </div>

      <div v-for="alert in store.recentAbnormalRecords" :key="alert.id"
        @click="handleAlertClick(alert)"
        @mouseenter="handleHover(alert.deviceId)"
        @mouseleave="handleHover(null)"
        :style="{ display:'flex', alignItems:'flex-start', gap:'10px', padding:'12px',
          borderRadius:'8px', border:'1px solid ' + getSeverityBorderColor(alert.severity),
          background: store.highlightedDeviceId === alert.deviceId ? getSeverityBgColor(alert.severity) : '#fff',
          cursor:'pointer', transition:'all 0.2s ease' }">
        <span :style="{ fontSize:'18px', flexShrink:0 }">{{ getAlertIcon(alert.type) }}</span>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:13px;color:#333;margin-bottom:4px">
            {{ alert.message }}
          </div>
          <div style="font-size:11px;color:#888;margin-bottom:4px">
            📱 {{ getDeviceName(alert.deviceId) }}
            <span v-if="alert.fenceId" style="margin-left:8px">
              🗺️ {{ getFenceName(alert.fenceId) }}
            </span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:10px;color:#999">{{ formatTime(alert.timestamp) }}</span>
            <span :style="{ fontSize:'10px', padding:'2px 6px', borderRadius:'4px', fontWeight:500,
              background: getSeverityColor(alert.severity) + '20', color: getSeverityColor(alert.severity) }">
              {{ getSeverityText(alert.severity) }}
            </span>
          </div>
        </div>
        <span v-if="alert.acknowledged" style="font-size:10px;padding:2px 6px;border-radius:8px;background:#e8f5e9;color:#2e7d32">已处理</span>
      </div>
    </div>

    <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e0e0e0;flex-shrink:0">
      <div style="display:flex;gap:8px;font-size:11px;color:#888;flex-wrap:wrap;justify-content:center">
        <span>🟢 正常 ≥{{ HEALTH_NORMAL_THRESHOLD }}分</span>
        <span>🟡 关注 {{ HEALTH_WARNING_THRESHOLD }}-{{ HEALTH_NORMAL_THRESHOLD - 1 }}分</span>
        <span>🔴 预警 <{{ HEALTH_WARNING_THRESHOLD }}分</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useIotStore } from '../stores/iot';
import type { DeviceHealth, AlertType, AlertSeverity, Alert, HealthDataPoint } from '../types';
import { clampHealthScore, getHealthLevel, HEALTH_SCORE_MAX, HEALTH_WARNING_THRESHOLD, HEALTH_NORMAL_THRESHOLD } from '../utils/health';

const store = useIotStore();

const activeTab = ref<'overview' | 'priority' | 'records'>('priority');
const selectedDevice = ref<DeviceHealth | null>(null);
const batteryChartRef = ref<HTMLElement | null>(null);
const tempChartRef = ref<HTMLElement | null>(null);

const currentHistoryData = computed(() => {
  if (selectedDevice.value) {
    return selectedDevice.value.historyData;
  }
  return store.deviceHealthList[0]?.historyData || [];
});

function handleDeviceClick(health: DeviceHealth) {
  selectedDevice.value = health;
  store.setHighlightedDevice(health.deviceId);
  activeTab.value = 'overview';
  nextTick(() => {
    renderCharts();
  });
}

function handleAlertClick(alert: Alert) {
  const health = store.getDeviceHealth(alert.deviceId);
  if (health) {
    selectedDevice.value = health;
  }
  store.setHighlightedDevice(alert.deviceId);
}

function handleHover(deviceId: string | null) {
  if (!store.highlightedDeviceId) {
    store.setHighlightedDevice(deviceId);
  }
}

function getHealthScoreColor(score: number): string {
  const level = getHealthLevel(score);
  if (level === 'normal') return '#4caf50';
  if (level === 'attention') return '#ff9800';
  return '#f44336';
}

function getHealthScoreBgColor(score: number): string {
  const level = getHealthLevel(score);
  if (level === 'normal') return '#e8f5e9';
  if (level === 'attention') return '#fff3e0';
  return '#ffebee';
}

function getHealthScoreTextColor(score: number): string {
  const level = getHealthLevel(score);
  if (level === 'normal') return '#2e7d32';
  if (level === 'attention') return '#e65100';
  return '#c62828';
}

function getPriorityBorderColor(health: DeviceHealth): string {
  const level = getHealthLevel(health.healthScore);
  if (level === 'warning') return '#ef9a9a';
  if (level === 'attention') return '#ffe082';
  return '#e0e0e0';
}

function getPriorityRankBg(rank: number): string {
  if (rank === 1) return '#c62828';
  if (rank === 2) return '#e65100';
  if (rank === 3) return '#f9a825';
  return '#eeeeee';
}

function getTrendColor(trend: string): string {
  switch (trend) {
    case 'improving': return '#2e7d32';
    case 'declining': return '#c62828';
    default: return '#666';
  }
}

function getTrendIcon(trend: string): string {
  switch (trend) {
    case 'improving': return '📈';
    case 'declining': return '📉';
    default: return '➡️';
  }
}

function getTrendText(trend: string): string {
  switch (trend) {
    case 'improving': return '好转';
    case 'declining': return '恶化';
    default: return '稳定';
  }
}

function getScorePercent(score: number): number {
  return (clampHealthScore(score) / HEALTH_SCORE_MAX) * 100;
}

function getOnlinePercent(health: DeviceHealth): number {
  const total = health.onlineHours + health.offlineHours;
  if (!total || total <= 0) return 0;
  return Math.round((health.onlineHours / total) * 100);
}

function getAlertIcon(type: AlertType): string {
  switch (type) {
    case 'enter': return '🚨';
    case 'exit': return '🚪';
    case 'low_battery': return '🔋';
    case 'offline': return '📵';
    default: return '⚠️';
  }
}

function getSeverityColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'critical': return '#e53935';
    case 'warning': return '#ff9800';
    case 'info': return '#2196f3';
    default: return '#666';
  }
}

function getSeverityBorderColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'critical': return '#ffcdd2';
    case 'warning': return '#ffe0b2';
    case 'info': return '#bbdefb';
    default: return '#e0e0e0';
  }
}

function getSeverityBgColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'critical': return '#ffebee';
    case 'warning': return '#fff3e0';
    case 'info': return '#e3f2fd';
    default: return '#f5f5f5';
  }
}

function getSeverityText(severity: AlertSeverity): string {
  switch (severity) {
    case 'critical': return '严重';
    case 'warning': return '警告';
    case 'info': return '提示';
    default: return '未知';
  }
}

function getDeviceName(deviceId: string): string {
  return store.getDeviceById(deviceId)?.name || '未知设备';
}

function getFenceName(fenceId: string): string {
  return store.getFenceById(fenceId)?.name || '未知围栏';
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) {
    return '刚刚';
  } else if (diff < 3600000) {
    return Math.floor(diff / 60000) + ' 分钟前';
  } else if (diff < 86400000) {
    return Math.floor(diff / 3600000) + ' 小时前';
  } else {
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

function formatAbnormalTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 3600000) {
    return Math.floor(diff / 60000) + '分钟前';
  } else if (diff < 86400000) {
    return Math.floor(diff / 3600000) + '小时前';
  } else {
    return Math.floor(diff / 86400000) + '天前';
  }
}

function renderLineChart(
  container: HTMLElement,
  data: HealthDataPoint[],
  valueKey: 'battery' | 'temperature',
  color: string,
  yMin: number,
  yMax: number,
  unit: string
) {
  if (!data || data.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:30px;color:#999;font-size:12px">暂无数据</div>';
    return;
  }

  const width = container.clientWidth;
  const height = 120;
  const padding = { top: 10, right: 30, bottom: 20, left: 35 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = data.map(d => d[valueKey]);
  const minVal = Math.min(...values, yMin);
  const maxVal = Math.max(...values, yMax);
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - ((d[valueKey] - minVal) / range) * chartHeight;
    return { x, y, value: d[valueKey] };
  });

  const pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
  const areaD = `${pathD} L ${padding.left + chartWidth} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;

  const gridLines = [];
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (i / 4) * chartHeight;
    const val = maxVal - (i / 4) * (maxVal - minVal);
    gridLines.push({ y, val: Math.round(val * 10) / 10 });
  }

  let svg = `<svg width="${width}" height="${height}" style="display:block">`;

  gridLines.forEach(line => {
    svg += `<line x1="${padding.left}" y1="${line.y}" x2="${padding.left + chartWidth}" y2="${line.y}" stroke="#eee" stroke-dasharray="3,3"/>`;
    svg += `<text x="${padding.left - 5}" y="${line.y + 4}" text-anchor="end" font-size="10" fill="#999">${line.val}${unit}</text>`;
  });

  svg += `<defs><linearGradient id="gradient-${valueKey}" x1="0%" y1="0%" x2="0%" y2="100%">`;
  svg += `<stop offset="0%" stop-color="${color}" stop-opacity="0.3"/>`;
  svg += `<stop offset="100%" stop-color="${color}" stop-opacity="0"/>`;
  svg += `</linearGradient></defs>`;

  svg += `<path d="${areaD}" fill="url(#gradient-${valueKey})"/>`;
  svg += `<path d="${pathD}" fill="none" stroke="${color}" stroke-width="2"/>`;

  points.forEach((p, i) => {
    if (i % Math.ceil(points.length / 6) === 0 || i === points.length - 1) {
      svg += `<circle cx="${p.x}" cy="${p.y}" r="3" fill="${color}"/>`;
    }
  });

  const timeLabels = [];
  const labelCount = 6;
  for (let i = 0; i < labelCount; i++) {
    const idx = Math.floor((i / (labelCount - 1)) * (data.length - 1));
    const date = new Date(data[idx].timestamp);
    timeLabels.push({
      x: padding.left + (idx / (data.length - 1)) * chartWidth,
      label: date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    });
  }

  timeLabels.forEach(label => {
    svg += `<text x="${label.x}" y="${height - 5}" text-anchor="middle" font-size="9" fill="#999">${label.label}</text>`;
  });

  svg += `</svg>`;
  container.innerHTML = svg;
}

function renderCharts() {
  if (batteryChartRef.value) {
    renderLineChart(batteryChartRef.value, currentHistoryData.value, 'battery', '#4caf50', 0, 100, '%');
  }
  if (tempChartRef.value) {
    renderLineChart(tempChartRef.value, currentHistoryData.value, 'temperature', '#ff9800', 15, 50, '°C');
  }
}

watch(selectedDevice, () => {
  nextTick(() => {
    renderCharts();
  });
});

watch(activeTab, (newTab) => {
  if (newTab === 'overview') {
    nextTick(() => {
      renderCharts();
    });
  }
});

onMounted(() => {
  if (store.deviceHealthList.length > 0 && !selectedDevice.value) {
    selectedDevice.value = store.deviceHealthList[0];
  }
  nextTick(() => {
    renderCharts();
  });

  const handleResize = () => {
    renderCharts();
  };
  window.addEventListener('resize', handleResize);
});
</script>
