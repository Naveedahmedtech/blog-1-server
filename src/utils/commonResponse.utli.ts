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
