import { StaticPage } from "@/types/entities/super-admin/enatega-deliveries/static-page";

export interface GetStaticPageResponse {
    data: StaticPage[]
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface GetStaticPagesPayload {
    include_unpublished?: boolean;
    page?: number;
    limit?: number;
    search?: string;
}

export interface ToggleStaticPagePublishPayload {
    id: string;
}

export type ToggleStaticPagePublishResponse = StaticPage;


export interface DeleteStaticPagePayload {
    id: string;
}

export interface DeleteStaticPageResponse {
    message: string;
    success: boolean;
}


export interface CreateStaticPagePayload {
    page_name: string;
    slug: string;
    content: string;
    banner_image: File | null | string;
    is_published: boolean;
}

export type CreateStaticPageResponse = StaticPage

export interface UpdateStaticPagePayload {
    id: string;
    page_name?: string;
    slug?: string;
    content?: string;
    banner_image?: File | null | string;
    is_published?: boolean;
}

export type UpdateStaticPageResponse = StaticPage