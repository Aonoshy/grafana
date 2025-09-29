import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Custom styles for client modifications - Empty Dashboard only
 * Based on client frontend design specifications
 */
export function getCustomClientStyles(_theme: GrafanaTheme2) {
  return {
    // Empty dashboard styles for "暂无视图"
    emptyDashboardContainer: css({
      label: 'custom-dashboard-empty-container',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '400px',
      width: '100%',
      minHeight: '300px',
      backgroundColor: '#fafafa',
    }),

    emptyDashboardText: css({
      label: 'custom-dashboard-empty-text',
      fontFamily: 'PingFangSC, "PingFang SC"',
      fontSize: '14px',
      fontWeight: 400,
      color: '#999999',
      margin: 0,
      textAlign: 'center',
    }),
  };
}