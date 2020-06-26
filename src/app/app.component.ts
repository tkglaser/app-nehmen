import { Component } from '@angular/core';
import { OAuthService, NullValidationHandler } from 'angular-oauth2-oidc';

import { LoggingService } from './services/logging.service';
import { UpdateService } from './services';
import { authConfig, DiscoveryDocumentConfig } from './auth.config';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor(
        private log: LoggingService,
        private update: UpdateService,
        private oauthService: OAuthService
    ) {
        this.configureAndLogin();
    }

    private async configureAndLogin() {
        this.oauthService.events.subscribe((event) => {
            console.log(event);
        });
        this.oauthService.configure(authConfig);
        this.oauthService.tokenValidationHandler = new NullValidationHandler();
        await this.oauthService.loadDiscoveryDocument(DiscoveryDocumentConfig.url);
        await this.oauthService.tryLoginImplicitFlow();
        if (!this.oauthService.hasValidAccessToken()) {
            this.oauthService.initImplicitFlow();
        }
        this.oauthService.setupAutomaticSilentRefresh();
    }
}
