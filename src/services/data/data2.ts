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
export class DataProvider2 {
  // userKey;
  // user;
  fsUserProfile;
  fsUser;
  fsTrends;
  fsUserTrends;
  // profile;


  constructor(
    // public afAuth: AngularFireAuth,
    // public db: AngularFireDatabase,
    // public fs: EngageFirestore,
  ) {
    // this.getUser();
    this.fsUser = new EngageFirestore('users');
    this.fsTrends = new EngageFirestore('trends');
    this.fsUserProfile = new EngageFirestore('userProfile');

  }

  // userTrendsHelper(id = this.profile.userId) {
  //   return this.fsUserTrends = new EngageFirestore(`users/${id}/trends`)
  // }
  //
  // // getUser() {
  // //   this.afAuth.authState.subscribe(user => {
  // //     if (user) {
  // //       console.log(user.uid);
  // //       this.userKey = user.uid;
  // //       this.user = user;
  // //     }
  // //   })
  // // }
  //
  // // watchChecker(stock) {
  // //   // return this.fs.get(stock.ticker.toLowerCase(), this.userStockRef());
  // // }
  //
  // // watchTrend(trend) {
  // //   console.log('writing to db');
  // //   console.log('trend', trend);
  // //   const doc = {
  // //     $id: trend.$id,
  // //     name: trend.name || '',
  // //   };
  // //   this.userTrendsHelper().doc(stock.ticker.toLowerCase()).set(doc);
  // //   return this.companiesRef().doc(stock.ticker.toLowerCase()).set({
  // //     $id: stock.ticker.toLowerCase(),
  // //     name: stock.name || '',
  // //     price: stock.price || '',
  // //     sentiment: stock.sentiment || ''
  // //   });
  // // }
  //
  // unWatchTrend(userId, trend) {
  //   console.log('unwatching', trend);
  //   return this.fsUserTrends(userId).remove(trend.$id);
  // }
  //
  // getUserTrends(userId) {
  //   return this.fsUserTrends(userId).getList();
  // }
  //
  // addTrend(trend) {
  //   const doc = {
  //     trend: trend || '',
  //   };
  //   return this.fsTrends.set(doc);
  // }
  //
  // getTrend(trend) {
  //   return this.fsTrends.get(trend);
  // }
  //
  // getSentiment(trend) {
  //   return axios.default
  //     .post(`https://us-central1-stock-hopper.cloudfunctions.net/checkRecentSentiment`, { trend: trend })
  //     .then((response:any) => response.json());
  // }
  //
  // // getGraphInfo(trend) {
  // //   return axios
  // //     .post(`https://us-central1-stock-hopper.cloudfunctions.net/getGraphInfo`, {trend: trend})
  // //     .then((response:any) => response.json());
  // // }
  //
  // // getPrice(stock) {
  // //   return axios
  // //     .post(`https://us-central1-stock-hopper.cloudfunctions.net/checkRecentPrices`, { stock: stock })
  // //     .then((response:any) => response.json()).catch(e => console.log(e));
  // // }
  //
  // // loadStocks() {
  // //     return axios.get("assets/stocks/master.json")
  // //         .subscribe(res => {
  // //             this.stocks = res.json();
  // //             // console.log(this.stocks);
  // //             return this.stocks;
  // //         }, error => {
  // //             console.log(error);
  // //         });
  // //  }
  // //
  // //  runCron() {
  // //   return axios
  // //     .post(`https://us-central1-stock-hopper.cloudfunctions.net/runCron`, '')
  // //     .then((response:any) => response.json());
  // // }

}
