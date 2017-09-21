var vacEff = 0.536169484;
var asympProb = 0.3;

var transmissionRate = 0.043;
var transmissionRate2 = 0.00092;
var transmissionRate3 = 0.021;
var trAmp = 0.85;


var fillCount = 0;

//Proportion of time contacts by age group taken from Zagheni et al (2008)
var timeProp1 = 904/15501;
var timeProp2 = 841/15501;
var timeProp3 = 1077/15501;
var timeProp4 = 1190/15501;
var timeProp5 = 1190/15501;
var timeProp6 = 1071/15501;
var timeProp7 = 927/15501;
var timeProp8 = 822/15501;


var popArr = [];
var t = [];

var realizations = 50;
var simuLen = 56;

// Person class and methods
var Person = function (ageGroup, gender) {
	var r = Math.random();
	
	this.isMale = true;
	if(gender==1){this.isMale = false;}
	
	this.ageGroup = ageGroup;
	
	this.daysInfected = 0;
	
	this.isInfected = false;
	this.isAsymptomatic = false;
	this.isRecovered = false;
	this.wasSymptomatic = false;
	this.isVaccinated = false;
	this.isnoneffVaccinated = false;
	if(r < 0.3){this.isImmune = true; this.isSusceptible = false;}
	else{this.isImmune = false; this.isSusceptible = true;}
};

Person.prototype.reset = function() {
	var r = Math.random();
	
	this.daysInfected = 0;
	
	this.isInfected = false;
	this.isAsymptomatic = false;
	this.isRecovered = false;
	this.wasSymptomatic = false;
	this.isVaccinated = false;
	this.isnoneffVaccinated = false;
	if(r < 0.3){this.isImmune = true; this.isSusceptible = false;}
	else{this.isImmune = false; this.isSusceptible = true;}
	
};


Person.prototype.becomeInfected = function() {
	this.isSusceptible = false;
	var r = Math.random();
	if(r < asympProb){this.isAsymptomatic = true;}
	else{this.isInfected = true; this.wasSymptomatic = true;}
	
};


Person.prototype.recover = function() {
	this.isInfected = false;
	this.isAsymptomatic = false;
	this.isRecovered = true;
	this.isSusceptible = false;
	
};

Person.prototype.potentialInfectWork = function(numInf, numInf2, numInfTot2, d, hrs, roomSize, infCountTot, commTime, totSize) {
	var r = Math.random();

	var amp = 1.0 + trAmp*Math.cos(2*Math.PI*(d+40)/60.0);
	
	var pOffice = Math.exp(-amp *transmissionRate*(0.5*numInf + 0.3*numInf2)/roomSize);
	var pComm = Math.exp(-amp * transmissionRate*(0.5*infCountTot + 0.3*numInfTot2)/totSize);
	
	if(this.isMale){var infProb =  ( 1.0 - ( Math.pow(pOffice,hrs)*Math.pow(pComm,commTime) ) );}
	else{var infProb = 1.0* ( 1.0 - ( Math.pow(pOffice,hrs)*Math.pow(pComm,commTime) ) );}
	
	if(r < infProb){
		this.becomeInfected();
	}
};


Person.prototype.potentialInfectComm = function(age, d) {
	var r = Math.random();

	var amp = 1.0 + trAmp*Math.cos(2*Math.PI*(d+40)/60.0);
	var mixRate = 0;
	if(age == 1){mixRate = amp *transmissionRate3*timeProp1;}
	else if(age == 2){mixRate = amp *transmissionRate3*timeProp2;}
	else if(age == 3){mixRate = amp *transmissionRate3*timeProp3;}
	else if(age == 4){mixRate = amp *transmissionRate3*timeProp4;}
	else if(age == 5){mixRate = amp *transmissionRate3*timeProp5;}
	else if(age == 6){mixRate = amp *transmissionRate3*timeProp6;}
	else if(age == 7){mixRate = amp *transmissionRate3*timeProp7;}
	else if(age == 8){mixRate = amp *transmissionRate3*timeProp8;}
	
	if(this.isMale){var infProb =  ( mixRate );}
	else{var infProb = (1.0* mixRate );}
	
	if(r < infProb){
		this.becomeInfected();
	}
};


Person.prototype.potentialInfectHome = function(d, famSize, bgVac) {
	var r = Math.random();
	var infProb = 0;

	var amp = 1.0 + trAmp*Math.cos(2*Math.PI*(d+40)/60.0);
	
	var homeExposure = ( (1-bgVac)*famSize + (1-vacEff)*bgVac*famSize );
	
	if(this.isMale){infProb =  (1 - Math.exp(-amp *transmissionRate2*homeExposure));}
	else{infProb = 1.0* (1 - Math.exp(-amp *transmissionRate2*homeExposure));}
	
	
	if(r < infProb){
		this.becomeInfected();
	}
};

Person.prototype.potentialRecover = function() {
	this.daysInfected++;
	
	if(this.daysInfected == 5){
		this.recover();
	}
};

Person.prototype.vaccinate = function() {
	var r = Math.random();
	
	if(r < vacEff){this.isVaccinated = true; this.isSusceptible = false; this.immune = true;}
	else{this.isnoneffVaccinated = true;}
};

Person.prototype.isM = function() {
	return this.isMale;
};

Person.prototype.isnoneffVac = function() {
	return this.isnoneffVaccinated;
};

Person.prototype.isInf = function() {
	return this.isInfected;
};

Person.prototype.isAsymp = function() {
	return this.isAsymptomatic;
};

Person.prototype.wasSymp = function() {
	return this.wasSymptomatic;
};

Person.prototype.isSusc = function() {
	return this.isSusceptible;
};

Person.prototype.isRec = function() {
	return this.isRecovered;
};

Person.prototype.isVac = function() {
	return this.isVaccinated;
};

Person.prototype.isIm = function() {
	return this.isImmune;
};

Person.prototype.getAge = function() {
	return this.ageGroup;
};



// End Person class and methods


