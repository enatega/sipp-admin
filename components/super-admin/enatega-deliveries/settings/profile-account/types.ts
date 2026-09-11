export interface SettingsFormValues {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar: File | null;
    twoFactor: boolean;
    storeType: 'single' | 'chain' | 'multi';
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export const initialSettingsValues: SettingsFormValues = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: null,
    twoFactor: false,
    storeType: 'single',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
};

export type StoreTypeOption = { label: string; value: SettingsFormValues['storeType'] };