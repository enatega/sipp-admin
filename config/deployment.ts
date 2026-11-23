export type AdminModuleKey = 'deliveries';

export interface DeploymentBrandConfig {
  companyName: string;
  appName: string;
  shortName: string;
  description: string;
  logo: string | null;
  favicon: string | null;
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  titles: {
    admin: string;
    auth: string;
    vendor: string;
    store: string;
  };
}

export interface DeploymentConfig {
  brand: DeploymentBrandConfig;
  enabledModules: Record<AdminModuleKey, boolean>;
  moduleLabels: Record<AdminModuleKey, string>;
}

export const deployment: DeploymentConfig = {
  brand: {
    companyName: 'Pohanch',
    appName: 'Pohanch Admin',
    shortName: 'Pohanch',
    description: 'Pohanch administration portal',
    logo: '/images/pohanch-logo.png',
    favicon: '/pohanch-favicon.png',

    colors: {
      primary: '#F7E300',
      secondary: '#F5F5F7',
      tertiary: '#DFCC00',
    },
    titles: {
      admin: 'Admin Panel',
      auth: 'Admin Panel',
      vendor: 'Vendor Panel',
      store: 'Store Panel',
    },
  },
  enabledModules: {
    deliveries: true,
  },
  moduleLabels: {
    deliveries: 'Pohanch Deliveries',
  },
};

export const isModuleEnabled = (moduleKey: AdminModuleKey): boolean =>
  deployment.enabledModules[moduleKey];
