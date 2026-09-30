export interface StatCard {
    label: string;
    value: number | string;
    icon: string;
    color: string;
    trend?: string;
    trendUp?: boolean;
}

export interface RapportRow {
    [key: string]: string | number | undefined;
}

export interface RapportData {
    stats: StatCard[];
    rows: RapportRow[];
}