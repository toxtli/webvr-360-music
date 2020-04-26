function doGet(e) {
  var result = {"status": "error", "value": "Action not supported"};
  if (e.parameter.hasOwnProperty('a') && e.parameter.hasOwnProperty('q')) {
    if (e.parameter.a == 'store') {
      try {
        var arr = JSON.parse(e.parameter.q);
        if (Array.isArray) {
          var rowNum = addRow(arr);
          result = {"status": "OK", "value": rowNum};
        }
      } catch(err) {}
    }
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON); 
}

function addRow(arr) {
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.appendRow(arr);
  return sheet.getLastRow();
}