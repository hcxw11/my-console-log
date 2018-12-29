import * as vscode from "vscode";
import LineCodeProcessing from "./lineCodeProcessing";
import { pipe, curry } from "ramda";

export default class Message {
  selectedVar: string;
  lineOfSelectedVar: number;
  lineCodeProcessing: LineCodeProcessing;
  document: vscode.TextDocument;

  constructor(
    editor: vscode.TextEditor,
    selectedVar: string,
    lineOfSelectedVar: number
  ) {
    const { document } = editor;
    this.document = document;
    this.selectedVar = selectedVar;
    this.lineOfSelectedVar = lineOfSelectedVar;
    this.lineCodeProcessing = new LineCodeProcessing(
      document,
      this.selectedVar,
      this.lineOfSelectedVar
    );
  }

  getLog(format: string, type: string = "log"): string {
    const { document, lineOfSelectedVar, lineCodeProcessing } = this;
    const lineCharts = document.lineAt(lineOfSelectedVar).text;

    const getLogHandler = pipe(
      lineCodeProcessing.getProcessing.bind(lineCodeProcessing),
      getPrintLog(type),
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

const getPrintLog = curry(
  (type: string, message: string): string => {
    const showSemicolon = vscode.workspace.getConfiguration().semicolon;
    return `console.${type}(${message})${showSemicolon ? ";" : ""}\r\n`;
  }
);
