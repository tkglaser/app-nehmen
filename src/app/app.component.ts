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
        this.configure();
        this.oauthService.tryLoginImplicitFlow();
    }

    private configure() {
        this.oauthService.configure(authConfig);
        this.oauthService.tokenValidationHandler = new NullValidationHandler();
        this.oauthService.loadDiscoveryDocument(DiscoveryDocumentConfig.url);
      }
}
