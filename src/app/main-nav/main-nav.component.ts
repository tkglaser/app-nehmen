import { Component, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from '../authentication/services/auth.service';

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
        private readonly authService: AuthService
    ) {}

    onNavClick() {
        if (this.drawer.mode === 'over') {
            this.drawer.close();
        }
    }

    onLogin() {
        this.authService.login();
    }

    onLogout() {
        this.authService.logout();
    }

    get isLoggedin() {
        return this.authService.isLoggedin;
    }

    get username() {
        return this.authService.username;
    }
}
