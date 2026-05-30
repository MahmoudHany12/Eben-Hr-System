import type { AxiosError } from 'axios';
import type { ApiErrorResponse, ApiErrorDetail } from '@/types/api.types';

const flattenDetail = (detail: ApiErrorDetail | unknown): string | null => {
    if (typeof detail === 'string') {
        return detail.trim() || null;
    }

    if (Array.isArray(detail)) {
        for (const item of detail) {
            const message = flattenDetail(item);
            if (message) return message;
        }
        return null;
    }

    if (detail && typeof detail === 'object') {
        for (const value of Object.values(detail as Record<string, unknown>)) {
            const message = flattenDetail(value);
            if (message) return message;
        }
    }

    return null;
};

export const getApiErrorMessage = (error: unknown, fallback = 'Unable to save changes'): string => {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const detail = axiosError?.response?.data?.error?.detail;
    const flattened = flattenDetail(detail);
    if (flattened) {
        return flattened;
    }

    if (axiosError?.response?.status === 401) {
        return 'You are not authorized to perform this action.';
    }

    if (axiosError?.response?.status === 403) {
        return 'You do not have permission to perform this action.';
    }

    return fallback;
};