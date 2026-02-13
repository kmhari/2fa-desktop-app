use crate::api::client::TwoFAuthClient;
use crate::state::AppState;

#[tauri::command]
pub async fn decode_qr(
    state: tauri::State<'_, AppState>,
    image_data: Vec<u8>,
) -> Result<String, String> {
    // Try local decode first using rqrr
    if let Ok(uri) = decode_qr_local(&image_data) {
        return Ok(uri);
    }

    // Fallback to 2FAuth API
    let creds = state
        .credentials
        .lock()
        .map_err(|e| format!("lock: {e}"))?
        .clone()
        .ok_or_else(|| "not configured".to_string())?;
    let client = TwoFAuthClient::new(&state.http_client, &creds.server_url, &creds.api_token);
    client.decode_qr(image_data).await
}

fn decode_qr_local(image_data: &[u8]) -> Result<String, String> {
    let img = image::load_from_memory(image_data)
        .map_err(|e| format!("load image: {e}"))?
        .to_luma8();

    let mut prepared = rqrr::PreparedImage::prepare(img);
    let grids = prepared.detect_grids();

    if grids.is_empty() {
        return Err("no QR code found".into());
    }

    let (_meta, content) = grids[0]
        .decode()
        .map_err(|e| format!("decode QR: {e}"))?;

    Ok(content)
}
