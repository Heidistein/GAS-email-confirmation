//## SETTING ####################################################################################

/** Email subject */
var SUBJECT = "Předmět emailu";
/** Start from row */
var START_ROW = 2;
/** Number of rows */
var NUM_ROWS = 1;
/** Html file name without the '.html', which contains the template code for email. */
var HTML_TEMPLATE_NAME = "template"
/** Name of the column that contains the customer's e-mail. */
var EMAIL_COLUMN_HEADER_NAME = "Email"

/**
* Main function.
*/
function main(){ 
  var sheet = SpreadsheetApp.getActiveSheet(); 
  var headersData = sheet.getRange( 1, 1, 1, sheet.getLastColumn()).getValues()[0]; 
  
  var dataRange = sheet.getRange(START_ROW, 1, NUM_ROWS, sheet.getLastColumn())
  var data = dataRange.getValues();
  for (i in data) {  
    var row = data[i];
    sendEmail( getObjectFromArrays( headersData, row ) )                   
  }
}
//###############################################################################################

/**
* Sets the email variables and send email.
*
* @param ${Object} data JavaScript object for filling template
*/
function sendEmail( data ){  
  var email = data[ normalizeHeader( EMAIL_COLUMN_HEADER_NAME )];
  var message = fillInTemplateFromObject( HtmlService.createTemplateFromFile( HTML_TEMPLATE_NAME ).evaluate().getContent(), data);        
  MailApp.sendEmail( email, SUBJECT, "", {htmlBody: message});
}

/**
* Finds the last row as data and first row as keys and returns it as an object.
* 
* @return {Object} object with keys and values
*/
function getDataFromLastRow(){
  var sheet = SpreadsheetApp.getActiveSheet();  
  var headersData = sheet.getRange( 1, 1, 1, sheet.getLastColumn()).getValues()[0];  
  var valuesData = sheet.getRange( sheet.getLastRow(), 1, 1, sheet.getLastColumn()).getValues()[0];     
  return getObjectFromArrays( headersData, valuesData )
}

/**
* Replaces markers in a template string with values define in a JavaScript data object.
*
* @author Google
* @param {String} template String containing markers, for instance ${"Column name"}
* @param {Object} data JavaScript object with keys and values
* @return {String} String without markers. If no data is found to replace a marker, it is simply removed.
*/  
function fillInTemplateFromObject(template, data) {
  var body = template;
  // Search for all the variables to be replaced, for instance ${"Column name"}
  var templateVars = template.match(/\$\{\"[^\"]+\"\}/g);
   
  for (var i = 0; i < templateVars.length; ++i) {    
    var variableData = data[normalizeHeader(templateVars[i])];
    body = body.replace(templateVars[i], variableData || "");
  }

  return body;
}

/**
* Normalizes a string, by removing all alphanumeric characters and using mixed case
* to separate words. The output will always start with a lower case letter.
* This function is designed to produce JavaScript object property names.
*
* Examples:
*   "First Name" -> "firstName"
*   "Market Cap (millions) -> "marketCapMillions
*   "1 number at the beginning is ignored" -> "numberAtTheBeginningIsIgnored"
*
* @author Google
* @param {String} columnName string to normalize
* @return {String} key
*/
function normalizeHeader( header ) {
  var key = "";
  var upperCase = false;
  for (var i = 0; i < header.length; ++i) {
    var letter = header[i];
    if (letter == " " && key.length > 0) {
      upperCase = true;
      continue;
    }
    if (!isAlnum(letter)) {
      continue;
    }
    if (key.length == 0 && isDigit(letter)) {
      continue; // first character must be a letter
    }
    if (upperCase) {
      upperCase = false;
      key += letter.toUpperCase();
    } else {
      key += letter.toLowerCase();
    }
  }
  return key;
}

/**
* Generates an object that contains the data. Names of object fields are defined in keys.
*
* @param keys array of keys.
* @param data array of values
* @return object with keys and values
*/
function getObjectFromArrays( keys, data ) { 
    var object = {};
    var hasData = false;
    for (var j = 0; j < data.length; ++j) {
      var cellData = data[j];
      if (isCellEmpty(cellData)) {
        continue;
      }
      object[ normalizeHeader( keys[j] )] = cellData;
      hasData = true;
    }     
    
    return object;
}

/** 
* Returns true if the cell where cellData was read from is empty.
*
* @param {boolean}
*/
function isCellEmpty(cellData) {
  return typeof(cellData) == "string" && cellData == "";
}

/** 
* Returns true if the character char is alphabetical, false otherwise.
*
* @param {boolean}
*/
function isAlnum(char) {
  return char >= 'A' && char <= 'Z' ||
    char >= 'a' && char <= 'z' ||
    isDigit(char);
}

/** 
* Returns true if the character char is a digit, false otherwise.
*
* @param {boolean}
*/
function isDigit(char) {
  return char >= '0' && char <= '9';
}
