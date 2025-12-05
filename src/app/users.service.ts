import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { User, Users, AddUserResponse, UpdateUserResponse, DeleteUserResponse } from "./models/user.model";

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(
    private http: HttpClient
  ) {}

  getUsers(): Observable<Users> {
    return this.http.get<Users>("users");
  }

  getUser(id: string): Observable<{ status: string; data: User }> {
    return this.http.get<{ status: string; data: User }>(`users/${id}`);
  }

  getUserByUserId(userId: string): Observable<{ status: string; data: User }> {
    return this.http.get<{ status: string; data: User }>(`users/auth/${userId}`);
  }

  createUser(userId: string, initials: string[], role: 'service' | 'admin' | 'inspector'): Observable<AddUserResponse> {
    const body = {
      userId: userId,
      initials: initials,
      role: role
    };
    const headers = {
      headers: new HttpHeaders({ "Content-Type": "application/json" })
    };
    return this.http.post<AddUserResponse>("users", body, headers);
  }

  updateUser(id: string, updates: Partial<{ userId: string; initials: string[]; role: 'service' | 'admin' | 'inspector' }>): Observable<UpdateUserResponse> {
    const headers = {
      headers: new HttpHeaders({ "Content-Type": "application/json" })
    };
    return this.http.patch<UpdateUserResponse>(`users/${id}`, updates, headers);
  }

  deleteUser(id: string): Observable<DeleteUserResponse> {
    return this.http.delete<DeleteUserResponse>(`users/${id}`);
  }
}
