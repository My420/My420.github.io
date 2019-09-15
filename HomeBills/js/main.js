'use strict';

( function() {
var kitchenNew = document.querySelector("#waterKitchen");
var kitchenPrev = document.querySelector("#waterKitchenPrev");
var bathNew = document.querySelector("#waterBath");
var bathPrev = document.querySelector("#waterBathPrev");
var waterTarif = document.querySelector("#waterTarif");
var waterCost = document.querySelector("#waterCost");
var waterCosPrev = document.querySelector("#waterCostPrev");
var buttonWater = document.querySelector("#buttonWater");


var electricityNew = document.querySelector("#electricity");
var electricityPrev = document.querySelector("#electricityPrev");
var electricityTarif = document.querySelector("#electricityTarif");
var electricityCost = document.querySelector("#electricityCost");
var electricityCosPrev = document.querySelector("#electricityCostPrev");
var buttonElectricity= document.querySelector("#buttonElectricity" );
var elAmount1 = document.querySelector("#electrNumber1");
var elCost1 = document.querySelector("#electrCost1");
var elAmount2 = document.querySelector("#electrNumber2");
var elCost2 = document.querySelector("#electrCost2");
var elAmount3 = document.querySelector("#electrNumber3");
var elCost3 = document.querySelector("#electrCost3");


var gasNew = document.querySelector("#gas");
var gasPrev = document.querySelector("#gasPrev");
var gasTarif = document.querySelector("#gasTarif");
var gasCost = document.querySelector("#gasCost");
var gasCosPrev = document.querySelector("#gasCostPrev");
var buttonGas = document.querySelector("#buttonGas");

var summ = document.querySelector("#totalCost");
var summPrev = document.querySelector("#totalCostPrev");
var buttonSumm = document.querySelector("#buttonSumm");
var buttonSave = document.querySelector("#buttonSave");

var currentValue = {
	new: 0,
	prev: 0,
	tarif: 0,
	cost: 0,	
};


var protectFromNull = function(target) {
	if(target === null){
		return 0;
	} else {
		return target;
	};
};


var getPrevValue = function() {
	kitchenPrev.value = protectFromNull(localStorage.getItem("kitchen"));
	bathPrev.value = protectFromNull(localStorage.getItem("bath"));
	waterCostPrev.value = protectFromNull(localStorage.getItem("waterCost"));
	electricityPrev.value = protectFromNull(localStorage.getItem("electricity"));
	electricityCostPrev.value = protectFromNull(localStorage.getItem("electricityCost"));
	gasPrev.value = protectFromNull(localStorage.getItem("gas"));
	gasCostPrev.value = protectFromNull(localStorage.getItem("gasCost"));
	summPrev.value = protectFromNull(localStorage.getItem("summ"));
};

var findElectricityTarif = function() {
	var calcItems = [0, 0, 0];
	var amount = currentValue.new - currentValue.prev;
	 if(amount <= 150) {
	 	calcItems = [amount, 0, 0];
	 } else if (amount <= 800) {
	 	calcItems = [150, amount - 150, 0];
	 } else {
	 	calcItems = [150, 650, amount - 800]
	 };
	 return calcItems;	
};

var calcElectricityCost = function(indication) {
	var result1 = +((indication[0] * 2.43).toFixed(2));	
	elAmount1.value = indication[0];
	elCost1.value = result1;
	var result2 = +((indication[1] * 3.04).toFixed(2));
	elAmount2.value = indication[1];
	elCost2.value = result2;
	var result3 = +((indication[2] * 4.95).toFixed(2));
	elAmount3.value = indication[2];
	elCost3.value = result3;
	return result1 + result2 + result3;
};

var calcValue = function (text) {	  
	switch (text) {
		case "water":
		currentValue.new = (+kitchenNew.value) + (+bathNew.value);	
		currentValue.prev = (+kitchenPrev.value) + (+bathPrev.value);
		currentValue.tarif = (+waterTarif.value);
		currentValue.cost = ((currentValue.new - currentValue.prev) * currentValue.tarif).toFixed(2);
		waterCost.value = currentValue.cost; 		
		break;
		case "electricity":
		currentValue.new = (+electricityNew.value);		
		currentValue.prev = (+electricityPrev.value);
		currentValue.cost = calcElectricityCost(findElectricityTarif());
		electricityCost.value = currentValue.cost;	
		break;
		case "gas":
		currentValue.new = (+gasNew.value);		
		currentValue.prev = (+gasPrev.value);
		currentValue.tarif = (+gasTarif.value);
		currentValue.cost = ((currentValue.new - currentValue.prev) * currentValue.tarif).toFixed(2);
		gasCost.value = currentValue.cost;		
		break; 		 				 
	};	
};


var calcSumm = function() {
	summ.value = (+waterCost.value) + (+electricityCost.value) +(+gasCost.value);
};

var saveResult = function () {
	localStorage.setItem("kitchen", kitchenNew.value);
	localStorage.setItem("bath", bathNew.value);
	localStorage.setItem("waterCost", waterCost.value);
	localStorage.setItem("electricity", electricityNew.value);
	localStorage.setItem("electricityCost", electricityCost.value);
	localStorage.setItem("gas", gasNew.value);
	localStorage.setItem("gasCost", gasCost.value);
	localStorage.setItem("summ", summ.value);
};

var playAnimation = function(target) {	
	var classPrev = target.getAttribute("class");
	target.setAttribute("class", classPrev + " blink");
	setTimeout( function() { 
		target.setAttribute("class", classPrev);
	    }, 1000);
};


getPrevValue();

buttonWater.addEventListener("click", function(evt) {
	evt.preventDefault();
	calcValue("water");
});

buttonElectricity.addEventListener("click", function(evt) {
	evt.preventDefault();
	calcValue("electricity");
});

buttonGas.addEventListener("click", function(evt) {
	evt.preventDefault();
	calcValue("gas");
});

buttonSumm.addEventListener("click", function(evt) {
	evt.preventDefault();
	calcSumm();
});

buttonSave.addEventListener("click", function(evt) {
	evt.preventDefault();
	saveResult();
	playAnimation(kitchenNew);
	playAnimation(bathNew);
	playAnimation(waterCost);
	playAnimation(electricityNew);
	playAnimation(electricityCost);
	playAnimation(gasNew);
	playAnimation(gasCost);
	playAnimation(summ);
});

})();