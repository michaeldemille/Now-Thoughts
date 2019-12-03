import { firebase } from '@firebase/app';
import _ from 'lodash';
import {firestore} from "firebase";
import {engageFire} from "./engagefire";
import {engagePubsub} from "../helpers/pubsub";
import {EngageFireDoc} from "./doc";

declare let process;
declare let window;
// declare let canvas;

const uploadImageOptions = {
  width: '1000px',
  height: '1000px',
  thumbnail: {
    width: '100px',
    height: '100px',
  }
};

export interface EngageICollection {
  name?: string;
  path?: string;
  subCollections?: EngageICollection[];
}


/*
* TODO:
* [ ] Implement State Manage,
* [ ] Resize image
* [ ] Show upload progress
* [ ] Handle file uploads better
* [ ] Fully test everything!
* [ ] Add types to doc in class
* [ ] Integrate User name ($getUserName)
* [ ] Change doc methods to doc prototype methods. Maybe make a class?
* */
export class EngageFirestore {
  ref: firestore.CollectionReference;
  auth;
  userId;
  id;
  state = window.ENGAGE_STATE;
  ps = engagePubsub;
  firebaseReady: boolean = false;
  checkTime: number = 200;
  checkLimit: number = 50;
  debug: boolean = false;
  omitList = ['$key', '$value', '$exists', '$params', '$ref', '$save', '$update', '$set', '$get',
    '$attachOwner', '$addFiles', '$setImage', '$removeImage', '$removeFile', '$downloadFile', '$remove', '$watch',
    '$watchPromise', '$isOwner', '$collection', '$getFile', '$getFiles', '$path', '$backup', '$engageFireStore',
    '$owner'];

  constructor(
    public path: firestore.CollectionReference | string,
    public db?, // admin, firebase
    public docWrapper: any = EngageFireDoc
  ) {
    engageFire.ready(() => {
      if (!db) {
        this.db = engageFire.firestore;
      }
      if (!window.ENGAGE_STATE) {
        window.ENGAGE_STATE = {};
        this.state = window.ENGAGE_STATE;
      }
      if (_.isString(this.path)) {
        this.ref = this.db.collection(<string>this.path);
      } else {
        this.ref = <firestore.CollectionReference>this.path;
      }
      if (this.appInitialized() && firebase && firebase.auth() && firebase.auth().currentUser) {
        this.auth = firebase.auth().currentUser;
        this.publish(this.auth, 'user');
        if (this.auth) {
          this.userId = this.auth.uid;
          if (this.debug) console.log('userId', this.userId);
        }
      }
      this.watchUser((user) => {
        this.publish(user, 'user');
      });
      this.firebaseReady = true;
    });
  }

  toggleDebug() {
    this.debug = !this.debug;
  }

  canSub() {
    return !!this.ps;
  }

  publish(data, what) {
    return this.ps.publish(data, what);
  }

  subscribe(what, listener) {
    return this.ps.subscribe(what, listener);
  }

  ready() {
    let limit = this.checkLimit;
    let interval;
    if (this.firebaseReady) return Promise.resolve(this.userId);
    return new Promise((resolve, reject) => {
      interval = setInterval(() => {
        limit--;
        if (this.firebaseReady) {
          clearInterval(interval);
          resolve(this.userId);
        } else if (limit < 0) {
          clearInterval(interval);
          reject('timed out');
        }
      }, this.checkTime);
    });
  }

  async watchUser(cb) {
    await this.ready();
    engageFire.auth.onAuthStateChanged((user) => {
      if (cb) cb(user || null);
    });
  }

  appInitialized() {
    return firebase.apps.length;
  }

  getUserId() {
    if (this.userId) {
      return Promise.resolve(this.userId);
    } else if (this.appInitialized()) {
      return new Promise((resolve) => firebase.auth().onAuthStateChanged(user => {
        if (user && user.uid) {
          resolve(user.uid);
        } else {
          resolve(null);
        }
      }));
    } else {
      return Promise.resolve(null);
    }
  }

  getUserFromAuth() {
    return this.auth;
  }

