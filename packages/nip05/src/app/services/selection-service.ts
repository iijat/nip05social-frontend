import { Injectable } from '@angular/core';
import { RegistrationOutput } from 'packages/shared/src/lib/graphql/output/registration-output';

@Injectable({
  providedIn: 'root',
})
export class SelectionService {
  selectedRegistrationId: string | undefined;

  constructor() {}
}
