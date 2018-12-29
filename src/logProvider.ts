import * as vscode from "vscode";
import Message from "./message";
import { DEFAULT_FORMAT } from "./constant";
import InputStream from "./inputStream";

const logKeys = {
  cl: "log",
  ce: "error",
  cw: "warn"
};

export default class LogProvider implements vscode.CompletionItemProvider {
  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.CompletionItem[] {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return [];
    }
    const { format } = vscode.workspace.getConfiguration();

    let variable = "";
    if (position.line - 1 >= 0) {
      const inputStream = new InputStream(
        document.lineAt(position.line - 1).text
      );
      variable = inputStream.inputParse();
    }

    const message = new Message(editor, variable, position.line);

    const CompletionItems: Array<vscode.CompletionItem> = [];

    Object.keys(logKeys).forEach(key => {
      const log = message.getLog(format || DEFAULT_FORMAT, logKeys[key]).trim();
      const item = new vscode.CompletionItem(
        log,
        vscode.CompletionItemKind.Snippet
      );
      item.filterText = key;
      item.insertText = log;
      CompletionItems.push(item);
    });

    return CompletionItems;
  }
  public resolveCompletionItem(
    item: vscode.CompletionItem,
    token: vscode.CancellationToken
  ): any {
    return item;
  }
  dispose() {}
}
