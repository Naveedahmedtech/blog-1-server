import { LoginResponse, SuccessResponse } from '../auth/dto/user.dto';

export function commonResponse<T = string | LoginResponse>(
  status: number,
  message: string,
  result?: T,
): SuccessResponse<T> {
  return {
    status,
    message,
    result,
  };
}
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
}
export function createApiResponse<T>(
  statusCode: number,
  message: string,
  data?: T,
): ApiResponse<T> {
  return { statusCode, message, data };
}