// When 'Calculate' is pressed:
function buttonClicked() {
	
    var totEmployees = parseInt(document.getElementById("textFieldTotEmp").value);
 
 	if(isNaN(parseInt(document.getElementById("textFieldTotEmp").value))){
		window.confirm("Please correctly complete all fields.");
		return;
	}
 
 	var numEmployees = parseInt(document.getElementById("textField1").value);
 	numEmployees += parseInt(document.getElementById("textField2").value);
 	numEmployees += parseInt(document.getElementById("textField3").value);
 	numEmployees += parseInt(document.getElementById("textField4").value);
 	numEmployees += parseInt(document.getElementById("textField5").value);
 	numEmployees += parseInt(document.getElementById("textField6").value);
 	numEmployees += parseInt(document.getElementById("textField7").value);
 	numEmployees += parseInt(document.getElementById("textField8").value);
 	numEmployees += parseInt(document.getElementById("textField9").value);
 	numEmployees += parseInt(document.getElementById("textField10").value);
 	numEmployees += parseInt(document.getElementById("textField11").value);
 	numEmployees += parseInt(document.getElementById("textField12").value);
 	numEmployees += parseInt(document.getElementById("textField13").value);
 	numEmployees += parseInt(document.getElementById("textField14").value);
 	numEmployees += parseInt(document.getElementById("textField15").value);
 	numEmployees += parseInt(document.getElementById("textField16").value);
 	
 	if(totEmployees != numEmployees){
		window.confirm("Total employees must equal the total from all age groups.");
		return;
	}
 	
 	if(numEmployees <= 100){realizations = 200;}
 	else if(numEmployees > 100 && numEmployees <= 200){realizations = 100;}
    else if(numEmployees > 200 && numEmployees < 500){realizations = 60;}
    else if(numEmployees >= 500 && numEmployees < 800){realizations = 30;}
    else if(numEmployees >= 800 && numEmployees < 1000){realizations = 20;}
 	else{realizations = 10;}
 
 	var cost = parseFloat(document.getElementById("textFieldCost").value);
 	var vacCost = parseFloat(document.getElementById("textFieldVacCost").value);
 	
 	var vacGroup1 = parseInt(document.getElementById("textFieldVac1").value) ;
 	if(isNaN(parseInt(document.getElementById("textFieldVac1").value))){
		window.confirm("Please correctly complete all fields.");
		return;
	}
 	if(parseInt(document.getElementById("textFieldVac1").value) > 100 || parseInt(document.getElementById("textFieldVac1").value) < 0){
 		window.confirm("Vaccination coverage values must be between 0 and 100.");
		return;
 	}
 	var vacGroup2 = parseInt(document.getElementById("textFieldVac2").value) ;
 	if(isNaN(parseInt(document.getElementById("textFieldVac2").value))){
		window.confirm("Please correctly complete all fields.");
		return;
	}
 	if(parseInt(document.getElementById("textFieldVac2").value) > 100 || parseInt(document.getElementById("textFieldVac2").value) < 0){
 		window.confirm("Vaccination coverage values must be between 0 and 100.");
		return;
 	}
 	var vacGroup3 = parseInt(document.getElementById("textFieldVac3").value) ;
 	if(isNaN(parseInt(document.getElementById("textFieldVac3").value))){
		window.confirm("Please correctly complete all fields.");
		return;
	}
 	if(parseInt(document.getElementById("textFieldVac3").value) > 100 || parseInt(document.getElementById("textFieldVac3").value) < 0){
 		window.confirm("Vaccination coverage values must be between 0 and 100.");
		return;
 	}
 	var vacGroup4 = parseInt(document.getElementById("textFieldVac4").value) ;
 	if(isNaN(parseInt(document.getElementById("textFieldVac4").value))){
		window.confirm("Please correctly complete all fields.");
		return;
	}
 	if(parseInt(document.getElementById("textFieldVac4").value) > 100 || parseInt(document.getElementById("textFieldVac4").value) < 0){
 		window.confirm("Vaccination coverage values must be between 0 and 100.");
		return;
 	}
 	var vacGroup5 = parseInt(document.getElementById("textFieldVac5").value) ;
 	if(isNaN(parseInt(document.getElementById("textFieldVac5").value))){
		window.confirm("Please correctly complete all fields.");
		return;
	}
 	if(parseInt(document.getElementById("textFieldVac5").value) > 100 || parseInt(document.getElementById("textFieldVac5").value) < 0){
 		window.confirm("Vaccination coverage values must be between 0 and 100.");
		return;
 	}
 	var vacGroup6 = parseInt(document.getElementById("textFieldVac6").value) ;
 	if(isNaN(parseInt(document.getElementById("textFieldVac6").value))){
		window.confirm("Please correctly complete all fields.");
		return;
	}
 	if(parseInt(document.getElementById("textFieldVac6").value) > 100 || parseInt(document.getElementById("textFieldVac6").value) < 0){
 		window.confirm("Vaccination coverage values must be between 0 and 100.");
		return;
 	}
 	var vacGroup7 = parseInt(document.getElementById("textFieldVac7").value) ;
 	if(isNaN(parseInt(document.getElementById("textFieldVac7").value))){
		window.confirm("Please correctly complete all fields.");
		return;
	}
 	if(parseInt(document.getElementById("textFieldVac7").value) > 100 || parseInt(document.getElementById("textFieldVac7").value) < 0){
 		window.confirm("Vaccination coverage values must be between 0 and 100.");
		return;
 	}
 	var vacGroup8 = parseInt(document.getElementById("textFieldVac8").value) ;
 	if(isNaN(parseInt(document.getElementById("textFieldVac8").value))){
		window.confirm("Please correctly complete all fields.");
		return;
	}
 	if(parseInt(document.getElementById("textFieldVac8").value) > 100 || parseInt(document.getElementById("textFieldVac8").value) < 0){
 		window.confirm("Vaccination coverage values must be between 0 and 100.");
		return;
 	}
 	
 	// Baseline Vac
 	var bvacGroup1 = parseInt(document.getElementById("textFieldBVac1").value) ;
 	if(isNaN(parseInt(document.getElementById("textFieldBVac1").value))){
		window.confirm("Please correctly complete all fields.");
		return;
	}
 	if(parseInt(document.getElementById("textFieldBVac1").value) > 100 || parseInt(document.getElementById("textFieldBVac1").value) < 0){
 		window.confirm("Vaccination coverage values must be between 0 and 100.");
		return;
 	}
 	var bvacGroup2 = parseInt(document.getElementById("textFieldBVac2").value) ;
 	if(isNaN(parseInt(document.getElementById("textFieldBVac2").value))){
		window.confirm("Please correctly complete all fields.");
		return;
	}
 	if(parseInt(document.getElementById("textFieldBVac2").value) > 100 || parseInt(document.getElementById("textFieldBVac2").value) < 0){
 		window.confirm("Vaccination coverage values must be between 0 and 100.");
		return;
 	}
 	var bvacGroup3 = parseInt(document.getElementById("textFieldBVac3").value) ;
 	if(isNaN(parseInt(document.getElementById("textFieldBVac3").value))){
		window.confirm("Please correctly complete all fields.");
		return;
	}
 	if(parseInt(document.getElementById("textFieldBVac3").value) > 100 || parseInt(document.getElementById("textFieldBVac3").value) < 0){
 		window.confirm("Vaccination coverage values must be between 0 and 100.");
		return;
 	}
 	var bvacGroup4 = parseInt(document.getElementById("textFieldBVac4").value) ;
 	if(isNaN(parseInt(document.getElementById("textFieldBVac4").value))){
		window.confirm("Please correctly complete all fields.");
		return;
	}
 	if(parseInt(document.getElementById("textFieldBVac4").value) > 100 || parseInt(document.getElementById("textFieldBVac4").value) < 0){
 		window.confirm("Vaccination coverage values must be between 0 and 100.");
		return;
 	}
 	var bvacGroup5 = parseInt(document.getElementById("textFieldBVac5").value) ;
 	if(isNaN(parseInt(document.getElementById("textFieldBVac5").value))){
		window.confirm("Please correctly complete all fields.");
		return;
	}
 	if(parseInt(document.getElementById("textFieldBVac5").value) > 100 || parseInt(document.getElementById("textFieldBVac5").value) < 0){
 		window.confirm("Vaccination coverage values must be between 0 and 100.");
		return;
 	}
 	var bvacGroup6 = parseInt(document.getElementById("textFieldBVac6").value) ;
 	if(isNaN(parseInt(document.getElementById("textFieldBVac6").value))){
		window.confirm("Please correctly complete all fields.");
		return;
	}
 	if(parseInt(document.getElementById("textFieldBVac6").value) > 100 || parseInt(document.getElementById("textFieldBVac6").value) < 0){
 		window.confirm("Vaccination coverage values must be between 0 and 100.");
		return;
 	}
 	var bvacGroup7 = parseInt(document.getElementById("textFieldBVac7").value) ;
 	if(isNaN(parseInt(document.getElementById("textFieldBVac7").value))){
		window.confirm("Please correctly complete all fields.");
		return;
	}
 	if(parseInt(document.getElementById("textFieldBVac7").value) > 100 || parseInt(document.getElementById("textFieldBVac7").value) < 0){
 		window.confirm("Vaccination coverage values must be between 0 and 100.");
		return;
 	}
 	var bvacGroup8 = parseInt(document.getElementById("textFieldBVac8").value) ;
 	if(isNaN(parseInt(document.getElementById("textFieldBVac8").value))){
		window.confirm("Please correctly complete all fields.");
		return;
	}
 	if(parseInt(document.getElementById("textFieldBVac8").value) > 100 || parseInt(document.getElementById("textFieldBVac8").value) < 0){
 		window.confirm("Vaccination coverage values must be between 0 and 100.");
		return;
 	}
 	
 	var numEmployees40 = numEmployees;
 	
 	var timeSeries0 = [];
 	var timeSeries100 = [];
 	for(var i = 0 ; i < realizations ; i++){
 		timeSeries0.push([]);
 		timeSeries100.push([]);
 	}
 	
	var costOfVaccinating = 0;
	var costOfVaccinatingB = 0;
 	
 	popArr = [];
 	var len = parseInt(document.getElementById("textField1").value);
 	if(isNaN(len)){
		window.confirm("Please correctly complete all fields.");
		return;
	}
 	
 	if(vacGroup1 > -1){costOfVaccinating += vacGroup1*0.01*len; costOfVaccinatingB += bvacGroup1*0.01*len;}	
	for (var i = 0; i < len; i++) {
		popArr.push(new Person(1,0));
	}
	len = parseInt(document.getElementById("textField2").value);
	if(isNaN(len)){
		window.confirm("Please correctly complete all fields.");
		return;
	}
	if(vacGroup1 > -1){costOfVaccinating += vacGroup1*0.01*len; costOfVaccinatingB += bvacGroup1*0.01*len;}
	for (var i = 0; i < len; i++) {
		popArr.push(new Person(1,1));
	}
	len = parseInt(document.getElementById("textField3").value);
	if(isNaN(len)){
		window.confirm("Please correctly complete all fields.");
		return;
	}
	if(vacGroup2 > -1){costOfVaccinating += vacGroup2*0.01*len; costOfVaccinatingB += bvacGroup2*0.01*len;}
	for (var i = 0; i < len; i++) {
		popArr.push(new Person(2,0));
	}
	len = parseInt(document.getElementById("textField4").value);
	if(isNaN(len)){
		window.confirm("Please correctly complete all fields.");
		return;
	}
	if(vacGroup2 > -1){costOfVaccinating += vacGroup2*0.01*len; costOfVaccinatingB += bvacGroup2*0.01*len;}
	for (var i = 0; i < len; i++) {
		popArr.push(new Person(2,1));
	}
	len = parseInt(document.getElementById("textField5").value);
	if(isNaN(len)){
		window.confirm("Please correctly complete all fields.");
		return;
	}
	if(vacGroup3 > -1){costOfVaccinating += vacGroup3*0.01*len; costOfVaccinatingB += bvacGroup3*0.01*len;}
	for (var i = 0; i < len; i++) {
		popArr.push(new Person(3,0));
	}
	len = parseInt(document.getElementById("textField6").value);
	if(isNaN(len)){
		window.confirm("Please correctly complete all fields.");
		return;
	}
	if(vacGroup3 > -1){costOfVaccinating += vacGroup3*0.01*len; costOfVaccinatingB += bvacGroup3*0.01*len;}
	for (var i = 0; i < len; i++) {
		popArr.push(new Person(3,1));
	}
	len = parseInt(document.getElementById("textField7").value);
	if(isNaN(len)){
		window.confirm("Please correctly complete all fields.");
		return;
	}
	if(vacGroup4 > -1){costOfVaccinating += vacGroup4*0.01*len; costOfVaccinatingB += bvacGroup4*0.01*len;}
	for (var i = 0; i < len; i++) {
		popArr.push(new Person(4,0));
	}
	len = parseInt(document.getElementById("textField8").value);
	if(isNaN(len)){
		window.confirm("Please correctly complete all fields.");
		return;
	}
	if(vacGroup4 > -1){costOfVaccinating += vacGroup4*0.01*len; costOfVaccinatingB += bvacGroup4*0.01*len;}
	for (var i = 0; i < len; i++) {
		popArr.push(new Person(4,1));
	}
	len = parseInt(document.getElementById("textField9").value);
	if(isNaN(len)){
		window.confirm("Please correctly complete all fields.");
		return;
	}
	if(vacGroup5 > -1){costOfVaccinating += vacGroup5*0.01*len; costOfVaccinatingB += bvacGroup5*0.01*len;}
	for (var i = 0; i < len; i++) {
		popArr.push(new Person(5,0));
	}
	len = parseInt(document.getElementById("textField10").value);
	if(isNaN(len)){
		window.confirm("Please correctly complete all fields.");
		return;
	}
	if(vacGroup5 > -1){costOfVaccinating += vacGroup5*0.01*len; costOfVaccinatingB += bvacGroup5*0.01*len;}
	for (var i = 0; i < len; i++) {
		popArr.push(new Person(5,1));
	}
	len = parseInt(document.getElementById("textField11").value);
	if(isNaN(len)){
		window.confirm("Please correctly complete all fields.");
		return;
	}
	if(vacGroup6 > -1){costOfVaccinating += vacGroup6*0.01*len; costOfVaccinatingB += bvacGroup6*0.01*len;}
	for (var i = 0; i < len; i++) {
		popArr.push(new Person(6,0));
	}
	len = parseInt(document.getElementById("textField12").value);
	if(isNaN(len)){
		window.confirm("Please correctly complete all fields.");
		return;
	}
	if(vacGroup6 > -1){costOfVaccinating += vacGroup6*0.01*len; costOfVaccinatingB += bvacGroup6*0.01*len;}
	for (var i = 0; i < len; i++) {
		popArr.push(new Person(6,1));
	}
	len = parseInt(document.getElementById("textField13").value);
	if(isNaN(len)){
		window.confirm("Please correctly complete all fields.");
		return;
	}
	if(vacGroup7 > -1){costOfVaccinating += vacGroup7*0.01*len; costOfVaccinatingB += bvacGroup7*0.01*len;}
	for (var i = 0; i < len; i++) {
		popArr.push(new Person(7,0));
	}
	len = parseInt(document.getElementById("textField14").value);
	if(isNaN(len)){
		window.confirm("Please correctly complete all fields.");
		return;
	}
	if(vacGroup7 > -1){costOfVaccinating += vacGroup7*0.01*len; costOfVaccinatingB += bvacGroup7*0.01*len;}
	for (var i = 0; i < len; i++) {
		popArr.push(new Person(7,1));
	}
	len = parseInt(document.getElementById("textField15").value);
	if(isNaN(len)){
		window.confirm("Please correctly complete all fields.");
		return;
	}
	if(vacGroup8 > -1){costOfVaccinating += vacGroup8*0.01*len; costOfVaccinatingB += bvacGroup8*0.01*len;}
	for (var i = 0; i < len; i++) {
		popArr.push(new Person(8,0));
	}
	len = parseInt(document.getElementById("textField16").value);
	if(isNaN(len)){
		window.confirm("Please correctly complete all fields.");
		return;
	}
	if(vacGroup8 > -1){costOfVaccinating += vacGroup8*0.01*len; costOfVaccinatingB += bvacGroup8*0.01*len;}
	for (var i = 0; i < len; i++) {
		popArr.push(new Person(8,1));
	}
	
	costOfVaccinating = costOfVaccinating*vacCost;
	costOfVaccinatingB = costOfVaccinatingB*vacCost;
	
	shuffle(popArr);
	
	var homeSize = [];
	homeSize.push(parseInt(document.getElementById("textFieldFam1").value));
	if(isNaN(parseFloat(document.getElementById("textFieldFam1").value))){
		window.confirm("Please correctly complete all fields.");
		return;
	}
	homeSize.push(parseInt(document.getElementById("textFieldFam2").value));
	if(isNaN(parseFloat(document.getElementById("textFieldFam2").value))){
		window.confirm("Please correctly complete all fields.");
		return;
	}
	homeSize.push(parseInt(document.getElementById("textFieldFam3").value));
	if(isNaN(parseFloat(document.getElementById("textFieldFam3").value))){
		window.confirm("Please correctly complete all fields.");
		return;
	}
	homeSize.push(parseInt(document.getElementById("textFieldFam4").value));
	if(isNaN(parseFloat(document.getElementById("textFieldFam4").value))){
		window.confirm("Please correctly complete all fields.");
		return;
	}
	homeSize.push(parseInt(document.getElementById("textFieldFam5").value));
	if(isNaN(parseFloat(document.getElementById("textFieldFam5").value))){
		window.confirm("Please correctly complete all fields.");
		return;
	}
	homeSize.push(parseInt(document.getElementById("textFieldFam6").value));
	if(isNaN(parseFloat(document.getElementById("textFieldFam6").value))){
		window.confirm("Please correctly complete all fields.");
		return;
	}
	homeSize.push(parseInt(document.getElementById("textFieldFam7").value));
	if(isNaN(parseFloat(document.getElementById("textFieldFam7").value))){
		window.confirm("Please correctly complete all fields.");
		return;
	}
	homeSize.push(parseInt(document.getElementById("textFieldFam8").value));
	if(isNaN(parseFloat(document.getElementById("textFieldFam8").value))){
		window.confirm("Please correctly complete all fields.");
		return;
	}
	
	
	var numRooms = parseInt(document.getElementById("textFieldRooms").value);
	var numPerRoom = document.getElementById("textFieldRoomSize").value.split(/[,]+/);
	numPerRoom.clean('');
	numPerRoom.clean(' ');
	numPerRoom.clean(undefined);
	
	for(var i = 0; i < numPerRoom.length ; i++){
		if(isNaN(parseInt(numPerRoom[i])) || numPerRoom[i] == undefined || numPerRoom[i] == ''){
			window.confirm("Number of employees per room is not input correctly, please revise and check for extra trailing commas, letters, etc...");
			return;
		}
	}
	
	var timePerRoom = document.getElementById("textFieldRoomTime").value.split(/[,]+/);
	timePerRoom.clean('');
	timePerRoom.clean(' ');
	timePerRoom.clean(undefined);
	
	for(var i = 0; i < timePerRoom.length ; i++){
		if(isNaN(parseFloat(timePerRoom[i])) || timePerRoom[i] == undefined || timePerRoom[i] == ''){
			window.confirm("Average times employees spend in each room is not input correctly, please revise and check for extra trailing commas, letters, etc...");
			return;
		}
	}

	
	var backgroundVac = parseInt(document.getElementById("backgroundVac").value)*0.01;
	
	var commonRoomTime = parseFloat(document.getElementById("commonRoomTime").value); 
	
	
	// Checking for user input errors:
	if(isNaN(cost) || isNaN(vacCost) || isNaN(numRooms) || isNaN(backgroundVac) || isNaN(commonRoomTime) ){
		window.confirm("Please correctly complete all fields.");
		return;
	}
	
	if(backgroundVac > 1 || backgroundVac < 0){
		window.confirm("Vaccination coverage must be a value between 0 and 100.");
		return;
	}
	
	var totEmployeeCheck = 0;
	for(var i = 0 ; i < numPerRoom.length ; i++){
		totEmployeeCheck = totEmployeeCheck + parseInt(numPerRoom[i]);
	}
	if(totEmployeeCheck != numEmployees){
		window.confirm("Total employees must match the total number in all rooms.");
		return;
	}
	
	if(numRooms != numPerRoom.length){
		window.confirm("Number of room size entries and number of rooms must be equal.");
		return;
	}
	if(numPerRoom.length != timePerRoom.length){
		window.confirm("Room size entries and average time per room must be the same length.");
		return;
	}
	
	var sizeCheck = 0;
	for(var i = 0; i < numPerRoom.length ; i++){
		sizeCheck = sizeCheck + parseInt(numPerRoom[i]);
	}
	if(sizeCheck != numEmployees){
		window.confirm("Number of employees in all rooms must equal the total number of employees.");
		return;
	}
	
	
	
	/////////////////*********************** Baseline Vaccination *************************/////////////////////
	var statusArrB = [];
	for(var i = 0 ; i < popArr.length ; i++){
		statusArrB.push([]);
	}
	
	var totInfectedArr = [];
	var totCostArr = [];
	var totvacCostArr = [];
	var totnonvacCostArr = [];
	
	var vacInfArr = [];
	var nonvacInfArr = [];
	
	var absdayarr = [];
	
	var totathomeinfected = [];
	var totatworkinfected = [];
	var totatcomminfected = [];
	var toteverywhere = [];
	
	for(var run = 0 ; run < realizations ; run++){
		var workinfcount = 0;
		var homeinfcount = 0;
		var comminfcount = 0;
		var allinfcount = 0;
		for(var i = 0 ; i < numEmployees ; i++){
			popArr[i].reset();
			//popArr[i].vaccinate();
			var vacProb = Math.random();
			if(popArr[i].getAge() == 1){
				if(vacProb < bvacGroup1*0.01){popArr[i].vaccinate();}
			}
			else if(popArr[i].getAge() == 2){
				if(vacProb < bvacGroup2*0.01){popArr[i].vaccinate();}
			}
			else if(popArr[i].getAge() == 3){
				if(vacProb < bvacGroup3*0.01){popArr[i].vaccinate();}
			}
			else if(popArr[i].getAge() == 4){
				if(vacProb < bvacGroup4*0.01){popArr[i].vaccinate();}
			}
			else if(popArr[i].getAge() == 5){
				if(vacProb < bvacGroup5*0.01){popArr[i].vaccinate();}
			}
			else if(popArr[i].getAge() == 6){
				if(vacProb < bvacGroup6*0.01){popArr[i].vaccinate();}
			}
			else if(popArr[i].getAge() == 7){
				if(vacProb < bvacGroup7*0.01){popArr[i].vaccinate();}
			}
			else if(popArr[i].getAge() == 8){
				if(vacProb < bvacGroup8*0.01){popArr[i].vaccinate();}
			}
			
		}
		
		var statarrcountB = 0;
		for( var day = 0 ; day < simuLen ; day++){
			
			// At work
			var infCountTot = 0;
			var infCountTot2 = 0;
			for(var i = 0 ; i < numEmployees ; i++){
				if(popArr[i].isAsymp()){infCountTot++;}
				if(popArr[i].isInf()){infCountTot2++;}
			}
			
			var index1 = 0;
			var index2 = 0;
			for(var roomNum = 0 ; roomNum < numPerRoom.length ; roomNum++){
				var infCount = 0;
				var infCount2 = 0;
				for(var j = 0 ; j < parseInt(numPerRoom[roomNum]) ; j++){
					if(popArr[index1].isAsymp()){infCount++;}
					if(popArr[index1].isInf()){infCount2++;}
					index1++;
				}
				for(var j = 0 ; j < parseInt(numPerRoom[roomNum]) ; j++){
					if(popArr[index2].isSusc()){
						popArr[index2].potentialInfectWork(infCount,infCount2,infCountTot2,day,parseFloat(timePerRoom[roomNum]),parseInt(numPerRoom[roomNum]),infCountTot,commonRoomTime,numEmployees);  
						if(popArr[index2].isInf() || popArr[index2].isAsymp()){workinfcount++; allinfcount++;} 
						if(run == 0){
							if(popArr[index2].isInf()){statusArrB[index2].push(2);}
						}
					}
					index2++;
				}
			}
			
			// In community
			for(var i = 0 ; i < numEmployees ; i++){
				if(popArr[i].isSusc()){
					popArr[i].potentialInfectComm(popArr[i].getAge(), day); 
					if(popArr[i].isInf() || popArr[i].isAsymp()){comminfcount++; allinfcount++;} 
					if(run == 0){
						if(popArr[i].isInf()){statusArrB[i].push(3);}
					}
				}
			}


			// At home
			for(var i = 0 ; i < numEmployees ; i++){
				if(popArr[i].isSusc()){
					popArr[i].potentialInfectHome(day, parseFloat(homeSize[popArr[i].getAge()-1]), backgroundVac);  
					if(popArr[i].isInf() || popArr[i].isAsymp()){homeinfcount++; allinfcount++;} 
					if(run == 0){
						if(popArr[i].isInf()){statusArrB[i].push(3);}
					}
				}
			}

			for(var i = 0 ; i < numEmployees ; i++){
				if(popArr[i].isInf() || popArr[i].isAsymp()){popArr[i].potentialRecover();}
			}
			
			var totInf = 0;
			for(var i = 0 ; i < numEmployees ; i++){
				if(popArr[i].isRec() && popArr[i].wasSymp()){totInf++;}
			}
			timeSeries0[run].push(totInf);
			
			// Collecting information for the animation
			if(run == 0 && ((day % 1) == 0) ){
				for(var i = 0 ; i < popArr.length ; i++){
					if(popArr[i].isSusc() || popArr[i].isAsymp()){statusArrB[i].push(1);}
					else if(popArr[i].isVac()){statusArrB[i].push(5);}
					else if(popArr[i].isRec() && statusArrB[i][statarrcountB] != 2 && statusArrB[i][statarrcountB] != 3){statusArrB[i].push(4);}
					else if(popArr[i].isIm()){statusArrB[i].push(4);}
					else if(popArr[i].isInf()&& statusArrB[i][statarrcountB] != 2 && statusArrB[i][statarrcountB] != 3){statusArrB[i].push(statusArrB[i][statarrcountB-1]);}
				}
				statarrcountB++;
			}
			
		} // End season loop
		
		totathomeinfected.push(homeinfcount);
		totatworkinfected.push(workinfcount);
		var outsideInf = comminfcount+homeinfcount;
		totatcomminfected.push(outsideInf);
		toteverywhere.push(allinfcount);
		
		var vacInf = 0;
		var nonvacInf = 0;
		var numVac = 0;
		for(var i = 0 ; i < numEmployees ; i++){
			if(popArr[i].isnoneffVac() || popArr[i].isVac()){numVac++;}
			if(popArr[i].isRec() && popArr[i].wasSymp()){
				if(popArr[i].isnoneffVac()){vacInf++;}
				else{nonvacInf++;}
			}		
		}
		
		if(numVac!=0){vacInfArr.push(vacInf/numVac);}
		else{vacInfArr.push(0);}
		if(numEmployees-numVac != 0){nonvacInfArr.push(nonvacInf/(numEmployees-numVac));}
		else{nonvacInfArr.push(0);}

		var totInfected = 0;
		var vaccost0 = 0;
		var nonvaccost0 = 0;
		var absdays = 0;
		for(var i = 0 ; i < numEmployees ; i++){
			if(popArr[i].isRec()){totInfected++;}
			if(popArr[i].isRec() && popArr[i].wasSymp()){
						
				if(popArr[i].isnoneffVac()){
					if(popArr[i].isM){
						var ran = Math.random();
						if(ran >= 0.023){
							var hsize = parseFloat(homeSize[popArr[i].getAge()-1]);
							if(hsize-1 > 0){vaccost0 += (4*(5/7)*0.7 + 0.5*4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff))*cost;absdays+= (4*(5/7)*0.7 + 0.5*4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff));}else{vaccost0 += 4*(5/7)*0.7*cost;absdays+= 4*(5/7)*0.7;}
						}
						else{if(hsize-1 > 0){vaccost0 += (4*(5/7)*0.7 + 4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff))*cost;absdays+= (4*(5/7)*0.7 + 4*1.5*(hsize-1)*0.3*(1-backgroundVac*vacEff));}else{vaccost0 += 4*(5/7)*0.7*cost;absdays+= 4*(5/7)*0.7;}}
					}
					else{
						var ran = Math.random();
						if(ran >= 0.121){
							var hsize = parseFloat(homeSize[popArr[i].getAge()-1]);
							if(hsize-1 > 0){vaccost0 += (4*(5/7)*0.7 + 0.5*4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff))*cost;absdays+= (4*(5/7)*0.7 + 0.5*4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff));}else{vaccost0 += 4*(5/7)*0.7*cost;absdays+= 4*(5/7)*0.7;}
						}
						else{if(hsize-1 > 0){vaccost0 += (4*(5/7)*0.7 + 4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff))*cost;absdays+= (4*(5/7)*0.7 + 4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff));}else{vaccost0 += 4*(5/7)*0.7*cost;absdays+= 4*(5/7)*0.7;}}
					}	
				}
				
				else{
					if(popArr[i].isM){
						var ran = Math.random();
						if(ran >= 0.023){
							var hsize = parseFloat(homeSize[popArr[i].getAge()-1]);
							if(hsize-1 > 0){nonvaccost0 += (4*(5/7)*0.7 + 0.5*4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff))*cost;absdays+= (4*(5/7)*0.7 + 0.5*4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff));}else{nonvaccost0 += 4*(5/7)*0.7*cost;absdays+= 4*(5/7)*0.7;}
						}
						else{if(hsize-1 > 0){nonvaccost0 += (4*(5/7)*0.7 + 4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff))*cost;absdays+= (4*(5/7)*0.7 + 4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff));}else{nonvaccost0 += 4*(5/7)*0.7*cost;absdays+= 4*(5/7)*0.7;}}
					}
					else{
						var ran = Math.random();
						if(ran >= 0.121){
							var hsize = parseFloat(homeSize[popArr[i].getAge()-1]);
							if(hsize-1 > 0){nonvaccost0 += (4*(5/7)*0.7 + 0.5*4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff))*cost;absdays+= (4*(5/7)*0.7 + 0.5*4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff));}else{nonvaccost0 += 4*(5/7)*0.7*cost;absdays+= 4*(5/7)*0.7;}
						}
						else{if(hsize-1 > 0){nonvaccost0 += (4*(5/7)*0.7 + 4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff))*cost;absdays+= (4*(5/7)*0.7 + 4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff));}else{nonvaccost0 += 4*(5/7)*0.7*cost;absdays+= 4*(5/7)*0.7;}}
					}
					
				}
			
			}
		}
		totInfectedArr.push(totInfected);
		var cost0 = 0.7*totInfected*4*(5/7)*cost;
	 	//cost0 = cost0.toFixed(2);
		if(numVac > 0){totvacCostArr.push(vaccost0/numVac);}
		else{totvacCostArr.push(0)}
		if(numEmployees-numVac != 0){totnonvacCostArr.push(nonvaccost0/(numEmployees-numVac));}
		else{totnonvacCostArr.push(0);}
	 	totCostArr.push(cost0);
	 	absdayarr.push(absdays);
		for(var i = 0 ; i < numEmployees ; i++){
			popArr[i].reset();
		}
		
	} // End realizations
	
	////////*******************Expanded Program***********************//////////////////////
	var statusArr = [];
	for(var i = 0 ; i < popArr.length ; i++){
		statusArr.push([]);
	}
	
	var vacInfArr100 = [];
	var nonvacInfArr100 = [];
	
	var absdayarr100 = [];
	
	var totathomeinfectedB = [];
	var totatworkinfectedB = [];
	var totatcomminfectedB = [];
	var toteverywhereB = [];
	
	var totInfectedArr100 = [];
	var totCostArr100 = [];
	var totvacCostArr100 = [];
	var totnonvacCostArr100 = [];
	
	for(var run = 0 ; run < realizations ; run++){
		var workinfcountB = 0;
		var homeinfcountB = 0;
		var comminfcountB = 0;
		var allinfcountB = 0;
		for(var i = 0 ; i < numEmployees ; i++){
			popArr[i].reset();
			var vacProb = Math.random();
			if(popArr[i].getAge() == 1){
				if(vacProb < vacGroup1*0.01){popArr[i].vaccinate();}
			}
			else if(popArr[i].getAge() == 2){
				if(vacProb < vacGroup2*0.01){popArr[i].vaccinate();}
			}
			else if(popArr[i].getAge() == 3){
				if(vacProb < vacGroup3*0.01){popArr[i].vaccinate();}
			}
			else if(popArr[i].getAge() == 4){
				if(vacProb < vacGroup4*0.01){popArr[i].vaccinate();}
			}
			else if(popArr[i].getAge() == 5){
				if(vacProb < vacGroup5*0.01){popArr[i].vaccinate();}
			}
			else if(popArr[i].getAge() == 6){
				if(vacProb < vacGroup6*0.01){popArr[i].vaccinate();}
			}
			else if(popArr[i].getAge() == 7){
				if(vacProb < vacGroup7*0.01){popArr[i].vaccinate();}
			}
			else if(popArr[i].getAge() == 8){
				if(vacProb < vacGroup8*0.01){popArr[i].vaccinate();}
			}
			
		}
		var statarrcount = 0;
		for(var day = 0 ; day < simuLen ; day++){
			
			// At work
			var infCountTot = 0;
			var infCountTot2 = 0;
			for(var i = 0 ; i < numEmployees ; i++){
				if(popArr[i].isAsymp()){infCountTot++;}
				if(popArr[i].isInf()){infCountTot2++;}
			}
			
			var index1 = 0;
			var index2 = 0;
			for(var roomNum = 0 ; roomNum < numPerRoom.length ; roomNum++){
				var infCount = 0;
				var infCount2 = 0;
				for(var j = 0 ; j < parseInt(numPerRoom[roomNum]) ; j++){
					if(popArr[index1].isAsymp()){infCount++;}
					if(popArr[index1].isInf()){infCount2++;}
					index1++;
				}
				for(var j = 0 ; j < parseInt(numPerRoom[roomNum]) ; j++){
					if(popArr[index2].isSusc()){
						popArr[index2].potentialInfectWork(infCount,infCount2,infCountTot2,day,parseFloat(timePerRoom[roomNum]),parseInt(numPerRoom[roomNum]),infCountTot,commonRoomTime,numEmployees);
						if(popArr[index2].isInf() || popArr[index2].isAsymp()){workinfcountB++; allinfcountB++;}
						if(run == 0){
							if(popArr[index2].isInf()){statusArr[index2].push(2);}
						}
					}
					index2++;
				}
			}
			
			
			// In community
			for(var i = 0 ; i < numEmployees ; i++){
				if(popArr[i].isSusc()){
					popArr[i].potentialInfectComm(popArr[i].getAge(), day); 
					if(popArr[i].isInf() || popArr[i].isAsymp()){comminfcountB++; allinfcountB++;} 
					if(run == 0){
						if(popArr[i].isInf()){statusArr[i].push(3);}
					}
				}
			}


			// At home
			for(var i = 0 ; i < numEmployees ; i++){
				if(popArr[i].isSusc()){
					popArr[i].potentialInfectHome(day, parseFloat(homeSize[popArr[i].getAge()-1]), backgroundVac); 
					if(popArr[i].isInf() || popArr[i].isAsymp()){homeinfcountB++; allinfcountB++;}
					if(run == 0){
						if(popArr[i].isInf()){statusArr[i].push(3);}
					}
				}
			}

			for(var i = 0 ; i < numEmployees ; i++){
				if(popArr[i].isInf() || popArr[i].isAsymp()){popArr[i].potentialRecover();}
			}
			
			var totInf = 0;
			for(var i = 0 ; i < numEmployees ; i++){
				if(popArr[i].isRec() && popArr[i].wasSymp()){totInf++;}
			}
			timeSeries100[run].push(totInf);
			
			
			// Collecting information for the animation
			if(run == 0 && ((day % 1) ==0) ){
				for(var i = 0 ; i < popArr.length ; i++){
					if(popArr[i].isSusc() || popArr[i].isAsymp()){statusArr[i].push(1);}
					else if(popArr[i].isVac()){statusArr[i].push(5);}
					else if(popArr[i].isRec() && statusArr[i][statarrcount] != 2 && statusArr[i][statarrcount] != 3){statusArr[i].push(4);}
					else if(popArr[i].isIm()){statusArr[i].push(4);}
					else if(popArr[i].isInf()&& statusArr[i][statarrcount] != 2 && statusArr[i][statarrcount] != 3){statusArr[i].push(statusArr[i][statarrcount-1]);}
				}
				statarrcount++;
			}
			
		} // End season loop
		
		totathomeinfectedB.push(homeinfcountB);
		totatworkinfectedB.push(workinfcountB);
		toteverywhereB.push(allinfcountB);
		var outsideInf = comminfcountB+homeinfcountB;
		totatcomminfectedB.push(outsideInf);
		
		var vacInf = 0;
		var nonvacInf = 0;
		var numVac = 0;
		for(var i = 0 ; i < numEmployees ; i++){
			if(popArr[i].isnoneffVac() || popArr[i].isVac()){numVac++;}
			if(popArr[i].isRec() && popArr[i].wasSymp()){
				if(popArr[i].isnoneffVac()){vacInf++;}
				else{nonvacInf++;}
			}		
		}
		
		if(numVac != 0){vacInfArr100.push(vacInf/numVac);}
		else{vacInfArr100.push(0);}
		if(numEmployees-numVac != 0){nonvacInfArr100.push(nonvacInf/(numEmployees-numVac));}
		else{nonvacInfArr100.push(0);}

		var totInfected100 = 0;
		var vaccost0 = 0;
		var nonvaccost0 = 0;
		var absday = 0;
		for(var i = 0 ; i < numEmployees ; i++){
			if(popArr[i].isRec()){totInfected100++;}
			if(popArr[i].isRec() && popArr[i].wasSymp()){
				
				if(popArr[i].isnoneffVac()){
					if(popArr[i].isM){
						var ran = Math.random();
						if(ran >= 0.023){
							var hsize = parseFloat(homeSize[popArr[i].getAge()-1]);
							if(hsize-1 > 0){vaccost0 += (4*(5/7)*0.7 + 0.5*4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff))*cost; absday+= (4*(5/7)*0.7 + 0.5*4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff));}else{vaccost0 += 4*(5/7)*0.7*cost;absday+= 4*(5/7)*0.7;}
						}
						else{if(hsize-1 > 0){vaccost0 += (4*(5/7)*0.7 + 4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff))*cost; absday+= (4*(5/7)*0.7 + 4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff));}else{vaccost0 += 4*(5/7)*0.7*cost;absday+= 4*(5/7)*0.7;}}
					}
					else{
						var ran = Math.random();
						if(ran >= 0.121){
							var hsize = parseFloat(homeSize[popArr[i].getAge()-1]);
							if(hsize-1 > 0){vaccost0 += (4*(5/7)*0.7 + 0.5*4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff))*cost;absday+= (4*(5/7)*0.7 + 0.5*4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff));}else{vaccost0 += 4*(5/7)*0.7*cost;absday+= 4*(5/7)*0.7;}
						}
						else{if(hsize-1 > 0){vaccost0 += (4*(5/7)*0.7 + 4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff))*cost;absday+= (4*(5/7)*0.7 + 4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff));}else{vaccost0 += 4*(5/7)*0.7*cost;absday+= 4*(5/7)*0.7;}}
					}	
				}
				
				else{
					if(popArr[i].isM){
						var ran = Math.random();
						if(ran >= 0.023){
							var hsize = parseFloat(homeSize[popArr[i].getAge()-1]);
							if(hsize-1 > 0){nonvaccost0 += (4*(5/7)*0.7 + 0.5*4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff))*cost;absday+= (4*(5/7)*0.7+ 0.5*4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff));}else{nonvaccost0 += 4*(5/7)*0.7*cost;absday+= 4*(5/7)*0.7;}
						}
						else{if(hsize-1 > 0){nonvaccost0 += (4*(5/7)*0.7 + 4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff))*cost;absday+= (4*(5/7)*0.7 + 4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff));}else{nonvaccost0 += 4*(5/7)*0.7*cost;absday+= 4*(5/7)*0.7;}}
					}
					else{
						var ran = Math.random();
						if(ran >= 0.121){
							var hsize = parseFloat(homeSize[popArr[i].getAge()-1]);
							if(hsize-1 > 0){nonvaccost0 += (4*(5/7)*0.7 + 0.5*4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff))*cost;absday+= (4*(5/7)*0.7 + 0.5*4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff));}else{nonvaccost0 += 4*(5/7)*0.7*cost;absday+= 4*(5/7)*0.7;}
						}
						else{if(hsize-1 > 0){nonvaccost0 += (4*(5/7)*0.7 + 4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff))*cost;absday+= (4*(5/7)*0.7 + 4*1.7*(hsize-1)*0.3*(1-backgroundVac*vacEff));}else{nonvaccost0 += 4*(5/7)*0.7*cost;absday+= 4*(5/7)*0.7;}}
					}
					
				}
			
			}
		}
		totInfectedArr100.push(totInfected100);
		var costWithVac = 0.7*totInfected100*4*(5/7)*cost;
	 	totCostArr100.push(costWithVac);
	 	totvacCostArr100.push(vaccost0/numVac);
	 	if(numEmployees-numVac != 0){totnonvacCostArr100.push(nonvaccost0/(numEmployees-numVac));}
	 	else{totnonvacCostArr100.push(0);}
		absdayarr100.push(absday);
		for(var i = 0 ; i < numEmployees ; i++){
			popArr[i].reset();
		}
	} // End realizations
	// End Expanded Vaccination
 
	for(var i = 0 ; i < simuLen ; i++){
		t[i] = i;
	}
 	
 	// Finding mean and 95% CI for total infected and costs.
 	var avgInf = 0;
 	var avgCost = 0;
 	var avgInf100 = 0;
 	var avgCost100 = 0;
 	
 	var avgabsdays = 0;
 	var avgabsdays100 = 0;
 	
 	var avgvacCost = 0;
 	var avgnonvacCost = 0;
 	var avgvacCost100 = 0;
 	var avgnonvacCost100 = 0;
 	
 	var avgvacInf = 0;
 	var avgnonvacInf = 0;
 	var avgvacInf100 = 0;
 	var avgnonvacInf100 = 0;
 	
 	var avghomeinf = 0;
 	var avgworkinf = 0;
 	var avgcomminf = 0;
 	var avgallinf = 0;
 	var avghomeinfB = 0;
 	var avgworkinfB = 0;
 	var avgcomminfB = 0;
 	var avgallinfB = 0;
 	for(var i = 0 ; i < realizations ; i++){
 		avgabsdays += absdayarr[i];
 		avgabsdays100 += absdayarr100[i];
 		avgInf += totInfectedArr[i];
 		avgCost += totCostArr[i];
 		avgInf100 += totInfectedArr100[i];
 		avgCost100 += totCostArr100[i];
 		
 		avgvacCost += totvacCostArr[i];
 	 	avgnonvacCost += totnonvacCostArr[i];
 	 	avgvacCost100 += totvacCostArr100[i];
 	 	avgnonvacCost100 += totnonvacCostArr100[i];
 		
 		avghomeinf += 0.7*totathomeinfected[i];
 	 	avgworkinf += 0.7*totatworkinfected[i];
 	 	avgcomminf += 0.7*totatcomminfected[i];
 	 	avgallinf += 0.7*toteverywhere[i];
 	 	avghomeinfB += 0.7*totathomeinfectedB[i];
 	 	avgworkinfB += 0.7*totatworkinfectedB[i];
 	 	avgcomminfB += 0.7*totatcomminfectedB[i];
 	 	avgallinfB += 0.7*toteverywhereB[i];
 	 	
 	 	avgvacInf += vacInfArr[i];
 	 	avgnonvacInf += nonvacInfArr[i];
 	 	avgvacInf100 += vacInfArr100[i];
 	 	avgnonvacInf100 += nonvacInfArr100[i];
 	}
 	
 	avgabsdays = avgabsdays / realizations;
 	avgabsdays100 = avgabsdays100 / realizations;
 	
 	avgvacInf = avgvacInf / realizations;
	avgnonvacInf = avgnonvacInf / realizations;
	avgvacInf100 = avgvacInf100 / realizations;
	avgnonvacInf100 = avgnonvacInf100 / realizations;
 	
 	avghomeinf = avghomeinf / realizations;
	avgworkinf = avgworkinf / realizations;
	avgcomminf = avgcomminf / realizations;
	avgallinf = avgallinf / realizations;
	avghomeinfB = avghomeinfB / realizations;
	avgworkinfB = avgworkinfB / realizations;
	avgcomminfB = avgcomminfB / realizations;
	avgallinfB = avgallinfB / realizations;

 	avgInf = avgInf / realizations;
 	avgCost = avgCost / realizations;
 	avgInf100 = avgInf100 / realizations;
 	avgCost100 = avgCost100 / realizations;
 	
 	avgvacCost = avgvacCost/realizations;
	avgnonvacCost = avgnonvacCost/realizations;
	avgvacCost100 = avgvacCost100/realizations;
	avgnonvacCost100 = avgnonvacCost100/realizations;
	
	var stdDevvacCost = StdDev(totvacCostArr);
	var stdDevnonvacCost = StdDev(totnonvacCostArr);
	var stdDevvacCost100 = StdDev(totvacCostArr100);
	var stdDevnonvacCost100 = StdDev(totnonvacCostArr100);
	
	var stdDevabsday = StdDev(absdayarr);
	var stdDevabsday100 = StdDev(absdayarr100);
 	
 	var stdDevvacInf = StdDev(vacInfArr);
 	var stdDevnonvacInf = StdDev(nonvacInfArr);
 	var stdDevvacInf100 = StdDev(vacInfArr100);
 	var stdDevnonvacInf100 = StdDev(nonvacInfArr100);
 	
 	var stdDevhomeinf = StdDev(totathomeinfected);
 	var stdDevworkinf = StdDev(totatworkinfected);
 	var stdDevcomminf = StdDev(totatcomminfected);

 	var stdDevhomeinfB = StdDev(totathomeinfectedB);
 	var stdDevworkinfB = StdDev(totatworkinfectedB);
 	var stdDevcomminfB = StdDev(totatcomminfected);
 	
 	var stdDevInf = StdDev(totInfectedArr);
 	var stdDevCost = StdDev(totCostArr);
 	var stdDevInf100 = StdDev(totInfectedArr100);
 	var stdDevCost100 = StdDev(totCostArr100);
 	
 	var avgTimeSeries0 = [];
 	var avgTimeSeries0DevTop = [];
 	var avgTimeSeries0DevBot = [];
 	var avgTimeSeries100 = [];
 	var avgTimeSeries100DevTop = [];
 	var avgTimeSeries100DevBot = [];
 	
	var day0Dev = [];
	var day100Dev = [];
 	for(var i = 0 ; i < simuLen ; i++){
 		var avgDay0 = 0;
 		var avgDay100 = 0;
 		day0Dev = [];
 		day100Dev = [];
 		
 		for(var j = 0 ; j < realizations ; j++){
 			
 			avgDay0 += timeSeries0[j][i];
 			avgDay100 += timeSeries100[j][i];
 			
 			day0Dev.push(timeSeries0[j][i]);
 			day100Dev.push(timeSeries100[j][i]);

 		}

 		
 		avgTimeSeries0[i] = avgDay0 / realizations ;
 		avgTimeSeries100[i] = avgDay100 / realizations ;
 		
 		
 		avgTimeSeries0DevTop.push(avgTimeSeries0[i] + StdDev(day0Dev)) ;
 		avgTimeSeries100DevTop.push(avgTimeSeries100[i] + StdDev(day100Dev)) ;
 		avgTimeSeries0DevBot.push(avgTimeSeries0[i] - StdDev(day0Dev)) ;
 		avgTimeSeries100DevBot.push(avgTimeSeries100[i] - StdDev(day100Dev)) ;

 	}
 	

 	// Calling function to display the results												
    display(/*avghomeinf/avgallinf, avgworkinf/avgallinf,*/avgabsdays, avgabsdays100, stdDevabsday, stdDevabsday100, avgvacCost,avgnonvacCost, avgvacCost100,avgnonvacCost100, stdDevvacCost,stdDevnonvacCost,stdDevvacCost100,stdDevnonvacCost100,  avgvacInf,avgnonvacInf,avgvacInf100,avgnonvacInf100,stdDevvacInf,stdDevnonvacInf,stdDevvacInf100,stdDevnonvacInf100, avgInf, stdDevInf, avgCost, stdDevCost, avgInf100, stdDevInf100, avgCost100,costOfVaccinating, costOfVaccinatingB, stdDevCost100, avgTimeSeries0, avgTimeSeries0DevTop,avgTimeSeries0DevBot, avgTimeSeries100, avgTimeSeries100DevTop, avgTimeSeries100DevBot, t, numRooms, numPerRoom, statusArr, avgworkinf, stdDevworkinf, avgcomminf, stdDevcomminf, avgworkinfB, stdDevworkinfB , avgcomminfB, stdDevcomminfB, statusArrB);

}
 
