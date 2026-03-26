var authApi =
  window.appApiClient ||
  axios.create({
    baseURL: window.AppConfig.API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

window.appApiClient = authApi;
window.authApi = authApi;
