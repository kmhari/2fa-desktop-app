use reqwest::Client;
use crate::models::types::*;

pub struct TwoFAuthClient<'a> {
    client: &'a Client,
    base_url: String,
    token: String,
}

impl<'a> TwoFAuthClient<'a> {
    pub fn new(client: &'a Client, base_url: &str, token: &str) -> Self {
        let base_url = base_url.trim_end_matches('/').to_string();
        Self {
            client,
            base_url,
            token: token.to_string(),
        }
    }

    fn url(&self, path: &str) -> String {
        format!("{}{}", self.base_url, path)
    }

    pub async fn verify_user(&self) -> Result<UserInfo, String> {
        self.client
            .get(self.url("/api/v1/user"))
            .bearer_auth(&self.token)
            .send()
            .await
            .map_err(|e| format!("request failed: {e}"))?
            .error_for_status()
            .map_err(|e| format!("server error: {e}"))?
            .json::<UserInfo>()
            .await
            .map_err(|e| format!("parse error: {e}"))
    }

    pub async fn list_accounts(&self) -> Result<Vec<Account>, String> {
        self.client
            .get(self.url("/api/v1/twofaccounts"))
            .bearer_auth(&self.token)
            .query(&[("withOtp", "true")])
            .send()
            .await
            .map_err(|e| format!("request failed: {e}"))?
            .error_for_status()
            .map_err(|e| format!("server error: {e}"))?
            .json::<Vec<Account>>()
            .await
            .map_err(|e| format!("parse error: {e}"))
    }

    pub async fn get_otp(&self, account_id: u32) -> Result<OtpValue, String> {
        self.client
            .get(self.url(&format!("/api/v1/twofaccounts/{}/otp", account_id)))
            .bearer_auth(&self.token)
            .send()
            .await
            .map_err(|e| format!("request failed: {e}"))?
            .error_for_status()
            .map_err(|e| format!("server error: {e}"))?
            .json::<OtpValue>()
            .await
            .map_err(|e| format!("parse error: {e}"))
    }

    pub async fn create_account(
        &self,
        payload: &CreateAccountPayload,
    ) -> Result<Account, String> {
        let mut body = serde_json::Map::new();

        if let Some(ref uri) = payload.uri {
            body.insert("uri".into(), serde_json::Value::String(uri.clone()));
        } else {
            if let Some(ref s) = payload.service {
                body.insert("service".into(), serde_json::Value::String(s.clone()));
            }
            if let Some(ref a) = payload.account {
                body.insert("account".into(), serde_json::Value::String(a.clone()));
            }
            if let Some(ref s) = payload.secret {
                body.insert("secret".into(), serde_json::Value::String(s.clone()));
            }
            if let Some(ref t) = payload.otp_type {
                body.insert("otp_type".into(), serde_json::Value::String(t.clone()));
            }
            if let Some(d) = payload.digits {
                body.insert("digits".into(), serde_json::json!(d));
            }
            if let Some(p) = payload.period {
                body.insert("period".into(), serde_json::json!(p));
            }
            if let Some(c) = payload.counter {
                body.insert("counter".into(), serde_json::json!(c));
            }
            if let Some(ref a) = payload.algorithm {
                body.insert("algorithm".into(), serde_json::Value::String(a.clone()));
            }
        }

        self.client
            .post(self.url("/api/v1/twofaccounts"))
            .bearer_auth(&self.token)
            .json(&body)
            .send()
            .await
            .map_err(|e| format!("request failed: {e}"))?
            .error_for_status()
            .map_err(|e| format!("server error: {e}"))?
            .json::<Account>()
            .await
            .map_err(|e| format!("parse error: {e}"))
    }

    pub async fn preview_uri(&self, uri: &str) -> Result<AccountPreview, String> {
        self.client
            .post(self.url("/api/v1/twofaccounts/preview"))
            .bearer_auth(&self.token)
            .json(&serde_json::json!({ "uri": uri }))
            .send()
            .await
            .map_err(|e| format!("request failed: {e}"))?
            .error_for_status()
            .map_err(|e| format!("server error: {e}"))?
            .json::<AccountPreview>()
            .await
            .map_err(|e| format!("parse error: {e}"))
    }

    pub async fn delete_account(&self, account_id: u32) -> Result<(), String> {
        self.client
            .delete(self.url(&format!("/api/v1/twofaccounts/{}", account_id)))
            .bearer_auth(&self.token)
            .send()
            .await
            .map_err(|e| format!("request failed: {e}"))?
            .error_for_status()
            .map_err(|e| format!("server error: {e}"))?;
        Ok(())
    }

    pub async fn decode_qr(&self, image_bytes: Vec<u8>) -> Result<String, String> {
        let part = reqwest::multipart::Part::bytes(image_bytes)
            .file_name("qrcode.png")
            .mime_str("image/png")
            .map_err(|e| format!("mime error: {e}"))?;

        let form = reqwest::multipart::Form::new().part("qrcode", part);

        let resp: QrDecodeResponse = self
            .client
            .post(self.url("/api/v1/qrcode/decode"))
            .bearer_auth(&self.token)
            .multipart(form)
            .send()
            .await
            .map_err(|e| format!("request failed: {e}"))?
            .error_for_status()
            .map_err(|e| format!("server error: {e}"))?
            .json()
            .await
            .map_err(|e| format!("parse error: {e}"))?;

        Ok(resp.data)
    }
}
