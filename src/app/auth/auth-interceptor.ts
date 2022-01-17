  //! token --> i want to store it somehow so that i can use attach it to future requests. we can add interceptors which are simply functions that will run on any outgoing HTTP requests and manipulate these outgoing requests, for example to attach our token
  //? we are taking or we're manipulating an incoming request and we're adding our token an authorization

import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";

  @Injectable()
  export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler) { //? next --> leave that interceptor and allow other parts of our app.
      const authToken = this.authService.getToken();
      const authRequest = req.clone({ //? will create a copy of that req and editable
        headers: req.headers.set("Authorization", "Bearer " + authToken) //? Authorization --> check-auth.js'deki ile aynı olması lazım(not case sensitive)
        //? set --> anly adds a new header to headers and it sets the value for it
      })
      return next.handle(authRequest);
    }
  }


  //!!!!! EN SON APP.MODULE.TS'DE PROVIDERS'A EKLEMEMİZ LAZIM
