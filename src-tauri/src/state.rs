use std::sync::Mutex;
use crate::models::types::Credentials;

pub struct AppState {
    pub credentials: Mutex<Option<Credentials>>,
    pub http_client: reqwest::Client,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            credentials: Mutex::new(None),
            http_client: reqwest::Client::new(),
        }
    }
}
