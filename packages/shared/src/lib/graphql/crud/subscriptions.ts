import { JobUpdateOutput } from '../output/login-job-update-output';

export type JobStateChangeSubscriptionArgs = {
  pubkey: string;
  jobId: string;
};

export type JobStateChangeSubscriptionRoot = {
  jobStateChange: JobUpdateOutput;
};
