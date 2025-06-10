export interface KullaniciTasinmaz {
    tasinmazId: number;
    ada: string;
    parsel: string;
    nitelik: string;
    koordinat: string;

    ilId: number;
    ilceId: number;
    mahalleId: number;

    mahalle: {
        mahalleAdi: string;
        ilce: {
            ilceAdi: string;
            il: {
                ilAdi: string;
            };
        };
    };
    secili?: boolean;
}