function display(/*ak,bk,*/avgabsddays, avgabsdays100, stdDevabsday, stdDevabsday100, avgvacCost,avgnonvacCost, avgvacCost100,avgnonvacCost100, stdDevvacCost,stdDevnonvacCost,stdDevvacCost100,stdDevnonvacCost100,avgvacInf,avgnonvacInf,avgvacInf100,avgnonvacInf100,stdDevvacInf,stdDevnonvacInf,stdDevvacInf100,stdDevnonvacInf100, numInf, numInfStdDev, totCost, totCostStdDev, numInf100, numInfStdDev100, totCost100, costOfVaccines, costOfVaccinesB, totCostStdDev100, timeSeries1, timeSeries1DevTop,timeSeries1DevBot, timeSeries2, timeSeries2DevTop, timeSeries2DevBot, time, numRooms, numPerRoom, statusArr,  avgworkinf, stdDevworkinf, avgcomminf, stdDevcomminf, avgworkinfB, stdDevworkinfB , avgcomminfB, stdDevcomminfB, statusArrB){
	
	var daysAbsentBase = avgabsddays;
	var daysAbsentProg = avgabsdays100;
	
	var daysPresBase = Math.round((0.3*0.7*numInf + 0.3*numInf)*(5/7)*4);
	var daysPresProg = Math.round((0.3*0.7*numInf100 + 0.3*numInf100)*(5/7)*4);
	
	var outcomesStr ='<br>&nbsp;&nbsp;&nbsp;&nbsp;  Without the expanded vaccine program, approximately '+ Math.round(numInf) + ' employees will become symptomatically infected in an influenza season, costing you '+numberWithCommas(totCost.toFixed(2))+'.' +' ';
	outcomesStr += 'Expanding vaccination coverage amongst your employees by the specified amount gives approximately '+ Math.round(numInf100) + ' employees becoming symptomatically infected in a season, costing you '+numberWithCommas(totCost100.toFixed(2))+'.  This includes a cost of '+numberWithCommas(costOfVaccines.toFixed(2))+' for the additional vaccines given to employees.';
	outcomesStr += '<br><br>&nbsp;&nbsp;&nbsp;&nbsp; Details of the outcomes are given below, including total cost and infected differences, as well as time series plots showing the number of infectious cases in each scenario. <br><br> Estimated costs of the baseline and expanded vaccine programs to the employer and employees:';
	
	
	var trace1 = {
			x: ['Total Infected'],
			y: [numInf.toFixed(2)],
			error_y: {
			    type: 'data',
			    array: [numInfStdDev.toFixed(2)],
			    visible: true
			  },
			  marker:{ color:'rgb(70,130,180)'},
			type: 'bar',
			name: 'Baseline Vaccination',
			showlegend: false
	};
	
	var trace10 = {
			x: ['Total Infected'],
			y: [numInf100.toFixed(2)],
			error_y: {
			    type: 'data',
			    array: [numInfStdDev100.toFixed(2)],
			    visible: true
			  },
			  marker:{ color:'rgb(255,140,0)'},
			type: 'bar',
			name: 'Expanded Program',
			showlegend: false
	};

	var trace2 = {
			x: ['Total Cost'],
			y: [totCost.toFixed(2)],
			xaxis: 'x2',
			yaxis: 'y2',
			error_y: {
			    type: 'data',
			    array: [totCostStdDev.toFixed(2)],
			    visible: true
			  },
			  marker:{ color:'rgb(70,130,180)'},
			type: 'bar',
			name: 'Baseline Vaccination',
			//showlegend: false
				
	};
	var trace11 = {
			x: ['Total Cost'],
			y: [totCost100.toFixed(2)],
			xaxis: 'x2',
			yaxis: 'y2',
			error_y: {
			    type: 'data',
			    array: [totCostStdDev100.toFixed(2)],
			    visible: true
			  },
			  marker:{ color:'rgb(255,140,0)'},
			type: 'bar',
			name: 'Expanded Program',
			//showlegend: false
	};
	
	var trace3 = {
			  x: t,
			  y: timeSeries1,
			  fill: 'tonexty',
			  line: {color: 'rgb(70,130,180,0.2)'},
			 fillcolor: 'rgba(70,130,180,0.0)',
			  xaxis: 'x3',
			  yaxis: 'y3',
			  mode: 'lines',
			  type: 'scatter',
			  name: 'Baseline Vaccination'
			};

	var trace4 = {
			  x: t,
			  y: timeSeries2,
			  fill: 'tonexty',
			  fillcolor: 'rgba(255,140,0,0.0)',
			  line: {color: 'rgb(255,140,0)'},
			  xaxis: 'x3',
			  yaxis: 'y3',
			  mode: 'lines',
			  type: 'scatter',
			  name: 'Expanded Program'
	};
	
	var trace5 = {
			  x: t,
			  y: timeSeries1DevTop,
			  fill: 'tonexty',
			  fillcolor: 'rgba(70,130,180,0.2)',
			  line: {color: 'transparent'},
			  showlegend: false,
			  xaxis: 'x3',
			  yaxis: 'y3',
			  type: 'scatter',
			  name: '+95% CI'
			};

	var trace6 = {
			  x: t,
			  y: timeSeries2DevTop,
			  fill: 'tonexty',
			  fillcolor: 'rgba(255,140,0,0.2)',
			  line: {color: 'transparent'},
			  showlegend: false,
			  xaxis: 'x3',
			  yaxis: 'y3',
			  type: 'scatter',
			  name: '+95% CI'
	};
	
	var trace7 = {
			  x: t,
			  y: timeSeries1DevBot,
			  fillcolor: 'rgba(70,130,180,0.2)',
			  line: {color: 'transparent'},
			  showlegend: false,
			  xaxis: 'x3',
			  yaxis: 'y3',
			  type: 'scatter',
			  name: '-95% CI'
			};

	var trace8 = {
			  x: t,
			  y: timeSeries2DevBot,
			  fillcolor: 'rgba(255,140,0,0.2)',
			  line: {color: 'transparent'},
			  showlegend: false,
			  xaxis: 'x3',
			  yaxis: 'y3',
			  type: 'scatter',
			  name: '-95% CI'
	};
	
	var trace12 = {
			x: ['Total Infected Inside the Workplace'],
			y: [avgworkinf.toFixed(2)],
			xaxis: 'x4',
			yaxis: 'y4',
			error_y: {
			    type: 'data',
			    array: [(0.7*stdDevworkinf).toFixed(2)],
			    visible: true
			  },
			  marker:{ color:'rgb(70,130,180)'},
			type: 'bar',
			name: 'Baseline Vaccination',
			showlegend: false
	};
	
	var trace13 = {
			x: ['Total Infected Inside the Workplace'],
			y: [avgworkinfB.toFixed(2)],
			xaxis: 'x4',
			yaxis: 'y4',
			error_y: {
			    type: 'data',
			    array: [(0.7*stdDevworkinfB).toFixed(2)],
			    visible: true
			  },
			  marker:{ color:'rgb(255,140,0)'},
			type: 'bar',
			name: 'Expanded Program',
			//showlegend: false
	};

	var trace14 = {
			x: ['Total Infected Outside the Workplace'],
			y: [avgcomminf.toFixed(2)],
			xaxis: 'x5',
			yaxis: 'y5',
			error_y: {
			    type: 'data',
			    array: [(0.7*stdDevcomminf).toFixed(2)],
			    visible: true
			  },
			  marker:{ color:'rgb(70,130,180)'},
			type: 'bar',
			name: 'Baseline Vaccination',
			//showlegend: false
				
	};
	var trace15 = {
			x: ['Total Infected Outside the Workplace'],
			y: [avgcomminfB.toFixed(2)],
			xaxis: 'x5',
			yaxis: 'y5',
			error_y: {
			    type: 'data',
			    array: [(0.7*stdDevcomminfB).toFixed(2)],
			    visible: true
			  },
			  marker:{ color:'rgb(255,140,0)'},
			type: 'bar',
			name: 'Expanded Program',
			showlegend: false
	};
	
	var trace16 = {
			x: ['Absenteeism Days'],
			y: [daysAbsentBase.toFixed(2)],
			xaxis: 'x6',
			yaxis: 'y6',
			error_y: {
			    type: 'data',
			    array: [stdDevabsday.toFixed(2)],
			    visible: true
			  },
			marker:{ color:'rgb(70,130,180)'},
			type: 'bar',
			name: 'Baseline Vaccination',
			showlegend: false
	};
	
	var trace17 = {
			x: ['Absenteeism Days'],
			y: [daysAbsentProg.toFixed(2)],
			xaxis: 'x6',
			yaxis: 'y6',
			error_y: {
			    type: 'data',
			    array: [stdDevabsday100.toFixed(2)],
			    visible: true
			  },
			marker:{ color:'rgb(255,140,0)'},
			type: 'bar',
			name: 'Expanded Program',
			showlegend: false
	};
	
	var trace18 = {
			x: ['Presenteeism Days'],
			y: [daysPresBase.toFixed(2)],
			xaxis: 'x7',
			yaxis: 'y7',
			error_y: {
			    type: 'data',
			    array: [(4*5/7*0.3*numInfStdDev).toFixed(2)],
			    visible: true
			  },
			marker:{ color:'rgb(70,130,180)'},
			type: 'bar',
			name: 'Baseline Vaccination',
			showlegend: false
	};
	
	var trace19 = {
			x: ['Presenteeism Days'],
			y: [daysPresProg.toFixed(2)],
			xaxis: 'x7',
			yaxis: 'y7',
			error_y: {
			    type: 'data',
			    array: [(4*5/7*0.3*numInfStdDev100).toFixed(2)],
			    visible: true
			  },
			marker:{ color:'rgb(255,140,0)'},
			type: 'bar',
			name: 'Expanded Program',
			showlegend: false
	};
	
	var trace20 = {
			x: ['Cost of Vaccines'],
			y: [costOfVaccinesB.toFixed(2)],
			xaxis: 'x8',
			yaxis: 'y8',
			marker:{ color:'rgb(70,130,180)'},
			type: 'bar',
			name: 'Baseline Vaccination',
			//showlegend: false
	};
	
	var trace21 = {
			x: ['Cost of Vaccines'],
			y: [costOfVaccines.toFixed(2)],
			xaxis: 'x8',
			yaxis: 'y8',
			marker:{ color:'rgb(255,140,0)'},
			type: 'bar',
			name: 'Expanded Program',
			//showlegend: false
	};
	
	var trace22 = {
			x: ['Infection Risk for Vaccinated'],
			y: [avgvacInf.toFixed(2)],
			xaxis: 'x9',
			yaxis: 'y9',
			error_y: {
			    type: 'data',
			    array: [stdDevvacInf.toFixed(4)],
			    visible: true
			  },
			  marker:{ color:'rgb(70,130,180)'},
			type: 'bar',
			name: 'Baseline Vaccination',
			showlegend: false
	};
	
	var trace23 = {
			x: ['Infection Risk for Vaccinated'],
			y: [avgvacInf100.toFixed(2)],
			xaxis: 'x10',
			yaxis: 'y10',
			error_y: {
			    type: 'data',
			    array: [stdDevvacInf100.toFixed(4)],
			    visible: true
			  },
			  marker:{color:'rgb(255,140,0)'},
			type: 'bar',
			name: 'Expanded Program',
			showlegend: false
	};
	
	var trace24 = {
			x: ['Infection Risk for Non-Vaccinated'],
			y: [avgnonvacInf.toFixed(2)],
			xaxis: 'x9',
			yaxis: 'y9',
			error_y: {
			    type: 'data',
			    array: [stdDevnonvacInf.toFixed(3)],
			    visible: true
			  },
			  marker:{ color:'rgb(70,130,180)'},
			type: 'bar',
			name: 'Baseline Vaccination',
			showlegend: false
	};
	
	var trace25 = {
			x: ['Infection Risk for Non-Vaccinated'],
			y: [avgnonvacInf100.toFixed(2)],
			xaxis: 'x10',
			yaxis: 'y10',
			error_y: {
			    type: 'data',
			    array: [stdDevnonvacInf100.toFixed(3)],
			    visible: true
			  },
			  marker:{ color:'rgb(255,140,0)'},
			type: 'bar',
			name: 'Expanded Program',
			showlegend: false
	};
	
	var trace26 = {
			x: ['Cost for Vaccinators'],
			y: [avgvacCost.toFixed(2)],
			xaxis: 'x11',
			yaxis: 'y11',
			error_y: {
			    type: 'data',
			    array: [stdDevvacCost.toFixed(2)],
			    visible: true
			  },
			  marker:{ color:'rgb(70,130,180)'},
			type: 'bar',
			name: 'Baseline Vaccination',
	};
	
	var trace27 = {
			x: ['Cost for Vaccinators'],
			y: [avgvacCost100.toFixed(2)],
			xaxis: 'x12',
			yaxis: 'y12',
			error_y: {
			    type: 'data',
			    array: [stdDevvacCost100.toFixed(2)],
			    visible: true
			  },
			  marker:{color:'rgb(255,140,0)'},
			type: 'bar',
			name: 'Expanded Program',
	};
	
	var trace28 = {
			x: ['Cost for Non-Vaccinators'],
			y: [avgnonvacCost.toFixed(2)],
			xaxis: 'x11',
			yaxis: 'y11',
			error_y: {
			    type: 'data',
			    array: [stdDevnonvacCost.toFixed(2)],
			    visible: true
			  },
			  marker:{ color:'rgb(70,130,180)'},
			type: 'bar',
			name: 'Baseline Vaccination',
			showlegend: false
	};
	
	var trace29 = {
			x: ['Cost for Non-Vaccinators'],
			y: [avgnonvacCost100.toFixed(2)],
			xaxis: 'x12',
			yaxis: 'y12',
			error_y: {
			    type: 'data',
			    array: [stdDevnonvacCost100.toFixed(2)],
			    visible: true
			  },
			  marker:{ color:'rgb(255,140,0)'},
			type: 'bar',
			name: 'Expanded Program',
			showlegend: false
	};
	

	
	var data = [/*trace2, trace11,*/ trace20, trace21];

	var layout = {
			
			annotations: [           
			    {
			    	font: {size: 14},
			    	x: 0.633,
			    	y: 0.75,
			        text: 'Cost of Vaccines',   
			        xanchor: 'center',
			        xref: 'paper',
			        yanchor:'bottom',
			        yref: 'paper',
			        showarrow: false

			    },

			],
			
			paper_bgcolor: 'rgb(254, 247, 234)',
			plot_bgcolor: 'rgb(254, 247, 234)',
			autosize: false,
			width: 800,
			height: 350,
			title: '<br>Program Cost',
			barmode: 'group',
			yaxis8: {domain: [0.0, 0.7],anchor: 'x8'},
			xaxis8: {domain: [0.36, 0.96],anchor: 'y8', showticklabels: false},
			//showlegend: false,
			hovermode:'closest',
			margin: {                         
				l: 40, b: 55, r: 10, t: 10
			}
	};
	
	var data2 = [trace7, trace5, trace4, trace8, trace6, trace3,trace1, trace10,trace12,trace13,trace14,trace15,trace16,trace17,trace18,trace19];
	var layout2 = {
			title: '<br>Workplace-Level Outcomes',
			paper_bgcolor: 'rgb(254, 247, 234)',
			plot_bgcolor: 'rgb(254, 247, 234)',
			autosize: false,
			width: 800,
			height: 1050,
			barmode: 'group',
			tickformat: "%B, %y",
			yaxis: {domain: [0.77, 0.92]},
			xaxis: {domain: [0.275, 0.725], showticklabels: false},
			yaxis4: {domain: [0.55, 0.7],anchor: 'x4'},
			xaxis4: {domain: [0, 0.45],anchor: 'y4', showticklabels: false },
			yaxis5: {domain: [0.55, 0.7],anchor: 'x5'},
			xaxis5: {domain: [0.55, 1.0],anchor: 'y5', showticklabels: false},
			yaxis6: {domain: [0.3, 0.45],anchor: 'x6'},
			xaxis6: {domain: [0.0, 0.45],anchor: 'y6', showticklabels: false},
			yaxis7: {domain: [0.3, 0.45],anchor: 'x7'},
			xaxis7: {domain: [0.55, 1.0],anchor: 'y7', showticklabels: false},
			xaxis3: {autotick: false,dtick: 5,/*tickangle: 45,*/showgrid: false,domain: [0, 1], anchor: 'y3', title: "Day"},
			yaxis3: {domain: [0.05, 0.25], anchor: 'x3', title: "Total Infected"},

			//showlegend: false,
			hovermode:'closest',
			margin: {                     
				l: 40, b: 55, r: 10, t: 10
			},
			annotations: [           
						    {
						    	font: {size: 14},
						    	x: 0.52,
						    	y: 0.925,
						        text: 'Total Infected',    
						        xanchor: 'center',
						        xref: 'paper',
						        yanchor:'bottom',
						        yref: 'paper',
						        showarrow: false

						    },
						    {
						    	font: {size: 14},
						    	x: 0.225,
						    	y: 0.71,
						        text: 'Total Infected Inside the Workplace',  
						        xanchor: 'center',
						        xref: 'paper',
						        yanchor:'bottom',
						        yref: 'paper',
						        showarrow: false

						    },
						    {
						    	font: {size: 14},
						    	x: 0.765,
						    	y: 0.71,
						        text: 'Total Infected Outside the Workplace',    
						        xanchor: 'center',
						        xref: 'paper',
						        yanchor:'bottom',
						        yref: 'paper',
						        showarrow: false

						    },
						    {
						    	font: {size: 14},
						    	x: 0.22,
						    	y: 0.46,
						        text: 'Total Absenteeism Days',    
						        xanchor: 'center',
						        xref: 'paper',
						        yanchor:'bottom',
						        yref: 'paper',
						        showarrow: false

						    },
						    {
						    	font: {size: 14},
						    	x: 0.77,
						    	y: 0.46,
						        text: 'Total Presenteeism Days',   
						        xanchor: 'center',
						        xref: 'paper',
						        yanchor:'bottom',
						        yref: 'paper',
						        showarrow: false

						    },
						    {
						    	font: {size: 14},
						    	x: 0.495,
						    	y: 0.25,
						        text: 'Time Series of Total Infected',   
						        xanchor: 'center',
						        xref: 'paper',
						        yanchor:'bottom',
						        yref: 'paper',
						        showarrow: false

						    },
						],
	};
	
	var data3 = [trace23, trace25, trace26, trace27, trace28, trace29, trace22, trace24];
	var layout3 = {
			title: '<br>Individual-Level Outcomes',
			paper_bgcolor: 'rgb(254, 247, 234)',
			plot_bgcolor: 'rgb(254, 247, 234)',
			autosize: false,
			width: 800,
			height: 800,

			yaxis11: {domain: [0.5, 0.87], anchor: 'x11'},
			xaxis11: {showgrid: false,domain: [0.0, 0.45], anchor: 'y11',showticklabels: false},
			yaxis12: {domain: [0.5, 0.87], anchor: 'x12'},
			xaxis12: {showgrid: false,domain: [0.55, 1.0], anchor: 'y12',showticklabels: false},
			yaxis9: {domain: [0.0, 0.37], anchor: 'x9'},
			xaxis9: {showgrid: false,domain: [0.0, 0.45], anchor: 'y9',showticklabels: false},
			yaxis10: {domain: [0.0, 0.37], anchor: 'x10'},
			xaxis10: {showgrid: false,domain: [0.55, 1.0], anchor: 'y10',showticklabels: false},


			//showlegend: false,
			hovermode:'closest',
			margin: {                         
				l: 40, b: 55, r: 10, t: 10
			},
			
			annotations: [           
						    {
						    	font: {size: 14},
						    	x: 0.22,
						    	y: 0.89,
						        text: 'Employee Costs',   
						        xanchor: 'center',
						        xref: 'paper',
						        yanchor:'bottom',
						        yref: 'paper',
						        showarrow: false
						    },
						    {
						    	font: {size: 14},
						    	x: 0.22,
						    	y: 0.87,
						        text: 'Under Baseline Vaccination',    
						        xanchor: 'center',
						        xref: 'paper',
						        yanchor:'bottom',
						        yref: 'paper',
						        showarrow: false
						    },
						    {
						    	font: {size: 12},
						    	x: 0.11,
						    	y: 0.46,
						        text: 'Vaccinators', 
						        xanchor: 'center',
						        xref: 'paper',
						        yanchor:'bottom',
						        yref: 'paper',
						        showarrow: false
						    },
						    {
						    	font: {size: 12},
						    	x: 0.338,
						    	y:  0.46,
						        text: 'Non-Vaccinators',    
						        xanchor: 'center',
						        xref: 'paper',
						        yanchor:'bottom',
						        yref: 'paper',
						        showarrow: false
						    },
						    {
						    	font: {size: 14},
						    	x: 0.77,
						    	y: 0.89,
						        text: 'Employee Costs',   
						        xanchor: 'center',
						        xref: 'paper',
						        yanchor:'bottom',
						        yref: 'paper',
						        showarrow: false
						    },
						    {
						    	font: {size: 14},
						    	x: 0.77,
						    	y: 0.87,
						        text: 'Under Expanded Program',   
						        xanchor: 'center',
						        xref: 'paper',
						        yanchor:'bottom',
						        yref: 'paper',
						        showarrow: false
						    },
						    {
						    	font: {size: 12},
						    	x: 0.66,
						    	y: 0.46,
						        text: 'Vaccinators',    
						        xanchor: 'center',
						        xref: 'paper',
						        yanchor:'bottom',
						        yref: 'paper',
						        showarrow: false
						    },
						    {
						    	font: {size: 12},
						    	x: 0.888,
						    	y: 0.46,
						        text: 'Non-Vaccinators',   
						        xanchor: 'center',
						        xref: 'paper',
						        yanchor:'bottom',
						        yref: 'paper',
						        showarrow: false
						    },
						    {
						    	font: {size: 14},
						    	x: 0.2,
						    	y: 0.37,
						        text: 'Infection Risk',   
						        xanchor: 'center',
						        xref: 'paper',
						        yanchor:'bottom',
						        yref: 'paper',
						        showarrow: false
						    },
						    {
						    	font: {size: 12},
						    	x: 0.11,
						    	y: -0.04,
						        text: 'Vaccinators',   
						        xanchor: 'center',
						        xref: 'paper',
						        yanchor:'bottom',
						        yref: 'paper',
						        showarrow: false
						    },
						    {
						    	font: {size: 12},
						    	x: 0.338,
						    	y: -0.04,
						        text: 'Non-Vaccinators',  
						        xanchor: 'center',
						        xref: 'paper',
						        yanchor:'bottom',
						        yref: 'paper',
						        showarrow: false
						    },
						    {
						    	font: {size: 14},
						    	x: 0.78,
						    	y: 0.37,
						        text: 'Infection Risk',   
						        xanchor: 'center',
						        xref: 'paper',
						        yanchor:'bottom',
						        yref: 'paper',
						        showarrow: false
						    },
						    {
						    	font: {size: 12},
						    	x: 0.66,
						    	y: -0.04,
						        text: 'Vaccinators',   
						        xanchor: 'center',
						        xref: 'paper',
						        yanchor:'bottom',
						        yref: 'paper',
						        showarrow: false
						    },
						    {
						    	font: {size: 12},
						    	x: 0.888,
						    	y: -0.04,
						        text: 'Non-Vaccinators',  
						        xanchor: 'center',
						        xref: 'paper',
						        yanchor:'bottom',
						        yref: 'paper',
						        showarrow: false
						    }
						  
						    

						],
			
	};
	
	var infStr1 = '<br>Program Costs show the cost of vaccinating employees for each coverage scenario.';

	document.getElementById("outputBox").innerHTML = infStr1;
	Plotly.newPlot('outputBox2', data, layout);
	
	
	
	var infStr = '<br>Workplace level infection related outcomes: <br>&nbsp;&nbsp;&nbsp;&nbsp; Without the expanded vaccine program, approximately '+ Math.round(numInf) + ' (&plusmn;'+numInfStdDev.toFixed(2)+', 95% CI) employees will become symptomatically infected in an influenza season. Expanding vaccination coverage amongst your employees by the specified amount gives approximately '+ Math.round(numInf100) + ' (&plusmn;'+numInfStdDev100.toFixed(2)+', 95% CI) employees becoming symptomatically infected in a season.';
	infStr += '&nbsp; Approximately '+Math.round(avgworkinf)+' (&plusmn;'+(0.7*stdDevworkinf).toFixed(2)+', 95% CI) and '+Math.round(avgworkinfB)+' (&plusmn;'+(0.7*stdDevworkinfB).toFixed(2)+', 95% CI)  employees will get infected inside the workplace under the baseline and expanded programs, respectively.';
	infStr += '&nbsp; Outside the workplace, approximately '+Math.round(avgcomminf)+' (&plusmn;'+(0.7*stdDevcomminf).toFixed(2)+', 95% CI) and '+Math.round(avgcomminfB)+' (&plusmn;'+(0.7*stdDevcomminfB).toFixed(2)+', 95% CI)  employees will get infected under the baseline and expanded programs, respectively.';
	infStr += '<br>&nbsp;&nbsp;&nbsp;&nbsp; There will be approximately '+Math.round(daysAbsentBase)+' (&plusmn;'+(stdDevabsday).toFixed(2)+', 95% CI) and '+Math.round(daysAbsentProg)+' (&plusmn;'+(stdDevabsday100).toFixed(2)+', 95% CI) absenteeism days in the baseline and expanded programs, respectively.'; 	
	infStr += '&nbsp;Finally, there will be approximately '+Math.round(daysPresBase)+' (&plusmn;'+(4*5/7*0.3*numInfStdDev).toFixed(2)+', 95% CI) and '+Math.round(daysPresProg)+' (&plusmn;'+(4*5/7*0.3*numInfStdDev100).toFixed(2)+', 95% CI) presenteeism days in the baseline and expanded programs, respectively.'; 	
	//document.getElementById("outputBox3").innerHTML = infStr;
	
	var infStr2 = '<br>Workplace-level infection related outcomes show how infections affect the workplace.  Infected numbers <br> show the number of symptomatic infections among employees.  Absenteeism days refer to employees <br> missing work due to illness or having to stay home from work to care for dependents they were <br> responsible for infecting.  Presenteeism days refer to employees attending work while they are infectious.';
	
	document.getElementById("outputBox3").innerHTML = infStr2;
	Plotly.newPlot('outputBox4', data2, layout2);
	
	var iStr = '<br> Individual level related outcomes:<br>&nbsp;&nbsp;&nbsp;&nbsp;';
	iStr += 'Individuals who vaccinate under the baseline vaccination coverage will incur a cost of '+avgvacCost.toFixed(2)+' (&plusmn;'+stdDevvacCost.toFixed(2)+', 95% CI) on average per season, while those that choose to not vaccinate will incur a cost of '+avgnonvacCost.toFixed(2)+' (&plusmn;'+stdDevnonvacCost.toFixed(2)+', 95% CI) on average per season.';
	iStr += '&nbsp;Under the expanded program, individuals who vaccinate will incur a cost of '+avgvacCost100.toFixed(2)+' (&plusmn;'+stdDevvacCost100.toFixed(2)+', 95% CI) on average per season, while those that choose to not vaccinate will incur a cost of '+avgnonvacCost100.toFixed(2)+' (&plusmn;'+stdDevnonvacCost100.toFixed(2)+', 95% CI) on average per season.';
	//document.getElementById("outputBox5").innerHTML = iStr;
	
	var iStr2 = '<br>Individual-level infection related outcomes show the impact influenza has on individual costs.  Employee <br> costs refers to the average amount an employee pays over the course of the epidemic.  Infection risk <br> gives the probability of an employee becoming infected over the course of the epidemic.';
	document.getElementById("outputBox5").innerHTML = iStr2;
	
	Plotly.newPlot('outputBox6', data3, layout3);
	
	var dimen = 1000;
	for(var i = 0 ; i < numRooms ; i++){
		var amountInRows = Math.sqrt(numPerRoom[i]);
		amountInRows = Math.ceil(amountInRows);
		
		if(dimen > ( Math.floor(125/amountInRows))){
			dimen = Math.floor(125/amountInRows);
		}
	}
	
	startAnimation(statusArr, statusArrB, dimen, numRooms, numPerRoom);
	
}

