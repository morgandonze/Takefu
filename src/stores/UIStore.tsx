import { makeObservable, observable } from "mobx";

export default class UIStore {
  editingId: number | null = null;

  constructor() {
    makeObservable(this, {
      editingId: observable,
    });
  }
}
