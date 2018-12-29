const keywords =
  " if for then else lambda λ true false const let class function var ";
function TokenStream(input) {
  var current = null;
  return {
    next: next,
    peek: peek,
    eof: eof,
    croak: input.croak
  };
  function is_keyword(x) {
    return keywords.indexOf(" " + x + " ") >= 0;
  }
  function is_digit(ch) {
    return /[0-9]/i.test(ch);
  }
  function is_id_start(ch) {
    return /[a-zλ_]/i.test(ch);
  }
  function is_id(ch) {
    return is_id_start(ch) || "?!-<>=0123456789".indexOf(ch) >= 0;
  }
  function is_op_char(ch) {
    return "+-*/%=&|<>!".indexOf(ch) >= 0;
  }
  function is_punc(ch) {
    return ",;(){}[]".indexOf(ch) >= 0;
  }
  function is_whitespace(ch) {
    return " \t\n".indexOf(ch) >= 0;
  }
  function is_arg(ch) {
    return ch === ".";
  }
  function read_while(predicate) {
    var str = "";
    while (!input.eof() && predicate(input.peek())) str += input.next();
    return str;
  }
  function read_number() {
    var has_dot = false;
    var number = read_while(function(ch) {
      if (ch == ".") {
        if (has_dot) return false;
        has_dot = true;
        return true;
      }
      return is_digit(ch);
    });
    return { type: "num", value: parseFloat(number) };
  }
  function read_ident() {
    var id = read_while(is_id);
    return {
      type: is_keyword(id) ? "kw" : "var",
      value: id
    };
  }
  function read_escaped(end) {
    var escaped = false,
      str = "";
    input.next();
    while (!input.eof()) {
      var ch = input.next();
      if (escaped) {
        str += ch;
        escaped = false;
      } else if (ch == "\\") {
        escaped = true;
      } else if (ch == end) {
        break;
      } else {
        str += ch;
      }
    }
    return str;
  }
  function read_string() {
    return { type: "str", value: read_escaped('"') };
  }
  function read_arg() {
    return { type: "arg", value: read_escaped(";( ") };
  }
  function skip_comment() {
    read_while(function(ch) {
      return ch != "\n";
    });
    input.next();
  }
  function read_next() {
    read_while(is_whitespace);
    if (input.eof()) return null;
    var ch = input.peek();
    if (ch == "#") {
      skip_comment();
      return read_next();
    }
    if (ch == '"') return read_string();
    if (is_digit(ch)) return read_number();
    if (is_arg(ch)) return read_arg();
    if (is_id_start(ch)) return read_ident();
    if (is_punc(ch))
      return {
        type: "punc",
        value: input.next()
      };
    if (is_op_char(ch))
      return {
        type: "op",
        value: read_while(is_op_char)
      };
    // input.croak("Can't handle character: " + ch);
  }
  function peek() {
    return current || (current = read_next());
  }
  function next() {
    var tok = current;
    current = null;
    return tok || read_next();
  }
  function eof() {
    return peek() == null;
  }
}

export default class InputStream {
  pos: number;
  line: number;
  col: number;
  input: string;
  constructor(input: string) {
    (this.pos = 0), (this.line = 1), (this.col = 0);
    this.input = input;
  }
  inputParse() {
    const parseGenerator = TokenStream(this);
    const parseResult: Array<Object> = [];
    const variableMap = {};

    while (!parseGenerator.eof()) {
      const wordParse = parseGenerator.next();
      if (wordParse.type === "var" && !variableMap[wordParse.value]) {
        variableMap[wordParse.value] = 1;
        parseResult.push(wordParse.value);
      }
    }
    return parseResult.join(", ");
  }
  next() {
    var ch = this.input.charAt(this.pos++);
    if (ch == "\n") this.line++, (this.col = 0);
    else this.col++;
    return ch;
  }
  peek() {
    return this.input.charAt(this.pos);
  }
  eof() {
    return this.peek() == "";
  }
  croak(msg) {
    throw new Error(msg + " (" + this.line + ":" + this.col + ")");
  }
}
