import pkg from '../../package.json';

const KEY = `${pkg.name}/config`;
let _config: ConfigWithVersion | null = null;

interface Config {
  accountId: string;
  accountName: string;
  accountCurrency: string;
}

interface ConfigWithVersion extends Config {
  version: typeof pkg.version;
}

export const setConfig = (config: Config): void => {
  _config = { ...config, version: pkg.version };
  localStorage.setItem(KEY, JSON.stringify(_config));
};

export const getMaybeConfig = () => {
  if (!_config) {
    const configString = localStorage.getItem(KEY);

    if (configString) {
      try {
        _config = JSON.parse(configString) as ConfigWithVersion;
      } catch (error) {
        console.error({ configString, error });
        _config = null;
      }
    }
  }

  if (_config && _config.version !== pkg.version) {
    localStorage.clear();
    window.location.reload();
  }

  return _config;
};

export const getConfig = () => {
  return getMaybeConfig() as Config;
};
