import * as vscode from "vscode";

interface ILogNode {
  value: string;
  line: number;
  style?: string;
  type: string;
}

const styleConfigMap = {
  class: "classStyle",
  function: "functionStyle",
  variable: "variableStyle"
};

export default abstract class LogNode implements ILogNode {
  value: string;
  line: number;
  style?: string;
  type: string;
  showStyle: boolean;

  constructor(type, value, line) {
    this.value = value || "";
    this.line = line || -1;
    this.type = type || "";
    this.showStyle = vscode.workspace.getConfiguration().color;
    this.style = vscode.workspace.getConfiguration()[styleConfigMap[type]];
  }
  abstract getLogParam(): Array<string>;
  getValue(): string {
    if (this.showStyle) {
      return this.value ? `%c${this.value}%c` : `no ${this.type}`;
    }
    return this.value || `no ${this.type}`;
  }
}
