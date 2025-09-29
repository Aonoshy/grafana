import { PanelMenuItem, PluginExtensionLink } from '@grafana/data';
import { t } from '@grafana/i18n';
import { locationService } from '@grafana/runtime';
import { DashboardModel } from 'app/features/dashboard/state/DashboardModel';
import { PanelModel } from 'app/features/dashboard/state/PanelModel';
import { removePanel } from 'app/features/dashboard/utils/panel';

export function getPanelMenu(
  dashboard: DashboardModel,
  panel: PanelModel,
  extensions: PluginExtensionLink[]
): PanelMenuItem[] {
  const onEditPanel = (event: React.MouseEvent) => {
    event.preventDefault();
    locationService.partial({
      editPanel: panel.id,
    });
  };

  const onRemovePanel = (event: React.MouseEvent) => {
    event.preventDefault();
    removePanel(dashboard, panel, true);
  };

  const menu: PanelMenuItem[] = [];

  // Only show edit option if user can edit the panel and panel is not currently being edited
  if (dashboard.canEditPanel(panel) && !panel.isEditing) {
    menu.push({
      text: t('panel.header-menu.edit', `Edit`),
      iconClassName: 'edit',
      onClick: onEditPanel,
    });
  }

  // Only show remove option if user can edit the panel and panel is not in viewing or editing mode
  if (dashboard.canEditPanel(panel) && !panel.isEditing && !panel.isViewing) {
    // Add divider before remove option if there are other menu items
    if (menu.length > 0) {
      menu.push({ type: 'divider', text: '' });
    }

    menu.push({
      text: t('panel.header-menu.remove', `Remove`),
      iconClassName: 'trash-alt',
      onClick: onRemovePanel,
    });
  }

  return menu;
}
