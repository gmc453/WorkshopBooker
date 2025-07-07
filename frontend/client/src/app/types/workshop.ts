// src/types/workshop.ts
export type Service = {
    id: string;
    name: string;
    description: string | null;
    price: number;
    durationInMinutes: number;
};

export type Workshop = {
    id: string; // w JSON Guid jest stringiem
    name: string;
    description: string;
    address: string | null;
    services: Service[];
    rating?: number; // Opcjonalna ocena warsztatu
};