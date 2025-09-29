import { css } from '@emotion/css';
import { memo, ReactNode, useEffect, useState } from 'react';

import { GrafanaTheme2 } from '@grafana/data';
// import { store } from '@grafana/data'; // Not needed after removing paste panel option
import { selectors } from '@grafana/e2e-selectors';
import { Trans, t } from '@grafana/i18n';
import { config, locationService } from '@grafana/runtime';
import { Button, ButtonGroup, Dropdown, Menu, ToolbarButton, ToolbarButtonRow, useStyles2, useTheme2 } from '@grafana/ui';
import { getCustomClientStyles } from '../../dashboard/styles/customClientStyles';
import { AppChromeUpdate } from 'app/core/components/AppChrome/AppChromeUpdate';
// import { NavToolbarSeparator } from 'app/core/components/AppChrome/NavToolbar/NavToolbarSeparator'; // Not needed after removing separators
import grafanaConfig from 'app/core/config';
// import { LS_PANEL_COPY_KEY } from 'app/core/constants'; // Not needed after removing paste panel option
import { contextSrv } from 'app/core/core';
import { getDashboardSrv } from 'app/features/dashboard/services/DashboardSrv';
import { playlistSrv } from 'app/features/playlist/PlaylistSrv';
import { useSelector } from 'app/types/store';

// import { shareDashboardType } from '../../dashboard/components/ShareModal/utils'; // Hidden per design requirements
import { selectFolderRepository } from '../../provisioning/utils/selectors';
import { PanelEditor, buildPanelEditScene } from '../panel-edit/PanelEditor';
// import ExportButton from '../sharing/ExportButton/ExportButton'; // Hidden per design requirements
// import ShareButton from '../sharing/ShareButton/ShareButton'; // Hidden per design requirements
import { DashboardInteractions } from '../utils/interactions';
import { DynamicDashNavButtonModel, dynamicDashNavActions } from '../utils/registerDynamicDashNavAction';
import { isLibraryPanel } from '../utils/utils';

import { DashboardScene } from './DashboardScene';
import { GoToSnapshotOriginButton } from './GoToSnapshotOriginButton';
import ManagedDashboardNavBarBadge from './ManagedDashboardNavBarBadge';
import { LeftActions } from './new-toolbar/LeftActions';
import { RightActions } from './new-toolbar/RightActions';
import { PublicDashboardBadge } from './new-toolbar/actions/PublicDashboardBadge';

interface Props {
  dashboard: DashboardScene;
}

export const NavToolbarActions = memo<Props>(({ dashboard }) => {
  const hasNewToolbar = config.featureToggles.dashboardNewLayouts && config.featureToggles.newDashboardSharingComponent;

  return hasNewToolbar ? (
    <AppChromeUpdate
      breadcrumbActions={<LeftActions dashboard={dashboard} />}
      actions={<RightActions dashboard={dashboard} />}
    />
  ) : (
    <AppChromeUpdate actions={<ToolbarActions dashboard={dashboard} />} />
  );
});

NavToolbarActions.displayName = 'NavToolbarActions';

/**
 * This part is split into a separate component to help test this
 */
