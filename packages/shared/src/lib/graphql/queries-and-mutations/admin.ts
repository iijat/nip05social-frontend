import { StatOutput } from '../output/stat-output';

export interface AdminStatsQueryRoot {
  adminStats: StatOutput | null;
}
