/**
 * @license Licensed under the Apache License, Version 2.0 (the "License"):
 *          http://www.apache.org/licenses/LICENSE-2.0
 *
 * @fileoverview Description.
 */
'use strict';

var Bgpio = Bgpio || {};

Bgpio.workspace = null;
Bgpio.DEBUG = true;
Bgpio.PIN_COUNT = 26;

Bgpio.init = function () {
  Bgpio.workspace = Blockly.inject('blocklyDiv', {
      media: 'blockly/media/',
      toolbox: document.getElementById('toolbox')
  });
  Blockly.Xml.domToWorkspace(Bgpio.workspace,
      document.getElementById('startBlocks'));
  Bgpio.workspace.addChangeListener(Bgpio.renderPythonCode);

  Bgpio.clearJsConsole();
  Bgpio.WebSocket.init();
};

window.addEventListener('load', function load(event) {
  window.removeEventListener('load', load, false);
  Bgpio.init();
});

Bgpio.runMode = {
  selected: 0,
  types: ['Simulation', 'Execution'],
  getSelectedMode: function() { return this.types[this.selected]; },
  selectMode: function(id) { this.selected = id;  this.updateState_(); },
  selectNextMode:  function() {
        this.selected++;
        if (this.selected >= this.types.length) this.selected = 0;
        this.updateState_();
      },
  debugInit: Bgpio.JsInterpreter.debugInit,
  debugStep: Bgpio.JsInterpreter.debugStep,
  run: Bgpio.JsInterpreter.run,
  stop: Bgpio.JsInterpreter.stop,
  updateState_: function() {
        var modeText = document.getElementById('modeName');
        modeText.innerHTML = this.types[this.selected];
        var simulationContent = document.getElementById('simulationContentDiv');
        var executionContent = document.getElementById('executionContentDiv');
        if (this.selected === 0) {
          simulationContent.style.display = 'block';
          executionContent.style.display = 'none';
          this.debugInit = Bgpio.JsInterpreter.debugInit;
          this.debugStep = Bgpio.JsInterpreter.debugStep;
          this.run = Bgpio.JsInterpreter.run;
          this.stop = Bgpio.JsInterpreter.stop;
        } else {
          simulationContent.style.display = 'none';
          executionContent.style.display = 'block';
          this.debugInit = Bgpio.PythonInterpreter.debugInit;
          this.debugStep = Bgpio.PythonInterpreter.debugStep;
          this.run = Bgpio.PythonInterpreter.run;
          this.stop = Bgpio.PythonInterpreter.stop;
        }
      },
};

Bgpio.generateJavaScriptCode = function() {
  return Blockly.JavaScript.workspaceToCode(Bgpio.workspace);
};

Bgpio.generatePythonCode = function() {
  return Blockly.Python.workspaceToCode(Bgpio.workspace);
};

Bgpio.generateXml = function() {
  var xmlDom = Blockly.Xml.workspaceToDom(Bgpio.workspace);
  var xmlText = Blockly.Xml.domToPrettyText(xmlDom);
  return xmlText;
};

Bgpio.renderPythonCode = function() {
  // Only regenerate the code if a block is not being dragged
  if (Blockly.dragMode_ != 0) {
    return;
  }
  // Render Python Code with latest change highlight and syntax highlighting
  var pyPre = document.getElementById('pythonCodePre');
  pyPre.textContent = Bgpio.generatePythonCode();
  pyPre.innerHTML = prettyPrintOne(pyPre.innerHTML, 'py', false);
};

Bgpio.setPinDefaults = function() {
 for (var i = 1; i <= Bgpio.PIN_COUNT; i++) {
   document.getElementById('pin' + i).className = 'pinDefault';
 }
};

Bgpio.setPinDigital = function(pinNumber, isPinHigh) {
  var pin = document.getElementById('pin' + pinNumber);
  pin.className = isPinHigh ? 'pinDigitalHigh' : 'pinDigitalLow';
};

Bgpio.appendTextJsConsole = function(text) {
  var jsConsole = document.getElementById('jsConsolePre');
  jsConsole.textContent += text + '\n';
};

Bgpio.clearJsConsole = function(text) {
  var jsConsole = document.getElementById('jsConsolePre');
  jsConsole.textContent = 'Simulated print output.\n';
};
