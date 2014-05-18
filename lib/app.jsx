var $ = require('jquery');
var React = require('react');
var ReactWM = require('reactwm');
var TermColors = require('termcolors');

var Importer = require('./components/importer');
var Exporter = require('./components/exporter');
var Editor = require('./components/editor');
var Template = require('./components/template');

var windows = new ReactWM.Manager();

$(function () {
  React.renderComponent(<ReactWM manager={windows} />, $('.content')[0]);

  $.get('templates/columns.html').then(function (content) {
    windows.open(<Template content={content} />, {
      id: 'template',
      title: 'Template > Columns',
      width: 300,
      height: 300,
      x: 20,
      y: 20
    });
  });
});

window.windows = windows;

var _oldStyles = null;
var injectStyles = function (rule) {
  if (_oldStyles) _oldStyles.remove();
  _oldStyles = $("<div />", {
    html: '&shy;<style>' + rule + '</style>', 
  }).appendTo("body");    
  return _oldStyles;
};

var state = {};

var importColors = function (colors) {
  state.colors = TermColors.defaults.fill(colors);
  render();
};

var render = function () {

  if (state.colors) {
    var css = TermColors.css.export(state.colors);
    injectStyles(css + [
      '.window .content{background: ' + state.colors.background.toHexString() + ' !important;}',
      '.window {background: ' + state.colors[0].toHexString() + ' !important;}',
      '.window .title{color: ' + state.colors.foreground.toHexString() + ' !important;}',
      'body {background: ' + state.colors.background.toHexString() + ' !important;}',
    ].join('\n'));
  }

  windows.open(<Importer onImport={importColors}/>, {
    id: 'importer',
    title: 'Importer',
    width: 400,
    height: 400,
    x: 20,
    y: 20
  });

  windows.open(<Exporter colors={state.colors}/>, {
    id: 'exporter',
    title: 'Exporter',
    width: 400,
    height: 400,
    x: 440,
    y: 20
  });

  windows.open(<Editor />, {
    id: 'editor', 
    title: 'Editor',
    width: 820,
    height: 400,
    x: 20,
    y: 440
  });

};

render();
