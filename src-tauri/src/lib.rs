mod api;
mod commands;
mod crypto;
mod models;
mod state;
mod tray;

use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(AppState::new())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            tray::setup_tray(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::credentials::save_credentials,
            commands::credentials::load_credentials,
            commands::credentials::clear_credentials,
            commands::credentials::get_credentials,
            commands::credentials::verify_connection,
            commands::accounts::fetch_accounts,
            commands::accounts::create_account,
            commands::accounts::preview_account,
            commands::accounts::delete_account,
            commands::otp::fetch_otp,
            commands::qrcode::decode_qr,
            commands::screenshot::check_screen_permission,
            commands::screenshot::request_screen_permission,
            commands::screenshot::capture_screen_region,
            commands::screenshot::scan_screen_for_qr,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
