import { useStyles2 } from '@grafana/ui';
import { DashboardModel } from 'app/features/dashboard/state/DashboardModel';
import { DashboardScene } from 'app/features/dashboard-scene/scene/DashboardScene';
import { getCustomClientStyles } from '../styles/customClientStyles';

export interface Props {
  dashboard: DashboardModel | DashboardScene;
  canCreate: boolean;
}

const DashboardEmpty = ({ dashboard, canCreate }: Props) => {
  const styles = useStyles2(getCustomClientStyles);

  return (
    <div className={styles.emptyDashboardContainer}>
      <div className={styles.emptyDashboardText}>
        暂无视图
      </div>
    </div>
  );
};

export default DashboardEmpty;
