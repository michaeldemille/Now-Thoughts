import { Component, Prop, State } from '@stencil/core';
import { EngageFirestore } from "../../firebase/engage-firestore";

@Component({
  tag: 'app-profile',
  styleUrl: 'app-profile.css'
})
export class AppProfile {
  @Prop({ connect: 'ion-toast-controller' }) toastCtrl: HTMLIonToastControllerElement;

  @State() state = false;
  @Prop() name: string;
  @State() profileMode: string = 'login';

  email;
  password;
  passwordCheck;
  @State() errorMessage = '';
  fs;
  @State() userId;
  @State() btnAction = false;

  constructor() {
    this.fs = new EngageFirestore('users');
  }

  async componentWillLoad() {
    this.userId = await this.fs.ready();
  }

  emailHandler(email) {
    this.email = email.detail.value;
  }

  passwordHandler(password) {
    this.password = password.detail.value;
  }

  passwordCheckHandler(passwordCheck) {
    this.passwordCheck = passwordCheck.detail.value;
  }

  keyDownFunction(event) {
    if (event.keyCode == 13) {
      return this.buttonAction();
    }
  }

  buttonAction() {
    if (this.profileMode == 'login') this.login();
    if (this.profileMode == 'sign up') this.signUp();
    if (this.profileMode == 'forgot password') this.forgotPassword();
  }

  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  }

  async login() {
    if (this.email && this.validateEmail(this.email)) {
      if (this.password && this.password.length >= 6) {
        try {
          this.btnAction = true;
          await this.fs.login(this.email, this.password);
          await this.fs.updateAuth();
          this.userId = this.fs.userId;
          this.btnAction = false;
        } catch(error) {
          this.setErrorMessage('You have entered an invalid username or password.');
          this.btnAction = false;
        }
      } else this.setErrorMessage('password must be at least 6 characters long');
    } else this.setErrorMessage('Please enter a valid email');
  }

  async signUp() {
    if (this.email && this.validateEmail(this.email)) {
      if (this.password && this.password.length >= 6) {
        if (this.passwordCheck && this.password == this.passwordCheck) {
          try {
            this.btnAction = true;
            await this.fs.signup(this.email, this.password);
            await this.fs.updateAuth();
            this.userId = this.fs.userId;
            this.btnAction = false;
          } catch(error) {
            this.setErrorMessage('Account already exists.');
            this.btnAction = false;
          }
          } else this.setErrorMessage('passwords do not match');
      } else this.setErrorMessage('password must be at least 6 characters long');
    } else this.setErrorMessage('Please enter a valid email');
  }

  async forgotPassword() {
    if (this.email && this.validateEmail(this.email)) {
      this.btnAction = true;
      await this.fs.forgotPassword(this.email);
      this.setMessage('Forgot password email sent.');
      this.btnAction = false;
    } else this.setErrorMessage('Please enter a valid email');
  }

  async logout() {
    this.btnAction = true;
    await this.fs.logout();
    await this.fs.updateAuth();
    this.userId = this.fs.userId;
    this.btnAction = false;
  }

  setMode(mode) {
    this.profileMode = mode;
  }

  async setMessage(message) {

    const toast = await this.toastCtrl.create({
      message: message,
      showCloseButton: false,
      duration: 5000,
      animated: true,
      cssClass: 'toast-default-message'
    });
    await toast.present();
  }

  async setErrorMessage(message) {

    const toast = await this.toastCtrl.create({
      message: message,
      showCloseButton: false,
      duration: 4000,
      animated: true,
      cssClass: 'toast-error-message'
    });
    await toast.present();

    // this.errorMessage = message;
    // console.log('this.errorMessage', this.errorMessage);
    // setTimeout(() => {
    //   this.errorMessage = '';
    //   console.log('this.errorMessage', this.errorMessage);
    // }, 4000)
  }


  renderLogin() {
    return (
      <div>
        <h1 class="profile-header">{this.profileMode}</h1>
        <ion-input class = "login-input" type = "email" placeholder = "email" onIonChange = {(event) => this.emailHandler(event)} onKeyPress={() => this.keyDownFunction(event)}></ion-input>
        {this.profileMode != 'forgot password' && <ion-input class="login-input" type="password" placeholder="password" onIonChange={(event) => this.passwordHandler(event)} onKeyPress={() => this.keyDownFunction(event)}></ion-input>}
        {this.profileMode == 'sign up' && <ion-input class="login-input" type="password" placeholder="confirm password" onIonChange={(event) => this.passwordCheckHandler(event)} onKeyPress={() => this.keyDownFunction(event)}></ion-input>}
        {this.errorMessage && <div class="error-message"><p>{this.errorMessage}</p></div>}
        <div class="button-area">
          {!this.btnAction ? <ion-button class="login-button" onClick={() => this.buttonAction()}>{this.profileMode}</ion-button>
          : <ion-button class="login-button"><ion-spinner name="dots" /></ion-button> }
        </div>
        <div class="link-area">
          {this.profileMode != 'login' && <p onClick={() => this.setMode('login')}>login</p>}
          {this.profileMode != 'sign up' && <p onClick={() => this.setMode('sign up')}>sign up</p>}
          {this.profileMode != 'forgot password' && <p onClick={() => this.setMode('forgot password')}>forgot password</p>}
        </div>
      </div>
    )
  }

  renderLogout() {
    return (
      <div>
        <h1 class="profile-header">logout</h1>
        <p class="profile-email">{this.fs.auth.email}</p>
        <div class="button-area">
          {!this.btnAction ? <ion-button class="login-button" onClick={() => this.logout()}>logout</ion-button>
            : <ion-button class="login-button"><ion-spinner name="dots" /></ion-button> }
        </div>
      </div>
    )
  }

  render() {
    return [
      <ion-content padding class="profile-page">
        <menu-modal></menu-modal>
        <ion-img class="header-image" src="assets/images/now-thoughts-logo-white.png"></ion-img>
        {!this.userId ? this.renderLogin() : this.renderLogout()}

      </ion-content>,
    ];
  }
}
