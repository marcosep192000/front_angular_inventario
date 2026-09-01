export interface ResponseAcceso {
  token?: string;
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  username: string;
  authorities: string[];
  permissions: string[];

}
