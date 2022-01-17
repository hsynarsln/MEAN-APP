import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  //? BURADA --> LOGIN YAPTIĞIMIZ ZAMAN SAĞ YUKARIDA NEW && LOGOUT LİNKKLERİNİ
  //?        --> LOGOUT YAPTIĞIMIZ ZAMAN SIGN && LOGIN BUTONLARININ GÖRÜNMESİ İŞLEMİNİ YAPTIK
  //?--------------------------------------------------------------------------
  userIsAuthenticated = false;
  private authListenerSubs: Subscription;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.userIsAuthenticated = this.authService.getIsAuth()
    this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
    })
  }

  onLogout() {
    this.authService.logout()
  }

  ngOnDestroy(): void {
    this.authListenerSubs.unsubscribe();
  }
  //?--------------------------------------------------------------------------
  //? EN SON OLARAK HTML DOSYASINA *ngIf CONDITION EMPOZE ETTİK

}
