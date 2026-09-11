import { AppSettings, WebSettings } from "@/types/entities/super-admin/enatega-deliveries/settings";
export interface GetAppSettingsResponse {
    data: AppSettings[];
    data_web: WebSettings;
}