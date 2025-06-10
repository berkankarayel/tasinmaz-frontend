import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { KullaniciListesiComponent } from './components/kullanici-listesi/kullanici-listesi.component';
import { LoglarComponent } from './components/loglar/loglar.component';
import { TasinmazListComponent } from './components/tasinmaz-list/tasinmaz-list.component';
import { TasinmazlarimComponent } from './components/tasinmazlarim/tasinmazlarim.component';
import { TasinmazEkleComponent } from './components/tasinmaz-ekle/tasinmaz-ekle.component'; // ✅ Ekleyin


import { TasinmazGuncelleComponent } from './components/tasinmaz-guncelle/tasinmaz-guncelle.component';
import { TasinmazHaritaComponent } from './components/tasinmaz-harita/tasinmaz-harita.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // 👉 Uygulama açıldığında login'e yönlendir
  { path: 'login', component: LoginComponent },
  { path: 'kullanicilar', component: KullaniciListesiComponent, canActivate: [AuthGuard] },
  { path: 'loglar', component: LoglarComponent, canActivate: [AuthGuard] },
  { path: 'tasinmazlar', component: TasinmazListComponent, canActivate: [AuthGuard] },
  { path: 'tasinmazlarim', component: TasinmazlarimComponent, canActivate: [AuthGuard] },
  { path: 'tasinmaz-ekle', component: TasinmazEkleComponent }, // ✅ Yeni route
  { path: 'tasinmaz-guncelle/:id', component: TasinmazGuncelleComponent },
  { path: 'harita-gorunum', component: TasinmazHaritaComponent },
  { path: '**', redirectTo: 'login' } // 👉 Hatalı path'lerde login'e yönlendir
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
