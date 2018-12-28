import LogNode from "./logNode";

export default class FunctionLogNode extends LogNode {
  constructor(type, value, line) {
    super(type, value, line);
  }
  getLogParam(): Array<string> {
    if (this.showStyle && this.value) {
      return [`'${this.style}'` || "", "''"];
    }
    return [];
  }
}
