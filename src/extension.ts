"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import Message from "./message";
import {
  classFormatText,
  functionFormatText,
  variableNameFormatText,
  variableValueFormatText
} from "./constant";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  vscode.commands.registerCommand("myConsoleLog.displayLogMessage", () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const document = editor.document;
    const selection = editor.selection;
    const selectedVar = document.getText(selection);
    const lineOfSelectedVar = selection.active.line;

    const message = new Message(editor);
    const normalFormat = `'${classFormatText}->${functionFormatText}->${variableNameFormatText}：', ${variableValueFormatText}`;
    const noValFormat = `'${classFormatText}->${functionFormatText}'`;
    const log = message.getLog(selectedVar ? normalFormat : noValFormat);

    editor.edit(editBuilder => {
      editBuilder.insert(new vscode.Position(lineOfSelectedVar + 1, 0), log);
    });
  });

  vscode.commands.registerCommand("myConsoleLog.deleteAllLogMessages", () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const document = editor.document;

    editor.edit(editBuilder => {
      const documentLines = document.lineCount;
      for (let i = 0; i < documentLines; i++) {
        const lineText: string = document.lineAt(i).text;
        if (lineText.indexOf("console.log(") !== -1) {
          editBuilder.delete(document.lineAt(i).rangeIncludingLineBreak);
        }
      }
    });
  });
}

// this method is called when your extension is deactivated
export function deactivate() {}
