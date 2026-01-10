export class APIResponse {
  message: string;
  data: unknown;
  status: number;
  success: boolean;
  constructor(message: string, status: number = 200, data: unknown = {}) {
    this.message = message;
    this.data = data;
    this.status = status;
    this.success = status < 400;
  }
}