function startAnimation(statusArr, statusArrB, dimen, numRooms, numPerRoom){
	
	var pauseAnim = false;
	var k = 0;

	var speed = 1000;
	
	$("#submitAnimButton").show();
	$("#speedAnimButton").show();
	$("#slowAnimButton").show();
	$("#pauseAnimButton").show();
	
	$("#animContent").hide();
	
	$("#submitButton").click(function() {	
		pauseAnim = false;
		k = 55;
	})
	
	$(document).ready(function() {
		$("#submitAnimButton").click(function() {
			k = 0;

			pauseAnim = false;
			speed = 1000;
			$("#animContent").show();
			var str = '<br><br>';
			str += '<h3>Day: '+(k+1)+' of 55</h3><br>';
			str += '<h3>Expanded Program</h3>';
			str += '<style>.personSI{width: '+dimen+'px;height: '+dimen+'px;float: left;background-color: #3299CC;-webkit-animation-name: toInf;-webkit-animation-duration: '+speed/1000+'s;-webkit-animation-fill-mode: forwards;-moz-animation-name: toInf;-moz-animation-duration:  '+speed/1000+'s;-moz-animation-fill-mode: forwards;border-radius: 50%;animation-name: toInf;animation-duration:  '+speed/1000+'s;animation-fill-mode: forwards;}';
			str += '.personSA{width: '+dimen+'px;height: '+dimen+'px;float: left;background-color: #3299CC;-webkit-animation-name: toAsy;-webkit-animation-duration:  '+speed/1000+'s;-webkit-animation-fill-mode: forwards;-moz-animation-name: toAsy;-moz-animation-duration:  '+speed/1000+'s;-moz-animation-fill-mode: forwards;border-radius: 50%;animation-name: toAsy;animation-duration:  '+speed/1000+'s;animation-fill-mode: forwards;}';
			str += '.personIR{width: '+dimen+'px;height: '+dimen+'px;float: left;background-color: #E3170D;-webkit-animation-name: toIR;-webkit-animation-duration:  '+speed/1000+'s;-webkit-animation-fill-mode: forwards;-moz-animation-name: toIR;-moz-animation-duration:  '+speed/1000+'s;-moz-animation-fill-mode: forwards;border-radius: 50%;animation-name: toIR;animation-duration:  '+speed/1000+'s;animation-fill-mode: forwards;}';
			str += '.personAR{width: '+dimen+'px;height: '+dimen+'px;float: left;background-color: #FFC125;-webkit-animation-name: toAR;-webkit-animation-duration:  '+speed/1000+'s;-webkit-animation-fill-mode: forwards;-moz-animation-name: toAR;-moz-animation-duration:  '+speed/1000+'s;-moz-animation-fill-mode: forwards;border-radius: 50%;animation-name: toAR;animation-duration:  '+speed/1000+'s;animation-fill-mode: forwards;}';
			str += '.personSR{width: '+dimen+'px;height: '+dimen+'px;float: left;background-color: #3299CC;-webkit-animation-name: toSR;-webkit-animation-duration:  '+speed/1000+'s;-webkit-animation-fill-mode: forwards;-moz-animation-name: toSR;-moz-animation-duration:  '+speed/1000+'s;-moz-animation-fill-mode: forwards;border-radius: 50%;animation-name: toSR;animation-duration:  '+speed/1000+'s;animation-fill-mode: forwards;}';
			str += '.personSS{width: '+dimen+'px;height: '+dimen+'px;float: left;background-color: #3299CC;border-radius: 50%;}';
			str += '.personII{width: '+dimen+'px;height: '+dimen+'px;float: left;background-color: #E3170D;border-radius: 50%;}';
			str += '.personAA{width: '+dimen+'px;height: '+dimen+'px;float: left;background-color: #FFC125;border-radius: 50%;}';
			str += '.personRR{width: '+dimen+'px;height: '+dimen+'px;float: left;background-color: #383838;border-radius: 50%;}';
			str += '.personVV{width: '+dimen+'px;height: '+dimen+'px;float: left;background-color: #778899;border-radius: 50%;}';
			str += '</style>';

			var index = 0;
			for(var i = 0; i < numRooms ; i++){
				str +=  '<div class="room1">';
				
				for(var j = 0; j < numPerRoom[i] ; j++){
					
					if(statusArr[index][k] == 1){str += '<div class="personSS"></div>';}
					else if(statusArr[index][k] == 2){str += '<div class="personII"></div>';}
					else if(statusArr[index][k] == 3){str += '<div class="personAA"></div>';}
					else if(statusArr[index][k] == 4){str += '<div class="personRR"></div>';}
					else if(statusArr[index][k] == 5){str += '<div class="personVV"></div>';}
			
					index++;
				}
				
				str +=  '</div>';
			}
			str +=  '<br><h3> Baseline Program </h3>';
			index = 0;
			for(var i = 0; i < numRooms ; i++){
				str +=  '<div class="room1">';
				
				for(var j = 0; j < numPerRoom[i] ; j++){
					
					if(statusArrB[index][k] == 1){str += '<div class="personSS"></div>';}
					else if(statusArrB[index][k] == 2){str += '<div class="personII"></div>';}
					else if(statusArrB[index][k] == 3){str += '<div class="personAA"></div>';}
					else if(statusArrB[index][k] == 4){str += '<div class="personRR"></div>';}
					else if(statusArrB[index][k] == 5){str += '<div class="personVV"></div>';}

					index++;
				}
				
				str +=  '</div>';
			}
			document.getElementById("animContent").innerHTML = str;
		})
		
		$("#speedAnimButton").click(function() {
			if(speed > 200){speed -= 200;}
		})
		
		$("#slowAnimButton").click(function() {
			if(speed < 2000){speed += 200;}
		})
		
		$("#pauseAnimButton").click(function() {
			if(pauseAnim==false){pauseAnim=true;}
			else if(pauseAnim == true && k != 54){pauseAnim = false;}
		})
		
	});
	
	

	animate();
	

	function animate(){

		setTimeout(function () {
			
	var str = '<br><br>';
	//str += '<input type="button" id="submitAnimButton" onclick="startAnimation();" value="Begin Animation" />';
	str += '<h3>Day: '+(k+1)+' of 55</h3><br>';
	str += '<h3>Expanded Program</h3>';
	str += '<style>.personSI{width: '+dimen+'px;height: '+dimen+'px;float: left;background-color: #3299CC;-webkit-animation-name: toInf;-webkit-animation-duration: '+speed/1000+'s;-webkit-animation-fill-mode: forwards;-moz-animation-name: toInf;-moz-animation-duration:  '+speed/1000+'s;-moz-animation-fill-mode: forwards;border-radius: 50%;animation-name: toInf;animation-duration:  '+speed/1000+'s;animation-fill-mode: forwards;}';
	str += '.personSA{width: '+dimen+'px;height: '+dimen+'px;float: left;background-color: #3299CC;-webkit-animation-name: toAsy;-webkit-animation-duration:  '+speed/1000+'s;-webkit-animation-fill-mode: forwards;-moz-animation-name: toAsy;-moz-animation-duration:  '+speed/1000+'s;-moz-animation-fill-mode: forwards;border-radius: 50%;animation-name: toAsy;animation-duration:  '+speed/1000+'s;animation-fill-mode: forwards;}';
	str += '.personIR{width: '+dimen+'px;height: '+dimen+'px;float: left;background-color: #E3170D;-webkit-animation-name: toIR;-webkit-animation-duration:  '+speed/1000+'s;-webkit-animation-fill-mode: forwards;-moz-animation-name: toIR;-moz-animation-duration:  '+speed/1000+'s;-moz-animation-fill-mode: forwards;border-radius: 50%;animation-name: toIR;animation-duration:  '+speed/1000+'s;animation-fill-mode: forwards;}';
	str += '.personAR{width: '+dimen+'px;height: '+dimen+'px;float: left;background-color: #FFC125;-webkit-animation-name: toAR;-webkit-animation-duration:  '+speed/1000+'s;-webkit-animation-fill-mode: forwards;-moz-animation-name: toAR;-moz-animation-duration:  '+speed/1000+'s;-moz-animation-fill-mode: forwards;border-radius: 50%;animation-name: toAR;animation-duration:  '+speed/1000+'s;animation-fill-mode: forwards;}';
	str += '.personSR{width: '+dimen+'px;height: '+dimen+'px;float: left;background-color: #3299CC;-webkit-animation-name: toSR;-webkit-animation-duration:  '+speed/1000+'s;-webkit-animation-fill-mode: forwards;-moz-animation-name: toSR;-moz-animation-duration:  '+speed/1000+'s;-moz-animation-fill-mode: forwards;border-radius: 50%;animation-name: toSR;animation-duration:  '+speed/1000+'s;animation-fill-mode: forwards;}';
	str += '.personSS{width: '+dimen+'px;height: '+dimen+'px;float: left;background-color: #3299CC;border-radius: 50%;}';
	str += '.personII{width: '+dimen+'px;height: '+dimen+'px;float: left;background-color: #E3170D;border-radius: 50%;}';
	str += '.personAA{width: '+dimen+'px;height: '+dimen+'px;float: left;background-color: #FFC125;border-radius: 50%;}';
	str += '.personRR{width: '+dimen+'px;height: '+dimen+'px;float: left;background-color: #383838;border-radius: 50%;}';
	str += '.personVV{width: '+dimen+'px;height: '+dimen+'px;float: left;background-color: #778899;border-radius: 50%;}';
	str += '</style>';

	var index = 0;
	if(pauseAnim){
		for(var i = 0; i < numRooms ; i++){
			str +=  '<div class="room1">';
			
			for(var j = 0; j < numPerRoom[i] ; j++){
				
				if(statusArr[index][k] == 1){str += '<div class="personSS"></div>';}
				else if(statusArr[index][k] == 2){str += '<div class="personII"></div>';}
				else if(statusArr[index][k] == 3){str += '<div class="personAA"></div>';}
				else if(statusArr[index][k] == 4){str += '<div class="personRR"></div>';}
				else if(statusArr[index][k] == 5){str += '<div class="personVV"></div>';}
				
				index++;
			}
			
			str +=  '</div>';
		}
		str +=  '<br><h3> Baseline Program </h3>';
		index = 0;
		for(var i = 0; i < numRooms ; i++){
			str +=  '<div class="room1">';
			
			for(var j = 0; j < numPerRoom[i] ; j++){
				
				if(statusArrB[index][k] == 1){str += '<div class="personSS"></div>';}
				else if(statusArrB[index][k] == 2){str += '<div class="personII"></div>';}
				else if(statusArrB[index][k] == 3){str += '<div class="personAA"></div>';}
				else if(statusArrB[index][k] == 4){str += '<div class="personRR"></div>';}
				else if(statusArrB[index][k] == 5){str += '<div class="personVV"></div>';}
				
				index++;
			}
			
			str +=  '</div>';
		}
		if(k == 55){
			return false;
		}
	}
	else{
	index = 0;
	for(var i = 0; i < numRooms ; i++){
		str +=  '<div class="room1">';
		
		for(var j = 0; j < numPerRoom[i] ; j++){
			
			if(statusArr[index][k] == 1 && statusArr[index][k+1] == 1){str += '<div class="personSS"></div>';}
			else if(statusArr[index][k] == 1 && statusArr[index][k+1] == 2){str += '<div class="personSI"></div>';}
			else if(statusArr[index][k] == 1 && statusArr[index][k+1] == 3){str += '<div class="personSA"></div>';}
			else if(statusArr[index][k] == 2 && statusArr[index][k+1] == 2){str += '<div class="personII"></div>';}
			else if(statusArr[index][k] == 2 && statusArr[index][k+1] == 4){str += '<div class="personIR"></div>';}
			else if(statusArr[index][k] == 1 && statusArr[index][k+1] == 4){str += '<div class="personSR"></div>';}
			else if(statusArr[index][k] == 3 && statusArr[index][k+1] == 3){str += '<div class="personAA"></div>';}
			else if(statusArr[index][k] == 3 && statusArr[index][k+1] == 4){str += '<div class="personAR"></div>';}
			else if(statusArr[index][k] == 4 && statusArr[index][k+1] == 4){str += '<div class="personRR"></div>';}
			else if(statusArr[index][k] == 5 && statusArr[index][k+1] == 5){str += '<div class="personVV"></div>';}

			index++;
		}
		
		str +=  '</div>';
	}
	str +=  '<br><h3> Baseline Program </h3>';
	index = 0;
	for(var i = 0; i < numRooms ; i++){
		str +=  '<div class="room1">';
		
		for(var j = 0; j < numPerRoom[i] ; j++){
			
			if(statusArrB[index][k] == 1 && statusArrB[index][k+1] == 1){str += '<div class="personSS"></div>';}
			else if(statusArrB[index][k] == 1 && statusArrB[index][k+1] == 2){str += '<div class="personSI"></div>';}
			else if(statusArrB[index][k] == 1 && statusArrB[index][k+1] == 3){str += '<div class="personSA"></div>';}
			else if(statusArrB[index][k] == 2 && statusArrB[index][k+1] == 2){str += '<div class="personII"></div>';}
			else if(statusArrB[index][k] == 2 && statusArrB[index][k+1] == 4){str += '<div class="personIR"></div>';}
			else if(statusArrB[index][k] == 1 && statusArrB[index][k+1] == 4){str += '<div class="personSR"></div>';}
			else if(statusArrB[index][k] == 3 && statusArrB[index][k+1] == 3){str += '<div class="personAA"></div>';}
			else if(statusArrB[index][k] == 3 && statusArrB[index][k+1] == 4){str += '<div class="personAR"></div>';}
			else if(statusArrB[index][k] == 4 && statusArrB[index][k+1] == 4){str += '<div class="personRR"></div>';}
			else if(statusArrB[index][k] == 5 && statusArrB[index][k+1] == 5){str += '<div class="personVV"></div>';}
	
			index++;
		}
		
		str +=  '</div>';
	}
	}
	document.getElementById("animContent").innerHTML = str;
	if(pauseAnim){k--;}
	if(k<54){k++;}
	if (k < 54) {animate();}
	else if(k == 54){
		
		pauseAnim = true;
		animate();
	}
	else if(k == 55){
		return false;
	}
		},1.2*speed)

		
	}

	document.getElementById("animContent").innerHTML = '';

}


