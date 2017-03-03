;(function(window,document){
let fragment, currentNodeList = [];

function Vue(options){

  this._init(options);
}

Vue.prototype = {
    constructor: Vue,
    _init,
    observer: Observer,
    $watch,
    _compile:function(){
      fragment = document.createDocumentFragment();
      currentNodeList.push(fragment);

      this._compileNode(this.$template);

     this.$el.parentNode.replaceChild(fragment, this.$el);
     console.log(fragment)

     this.$el = document.querySelector(this.$options.el);

    },
    _compileNode:function(node){
      console.log(node)
      switch(node.nodeType){
        // text
        case 1:
            this._compileElement(node);
            break;
        // node
        case 3 :
            this._compileText(node);
            break;
        default:
            return;

      }
    },
    _compileElement:function(node){
      let newNode = document.createElement(node.tagName);

    // 处理节点属性
    if (node.hasAttributes()) {
        let attrs = node.attributes;
        Array.from(attrs).forEach((attr) => {
            newNode.setAttribute(attr.name, attr.value);
        });
    }


    let currentNode = currentNodeList[currentNodeList.length - 1].appendChild(newNode);

    if (node.hasChildNodes()) {
        currentNodeList.push(currentNode);
        Array.from(node.childNodes).forEach(this._compileNode, this);
    }

    currentNodeList.pop();

  },
  _compileText: function (node) {
    // console.log(node)
      let nodeValue = node.nodeValue;

      if (nodeValue === '') return;

      let patt = /{{([^}}]+)?}}/gi;
      let ret = nodeValue.match(patt);
      let d = this.$data;

      // console.log(ret)

      if (!ret) return;

      ret[0].replace(/[{}]/g, '').split('.').forEach((value) => {
          d = d[value];
      }, this);

      nodeValue = nodeValue.replace(ret[0],d);

      // console.log(currentNodeList)
      currentNodeList[currentNodeList.length - 1].appendChild(document.createTextNode(nodeValue));
  }

};

function _init(options){
  this.$options = options;
  this.$data = options.data;
  this.$el = document.querySelector(options.el);
  this.$template = this.$el.cloneNode(true);

  this.observer = new this.observer(this.$data);
  this.observer.on('set', this._compile.bind(this));

  this._compile();
}

function $watch(key,fn){
  let _fn = function () {
      fn(arguments[2]);
  };

  let pathAry = key.split('.');
  if (pathAry.length === 1) {
      this.$data.$observer.on(`set:${key}`, _fn.bind(this));
  } else {
      let _temp = this.$data;
      let lastProperty = pathAry.pop();
      pathAry.forEach((property) => {
          _temp = _temp[property]; //a.b -> b.c -> c.d
      });
      _temp.$observer.on(`set:${lastProperty}`, _fn.bind(this));
  }
}

// 观察者构造函数
function Observer(data) {
  this.data = data;

  Object.defineProperty(data, '$observer', {
          value: this,
          enumerable: false,
          writable: true,
          configurable: true
      });

  this.walk(data);
}

Observer.prototype = {
  constructor: Observer,
  walk:function (obj) {
    var val;

    for (var key in obj) {
        // 这里为什么要用hasOwnProperty进行过滤呢？
        // 因为for...in 循环会把对象原型链上的所有可枚举属性都循环出来
        // 而我们想要的仅仅是这个对象本身拥有的属性，所以要这么做。
        if (obj.hasOwnProperty(key)) {
            val = obj[key];

            // 这里进行判断，如果还没有遍历到最底层，继续new Observer
            if (typeof val === 'object') {
                this.observe(key,val);
            }

            this.convert(key, val);
        }
    }
  },
  convert:function (key, val) {

    let ob = this;
    Object.defineProperty(this.data, key, {
        enumerable: true,
        configurable: true,
        get: function () {
            console.log('你访问了' + key);
            return val;
        },
        set: function (newVal) {

            if (newVal === val) return;

            val = newVal;
            console.log('你设置了' + key);
            console.log('新的' + key + ' = ' + newVal);
            ob.notify('set', key, newVal);
            ob.notify(`set:${key}`, key, newVal);
        }
    });
  },
  observe :function (key, val) {
    let ob = new Observer(val);
    if (!ob) return;
    ob.parent = {
        key,
        ob: this
    };
  },
  on: function(event,fn) {
    this._cbs = this._cbs || {};
    if (!this._cbs[event]) {
        this._cbs[event] = [];
    }
    this._cbs[event].push(fn);

    // 这里return this是为了实现.on(...).on(...)这样的级联调用
    return this;
  },
  emit: function (event, path, val) {
      this._cbs = this._cbs || {};
      let callbacks = this._cbs[event];
      if (!callbacks) return;
      callbacks = callbacks.slice(0);
      callbacks.forEach((cb, i) => {
          callbacks[i].apply(this, arguments);
      });
  },
  notify :function (event, path, val) {
      this.emit(event, path, val);
      let parent = this.parent;
      if (!parent) return;
      let ob = parent.ob;
      ob.notify(event, path, val);
  }

};



window.Vue = Vue;


})(window,document);
