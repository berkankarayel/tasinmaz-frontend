export interface Tasinmaz {
    tasinmazId: number;
    kullaniciId: number;
    ilId: number;
    ilceId: number;
    mahalleId: number;
    ada: string;
    parsel: string;
    nitelik: string;
    koordinat: string;

    mahalle: {
        mahalleAdi: string;
        ilce: {
            ilceAdi: string;
            il: {
                ilAdi: string;
            };
        };
    };

    kullanici?: {
        kullaniciAdi: string;
    };

    secildi?: boolean;
}

