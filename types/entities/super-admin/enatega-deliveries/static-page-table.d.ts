export interface StaticPageData {
    title: string;
    slug: string;
    content: string;
    publish: boolean;
    banner?: File | null;
}