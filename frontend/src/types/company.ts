export interface Company {
    id: number;
    name: string;
    address: string;
    created_at: string;
    updated_at: string;
    departments_count?: number;
    employees_count?: number;
}
