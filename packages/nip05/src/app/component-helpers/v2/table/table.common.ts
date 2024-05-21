import { Observable } from 'rxjs';

export type TableHeader = {
  displayName: string;
  propertyName: string;
  propertyTransform?: (rowData: any) => Observable<string>;
};

export type TableItem = {
  id: string;
  isSelected: boolean;
  data: any;
};
