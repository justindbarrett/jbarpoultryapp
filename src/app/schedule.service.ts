import { Injectable } from "@angular/core";
import { AddCustomerResponse, Customer, Customers, DeleteCustomerResponse } from "./models/customer.model";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, catchError, map } from "rxjs";
import { DeleteScheduleLotResponse, ScheduleLotResponse, ScheduledLot, ScheduledLots } from "./models/schedule.model";
import { IEvent } from "ionic7-calendar/calendar.interface";

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

  scheduleLot(
    customerId: string, 
    lotId: string, 
    allDay: boolean, 
    endTime: Date, 
    startTime: Date, 
    title: string, 
    category: string = ""): Observable<ScheduleLotResponse> {
    const body = {
      "customerId": customerId,
      "lotId": lotId,
      "allDay": allDay,
      "endTime": endTime,
      "startTime": startTime,
      "title": title,
      "category": category
    };
    const headers = {
      headers : new HttpHeaders({"Content-Type": "application/json"}),
    };
    return this.http.post<ScheduleLotResponse>("https://app-mdoldxqroa-uc.a.run.app/schedule", body, headers);
  };

  updateSchedule(
    scheduledLotId: string,
    customerId: string, 
    lotId: string, 
    allDay: boolean, 
    endTime: Date, 
    startTime: Date, 
    title: string, 
    category: string = ""): Observable<ScheduleLotResponse> {
    const body = {
      "customerId": customerId,
      "lotId": lotId,
      "allDay": allDay,
      "endTime": endTime,
      "startTime": startTime,
      "title": title,
      "category": category
    };
    const headers = {
      headers : new HttpHeaders({"Content-Type": "application/json"}),
    };
    return this.http.patch<ScheduleLotResponse>(`https://app-mdoldxqroa-uc.a.run.app/schedule/${scheduledLotId}`, body, headers);
  };

  deleteCustomer(scheduledLotId: string) {
    return this.http.delete<DeleteScheduleLotResponse>(`https://app-mdoldxqroa-uc.a.run.app/schedule/${scheduledLotId}`);
  }
}