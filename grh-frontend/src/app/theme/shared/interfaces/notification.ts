export interface Notification {
    id: number;
    titre: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    date: string;
    lu: boolean;
}