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
    companyName: 'Enatega',
    appName: 'Enatega Admin',
    shortName: 'Enatega',
    description: 'Enatega Deliveries administration portal',
    logo: '/images/main-logo.png',
    favicon: '/favicon.ico',
    colors: {
      primary: '#1e40af',
      secondary: '#0f172a',
      tertiary: '#e2e8f0',
    },
    titles: {
      admin: 'Enatega Admin',
      auth: 'Enatega Admin',
      vendor: 'Enatega Vendor',
      store: 'Enatega Store',
    },
  },
  enabledModules: {
    deliveries: true,
  },
  moduleLabels: {
    deliveries: 'Enatega Deliveries',
  },
};

export const isModuleEnabled = (moduleKey: AdminModuleKey): boolean =>
  deployment.enabledModules[moduleKey];
