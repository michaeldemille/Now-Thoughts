import {IFirebaseObject} from "./firebase-object.model";

export interface EngIFirebase {
  ref;
  auth;
  userId: string;
}

export interface IFirebaseObject {
  $id?: string;
  $exists?: boolean;
  createdAt?: number;
  updatedAt?: number;
}


export interface EngIFirebaseCollection extends IFirebaseObject, EngIFirebase {
  path?: string;
  updateState?: boolean;
  save();
  set();
  update();
  get(id?);
  remove?(id?, updateState?);
}

export interface EngIFirebaseDoc extends IFirebaseObject, EngIFirebase {
  collection?: string;
  save(value, updateState?);
  set(value, updateState?);
  update(value, updateState?);
  get(id?);
  subscribe?();
  remove?(updateState?);
}
