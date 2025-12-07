import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Lot, Lots } from "./models/lot.model";

@Injectable({
  providedIn: 'root'
})
export class LotsService {

  constructor(
    private http: HttpClient
  ) {}

  getLots(): Observable<Lots> {
    return this.http.get<Lots>("lots");
  };

  createLots(lots: Lot[]): Observable<any> {
    const body = {
      "lots": lots
    };
    const headers = {
      headers : new HttpHeaders({"Content-Type": "application/json"}),
    };
    return this.http.post<any>("lots", body, headers);
  };

  updateLot(
    lotId: string,
    processDate: string,
    customerId: string,
    timeIn: string,
    withdrawalMet: boolean,
    isOrganic: boolean,
    lotNumber: string,
    species: string,
    customerCount: number,
    processingInstructions: any,
    anteMortemTime: string,
    fsisInitial: string,
    finalCount: number): Observable<any> {
    const body = {
      "processDate": processDate,
      "customerId": customerId,
      "timeIn": timeIn,
      "withdrawalMet": withdrawalMet,
      "isOrganic": isOrganic,
      "lotNumber": lotNumber,
      "species": species,
      "customerCount": customerCount,
      "processingInstructions": processingInstructions,
      "anteMortemTime": anteMortemTime,
      "fsisInitial": fsisInitial,
      "finalCount": finalCount
    };
    const headers = {
      headers : new HttpHeaders({"Content-Type": "application/json"}),
    };
    return this.http.patch<any>(`lot/${lotId}`, body, headers);
  };

  deleteLot(lotId: string): Observable<any> {
    return this.http.delete<any>(`lot/${lotId}`);
  };
}
