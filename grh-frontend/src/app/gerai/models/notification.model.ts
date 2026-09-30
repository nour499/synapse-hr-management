export interface Notification {
    id: number;
    titre: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'danger';
    icone: string;
    heure: string;
    lue: boolean;
    role?: 'CHEF' | 'EMPLOYE' | 'ADMIN' | 'COMITE';
    lien?: string;
}

/** Shape returned by the backend REST API / WebSocket */
export interface BackendNotificationDTO {
    notificationId: number;
    employeeId?: number;
    type: 'NOUVELLE_DEMANDE' | 'DEMANDE_APPROUVEE' | 'DEMANDE_REJETEE' | 'NOUVEAU_MESSAGE' | 'RAPPEL' | 'INFO';
    title: string;
    content: string;
    referenceType?: string;
    referenceId?: number;
    actionUrl?: string;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
    triggeredBy?: number;
}

const TYPE_MAP: Record<BackendNotificationDTO['type'], { type: Notification['type']; icone: string }> = {
    NOUVELLE_DEMANDE: { type: 'info',    icone: 'ti ti-file-plus'      },
    DEMANDE_APPROUVEE:{ type: 'success', icone: 'ti ti-circle-check'   },
    DEMANDE_REJETEE:  { type: 'danger',  icone: 'ti ti-circle-x'       },
    NOUVEAU_MESSAGE:  { type: 'info',    icone: 'ti ti-message'         },
    RAPPEL:           { type: 'warning', icone: 'ti ti-bell-ringing'    },
    INFO:             { type: 'info',    icone: 'ti ti-info-circle'     },
};

export function mapBackendNotification(dto: BackendNotificationDTO): Notification {
    const mapped = TYPE_MAP[dto.type] ?? { type: 'info' as const, icone: 'ti ti-bell' };
    return {
        id:     dto.notificationId,
        titre:  dto.title,
        message:dto.content,
        type:   mapped.type,
        icone:  mapped.icone,
        heure:  dto.createdAt,
        lue:    dto.isRead,
        lien:   dto.actionUrl,
    };
}