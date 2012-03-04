Solar.Parser = Solar.Utils.makeClass({
  

  constructor: function(model, from, to) {
    if (arguments.length == 0)
      return;
    this.model = model;
    this.from = from || 1;
    this.to = to || model.lines.length;
    if(!/^$/.test(this.model.lines[this.from-1].content)) {
      while(this.from > 1) {
        if(!/^$/.test(this.model.lines[this.from-1].content)) {
          this.from--;
        } else {
          this.from++;
          break;
        }
      }
    }

    this.text = '';
       for(var i=this.from; i<=this.to; i++) {
           if(i>this.model.lines.length) {
               continue;
           }
           this.text += this.model.lines[i-1].content
           if(this.model.lines[i] && this.model.lines[i].line > this.model.lines[i-1].line) {
               this.text += '\n';
           } else {
               this.text += '\r';
           }                       
       }
  },

  getDefinitions: function() {
    /* overide in subobject */
  },

  tokens: function() {

   var length = 0;
   tokens = [];

   var content = this.text;
   var definitions = this.getDefinitions();
   
   while (length < this.text.length ) {
      var token = this.getToken(content, definitions);
      length += token.text.length;
      content = content.substr(token.text.length);
      tokens.push(token);
   }
   return tokens;
  },

  getToken: function(content, definitions) {
    for (var def in definitions) {
          var matches = content.match(definitions[def]);
          if (matches != null) {
            return this.newToken(def, matches[0]);
          }
      }
      return this.newToken('UNKNOWN', content.charAt(0));
  },

  newToken:function (type, text) {
  
    var lines = text.match(/[\n\r]/g);
    var from = this.from;
    var to = this.from + (lines ? lines.length - 1: 0);
    this.from = this.from + (lines ? lines.length: 0);

    return {
      type: type,
      text: text,
      startLine: from,
      endLine: to
    };
  }  

});