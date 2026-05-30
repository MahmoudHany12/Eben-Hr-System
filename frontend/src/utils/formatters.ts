export const formatDate = (value: string | Date): string => {
    const date = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat('en', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
};
