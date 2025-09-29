import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Custom styles for client modifications
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

    // Client-style primary button matching the query button design
    clientPrimaryButton: css({
      label: 'custom-client-primary-button',
      backgroundColor: '#3385ff !important',
      borderColor: '#3385ff !important',
      color: '#ffffff !important',
      borderRadius: '2px !important',
      padding: '6px 16px !important',
      fontSize: '14px !important',
      fontWeight: '400 !important',
      fontFamily: 'PingFangSC, "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important',
      border: '1px solid #3385ff !important',
      cursor: 'pointer',
      transition: 'all 0.2s',
      lineHeight: '22px !important',
      height: 'auto !important',
      minHeight: '32px !important',
      whiteSpace: 'nowrap !important',
      overflow: 'visible !important',
      textOverflow: 'unset !important',
      display: 'inline-flex !important',
      alignItems: 'center !important',
      justifyContent: 'center !important',
      '&:hover': {
        backgroundColor: '#5ba0ff !important',
        borderColor: '#5ba0ff !important',
      },
      '&:active': {
        backgroundColor: '#1a70ff !important',
        borderColor: '#1a70ff !important',
      },
      '&:focus': {
        backgroundColor: '#3385ff !important',
        borderColor: '#3385ff !important',
        boxShadow: '0 0 0 2px rgba(51, 133, 255, 0.2) !important',
      },
    }),

    // Client-style secondary button
    clientSecondaryButton: css({
      label: 'custom-client-secondary-button',
      backgroundColor: '#ffffff !important',
      borderColor: '#3385ff !important',
      color: '#3385ff !important',
      borderRadius: '2px !important',
      padding: '4px 12px !important',
      fontSize: '13px !important',
      fontWeight: '400 !important',
      fontFamily: 'PingFangSC, "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important',
      border: '1px solid #3385ff !important',
      cursor: 'pointer !important',
      transition: 'all 0.2s',
      lineHeight: '20px !important',
      height: 'auto !important',
      minHeight: '28px !important',
      whiteSpace: 'nowrap !important',
      overflow: 'visible !important',
      textOverflow: 'unset !important',
      display: 'inline-flex !important',
      alignItems: 'center !important',
      justifyContent: 'center !important',
      boxShadow: 'none !important',
      outline: 'none !important',
      '&:hover': {
        backgroundColor: '#f0f6ff !important',
        borderColor: '#5ba0ff !important',
        color: '#5ba0ff !important',
        boxShadow: 'none !important',
      },
      '&:active': {
        backgroundColor: '#e6f1ff !important',
        borderColor: '#1a70ff !important',
        color: '#1a70ff !important',
        boxShadow: 'none !important',
      },
      '&:focus': {
        backgroundColor: '#ffffff !important',
        borderColor: '#3385ff !important',
        color: '#3385ff !important',
        boxShadow: '0 0 0 2px rgba(51, 133, 255, 0.2) !important',
        outline: 'none !important',
      },
      '&:disabled': {
        backgroundColor: '#f5f5f5 !important',
        borderColor: '#d9d9d9 !important',
        color: '#bfbfbf !important',
        cursor: 'not-allowed !important',
      },
    }),

    // Navigation button container styles
    navButtonContainer: css({
      label: 'custom-nav-button-container',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    }),

    // Dropdown menu customization
    clientDropdownMenu: css({
      label: 'custom-client-dropdown-menu',
      backgroundColor: '#ffffff !important',
      border: '1px solid #d9d9d9 !important',
      borderRadius: '2px !important',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15) !important',
      fontFamily: 'PingFangSC, "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important',
      fontSize: '14px !important',
      zIndex: '1050 !important',
      '& .ant-dropdown-menu-item, & [role="menuitem"]': {
        backgroundColor: '#ffffff !important',
        padding: '8px 16px !important',
        fontSize: '14px !important',
        color: '#333333 !important',
        border: 'none !important',
        lineHeight: '22px !important',
        '&:hover': {
          backgroundColor: '#f0f6ff !important',
          color: '#3385ff !important',
        },
      },
      '& ul': {
        backgroundColor: '#ffffff !important',
        margin: '0 !important',
        padding: '4px 0 !important',
        border: 'none !important',
        borderRadius: '2px !important',
      },
    }),

    // Button group for save dropdown
    clientButtonGroup: css({
      label: 'custom-client-button-group',
      display: 'inline-flex !important',
      '& > button': {
        borderRadius: '0 !important',
        '&:first-child': {
          borderRadius: '2px 0 0 2px !important',
        },
        '&:last-child': {
          borderRadius: '0 2px 2px 0 !important',
          borderLeft: 'none !important',
        },
      },
    }),

    // Special style for back to dashboard button with primary blue appearance
    clientBackButton: css({
      label: 'custom-client-back-button',
      backgroundColor: '#3385ff !important',
      borderColor: '#3385ff !important',
      color: '#ffffff !important',
      borderRadius: '2px !important',
      padding: '6px 16px !important',
      fontSize: '14px !important',
      fontWeight: '400 !important',
      fontFamily: 'PingFangSC, "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important',
      border: '1px solid #3385ff !important',
      cursor: 'pointer !important',
      transition: 'all 0.2s !important',
      lineHeight: '22px !important',
      height: 'auto !important',
      minHeight: '32px !important',
      whiteSpace: 'nowrap !important',
      overflow: 'visible !important',
      textOverflow: 'unset !important',
      display: 'inline-flex !important',
      alignItems: 'center !important',
      justifyContent: 'center !important',
      boxShadow: 'none !important',
      outline: 'none !important',
      '&, &:focus, &:active, &:visited': {
        backgroundColor: '#3385ff !important',
        borderColor: '#3385ff !important',
        color: '#ffffff !important',
        boxShadow: 'none !important',
        outline: 'none !important',
      },
      '&:hover': {
        backgroundColor: '#5ba0ff !important',
        borderColor: '#5ba0ff !important',
        color: '#ffffff !important',
        boxShadow: 'none !important',
      },
      '&:active': {
        backgroundColor: '#1a70ff !important',
        borderColor: '#1a70ff !important',
        color: '#ffffff !important',
        boxShadow: 'none !important',
      },
    }),
  };
}