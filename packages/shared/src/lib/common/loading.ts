export class Loading {
  get isOngoing(): boolean {
    this._trigger; // just to refresh bindings

    for (const x of this._jobs) {
      if (x[1] === true) {
        return true;
      }
    }

    return false;
  }

  private _jobs = new Map<number, boolean>();
  private _trigger = 0;

  constructor(noOfJobs: number) {
    for (let i = 1; i <= noOfJobs; i++) {
      this._jobs.set(i, false);
    }
  }

  indicateJobStart(jobNumber: number) {
    this._jobs.set(jobNumber, true);
    this._trigger++;
  }

  indicateJobEnd(jobNumber: number) {
    this._jobs.set(jobNumber, false);
    this._trigger++;
  }
}
