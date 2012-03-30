Solar.Css = {};


Solar.Css.Definitions = {
    

    'STRING' : /^\"[^\"]*\"|\'[^\']*\'/,
    'INTEGER' : /^[1-9]*\d+/,
    'LT_PAREN' : /^\(/,
    'RT_PAREN' : /^\)/,
    'LT_BRACE' : /^{/,
    'RT_BRACE' : /^}/,
    'COMMA' : /^,|^;|^:/,
    'WHITESPACE' : /^[\t \n]/
};

Solar.Css.Parser = function (model, from, to) {
    this.base = Solar.Parser;
    this.base(model, from, to);

    this.theme = Solar.Css.Theme;
};

Solar.Css.Parser.prototype = new Solar.Parser;

Solar.Css.Parser.prototype.getDefinitions = function() {
  return Solar.Css.Definitions;
}
