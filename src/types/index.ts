export interface Account {
  id: number;
  service: string | null;
  account: string | null;
  icon: string | null;
  otp_type: string;
  digits: number;
  period: number | null;
  counter: number | null;
  algorithm: string | null;
  otp: OtpValue | null;
}

export interface OtpValue {
  password: string;
  generated_at: number | null;
  period: number | null;
  otp_type: string | null;
}

export interface UserInfo {
  name: string | null;
  email: string | null;
}

export interface CreateAccountPayload {
  uri?: string;
  service?: string;
  account?: string;
  secret?: string;
  otp_type?: string;
  digits?: number;
  period?: number;
  counter?: number;
  algorithm?: string;
}

export interface Credentials {
  server_url: string;
  api_token: string;
}

export interface AccountPreview {
  service: string | null;
  account: string | null;
  otp_type: string;
  digits: number;
  period: number | null;
  algorithm: string | null;
  icon: string | null;
}