function changeEffTIV() {
	vacEff = 0.493920054;
}
function changeEffQIV() {
	vacEff = 0.536169484;
}



Array.prototype.clean = function(deleteValue) {
	  for (var i = 0; i < this.length; i++) {
	    if (this[i] == deleteValue) {         
	      this.splice(i, 1);
	      i--;
	    }
	  }
	  return this;
	};

function StdDev(popArr){
	var avg=0;
	var total=0;
	var sigSq = 0;
	
	for(i=0 ; i < popArr.length ; i++){
		total += popArr[i];
	}
	
	avg = total / popArr.length ;
	
	var diffSq = [];
	
	for(i=0 ; i < popArr.length ; i++){
		diffSq.push(Math.pow((popArr[i] - avg) , 2));
	}
	
	total = 0;
	for(i=0 ; i < popArr.length ; i++){
		total += diffSq[i];
	}
	
	sigSq = total / diffSq.length;
	
	return (1.96*Math.sqrt(sigSq) / Math.sqrt(popArr.length));
	
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


function shuffle(array) {
	  var currentIndex = array.length, temporaryValue, randomIndex;

	  while (0 !== currentIndex) {


	    randomIndex = Math.floor(Math.random() * currentIndex);
	    currentIndex -= 1;

	    temporaryValue = array[currentIndex];
	    array[currentIndex] = array[randomIndex];
	    array[randomIndex] = temporaryValue;
	  }

	  return array;
}

 
function addToField(n) {
    textField.value += n;
}


/*!
 * jScrollPane - v2.0.23 - 2016-01-28
 * http://jscrollpane.kelvinluck.com/
 *
 * Copyright (c) 2014 Kelvin Luck
 * Dual licensed under the MIT or GPL licenses.
 */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?module.exports=a(require("jquery")):a(jQuery)}(function(a){a.fn.jScrollPane=function(b){function c(b,c){function d(c){var f,h,j,k,l,o,p=!1,q=!1;if(N=c,void 0===O)l=b.scrollTop(),o=b.scrollLeft(),b.css({overflow:"hidden",padding:0}),P=b.innerWidth()+rb,Q=b.innerHeight(),b.width(P),O=a('<div class="jspPane" />').css("padding",qb).append(b.children()),R=a('<div class="jspContainer" />').css({width:P+"px",height:Q+"px"}).append(O).appendTo(b);else{if(b.css("width",""),p=N.stickToBottom&&A(),q=N.stickToRight&&B(),k=b.innerWidth()+rb!=P||b.outerHeight()!=Q,k&&(P=b.innerWidth()+rb,Q=b.innerHeight(),R.css({width:P+"px",height:Q+"px"})),!k&&sb==S&&O.outerHeight()==T)return void b.width(P);sb=S,O.css("width",""),b.width(P),R.find(">.jspVerticalBar,>.jspHorizontalBar").remove().end()}O.css("overflow","auto"),S=c.contentWidth?c.contentWidth:O[0].scrollWidth,T=O[0].scrollHeight,O.css("overflow",""),U=S/P,V=T/Q,W=V>1,X=U>1,X||W?(b.addClass("jspScrollable"),f=N.maintainPosition&&($||bb),f&&(h=y(),j=z()),e(),g(),i(),f&&(w(q?S-P:h,!1),v(p?T-Q:j,!1)),F(),C(),L(),N.enableKeyboardNavigation&&H(),N.clickOnTrack&&m(),J(),N.hijackInternalLinks&&K()):(b.removeClass("jspScrollable"),O.css({top:0,left:0,width:R.width()-rb}),D(),G(),I(),n()),N.autoReinitialise&&!pb?pb=setInterval(function(){d(N)},N.autoReinitialiseDelay):!N.autoReinitialise&&pb&&clearInterval(pb),l&&b.scrollTop(0)&&v(l,!1),o&&b.scrollLeft(0)&&w(o,!1),b.trigger("jsp-initialised",[X||W])}function e(){W&&(R.append(a('<div class="jspVerticalBar" />').append(a('<div class="jspCap jspCapTop" />'),a('<div class="jspTrack" />').append(a('<div class="jspDrag" />').append(a('<div class="jspDragTop" />'),a('<div class="jspDragBottom" />'))),a('<div class="jspCap jspCapBottom" />'))),cb=R.find(">.jspVerticalBar"),db=cb.find(">.jspTrack"),Y=db.find(">.jspDrag"),N.showArrows&&(hb=a('<a class="jspArrow jspArrowUp" />').bind("mousedown.jsp",k(0,-1)).bind("click.jsp",E),ib=a('<a class="jspArrow jspArrowDown" />').bind("mousedown.jsp",k(0,1)).bind("click.jsp",E),N.arrowScrollOnHover&&(hb.bind("mouseover.jsp",k(0,-1,hb)),ib.bind("mouseover.jsp",k(0,1,ib))),j(db,N.verticalArrowPositions,hb,ib)),fb=Q,R.find(">.jspVerticalBar>.jspCap:visible,>.jspVerticalBar>.jspArrow").each(function(){fb-=a(this).outerHeight()}),Y.hover(function(){Y.addClass("jspHover")},function(){Y.removeClass("jspHover")}).bind("mousedown.jsp",function(b){a("html").bind("dragstart.jsp selectstart.jsp",E),Y.addClass("jspActive");var c=b.pageY-Y.position().top;return a("html").bind("mousemove.jsp",function(a){p(a.pageY-c,!1)}).bind("mouseup.jsp mouseleave.jsp",o),!1}),f())}function f(){db.height(fb+"px"),$=0,eb=N.verticalGutter+db.outerWidth(),O.width(P-eb-rb);try{0===cb.position().left&&O.css("margin-left",eb+"px")}catch(a){}}function g(){X&&(R.append(a('<div class="jspHorizontalBar" />').append(a('<div class="jspCap jspCapLeft" />'),a('<div class="jspTrack" />').append(a('<div class="jspDrag" />').append(a('<div class="jspDragLeft" />'),a('<div class="jspDragRight" />'))),a('<div class="jspCap jspCapRight" />'))),jb=R.find(">.jspHorizontalBar"),kb=jb.find(">.jspTrack"),_=kb.find(">.jspDrag"),N.showArrows&&(nb=a('<a class="jspArrow jspArrowLeft" />').bind("mousedown.jsp",k(-1,0)).bind("click.jsp",E),ob=a('<a class="jspArrow jspArrowRight" />').bind("mousedown.jsp",k(1,0)).bind("click.jsp",E),N.arrowScrollOnHover&&(nb.bind("mouseover.jsp",k(-1,0,nb)),ob.bind("mouseover.jsp",k(1,0,ob))),j(kb,N.horizontalArrowPositions,nb,ob)),_.hover(function(){_.addClass("jspHover")},function(){_.removeClass("jspHover")}).bind("mousedown.jsp",function(b){a("html").bind("dragstart.jsp selectstart.jsp",E),_.addClass("jspActive");var c=b.pageX-_.position().left;return a("html").bind("mousemove.jsp",function(a){r(a.pageX-c,!1)}).bind("mouseup.jsp mouseleave.jsp",o),!1}),lb=R.innerWidth(),h())}function h(){R.find(">.jspHorizontalBar>.jspCap:visible,>.jspHorizontalBar>.jspArrow").each(function(){lb-=a(this).outerWidth()}),kb.width(lb+"px"),bb=0}function i(){if(X&&W){var b=kb.outerHeight(),c=db.outerWidth();fb-=b,a(jb).find(">.jspCap:visible,>.jspArrow").each(function(){lb+=a(this).outerWidth()}),lb-=c,Q-=c,P-=b,kb.parent().append(a('<div class="jspCorner" />').css("width",b+"px")),f(),h()}X&&O.width(R.outerWidth()-rb+"px"),T=O.outerHeight(),V=T/Q,X&&(mb=Math.ceil(1/U*lb),mb>N.horizontalDragMaxWidth?mb=N.horizontalDragMaxWidth:mb<N.horizontalDragMinWidth&&(mb=N.horizontalDragMinWidth),_.width(mb+"px"),ab=lb-mb,s(bb)),W&&(gb=Math.ceil(1/V*fb),gb>N.verticalDragMaxHeight?gb=N.verticalDragMaxHeight:gb<N.verticalDragMinHeight&&(gb=N.verticalDragMinHeight),Y.height(gb+"px"),Z=fb-gb,q($))}function j(a,b,c,d){var e,f="before",g="after";"os"==b&&(b=/Mac/.test(navigator.platform)?"after":"split"),b==f?g=b:b==g&&(f=b,e=c,c=d,d=e),a[f](c)[g](d)}function k(a,b,c){return function(){return l(a,b,this,c),this.blur(),!1}}function l(b,c,d,e){d=a(d).addClass("jspActive");var f,g,h=!0,i=function(){0!==b&&tb.scrollByX(b*N.arrowButtonSpeed),0!==c&&tb.scrollByY(c*N.arrowButtonSpeed),g=setTimeout(i,h?N.initialDelay:N.arrowRepeatFreq),h=!1};i(),f=e?"mouseout.jsp":"mouseup.jsp",e=e||a("html"),e.bind(f,function(){d.removeClass("jspActive"),g&&clearTimeout(g),g=null,e.unbind(f)})}function m(){n(),W&&db.bind("mousedown.jsp",function(b){if(void 0===b.originalTarget||b.originalTarget==b.currentTarget){var c,d=a(this),e=d.offset(),f=b.pageY-e.top-$,g=!0,h=function(){var a=d.offset(),e=b.pageY-a.top-gb/2,j=Q*N.scrollPagePercent,k=Z*j/(T-Q);if(0>f)$-k>e?tb.scrollByY(-j):p(e);else{if(!(f>0))return void i();e>$+k?tb.scrollByY(j):p(e)}c=setTimeout(h,g?N.initialDelay:N.trackClickRepeatFreq),g=!1},i=function(){c&&clearTimeout(c),c=null,a(document).unbind("mouseup.jsp",i)};return h(),a(document).bind("mouseup.jsp",i),!1}}),X&&kb.bind("mousedown.jsp",function(b){if(void 0===b.originalTarget||b.originalTarget==b.currentTarget){var c,d=a(this),e=d.offset(),f=b.pageX-e.left-bb,g=!0,h=function(){var a=d.offset(),e=b.pageX-a.left-mb/2,j=P*N.scrollPagePercent,k=ab*j/(S-P);if(0>f)bb-k>e?tb.scrollByX(-j):r(e);else{if(!(f>0))return void i();e>bb+k?tb.scrollByX(j):r(e)}c=setTimeout(h,g?N.initialDelay:N.trackClickRepeatFreq),g=!1},i=function(){c&&clearTimeout(c),c=null,a(document).unbind("mouseup.jsp",i)};return h(),a(document).bind("mouseup.jsp",i),!1}})}function n(){kb&&kb.unbind("mousedown.jsp"),db&&db.unbind("mousedown.jsp")}function o(){a("html").unbind("dragstart.jsp selectstart.jsp mousemove.jsp mouseup.jsp mouseleave.jsp"),Y&&Y.removeClass("jspActive"),_&&_.removeClass("jspActive")}function p(c,d){if(W){0>c?c=0:c>Z&&(c=Z);var e=new a.Event("jsp-will-scroll-y");if(b.trigger(e,[c]),!e.isDefaultPrevented()){var f=c||0,g=0===f,h=f==Z,i=c/Z,j=-i*(T-Q);void 0===d&&(d=N.animateScroll),d?tb.animate(Y,"top",c,q,function(){b.trigger("jsp-user-scroll-y",[-j,g,h])}):(Y.css("top",c),q(c),b.trigger("jsp-user-scroll-y",[-j,g,h]))}}}function q(a){void 0===a&&(a=Y.position().top),R.scrollTop(0),$=a||0;var c=0===$,d=$==Z,e=a/Z,f=-e*(T-Q);(ub!=c||wb!=d)&&(ub=c,wb=d,b.trigger("jsp-arrow-change",[ub,wb,vb,xb])),t(c,d),O.css("top",f),b.trigger("jsp-scroll-y",[-f,c,d]).trigger("scroll")}function r(c,d){if(X){0>c?c=0:c>ab&&(c=ab);var e=new a.Event("jsp-will-scroll-x");if(b.trigger(e,[c]),!e.isDefaultPrevented()){var f=c||0,g=0===f,h=f==ab,i=c/ab,j=-i*(S-P);void 0===d&&(d=N.animateScroll),d?tb.animate(_,"left",c,s,function(){b.trigger("jsp-user-scroll-x",[-j,g,h])}):(_.css("left",c),s(c),b.trigger("jsp-user-scroll-x",[-j,g,h]))}}}function s(a){void 0===a&&(a=_.position().left),R.scrollTop(0),bb=a||0;var c=0===bb,d=bb==ab,e=a/ab,f=-e*(S-P);(vb!=c||xb!=d)&&(vb=c,xb=d,b.trigger("jsp-arrow-change",[ub,wb,vb,xb])),u(c,d),O.css("left",f),b.trigger("jsp-scroll-x",[-f,c,d]).trigger("scroll")}function t(a,b){N.showArrows&&(hb[a?"addClass":"removeClass"]("jspDisabled"),ib[b?"addClass":"removeClass"]("jspDisabled"))}function u(a,b){N.showArrows&&(nb[a?"addClass":"removeClass"]("jspDisabled"),ob[b?"addClass":"removeClass"]("jspDisabled"))}function v(a,b){var c=a/(T-Q);p(c*Z,b)}function w(a,b){var c=a/(S-P);r(c*ab,b)}function x(b,c,d){var e,f,g,h,i,j,k,l,m,n=0,o=0;try{e=a(b)}catch(p){return}for(f=e.outerHeight(),g=e.outerWidth(),R.scrollTop(0),R.scrollLeft(0);!e.is(".jspPane");)if(n+=e.position().top,o+=e.position().left,e=e.offsetParent(),/^body|html$/i.test(e[0].nodeName))return;h=z(),j=h+Q,h>n||c?l=n-N.horizontalGutter:n+f>j&&(l=n-Q+f+N.horizontalGutter),isNaN(l)||v(l,d),i=y(),k=i+P,i>o||c?m=o-N.horizontalGutter:o+g>k&&(m=o-P+g+N.horizontalGutter),isNaN(m)||w(m,d)}function y(){return-O.position().left}function z(){return-O.position().top}function A(){var a=T-Q;return a>20&&a-z()<10}function B(){var a=S-P;return a>20&&a-y()<10}function C(){R.unbind(zb).bind(zb,function(a,b,c,d){bb||(bb=0),$||($=0);var e=bb,f=$,g=a.deltaFactor||N.mouseWheelSpeed;return tb.scrollBy(c*g,-d*g,!1),e==bb&&f==$})}function D(){R.unbind(zb)}function E(){return!1}function F(){O.find(":input,a").unbind("focus.jsp").bind("focus.jsp",function(a){x(a.target,!1)})}function G(){O.find(":input,a").unbind("focus.jsp")}function H(){function c(){var a=bb,b=$;switch(d){case 40:tb.scrollByY(N.keyboardSpeed,!1);break;case 38:tb.scrollByY(-N.keyboardSpeed,!1);break;case 34:case 32:tb.scrollByY(Q*N.scrollPagePercent,!1);break;case 33:tb.scrollByY(-Q*N.scrollPagePercent,!1);break;case 39:tb.scrollByX(N.keyboardSpeed,!1);break;case 37:tb.scrollByX(-N.keyboardSpeed,!1)}return e=a!=bb||b!=$}var d,e,f=[];X&&f.push(jb[0]),W&&f.push(cb[0]),O.bind("focus.jsp",function(){b.focus()}),b.attr("tabindex",0).unbind("keydown.jsp keypress.jsp").bind("keydown.jsp",function(b){if(b.target===this||f.length&&a(b.target).closest(f).length){var g=bb,h=$;switch(b.keyCode){case 40:case 38:case 34:case 32:case 33:case 39:case 37:d=b.keyCode,c();break;case 35:v(T-Q),d=null;break;case 36:v(0),d=null}return e=b.keyCode==d&&g!=bb||h!=$,!e}}).bind("keypress.jsp",function(b){return b.keyCode==d&&c(),b.target===this||f.length&&a(b.target).closest(f).length?!e:void 0}),N.hideFocus?(b.css("outline","none"),"hideFocus"in R[0]&&b.attr("hideFocus",!0)):(b.css("outline",""),"hideFocus"in R[0]&&b.attr("hideFocus",!1))}function I(){b.attr("tabindex","-1").removeAttr("tabindex").unbind("keydown.jsp keypress.jsp"),O.unbind(".jsp")}function J(){if(location.hash&&location.hash.length>1){var b,c,d=escape(location.hash.substr(1));try{b=a("#"+d+', a[name="'+d+'"]')}catch(e){return}b.length&&O.find(d)&&(0===R.scrollTop()?c=setInterval(function(){R.scrollTop()>0&&(x(b,!0),a(document).scrollTop(R.position().top),clearInterval(c))},50):(x(b,!0),a(document).scrollTop(R.position().top)))}}function K(){a(document.body).data("jspHijack")||(a(document.body).data("jspHijack",!0),a(document.body).delegate('a[href*="#"]',"click",function(b){var c,d,e,f,g,h,i=this.href.substr(0,this.href.indexOf("#")),j=location.href;if(-1!==location.href.indexOf("#")&&(j=location.href.substr(0,location.href.indexOf("#"))),i===j){c=escape(this.href.substr(this.href.indexOf("#")+1));try{d=a("#"+c+', a[name="'+c+'"]')}catch(k){return}d.length&&(e=d.closest(".jspScrollable"),f=e.data("jsp"),f.scrollToElement(d,!0),e[0].scrollIntoView&&(g=a(window).scrollTop(),h=d.offset().top,(g>h||h>g+a(window).height())&&e[0].scrollIntoView()),b.preventDefault())}}))}function L(){var a,b,c,d,e,f=!1;R.unbind("touchstart.jsp touchmove.jsp touchend.jsp click.jsp-touchclick").bind("touchstart.jsp",function(g){var h=g.originalEvent.touches[0];a=y(),b=z(),c=h.pageX,d=h.pageY,e=!1,f=!0}).bind("touchmove.jsp",function(g){if(f){var h=g.originalEvent.touches[0],i=bb,j=$;return tb.scrollTo(a+c-h.pageX,b+d-h.pageY),e=e||Math.abs(c-h.pageX)>5||Math.abs(d-h.pageY)>5,i==bb&&j==$}}).bind("touchend.jsp",function(){f=!1}).bind("click.jsp-touchclick",function(){return e?(e=!1,!1):void 0})}function M(){var a=z(),c=y();b.removeClass("jspScrollable").unbind(".jsp"),O.unbind(".jsp"),b.replaceWith(yb.append(O.children())),yb.scrollTop(a),yb.scrollLeft(c),pb&&clearInterval(pb)}var N,O,P,Q,R,S,T,U,V,W,X,Y,Z,$,_,ab,bb,cb,db,eb,fb,gb,hb,ib,jb,kb,lb,mb,nb,ob,pb,qb,rb,sb,tb=this,ub=!0,vb=!0,wb=!1,xb=!1,yb=b.clone(!1,!1).empty(),zb=a.fn.mwheelIntent?"mwheelIntent.jsp":"mousewheel.jsp";"border-box"===b.css("box-sizing")?(qb=0,rb=0):(qb=b.css("paddingTop")+" "+b.css("paddingRight")+" "+b.css("paddingBottom")+" "+b.css("paddingLeft"),rb=(parseInt(b.css("paddingLeft"),10)||0)+(parseInt(b.css("paddingRight"),10)||0)),a.extend(tb,{reinitialise:function(b){b=a.extend({},N,b),d(b)},scrollToElement:function(a,b,c){x(a,b,c)},scrollTo:function(a,b,c){w(a,c),v(b,c)},scrollToX:function(a,b){w(a,b)},scrollToY:function(a,b){v(a,b)},scrollToPercentX:function(a,b){w(a*(S-P),b)},scrollToPercentY:function(a,b){v(a*(T-Q),b)},scrollBy:function(a,b,c){tb.scrollByX(a,c),tb.scrollByY(b,c)},scrollByX:function(a,b){var c=y()+Math[0>a?"floor":"ceil"](a),d=c/(S-P);r(d*ab,b)},scrollByY:function(a,b){var c=z()+Math[0>a?"floor":"ceil"](a),d=c/(T-Q);p(d*Z,b)},positionDragX:function(a,b){r(a,b)},positionDragY:function(a,b){p(a,b)},animate:function(a,b,c,d,e){var f={};f[b]=c,a.animate(f,{duration:N.animateDuration,easing:N.animateEase,queue:!1,step:d,complete:e})},getContentPositionX:function(){return y()},getContentPositionY:function(){return z()},getContentWidth:function(){return S},getContentHeight:function(){return T},getPercentScrolledX:function(){return y()/(S-P)},getPercentScrolledY:function(){return z()/(T-Q)},getIsScrollableH:function(){return X},getIsScrollableV:function(){return W},getContentPane:function(){return O},scrollToBottom:function(a){p(Z,a)},hijackInternalLinks:a.noop,destroy:function(){M()}}),d(c)}return b=a.extend({},a.fn.jScrollPane.defaults,b),a.each(["arrowButtonSpeed","trackClickSpeed","keyboardSpeed"],function(){b[this]=b[this]||b.speed}),this.each(function(){var d=a(this),e=d.data("jsp");e?e.reinitialise(b):(a("script",d).filter('[type="text/javascript"],:not([type])').remove(),e=new c(d,b),d.data("jsp",e))})},a.fn.jScrollPane.defaults={showArrows:!1,maintainPosition:!0,stickToBottom:!1,stickToRight:!1,clickOnTrack:!0,autoReinitialise:!1,autoReinitialiseDelay:500,verticalDragMinHeight:0,verticalDragMaxHeight:99999,horizontalDragMinWidth:0,horizontalDragMaxWidth:99999,contentWidth:void 0,animateScroll:!1,animateDuration:300,animateEase:"linear",hijackInternalLinks:!1,verticalGutter:4,horizontalGutter:4,mouseWheelSpeed:3,arrowButtonSpeed:0,arrowRepeatFreq:50,arrowScrollOnHover:!1,trackClickSpeed:0,trackClickRepeatFreq:70,verticalArrowPositions:"split",horizontalArrowPositions:"split",enableKeyboardNavigation:!0,hideFocus:!1,keyboardSpeed:0,initialDelay:300,speed:30,scrollPagePercent:.8}});


