import * as vscode from "vscode";
import LineCodeProcessing from "./lineCodeProcessing";
import { pipe, curry } from "ramda";

export default class Message {
  selectedVar: string;
  lineOfSelectedVar: number;
  tabSize: number;
  lineCodeProcessing: LineCodeProcessing;
  document: vscode.TextDocument;

  constructor(editor: vscode.TextEditor) {
    const { options, document, selection } = editor;
    this.document = document;
    this.tabSize = options.tabSize as number;
    this.selectedVar = document.getText(selection);
    this.lineOfSelectedVar = selection.active.line;
    this.lineCodeProcessing = new LineCodeProcessing(
      document,
      this.selectedVar,
      this.lineOfSelectedVar
    );
  }

  getLog(format: string): string {
    const { document, lineOfSelectedVar, lineCodeProcessing } = this;
    const lineCharts = document.lineAt(lineOfSelectedVar).text;

    const getLogHandler = pipe(
      lineCodeProcessing.getProcessing.bind(lineCodeProcessing),
      getPrintLog,
      getLineSpace(lineCharts)
    );

    return getLogHandler(format);
  }
}

const getLineSpace = curry((lineChars: string, message: string) => {
  const spaceReg = /^\s*/.exec(lineChars) || "";
  let currentLineSpace = spaceReg || spaceReg[0];
  if (lineChars[lineChars.length - 1] === "{") {
    currentLineSpace += "\t";
  }
  return currentLineSpace + message;
});

function getPrintLog(message: string): string {
  return `console.log(${message});\r\n`;
}
