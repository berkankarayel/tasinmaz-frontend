export interface UserUpdateDto {
    kullaniciId: number;
    kullaniciAdi: string;
    kullaniciSoyadi: string;
    email: string;
    sifre?: string;
    rol: string;
    adres: string;
}
