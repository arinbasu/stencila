'use strict';

var CodeEditorComponent = require('../../ui/CodeEditorComponent');

function ExecuteComponent() {
  props.codeProperty = 'source';
  props.languageProperty = 'language';
  ExecuteComponent.super.apply(this, arguments);
}

ExecuteComponent.Prototype = function() {

  var _super = ExecuteComponent.super.prototype;

  this.render = function($$) {
    return _super.render.call(this, $$)
      .addClass('sc-execute');
  };

};

CodeEditorComponent.extend(ExecuteComponent);

module.exports = ExecuteComponent;