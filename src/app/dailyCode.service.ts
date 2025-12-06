import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

export type DailyCode = {
  code: string;
  date: string;
};

export type DailyCodeResponse = {
  status: string;
  message: string;
  data: DailyCode;
};

export type VerifyCodeResponse = {
  status: string;
  message: string;
  data: {
    valid: boolean;
  };
};

@Injectable({
  providedIn: 'root'
})
export class DailyCodeService {

  constructor(
    private http: HttpClient
  ) {}

  getCurrentCode(): Observable<DailyCodeResponse> {
    return this.http.get<DailyCodeResponse>("dailycode");
  }

  verifyCode(code: string): Observable<VerifyCodeResponse> {
    const body = {
      code: code
    };
    const headers = {
      headers: new HttpHeaders({"Content-Type": "application/json"}),
    };
    return this.http.post<VerifyCodeResponse>("dailycode/verify", body, headers);
  }
}
