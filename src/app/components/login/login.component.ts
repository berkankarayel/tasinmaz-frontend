import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  hataMesaji: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      sifre: ['', Validators.required]
    });
  }

  onSubmit() {
    const girisBilgileri = this.loginForm.value;

    this.authService.login(girisBilgileri).subscribe({
      next: (res) => {
        this.authService.setToken(res.token);

        const rol = this.authService.getUserRole();

        if (rol === 'Admin') {
          this.router.navigate(['/kullanicilar']);
        } else if (rol === 'Kullanici') {
          this.router.navigate(['/tasinmazlarim']);
        } else {
          this.hataMesaji = 'Geçersiz rol bilgisi!';
        }
      },
      error: (err) => {
        this.hataMesaji = err.error;
      },
    });
  }


}
