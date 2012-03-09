Solar.Router = {};


Solar.Router.Definitions = {
      
    'COMMENT' : /^#[\d\w\s~\/()]*(\n|(\r\n))/, 
    'METHOD' : /^GET|^POST|^PUT|^HEAD|^DELETE|^\*/,
    'LT_PAREN' : /^\(/,
    'RT_PAREN' : /^\)/,
    'LT_BRACE' : /^{/,
    'RT_BRACE' : /^}/,
    'SLASH' : /^\//,
    'LT_TAG' : /^</,
    'RT_TAG' : /^>/,
    'WHITESPACE' : /^[\t \n]/
};

Solar.Router.Parser = function (model, from, to) {
    this.base = Solar.Parser;
    this.base(model, from, to);

    this.theme = Solar.Router.Theme;
};

Solar.Router.Parser.prototype = new Solar.Parser;

Solar.Router.Parser.prototype.getDefinitions = function() {
  return Solar.Router.Definitions;
}