export function ToolbarActions({ dashboard }: Props) {
  const { isEditing, viewPanelScene, uid, meta, editview, editPanel, editable } = dashboard.useState();

  const { isPlaying } = playlistSrv.useState();
  // const [isAddPanelMenuOpen, setIsAddPanelMenuOpen] = useState(false); // Not needed after removing dropdown

  const canSaveAs = contextSrv.hasEditPermissionInFolders;
  const toolbarActions: ToolbarAction[] = [];
  const styles = useStyles2(getStyles);
  const theme = useTheme2();
  const clientStyles = getCustomClientStyles(theme);
  const isEditingPanel = Boolean(editPanel);
  const isViewingPanel = Boolean(viewPanelScene);
  const isEditedPanelDirty = usePanelEditDirty(editPanel);

  const isEditingLibraryPanel = editPanel && isLibraryPanel(editPanel.state.panelRef.resolve());
  const isNew = !Boolean(uid || dashboard.isManaged());

  // const hasCopiedPanel = store.exists(LS_PANEL_COPY_KEY); // Not needed after removing paste panel option
  // Means we are not in settings view, fullscreen panel or edit panel
  const isShowingDashboard = !editview && !isViewingPanel && !isEditingPanel;
  const isEditingAndShowingDashboard = isEditing && isShowingDashboard;
  const folderRepo = useSelector((state) => selectFolderRepository(state, meta.folderUid));
  const isManaged = Boolean(dashboard.isManagedRepository() || folderRepo);

  // Internal only;
  // allows viewer editing without ability to save
  // used for grafana play
  const canEdit = grafanaConfig.viewersCanEdit;

  if (!isEditingPanel) {
    // This adds the presence indicators in enterprise
    addDynamicActions(toolbarActions, dynamicDashNavActions.left, 'left-actions');
  }

  // Hide star/favorite button per design requirements
  // toolbarActions.push({
  //   group: 'icon-actions',
  //   condition: uid && Boolean(meta.canStar) && isShowingDashboard && !isEditing,
  //   render: () => {
  //     let desc = meta.isStarred
  //       ? t('dashboard.toolbar.unmark-favorite', 'Unmark as favorite')
  //       : t('dashboard.toolbar.mark-favorite', 'Mark as favorite');
  //     return (
  //       <ToolbarButton
  //         tooltip={desc}
  //         icon={
  //           <Icon name={meta.isStarred ? 'favorite' : 'star'} size="lg" type={meta.isStarred ? 'mono' : 'default'} />
  //         }
  //         key="star-dashboard-button"
  //         data-testid={selectors.components.NavToolbar.markAsFavorite}
  //         onClick={() => {
  //           DashboardInteractions.toolbarFavoritesClick();
  //           dashboard.onStarDashboard();
  //         }}
  //       />
  //     );
  //   },
  // });

  toolbarActions.push({
    group: 'icon-actions',
    condition: uid && Boolean(meta.canStar) && isShowingDashboard && !isEditing,
    render: () => {
      return <PublicDashboardBadge key="public-dashboard-badge" dashboard={dashboard} />;
    },
  });

  if (dashboard.isManaged() && meta.canEdit) {
    toolbarActions.push({
      group: 'icon-actions',
      condition: true,
      render: () => {
        return <ManagedDashboardNavBarBadge meta={meta} key="managed-dashboard-badge" />;
      },
    });
  }

  toolbarActions.push({
    group: 'icon-actions',
    condition: meta.isSnapshot && !isEditing,
    render: () => (
      <GoToSnapshotOriginButton key="go-to-snapshot-origin" originalURL={dashboard.getSnapshotUrl() ?? ''} />
    ),
  });

  if (!isEditingPanel && !isEditing) {
    // This adds the alert rules button and the dashboard insights button
    addDynamicActions(toolbarActions, dynamicDashNavActions.right, 'icon-actions');
  }

  // Split Add button into two separate buttons: 添加图表 and 添加标题
  toolbarActions.push({
    group: 'add-panel',
    condition: isEditingAndShowingDashboard,
    render: () => (
      <Button
        key="add-visualization-button"
        className={clientStyles.clientPrimaryButton}
        variant="primary"
        size="sm"
        onClick={() => {
          const vizPanel = dashboard.onCreateNewPanel();
          DashboardInteractions.toolbarAddButtonClicked({ item: 'add_visualization' });
          dashboard.setState({ editPanel: buildPanelEditScene(vizPanel, true) });
        }}
        data-testid={selectors.pages.AddDashboard.itemButton('Add visualization button')}
      >
添加图表
      </Button>
    ),
  });

  toolbarActions.push({
    group: 'add-panel',
    condition: isEditingAndShowingDashboard,
    render: () => (
      <Button
        key="add-row-button"
        className={clientStyles.clientPrimaryButton}
        variant="primary"
        size="sm"
        onClick={() => {
          dashboard.onCreateNewRow();
          DashboardInteractions.toolbarAddButtonClicked({ item: 'add_row' });
        }}
        data-testid={selectors.pages.AddDashboard.itemButton('Add row button')}
      >
添加标题
      </Button>
    ),
  });

  toolbarActions.push({
    group: 'playlist-actions',
    condition: isPlaying && isShowingDashboard && !isEditing,
    render: () => (
      <ToolbarButton
        key="play-list-prev"
        data-testid={selectors.pages.Dashboard.DashNav.playlistControls.prev}
        tooltip={t('dashboard.toolbar.playlist-previous', 'Go to previous dashboard')}
        icon="backward"
        onClick={() => playlistSrv.prev()}
      />
    ),
  });

  toolbarActions.push({
    group: 'playlist-actions',
    condition: isPlaying && isShowingDashboard && !isEditing,
    render: () => (
      <ToolbarButton
        key="play-list-stop"
        onClick={() => playlistSrv.stop()}
        data-testid={selectors.pages.Dashboard.DashNav.playlistControls.stop}
      >
        <Trans i18nKey="dashboard.toolbar.playlist-stop">Stop playlist</Trans>
      </ToolbarButton>
    ),
  });

  toolbarActions.push({
    group: 'playlist-actions',
    condition: isPlaying && isShowingDashboard && !isEditing,
    render: () => (
      <ToolbarButton
        key="play-list-next"
        data-testid={selectors.pages.Dashboard.DashNav.playlistControls.next}
        tooltip={t('dashboard.toolbar.playlist-next', 'Go to next dashboard')}
        icon="forward"
        onClick={() => playlistSrv.next()}
        narrow
      />
    ),
  });

  toolbarActions.push({
    group: 'back-button',
    condition: (isViewingPanel || isEditingPanel) && !isEditingLibraryPanel,
    render: () => (
      <Button
        onClick={() => {
          locationService.partial({ viewPanel: null, editPanel: null });
        }}
        tooltip=""
        key="back"
        className={clientStyles.clientBackButton}
        variant="secondary"
        size="sm"
        icon="arrow-left"
        data-testid={selectors.components.NavToolbar.editDashboard.backToDashboardButton}
      >
        <Trans i18nKey="dashboard.toolbar.back-to-dashboard">回到数据面板</Trans>
      </Button>
    ),
  });

  toolbarActions.push({
    group: 'back-button',
    condition: Boolean(editview),
    render: () => (
      <Button
        onClick={() => {
          locationService.partial({ editview: null });
        }}
        tooltip=""
        key="back"
        className={clientStyles.clientBackButton}
        variant="secondary"
        size="sm"
        icon="arrow-left"
        data-testid={selectors.components.NavToolbar.editDashboard.backToDashboardButton}
      >
        <Trans i18nKey="dashboard.toolbar.back-to-dashboard">回到数据面板</Trans>
      </Button>
    ),
  });

  // const showShareButton = uid && !isEditing && !meta.isSnapshot && !isPlaying; // Not needed after hiding share buttons
  // Hide share button per design requirements
  // toolbarActions.push({
  //   group: 'main-buttons',
  //   condition: !config.featureToggles.newDashboardSharingComponent && showShareButton,
  //   render: () => (
  //     <Button
  //       key="share-dashboard-button"
  //       tooltip={t('dashboard.toolbar.share.tooltip', 'Share dashboard')}
  //       size="sm"
  //       className={styles.buttonWithExtraMargin}
  //       fill="outline"
  //       onClick={() => {
  //         DashboardInteractions.toolbarShareClick();
  //         locationService.partial({ shareView: shareDashboardType.link });
  //       }}
  //       data-testid={selectors.components.NavToolbar.shareDashboard}
  //     >
  //       <Trans i18nKey="dashboard.toolbar.share.label">Share</Trans>
  //     </Button>
  //   ),
  // });

  toolbarActions.push({
    group: 'main-buttons',
    condition: !isEditing && (dashboard.canEditDashboard() || canEdit) && !isViewingPanel && !isPlaying && editable,
    render: () => (
      <Button
        onClick={() => {
          dashboard.onEnterEditMode();
        }}
        tooltip={t('dashboard.toolbar.edit.tooltip', 'Enter edit mode')}
        key="edit"
        className={clientStyles.clientPrimaryButton}
        variant="primary"
        size="sm"
        data-testid={selectors.components.NavToolbar.editDashboard.editButton}
      >
        <Trans i18nKey="dashboard.toolbar.edit.label">编辑</Trans>
      </Button>
    ),
  });

  toolbarActions.push({
    group: 'main-buttons',
    condition: !isEditing && dashboard.canEditDashboard() && !isViewingPanel && !isPlaying && !editable,
    render: () => (
      <Button
        onClick={() => {
          dashboard.onEnterEditMode();
          dashboard.setState({ editable: true, meta: { ...meta, canEdit: true } });
        }}
        tooltip={t('dashboard.toolbar.enter-edit-mode.tooltip', 'This dashboard was marked as read only')}
        key="edit"
        className={styles.buttonWithExtraMargin}
        variant="secondary"
        size="sm"
        data-testid={selectors.components.NavToolbar.editDashboard.editButton}
      >
        <Trans i18nKey="dashboard.toolbar.enter-edit-mode.label">Make editable</Trans>
      </Button>
    ),
  });

  // Hide export and share buttons per design requirements
  // toolbarActions.push({
  //   group: 'new-share-dashboard-buttons',
  //   condition: config.featureToggles.newDashboardSharingComponent && showShareButton,
  //   render: () => <ExportButton key="new-export-dashboard-button" dashboard={dashboard} />,
  // });

  // toolbarActions.push({
  //   group: 'new-share-dashboard-buttons',
  //   condition: config.featureToggles.newDashboardSharingComponent && showShareButton,
  //   render: () => <ShareButton key="new-share-dashboard-button" dashboard={dashboard} />,
  // });

  // Hide settings button per design requirements
  // toolbarActions.push({
  //   group: 'settings',
  //   condition: isEditing && dashboard.canEditDashboard() && isShowingDashboard,
  //   render: () => (
  //     <Button
  //       onClick={() => {
  //         dashboard.onOpenSettings();
  //       }}
  //       tooltip={t('dashboard.toolbar.dashboard-settings.tooltip', 'Dashboard settings')}
  //       fill="text"
  //       size="sm"
  //       key="settings"
  //       variant="secondary"
  //       data-testid={selectors.components.NavToolbar.editDashboard.settingsButton}
  //     >
  //       <Trans i18nKey="dashboard.toolbar.dashboard-settings.label">Settings</Trans>
  //     </Button>
  //   ),
  // });

  toolbarActions.push({
    group: 'main-buttons',
    condition: isEditing && !isNew && isShowingDashboard,
    render: () => (
      <Button
        onClick={() => dashboard.exitEditMode({ skipConfirm: false })}
        tooltip={t('dashboard.toolbar.exit-edit-mode.tooltip', 'Exits edit mode and discards unsaved changes')}
        size="sm"
        key="discard"
        className={clientStyles.clientPrimaryButton}
        variant="primary"
        data-testid={selectors.components.NavToolbar.editDashboard.exitButton}
      >
        <Trans i18nKey="dashboard.toolbar.exit-edit-mode.label">退出编辑</Trans>
      </Button>
    ),
  });

  toolbarActions.push({
    group: 'main-buttons',
    condition: isEditingPanel && !isEditingLibraryPanel && !editview && !isViewingPanel,
    render: () => (
      <Button
        onClick={editPanel?.onDiscard}
        tooltip={
          editPanel?.state.isNewPanel
            ? t('dashboard.toolbar.discard-panel-new', 'Discard panel')
            : t('dashboard.toolbar.discard-panel', 'Discard panel changes')
        }
        size="sm"
        disabled={!isEditedPanelDirty}
        key="discard"
        className={isEditedPanelDirty ? clientStyles.clientPrimaryButton : clientStyles.clientSecondaryButton}
        variant={isEditedPanelDirty ? "primary" : "secondary"}
        data-testid={selectors.components.NavToolbar.editDashboard.discardChangesButton}
      >
        {editPanel?.state.isNewPanel ? (
          <Trans i18nKey="dashboard.toolbar.discard-panel-new">丢弃面板</Trans>
        ) : (
          <Trans i18nKey="dashboard.toolbar.discard-panel">丢弃面板</Trans>
        )}
      </Button>
    ),
  });

  toolbarActions.push({
    group: 'main-buttons',
    condition: isEditingPanel && isEditingLibraryPanel && !editview && !isViewingPanel,
    render: () => (
      <Button
        onClick={editPanel?.onDiscard}
        tooltip={t('dashboard.toolbar.discard-library-panel-changes', 'Discard library panel changes')}
        size="sm"
        key="discardLibraryPanel"
        className={clientStyles.clientSecondaryButton}
        variant="secondary"
        data-testid={selectors.components.NavToolbar.editDashboard.discardChangesButton}
      >
        <Trans i18nKey="dashboard.toolbar.discard-library-panel-changes">丢弃面板</Trans>
      </Button>
    ),
  });

  toolbarActions.push({
    group: 'main-buttons',
    condition: isEditingPanel && isEditingLibraryPanel && !editview && !isViewingPanel,
    render: () => (
      <Button
        onClick={editPanel?.onUnlinkLibraryPanel}
        tooltip={t('dashboard.toolbar.unlink-library-panel', 'Unlink library panel')}
        size="sm"
        key="unlinkLibraryPanel"
        fill="outline"
        variant="secondary"
        data-testid={selectors.components.NavToolbar.editDashboard.unlinkLibraryPanelButton}
      >
        <Trans i18nKey="dashboard.toolbar.unlink-library-panel">Unlink library panel</Trans>
      </Button>
    ),
  });

  toolbarActions.push({
    group: 'main-buttons',
    condition: isEditingPanel && isEditingLibraryPanel && !editview && !isViewingPanel,
    render: () => (
      <Button
        onClick={editPanel?.onSaveLibraryPanel}
        tooltip={t('dashboard.toolbar.save-library-panel', 'Save library panel')}
        size="sm"
        key="saveLibraryPanel"
        fill="outline"
        variant="primary"
        data-testid={selectors.components.NavToolbar.editDashboard.saveLibraryPanelButton}
      >
        <Trans i18nKey="dashboard.toolbar.save-library-panel">Save library panel</Trans>
      </Button>
    ),
  });

  toolbarActions.push({
    group: 'main-buttons',
    condition: isEditing && !isEditingLibraryPanel && (meta.canSave || canSaveAs),
    render: () => {
      // if we  only can save
      if (isNew) {
        return (
          <Button
            onClick={() => {
              dashboard.openSaveDrawer({});
            }}
            className={clientStyles.clientPrimaryButton}
            tooltip={t('dashboard.toolbar.save-dashboard.tooltip', 'Save changes')}
            key="save"
            size="sm"
            variant="primary"
            data-testid={selectors.components.NavToolbar.editDashboard.saveButton}
          >
            <Trans i18nKey="dashboard.toolbar.save-dashboard.label">保存仪表板</Trans>
          </Button>
        );
      }

      // If we only can save as copy
      if (canSaveAs && !meta.canSave && !meta.canMakeEditable && !isManaged) {
        return (
          <Button
            onClick={() => {
              dashboard.openSaveDrawer({ saveAsCopy: true });
            }}
            className={clientStyles.clientPrimaryButton}
            tooltip={t('dashboard.toolbar.save-dashboard-copy.tooltip', 'Save as copy')}
            key="save"
            size="sm"
            variant="primary"
          >
            <Trans i18nKey="dashboard.toolbar.save-dashboard-copy.label">保存仪表板</Trans>
          </Button>
        );
      }

      // If we can do both save and save as copy we show a button group with dropdown menu
      const menu = (
        <Menu className={clientStyles.clientDropdownMenu}>
          <Menu.Item
            label={t('dashboard.toolbar.save-dashboard-short', '保存')}
            icon="save"
            onClick={() => {
              dashboard.openSaveDrawer({});
            }}
          />
          <Menu.Item
            label={t('dashboard.toolbar.save-dashboard-copy.label', '另存为副本')}
            icon="copy"
            onClick={() => {
              dashboard.openSaveDrawer({ saveAsCopy: true });
            }}
          />
        </Menu>
      );

      return (
        <ButtonGroup className={clientStyles.clientButtonGroup} key="save">
          <Button
            onClick={() => {
              dashboard.openSaveDrawer({});
            }}
            className={clientStyles.clientPrimaryButton}
            tooltip={t('dashboard.toolbar.save-dashboard.tooltip', 'Save changes')}
            size="sm"
            data-testid={selectors.components.NavToolbar.editDashboard.saveButton}
            variant="primary"
          >
            <Trans i18nKey="dashboard.toolbar.save-dashboard.label">保存仪表板</Trans>
          </Button>
          <Dropdown overlay={menu}>
            <Button
              aria-label={t('dashboard.toolbar.more-save-options', 'More save options')}
              icon="angle-down"
              className={clientStyles.clientPrimaryButton}
              variant="primary"
              size="sm"
              style={{ paddingLeft: '8px', paddingRight: '8px' }}
            />
          </Dropdown>
        </ButtonGroup>
      );
    },
  });

  return <ToolbarButtonRow alignment="right">{renderActionElements(toolbarActions)}</ToolbarButtonRow>;
}

