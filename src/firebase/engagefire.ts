import { firebase } from '@firebase/app';
import '@firebase/auth';
import '@firebase/storage';
import '@firebase/firestore';

declare const FIREBASE_CONFIG;
// declare const FIREBASE_ENABLE_PERSISTENCE;

class Engagefire {

  private static instance: Engagefire;

  user;
  firebase;
  firestore;
  storage;
  auth;
  then;
  listeners = [];
  initialized: boolean = false;

  private constructor(
    protected config,
    public enablePersistence: boolean
  ) {
    if (this.enablePersistence === undefined) {
      this.enablePersistence = true;
    }
    this.firebase = firebase.initializeApp(this.config);
    this.initFirestore()
      .then(() => {
      console.log('INITIALIZING FIREBASE');
      this.auth = firebase.auth();
      this.storage = firebase.storage();
      firebase.auth().onAuthStateChanged((user) => {
        this.user = user;
      });
      this.listeners.forEach(cb => cb());
      this.initialized = true;
    });
  }

  initFirestore() {
    return new Promise((resolve, reject) => {
      if (this.enablePersistence) {
        firebase.firestore().enablePersistence()
          .then(() => {
            // Initialize Cloud Firestore through firebase
            this.firestore = firebase.firestore();
            resolve();
          })
          .catch((err) => {
            console.error('ENGAGE FS ERROR', err);
            this.firestore = firebase.firestore();
            resolve();
            reject(err);
            if (err.code == 'failed-precondition') {
              // Multiple tabs open, persistence can only be enabled
              // in one tab at a a time.
              // ...

            } else if (err.code == 'unimplemented') {
              // The current browser does not support all of the
              // features required to enable persistence
              // ...
            }
          });
      } else {
        this.firestore = firebase.firestore();
        resolve();
      }
    });
  }

  ready(cb) {
    if (this.initialized) {
      return cb();
    }
    this.listeners.push(cb);
  }

  // Create a Singleton to help prevent initializing firebase more than once.
  static getInstance(config, enablePersistence) {
    if (!Engagefire.instance)  {
      Engagefire.instance = new Engagefire(config, enablePersistence);
    }
    return Engagefire.instance;
  }

}

export let engageFire = Engagefire.getInstance(FIREBASE_CONFIG, true);

export var User = (): any => { // this is the decorator factory
  if (!engageFire) {
    console.log('still loading helper');
  }
  return (target): any => { // this is the decorator
    // do something with 'target' and 'value'...
    console.log(target);
    return engageFire.user;
  }
};

export var Collection = (value: string): any => { // this is the decorator factory
  if (!engageFire) {
    console.log('still loading helper');
  }
  return (target): any => { // this is the decorator
    // do something with 'target' and 'value'...
    console.log(target)
    // console.log('target', engageFire.firestore.collection('test').get().then(r=>console.log(r)));
    return engageFire.firestore.collection(value);
  }
};

export var Doc = (value: string, id: string): any => { // this is the decorator factory
  if (!engageFire) {
    console.log('still loading helper');
  }
  return (target): any => { // this is the decorator
    // do something with 'target' and 'value'...
    console.log(target);
    return firebase.firestore().collection(value).doc(id).get();
  }
};

