import { Injectable } from "@angular/core";
import { AddCustomerResponse, Customer, Customers, DeleteCustomerResponse } from "./models/customer.model";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, catchError, map } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  private currentCustomerList: Customer[] = [];

  constructor(
    private http: HttpClient
  ) {}

  getCustomers(): Observable<Customers> {
    return this.http.get<Customers>("customers");
  };

  addCustomer(customerName: string, customerAddress: string, customerPhone: string): Observable<AddCustomerResponse> {
    const body = {
      "name": customerName,
      "address": customerAddress,
      "phone": customerPhone
    };
    const headers = {
      headers : new HttpHeaders({"Content-Type": "application/json"}),
    };
    return this.http.post<AddCustomerResponse>("customers", body, headers);
  };

  updateCustomer(customerId: string, customerName: string, customerAddress: string, customerPhone: string): Observable<AddCustomerResponse> {
    const body = {
      "name": customerName,
      "address": customerAddress,
      "phone": customerPhone
    };
    const headers = {
      headers : new HttpHeaders({"Content-Type": "application/json"}),
    };
    return this.http.patch<AddCustomerResponse>(`customers/${customerId}`, body, headers);
  };

  deleteCustomer(customerId: string) {
    return this.http.delete<DeleteCustomerResponse>(`customers/${customerId}`);
  }

  filterCustomers(searchTerm: string) {
    return this.currentCustomerList.filter(customer => {
      return customer.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
    });
  }

  setCurrentCustomerList(customers: Customer[]) {
    this.currentCustomerList = customers;
  }
}