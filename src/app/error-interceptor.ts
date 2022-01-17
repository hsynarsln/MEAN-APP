//! Bu interceptor ile signup, login vs herhangi bir error ile karşılaştığımız zaman "alert" oluşturuyoruz
//? Alert yerine Ng dialog material kullanıyoruz
//* NOTE : with that global intereceptor, we have a very minimal amount of code we need for handling these errors

import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { ErrorComponent } from "./error/error.component";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private dialog: MatDialog) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // console.log(error)
        // alert(error.error.message)
        //* Alert yerine mat-dialog module kullancağız

        let errorMessage = "An unknown message occured!";
        if(error.error.message) {
          errorMessage = error.error.message;
        }
        //? herhangi bir error olduğunda --> dialog'u errorcomponent içerisinde açmak için
        this.dialog.open(ErrorComponent, {data: {message:errorMessage}}) //* second argument(data) allows us to pass in an object which represents the data we want to work in this error component

        return throwError(error)
      })
    )
  }
}


