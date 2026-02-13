use crate::api::client::TwoFAuthClient;
use crate::models::types::*;
use crate::state::AppState;

#[tauri::command]
pub async fn fetch_otp(
    state: tauri::State<'_, AppState>,
    account_id: u32,
) -> Result<OtpValue, String> {
    let creds = state
        .credentials
        .lock()
        .map_err(|e| format!("lock: {e}"))?
        .clone()
        .ok_or_else(|| "not configured".to_string())?;
    let client = TwoFAuthClient::new(&state.http_client, &creds.server_url, &creds.api_token);
    client.get_otp(account_id).await
}
