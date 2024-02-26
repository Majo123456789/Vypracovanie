import { Injectable } from '@angular/core';
import { Employee, EmployeesDto } from '../model/employees.model';
import { BehaviorSubject, Observable, of, switchMap, tap } from 'rxjs';
import { EmployeesService } from '../service/employees.service';
import Chart from 'chart.js/auto';
import 'chartjs-plugin-datalabels';

export interface EmployeesState {
  workers: Employee[];
  header: 'Employees';
  loading: boolean;
}

@Injectable()
export class EmployeesObservableStore {
  private stateBehaviouralSubject = new BehaviorSubject<EmployeesState>({
    workers: [],
    header: 'Employees',
    loading: false,
  });

  constructor(private readonly EmployeesService: EmployeesService) {}

  get state$(): Observable<EmployeesState> {
    return this.stateBehaviouralSubject.asObservable();
  }

  private getData(): Observable<EmployeesDto> {
    return this.EmployeesService.getAll().pipe(
      //delay(1500),
      //tap((res) => console.log(res)),
      tap((res) =>
        this.setState(
          this.getEmployeesMaper(this.calculateTotalWorkedHours(res))
        )
      )
    );
  }

  getDataWithLoader(): Observable<EmployeesDto> {
    return of(true).pipe(
      tap(() => this.startLoader()),
      switchMap(() => this.getData()),
      tap(() => this.stopLoader())
    );
  }

  private setState(value: EmployeesState) {
    //console.log('Setting state:', value);
    this.stateBehaviouralSubject.next(value);
  }

  private startLoader() {
    this.setState({
      ...this.stateBehaviouralSubject.getValue(),
      loading: true,
    });
  }

  private stopLoader() {
    this.setState({
      ...this.stateBehaviouralSubject.getValue(),
      loading: false,
    });
  }

  private calculateWorkedHours(employee: Employee) {
    const startTime = new Date(employee.StarTimeUtc);
    const endTime = new Date(employee.EndTimeUtc);
    const workedHours =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    employee.WorkedHours = workedHours;
    return employee;
  }

  calculateTotalWorkedHours(employees: Employee[]): Employee[] {
    const employeeMap: Map<string, Employee> = employees.reduce(
      (map, employee) => {
        const key = employee.EmployeeName;

        const employeeInMap = map.get(employee.EmployeeName);
        if (employeeInMap) {
          employeeInMap.WorkedHours +=
            this.calculateWorkedHours(employee).WorkedHours;
          map.set(employeeInMap.EmployeeName, employeeInMap);
        } else {
          map.set(employee.EmployeeName, this.calculateWorkedHours(employee));
        }

        return map;
      },
      new Map<string, Employee>()
    );
    //console.log(employeeMap);
    const sortedEmployees = Array.from(employeeMap.values()).sort(
      (a, b) => b.WorkedHours - a.WorkedHours
    );
    //console.log(sortedEmployees);
    return sortedEmployees;
  }

  private getEmployeesMaper(employees: Employee[]): EmployeesState {
    //console.log('Received Employees Data:', employeesDto);
    const copyOfState = { ...this.stateBehaviouralSubject.getValue() };
    //console.log(employees);
    return {
      ...copyOfState,
      workers: employees,
    };
  }

  renderPieChart(): void {
    this.state$.subscribe((state) => {
      const workers = state.workers;

      const totalWorkedHours = workers.reduce(
        (total, employee) => total + employee.WorkedHours,
        0
      );

      const labels = workers.map(
        (employee) =>
          `${employee.EmployeeName} (${(
            (employee.WorkedHours / totalWorkedHours) *
            100
          ).toFixed(2)}%)`
      );
      const data = workers.map((employee) => employee.WorkedHours);

      const ctx = document.getElementById('pieChart') as HTMLCanvasElement;
      const pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [
            {
              data: data,
              backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4CAF50',
                '#FF5733',
                '#8e44ad',
                '#3498db',
                '#e74c3c',
                '#2ecc71',
                '#f39c12',
              ],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 20, // Set the box width for each legend item
                font: {
                  size: 14, // Set the font size of the legend items
                },
                padding: 10, // Add padding between legend items
              },
            },
          },
          layout: {
            padding: {
              bottom: 20, // Add space below the chart
            },
          },
        },
      });
    });
  }
}
