// import { AngularFireAuth } from 'angularfire2/auth';
// import * as firebase from 'firebase/app';
// import { AngularFireDatabase } from 'angularfire2/database';
// import {FirestoreHelperProvider} from "../firestore-helper";
import {EngageFirestore} from "../../firebase/engage-firestore";


/*
  Generated class for the DataProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
export class DataProvider {
  userKey;
  user;
  fsUserProfile;
  fsUser;
  fsTrends;
  fsUserTrends;
  fsCounter;
  profile;

  constructor(
    // public afAuth: AngularFireAuth,
    // public db: AngularFireDatabase,
    // public fs: EngageFirestore,
  ) {
    // this.getUser();
    this.fsUser = new EngageFirestore('users');
    this.fsTrends = new EngageFirestore('trends');
    this.fsUserProfile = new EngageFirestore('userProfile');
    this.fsCounter = new EngageFirestore(('counter'))

  }

  userTrendsHelper(id = this.profile.userId) {
    return this.fsUserTrends = new EngageFirestore(`users/${id}/trends`)
  }

  // getUser() {
  //   this.afAuth.authState.subscribe(user => {
  //     if (user) {
  //       console.log(user.uid);
  //       this.userKey = user.uid;
  //       this.user = user;
  //     }
  //   })
  // }

  // watchChecker(stock) {
  //   // return this.fs.get(stock.ticker.toLowerCase(), this.userStockRef());
  // }

  // watchTrend(trend) {
  //   console.log('writing to db');
  //   console.log('trend', trend);
  //   const doc = {
  //     $id: trend.$id,
  //     name: trend.name || '',
  //   };
  //   this.userTrendsHelper().doc(stock.ticker.toLowerCase()).set(doc);
  //   return this.companiesRef().doc(stock.ticker.toLowerCase()).set({
  //     $id: stock.ticker.toLowerCase(),
  //     name: stock.name || '',
  //     price: stock.price || '',
  //     sentiment: stock.sentiment || ''
  //   });
  // }

  async incrementCounter(trend) {
    console.log('hit trend counter');
    const trendId = trend.toLowerCase().replace(/\s+/g, '*');
    console.log('trendId', trendId);
    const count = await this.fsCounter.get(trendId);
    console.log('count', count);
    let hits;
    if (count && count.hits) hits = count.hits + 1;
    else hits = 1;
    const counter = {
      $id: trendId,
      hits: hits,
      trend: trend,
    };
    return this.fsCounter.save(counter)
  }

  unWatchTrend(userId, trend) {
    console.log('unwatching', trend);
    return this.fsUserTrends(userId).remove(trend.$id);
  }

  getUserTrends(userId) {
    return this.fsUserTrends(userId).getList();
  }

  addTrend(trend) {
    const doc = {
      trend: trend || '',
    };
    return this.fsTrends.set(doc);
  }

  getTrend(trend) {
    return this.fsTrends.get(trend);
  }

  async fetchTrend(trend, getTweets) {
    console.log('trend', trend);
    const url = 'https://us-central1-now-thoughts.cloudfunctions.net/checkRecentSentiment';
    const config: any = {
      method: 'POST',
      body: JSON.stringify({trend, getTweets}),
    };
    const response = await fetch(url, config);
    console.log('response', response);
    let data;
    try {
      data = await response.json();
      console.log('data', data);
    } catch(err) {
      console.log('err', err);
      // this.fetchTrend(trend);
    }

    return data;
  }

  // getSentiment(trend) {
  //   return axios
  //     .post(`https://us-central1-stock-hopper.cloudfunctions.net/checkRecentSentiment`, { trend: trend })
  //     .then((response:any) => response.json());
  // }

  // getGraphInfo(trend) {
  //   return axios
  //     .post(`https://us-central1-stock-hopper.cloudfunctions.net/getGraphInfo`, {trend: trend})
  //     .then((response:any) => response.json());
  // }

  // getPrice(stock) {
  //   return axios
  //     .post(`https://us-central1-stock-hopper.cloudfunctions.net/checkRecentPrices`, { stock: stock })
  //     .then((response:any) => response.json()).catch(e => console.log(e));
  // }

  // loadStocks() {
  //     return axios.get("assets/stocks/master.json")
  //         .subscribe(res => {
  //             this.stocks = res.json();
  //             // console.log(this.stocks);
  //             return this.stocks;
  //         }, error => {
  //             console.log(error);
  //         });
  //  }
  //
  //  runCron() {
  //   return axios
  //     .post(`https://us-central1-stock-hopper.cloudfunctions.net/runCron`, '')
  //     .then((response:any) => response.json());
  // }

}
