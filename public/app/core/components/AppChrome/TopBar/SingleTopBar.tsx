import { memo } from 'react';

import { NavModelItem } from '@grafana/data';
import { ScopesContextValue } from '@grafana/runtime';

import { SingleTopBarActions } from './SingleTopBarActions';

interface Props {
  sectionNav: NavModelItem;
  pageNav?: NavModelItem;
  onToggleMegaMenu(): void;
  onToggleKioskMode(): void;
  actions?: React.ReactNode;
  breadcrumbActions?: React.ReactNode;
  scopes?: ScopesContextValue | undefined;
  showToolbarLevel: boolean;
}

export const SingleTopBar = memo(function SingleTopBar({
  onToggleMegaMenu: _onToggleMegaMenu,
  onToggleKioskMode: _onToggleKioskMode,
  pageNav: _pageNav,
  sectionNav: _sectionNav,
  scopes,
  actions,
  breadcrumbActions,
  showToolbarLevel,
}: Props) {

  return (
    <>
      {/* Area A (toolbar actions) moves up to fill the space of removed area C */}
      {showToolbarLevel && (
        <SingleTopBarActions scopes={scopes} actions={actions} breadcrumbActions={breadcrumbActions} />
      )}
    </>
  );
});

