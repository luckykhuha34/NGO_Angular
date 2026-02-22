import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // url = "http://localhost:3000/api/";
  // url = "https://vmsbackend-eudv.onrender.com/api/";
  url = environment.apiUrl;
  
  constructor(
    private http: HttpClient
  ) {
    
    console.log(this.url, 'apiurrll')
   }
  
  post(endPoint, obj, header?) {
    try {
      return this.http.post(this.url + endPoint, obj, header);
    } catch (err) {
      console.log(err.message);
      return err.message;
    }
  }
  get(endPoint, obj) {
    try {
      return this.http.get(this.url + endPoint, obj);
    } catch (err) {
      console.log(err.message);
      return err.message;
    }
  }
  put(endPoint, obj, header?) {
    try {
      return this.http.put(this.url + endPoint, obj, header);
    } catch (err) {
      console.log(err.message);
      return err.message;
    }
  }

}
