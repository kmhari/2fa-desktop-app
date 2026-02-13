import { invoke } from "@tauri-apps/api/core";
import type {
  Account,
  OtpValue,
  UserInfo,
  Credentials,
  CreateAccountPayload,
  AccountPreview,
} from "../types";

export const commands = {
  saveCredentials: (serverUrl: string, apiToken: string) =>
    invoke<void>("save_credentials", { serverUrl, apiToken }),

  loadCredentials: () => invoke<boolean>("load_credentials"),

  clearCredentials: () => invoke<void>("clear_credentials"),

  getCredentials: () => invoke<Credentials>("get_credentials"),

  verifyConnection: (serverUrl: string, apiToken: string) =>
    invoke<UserInfo>("verify_connection", { serverUrl, apiToken }),

  fetchAccounts: () => invoke<Account[]>("fetch_accounts"),

  fetchOtp: (accountId: number) =>
    invoke<OtpValue>("fetch_otp", { accountId }),

  createAccount: (payload: CreateAccountPayload) =>
    invoke<Account>("create_account", { payload }),

  deleteAccount: (accountId: number) =>
    invoke<void>("delete_account", { accountId }),

  previewAccount: (uri: string) =>
    invoke<AccountPreview>("preview_account", { uri }),

  decodeQr: (imageData: number[]) =>
    invoke<string>("decode_qr", { imageData }),

  checkScreenPermission: () =>
    invoke<boolean>("check_screen_permission"),

  requestScreenPermission: () =>
    invoke<boolean>("request_screen_permission"),

  captureScreenRegion: (x: number, y: number, width: number, height: number) =>
    invoke<number[]>("capture_screen_region", { x, y, width, height }),

  scanScreenForQr: (x: number, y: number, width: number, height: number) =>
    invoke<string>("scan_screen_for_qr", { x, y, width, height }),
};