/*!
 * jQuery Mousewheel 3.1.12
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */
(function (factory) {
    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var toFix  = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
        toBind = ( 'onwheel' in document || document.documentMode >= 9 ) ?
                    ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
        slice  = Array.prototype.slice,
        nullLowestDeltaTimeout, lowestDelta;

    if ( $.event.fixHooks ) {
        for ( var i = toFix.length; i; ) {
            $.event.fixHooks[ toFix[--i] ] = $.event.mouseHooks;
        }
    }

    var special = $.event.special.mousewheel = {
        version: '3.1.12',

        setup: function() {
            if ( this.addEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.addEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = handler;
            }
            // Store the line height and page height for this particular element
            $.data(this, 'mousewheel-line-height', special.getLineHeight(this));
            $.data(this, 'mousewheel-page-height', special.getPageHeight(this));
        },

        teardown: function() {
            if ( this.removeEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.removeEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = null;
            }
            // Clean up the data we added to the element
            $.removeData(this, 'mousewheel-line-height');
            $.removeData(this, 'mousewheel-page-height');
        },

        getLineHeight: function(elem) {
            var $elem = $(elem),
                $parent = $elem['offsetParent' in $.fn ? 'offsetParent' : 'parent']();
            if (!$parent.length) {
                $parent = $('body');
            }
            return parseInt($parent.css('fontSize'), 10) || parseInt($elem.css('fontSize'), 10) || 16;
        },

        getPageHeight: function(elem) {
            return $(elem).height();
        },

        settings: {
            adjustOldDeltas: true, // see shouldAdjustOldDeltas() below
            normalizeOffset: true  // calls getBoundingClientRect for each event
        }
    };

    $.fn.extend({
        mousewheel: function(fn) {
            return fn ? this.bind('mousewheel', fn) : this.trigger('mousewheel');
        },

        unmousewheel: function(fn) {
            return this.unbind('mousewheel', fn);
        }
    });


    function handler(event) {
        var orgEvent   = event || window.event,
            args       = slice.call(arguments, 1),
            delta      = 0,
            deltaX     = 0,
            deltaY     = 0,
            absDelta   = 0,
            offsetX    = 0,
            offsetY    = 0;
        event = $.event.fix(orgEvent);
        event.type = 'mousewheel';

        // Old school scrollwheel delta
        if ( 'detail'      in orgEvent ) { deltaY = orgEvent.detail * -1;      }
        if ( 'wheelDelta'  in orgEvent ) { deltaY = orgEvent.wheelDelta;       }
        if ( 'wheelDeltaY' in orgEvent ) { deltaY = orgEvent.wheelDeltaY;      }
        if ( 'wheelDeltaX' in orgEvent ) { deltaX = orgEvent.wheelDeltaX * -1; }

        // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
        if ( 'axis' in orgEvent && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
            deltaX = deltaY * -1;
            deltaY = 0;
        }

        // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
        delta = deltaY === 0 ? deltaX : deltaY;

        // New school wheel delta (wheel event)
        if ( 'deltaY' in orgEvent ) {
            deltaY = orgEvent.deltaY * -1;
            delta  = deltaY;
        }
        if ( 'deltaX' in orgEvent ) {
            deltaX = orgEvent.deltaX;
            if ( deltaY === 0 ) { delta  = deltaX * -1; }
        }

        // No change actually happened, no reason to go any further
        if ( deltaY === 0 && deltaX === 0 ) { return; }


        if ( orgEvent.deltaMode === 1 ) {
            var lineHeight = $.data(this, 'mousewheel-line-height');
            delta  *= lineHeight;
            deltaY *= lineHeight;
            deltaX *= lineHeight;
        } else if ( orgEvent.deltaMode === 2 ) {
            var pageHeight = $.data(this, 'mousewheel-page-height');
            delta  *= pageHeight;
            deltaY *= pageHeight;
            deltaX *= pageHeight;
        }

        // Store lowest absolute delta to normalize the delta values
        absDelta = Math.max( Math.abs(deltaY), Math.abs(deltaX) );

        if ( !lowestDelta || absDelta < lowestDelta ) {
            lowestDelta = absDelta;

            // Adjust older deltas if necessary
            if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
                lowestDelta /= 40;
            }
        }

        // Adjust older deltas if necessary
        if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
            // Divide all the things by 40!
            delta  /= 40;
            deltaX /= 40;
            deltaY /= 40;
        }

        // Get a whole, normalized value for the deltas
        delta  = Math[ delta  >= 1 ? 'floor' : 'ceil' ](delta  / lowestDelta);
        deltaX = Math[ deltaX >= 1 ? 'floor' : 'ceil' ](deltaX / lowestDelta);
        deltaY = Math[ deltaY >= 1 ? 'floor' : 'ceil' ](deltaY / lowestDelta);

        // Normalise offsetX and offsetY properties
        if ( special.settings.normalizeOffset && this.getBoundingClientRect ) {
            var boundingRect = this.getBoundingClientRect();
            offsetX = event.clientX - boundingRect.left;
            offsetY = event.clientY - boundingRect.top;
        }

        // Add information to the event object
        event.deltaX = deltaX;
        event.deltaY = deltaY;
        event.deltaFactor = lowestDelta;
        event.offsetX = offsetX;
        event.offsetY = offsetY;

        event.deltaMode = 0;


        args.unshift(event, delta, deltaX, deltaY);


        if (nullLowestDeltaTimeout) { clearTimeout(nullLowestDeltaTimeout); }
        nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);

        return ($.event.dispatch || $.event.handle).apply(this, args);
    }

    function nullLowestDelta() {
        lowestDelta = null;
    }

    function shouldAdjustOldDeltas(orgEvent, absDelta) {
        
        return special.settings.adjustOldDeltas && orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
    }

}));


