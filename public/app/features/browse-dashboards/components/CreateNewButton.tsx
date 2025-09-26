import { useState } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

import { config, reportInteraction } from '@grafana/runtime';
import { Dropdown, Icon, Menu, MenuItem } from '@grafana/ui';
import {
  getImportPhrase,
  getNewDashboardPhrase,
  getNewPhrase,
} from 'app/features/search/tempI18nPhrases';
import { FolderDTO } from 'app/types/folders';

interface Props {
  parentFolder?: FolderDTO;
  canCreateFolder: boolean;
  canCreateDashboard: boolean;
}

export default function CreateNewButton({ parentFolder, canCreateDashboard, canCreateFolder }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const newMenu = (
    <Menu className="yh-dropdown">
      {canCreateDashboard && (
        <MenuItem
          className="dropdown-item"
          label={getNewDashboardPhrase()}
          onClick={() =>
            reportInteraction('grafana_menu_item_clicked', {
              url: buildUrl('/dashboard/new', parentFolder?.uid),
              from: location.pathname,
            })
          }
          url={buildUrl('/dashboard/new', parentFolder?.uid)}
        />
      )}
      {canCreateDashboard && (
        <MenuItem
          className="dropdown-item"
          label={getImportPhrase()}
          onClick={() =>
            reportInteraction('grafana_menu_item_clicked', {
              url: buildUrl('/dashboard/import', parentFolder?.uid),
              from: location.pathname,
            })
          }
          url={buildUrl('/dashboard/import', parentFolder?.uid)}
        />
      )}
    </Menu>
  );

  return (
    <>
      <Dropdown overlay={newMenu} onVisibleChange={setIsOpen}>
        <button type="button" className="yh-button yh-button-primary">
          {getNewPhrase()}
          <Icon name={isOpen ? 'angle-up' : 'angle-down'} />
        </button>
      </Dropdown>
    </>
  );
}

/**
 *
 * @param url without any parameters
 * @param folderUid  folder id
 * @returns url with paramter if folder is present
 */
function buildUrl(url: string, folderUid: string | undefined) {
  const baseUrl = folderUid ? url + '?folderUid=' + folderUid : url;
  return config.appSubUrl ? config.appSubUrl + baseUrl : baseUrl;
}
