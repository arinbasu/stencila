'use strict';

var oo = require('substance/util/oo');
var uuid = require('substance/util/uuid');
var Component = require('substance/ui/Component');
var TextPropertyEditor = require('substance/ui/TextPropertyEditor');
var $$ = Component.$$;

function CellComponent() {
  CellComponent.super.apply(this, arguments);
}

CellComponent.Prototype = function() {

  this.render = function() {
    var node = this.props.node;
    var el = $$('td');

    var isEditing = this.isEditing();
    el.addClass(isEditing ? 'edit' : 'display');

    if (this.state.selected) {
      el.addClass('selected');
    }

    if (!isEditing) {
      el.on('dblclick', this.onDblClick);
      el.on('click', this.onClick);
    }

    if (node) {
      var isExpression = node.isExpression();
      el.addClass(isExpression ? 'expression' : 'text');
      if (isEditing) {
        var editor = $$(TextPropertyEditor, {
          name: node.id,
          path: [node.id, 'content'],
          commands: []
        }).ref('editor');
        el.append(editor);
      } else {
        if (isExpression) {
          el.text(node.value);
        } else {
          el.text(node.content);
        }
      }
    } else {
      el.addClass('empty');
    }

    return el;
  };

  this.getNode = function() {
    return this.props.node;
  };

  this.getDocument = function() {
    return this.context.doc;
  };

  this.enableEditing = function() {
    if (!this.props.node) {
      var doc = this.getDocument();
      var node = {
        type: "sheet-cell",
        id: uuid(),
        row: new Number(this.attr('data-row')),
        col: new Number(this.attr('data-col'))
      };
      doc.transaction(function(tx) {
        tx.create(node);
      });
      node = doc.get(node.id);
      this.extendProps({ node: node });
    }
    this.extendState({ edit: true });
    this.initializeSelection();
    this.send('activatedCell', this);
  };

  this.disableEditing = function() {
    this.extendState({
      edit: false
    });
  };

  this.isEditing = function() {
    return this.state.edit;
  };

  this.initializeSelection = function() {
    var editor = this.refs.editor;
    if (editor) {
      editor.selectAll();
    }
  };

  this.onDblClick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.enableEditing();
  };

  this.onClick = function(e) {
    if (!this.isEditing()) {
      e.preventDefault();
      e.stopPropagation();
      this.send('selectedCell', this);
    }
  };

};

oo.inherit(CellComponent, Component);

module.exports = CellComponent;
