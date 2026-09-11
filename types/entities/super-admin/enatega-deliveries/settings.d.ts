export interface AppSettings extends Record<string, unknown> {
    id: string;
    app_type: string;
    global_logo: string | null;
    splash_screen: string | null;
    maintenance_message_image: string | null;
    promotional_banner: string | null;
    is_maintenance_mode: boolean;
    maintenance_message: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    tertiary_color: string | null;
    created_at: string;
    updated_at: string;
}

export interface WebSettings extends Record<string, unknown> {
    id: string;
    global_logo: string | null;
    splash_screen: string | null;
    maintenance_message_image: string | null;
    promotional_banner: string | null;
    is_maintenance_mode: boolean;
    maintenance_message: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    tertiary_color: string | null;
    site_title: string | null;
    site_description: string | null;
    meta_keywords: string | null;
    favicon: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Admin settings entity
 */
export interface AdminSettings {
    name: string;
    email: string;
    phone: string;
    two_factor_enabled: boolean;
    profile: string;
}

/**
 * Shop mode type - SINGLE_VENDOR, MULTI_VENDOR, or STORE_CHAIN
 */
export type ShopMode = 'SINGLE_VENDOR' | 'MULTI_VENDOR' | 'STORE_CHAIN';
