import { LookupStatisticsOutput } from './lookup-statistics-output';
import { RegistrationStatisticsOutput } from './registration-statistics-output';
import { RegistrationsPerDomainStatisticsOutput } from './registrations-per-domain-output';

export type UsageStatisticsOutput = {
  date?: string;
  noOfUsers?: number;
  noOfRegistrations?: number;
  noOfLookupsYesterday?: number;
  noOfLookupsToday?: number;

  topLookupsToday?: LookupStatisticsOutput[];
  lastRegistrations?: RegistrationStatisticsOutput[];
  registrationsPerDomain?: RegistrationsPerDomainStatisticsOutput[];
};
