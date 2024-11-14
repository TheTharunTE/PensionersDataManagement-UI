sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/core/Fragment",
  "sap/ui/model/json/JSONModel",
  "sap/uxap/ObjectPageSection",
  "sap/ui/layout/form/SimpleForm",
  "sap/ui/model/odata/v4/ODataModel"
], function (Controller, MessageToast, Fragment, JSONModel) {
  "use strict";

  return Controller.extend("techenvo.objectpage.controller.App", {
    onInit: function () {
      var oModel = this.getView().getModel();
      oModel.setSizeLimit(500);
      this._addressInfo = structuredClone(oModel.getData().addressInfo);
      this._emails = oModel.getData().emails;
      this._phones = oModel.getData().phones;
      this._paymentInformationdetails = oModel.getData().paymentInformationdetails;
      this._formFragments = {};
      this._showDisplayFragments();
      oModel.attachRequestCompleted(function () {
       // this.byId('editAddress').setEnabled(true);
        //this.byId('editEmails').setEnabled(true);
       // this.byId('editContact').setEnabled(true);
       // this.byId('editPaymentDetails').setEnabled(true);
      }.bind(this));
      this.getView().setModel(oModel);
    },
    _showDisplayFragments: function () {
      this._showFormFragment("DisplayEmails", "emailsSection");
      this._showFormFragment("DisplayPhones", "phonesSection");
      this._showFormFragment("DisplayAddress", "addressSection");
      this._showFormFragment("DisplayPaymentDetails", "paymentDetailsSection");
    },
    _showFormFragment: function (sFragmentName, oObjectSection) {
      var oSection = this.byId(oObjectSection);
      if(oSection) {
        oSection.destroySubSections();
      }
      this._getFormFragment(sFragmentName).then(function (oObjectPageSubSection) {
        oSection.addSubSection(oObjectPageSubSection);
      });
    },
    _getFormFragment: function (sFragmentName) {
      return Fragment.load({
        name: "techenvo.objectpage.view." + sFragmentName,
        controller: this
      });
    },
    _resetData: function () {
      var oModel = this.getView().getModel();
      var oData = oModel.getData();
      oData = this._userdetails;
      oModel.setData(oData);
    },
    handleAddressEditPress: function () {
      //Saving the modal data locally
      this._originalAddressInfo = structuredClone(this.getView().getModel().getData().addressInfo);
      var oSection = this.byId("addressSection");
      oSection.destroySubSections();
      this._showFragments("Edit", "address");
    },
    handleAddAddress: function () {
      //Clone the data
      this._userDetails = Object.assign({}, this.getView().getModel().getData());
      this._addressInfo = this._userDetails.addressInfo;
      var newAddressFields = 
      {
        "addressType": "",
        "startDate": "",
        "country": "USA",
        "city": "",
        "county": null,
        "address1": null,
        "address2": null,
        "address3": null,
        "address4": null,
        "state": null,
        "providence": null
    };
    this._addressInfo.push(newAddressFields);
    var oSection = this.byId("addressSection");
    oSection.destroySubSections();
    this._showFragments("Edit", "address");
    },
    handleAddressCancelPress: function () {
      this.getView().getModel().getData().addressInfo = this._originalAddressInfo;
      this._showFragments("Display", "address");
    },
    handleAddressSavePress: function () {
      var oData = this.getView().getModel().getData();
      var payload = { "addressInfo" : oData.addressInfo }
      var aData = jQuery.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/rest/userdetailsservice/userdetails",
        dataType: "json",
        async: false,
        data: JSON.stringify(payload),
        success: function(data, textStatus, jqXHR) {
            console.log(data);
        }
        });
      this._showFragments("Display", "address");
    },
    handleDeleteAddress: function (oEvent) {
      var temp = this.getView().getModel().getData();
      this._userDetails = Object.assign({}, this.getView().getModel().getData());
      this._addressInfo = this._userDetails.addressInfo;
      //console.log(this.getView().getParent().getModel());
      var spath = oEvent.getSource().getBindingContext().getPath();
      this._addressInfo.splice(Number(spath.split("/")[2]),1);
      //var payload = { 
        //              "addressInfo" : oEvent.getSource().getBindingContext().getProperty(spath)};
      var payload = {"addressInfo": this._addressInfo};
      console.log(payload);
      var aData = jQuery.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/rest/userdetailsservice/deleteperaddress",
        dataType: "json",
        async: false,
        data: JSON.stringify(payload),
        success: function(data, textStatus, jqXHR) {
          this.getView().getModel().getData().addressInfo = this._addressInfo;
        }
        });
        this._showFormFragment("DisplayAddress", "addressSection");
    },
    handleEmailsEditPress: function () {
      //Clone the data
      this._originalEmailsInfo = structuredClone(this.getView().getModel().getData().emails);
      var oSubSection = this.byId("emailsSection").getSubSections()[0];
      oSubSection.destroyBlocks();
      this.byId("emailsSection").destroySubSections();
      this._showFragments("Edit", "emails");
    },
    handleEmailsCancelPress: function () {
      //Restore the data
      //this.byId("emailsSection").removeSubSection("emailsSubSectionedit");
      this.getView().getModel().getData().emails = this._originalEmailsInfo;
      this.byId("emailsSection").destroySubSections();
      this._showFragments("Display", "emails");
    },
    handleAddEmails: function () {
      //Clone the data
      this._userDetails = Object.assign({}, this.getView().getModel().getData());
      this._emails = this._userDetails.emails;
      var newEmailFields = 
      {
        "emailType": "",
        "emailAddress": "",
        "isPrimary": false
    };
    this._emails.push(newEmailFields);
    //var oSection = this.byId("emailsSection");
    //oSection.destroySubSections();
    this._showFragments("Edit", "emails");
    },
    handleDeleteEmails: function (oEvent) {
      this._userDetails = Object.assign({}, this.getView().getModel().getData());
      this._emails = this._userDetails.emails;
      //console.log(this.getView().getParent().getModel());
      var spath = oEvent.getSource().getBindingContext().getPath();
      //this._emails.splice(Number(spath.split("/")[2]),1);
      var payload = {"emails": this._emails[Number(spath.split("/")[2])]};
      var aData = jQuery.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/rest/userdetailsservice/deleteperemail",
        dataType: "json",
        async: false,
        data: JSON.stringify(payload)
        });
        this.getView().getModel().getData().emails = this._emails;
        this._showFormFragment("DisplayEmails", "emailsSection");
    },
    handleEmailsSavePress: function () {
      var oData = this.getView().getModel().getData();
      var payload = { "emails" : oData.emails }
      var aData = jQuery.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/rest/userdetailsservice/userdetails",
        dataType: "json",
        async: false,
        data: JSON.stringify(payload),
        /*success: function(data, textStatus, jqXHR) {
          this._showFragments("Display", "emails");
          //console.log(data);
        }*/
        });
       this._showFragments("Display", "emails");
    },
    handlePhonesEditPress: function () {
      //Clone the data
      this._originalPhonesInfo = structuredClone(this.getView().getModel().getData().phones);
      var oSubSection = this.byId("phonesSection").getSubSections()[0];
      oSubSection.destroyBlocks();
      this.byId("phonesSection").destroySubSections();
      this._showFragments("Edit", "phones");
    },
    handlePhonesCancelPress: function () {
      this.getView().getModel().getData().phones = this._originalPhonesInfo;
      this.byId("phonesSection").destroySubSections();
      this._showFragments("Display", "phones");
    },
    handleAddPhones: function () {
      //Clone the data
      this._userDetails = Object.assign({}, this.getView().getModel().getData());
      this._phones = this._userDetails.phones;
      var newPhoneFields = 
      {
        "phoneType": "",
        "extension": null,
        "areaCode": "",
        "phoneNumber": "",
        "countryCode": null,
        "isPrimary": false
      };
    this._phones.push(newPhoneFields);
    this._showFragments("Edit", "phones");
    },
    handleDeletePhones: function (oEvent) {
      this._userDetails = Object.assign({}, this.getView().getModel().getData());
      this._phones = this._userDetails.phones;
      var spath = oEvent.getSource().getBindingContext().getPath();
      var payload = {"phones": [this._phones[Number(spath.split("/")[2])]]};
      var aData = jQuery.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/rest/userdetailsservice/deleteperphone",
        dataType: "json",
        async: false,
        data: JSON.stringify(payload)
        });
        this._phones.splice(Number(spath.split("/")[2]),1);
        this.getView().getModel().getData().phones = this._phones;
        this._showFormFragment("DisplayPhones", "phonesSection");
    },
    handlePhonesSavePress: function () {
      var oData = this.getView().getModel().getData();
      var payload = { "phones" : oData.phones }
      var aData = jQuery.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/rest/userdetailsservice/userdetails",
        dataType: "json",
        async: false,
        data: JSON.stringify(payload),
        });
      this._showFragments("Display", "phones");
    },
    handlePaymentDetailsEditPress: function () {
      this._originalpaymentInformationdetails = structuredClone(this.getView().getModel().getData().paymentInformation.paymentInformationdetailV3);
      var oSubSection = this.byId("paymentDetailsSection").getSubSections()[0];
      oSubSection.destroyBlocks();
      this.byId("paymentDetailsSection").destroySubSections();
      this._showFragments("Edit", "paymentdetails");
    },
    handlePaymentDetailsCancelPress: function () {
      //Restore the data
      this.getView().getModel().getData().paymentInformation.paymentInformationdetailV3 = this._originalpaymentInformationdetails;
      this.byId("paymentDetailsSection").destroySubSections();
      this._showFragments("Display", "paymentdetails");
    },
    handleAddPaymentDetails: function () {
      //Clone the data
      this._userDetails = Object.assign({}, this.getView().getModel().getData());
      var newPaymentDetailsFields = 
      {
        "externalCode": null,
        "bankCountry": "",
        "bank": "",
        "payType": "",
        "accountOwner": "",
        "iban": null,
        "paymentMethod": "",
        "percent": null,
        "currency": "",
        "amount": null,
        "accountNumber": "",
        "routingNumber": "",
        "customPayType": null,
        "purpose": null
      };
      this._userDetails.paymentInformation.paymentInformationdetailV3.push(newPaymentDetailsFields);
    this._showFragments("Edit", "paymentdetails");
    },
    handleDeletePaymentDetails: function (oEvent) {
      this._userDetails = Object.assign({}, this.getView().getModel().getData());
      this._paymentInformationdetails = this._userDetails.paymentInformation.paymentInformationdetailV3;
      var spath = oEvent.getSource().getBindingContext().getPath();
      var payload = {"paymentInformationdetails": [this._paymentInformationdetails[Number(spath.split("/")[3])]]};
      var aData = jQuery.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/rest/userdetailsservice/deleteperpaymentdetails",
        dataType: "json",
        async: false,
        data: JSON.stringify(payload)
        });
        this._paymentInformationdetails.splice(Number(spath.split("/")[2]),1);
        this.getView().getModel().getData().paymentInformation.paymentInformationdetailV3 = this._paymentInformationdetails;
        this._showFragments("Display", "paymentdetails");
    },
    handlePaymentDetailsSavePress: function () {
      var oData = this.getView().getModel().getData();
      var payload = { "paymentInformation" : oData.paymentInformation }
      var aData = jQuery.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/rest/userdetailsservice/userdetails",
        dataType: "json",
        async: false,
        data: JSON.stringify(payload),
        });
      console.log('Test');
      this._showFragments("Display", "paymentdetails");
    },
    _showFragments: function (prefix, type) {
      if (type === "address") {
        this._showFormFragment(prefix+"Address", "addressSection");
      } else if (type === "emails") {
        this._showFormFragment(prefix+"Emails", "emailsSection");
      }  else if (type === "phones") {
        this._showFormFragment(prefix+"Phones", "phonesSection");
      } else if (type === "paymentdetails") {
        this._showFormFragment(prefix+"PaymentDetails", "paymentDetailsSection");
      }
    }
  });
}
);
