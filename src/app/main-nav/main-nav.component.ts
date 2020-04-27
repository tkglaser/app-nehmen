import { Component, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { MatSidenav } from '@angular/material/sidenav';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
    selector: 'app-main-nav',
    templateUrl: './main-nav.component.html',
    styleUrls: ['./main-nav.component.scss'],
})
export class MainNavComponent {
    isHandset$: Observable<boolean> = this.breakpointObserver
        .observe(Breakpoints.Handset)
        .pipe(map((result) => result.matches));

    @ViewChild('drawer', { static: true }) drawer: MatSidenav;

    constructor(
        private readonly breakpointObserver: BreakpointObserver,
        private readonly oauthService: OAuthService
    ) {
    }

    onNavClick() {
        if (this.drawer.mode === 'over') {
            this.drawer.close();
        }
    }

    onLogin() {
        this.oauthService.initLoginFlow();
    }

    onLogout() {
        this.oauthService.logOut();
    }

    get isLoggedin() {
        return !!this.oauthService.getAccessToken();
    }

    get username() {
        return (this.oauthService.getIdentityClaims() as any)?.given_name;
    }
}
