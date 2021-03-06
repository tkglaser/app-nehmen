import { AuthConfig } from 'angular-oauth2-oidc';

export const DiscoveryDocumentConfig = {
  url : "https://appnehmen.b2clogin.com/appnehmen.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=b2c_1_susi"
}

export const authConfig: AuthConfig = {
  redirectUri: window.location.origin + '/',
  responseType: 'token id_token',
  issuer: 'https://appnehmen.b2clogin.com/f17a7148-c2f7-4d1a-9390-a351e1328255/v2.0/',
  strictDiscoveryDocumentValidation: false,
  tokenEndpoint: 'https://appnehmen.b2clogin.com/appnehmen.onmicrosoft.com/oauth2/v2.0/token?p=b2c_1_susi',
  loginUrl: 'https://appnehmen.b2clogin.com/appnehmen.onmicrosoft.com/oauth2/v2.0/token?p=b2c_1_susi',
  clientId: '2547fe20-84af-40ac-8405-2e7a6b93d972',
  scope: 'openid profile https://appnehmen.onmicrosoft.com/appnehmen-api/user_impersonation',
  skipIssuerCheck: true,
  clearHashAfterLogin: true,
  oidc: true,
  silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
}
