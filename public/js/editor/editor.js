/** The editor itself **/
Solar.Editor = Solar.Utils.makeClass({
    
    model: null,
    ctx: null,
    el: null,
    cursor: null,
    
    lineHeight: 17,
    first_line: 1,
    gutterWidth: 40,
    paddingTop: 5,
    paddingLeft: 5,
    font: '9pt Monaco, Lucida Console, monospace',
    
    hasFocus: false,
    selection: null,
    path:null,
    saveURL:null,
    compileURL:null,
    
    constructor: function(canvasEl, path, compileURL, saveURL) {
        this.el = (typeof(canvasEl) == 'string' ? document.getElementById(canvasEl) : canvasEl);
        if(!this.el.getContext) {
            // Too bad.
            return;
        }
        this.ctx = this.el.getContext('2d');
        if(!this.ctx.fillText) {
            // Too bad.
            return;
        }
        this.path = path;
        this.compileURL = compileURL;
        this.saveURL = saveURL;

        this.model = new Solar.Model(this.el.innerHTML, this);
        this.cursor = new Solar.Cursor(this);
        this.history = new Solar.History(this);
        this.clipboard = new Solar.Clipboard(this);
        this.selection = new Solar.Selection();
        
        // Gecko detection
        this.gecko = (document.getBoxObjectFor == undefined) ? false : true;
        
        // Events
        this.el.addEventListener('dblclick', Solar.Utils.bind(this.onDblclick, this), true);
        window.addEventListener('mousedown', Solar.Utils.bind(this.onMousedown, this), true);
        window.addEventListener('mouseup', Solar.Utils.bind(this.onMouseup, this), true);
        window.addEventListener('mousemove', Solar.Utils.bind(this.onMousemove, this), true);
        window.addEventListener('keypress', Solar.Utils.bind(this.onKeypress, this), true);
        window.addEventListener('keydown', Solar.Utils.bind(this.onKeydown, this), true);
        this.el.addEventListener('mousewheel', Solar.Utils.bind(this.onMousewheel, this), true)
        
        // Gecko hacks
        this.el.addEventListener('DOMMouseScroll', Solar.Utils.bind(this.onMousewheelGecko, this), true);
        
        // First
        this.resize(this.el.width, this.el.height);   
                         
    },
    
    setContent: function(content) {
        this.model.content = content;
        this.model.update();
        this.cursor.bound();
        this.paint();
    },
    
    getContent: function() {
        return this.model.content;
    },
    
    getPosition: function() {
        var pos = $(this.el).position();
        return {
            top: pos.top + parseInt($(this.el).css('borderTopWidth')) + parseInt($(this.el).css('paddingTop')) + parseInt($(this.el).css('marginTop')),
            left: pos.left + parseInt($(this.el).css('borderLeftWidth')) + + parseInt($(this.el).css('paddingLeft')) + + parseInt($(this.el).css('marginLeft'))
        }
    },
    
    scroll: function(firstLine) {
        this.first_line = firstLine;
        if(this.onScrollHandler) {
            this.onScrollHandler(firstLine);
        }
    },
    
    onScroll: function(handler) {
        this.onScrollHandler = handler;
    },
    
    resize: function(w, h) {
        this.width = w;
        this.height = h;
        this.el.width = w;
        this.el.height = h;
        this.ctx.font = this.font;
        var txt = ' ';
        for(var i=0; i<500; i++) {
            if(this.ctx.measureText(txt).width < this.width - 10 - this.gutterWidth - 2 * this.paddingLeft) {
                txt += ' ';
            } else {
                this.charWidth = this.ctx.measureText(txt).width / txt.length;
                break;
            }
        }
        this.lineWidth = Math.round((this.width - 10 - this.gutterWidth - 2 * this.paddingLeft ) / this.charWidth);
        this.lines = Math.round((this.height - this.paddingTop * 3) / this.lineHeight);
        this.model.update();
        this.paint();
        if(this.onResizeHandler) {
            this.onResizeHandler();
        }
    },
    
    onResize: function(onResizeHandler) {
        this.onResizeHandler = onResizeHandler;
    },
    
    onMousedown: function(e) {
        if(e.target == this.el) {
            this.hasFocus = true;
        } else {
            this.hasFocus = false;
        }
        // Scrollbar click ?
        if(e.pageX > this.getPosition().left + this.width - 20 && e.target == this.el) {
            var h = this.lines * this.lineHeight;
            var olh = h / this.model.lines.length;
            var bar = this.lines * olh;
            if(bar < 10) bar = 10;
            var o =  (this.first_line - 1) * olh;
            var y = e.pageY - this.getPosition().top - this.paddingTop;
            // The bar itself
            if(y>o && y<o+bar) {
                this.scrollBase = e.pageY;
                this.scrollBaseLine = this.first_line;
            } 
            // Up
            else if (y<o){
                this.onMousewheel({wheelDelta: 1});
            } 
            // Down
            else {
                this.onMousewheel({wheelDelta: -1});
            }
            // No select
            $('#preview').css('-webkit-user-select', 'none');
        } 
        // Text click
        else {
            this.selection.empty();
            this.bp = true;   
            if(e.target == this.el) {
                this.cursor.fromPointer(this.translate(e));
                this.paint();
            } else {
                this.paint();
            }                     
        }                         
    },
    
    onDblclick: function(e) {        
        this.selection.update(this.cursor, this.model);
        this.paint();
    },
    
    onMouseup: function(e) {
        // Clear all stuff
        this.bp = false;
        this.scrollBase = null;
        clearTimeout(this.autoscroller);
        // No select
        this.selection.clear();
    },
    
    onMousemove: function(e) {
        // Change cursor automatically
        if(e.pageX > this.getPosition().left + this.width - 20 && e.target == this.el) {
            this.el.style.cursor = 'default';
        } else {
            this.el.style.cursor = 'text';
        }
        if(!this.hasFocus) return;
        // A scroll ?
        if(this.scrollBase) {
            var h = this.lines * this.lineHeight;
            var olh = h / this.model.lines.length;
            var line = Math.round((e.pageY - this.scrollBase) / olh) + this.scrollBaseLine;
            this.onMousewheel({}, line);
            return;
        }
        // A selection ?
        if(this.bp) {
            if(!this.selection.defined) {
                this.selection.create(this.cursor);
            } else {
                this.cursor.fromPointer(this.translate(e));
                if(this.selection.move(this.cursor)) {
                    this.paint();
                }
            }
        }
        // Auto-scroll while selecting
        var auto = false;
        if(this.bp) {
            if(e.pageY < this.getPosition().top) {
                this.onMousewheel({wheelDelta: 1});     
                auto = true;                       
            } 
            if(e.pageY > this.getPosition().top + this.height) {
                this.onMousewheel({wheelDelta: -1});
                auto = true;
            }
        }
        clearTimeout(this.autoscroller);
        if(auto) {
            this.autoscroller = setTimeout(Solar.Utils.bind(function() {
                this.onMousemove(e);
            }, this), 10);
        }                   
    },
    
    onMousewheel: function(e, o) {
        // Hack. Call it with e = null, for direct line access
        if(o != null) {
           this.scroll(o); 
        } else {
            var delta = e.wheelDelta;
            if(delta > 0) {
                this.scroll(this.first_line-1);                      
            } else {
                this.scroll(this.first_line+1);           
            }
        }
        if(e.preventDefault) e.preventDefault();
        this.cursor.bound();
        this.paint();
    },
    
    onMousewheelGecko: function(e) {
        if(e.axis == e.VERTICAL_AXIS) {
            this.onMousewheel({
                wheelDelta: -e.detail
            });
            e.preventDefault();
        }
    },
    
    onKeypress: function(e) {
        if(!e.charCode || e.charCode == 13 || e.keyCode == 8) {
            if(this.gecko) this.onKeydown(e, true);
            return;
        }
        if(this.hasFocus) {
            this.cursor.show = true;
            var position = this.cursor.getPosition();
            if(e.metaKey || e.ctrlKey) {
                /* a */
                if(e.charCode == 97) {
                    e.preventDefault();
                    this.selection.all(this.model);
                    this.paint();
                }
                /* z */
                if(e.charCode == 122) {
                    this.history.undo();
                    this.compile();
                }
                /* y */
                if(e.charCode == 121) {
                    this.history.redo();
                    this.compile();
                }
                /* x */
                if(e.charCode == 120) {
                    this.clipboard.cut();
                }
                /* v */
                if(e.charCode == 118) {
                    this.clipboard.paste();
                    /* compilation is called in the paste action */
                }
                /* c */
                if(e.charCode == 99) {
                    this.clipboard.copy();
                }

                /* s */
                if(e.charCode == 115) {
                    e.preventDefault();
                    this.save();
                }

                /* w */
                if(e.charCode == 119) {
                    e.preventDefault();
                    this.close();
                }


                /* TODO f => search,  p => goto anything */

                return;
            }                       
            // CHARS
            var c = String.fromCharCode(e.charCode);
            e.preventDefault();
            if(this.selection.defined) {
                this.model.replace(this.selection.from, this.selection.to, c);
                this.cursor.toPosition(this.selection.from + 1);
                this.selection.empty();
            } else {
                this.model.insert(position, c);
                this.cursor.toPosition(position + 1);                         
            }
            this.compile();
            this.cursor.focus();
        }
    },
    
    onKeydown: function(e, force) {
        if(this.hasFocus && (!this.gecko || force)) {
            if(e.metaKey || e.ctrlKey) {

                /* Selection with keyboard */
                if(e.keyCode == 40) {
                    e.preventDefault();
                    if(!this.selection.defined) {
                        this.selection.create(this.cursor);
                    }
                    this.cursor.lineDown(true);
                    this.selection.move(this.cursor);                    
                    this.cursor.focus();
                    return;
                }

                if(e.keyCode == 38) {
                    e.preventDefault();
                    if(!this.selection.defined) {
                        this.selection.create(this.cursor);
                    }
                    this.cursor.lineUp(true);
                    this.selection.move(this.cursor);  
                    this.cursor.focus();
                    return;
                }
            
                if(e.keyCode == 37) {
                    e.preventDefault();
                    if(!this.selection.defined) {
                        this.selection.create(this.cursor);
                    }
                    this.cursor.left(true);
                    this.selection.move(this.cursor);
                    this.cursor.focus();
                    return;
                }
            
                if(e.keyCode == 39) {
                    e.preventDefault();
                    if(!this.selection.defined) {
                        this.selection.create(this.cursor);
                    }
                    this.cursor.right(true);
                    this.selection.move(this.cursor);
                    this.cursor.focus();
                    return;
                }

                return;
            }
            this.cursor.show = true;
            // ~~~~ MOVE
            if(e.keyCode == 40) {
                e.preventDefault();
                this.cursor.lineDown();
                this.cursor.focus();
                return;
            }
            if(e.keyCode == 38) {
                e.preventDefault();
                this.cursor.lineUp();
                this.cursor.focus();
                return;
            }
            if(e.keyCode == 37) {
                e.preventDefault();
                this.cursor.left();
                this.cursor.focus();
                return;
            }
            if(e.keyCode == 39) {
                e.preventDefault();
                this.cursor.right();
                this.cursor.focus();
                return;
            }   
            // ~~~~ With pos
            var position = this.cursor.getPosition();
            /* ENTER */
            if(e.keyCode == 13) {
                e.preventDefault();
                if(this.selection.defined) {
                    this.model.replace(this.selection.from, this.selection.to, '\n');
                    this.cursor.toPosition(this.selection.from + 1);
                    this.selection.empty();
                } else {
                    this.model.lineBreak(position);
                    this.cursor.toPosition(position+1);                                
                }
                this.cursor.focus();
                this.compile();
                return;
            }
            /* BACKSPACE */
            if(e.keyCode == 8) {
                e.preventDefault();
                if(this.selection.defined) {
                    this.model.replace(this.selection.from, this.selection.to, '');
                    this.cursor.toPosition(this.selection.from);
                    this.selection.empty();
                } else {
                    this.model.deleteLeft(position);
                    this.cursor.toPosition(position - 1);
                }
                this.compile();
                this.cursor.focus();
                return;
            }
            /* TAB */
            if(e.keyCode == 9) {
                e.preventDefault();
                if(this.selection.defined) {
                    this.model.replace(this.selection.from, this.selection.to, '    ');
                    this.cursor.toPosition(this.selection.from + 4);
                    this.selection.empty();
                } else {
                    this.model.insert(position, '    ');
                    this.cursor.toPosition(position + 4);                            
                }
                this.compile();
                this.cursor.focus();
                return;
            }
            /* SUPPR */ 
            if(e.keyCode == 46) {
                e.preventDefault();
                this.model.deleteRight(position);
                this.cursor.toPosition(position);
                this.compile();
                this.cursor.focus();
                return;
            }                 
        }
    },
    
    translate: function(e) {
        var pos = this.getPosition();
        return {
            x: e.pageX - pos.left - this.gutterWidth - this.paddingLeft,
            y: e.pageY - pos.top - this.paddingTop
        }
    },
    
    updateCursor: function() {
        this.showCursor = this.hasFocus && !this.showCursor;
        this.paint();
    },
    
    paint: function() {
        this.paintBackground();
        this.paintLineNumbers();
        this.paintSelection();
        this.paintContent();
        this.paintScrollbar();
        this.paintCursor();
        this.paintError();
    },
    
    paintBackground: function() {
        var style = Solar.Theme['PLAIN'];
        if(style && style.background) {
            this.ctx.fillStyle = style.background;
        } else {
            this.ctx.fillStyle = '#000';            
        }
        this.ctx.fillRect(0, 0, this.width, this.height);
    },
    
    paintSelection: function() {
        if(this.hasFocus) {
            var style = Solar.Theme['SELECTION'];
            if(style && style.background) {
                this.ctx.fillStyle = style.background;
            } else {
                this.ctx.fillStyle = 'rgba(255,255,255,.2)';                
            }
            if(!this.selection.defined) {               
                if(this.cursor.isVisible()) {  
                    this.ctx.fillRect(this.gutterWidth + 1, (this.cursor.line - this.first_line) * this.lineHeight + this.paddingTop, this.width - this.gutterWidth, this.lineHeight);
                }
            } else {
                this.cursor.toPosition(this.selection.from);
                var fl = this.cursor.line, fc = this.cursor.column;
                this.cursor.toPosition(this.selection.to);
                var tl = this.cursor.line, tc = this.cursor.column;
                if(fl == tl) {
                    this.ctx.fillRect(this.gutterWidth + this.paddingLeft + fc * this.charWidth, (fl - this.first_line) * this.lineHeight + this.paddingTop, (tc - fc) * this.charWidth, this.lineHeight);
                } else {
                    for(var i=fl; i<=tl; i++) {
                        if(this.cursor.isLineVisible(i)) {
                            if(i == fl) {
                                this.ctx.fillRect(this.gutterWidth + this.paddingLeft + fc * this.charWidth, (i - this.first_line) * this.lineHeight + this.paddingTop, (this.lineWidth-fc-1) * this.charWidth, this.lineHeight);
                                continue;
                            }
                            if(i == tl) {
                                this.ctx.fillRect(this.gutterWidth + this.paddingLeft, (i - this.first_line) * this.lineHeight + this.paddingTop, tc * this.charWidth, this.lineHeight);
                                continue;
                            }
                            this.ctx.fillRect(this.gutterWidth + this.paddingLeft, (i - this.first_line) * this.lineHeight + this.paddingTop, (this.lineWidth-1) * this.charWidth, this.lineHeight);
                        }
                    }
                }
            }
        }
    },
    
    paintLineNumbers: function() {
        this.ctx.fillStyle = '#DEDEDE';
        this.ctx.fillRect(0, 0, this.gutterWidth, this.height);
        this.ctx.fillStyle = '#8E8E8E';
        this.ctx.fillRect(this.gutterWidth, 0, 1, this.height);
        this.ctx.font = this.font;
        var previousLine = null;
        var rl = 1;
        for(var i=this.first_line; i<this.first_line + this.lines; i++) {
            if(i > this.model.lines.length) {
                break;
            }
            if(this.hasFocus && !this.selection.defined && this.model.lines[i-1].line == this.model.lines[this.cursor.line-1].line) {
                 this.ctx.fillStyle = '#000000'; 
            } else {
                this.ctx.fillStyle = '#888888';                            
            }
            var ln = '';
            if(false) {
                // debug
                ln = i+'';
            } else {
                if(this.model.lines[i-1].line == previousLine) {
                    ln = '\u00B7';
                } else {
                    previousLine = (this.model.lines[i-1].line);
                    ln = previousLine + '';
                }
            }
            var w = ln.length * 8;
            this.ctx.fillText(ln, this.gutterWidth - this.paddingLeft - w, rl++ * this.lineHeight + this.paddingTop - 4);
        }
    },
    
    paintContent: function() {
        

        var parser = this.createParser();
        var x = 0, y = 1;
        var tokens = parser.tokens();
        for (var t=0; t<tokens.length; t++) {    
            var token = tokens[t];
            if(token.text) {
                var style = parser.theme[token.type];        
                if(style && style.color) {
                    this.ctx.fillStyle = style.color;
                } else {
                    this.ctx.fillStyle = '#FFF';                            
                }
                if(style && style.fontStyle) {
                    this.ctx.font = style.fontStyle + ' ' + '12px Monaco, Lucida Console, monospace'; 
                } else {
                    this.ctx.font = '12px Monaco, Lucida Console, monospace';                         
                }

                if(token.text.indexOf('\n') > -1 || token.text.indexOf('\r') > -1) {
                    var lines = token.text.split(/[\n\r]/);
                    for(var i=0; i<lines.length; i++) {                        
                        if(token.startLine + i >= y + this.first_line - 1 && token.startLine + i <= this.first_line + this.lines - 1) {
                            this.ctx.fillText(lines[i], this.gutterWidth + this.paddingLeft + x * this.charWidth, y * this.lineHeight + this.paddingTop - 4);                        
                            x += lines[i].length;
                            if(i < lines.length - 1 ) {
                                x = 0; y++;
                            }
                        }
                    }
                } else { 
                    if(token.startLine >= y + this.first_line - 1 && token.startLine <= this.first_line + this.lines - 1) { 
                        this.ctx.fillText(token.text, this.gutterWidth + this.paddingLeft + x * this.charWidth, y * this.lineHeight + this.paddingTop - 4);                        
                        if(style && style.underline) {
                            this.ctx.fillRect(this.gutterWidth + this.paddingLeft + x * this.charWidth, y * this.lineHeight + this.paddingTop - 4 + 1, token.text.length * this.charWidth + 1, 1);
                        }
                        x += token.text.length;
                    }
                }
            }
        }
    },

    
    paintError: function() {
        if (this.model.error) {
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fillRect(this.gutterWidth + this.paddingLeft + (this.model.error.srcStart - this.model.lines[this.model.error.errorLine - 1].offset) * this.charWidth, this.paddingTop + ((this.model.error.errorLine - this.first_line + 1) * this.lineHeight), (this.model.error.srcEnd - this.model.error.srcStart + 1) * this.charWidth, 2);   
        }
    },

    paintCursor: function() {
        if(this.hasFocus && this.cursor.show && !this.selection.defined && this.cursor.isVisible()) {
            this.ctx.fillStyle = '#FFF';
            this.ctx.fillRect(this.gutterWidth + this.paddingLeft + this.cursor.column * this.charWidth, this.paddingTop + ((this.cursor.line - this.first_line) * this.lineHeight), 1, this.lineHeight);
        }
    },
    
    paintScrollbar: function() {
        if(this.model.lines.length > this.lines) {
            var h = this.lines * this.lineHeight;
            var olh = h / this.model.lines.length;
            var bar = this.lines * olh;
            var o =  (this.first_line - 1) * olh; 
            // Draw
            this.ctx.strokeStyle = 'rgba(255, 255, 255, .5)';                
            this.ctx.lineWidth = 10;
            this.ctx.beginPath();
            this.ctx.moveTo(this.width - 10, this.paddingTop + o);
            this.ctx.lineTo(this.width - 10, this.paddingTop + o + bar);
            this.ctx.stroke();
        }
    },


    createParser: function() {
            var end_line = this.first_line + this.lines - 1;
            if (this.path.match(/\.java$/))
                return new Solar.Java.Parser(this.model, this.first_line, end_line);
            else if(this.path == "conf/application.conf")
                return new Solar.Default.Parser(this.model, this.first_line, end_line);  
            else if(this.path == "conf/messages")
                return new Solar.Default.Parser(this.model, this.first_line, end_line);
            else if(this.path == "conf/routes")
                return new Solar.Router.Parser(this.model, this.first_line, end_line);
            if (this.path.endsWith(".css"))
                return new Solar.Css.Parser(this.model, this.first_line, end_line);
            else
                return new Solar.Default.Parser(this.model, this.first_line, end_line);
    },

    compile: function() {
        var toCompile = this.model.content;
        var model = this.model;
        var path = this.path;

        $.post(this.compileURL, { "path":path, "source": toCompile },
            function(data){
                    var json = jQuery.parseJSON(data);
                    var result = json.compilation.result;
                    if (!(result)) {
                        model.error = json.compilation;
                        $('a.save').addClass('inactive');
                    } else {
                        model.error = null;
                        $('a.save').removeClass('inactive');
                    }
            },
            "text");
    },

    save: function() {
        var toSave = this.model.content;
        var path = this.path;

        $.post(this.saveURL, { "path": path, "source": toSave  },
            function(data){
                    $('a.save').addClass('inactive');
                    /*TODO need to warn the user that file has been saved */
            },
            "text");
    },

    close: function() {
        var closeLink = $('a.close').attr('href');
        window.location = closeLink;
    }
    
});