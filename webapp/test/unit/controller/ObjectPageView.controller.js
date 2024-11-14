/*global QUnit*/

sap.ui.define([
	"techenvo/objectpage/controller/ObjectPageView.controller"
], function (Controller) {
	"use strict";

	QUnit.module("ObjectPageView Controller");

	QUnit.test("I should test the ObjectPageView controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
