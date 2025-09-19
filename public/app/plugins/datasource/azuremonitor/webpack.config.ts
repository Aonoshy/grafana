import type { Configuration } from 'webpack';
import { merge } from 'webpack-merge';

import grafanaConfig from '@grafana/plugin-configs/webpack.config.ts';

type Env = {
  [key: string]: true | string | Env;
};

const config = async (env: Env): Promise<Configuration> => {
  const baseConfig = await grafanaConfig(env);

  return merge(baseConfig, {
    externals: ['@kusto/monaco-kusto', 'i18next'],
  });
};

export default config;
