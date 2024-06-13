import { Injectable } from "@angular/core";
import { AddCustomerResponse, Customer, Customers, DeleteCustomerResponse } from "./models/customer.model";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, catchError, map } from "rxjs";
import { ScheduleLotResponse, ScheduledLot, ScheduledLots } from "./models/schedule.model";

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  constructor(
    private http: HttpClient
  ) {}

  getScheduledLots(): Observable<ScheduledLots> {
    return this.http.get<ScheduledLots>("https://app-mdoldxqroa-uc.a.run.app/schedule");
  };

  scheduleLot(lotTitle: string, lotDay: string, customerId: string): Observable<ScheduleLotResponse> {
    const body = {
      "title": lotTitle,
      "day": lotDay,
      "customerId": customerId
    };
    const headers = {
      headers : new HttpHeaders({"Content-Type": "application/json"}),
    };
    return this.http.post<ScheduleLotResponse>("https://app-mdoldxqroa-uc.a.run.app/schedule", body, headers);
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
    return this.http.patch<AddCustomerResponse>(`https://app-mdoldxqroa-uc.a.run.app/customers/${customerId}`, body, headers);
  };

  deleteCustomer(customerId: string) {
    return this.http.delete<DeleteCustomerResponse>(`https://app-mdoldxqroa-uc.a.run.app/customers/${customerId}`);
  }
}