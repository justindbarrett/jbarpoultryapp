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
    return this.http.get<ScheduledLots>("schedule");
  };

  scheduleLot(
    customerId: string,
    allDay: boolean, 
    endTime: Date, 
    startTime: Date, 
    title: string,
    species: string = "",
    count: number = 0): Observable<ScheduleLotResponse> {
    const body = {
      "customerId": customerId,
      "allDay": allDay,
      "endTime": endTime,
      "startTime": startTime,
      "title": title,
      "species": species,
      "count": count
    };
    const headers = {
      headers : new HttpHeaders({"Content-Type": "application/json"}),
    };
    return this.http.post<ScheduleLotResponse>("schedule", body, headers);
  };

  updateSchedule(
    scheduledLotId: string,
    customerId: string,
    allDay: boolean, 
    endTime: Date, 
    startTime: Date, 
    title: string,
    species: string = "",
    count: number = 0,
    processingStarted?: boolean): Observable<ScheduleLotResponse> {
    const body = {
      "customerId": customerId,
      "allDay": allDay,
      "endTime": endTime,
      "startTime": startTime,
      "title": title,
      "species": species,
      "processingStarted": processingStarted,
      "count": count
    };
    const headers = {
      headers : new HttpHeaders({"Content-Type": "application/json"}),
    };
    return this.http.patch<ScheduleLotResponse>(`schedule/${scheduledLotId}`, body, headers);
  };

  deleteCustomer(scheduledLotId: string) {
    return this.http.delete<DeleteScheduleLotResponse>(`schedule/${scheduledLotId}`);
  }
}