var Solar = {};


/** some useful monkey patching **/

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};


/** Some utils **/
Solar.Utils = {
    
    bind: function(func, o) {
        return function() {
            func.apply(o, arguments);
        }
    },
    
    makeClass: function(methods) {
        var fn = function(args) {
            if(args == undefined) {
                args = {};
            }
            if(!(this instanceof arguments.callee)) {
                return new arguments.callee(arguments);
            }                      
            if( typeof this.constructor == "function") {
                this.constructor.apply(this, args.callee ? args : arguments);
            }                      
        }; 
        fn.prototype = methods; 
        return fn;
    }
    
}