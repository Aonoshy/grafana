import { css } from '@emotion/css';
import { skipToken } from '@reduxjs/toolkit/query';
import { memo, useEffect, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom-v5-compat';
import AutoSizer from 'react-virtualized-auto-sizer';

import { PageLayoutType, GrafanaTheme2 } from '@grafana/data';
import { Trans } from '@grafana/i18n';
import { useStyles2 } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { useDispatch } from 'app/types/store';

import { ManagerKind } from '../apiserver/types';
import { useSearchStateManager } from '../search/state/SearchStateManager';
import { SearchLayout } from '../search/types';

import './styles/custom-theme.scss';
import './styles/grafana-overrides.scss';

import { useGetFolderQuery } from './api/browseDashboardsAPI';
import { BrowseActions } from './components/BrowseActions/BrowseActions';
import { BrowseView } from './components/BrowseView';
import CreateNewButton from './components/CreateNewButton';
import { ProvisionedFolderPreviewBanner } from './components/ProvisionedFolderPreviewBanner';
import { SearchView } from './components/SearchView';
import { getFolderPermissions } from './permissions';
import { useHasSelection } from './state/hooks';
import { setAllSelection } from './state/slice';

// New Browse/Manage/Search Dashboards views for nested folders
const BrowseDashboardsPage = memo(({ queryParams }: { queryParams: Record<string, string> }) => {
  const { uid: folderUID } = useParams();
  const dispatch = useDispatch();

  const styles = useStyles2(getStyles);
  const [searchState, stateManager] = useSearchStateManager();
  const isSearching = stateManager.hasSearchFilters();
  const location = useLocation();
  const search = useMemo(() => new URLSearchParams(location.search), [location.search]);

  useEffect(() => {
    stateManager.initStateFromUrl(folderUID);

    stateManager.onSortChange('name_sort');
    stateManager.onLayoutChange(SearchLayout.Folders);

    // Clear selected state when folderUID changes
    dispatch(
      setAllSelection({
        isSelected: false,
        folderUID: undefined,
      })
    );
  }, [dispatch, folderUID, stateManager]);

  // Trigger search when "starred" query param changes
  useEffect(() => {
    stateManager.onSetStarred(search.has('starred'));
  }, [search, stateManager]);

  useEffect(() => {
    // Clear the search results when we leave SearchView to prevent old results flashing
    // when starting a new search
    if (!isSearching && searchState.result) {
      stateManager.setState({ result: undefined, includePanels: undefined });
    }
  }, [isSearching, searchState.result, stateManager]);

  const { data: folderDTO } = useGetFolderQuery(folderUID ?? skipToken);

  const hasSelection = useHasSelection();

  // Fetch the root (aka general) folder if we're not in a specific folder
  const { data: rootFolderDTO } = useGetFolderQuery(folderDTO ? skipToken : 'general');
  const folder = folderDTO ?? rootFolderDTO;

  const { canEditFolders, canEditDashboards, canCreateDashboards } = getFolderPermissions(folder);
  const isProvisionedFolder = folder?.managedBy === ManagerKind.Repo;
  const canSelect = (canEditFolders || canEditDashboards) && !isProvisionedFolder;

  const dashboardNavModel = useMemo(() => ({
    main: { text: '', id: 'dashboards' },
    node: { text: '', id: 'dashboards' }
  }), []);

  return (
    <Page navModel={dashboardNavModel} layout={PageLayoutType.Canvas} className="dashboard-browse-page">
      <Page.Contents className={styles.pageContents}>
        <ProvisionedFolderPreviewBanner queryParams={queryParams} />

        <div className="search-table">
          <div className="search-form">
            <div className="form-item">
              <label htmlFor="dashboard-name-input" className="form-label">仪表板名称：</label>
              <input
                id="dashboard-name-input"
                type="text"
                className="search-input"
                placeholder="请输入仪表板名称"
                value={searchState.query}
                onChange={(e) => stateManager.onQueryChange(e.target.value)}
              />
            </div>

            <div className="form-item">
              <label htmlFor="tags-input" className="form-label">标签：</label>
              <input
                id="tags-input"
                type="text"
                className="search-input"
                placeholder="请输入标签"
                value={searchState.tag.join(',')}
                onChange={(e) => {
                  const tags = e.target.value ? e.target.value.split(',').map(t => t.trim()).filter(t => t) : [];
                  stateManager.onTagFilterChange(tags);
                }}
              />
            </div>


            <div className="operation-search">
              <button
                type="button"
                className="yh-button yh-button-primary"
                onClick={() => {
                  if (stateManager.hasSearchFilters()) {
                    stateManager.onQueryChange(searchState.query);
                  }
                }}
              >
                <Trans i18nKey="search.button.search">查询</Trans>
              </button>
              <button
                type="button"
                className="yh-button yh-button-default"
                onClick={() => {
                  stateManager.onQueryChange('');
                  stateManager.onTagFilterChange([]);
                }}
              >
                <Trans i18nKey="search.button.reset">重置</Trans>
              </button>
              {canCreateDashboards && (
                <CreateNewButton
                  parentFolder={folderDTO}
                  canCreateDashboard={canCreateDashboards}
                  canCreateFolder={false}
                />
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-list-area">
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-card-title">仪表盘列表</div>
              {hasSelection && (
                <div className="dashboard-card-actions">
                  <BrowseActions />
                </div>
              )}
            </div>

            <div className="dashboard-card-content">
              <div className={styles.subView}>
                <AutoSizer>
                  {({ width, height }) =>
                    isSearching ? (
                      <SearchView
                        canSelect={canSelect}
                        width={width}
                        height={height}
                        searchState={searchState}
                        searchStateManager={stateManager}
                      />
                    ) : (
                      <BrowseView canSelect={canSelect} width={width} height={height} folderUID={folderUID} />
                    )
                  }
                </AutoSizer>
              </div>
            </div>
          </div>
        </div>
      </Page.Contents>
    </Page>
  );
});

const getStyles = (theme: GrafanaTheme2) => ({
  pageContents: css({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    height: '100vh',
    padding: theme.spacing(2),
  }),

  subView: css({
    height: '500px',
    minHeight: '400px',
    flex: 1,
  }),

  filters: css({
    display: 'none',

    [theme.breakpoints.up('md')]: {
      display: 'block',
    },
  }),
});

BrowseDashboardsPage.displayName = 'BrowseDashboardsPage';
export default BrowseDashboardsPage;
