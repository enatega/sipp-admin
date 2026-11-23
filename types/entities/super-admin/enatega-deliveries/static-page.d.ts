export interface StaticPage {
    id: string;
    page_name: string;
    slug: string;
    content: string;
    page_title?: string;
    meta_description?: string;
    banner_image: File | null | string;
    is_published: boolean;
    sort_order?: number;
    created_at?: string;   // ISO date
    updated_at?: string;   // ISO date
}