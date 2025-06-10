export interface Log {
    id: number;
    kullaniciId?: number;        // ✅ optional
    islemTipi?: string;          // ✅ optional
    durum?: string;
    aciklama?: string;
    tarihSaat?: string;
    kullaniciIp?: string;
    secili?: boolean;
}


