export type ApiErrorDetail = Record<string, unknown> | string;

export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        detail: ApiErrorDetail;
    };
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}
