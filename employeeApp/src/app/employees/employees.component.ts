import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { EmployeesService } from './service/employees.service';
import { EmployeesObservableStore } from './store/employees.store';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'employees',
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss',
  standalone: true,
  providers: [EmployeesService, EmployeesObservableStore],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeesComponent implements OnInit, OnDestroy {
  state$ = this.EmployeesObservableStore.state$;

  constructor(
    private readonly EmployeesObservableStore: EmployeesObservableStore
  ) {}

  destroyed = new Subject();

  ngOnDestroy(): void {
    this.destroyed.next(true);
    this.destroyed.complete();
  }

  ngOnInit() {
    this.EmployeesObservableStore.getDataWithLoader()
      .pipe(takeUntil(this.destroyed))
      .subscribe(() => {
        this.EmployeesObservableStore.renderPieChart();
      });
  }

  editEmployee(employee: any) {
    // Implement the logic to handle the edit action for the selected employee
    console.log('Editing employee');
    console.log('Editing employee:', employee);
    // Add your editing logic here
  }
}
