Solar.Selection = Solar.Utils.makeClass({


	defined: false;
	from: null,
	to:  null,
    anchor: null,

    update: function(cursor, model) {
     
     	this.defined = true;

     	var txt = model.lines[cursor.line-1].content;
        var c = cursor.column;
        while(txt.charAt(c).match(/\w/) && c > -1) {
            c--;
        }
        c++;
 
        this.anchor = cursor.getPosition();
        this.from = model.lines[cursor.line-1].offset;
        this.to = null;
        
        c = this.cursor.column + 1;
        while(txt.charAt(c).match(/\w/) && c < txt.length) {
            c++;
        }
        this.to = c + model.lines[cursor.line-1].offset;
     },

    create: function(cursor) {
     	this.anchor = cursor.getPosition();
     }

	empty: function() {
		this.defined = false;
		this.from = null;
		this.to = null;
		this.anchor = null;
	},


	pif: function() {
		if(newBound < this.selection.anchor && this.selection.from != newBound) {
                    this.selection.from = newBound;
                    this.selection.to = this.selection.anchor;
                    return true;
         }
         if(newBound > this.selection.anchor && this.selection.to != newBound) {
                    this.selection.from = this.selection.anchor;
                    this.selection.to = newBound;
                    return true;
         }                            
        if(newBound == this.selection.anchor && this.selection.from != null) {
                    this.selection.from = null;
                    this.selection.to = null;
                    return true;
        }
        return false;
	},

	plop: function() {
		if(defined && (thisfrom == null || this.to == null)) {
			this.empty();
		}
	}

});