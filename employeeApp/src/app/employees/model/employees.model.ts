export interface Employee {
  Id: string;
  EmployeeName: string;
  StarTimeUtc: string;
  EndTimeUtc: string;
  EntryNotes: string;
  DeletedOn: null;
  WorkedHours: number;
}

export type EmployeesDto = Employee[];
