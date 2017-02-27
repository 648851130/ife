;(function(window){


  // 观察者构造函数
function Observer(data) {
  var args = Array.prototype.slice.call(arguments);
    this.data = data;
    this.walk(data);

    if(args[1] && args[1].watch){
      this.$watch(args[1].name,args[1].cb);
    }
}

Observer.prototype = {
  constructor:Observer,
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

              if (typeof val === 'object') {
                new Observer(val,{watch:true,name:names.slice(1).join('.'),cb:cb});
              }
              this.convert(key, val, cb);
            }

        }
    }
  },

};



  window.Observer = Observer;
})(window);
