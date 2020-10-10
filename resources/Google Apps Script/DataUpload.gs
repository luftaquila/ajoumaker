var SHEET_NAME = "장비사용";
var SCRIPT_PROP = PropertiesService.getScriptProperties();
function doGet(e) { return handleResponse(e); }
function doPost(e) { return handleResponse(e); }
function handleResponse(e) {
  var lock = LockService.getPublicLock();
  lock.waitLock(30000);
  try {
    var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
    var sheet = doc.getSheetByName(SHEET_NAME);

    var headRow = e.parameter.header_row || 1;
    var headers = sheet.getRange(1, 1, 1, 12).getValues()[0];
    var nextRow = sheet.getLastRow() + 1;
    var row = [];

    if(e.parameter['이름']) {
      for (i in headers) { row.push(e.parameter[headers[i]]); }
      sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);
      return ContentService
            .createTextOutput(JSON.stringify({"result":"success", "row": nextRow}))
            .setMimeType(ContentService.MimeType.JSON);
    }
    else if(e.parameter['인증']) {
      var data = sheet.getRange('A2:M').getValues();
      for (i in data) {
        if(data[i][1] == e.parameter['사용자']) {
          if(data[i][0] == e.parameter['날짜']) {
            if(data[i][2] == e.parameter['소속']) {
              if(data[i][5] == e.parameter['파일명']) {
                if(data[i][6] == e.parameter['장비']) {
                  if(data[i][7] == e.parameter['시간']) {
                    sheet.getRange('M' + (Number(i) + 2)).setValue('1');
                  }}}}}}
      }
    }
    else {
      var data = sheet.getRange('A2:M').getValues(), csv = "";
      for (i in data) {
        for(var j = 0; j < 13; j++) {
          csv += data[i][j];
          if(j == 12) { csv += '\n'; }
          else { csv += ','; }
        }
      }
      return ContentService
            .createTextOutput(csv)
            .setMimeType(ContentService.MimeType.CSV);
    }
  }
  catch(e) {
    return ContentService
          .createTextOutput(JSON.stringify({"result":"error", "error": e}))
          .setMimeType(ContentService.MimeType.JSON);
  }
  finally {
    lock.releaseLock();
    sheet.getRange("A:L").setHorizontalAlignment("center");
    sheet.getRange("A:L").setVerticalAlignment("middle");
  }
}
function setup() {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    SCRIPT_PROP.setProperty("key", doc.getId());
}
