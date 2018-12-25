"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import Message from "./message";
import {
  DEFAULT_COLOR_FORMAT,
  DEFAULT_COLOR_NO_VAR_FORMAT,
  DEFAULT_FORMAT,
  DEFAULT_NO_VAR_FORMAT
} from "./constant";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  vscode.commands.registerCommand("myConsoleLog.displayLog", () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const document = editor.document;
    const selection = editor.selection;
    const selectedVar = document.getText(selection);
    const lineOfSelectedVar = selection.active.line;

    let logFormat = "";
    let noValFormat = "";

    if (vscode.workspace.getConfiguration().color) {
      logFormat = DEFAULT_COLOR_FORMAT;
      noValFormat = DEFAULT_COLOR_NO_VAR_FORMAT;
    } else {
      logFormat = DEFAULT_FORMAT;
      noValFormat = DEFAULT_NO_VAR_FORMAT;
    }

    const message = new Message(editor);
    const log = message.getLog(selectedVar ? logFormat : noValFormat);

    editor.edit(editBuilder => {
      editBuilder.insert(new vscode.Position(lineOfSelectedVar + 1, 0), log);
    });
  });

  vscode.commands.registerCommand("myConsoleLog.deleteAllLog", () => {
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

  vscode.commands.registerCommand("myConsoleLog.commentAllLog", () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const document = editor.document;

    editor.edit(editBuilder => {
      const documentLines = document.lineCount;
      for (let i = 0; i < documentLines; i++) {
        const lineText: string = document.lineAt(i).text;
        if (lineText.indexOf("console.log(")) {
          editBuilder.delete(document.lineAt(i).range);
          editBuilder.insert(
            new vscode.Position(i, 0),
            lineText.replace("console.", "// console.")
          );
        }
      }
    });
  });

  vscode.commands.registerCommand("myConsoleLog.unCommentAllLog", () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const document = editor.document;

    editor.edit(editBuilder => {
      const documentLines = document.lineCount;
      for (let i = 0; i < documentLines; i++) {
        const lineText: string = document.lineAt(i).text;
        if (lineText.indexOf("console.log(")) {
          editBuilder.delete(document.lineAt(i).range);
          editBuilder.insert(
            new vscode.Position(i, 0),
            lineText.replace("// console.", "console.")
          );
        }
      }
    });
  });
}

// this method is called when your extension is deactivated
export function deactivate() {}
