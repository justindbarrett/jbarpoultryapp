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
    lotId: string, 
    allDay: boolean, 
    endTime: Date, 
    startTime: Date, 
    title: string, 
    category: string = "",
    species: string = ""): Observable<ScheduleLotResponse> {
    const body = {
      "customerId": customerId,
      "lotId": lotId,
      "allDay": allDay,
      "endTime": endTime,
      "startTime": startTime,
      "title": title,
      "category": category,
      "species": species
    };
    const headers = {
      headers : new HttpHeaders({"Content-Type": "application/json"}),
    };
    return this.http.post<ScheduleLotResponse>("schedule", body, headers);
  };

  updateSchedule(
    scheduledLotId: string,
    customerId: string, 
    lotId: string, 
    allDay: boolean, 
    endTime: Date, 
    startTime: Date, 
    title: string, 
    category: string = "",
    species: string = "",
    processingStarted: boolean = false): Observable<ScheduleLotResponse> {
    const body = {
      "customerId": customerId,
      "lotId": lotId,
      "allDay": allDay,
      "endTime": endTime,
      "startTime": startTime,
      "title": title,
      "category": category,
      "species": species,
      "processingStarted": processingStarted
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