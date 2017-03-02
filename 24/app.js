;(function(window){


  // 观察者构造函数
function Observer(data) {
  var args = Array.prototype.slice.call(arguments);
    this.data = data.data;

    // if(args[1] && args[1].watch){
    //   this.$watch(args[1].name,args[1].cb);
    // } else {
    //   this.walk(data);
    // }
    //

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
  },
  walk: function (obj) {
      var val;
      for (var key in obj) {
          // 这里为什么要用hasOwnProperty进行过滤呢？
          // 因为for...in 循环会把对象原型链上的所有可枚举属性都循环出来
          // 而我们想要的仅仅是这个对象本身拥有的属性，所以要这么做。
          if (obj.hasOwnProperty(key)) {
              val = obj[key];

              // 这里进行判断，如果还没有遍历到最底层，继续new Observer
              if (typeof val === 'object') {
                  new Observer(val);
              }

              this.convert(key, val);
          }
      }
  },
  convert: function (key, val, cb) {
      Object.defineProperty(this.data, key, {
          enumerable: true,
          configurable: true,
          get: function () {
              // console.log('你访问了' + key);
              return val;
          },
          set: function (newVal) {

              if (newVal === val) return;
              if(typeof newVal === 'object'){
                new Observer(newVal);
              }

              val = newVal;

              if(!!cb){
                cb(newVal);
              }else{
                console.log('你设置了' + key);
                console.log('新的' + key + ' = ' + newVal);
              }
          }
      });
  },
  $watch: function(name,cb) {
    var obj = this.data,val,
    names = name.split('.');
    for (var key in obj) {

        if (obj.hasOwnProperty(key)) {
            val = obj[key];
            if(key === names[0]){

              if(names.length === 1){
                this.convert(key, val, cb);
                if(typeof val === 'object'){
                  for(var k in val){
                    new Observer(val,{watch:true,name:k,cb:cb});
                  }
                }
              } else {
                if (typeof val === 'object') {
                  new Observer(val,{watch:true,name:names.slice(1).join('.'),cb:cb});
                }
              }
            }

        }
    }
  },

};



  window.Observer = Observer;
})(window);
