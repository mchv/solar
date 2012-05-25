Solar.Selection = Solar.Utils.makeClass({


	defined: false,
	from: null,
	to:  null,
    anchor: null,


    constructor: function() {

    },

    create: function(cursor) {
    	this.defined = true;
     	this.anchor = cursor.getPosition();
     },

    all: function(model) {
		this.defined = true;
		this.from = 0;
		this.to = model.content.length;
		this.achor = 0;
	},

    update: function(cursor, model, selector) {
     
    	var pattern = selector || /^[a-z]+$/;

     	var txt = model.lines[cursor.line-1].content;
        var c = cursor.column;

        var f = c;
        var t = c+1;

        while(pattern.test(txt.substring(f, t)) && f > -1) {
            f--;
        }
        f++;

        while(pattern.test(txt.substring(f, t)) && t < txt.length) {
            t++;
        }
        t--;

        this.create(cursor);
        this.from = f + model.lines[cursor.line-1].offset;
        this.to = t + model.lines[cursor.line-1].offset;
    },

	move: function(cursor) {
		var newBound = cursor.getPosition();
		if(newBound < this.anchor && this.from != newBound) {
                    this.from = newBound;
                    this.to = this.anchor;
                    return true;
         }
         if(newBound > this.anchor && this.to != newBound) {
                    this.from = this.anchor;
                    this.to = newBound;
                    return true;
         }                            
        if(newBound == this.anchor && this.from != null) {
                    this.from = null;
                    this.to = null;
                    return true;
        }
        return false;
	},

	clear: function() {
		if(this.defined && (this.from == null || this.to == null)) {
			this.empty();
		}
	},

	empty: function() {
		this.defined = false;
		this.from = null;
		this.to = null;
		this.anchor = null;
	},

});