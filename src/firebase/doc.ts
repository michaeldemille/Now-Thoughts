import _ from 'lodash';
import {engageFire} from "./engagefire";
import {EngageFirestore} from "./engage-firestore";


export class EngageFireDoc {

  $ref: any;
  $path: string;
  $owner: string;

  constructor(
    public $doc: any,
    private $engageFireStore: EngageFirestore,
    public $id?: string,
  ) {
    if (!_.isEmpty($doc) && ($doc.$id || $doc.id || this.$id)) {
      _.assign(this, $doc);
      this.init();
    }
  }

  init() {
    this.$id = this.$doc.$id || this.$doc.id || this.$id;
    this.$ref = this.$engageFireStore.ref;
  }

  $save() {
    this.$$updateDoc();
    return this.$engageFireStore.save(this.$doc);
  }

  $update() {
    this.$$updateDoc();
    return this.$engageFireStore.update(this.$doc);
  }

  $set() {
    this.$$updateDoc();
    return this.$engageFireStore.update(this.$doc);
  }

  async $get() {
    this.$doc = await this.$engageFireStore.get(this.$id);
    return this.$doc;
  }

  async $attachOwner() {
    this.$owner = await this.$engageFireStore.getUserId();
    this.$doc.$owner = this.$owner;
    this.$$updateDoc();
    this.$doc = await this.$engageFireStore.save(this.$doc);
    return this.$doc;
  }

  async $isOwner(userId = this.$doc.$owner) {
    if (!userId) {
      await this.$attachOwner();
    }
    return this.$owner === await this.$engageFireStore.getUserId();
  }

  async $addFiles(elements?, inputId?) {
    this.$$updateDoc();
    return await this.$engageFireStore.uploadFiles(this.$doc, elements, inputId);
  }

  async $setImage(options?, inputId?, file?) {
    this.$$updateDoc();
    return await this.$engageFireStore.uploadImage(this.$doc, options, inputId, file);
  }

  async $removeImage() {
    this.$$updateDoc();
    await this.$engageFireStore.deleteImage(this.$doc);
    return this.$doc;
  }

  async $removeFile(fileId) {
    this.$$updateDoc();
    await this.$engageFireStore.deleteFile(this.$doc, fileId);
    return this.$doc;
  }

  async $getFiles() {
    return await this.$doc.$collection('files').getList();
  }

  async $getFile(fileId) {
    return await this.$doc.$collection('files').get(fileId);
  }

  async $downloadFile(fileId) {
    const fileDoc = await this.$doc.$collection('files').get(fileId);
    return await this.$engageFireStore.downloadFile(fileDoc.url);
  }

  async $remove() {
    return this.$engageFireStore.remove(this.$id);
  }

  async $collection(collection, db?) {
    return new EngageFirestore(engageFire.firestore.collection(this.$path).doc(this.$id).collection(collection), db);
  }

  async $watch(cb) {
    return this.$engageFireStore.watch(this.$id, cb);
  }

  async $watchPromise() {
    return this.$engageFireStore.watchPromise(this.$id);
  }

  async $backup(deep, backupPath) {
    this.$$updateDoc();
    return await this.$engageFireStore.backupDoc(this.$doc, deep, backupPath)
  }

  $exists() {
    this.$$updateDoc();
    return !!this.$doc;
  }

  $$updateDoc(doc = this) {
    this.$doc = this.$engageFireStore.omitFire(this.$$difference(doc, this.$doc));
    return this.$doc;
  }

  $$difference(object, base) {
    function changes(object, base) {
      return _.transform(object, (result, value, key) => {
        if (!_.isEqual(value, base[key])) {
          result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
        }
      });
    }
    return changes(object, base);
  }

}
