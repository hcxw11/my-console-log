import LogNode from "./logNode";

export default class VariableLogNode extends LogNode {
  constructor(type, value, line) {
    super(type, value, line);
  }
  getLogParam(): Array<string> {
    if (this.showStyle && this.value) {
      return [`'${this.style}'` || "", "''", this.value];
    }
    return this.value ? [this.value] : [];
  }
}
