import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LoginComponent } from './components/login/login.component';
import { KullaniciListesiComponent } from './components/kullanici-listesi/kullanici-listesi.component';
import { LoglarComponent } from './components/loglar/loglar.component';
import { TasinmazListComponent } from './components/tasinmaz-list/tasinmaz-list.component';
import { TasinmazlarimComponent } from './components/tasinmazlarim/tasinmazlarim.component';

import { AuthInterceptor } from './services/auth.interceptor';
import { TasinmazEkleComponent } from './components/tasinmaz-ekle/tasinmaz-ekle.component';
import { TasinmazGuncelleComponent } from './components/tasinmaz-guncelle/tasinmaz-guncelle.component';
import { TasinmazHaritaComponent } from './components/tasinmaz-harita/tasinmaz-harita.component'; // ✅ Interceptor import

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    KullaniciListesiComponent,
    LoglarComponent,
    TasinmazListComponent,
    TasinmazlarimComponent,
    TasinmazEkleComponent,
    TasinmazGuncelleComponent,
    TasinmazHaritaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
