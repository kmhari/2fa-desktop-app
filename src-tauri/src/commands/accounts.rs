use crate::api::client::TwoFAuthClient;
use crate::models::types::*;
use crate::state::AppState;

fn get_creds(state: &AppState) -> Result<Credentials, String> {
    state
        .credentials
        .lock()
        .map_err(|e| format!("lock: {e}"))?
        .clone()
        .ok_or_else(|| "not configured".to_string())
}

#[tauri::command]
pub async fn fetch_accounts(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<Account>, String> {
    let creds = get_creds(&state)?;
    let client = TwoFAuthClient::new(&state.http_client, &creds.server_url, &creds.api_token);
    client.list_accounts().await
}

#[tauri::command]
pub async fn create_account(
    state: tauri::State<'_, AppState>,
    payload: CreateAccountPayload,
) -> Result<Account, String> {
    let creds = get_creds(&state)?;
    let client = TwoFAuthClient::new(&state.http_client, &creds.server_url, &creds.api_token);
    client.create_account(&payload).await
}

#[tauri::command]
pub async fn preview_account(
    state: tauri::State<'_, AppState>,
    uri: String,
) -> Result<AccountPreview, String> {
    let creds = get_creds(&state)?;
    let client = TwoFAuthClient::new(&state.http_client, &creds.server_url, &creds.api_token);
    client.preview_uri(&uri).await
}

#[tauri::command]
pub async fn delete_account(
    state: tauri::State<'_, AppState>,
    account_id: u32,
) -> Result<(), String> {
    let creds = get_creds(&state)?;
    let client = TwoFAuthClient::new(&state.http_client, &creds.server_url, &creds.api_token);
    client.delete_account(account_id).await
}
