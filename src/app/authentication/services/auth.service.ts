import { Injectable } from '@angular/core';
import { OAuthService, NullValidationHandler } from 'angular-oauth2-oidc';
import { Store } from '@ngrx/store';

import { authConfig, DiscoveryDocumentConfig } from 'src/app/auth.config';
import * as AuthActions from '../store/auth.actions';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    constructor(
        private readonly oauthService: OAuthService,
        private readonly store: Store
    ) {
        this.configureAndLogin();
    }

    get userId() {
        const claims = this.oauthService.getIdentityClaims() as any;
        return claims?.sub;
    }

    get username() {
        return (this.oauthService.getIdentityClaims() as any)?.given_name;
    }

    login() {
        this.oauthService.initLoginFlow();
    }

    logout() {
        this.oauthService.logOut();
    }

    get isLoggedin() {
        return !!this.oauthService.getAccessToken();
    }

    private async configureAndLogin() {
        this.oauthService.events.subscribe((event) => {
            console.log(event);
        });
        this.oauthService.configure(authConfig);
        this.oauthService.tokenValidationHandler = new NullValidationHandler();
        await this.oauthService.loadDiscoveryDocument(
            DiscoveryDocumentConfig.url
        );
        await this.oauthService.tryLoginImplicitFlow();
        if (!this.oauthService.hasValidAccessToken()) {
            this.oauthService.initImplicitFlow();
        } else {
            this.store.dispatch(AuthActions.loginComplete());
        }
        this.oauthService.setupAutomaticSilentRefresh();
    }
}
