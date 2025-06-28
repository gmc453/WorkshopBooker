// src/types/workshop.ts
export type Workshop = {
    id: string; // w JSON Guid jest stringiem
    name: string;
    description: string;
    address: string | null;
};