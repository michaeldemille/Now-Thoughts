import {Component, Prop, State} from '@stencil/core';
import { DataProvider } from "../../services/data/data";

@Component({
  tag: 'comparison-page',
  styleUrl: 'comparison-page.css'
})
export class ComparisonPage {

  @Prop({ connect: 'ion-loading-controller' }) loadingController: HTMLIonLoadingControllerElement;


  @State() trend;

  search:any = '';

  @State() trends = [];
  @State() tweets = [];
  @State() isSearching = false;

  //  @State() trends = [
  //   {name: 'john doe', score: -1.5},
  //   {name: 'jane doe', score: 3.7}
  // ];

  data;
  loading;

  constructor() {
    this.data = new DataProvider();
    console.log('this.trends', this.trends);
  }

  async searchInput() {
    if (this.search == '') return;
    console.log('search2', this.search);
    this.isSearching = true;
    this.data.incrementCounter(this.search);
    // this.presentLoadingWithOptions();
    this.trend = await this.data.fetchTrend(this.search, false);
    console.log('this.trend', this.trend);
    this.trends.unshift({name: this.search, score: this.trend.totalScore});
    console.log('this.trends', this.trends);
    this.isSearching = false;
    console.log('this.isSearching', this.isSearching);
    // this.loading.dismiss();
  }

  searchHandler(search) {
    this.search = search.detail.value;
  }

  clearSearch() {
    this.trends = [];
  }

  keyDownFunction(event) {
    if(event.keyCode == 13) {
      return this.searchInput();
    }
  }

  async presentLoadingWithOptions() {

    console.log('loading loader');

    this.loading = await this.loadingController.create({
      duration: 120000,
      spinner: 'dots',
      translucent: true,
      cssClass: 'custom-loader'
    });
    return await this.loading.present();
  }

  async gotoLink(routeLink) {
    const router = document.querySelector('ion-router');
    if (router) {
      await router.componentOnReady();
      return router.push(routeLink);
    }
  }

  render() {
    return [
      {/*<ion-header>*/},
      {/*<ion-toolbar color="primary">*/},
      {/*<ion-title>Home</ion-title>*/},
      {/*</ion-toolbar>*/},
      {/*</ion-header>,*/},

      <ion-content padding class="comparison-page">
        {/*<menu-modal></menu-modal>*/}
        <div class="header-link"><span class="pad-right" onClick={() => this.gotoLink('home')}>Multi Trend | </span><help-modal></help-modal></div>

        <ion-img class="header-image" src="assets/images/now-thoughts-logo-white.png"></ion-img>
        <div class="search-area">
          <ion-searchbar class="searchbar" placeholder="" onIonChange={(event) => this.searchHandler(event)} onKeyPress={() => this.keyDownFunction(event)}></ion-searchbar>
          {!this.isSearching ? <ion-button class="search-button" onClick={() => this.searchInput()}><img src="/assets/images/search.svg" /></ion-button>
            : <ion-button class="search-button"><ion-spinner name="dots" /></ion-button> }
        </div>

          {this.trends.length > 0 && <div class="clear-button-area"><ion-button fill="clear" class="clear-button" onClick={() => this.clearSearch()}>CLEAR</ion-button></div> }

        {this.trends.length > 0 ?
          <div>
            {this.trends.map((trend:any) =>
              <trend-card trend={trend}></trend-card>
            )}
          </div>
          : <p class="search-caption" text-center>
            Ready for battle of the trends? Start searching and see who wins.
          </p>
        }

        {/*<ion-button href="/profile/ionic" expand="block">Profile page</ion-button>*/}
      </ion-content>,
    ];
  }
}