$(document).ready(function() {
	
	$("#autoFillAll").click(function() {
		
		if(fillCount == 0){
			fillCount++;
			var emp =  400;
			
			document.getElementById("textFieldTotEmp").value = emp;
			var age1m = 0; var age1f = 0;
			var age2m = 0; var age2f = 0;
			var age3m = 0; var age3f = 0;
			var age4m = 0; var age4f = 0;
			var age5m = 0; var age5f = 0;
			var age6m = 0; var age6f = 0;
			var age7m = 0; var age7f = 0;
			var age8m = 0; var age8f = 0;
			
			for(var i=0 ; i < emp ; i++){
				var r = Math.random();
				
				if(r < 0.0004){
					var r2 = Math.random();
					if(r2 < 0.565){age1m++;}else{age1f++;}
				}
				else if(r >= 0.0004 && r < 0.0204){
					var r2 = Math.random();
					if(r2 < 0.565){age2m++;}else{age2f++;}
				}
				else if(r >= 0.0204 && r < 0.0854){
					var r2 = Math.random();
					if(r2 < 0.565){age3m++;}else{age3f++;}
				}
				else if(r >= 0.0854 && r < 0.1624){
					var r2 = Math.random();
					if(r2 < 0.565){age4m++;}else{age4f++;}
				}
				else if(r >= 0.1624 && r < 0.2624){
					var r2 = Math.random();
					if(r2 < 0.565){age5m++;}else{age5f++;}
				}
				else if(r >= 0.2624 && r < 0.3964){
					var r2 = Math.random();
					if(r2 < 0.565){age6m++;}else{age6f++;}
				}
				else if(r >= 0.3964 && r < 0.5704){
					var r2 = Math.random();
					if(r2 < 0.565){age7m++;}else{age7f++;}
				}
				else if(r >= 0.5704){
					var r2 = Math.random();
					if(r2 < 0.565){age8m++;}else{age8f++;}
				}
				
			}
			
			document.getElementById("textField1").value = age1m;
			document.getElementById("textField2").value = age1f;
			document.getElementById("textField3").value =  age2m;
			document.getElementById("textField4").value =  age2f;
			document.getElementById("textField5").value =  age3m;
			document.getElementById("textField6").value =  age3f;
			document.getElementById("textField7").value =  age4m;
			document.getElementById("textField8").value =  age4f;
			document.getElementById("textField9").value = age5m;
			document.getElementById("textField10").value =  age5f;
			document.getElementById("textField11").value =  age6m;
			document.getElementById("textField12").value =  age6f;
			document.getElementById("textField13").value =  age7m;
			document.getElementById("textField14").value =  age7f;
			document.getElementById("textField15").value =  age8m;
			document.getElementById("textField16").value =  age8f;
			
			document.getElementById("textFieldVac1").value = "80";
			document.getElementById("textFieldVac2").value = "80";
			document.getElementById("textFieldVac3").value = "80";
			document.getElementById("textFieldVac4").value = "80";
			document.getElementById("textFieldVac5").value = "80";
			document.getElementById("textFieldVac6").value = "80";
			document.getElementById("textFieldVac7").value = "80";
			document.getElementById("textFieldVac8").value = "80";
			
			document.getElementById("textFieldBVac1").value = "0";
			document.getElementById("textFieldBVac2").value = "0";
			document.getElementById("textFieldBVac3").value = "0";
			document.getElementById("textFieldBVac4").value = "0";
			document.getElementById("textFieldBVac5").value = "0";
			document.getElementById("textFieldBVac6").value = "0";
			document.getElementById("textFieldBVac7").value = "0";
			document.getElementById("textFieldBVac8").value = "0";
			
			document.getElementById("backgroundVac").value = "47";
			
			document.getElementById("textFieldCost").value = "137";
			document.getElementById("textFieldVacCost").value = "13";
			
			document.getElementById("textFieldFam1").value = "2.24";
			document.getElementById("textFieldFam2").value = "1.41";
			document.getElementById("textFieldFam3").value = "1.65";
			document.getElementById("textFieldFam4").value = "2.06";
			document.getElementById("textFieldFam5").value = "2.25";
			document.getElementById("textFieldFam6").value = "2.34";
			document.getElementById("textFieldFam7").value = "1.98";
			document.getElementById("textFieldFam8").value = "1.64";		
			
			document.getElementById("textFieldRooms").value = '20';
			document.getElementById("textFieldRoomSize").value = '20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20';
			document.getElementById("textFieldRoomTime").value = '7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7';
			document.getElementById("commonRoomTime").value = "1";
		}
		
		else{
		var emp =  Math.floor((Math.random() * 400+50));
		
		document.getElementById("textFieldTotEmp").value = emp;
		var age1m = 0; var age1f = 0;
		var age2m = 0; var age2f = 0;
		var age3m = 0; var age3f = 0;
		var age4m = 0; var age4f = 0;
		var age5m = 0; var age5f = 0;
		var age6m = 0; var age6f = 0;
		var age7m = 0; var age7f = 0;
		var age8m = 0; var age8f = 0;
		
		for(var i=0 ; i < emp ; i++){
			var r = Math.random();
			
			if(r < 0.0004){
				var r2 = Math.random();
				if(r2 < 0.565){age1m++;}else{age1f++;}
			}
			else if(r >= 0.0004 && r < 0.0204){
				var r2 = Math.random();
				if(r2 < 0.565){age2m++;}else{age2f++;}
			}
			else if(r >= 0.0204 && r < 0.0854){
				var r2 = Math.random();
				if(r2 < 0.565){age3m++;}else{age3f++;}
			}
			else if(r >= 0.0854 && r < 0.1624){
				var r2 = Math.random();
				if(r2 < 0.565){age4m++;}else{age4f++;}
			}
			else if(r >= 0.1624 && r < 0.2624){
				var r2 = Math.random();
				if(r2 < 0.565){age5m++;}else{age5f++;}
			}
			else if(r >= 0.2624 && r < 0.3964){
				var r2 = Math.random();
				if(r2 < 0.565){age6m++;}else{age6f++;}
			}
			else if(r >= 0.3964 && r < 0.5704){
				var r2 = Math.random();
				if(r2 < 0.565){age7m++;}else{age7f++;}
			}
			else if(r >= 0.5704){
				var r2 = Math.random();
				if(r2 < 0.565){age8m++;}else{age8f++;}
			}
			
		}
		
		document.getElementById("textField1").value = age1m;
		document.getElementById("textField2").value = age1f;
		document.getElementById("textField3").value =  age2m;
		document.getElementById("textField4").value =  age2f;
		document.getElementById("textField5").value =  age3m;
		document.getElementById("textField6").value =  age3f;
		document.getElementById("textField7").value =  age4m;
		document.getElementById("textField8").value =  age4f;
		document.getElementById("textField9").value = age5m;
		document.getElementById("textField10").value =  age5f;
		document.getElementById("textField11").value =  age6m;
		document.getElementById("textField12").value =  age6f;
		document.getElementById("textField13").value =  age7m;
		document.getElementById("textField14").value =  age7f;
		document.getElementById("textField15").value =  age8m;
		document.getElementById("textField16").value =  age8f;
		
		document.getElementById("textFieldVac1").value = "80";
		document.getElementById("textFieldVac2").value = "80";
		document.getElementById("textFieldVac3").value = "80";
		document.getElementById("textFieldVac4").value = "80";
		document.getElementById("textFieldVac5").value = "80";
		document.getElementById("textFieldVac6").value = "80";
		document.getElementById("textFieldVac7").value = "80";
		document.getElementById("textFieldVac8").value = "80";
		
		document.getElementById("textFieldBVac1").value = "33";
		document.getElementById("textFieldBVac2").value = "33";
		document.getElementById("textFieldBVac3").value = "33";
		document.getElementById("textFieldBVac4").value = "33";
		document.getElementById("textFieldBVac5").value = "33";
		document.getElementById("textFieldBVac6").value = "33";
		document.getElementById("textFieldBVac7").value = "33";
		document.getElementById("textFieldBVac8").value = "47";
		
		document.getElementById("backgroundVac").value = "47";
		
		document.getElementById("textFieldCost").value = "137";
		document.getElementById("textFieldVacCost").value = "13";
		
		document.getElementById("textFieldFam1").value = "2.24";
		document.getElementById("textFieldFam2").value = "1.41";
		document.getElementById("textFieldFam3").value = "1.65";
		document.getElementById("textFieldFam4").value = "2.06";
		document.getElementById("textFieldFam5").value = "2.25";
		document.getElementById("textFieldFam6").value = "2.34";
		document.getElementById("textFieldFam7").value = "1.98";
		document.getElementById("textFieldFam8").value = "1.64";
		
		var rooms = [];
		var roomNum = Math.round(emp*0.025);
		
		for(var i=0 ; i < roomNum ; i++){
			rooms[i] = 0;
		}
		
		for(var i=0 ; i < emp ; i++){
			
			var r = Math.floor((Math.random() * (rooms.length)));
			rooms[r]++;
			
		}
		
		var roomS = '';
		var roomT = '';
		
		for(var i = 0; i < rooms.length ; i++){
			if(i == rooms.length-1){
				roomS += rooms[i];
				roomT += '7'
			}
			else{roomS += rooms[i]+',';
			roomT += '7,'}
		}
		
		
		document.getElementById("textFieldRooms").value = rooms.length;
		document.getElementById("textFieldRoomSize").value = roomS;
		document.getElementById("textFieldRoomTime").value = roomT;
		document.getElementById("commonRoomTime").value = "1";
		}
		
	})
	
	$("#autoFill").click(function() {
		// taken from US gov data https://data.govloop.com/Government/Age-Distribution-of-Federal-Employees-Number-and-P/k5kr-j98h
		// https://www.census.gov/newsroom/pdf/women_workforce_slides.pdf
		var emp = parseInt(document.getElementById("textFieldTotEmp").value);
		
		if(isNaN(parseInt(document.getElementById("textFieldTotEmp").value))){
			window.confirm("Please enter total number of employees.");
			return;
		}
		var age1m = 0; var age1f = 0;
		var age2m = 0; var age2f = 0;
		var age3m = 0; var age3f = 0;
		var age4m = 0; var age4f = 0;
		var age5m = 0; var age5f = 0;
		var age6m = 0; var age6f = 0;
		var age7m = 0; var age7f = 0;
		var age8m = 0; var age8f = 0;
		
		for(var i=0 ; i < emp ; i++){
			var r = Math.random();
			
			if(r < 0.0004){
				var r2 = Math.random();
				if(r2 < 0.565){age1m++;}else{age1f++;}
			}
			else if(r >= 0.0004 && r < 0.0204){
				var r2 = Math.random();
				if(r2 < 0.565){age2m++;}else{age2f++;}
			}
			else if(r >= 0.0204 && r < 0.0854){
				var r2 = Math.random();
				if(r2 < 0.565){age3m++;}else{age3f++;}
			}
			else if(r >= 0.0854 && r < 0.1624){
				var r2 = Math.random();
				if(r2 < 0.565){age4m++;}else{age4f++;}
			}
			else if(r >= 0.1624 && r < 0.2624){
				var r2 = Math.random();
				if(r2 < 0.565){age5m++;}else{age5f++;}
			}
			else if(r >= 0.2624 && r < 0.3964){
				var r2 = Math.random();
				if(r2 < 0.565){age6m++;}else{age6f++;}
			}
			else if(r >= 0.3964 && r < 0.5704){
				var r2 = Math.random();
				if(r2 < 0.565){age7m++;}else{age7f++;}
			}
			else if(r >= 0.5704){
				var r2 = Math.random();
				if(r2 < 0.565){age8m++;}else{age8f++;}
			}
			
		}
		
		document.getElementById("textField1").value = age1m;
		document.getElementById("textField2").value = age1f;
		document.getElementById("textField3").value =  age2m;
		document.getElementById("textField4").value =  age2f;
		document.getElementById("textField5").value =  age3m;
		document.getElementById("textField6").value =  age3f;
		document.getElementById("textField7").value =  age4m;
		document.getElementById("textField8").value =  age4f;
		document.getElementById("textField9").value = age5m;
		document.getElementById("textField10").value =  age5f;
		document.getElementById("textField11").value =  age6m;
		document.getElementById("textField12").value =  age6f;
		document.getElementById("textField13").value =  age7m;
		document.getElementById("textField14").value =  age7f;
		document.getElementById("textField15").value =  age8m;
		document.getElementById("textField16").value =  age8f;
		
	})
	
	$("#autoFill2").click(function() {
		// taken from US census http://www.census.gov/hhes/families/data/cps2012AVG.html
		document.getElementById("textFieldBVac1").value = "33";
		document.getElementById("textFieldBVac2").value = "33";
		document.getElementById("textFieldBVac3").value = "33";
		document.getElementById("textFieldBVac4").value = "33";
		document.getElementById("textFieldBVac5").value = "33";
		document.getElementById("textFieldBVac6").value = "33";
		document.getElementById("textFieldBVac7").value = "33";
		document.getElementById("textFieldBVac8").value = "47";
	})
	
	$("#autoFill3").click(function() {
		// taken from US census http://www.census.gov/hhes/families/data/cps2012AVG.html
		document.getElementById("textFieldFam1").value = "2.24";
		document.getElementById("textFieldFam2").value = "1.41";
		document.getElementById("textFieldFam3").value = "1.65";
		document.getElementById("textFieldFam4").value = "2.06";
		document.getElementById("textFieldFam5").value = "2.25";
		document.getElementById("textFieldFam6").value = "2.34";
		document.getElementById("textFieldFam7").value = "1.98";
		document.getElementById("textFieldFam8").value = "1.64";
	})
	
	$("#autoFill6").click(function() {
		document.getElementById("textFieldCost").value = "137";
	})
	$("#autoFill7").click(function() {
		document.getElementById("textFieldVacCost").value = "13";
	})
	$("#autoFill8").click(function() {
		document.getElementById("backgroundVac").value = "47";
	})
	
	$("#autoFill4").click(function() {
		
		var emp = parseInt(document.getElementById("textFieldTotEmp").value);
		if(isNaN(parseInt(document.getElementById("textFieldTotEmp").value))){
			window.confirm("Please enter total number of employees.");
			return;
		}
		var rooms = [];
		var roomNum = Math.round(emp*0.025);
		
		for(var i=0 ; i < roomNum ; i++){
			rooms[i] = 0;
		}
		
		for(var i=0 ; i < emp ; i++){
			
			var r = Math.floor((Math.random() * (rooms.length)));
			rooms[r]++;
			
		}
		
		var roomS = '';
		var roomT = '';
		
		for(var i = 0; i < rooms.length ; i++){
			if(i == rooms.length-1){
				roomS += rooms[i];
				roomT += '7'
			}
			else{roomS += rooms[i]+',';
			roomT += '7,'}
		}
		
		
		document.getElementById("textFieldRooms").value = rooms.length;
		document.getElementById("textFieldRoomSize").value = roomS;
		document.getElementById("textFieldRoomTime").value = roomT;
		document.getElementById("commonRoomTime").value = "1";
	})
	
	 $("#autoFill5").click(function() {
    	document.getElementById("textFieldVac1").value = "80";
		document.getElementById("textFieldVac2").value = "80";
		document.getElementById("textFieldVac3").value = "80";
		document.getElementById("textFieldVac4").value = "80";
		document.getElementById("textFieldVac5").value = "80";
		document.getElementById("textFieldVac6").value = "80";
		document.getElementById("textFieldVac7").value = "80";
		document.getElementById("textFieldVac8").value = "80";
	})
	
	$("#modelDescription").hide();
	$("#showDes").click(function() {
		$("#modelDescription").show();
		$("#showDes").hide();
	})
	$("#hideDes").click(function() {
		$("#modelDescription").hide();
		$("#showDes").show();
	})
	
	$("body").bind('Custom.Start', function(ev) {
		$("#loadBox").html('<h2>Calculating...</h2>');
		$("#loadBox").show();
    });
    
    $("body").bind('Custom.End', function(ev) {
    	$("#loadBox").hide(); 
    	$("#outputBox").hide();
    	$("#outputBox2").hide();
    	$("#outputBox3").hide();
    	$("#outputBox4").hide();
    	$("#outputBox5").hide();
    	$("#outputBox6").hide();
    	$("#mbox").hide();
    	$("#outputBox").fadeIn(1000);
    	$("#outputBox2").fadeIn(1000);
    	$("#outputBox3").fadeIn(1000);
    	$("#outputBox4").fadeIn(1000);
    	$("#outputBox5").fadeIn(1000);
    	$("#outputBox6").fadeIn(1000);
    });
    
	
	$("#submitButton").click(function() {
		$("body").trigger('Custom.Start');
		
		setTimeout(function() {
			try
            {
				buttonClicked();
            }
			
			finally
            {
                $("body").trigger('Custom.End');
            }
		
		}, 50);
	})

        // Tooltip only Text
        $('.masterTooltip').hover(function(){
                // Hover over code
                var title = $(this).attr('title');
                $(this).data('tipText', title).removeAttr('title');
                $('<p class="tooltip"></p>')
                .text(title)
                .appendTo('body')
                .fadeIn('fast');
        }, function() {
                // Hover out code
                $(this).attr('title', $(this).data('tipText'));
                $('.tooltip').remove();
        }).mousemove(function(e) {
                var mousex = e.pageX + 20; 
                var mousey = e.pageY + 10;
                $('.tooltip')
                .css({ top: mousey, left: mousex })
        });
});