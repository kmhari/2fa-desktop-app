#[cfg(target_os = "macos")]
use core_graphics::display::*;

#[cfg(target_os = "macos")]
extern "C" {
    fn CGPreflightScreenCaptureAccess() -> bool;
    fn CGRequestScreenCaptureAccess() -> bool;
}

#[tauri::command]
pub async fn check_screen_permission() -> bool {
    #[cfg(target_os = "macos")]
    {
        unsafe { CGPreflightScreenCaptureAccess() }
    }
    #[cfg(not(target_os = "macos"))]
    {
        true
    }
}

#[tauri::command]
pub async fn request_screen_permission() -> bool {
    #[cfg(target_os = "macos")]
    {
        unsafe { CGRequestScreenCaptureAccess() }
    }
    #[cfg(not(target_os = "macos"))]
    {
        true
    }
}

#[tauri::command]
pub async fn capture_screen_region(
    x: f64,
    y: f64,
    width: f64,
    height: f64,
) -> Result<Vec<u8>, String> {
    #[cfg(target_os = "macos")]
    {
        capture_macos(x, y, width, height)
    }

    #[cfg(not(target_os = "macos"))]
    {
        let _ = (x, y, width, height);
        Err("screen capture not supported on this platform".into())
    }
}

/// Capture a screen region and immediately try to decode a QR code from it.
/// Returns the decoded string (e.g. otpauth:// URI) or an error.
#[tauri::command]
pub async fn scan_screen_for_qr(
    x: f64,
    y: f64,
    width: f64,
    height: f64,
) -> Result<String, String> {
    #[cfg(target_os = "macos")]
    {
        let png_bytes = capture_macos(x, y, width, height)?;
        decode_qr_from_png(&png_bytes)
    }

    #[cfg(not(target_os = "macos"))]
    {
        let _ = (x, y, width, height);
        Err("screen capture not supported on this platform".into())
    }
}

fn decode_qr_from_png(png_bytes: &[u8]) -> Result<String, String> {
    let img = image::load_from_memory(png_bytes)
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

#[cfg(target_os = "macos")]
fn capture_macos(x: f64, y: f64, width: f64, height: f64) -> Result<Vec<u8>, String> {
    let rect = CGRect::new(&CGPoint::new(x, y), &CGSize::new(width, height));

    let cg_image = CGDisplay::screenshot(
        rect,
        kCGWindowListOptionOnScreenOnly,
        kCGNullWindowID,
        kCGWindowImageDefault,
    )
    .ok_or_else(|| "failed to capture screen region".to_string())?;

    let data = cg_image.data();
    let ptr = data.bytes().as_ptr();
    let len = data.len() as usize;
    let raw_bytes = unsafe { std::slice::from_raw_parts(ptr, len) };

    let w = cg_image.width();
    let h = cg_image.height();
    let bpr = cg_image.bytes_per_row();

    let mut rgba = Vec::with_capacity(w * h * 4);
    for row in 0..h {
        for col in 0..w {
            let offset = row * bpr + col * 4;
            if offset + 3 < raw_bytes.len() {
                rgba.push(raw_bytes[offset + 2]); // R
                rgba.push(raw_bytes[offset + 1]); // G
                rgba.push(raw_bytes[offset]);     // B
                rgba.push(raw_bytes[offset + 3]); // A
            }
        }
    }

    let mut png_bytes: Vec<u8> = Vec::new();
    let encoder =
        image::codecs::png::PngEncoder::new(std::io::Cursor::new(&mut png_bytes));
    image::ImageEncoder::write_image(
        encoder,
        &rgba,
        w as u32,
        h as u32,
        image::ExtendedColorType::Rgba8,
    )
    .map_err(|e| format!("png encode: {e}"))?;

    Ok(png_bytes)
}
