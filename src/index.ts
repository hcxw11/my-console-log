"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import Message from "./message";
import { DEFAULT_FORMAT } from "./constant";
import LogProvider from "./logProvider";
const languageSupport = [
  "javascript",
  "typescript",
  "typescriptreact",
  "javascriptreact",
  "html",
  "vue"
];

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let logProvider = new LogProvider();

  languageSupport.forEach(key => {
    const provider = vscode.languages.registerCompletionItemProvider(
      key,
      logProvider
    );
    context.subscriptions.push(provider);
  });

  vscode.commands.registerCommand("myConsoleLog.displayLog", () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const selection = editor.selection;
    const lineOfSelectedVar = selection.active.line;
    const selectedVar = editor.document.getText(selection);

    const { format } = vscode.workspace.getConfiguration();
    const message = new Message(editor, selectedVar, lineOfSelectedVar);
    const log = message.getLog(format || DEFAULT_FORMAT);

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