  getCollection() {
    return this.ref;
  }

  getDoc(id) {
    return this.ref.doc(id);
  }

  getSubCollection(id, collectionName) {
    return this.ref.doc(id).collection(collectionName);
  }

  getId() {
    return this.id;
  }

  setId(id) {
    this.id = id;
  }

  getAll() {
    return this.ref.get();
  }

  // get data with ids added
  async getList(ref?) {
    await this.ready();
    if (!ref) ref = this.ref;
    const list = await ref.get();
    return this.addFireList(list);
  }

  async getOnce(docId = this.id, pure = false) {
    await this.ready();
    try {
      const doc = await this.ref.doc(docId).get();
      if (pure) {
        return doc;
      } else if (doc.exists) {
        return this.addFire(doc.data(), docId);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async get(docId = this.id, ref?) {
    await this.ready();
    if (!ref) ref = this.ref;
    try {
      const doc = await ref.doc(docId).get();
      if (doc.exists) {
        return this.addFire(doc.data(), docId);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async add(newDoc, ref?) {
    await this.ready();
    if (!ref) ref = this.ref;
    if (newDoc && (newDoc.$key || newDoc.$id)) {
      return this.update(newDoc, ref);
    }
    if (this.debug) console.log(`add`, newDoc);
    newDoc = this.omitFire(newDoc);
    const blank = ref.doc();
    await blank.set(newDoc);
    this.addFire(newDoc, blank.id);
    return newDoc;
  }

  async set(newDoc, docRef) {
    await this.ready();
    if (this.debug) console.log(`set`, newDoc);
    newDoc = this.omitFire(newDoc);
    await docRef.set(newDoc);
    this.addFire(newDoc, docRef.id);
    return newDoc;
  }

  setWithId(id, newDoc) {
    return this.set(newDoc, this.ref.doc(id));
  }

  async update(doc, ref?) {
    await this.ready();
    if (!ref) ref = this.ref;
    let docRef;
    if (doc.$id) {
      docRef = ref.doc(doc.$id);
      if (!(await docRef.get()).exists) return this.set(doc, docRef);
    } else if (doc.$key) {
      docRef = ref.doc(doc.$key);
      if (!(await docRef.get()).exists) return this.set(doc, docRef);
    } else if (!ref.id) {
      throw 'no id';
    }
    if (this.debug) console.log(`updated`, doc);
    doc = this.omitFire(doc);
    await docRef.update(doc);
    this.addFire(doc, docRef.id);

    return doc;
  }

  async save(newDoc, ref?) {
    await this.ready();
    newDoc = this.omitFire(newDoc);
    newDoc.updatedAt = Date.now();
    if (newDoc && (newDoc.$key || newDoc.$id)) {
      return this.update(newDoc, ref);
    } else if (ref && ref.id) {
      newDoc.createdAt = Date.now();
      return this.set(newDoc, ref)
    } else {
      newDoc.createdAt = Date.now();
      return this.add(newDoc, ref);
    }
  }

  saveWithId(id, newDoc) {
    return this.save(newDoc, this.ref.doc(id));
  }

  remove(id, ref?) {
    if (!ref) ref = this.ref;
    if (this.debug) console.log('removing: ', id);
    return ref.doc(id).delete();
  }

  addFireList(collection) {
    let list = [];
    if (collection && collection.size) {
      collection.forEach((doc) => {
        if (doc.exists) {
          list.push(this.addFire(doc.data(), doc.id));
        }
      });
    }
    return list;
  }

  addFire(obj, id) {
    if (_.isObject(this.docWrapper)) {
      obj.$id = id;
      return new this.docWrapper(obj, this);
    }
    return obj;
  }

  omitFireList(list) {
    _.each(list, (val, i) => {
      list[i] = this.omitFire(val);
    });
    return list;
  }

  omitFire(payload) {
    const omitted = _.omit(payload, this.omitList);
    _.forIn(omitted, (val, i) => {
      if (_.isArray(val) || _.isObject(val)) {
        omitted[i] = this.omitFire(val);
      }
    });
    return omitted;
  }

  getFirebaseProjectId() {
    return firebase.app().options['authDomain'].split('.')[0];
  }


  /*
  * Firestore Base
 */
  async watch(id, cb, ref?) {
    await this.ready();
    if (!ref) ref = this.ref;
    ref.doc(id).onSnapshot((doc) => {
      if (doc && doc.data()) {
        cb(this.addFire(doc.data(), doc.id), doc);
      } else {
        cb(null, doc);
      }
    });
  }

  async watchList(cb, ref?) {
    await this.ready();
    if (!ref) ref = this.ref;
    ref.onSnapshot((snapshot: any) => {
      if (_.isArray(cb)) {
        cb = this.addFireList(snapshot);
      } else {
        cb(this.addFireList(snapshot));
      }
    });
  }

  watchPromise(id, ref?) {
    return new Promise(async (resolve, reject) => {
      await this.ready();
      if (!ref) ref = this.ref;
      ref.doc(id).onSnapshot((doc) => {
        if (doc && doc.data()) {
          resolve({value: this.addFire(doc.data(), doc.id), doc});
        } else {
          resolve({value: null, doc});
        }
      }, reject);
    });
  }

  watchListPromise(ref?) {
    return new Promise(async (resolve, reject) => {
      await this.ready();
      if (!ref) ref = this.ref;
      ref.onSnapshot((snapshot: any) => {
        resolve({list: this.addFireList(snapshot), snapshot});
      }, reject);
    });
  }


  /* State Management */
  watchState(name) {
    this.state[name];
  }

  setState(name) {
    this.state[name];
  }

  getState(name) {
    this.state[name];
  }


  /**
   * Delete a collection, in batches of batchSize. Note that this does
   * not recursively delete subcollections of documents in the collection
   */
  deleteCollection(collectionRef = this.ref, batchSize = 50) {
    const query = collectionRef.limit(batchSize);
    return new Promise((resolve, reject) => {
      this.deleteQueryBatch(this.db, query, batchSize, resolve, reject);
    });
  }

  async deleteQueryBatch(db, query, batchSize, resolve, reject) {
    try {
      let numDeleted = 0;
      const snapshot = await query.get();
      // When there are no documents left, we are done
      if (snapshot.size == 0) {
        numDeleted = 0;
      } else {
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        numDeleted = snapshot.size;
      }
      if (numDeleted <= batchSize) {
        resolve();
        return;
      }
      // Recurse on the next process tick, to avoid
      // exploding the stack.
      process.nextTick(() => {
        this.deleteQueryBatch(db, query, batchSize, resolve, reject);
      });
    } catch (error) {
      reject(error);
    }
  }

  // AngularFire //
  //
  // observe(id, path = this.path) {
  //   if (this.angularFirestore) {
  //     return this.afs.observe(id, path);
  //   }
  // }
  //
  // observeList(path = this.path, query?, events?) {
  //   if (!path) {
  //     path = this.path;
  //   }
  //   if (this.angularFirestore) {
  //     return this.afs.observeList(path, query, events);
  //   } else {
  //     return new Observable().map(r => []);
  //   }
  // }


  /*
   * UTILITIES
  */

  async replaceId(oldId, newId, ref?) {
    await this.ready();
    if (!ref) ref = this.ref;
    let data = await this.get(oldId, ref);
    if (data === null) {
      console.log('cant find record for: ' + oldId);
      return 'cant find record';
    }
    data = this.addFire(data, newId);
    await this.save(data);
    return await this.remove(oldId, ref);
  }

  async replaceIdOnCollection(oldId, newId, subRef?) {
    await this.ready();
    if (!subRef) {
      subRef = this.ref
    }
    let data = await this.get(oldId, subRef);
    if (data === null) {
      console.log('cant find record for: ' + oldId);
      return 'cant find record';
    }
    data = this.addFire(data, newId);
    await this.save(data, subRef);
    return await this.remove(oldId, subRef);
  }

  async moveRecord(oldPath, newPath) {
    let record: any = await this.db.doc(oldPath).get();
    record = record.data();
    console.log('record move', record);
    await this.db.doc(newPath).set(record);
    const doc: any = this.db.doc(oldPath);
    return await doc.remove();
  }

  async copyRecord(oldPath, newPath, updateTimestamp = false) {
    let record: any = await this.db.doc(oldPath).get();
    record = record.data();
    if (updateTimestamp) record.updatedAt = Date.now();
    console.log('record move', record);
    return await this.db.doc(newPath).set(record);
  }

  async backupDoc(doc, deep = true, backupPath = '_backups') {
    console.log('deep', deep);
    const timestamp = Date.now();
    if (!doc) return Promise.reject('Missing Doc');
    const ef = new EngageFirestore(backupPath + '/' + timestamp + '/' + doc.$path);
    doc.$backupAt = timestamp;
    await doc.$save();
    return await ef.save({
      ...doc,
      updatedAt: timestamp
    });
    // if (deep) {
    //   return await doc.$subCollections.map(collection = this.backupCollection()
    // }
  }

  // async backupCollection(collection, deep = true, backupPath = '_backups') {
  //   const ef = new EngageFirestore(collection.path);
  //   await Promise.all((await ef.getList()).map(async doc => {
  //     await this.backupDoc(doc, backupPath);
  //     doc.$subCollections
  //     if (collection && collection.subCollections.length) {
  //       return await Promise.all(collection.subCollections.map((subCollection: EngageICollection) => {
  //         subCollection.path = subCollection.path + '/' + doc.$id;
  //         return this.backupCollection(subCollection, backupPath);
  //       }));
  //     } else {
  //       return true;
  //     }
  //
  //     return await this.backupDoc(doc, backupPath);
  //   }));
  // }

  /* TODO: */
  async restore() {

  }


  /*
  * FILES
  * */

  async uploadFiles(doc, files = [], id = 'eng-files') {
    if (this.debug) console.log('File Upload:', files);
    const storageRef = engageFire.storage.ref().child(doc.$path);
    const element: any = document.getElementById(id);
    const uploaded = [];
    if (!doc) return;
    const docFileCollection = doc.$collection('files');
    await docFileCollection.ready();
    // let txt = '';
    if ((element && 'files' in element) || files) {
      if ((element && element.files.length === 0) && files.length === 0) {
        // txt = 'Select one or more files.';
      } else {
        files = files || element.files;
        for (let i = 0; i < files.length; i++) {
          const file: any = files[i];

          if ('name' in file) {
            let preFile;
            try {
              preFile = await docFileCollection.save({
                name: file.name,
              });
            } catch (error) {
              console.error('Engage file upload:', error);
            }
            const snapshot = await storageRef.child('files').child(preFile.$id).child(file.name).put(file);
            if (doc && snapshot) {
              preFile = {
                ...preFile,
                url: snapshot.downloadURL,
                meta: {
                  storagePath: doc.$path + '/files/' + preFile.$id + '/' + file.name,
                  state: snapshot.state,
                }
              };
              uploaded.push(await docFileCollection.save(preFile));
            }
          }
          if ('size' in file) {
            // txt += "size: " + file.size + " bytes <br>";
          }
        }
        return uploaded;
      }
    }
  }

  async uploadImage(doc, options = uploadImageOptions, id = 'eng-files', file?) {
    const storageRef = engageFire.storage.ref().child(doc.$path);
    const element: any = document.getElementById(id);
    if (this.debug) console.log(options);
    if ((element && element.files && element.files.length) || file) {
      const _file: any = file || element.files[0];
      if ('name' in _file) {
        // txt += "name: " + file.name + "<br>";
        const snapshot = await storageRef.child('$image').child(_file.name).put(_file);
        if (doc) {
          doc.$image = snapshot.downloadURL;
          // doc.$thumbnail = snapshot.downloadURL;
          doc.$imageMeta = {
            name: _file.name,
            storagePath: doc.$path + '$image' + _file.name,
            original: snapshot.downloadURL,
            state: snapshot.state,
          };
          await doc.$save();
        }
      }
      if ('size' in _file) {
        // txt += "size: " + file.size + " bytes <br>";
      }
    }
    return doc;
  }

  // resizeImage(file, options) {
  //   var reader = new FileReader();
  //   reader.onload = function(event){
  //     var img = new Image();
  //     img.onload = function(){
  //       canvas.width = options.width;
  //       canvas.height = options.height;
  //       ctx.drawImage(img,0,0);
  //     }
  //     img.src = event.target.result;
  //   }
  //   reader.readAsDataURL(file);
  // }

  async deleteFile(doc, fileId) {
    const fileDoc = await doc.$collection('files').get(fileId);
    const desertRef = engageFire.storage.child(fileDoc.meta.storagePath);

    // Delete the file
    return await desertRef.delete().then(() => fileDoc.$remove() );
  }

  async deleteImage(doc) {
    const desertRef = engageFire.storage.child(doc.$imageMeta.storagePath);

    // Delete the file
    return await desertRef.delete().then(() => {
      doc.$image = null;
      doc.$thumbnail = null;
      doc.$imageOrginal = null;
      doc.$imageMeta = null;
    });
  }

  downloadFile(fileUrl) {
    return new Promise((resolve) => {
      // This can be downloaded directly:
      let xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = () => {
        let blob = xhr.response;
        resolve(blob);
      };
      xhr.open('GET', fileUrl);
      xhr.send();
    });
  }

  /* AUTH */

  async login(email, password) {
    try {
      return await engageFire.auth.signInWithEmailAndPassword(email, password);
    } catch(error) {
      throw new Error(error);
    }
  }

  async loginSocial(service, method, mobile = false) {
    console.log('isMobile', mobile);
    let provider;
    switch(service) {
      case 'google':
        provider = new firebase.auth.GoogleAuthProvider();
        break;
      case 'twitter':
        provider = new firebase.auth.TwitterAuthProvider();
        break;
      case 'facebook':
        provider = new firebase.auth.FacebookAuthProvider();
        break;
      case 'github':
        provider = new firebase.auth.GithubAuthProvider();
        break;
      default:
        provider = new firebase.auth.GoogleAuthProvider();
    }

    if (method === 'popup') {
      return await engageFire.auth.signInWithPopup(provider);
    } else {
      return await engageFire.auth.signInWithRedirect(provider);
    }
  }

  async signup(email, password) {
    try {
      return await engageFire.auth.createUserWithEmailAndPassword(email, password);
    } catch(error) {
      throw new Error(error);
    }
  }

  async logout() {
    return await engageFire.auth.signOut();
  }

  async sendEmailVerification() {
    return await engageFire.auth.sendEmailVerification();
  }

  async forgotPassword(email) {
    return await engageFire.auth.sendPasswordResetEmail(email);
  }

  async updatePassword(newPassword) {
    return await engageFire.auth.updatePassword(newPassword);
  }

  async updateAuth() {
    if (this.appInitialized() && firebase && firebase.auth() && firebase.auth().currentUser) {
      this.auth = firebase.auth().currentUser;
      this.publish(this.auth, 'user');
      if (this.auth) {
        this.userId = this.auth.uid;
        if (this.debug) console.log('userId', this.userId);
      }
    } else {
      this.auth = null;
      this.userId = null;
    }
  }

  // async secureDoc(doc, allowedPermissions) {
  //   doc.$$secure = true;
  //   doc.$$allowed = allowedPermissions;
  //   return await this.save(doc);
  // }
  //
  // async allowUserAccess(doc, id, permission) {
  //   return await doc.$collection('_permission').save({
  //     $id: id,
  //     permission: permission
  //   });
  // }
  //
  // async addPermission(id, permission) {
  //   const users = new EngageFirestore('_users/' + id + '/permissions');
  //   const permissions = new EngageFirestore('_permissions/' + permission.$id + '/routes');
  //   await users.save({
  //     $id: id,
  //     permission: permission
  //   });
  //   return await permissions.save({
  //     $id: id,
  //     permission: permission
  //   });
  // }
  //
  // async removePermission() {
  //
  // }
  //
  // async checkPermission() {
  //
  // }

}
