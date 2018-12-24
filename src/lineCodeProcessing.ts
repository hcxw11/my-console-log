import * as vscode from "vscode";
import { curry, pipe } from "ramda";

import {
  classFormatText,
  functionFormatText,
  variableNameFormatText,
  variableValueFormatText
} from "./constant";

const formatText = {
  class: classFormatText,
  function: functionFormatText
};

export default class LineCodeProcessing {
  document: vscode.TextDocument;
  selectedVar: string;
  lineOfSelectedVar: number;
  classList: Array<CodeNode>;
  functionList: Array<CodeNode>;

  constructor(
    document: vscode.TextDocument,
    selectedVar: string,
    lineOfSelectedVar: number
  ) {
    this.document = document;
    this.lineOfSelectedVar = lineOfSelectedVar;
    this.classList = [];
    this.functionList = [];
    this.selectedVar = selectedVar;
    this.enclosingBlockName();
  }

  getProcessing(format: string): string {
    const { classList, functionList, selectedVar } = this;
    const processingHandler = pipe(
      formatClassList(classList),
      formatFunctionList(functionList),
      formatVariable(selectedVar)
    );
    return processingHandler(format);
  }

  enclosingBlockName(): void {
    const { lineOfSelectedVar } = this;
    let currentLineNum = lineOfSelectedVar;

    while (currentLineNum >= 0) {
      const currentLineText = this.document.lineAt(currentLineNum).text;
      let keyword: string = "";
      let type: string = "";

      if (checkJS(currentLineText)) {
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
  /**
   * Return a boolean indicating if the line code represents a class declaration or not
   */
}

interface CodeNode {
  value: string;
  line: number;
}

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

/**
 * 格式化返回的log信息(class和function)
 * @param type 类型 class或者function
 * @param typeList 对应类型的列表
 * @param format 格式
 */
function formatList(type: string, typeList: Array<CodeNode>, format: string) {
  let typeName = "";
  if (typeList.length > 0) {
    typeName = typeList[typeList.length - 1].value;
  }
  return format.replace(formatText[type], typeName);
}

const formatClassList = curry(formatList)("class");
const formatFunctionList = curry(formatList)("function");

/**
 * 格式化返回的log信息(当前选择的参数)
 * @param variable 参数
 * @param format 格式
 */
const formatVariable = curry((variable: string, format: string) => {
  const reg = new RegExp(
    `(${variableNameFormatText}|${variableValueFormatText})`,
    "g"
  );
  return format.replace(reg, variable);
});
