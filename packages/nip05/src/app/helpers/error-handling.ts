import { FormControl } from '@angular/forms';

interface ApolloError {
  name: string; // "ApolloError"
  graphQLErrors: any[];
  clientErrors: any[];
  networkError: {
    headers: any;
    status: number;
    statusText: string;
    url: string;
    ok: boolean;
    name: string;
    message: string;
    error: {
      errors: Array<{
        message: string;
        locations: any[];
        path: string[];
      }>;
      data: any;
    };
  };
  message?: string;
}

const extractApolloError = (apolloError: ApolloError): string => {
  if (
    typeof apolloError.networkError !== 'undefined' &&
    Array.isArray(apolloError.networkError.error.errors)
  ) {
    return apolloError.networkError.error.errors
      .map((x) => x.message)
      .join(' / ');
  }

  if (typeof apolloError.message !== 'undefined') {
    return apolloError.message;
  }

  return 'No ApolloError extracted.';
};

export class ErrorHandling {
  static extract(error: any): string {
    try {
      const apolloError = error as ApolloError;
      if (apolloError.name === 'ApolloError') {
        return extractApolloError(apolloError);
      }

      return 'na';
    } catch (error) {
      return JSON.stringify(error);
    }
  }
}

const getErrorMessageFromFormControl = (control: FormControl): string => {
  if (!control.invalid || !control.errors) {
    return '';
  }

  return control.errors['message'];
};

export { getErrorMessageFromFormControl };
