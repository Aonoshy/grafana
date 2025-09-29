import { InterpolateFunction, LinkModel, PanelMenuItem } from '@grafana/data';
import { t } from '@grafana/i18n';
import { VizPanel, VizPanelMenu, sceneGraph } from '@grafana/scenes';
import appEvents from 'app/core/app_events';
import { getScenePanelLinksSupplier } from 'app/features/panel/panellinks/linkSuppliers';
import { ShowConfirmModalEvent } from 'app/types/events';

import { isInCloneChain } from '../utils/clone';
import { DashboardInteractions } from '../utils/interactions';
import { getEditPanelUrl, tryGetExploreUrlForPanel } from '../utils/urlBuilders';
import { getDashboardSceneFor, getPanelIdForVizPanel } from '../utils/utils';

import { DashboardScene } from './DashboardScene';
import { VizPanelLinks, VizPanelLinksMenu } from './PanelLinks';


/**
 * Behavior is called when VizPanelMenu is activated (ie when it's opened).
 */
export function panelMenuBehavior(menu: VizPanelMenu) {
  const asyncFunc = async () => {
    // hm.. add another generic param to SceneObject to specify parent type?
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const panel = menu.parent as VizPanel;

    const items: PanelMenuItem[] = [];
    const dashboard = getDashboardSceneFor(panel);
    const { isEmbedded } = dashboard.state.meta;
    const exploreMenuItem = await getExploreMenuItem(panel);
    const isReadOnlyRepeat = isInCloneChain(panel.state.key!);

    // For embedded dashboards we only have explore action for now
    if (isEmbedded) {
      if (exploreMenuItem) {
        menu.setState({ items: [exploreMenuItem] });
      }
      return;
    }

    const isEditingPanel = Boolean(dashboard.state.editPanel);

    // Only show edit option if user can edit the dashboard and panel is not currently being edited
    if (dashboard.canEditDashboard() && dashboard.state.editable && !isReadOnlyRepeat && !isEditingPanel) {
      items.push({
        text: t('panel.header-menu.edit', `Edit`),
        iconClassName: 'edit',
        href: getEditPanelUrl(getPanelIdForVizPanel(panel)),
      });
    }

    // Only show remove option if user can edit the dashboard and panel is not in editing mode
    if (dashboard.state.isEditing && !isReadOnlyRepeat && !isEditingPanel) {
      // Add divider before remove option if there are other menu items
      if (items.length > 0) {
        items.push({
          text: '',
          type: 'divider',
        });
      }

      items.push({
        text: t('panel.header-menu.remove', `Remove`),
        iconClassName: 'trash-alt',
        onClick: () => {
          onRemovePanel(dashboard, panel);
        },
      });
    }

    menu.setState({ items });
  };

  asyncFunc();
}

async function getExploreMenuItem(panel: VizPanel): Promise<PanelMenuItem | undefined> {
  const exploreUrl = await tryGetExploreUrlForPanel(panel);
  if (!exploreUrl) {
    return undefined;
  }

  return {
    text: t('panel.header-menu.explore', `Explore`),
    iconClassName: 'compass',
    shortcut: 'p x',
    href: exploreUrl,
  };
}


/**
 * Behavior is called when VizPanelLinksMenu is activated (when it's opened).
 */
export function panelLinksBehavior(panelLinksMenu: VizPanelLinksMenu) {
  if (!(panelLinksMenu.parent instanceof VizPanelLinks)) {
    throw new Error('parent of VizPanelLinksMenu must be VizPanelLinks');
  }
  const panel = panelLinksMenu.parent.parent;

  if (!(panel instanceof VizPanel)) {
    throw new Error('parent of VizPanelLinks must be VizPanel');
  }

  panelLinksMenu.setState({ links: getPanelLinks(panel) });
}

export function getPanelLinks(panel: VizPanel) {
  const interpolate: InterpolateFunction = (v, scopedVars) => {
    return sceneGraph.interpolate(panel, v, scopedVars);
  };

  const linkSupplier = getScenePanelLinksSupplier(panel, interpolate);

  if (!linkSupplier) {
    return [];
  }

  const panelLinks = linkSupplier.getLinks(interpolate);

  return panelLinks.map((panelLink) => {
    const updatedLink: LinkModel<VizPanel> = {
      ...panelLink,
      onClick: (e, origin) => {
        DashboardInteractions.panelLinkClicked({ has_multiple_links: panelLinks.length > 1 });
        panelLink.onClick?.(e, origin);
      },
    };
    return updatedLink;
  });
}


export function onRemovePanel(dashboard: DashboardScene, panel: VizPanel) {
  appEvents.publish(
    new ShowConfirmModalEvent({
      title: t('dashboard-scene.on-remove-panel.title.remove-panel', 'Remove panel'),
      text: t('dashboard-scene.on-remove-panel.text.remove-panel', 'Are you sure you want to remove this panel?'),
      icon: 'trash-alt',
      yesText: 'Remove',
      onConfirm: () => dashboard.removePanel(panel),
    })
  );
}

