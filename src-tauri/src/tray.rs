use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, WebviewUrl, WebviewWindowBuilder,
};
use tauri_plugin_positioner::{Position, WindowExt};

pub fn setup_tray(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let settings_item = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&settings_item, &quit_item])?;

    TrayIconBuilder::with_id("main-tray")
        .icon(app.default_window_icon().unwrap().clone())
        .icon_as_template(true)
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "settings" => {
                if let Some(win) = app.get_webview_window("main") {
                    let _ = win.show();
                    let _ = win.set_focus();
                }
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray_handle, event| {
            tauri_plugin_positioner::on_tray_event(tray_handle.app_handle(), &event);

            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray_handle.app_handle();
                toggle_tray_popup(app);
            }
        })
        .build(app)?;

    // Pre-create the tray popup window (hidden)
    let popup = WebviewWindowBuilder::new(app, "tray-popup", WebviewUrl::App("/".into()))
        .title("2FA Auth")
        .inner_size(320.0, 480.0)
        .resizable(false)
        .decorations(false)
        .visible(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .transparent(true)
        .build()?;

    // Hide popup when it loses focus
    let popup_clone = popup.clone();
    popup.on_window_event(move |event| {
        if let tauri::WindowEvent::Focused(false) = event {
            let _ = popup_clone.hide();
        }
    });

    Ok(())
}

fn toggle_tray_popup(app: &tauri::AppHandle) {
    if let Some(popup) = app.get_webview_window("tray-popup") {
        if popup.is_visible().unwrap_or(false) {
            let _ = popup.hide();
        } else {
            let _ = popup.move_window(Position::TrayCenter);
            let _ = popup.show();
            let _ = popup.set_focus();
        }
    }
}
