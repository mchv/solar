Solar.Default = {};

Solar.Default.Definitions = {};

Solar.Default.Parser = function (model, from, to) {
    this.base = Solar.Parser;
    this.base(model, from, to);
    this.theme = Solar.Default.Theme;
};

Solar.Default.Parser.prototype = new Solar.Parser;

Solar.Default.Parser.prototype.getDefinitions = function() {
  return Solar.Default.Definitions;
}
