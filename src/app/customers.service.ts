import { Injectable } from "@angular/core";
import { Customer, Customers } from "./models/customer.model";
import { HttpClient } from "@angular/common/http";
import { Observable, catchError, map } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  constructor(
    private http: HttpClient
  ) {}

  getCustomers(): Observable<Customers> {
    return this.http.get<Customers>("https://app-mdoldxqroa-uc.a.run.app/customers");
  };
}