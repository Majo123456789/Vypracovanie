import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { EmployeesDto } from '../model/employees.model';

@Injectable()
export class EmployeesService {
  private apiUrl =
    'https://rc-vault-fap-live-1.azurewebsites.net/api/gettimeentries?code=vO17RnE8vuzXzPJo5eaLLjXjmRW07law99QTD90zat9FfOQJKKUcgQ==';

  constructor(private http: HttpClient) {}

  getAll(): Observable<EmployeesDto> {
    return this.http.get<EmployeesDto>(this.apiUrl);
  } 

}
