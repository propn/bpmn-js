'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */


var _ = require('lodash');

var fs = require('fs');

var modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');


describe('features/modeling - update properties', function() {

  var diagramXML = fs.readFileSync('test/fixtures/bpmn/conditions.bpmn', 'utf8');

  var testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  var updatedElements;

  beforeEach(inject(function(eventBus) {

    eventBus.on([ 'commandStack.execute', 'commandStack.revert' ], function() {
      updatedElements = [];
    });

    eventBus.on('element.changed', function(event) {
      updatedElements.push(event.element);
    });

  }));


  describe('should execute', function() {

    it('setting loop characteristics', inject(function(elementRegistry, modeling, moddle) {

      // given
      var loopCharacteristics = moddle.create('bpmn:MultiInstanceLoopCharacteristics');

      var taskShape = elementRegistry.get('ServiceTask_1');

      // when
      modeling.updateProperties(taskShape, { loopCharacteristics: loopCharacteristics });

      // then
      expect(taskShape.businessObject.loopCharacteristics).toBe(loopCharacteristics);


      // task shape got updated
      expect(updatedElements).toContain(taskShape);
    }));


    it('updating default flow', inject(function(elementRegistry, modeling) {

      // given
      var gatewayShape = elementRegistry.get('ExclusiveGateway_1');

      // when
      modeling.updateProperties(gatewayShape, { 'default': undefined });

      // then
      expect(gatewayShape.businessObject['default']).not.toBeDefined();

      // flow got updated, too
      expect(updatedElements).toContain(elementRegistry.get('SequenceFlow_1'));
    }));


    it('updating label', inject(function(elementRegistry, modeling) {

      // given
      var flowConnection = elementRegistry.get('SequenceFlow_1');

      // when
      modeling.updateProperties(flowConnection, { name: 'FOO BAR' });

      // then
      expect(flowConnection.businessObject.name).toBe('FOO BAR');

      // flow label got updated, too
      expect(updatedElements).toContain(elementRegistry.get('SequenceFlow_1_label'));
    }));

  });


  describe('should undo', function() {

    it('setting loop characteristics', inject(function(elementRegistry, modeling, commandStack, moddle) {

      // given
      var loopCharactersistics = moddle.create('bpmn:MultiInstanceLoopCharacteristics');

      var taskShape = elementRegistry.get('ServiceTask_1');

      // when
      modeling.updateProperties(taskShape, { loopCharacteristics: loopCharactersistics });
      commandStack.undo();

      // then
      expect(taskShape.businessObject.loopCharactersistics).not.toBeDefined();
    }));


    it('updating default flow', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var gatewayShape = elementRegistry.get('ExclusiveGateway_1');

      // when
      modeling.updateProperties(gatewayShape, { 'default': undefined });
      commandStack.undo();

      // then
      expect(gatewayShape.businessObject['default']).toBeDefined();

      // flow got updated, too
      expect(updatedElements).toContain(elementRegistry.get('SequenceFlow_1'));
    }));


    it('updating name', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var flowConnection = elementRegistry.get('SequenceFlow_1');

      // when
      modeling.updateProperties(flowConnection, { name: 'FOO BAR' });
      commandStack.undo();

      // then
      expect(flowConnection.businessObject.name).toBe('default');

      // flow got updated, too
      expect(updatedElements).toContain(elementRegistry.get('SequenceFlow_1_label'));
    }));

  });


  describe('should redo', function() {

    it('setting loop characteristics', inject(function(elementRegistry, modeling, commandStack, moddle) {

      // given
      var loopCharacteristics = moddle.create('bpmn:MultiInstanceLoopCharacteristics');

      var taskShape = elementRegistry.get('ServiceTask_1');

      // when
      modeling.updateProperties(taskShape, { loopCharacteristics: loopCharacteristics });
      commandStack.undo();
      commandStack.redo();

      // then
      expect(taskShape.businessObject.loopCharacteristics).toBe(loopCharacteristics);
    }));


    it('updating default flow', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var gatewayShape = elementRegistry.get('ExclusiveGateway_1');

      // when
      modeling.updateProperties(gatewayShape, { 'default': undefined });
      commandStack.undo();
      commandStack.redo();

      // then
      expect(gatewayShape.businessObject['default']).not.toBeDefined();

      // flow got updated, too
      expect(updatedElements).toContain(elementRegistry.get('SequenceFlow_1'));
    }));


    it('updating name', inject(function(elementRegistry, commandStack, modeling) {

      // given
      var flowConnection = elementRegistry.get('SequenceFlow_1');

      // when
      modeling.updateProperties(flowConnection, { name: 'FOO BAR' });
      commandStack.undo();
      commandStack.redo();

      // then
      expect(flowConnection.businessObject.name).toBe('FOO BAR');

      // flow got updated, too
      expect(updatedElements).toContain(elementRegistry.get('SequenceFlow_1_label'));
    }));

  });

});
