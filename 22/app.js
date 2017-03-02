;(function(window){


  // 观察者构造函数
function Observer(data) {
  var args = Array.prototype.slice.call(arguments);
    this.data = data.data;



    var elem = document.querySelectorAll(data.el)[0];
    var template = elem.innerHTML;
    template = template.replace(/[\r\t\n\s]/g, '');


   elem.innerHTML = this.templateEngine(template,this.data);
}

Observer.prototype = {
  constructor:Observer,
  templateEngine: function(html, options){
    var re = /\{\{([^\}\}]+)?\}\}/gi, reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g, code = 'var r=[];\n', cursor = 0;
    var add = function(line, js) {
      js ? (code += line.match(reExp) ? line + '\n' : 'r.push(data.' + line + ');\n') :
        (code += line !== '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
      return add;
    };
    while (match = re.exec(html)) {
      add(html.slice(cursor, match.index))(match[1], true);
      cursor = match.index + match[0].length;
    }
    add(html.substr(cursor, html.length - cursor));
    code += 'return r.join("");';
    console.log(code.replace(/[\r\t\n]/g, ''));
    return new Function(code.replace(/[\r\t\n]/g, '')).apply(options);
  }
};



  window.Observer = Observer;
})(window);
