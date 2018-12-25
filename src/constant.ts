import * as vscode from "vscode";
const {
  classStyle,
  functionStyle,
  variableStyle
} = vscode.workspace.getConfiguration();

export const CLASS_FORMAT_TEXT = "{C}";
export const FUNCTION_FORMAT_TEXT = "{F}";
export const VARIABLE_FORMAT_TEXT = "{V}";
export const SEPARATOR = " -> ";
export const DEFAULT_CLASS_STYLE = "color:hsl(198, 99%, 37%)";
export const DEFAULT_FUNCTION_STYLE = "color:hsl(41, 99%, 38%)";
export const DEFAULT_VARIABLE_STYLE = "color:hsl(221, 87%, 60%)";
export const DEFAULT_COLOR_FORMAT = `'%c{C}%c -> %c{F}%c -> %c{V} :', '${classStyle ||
  DEFAULT_CLASS_STYLE}', '', '${functionStyle ||
  DEFAULT_FUNCTION_STYLE}', '', '${variableStyle ||
  DEFAULT_VARIABLE_STYLE}', {V}`;
export const DEFAULT_COLOR_NO_VAR_FORMAT = `'%c{C}%c -> %c{F}', '${classStyle ||
  DEFAULT_CLASS_STYLE}', '', '${functionStyle || DEFAULT_FUNCTION_STYLE}'`;
export const DEFAULT_FORMAT = "'{C} -> {F} -> {V}:', {V}";
export const DEFAULT_NO_VAR_FORMAT = "'{C} -> {F}'";
