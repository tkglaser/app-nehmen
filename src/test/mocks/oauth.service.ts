import { OAuthService } from 'angular-oauth2-oidc';

export class MockOAuthService {
    tryLoginImplicitFlow() {}
    configure() {}
    loadDiscoveryDocument() {}
}

export const mockOAuthProvider = {
    provide: OAuthService,
    useClass: MockOAuthService,
};
