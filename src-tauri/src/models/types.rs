use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Credentials {
    pub server_url: String,
    pub api_token: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Account {
    pub id: u32,
    pub service: Option<String>,
    pub account: Option<String>,
    pub icon: Option<String>,
    pub otp_type: String,
    pub digits: u8,
    pub period: Option<u32>,
    pub counter: Option<u32>,
    pub algorithm: Option<String>,
    pub otp: Option<OtpValue>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OtpValue {
    pub password: String,
    pub generated_at: Option<i64>,
    pub period: Option<u32>,
    pub otp_type: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserInfo {
    pub name: Option<String>,
    pub email: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateAccountPayload {
    pub uri: Option<String>,
    pub service: Option<String>,
    pub account: Option<String>,
    pub secret: Option<String>,
    pub otp_type: Option<String>,
    pub digits: Option<u8>,
    pub period: Option<u32>,
    pub counter: Option<u32>,
    pub algorithm: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccountPreview {
    pub service: Option<String>,
    pub account: Option<String>,
    pub otp_type: String,
    pub digits: u8,
    pub period: Option<u32>,
    pub algorithm: Option<String>,
    pub icon: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QrDecodeResponse {
    pub data: String,
}
