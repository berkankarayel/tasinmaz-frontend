export interface TasinmazUpdateDto {
    tasinmazId: number;
    ada: string;
    parsel: string;
    nitelik: string;
    ilId: number;
    ilceId: number;
    mahalleId: number;
    koordinat: string; // ❗haritada değişmeyecek ama modelde bulunmalı
}