function renderActionElements(toolbarActions: ToolbarAction[]) {
  const actionElements: ReactNode[] = [];

  for (const action of toolbarActions) {
    if (!action.condition) {
      continue;
    }

    // Remove separators - just add the action elements directly
    actionElements.push(action.render());
  }

  return actionElements;
}

function addDynamicActions(
  toolbarActions: ToolbarAction[],
  registeredActions: DynamicDashNavButtonModel[],
  group: string
) {
  if (registeredActions.length > 0) {
    for (const action of registeredActions) {
      const props = { dashboard: getDashboardSrv().getCurrent()! };
      if (action.show(props)) {
        const Component = action.component;
        toolbarActions.push({
          group: group,
          condition: true,
          render: () => <Component {...props} key={toolbarActions.length} />,
        });
      }
    }
  }
}

// This hook handles when panelEditor is not defined to avoid conditionally hook usage
function usePanelEditDirty(panelEditor?: PanelEditor) {
  const [isDirty, setIsDirty] = useState<Boolean | undefined>();

  useEffect(() => {
    if (panelEditor) {
      const unsub = panelEditor.subscribeToState((state) => {
        if (state.isDirty !== isDirty) {
          setIsDirty(state.isDirty);
        }
      });

      return () => unsub.unsubscribe();
    }
    return;
  }, [panelEditor, isDirty]);

  return isDirty;
}

interface ToolbarAction {
  group: string;
  condition?: boolean | string;
  render: () => ReactNode;
}

function getStyles(theme: GrafanaTheme2) {
  return {
    hiddenElementsContainer: css({
      display: 'flex',
      padding: 0,
      gap: theme.spacing(1),
      whiteSpace: 'nowrap',
    }),
    buttonWithExtraMargin: css({
      margin: theme.spacing(0, 0.5),
    }),
    publicBadge: css({
      color: 'grey',
      backgroundColor: 'transparent',
      border: '1px solid',
    }),
  };
}
