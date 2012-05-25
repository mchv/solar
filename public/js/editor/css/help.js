
Solar.Css.Help = Solar.Utils.makeClass({

	constructor: function() {

	},

    page: function() {
    		return {div:'pageText', url:function(selection) {

    			var keyword = selection
    			if (selection == 'rgb')
    				keyword = 'color_value%23RGB_(red-green-blue)'

    			return 'https://developer.mozilla.org/en/CSS/' + keyword	
    		}
    	};
    },

    selector: function() {
    	return /^(-)*[a-z]+(-[a-z]*)*$/
    }
    

});