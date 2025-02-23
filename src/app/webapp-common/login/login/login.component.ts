import {Component, OnDestroy, OnInit, ViewChild, ElementRef, Input, ChangeDetectorRef, Renderer2} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {EMPTY, Observable, of, Subscription} from 'rxjs';
import {finalize, map, startWith, take, filter, mergeMap, catchError, switchMap} from 'rxjs/operators';
import {selectCurrentUser} from '../../core/reducers/users-reducer';
import {fetchCurrentUser, setPreferences} from '../../core/actions/users.actions';
import {LoginMode, loginModes} from '../../shared/services/login.service';
import {selectInviteId} from '../login-reducer';
import {ConfigurationService} from '../../shared/services/configuration.service';
import {ConfirmDialogComponent} from '../../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {LoginService} from '~/shared/services/login.service';
import {UserPreferences} from '../../user-preferences';
import {Environment} from '../../../../environments/base';
import {setBreadcrumbs} from '@common/core/actions/router.actions';
import {CrumbTypeEnum} from '@common/layout/breadcrumbs/breadcrumbs.component';


@Component({
  selector: 'sm-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  loginModel: { name: any; password: any } = {
    name: '',
    password: ''
  };

  @ViewChild('loginForm', {static: true}) loginForm: NgForm;
  @ViewChild('nameInput', {static: true}) nameInput: ElementRef;
  options: any[] = [];
  loginMode: LoginMode;
  filteredOptions: Observable<any[]>;
  userChanged: Subscription;
  private sub = new Subscription();
  public loginModeEnum = loginModes;

  public notice: string;
  public demo: boolean;
  public newUser: boolean;
  public loginFailed = false;
  public showSpinner: boolean;
  public guestUser: { enabled: boolean; username: string; password: string };
  public loginTitle: string;
  public isInvite: boolean;
  public environment: Environment;
  public touLink: string;
  public showGitHub: boolean;
  public stars: number;
  private redirectUrl: string;

  @Input() showSimpleLogin: boolean;
  @Input() hideTou: boolean;
  @Input() darkTheme = true;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private dialog: MatDialog,
    private store: Store,
    private route: ActivatedRoute,
    private userPreferences: UserPreferences,
    private config: ConfigurationService,
    private cdr: ChangeDetectorRef,
    private ref: ElementRef,
    private renderer: Renderer2
  ) {
    this.environment = this.config.getStaticEnvironment();
    this.showGitHub = !this.environment.enterpriseServer && !this.environment.communityServer;
    if (!this.environment.communityServer) {
      this.renderer.addClass(this.ref.nativeElement, 'dark-theme');
    }
  }

  get buttonCaption() {
    return this.loginMode === loginModes.simple ? '登录' : '登录';
  }

  ngOnInit() {
    this.store.dispatch(setBreadcrumbs({
      breadcrumbs: [[{
        name: 'Login',
        type: CrumbTypeEnum.Feature
      }]]}));
    this.store.select(selectCurrentUser)
      .pipe(
        filter(user => !!user),
        take(1)
      )
      .subscribe(() => this.router.navigateByUrl(this.getNavigateUrl()));
    this.store.select(selectInviteId).pipe(
      filter(invite => !!invite),
      take(1),
      mergeMap(inviteId => this.loginService.getInviteInfo(inviteId))
    ).subscribe((inviteInfo: any) => {
      const shorterName = inviteInfo.user_given_name || inviteInfo.user_name?.split(' ')[0];
      this.loginTitle = !shorterName ? '' : `Accept ${shorterName ? shorterName + '\'s' : ''} invitation and
      join their team`;
      this.cdr.detectChanges();
    });
    this.isInvite = this.router.url.includes('invite');
    this.notice = this.environment.loginNotice;
    this.loginTitle = this.isInvite ? '' : 'Login'; // NEED SIGNUPMODE
    this.demo = this.environment.demo;
    this.touLink = this.environment.legal.TOULink;
    this.route.queryParams
      .pipe(
        filter(params => !!params),
        take(1)
      )
      .subscribe((params: Params) => {
        this.redirectUrl = params['redirect'] || '';
        this.redirectUrl = this.redirectUrl.replace('/login', '/dashboard');
      });

    this.sub.add(this.loginService.getLoginMode().pipe(
      catchError(() => this.loginMode = loginModes.simple),
      finalize(() => {
        this.guestUser = this.loginService.guestUser;
        if (this.loginMode === loginModes.simple) {
          this.loginService.getUsers()
            .pipe(take(1))
            .subscribe(users => {
              this.options = users;
              this.cdr.detectChanges();
            });
          if (this.environment.autoLogin && this.redirectUrl && !['/dashboard'].includes(this.redirectUrl)) {
            this.loginForm.controls['name'].setValue((new Date()).getTime().toString());
            this.simpleLogin()
              .pipe(take(1))
              .subscribe();
          }
        }
        setTimeout(() => {
          this.nameInput?.nativeElement.focus();
        }, 500);
      }))
      .subscribe((loginMode: LoginMode) => {
        this.loginMode = loginMode;
        this.cdr.detectChanges();
      })
    );

    setTimeout(() => {
      if (!this.loginForm?.controls['name']) {
        return;
      }

      this.filteredOptions = this.loginForm.controls['name'].valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value))
        );

      this.userChanged = this.loginForm.controls['name'].valueChanges
        .subscribe((val: string) => {
          this.loginModel.name = val.trim();
          const user = this.options.find(x => x.name === val);
          this.newUser = this.loginMode === loginModes.simple && !user;
          this.cdr.detectChanges();
        });
    });

  }

  ngOnDestroy() {
    this.userChanged?.unsubscribe();
  }

  login() {
    this.showSpinner = true;
    if (this.loginMode === loginModes.password) {
      const user = this.loginModel.name.trim();
      const password = this.loginModel.password.trim();
      this.loginService.passwordLogin(user, password)
        .pipe(
          catchError(() => {
            this.showSpinner = false;
            this.loginFailed = true;
            this.cdr.detectChanges();
            return EMPTY;
          }),
          take(1),
          switchMap(() => this.afterLogin())
        )
        .subscribe();
    } else {
      const observer = this.simpleLogin();
      this.sub.add(observer?.pipe(
          catchError(() => {
            this.showSpinner = false;
            return EMPTY;
          }),
          finalize( () => this.cdr.detectChanges())
        ).subscribe(() => this.showSpinner = false)
      );
    }
  }

  simpleLogin() {
    const user = this.options.find(x => x.name === this.loginModel.name);
    if (user) {
      return this.loginService.login(user.id)
        .pipe(
          switchMap(() => this.afterLogin())
        );
    } else {
      const name = this.loginModel.name.trim();
      return this.loginService.autoLogin(name)
        .pipe(
          switchMap(() => this.afterLogin())
        )
    }
  }

  private afterLogin() {
    return this.userPreferences.loadPreferences()
      .pipe(
        take(1),
        catchError(() => this.router.navigateByUrl(this.getNavigateUrl())),
        finalize( () => {
          this.store.dispatch(fetchCurrentUser());
          this.cdr.detectChanges();
        }),
        switchMap(res => {
          this.store.dispatch(setPreferences({payload: res}));
          this.openLoginNotice();
          return of(this.router.navigateByUrl(this.getNavigateUrl()));
        })
      );
      // .subscribe(res => {
      //   this.store.dispatch(setPreferences({payload: res}));
      //   this.router.navigateByUrl(this.getNavigateUrl());
      //   this.openLoginNotice();
      // });
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter((option: any) => option.name.toLowerCase().includes(filterValue.toLowerCase()));
  }

  getNavigateUrl(): string {
    return this.redirectUrl ? this.redirectUrl : '/dashboard';
  }


  private openLoginNotice() {
    if (this.environment.loginPopup) {
      this.dialog.open(ConfirmDialogComponent, {
        disableClose: true,
        data: {
          body: this.environment.loginPopup,
          yes: '确定',
          iconClass: 'i-alert'
        }
      });
    }
  }
}
