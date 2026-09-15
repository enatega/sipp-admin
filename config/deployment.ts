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
    companyName: 'SIPP',
    appName: 'SIPP Admin',
    shortName: 'SIPP',
    description: 'SIPP administration portal',
    logo: '/images/sip-transparent-logo.png',
    favicon: '/sipp-favicon.png',

    colors: {
      primary: '#66c0f2',
      secondary: '#e33935',
      tertiary: '#b98d45',
    },
    titles: {
      admin: 'SIPP Admin',
      auth: 'SIPP Admin',
      vendor: 'SIPP Vendor',
      store: 'SIPP Store',
    },
  },
  enabledModules: {
    deliveries: true,
  },
  moduleLabels: {
    deliveries: 'SIPP Deliveries',
  },
};

export const isModuleEnabled = (moduleKey: AdminModuleKey): boolean =>
  deployment.enabledModules[moduleKey];
