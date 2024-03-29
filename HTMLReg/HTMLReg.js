/*
 * HTMLReg
 * By Gareth Heyes
 * Version: 0.4.5
 */	

if(window.Element && Element.prototype && !Element.prototype.staticHTML) {
	window.Object.defineProperty(Element.prototype, 'staticHTML', {
		get: function() {
			HTMLReg.setAppID('staticHTML');
			HTMLReg.disablePositioning = true;						
			return HTMLReg.parse(this.innerHTML+'');
		},
		set: function(val) {
			HTMLReg.setAppID('staticHTML');
			HTMLReg.disablePositioning = true;						
			this.innerHTML = HTMLReg.parse(val+'');
		}
	});
}
window.HTMLReg = function() {
	var appID = '',
	imageProxy = 'http://www.gmodules.com/ig/proxy?url=',
	debug = {},	
	parseTree = '',	
	attributeLength = 1000,
	maxAttributes = 20,
	textNodeLength = 1000,
	selfClosing = /^(?:input|br|hr|img|image)$/i,
	consumingTags = /^<(?:textarea|button|option|pre|xmp)[\s\/>]/i,
	allowedTags = /(?:canvas|form|optgroup|button|legend|fieldset|label|option|select|textarea|input|audio|aside|article|a|abbr|acronym|address|area|b|bdo|big|br|canvas|caption|center|cite|code|col|dd|del|dfn|dir|div|dl|dt|em|font|h[1-6]|hr|i|img|ins|kbd|li|map|ol|p|pre|q|s|samp|small|span|strike|strong|sub|sup|table|tbody|td|tfoot|th|thead|tr|tt|u|ul|blockquote|image|video|xmp)/,
	allowedAttributes = /(?:type|accesskey|align|alink|alt|background|bgcolor|border|cellpadding|cellspacing|class|color|cols|colspan|coords|dir|face|height|href|hspace|id|ismap|lang|marginheight|marginwidth|multiple|name|nohref|noresize|noshade|nowrap|ref|rel|rev|rows|rowspan|scrolling|shape|span|src|style|summary|tabindex|target|title|usemap|valign|value|vlink|vspace|width)/,		
	attributeValues = new RegExp("(?:\"[^\"]{0,"+attributeLength+"}\"|[^\\s'\"`>]{1,"+attributeLength+"}|'[^']{0,"+attributeLength+"}')"),
	invalidAttributeValues = new RegExp("(?:\"[^\"]{0,"+attributeLength+"}\"|[^\\s>]{1,"+attributeLength+"}|'[^>]{0,"+attributeLength+"}')"),
	attributes = new RegExp('\\s+'+allowedAttributes.source+'\\s*='+attributeValues.source),				
	urls = /^(?:https?:\/\/.+|\/.+|\w[^:]+|#[\w=?]*)$/,				
	text = new RegExp('[^<>]{1,'+textNodeLength+'}'),
	styleTag = /(?:<style>[^<>]+<\/style>)/,	
	invalidTags = new RegExp('<[^>]+(?:(?:[\\s\\/]+\\w+\\s*='+invalidAttributeValues.source+')+)>'),	
	mainRegExp = new RegExp('('+styleTag.source+')|(<\\\/?[a-z0-9]{1,10}(?:'+attributes.source+'){0,'+maxAttributes+'}(?:\\s*\\\/?)>)|('+text.source+')|('+invalidTags.source+')','ig'),
	frag = document.createDocumentFragment(),
	executeHTML = function(html) {		
		frag.innerHTML = html;		
		html = frag.innerHTML;
		var attributes = new RegExp('\\s+(?:sandbox-style|'+allowedAttributes.source+')\\s*='+attributeValues.source);
		var attributesParens = new RegExp('(?:\\s'+allowedAttributes.source+'\\s*='+attributeValues.source+')|(?:\\s+(sandbox-style)\\s*=('+attributeValues.source+'))','gi');
		html = html.replace(new RegExp('(?:<[a-z0-9]{1,10}(?:'+attributes.source+'){0,'+maxAttributes+'}(?:\\s*\\\/?)>)','ig'), function($tag) {									
			$tag = $tag.replace(attributesParens, function($0, $attributeName, $attributeValue) {
				if($attributeName !== undefined && $attributeName.length) {
					return ' style='+$attributeValue+'';
				} else {
					return $0;
				}
			});
			return $tag;
		});				
		return html;		
	},	
	parseURL = function(name, element) {
		var value = '';	
		if(!element) {
			return '';
		}
		if(element[name] === '') {
			return '';
		}				
		
		if(urls.test(element.getAttribute(name))) {
			var value = element.getAttribute(name);
		} else {
			var value = "#";
		}
		return value;
	},
	parseAttrValues = function(tag) {		
		var tagName = '';
		tag = tag.replace(new RegExp('^(<\\\/?)('+allowedTags.source+')(\\s|\\/)','i'), function($0, $start, $tagName, $end) {
			tagName = $tagName;
			return $start + 'div' + $end;
		})
		if(tagName === '') {
			return '';
		}						
		var div = document.createElement("div");
		var html = '';		
		div.style.display = 'none';			
		div.innerHTML = tag;		
		var element = div.firstChild;
		if(!element) {
			return '';
		}		
		var HTMLhref = parseURL('href',element);
		var HTMLsrc = parseURL('src',element);		
		var HTMLbackground = parseURL('background',element);			
		var HTMLaction = parseURL('action',element);
		
		if(element.getAttribute('target') !== null || element.getAttribute('target') !== '') {
			element.setAttribute('target','_blank');
		}
		
		if(element.id !== '') {				
			var id = element.id+'';
			id = id.replace(new RegExp('^'+appID), '');						
			var HTMLID = appID+id;				
		} else {
			var HTMLID = '';
		}
		
		if(element.className !== '') {
			var classList = element.className+'';
			classList = classList.replace(/[^ \w]/g,'');
			if(classList === '') {
				classList = 'invalid'
			}
			classList = classList.split(" ")				
			var HTMLClass = '';
			var len = classList.length;
			if(len > 10) {
				len = 10;
			}
			for(var i=0;i<len;i++) {
				if(/^[\w]+$/.test(classList[i])) {
					HTMLClass += appID+classList[i].replace(new RegExp('^'+appID),'')+' ';
				}
			}
			HTMLClass = HTMLClass.replace(/\s$/,'');
		} else {
			var HTMLClass = '';
		}			
		if(element.getAttribute('name') !== '' && element.getAttribute('name') !== null) {
			var name = element.getAttribute('name');
			name = name.replace(new RegExp('^'+appID), '');			
			element.setAttribute('name',appID+name);			
		}	
		if(element.getAttribute("style") !== '' && element.getAttribute("style") !== null && element.style.cssText !== '') {	
			var css = element.style.cssText;
			element.style.cssText = null;
			element.setAttribute("style","");			
			element.removeAttribute('style');
			if(element.style.cssText !== '') {
				return '';
			}	
			CSSReg.setAppID(appID);
			css = CSSReg.parse(css);			
			element.setAttribute('sandbox-style',css);			
		} else {
			element.style.cssText = null;
			element.setAttribute("style","");
			element.removeAttribute('style');
		}
		try {
			if(/^a$/i.test(tagName)) {
				element.setAttribute('rel','nofollow');
			}
			
			if (HTMLhref !== '' && typeof HTMLhref != 'undefined' && HTMLhref !== null) {				
				if(/^#/.test(HTMLhref)) {
					element.setAttribute('href', HTMLhref);
				} else {					
					element.setAttribute('href', imageProxy + encodeURIComponent(HTMLhref));
				}
			}
			if (HTMLsrc !== '' && typeof HTMLsrc != 'undefined' && HTMLsrc !== null) {
				element.setAttribute('src', imageProxy + encodeURIComponent(HTMLsrc));
			}
			if (HTMLbackground !== '' && typeof HTMLbackground != 'undefined' && HTMLbackground !== null) {
				element.setAttribute('background', imageProxy + encodeURIComponent(HTMLbackground));
			}
			if (HTMLaction !== '' && typeof HTMLaction != 'undefined' && HTMLaction !== null) {
				element.setAttribute('action', imageProxy + encodeURIComponent(HTMLaction));
			}
			if (HTMLID !== '' && typeof HTMLID != 'undefined' && HTMLID !== null) {
				element.id = HTMLID;
			}
			if (HTMLClass !== '' && typeof HTMLClass != 'undefined' && HTMLClass !== null) {
				element.className = HTMLClass;
			}			
		} catch(e) {}										
		html += '<' + tagName;
		for(var i=0;i<element.attributes.length;i++) {
			var nodeValue = element.attributes[i].nodeValue;			
			if(nodeValue == null || nodeValue === '' || nodeValue == false || /contentEditable/i.test(element.attributes[i].nodeName)) {
				continue;
			}
			html += ' ' + element.attributes[i].nodeName + '=' + '"'+escapeHTML(nodeValue)+'"';
		}
		if(selfClosing.test(tagName)) {
			html += ' /';
		}
		html += '>';		
		div = null;		
		return html;
	},
	escapeHTML = function(html) {
		html = html + '';
		html = html.replace(/[^\w ;&=\/():]/gi,function(c) {
			return '&#' + c.charCodeAt(0) + ';';
		});
		return html;
	},
	parseStyleTag = function(tag) {
		var html = '<style>\n';
		tag.replace(/^<style>([^<>]+)<\/style>$/, function($0, $css) {
			CSSReg.setAppID(appID);
			$css = CSSReg.parse($css);
			html += $css;
		});
		html += '\n<\/style>';
		return html;
	},
	parse = function(html) {
		var consuming = null,
			elementTracker = {},
			scriptNode = false;
		
		if(HTMLReg.disablePositioning) {
            CSSReg.disablePositioning = true;
	    } else {        
	        CSSReg.disablePositioning = false;
	    }
		var output = '';
		parseTree = '';
		html.replace(mainRegExp, function($0, $styleTag, $tag, $text, $invalidTags) {
			if($tag !== undefined && $tag.length) {					
				if(!new RegExp('^<\\\/?'+allowedTags.source+'\/?[\\s>]','i').test($tag)) {
					if(/^<\/?script[\s\/>]/i.test($tag)) {						
						scriptNode = true;
					}
					return '';
				}												
				var tagName = /^<\/?([a-z0-9]+)[\s\/>]/i.exec($tag);
				if(tagName) {
					tagName = tagName[1].toLowerCase();
				}
				if(!/^<\//.test($tag)) {					
					if(consuming) {
						output += $tag.replace(/[<>'"]/gi,function(c) {
							var ents = {'<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'};
							return ents[c] ? ents[c] : c;
						});
						return '';
					}
					scriptNode = false;
					if(!elementTracker[tagName]) {
						elementTracker[tagName] = 1;
					} else {
						elementTracker[tagName]++;
					}
				} else {			
					if(consuming) {
						if(tagName === consuming) {						
							consuming = null;
						} else {
							output += $tag.replace(/[<>'"]/gi,function(c) {
								var ents = {'<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'};
								return ents[c] ? ents[c] : c;
							});
							return '';
						}
					}					
					if(!elementTracker[tagName]) {
						return '';
					} else {
						elementTracker[tagName]--;
					}
					scriptNode = false;
				}	
				
				if(consumingTags.test($tag)){
					consuming = tagName;					
				}								
				parseTree+='tag('+$tag+')\n';
				if(!/^<\/?[a-z0-9]+>$/i.test($tag)) {						
					$tag = parseAttrValues($tag);
				}
				output += $tag;									
			} else if($styleTag !== undefined && $styleTag.length) {
				parseTree+='styleTag('+$styleTag+')\n';
				$styleTag= parseStyleTag($styleTag);
				output += $styleTag;									
			} else if($text !== undefined && $text.length && !scriptNode) {
				output += $text;					
				parseTree+='text('+$text+')\n';						
			} else if($invalidTags !== undefined && $invalidTags.length) {	
				parseTree+='invalidTags('+$invalidTags+')\n';									
			} 
		});
		
		if(consuming) {
			elementTracker[consuming]--;
			output += '</' + consuming + '>';
			consuming = null;
		}
		
		for(var i in elementTracker) {			
			if(elementTracker.hasOwnProperty(i)) {
				
				if(selfClosing.test(i)) {
					continue;
				}
				
				if(elementTracker[i] > 0) {
					for(var j=0;j<elementTracker[i];j++) {
						output += '</' + i + '>';
					}
				}
			}
		}
		
		if(debug['rawOutput']) {
			debug['rawOutput'](output);			
		}
		if(debug['parseTree']) {
			debug['parseTree'](parseTree);			
		}					
		return executeHTML(output);
	};		
	return {
		parse: parse,
		setAppID: function (id) {				
			appID = id;
		},		
		setDebugObjs: function(obj) {
			debug = obj;
		}		
	};
}();