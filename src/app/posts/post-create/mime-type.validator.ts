//! IMAGE VALIDATION

import { AbstractControl } from "@angular/forms";
import { Observable, Observer, of } from "rxjs";

export const mimeType = (control: AbstractControl) : Promise<{[key:string]: any}> | Observable<{[key: string]: any}> => {
  //* image path we assigned is not a valid file. it's a string, it's not a file, it's not making it through our mime type check
  if (typeof(control.value) === 'string') {
    return of(null); //? of --> is a quick and easy way of adding or creating an observable which will emit data immediately
  }

  const file = control.value as File;//? TS'nin file olarak algılaması için
  const fileReader = new FileReader();
  const frObs = Observable.create((observer: Observer<{[key: string]: any}>) => { //? Observer use to control when this observable emits data
    fileReader.addEventListener("loadend", () => { //? loadend --> has more information about the file you could say
      const arr = new Uint8Array(fileReader.result as ArrayBuffer).subarray(0, 4); //? create a new array of 8 bit inside integers
      let header = "";
      let isValid = false;
      for (let i=0; i<arr.length; i++) {
        header += arr[i].toString(16); //? convert hexadecimal
      }
      //? switch case metodunu file type'lara göre belirledik. aşağıdaki file type'lardan başka bir file yüklemez.
      switch (header) {
        case "89504e47":
          isValid = true;
          break;
        case "ffd8ffe0":
        case "ffd8ffe1":
        case "ffd8ffe2":
        case "ffd8ffe3":
        case "ffd8ffe8":
          isValid = true;
          break;
        default:
          isValid = false;
          break;
      }
      if (isValid) {
        observer.next(null);
      } else {
        observer.next({invalidMimeType : true});
      }
      observer.complete();
    })
    fileReader.readAsArrayBuffer(file); //? allow us to access the mime type
  });
  return frObs;
}
