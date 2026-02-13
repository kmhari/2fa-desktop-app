use base64::{engine::general_purpose::STANDARD as B64, Engine};
use std::fs;
use tauri::{AppHandle, Manager};

use crate::api::client::TwoFAuthClient;
use crate::crypto::encryption;
use crate::models::types::{Credentials, UserInfo};
use crate::state::AppState;

fn credentials_path(app: &AppHandle) -> Result<std::path::PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("app data dir: {e}"))?;
    fs::create_dir_all(&dir).map_err(|e| format!("create dir: {e}"))?;
    Ok(dir.join("credentials.enc"))
}

fn key_path(app: &AppHandle) -> Result<std::path::PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("app data dir: {e}"))?;
    fs::create_dir_all(&dir).map_err(|e| format!("create dir: {e}"))?;
    Ok(dir.join("keyfile.key"))
}

fn load_or_create_key(app: &AppHandle) -> Result<[u8; 32], String> {
    let path = key_path(app)?;
    if path.exists() {
        let encoded = fs::read_to_string(&path).map_err(|e| format!("read key: {e}"))?;
        let bytes = B64
            .decode(encoded.trim())
            .map_err(|e| format!("decode key: {e}"))?;
        if bytes.len() != 32 {
            return Err("invalid key length".into());
        }
        let mut key = [0u8; 32];
        key.copy_from_slice(&bytes);
        Ok(key)
    } else {
        let key = encryption::generate_key();
        let encoded = B64.encode(key);
        fs::write(&path, encoded).map_err(|e| format!("write key: {e}"))?;
        Ok(key)
    }
}

#[tauri::command]
pub async fn save_credentials(
    app: AppHandle,
    state: tauri::State<'_, AppState>,
    server_url: String,
    api_token: String,
) -> Result<(), String> {
    let creds = Credentials {
        server_url: server_url.trim_end_matches('/').to_string(),
        api_token,
    };
    let json = serde_json::to_vec(&creds).map_err(|e| format!("serialize: {e}"))?;
    let key = load_or_create_key(&app)?;
    let encrypted = encryption::encrypt(&json, &key)?;
    let path = credentials_path(&app)?;
    fs::write(&path, &encrypted).map_err(|e| format!("write file: {e}"))?;

    let mut lock = state.credentials.lock().map_err(|e| format!("lock: {e}"))?;
    *lock = Some(creds);
    Ok(())
}

#[tauri::command]
pub async fn load_credentials(
    app: AppHandle,
    state: tauri::State<'_, AppState>,
) -> Result<bool, String> {
    let path = credentials_path(&app)?;
    if !path.exists() {
        return Ok(false);
    }
    let key_file = key_path(&app)?;
    if !key_file.exists() {
        return Ok(false);
    }

    let key = load_or_create_key(&app)?;
    let encrypted = fs::read(&path).map_err(|e| format!("read file: {e}"))?;
    let decrypted = encryption::decrypt(&encrypted, &key)?;
    let creds: Credentials =
        serde_json::from_slice(&decrypted).map_err(|e| format!("parse: {e}"))?;

    let mut lock = state.credentials.lock().map_err(|e| format!("lock: {e}"))?;
    *lock = Some(creds);
    Ok(true)
}

#[tauri::command]
pub async fn clear_credentials(
    app: AppHandle,
    state: tauri::State<'_, AppState>,
) -> Result<(), String> {
    let path = credentials_path(&app)?;
    if path.exists() {
        fs::remove_file(&path).map_err(|e| format!("remove file: {e}"))?;
    }
    let kp = key_path(&app)?;
    if kp.exists() {
        fs::remove_file(&kp).map_err(|e| format!("remove key: {e}"))?;
    }
    let mut lock = state.credentials.lock().map_err(|e| format!("lock: {e}"))?;
    *lock = None;
    Ok(())
}

#[tauri::command]
pub async fn get_credentials(
    state: tauri::State<'_, AppState>,
) -> Result<Credentials, String> {
    state
        .credentials
        .lock()
        .map_err(|e| format!("lock: {e}"))?
        .clone()
        .ok_or_else(|| "not configured".to_string())
}

#[tauri::command]
pub async fn verify_connection(
    state: tauri::State<'_, AppState>,
    server_url: String,
    api_token: String,
) -> Result<UserInfo, String> {
    let client = TwoFAuthClient::new(&state.http_client, &server_url, &api_token);
    client.verify_user().await
}
