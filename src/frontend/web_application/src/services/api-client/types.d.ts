import { AxiosError } from 'axios';

export interface ErrorResponse {
  errors: [{ code: number; message: string; name: string }];
}

export type APIAxiosError = AxiosError<ErrorResponse>;
