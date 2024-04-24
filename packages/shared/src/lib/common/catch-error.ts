type ApolloError = {
  name: string;
  graphQLErrors: Array<{
    message: string;
    locations: Array<{
      line: number;
      column: number;
    }>;
    path: string[];
  }>;
  protocolErrors: any[];
  clientErrors: any[];
  networkError: {
    headers: {
      normalizedNames: any;
      lazyUpdate: any;
    };
    status: number; // 400
    statusText: string; // Bad Request
    url: string;
    ok: boolean;
    name: string; // HttpErrorResponse
    message: string; // Http failure response for http://localhost:4000/graphql: 400 Bad Request
    error: {
      errors: Array<{
        message: string;
        locations: Array<{
          line: number;
          column: number;
        }>;
      }>;
    };
  };
  message: string;
};

type LocalError = {
  message: string;
  locations: Array<{
    line: number;
    column: number;
  }>;
};

class MessageFound {
  found: true = true;
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}

class MessageNotFound {
  found: false = false;
}

export class CatchError {
  // #region Public Properties

  get error(): any {
    return this._error;
  }

  get message(): string {
    const apolloError = this._tryGetApolloError();

    if (apolloError.found) {
      return apolloError.message;
    }

    const localError = this._tryGetLocalError();
    if (localError.found) {
      return localError.message;
    }

    return JSON.stringify(this._error);
  }

  // #endregion Public Properties

  // #region Private Properties

  private _error: any;

  // #endregion Private Properties

  // #region Constructor

  constructor(error: any) {
    this._error = error;
  }

  // #endregion Constructor

  // #region Private Methods

  private _tryGetApolloError(): MessageFound | MessageNotFound {
    try {
      const apolloError = this._error as ApolloError;

      // 1st: Analyze if the networkError object is available
      if (
        typeof apolloError.networkError !== 'undefined' &&
        typeof apolloError.networkError.error !== 'undefined' &&
        typeof apolloError.networkError.error.errors !== 'undefined' &&
        Array.isArray(apolloError.networkError.error.errors) &&
        apolloError.networkError.error.errors.length > 0
      ) {
        const message = apolloError.networkError.error.errors[0].message;
        return new MessageFound(message);
      }

      // 2nd: Analyze if the graphQLErrors array is available
      if (
        typeof apolloError.graphQLErrors !== 'undefined' &&
        Array.isArray(
          apolloError.graphQLErrors && apolloError.graphQLErrors.length > 0
        )
      ) {
        const message = apolloError.graphQLErrors[0].message;
        if (typeof message !== 'undefined') {
          return new MessageFound(message);
        }
      }

      return new MessageNotFound();
    } catch (error) {
      return new MessageNotFound();
    }
  }

  private _tryGetLocalError(): MessageFound | MessageNotFound {
    try {
      const localError = this._error as LocalError;
      if (typeof localError.message !== 'undefined') {
        return new MessageFound(localError.message);
      }

      return new MessageNotFound();
    } catch (error) {
      return new MessageNotFound();
    }
  }

  // #endregion Private Methods
}
