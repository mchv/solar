Solar.Java = {};


Solar.Java.Definitions = {
    
/*

break,continue,do,else,for,if,return,while"];
  var C_KEYWORDS = [FLOW_CONTROL_KEYWORDS,"auto,case,char,const,default," + 
      "double,enum,extern,float,goto,int,long,register,short,signed,sizeof," +
      "static,struct,switch,typedef,union,unsigned,void,volatile"];
  var COMMON_KEYWORDS = [C_KEYWORDS,"catch,class,delete,false,import," +
      "new,operator,private,protected,public,this,throw,true,try,typeof"

      "abstract,boolean,byte,extends,final,finally,implements,import," +
      "instanceof,null,native,package,strictfp,super,synchronized,throws," +
      "transient"





    LBRACE("{", "separator"),
112     RBRACE("}", "separator"),
113     LBRACKET("[", "separator"),
114     RBRACKET("]", "separator"),
115     SEMICOLON(";", "separator"),
116     COMMA(",", "separator"),
117     DOT(".", "separator"),
118
119     EQ("=", "operator"),
120     GT(">", "operator"),
121     LT("<", "operator"),
122     BANG("!", "operator"),
123     TILDE("~", "operator"),
124     QUESTION("?", "operator"),
125     COLON(":", "operator"),
126     EQEQ("==", "operator"),
127     LTEQ("<=", "operator"),
128     GTEQ(">=", "operator"),
129     BANGEQ("!=","operator"),
130     AMPAMP("&&", "operator"),
131     BARBAR("||", "operator"),
132     PLUSPLUS("++", "operator"),
133     MINUSMINUS("--","operator"),
134     PLUS("+", "operator"),
135     MINUS("-", "operator"),
136     STAR("*", "operator"),
137     SLASH("/", "operator"),
138     AMP("&", "operator"),
139     BAR("|", "operator"),
140     CARET("^", "operator"),
141     PERCENT("%", "operator"),
142     LTLT("<<", "operator"),
143     GTGT(">>", "operator"),
144     GTGTGT(">>>", "operator"),
145     PLUSEQ("+=", "operator"),
146     MINUSEQ("-=", "operator"),
147     STAREQ("*=", "operator"),
148     SLASHEQ("/=", "operator"),
149     AMPEQ("&=", "operator"),
150     BAREQ("|=", "operator"),
151     CARETEQ("^=", "operator"),
152     PERCENTEQ("%=", "operator"),
153     LTLTEQ("<<=", "operator"),
154     GTGTEQ(">>=", "operator"),
155     GTGTGTEQ(">>>=", "operator"),
156     
157     ELLIPSIS("...", null),
158     AT("@", null),*/

  
    'KEYWORD' : /^package|^import|^class|^enum|^interface|^abstract|^static|^final|^synchronized|^return|^private|^public|^protected|^extends|^implements|^super|^this|^try|^catch|^finally|^instanceof|^true|^false|^boolean|^int|^float|^double|^null|^void|^switch|^case|^break|^default|^for|^if|^else/,
    'OPERATOR' : /^==|^<=|^>=|^!=|^&&|^\|\||^\+\+|^--|^=|^>|^<|^!|^~|^:|^\||^\^|^%|^<<|^>>|^\*|^&|^\+|^-/,
    'IDENTIFIER' : /^[a-zA-Z]+[a-zA-Z0-9]*/,
    'STRING' : /^\"[^\"]*\"|\'[^\']*\'/,
    'INTEGER' : /^[1-9]*\d+/,
    'LT_PAREN' : /^\(/,
    'RT_PAREN' : /^\)/,
    'LT_BRACE' : /^{/,
    'RT_BRACE' : /^}/,
    'COMMA' : /^,/,
    'WHITESPACE' : /^[\t \n]/
};

Solar.Java.Parser = function (model, from, to) {
    this.base = Solar.Parser;
    this.base(model, from, to);
};

Solar.Java.Parser.prototype = new Solar.Parser;

Solar.Java.Parser.prototype.getDefinitions = function() {
  return Solar.Java.Definitions;
}
