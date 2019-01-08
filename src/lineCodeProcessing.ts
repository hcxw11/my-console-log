import * as vscode from "vscode";
import { curry, pipe } from "ramda";
import {
  ClassLogNode,
  FunctionLogNode,
  VariableLogNode,
  LogNode
} from "./LogNode";

import {
  CLASS_FORMAT_TEXT,
  FUNCTION_FORMAT_TEXT,
  VARIABLE_FORMAT_TEXT
} from "./constant";

const formatText = {
  class: CLASS_FORMAT_TEXT,
  function: FUNCTION_FORMAT_TEXT,
  variable: VARIABLE_FORMAT_TEXT
};

const LogClassMap = {
  class: ClassLogNode,
  function: FunctionLogNode,
  variable: VariableLogNode
};

export default class LineCodeProcessing {
  document: vscode.TextDocument;
  lineOfSelectedVar: number;
  classList: Array<CodeNode>;
  functionList: Array<CodeNode>;
  variableList: Array<CodeNode>;

  constructor(
    document: vscode.TextDocument,
    selectedVar: string,
    lineOfSelectedVar: number
  ) {
    this.document = document;
    this.lineOfSelectedVar = lineOfSelectedVar;
    this.classList = [];
    this.functionList = [];
    this.variableList = [
      {
        value: selectedVar,
        line: lineOfSelectedVar
      }
    ];
    this.enclosingBlockName();
  }

  getProcessing(format: string): string {
    const originalLog: LogFormat = {
      text: format,
      param: []
    };
    const { classList, functionList, variableList } = this;

    const processingHandler = pipe(
      formatClassList(classList),
      formatFunctionList(functionList),
      formatVariableList(variableList),
      getLogText
    );

    return processingHandler(originalLog);
  }

  // 向上解析代码，获取class和function的名字
  enclosingBlockName(): void {
    const { lineOfSelectedVar } = this;
    let currentLineNum = lineOfSelectedVar;
    const codeBlock: Array<number> = [];

    while (currentLineNum >= 0) {
      const currentLineText = this.document.lineAt(currentLineNum).text;
      let keyword: string = "";
      let type: string = "";

      // 上方有一个 { } 代码块，应该跳过
      if (currentLineText.indexOf("}") !== -1) {
        codeBlock.push(currentLineNum);
      } else if (currentLineText.indexOf("{") !== -1 && codeBlock.length > 0) {
        codeBlock.pop();
      } else if (checkJS(currentLineText)) {
        currentLineNum--;
        continue;
      } else if (checkClass(currentLineText)) {
        keyword = getClassName(currentLineText);
        type = "class";
      } else if (checkFunction(currentLineText)) {
        keyword = getFunctionName(currentLineText);
        type = "function";
      }
      if (keyword && type) {
        this[`${type}List`].unshift({
          value: keyword,
          line: currentLineNum
        });
      }
      currentLineNum--;
    }
  }
}

interface CodeNode {
  value: string;
  line: number;
}

interface LogFormat {
  text: string;
  param: Array<string>;
}

/**
 * 格式化返回的log信息
 * @param type 类型
 * @param typeList 对应类型的列表
 * @param originalLog 原始的log信息，处理后传出去
 */
function formatList(
  type: string,
  typeList: Array<CodeNode>,
  originalLog: LogFormat
) {
  // 模板中要求显示, 且能找的对应的值
  if (originalLog.text.indexOf(formatText[type]) !== -1) {
    const { value = "", line = -1 } = typeList[typeList.length - 1] || {};
    const logNode = new LogClassMap[type](type, value, line) as LogNode;
    originalLog.text = originalLog.text.replace(
      formatText[type],
      logNode.getValue()
    );
    originalLog.param = originalLog.param.concat(logNode.getLogParam());
  }
  return originalLog;
}

const formatClassList = curry(formatList)("class");
const formatFunctionList = curry(formatList)("function");
const formatVariableList = curry(formatList)("variable");

function getLogText(originalLog: LogFormat) {
  return [`'${originalLog.text}'`].concat(originalLog.param).join(", ");
}

/**
 * Return a boolean indicating if the line code represents a class declaration or not
 */
function checkClass(lineCode: string): boolean {
  const classNameRegex = /class(\s+)[a-zA-Z]+(.*){/;
  return classNameRegex.test(lineCode);
}

/**
 * Return the class name in case if the line code represents a class declaration
 */
function getClassName(lineCode: string): string {
  if (lineCode.split(/class /).length >= 2) {
    const textInTheRightOfClassKeyword = lineCode.split(/class /)[1].trim();
    if (textInTheRightOfClassKeyword.split(" ").length > 0) {
      return textInTheRightOfClassKeyword.split(" ")[0].replace("{", "");
    } else {
      return textInTheRightOfClassKeyword.replace("{", "");
    }
  }
  return "";
}

/**
 * Return a boolean indicating if the line code represents a named function declaration
 */
function checkFunction(lineCode: string): boolean {
  const namedFunctionDeclarationRegex = /[a-zA-Z]+(\s*)\(.*\)(\s*){/;
  const nonNamedFunctionDeclaration = /(function)(\s*)\(.*\)(\s*){/;
  const namedFunctionExpressionRegex = /[a-zA-Z]+(\s*)=(\s*)(function)?(\s*)[a-zA-Z]*(\s*)\(.*\)(\s*)(=>)?(\s*){/;
  const isNamedFunctionDeclaration = namedFunctionDeclarationRegex.test(
    lineCode
  );
  const isNonNamedFunctionDeclaration = nonNamedFunctionDeclaration.test(
    lineCode
  );
  const isNamedFunctionExpression = namedFunctionExpressionRegex.test(lineCode);
  return (
    (isNamedFunctionDeclaration && !isNonNamedFunctionDeclaration) ||
    isNamedFunctionExpression
  );
}

/**
 * Return a boolean indicating if the line code represents an if, switch, while or for statement
 */
function checkJS(lineCode: string): boolean {
  const jSBuiltInStatement = /(if|switch|while|for)(\s*)\(.*\)(\s*){/;
  return jSBuiltInStatement.test(lineCode);
}

/**
 * Return the function name in case if the line code represents a named function declaration
 */
function getFunctionName(lineCode: string): string {
  if (/function(\s+)[a-zA-Z]+(\s*)\(.*\)(\s*){/.test(lineCode)) {
    if (lineCode.split("function ").length > 1) {
      return lineCode
        .split("function ")[1]
        .split("(")[0]
        .replace(/(\s*)/g, "");
    }
  } else {
    if (lineCode.split(/\(.*\)/).length > 0) {
      const textInTheLeftOfTheParams = lineCode.split(/\(.*\)/)[0];
      if (/=/.test(textInTheLeftOfTheParams)) {
        if (textInTheLeftOfTheParams.split("=").length > 0) {
          return textInTheLeftOfTheParams
            .split("=")[0]
            .replace(/export |module.exports |const |var |let |=|(\s*)/g, "");
        }
      } else {
        return textInTheLeftOfTheParams.replace(/async |(\s*)/g, "");
      }
    }
  }
  return "";
}
