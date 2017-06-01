var csv = `
distance.text,distance.value,duration.text,duration.value,status,userOrigin,userDestination,googleOrigin,googleDestination,rowId
"0,6 km",645,"1 min",57,"OK","1600 Amphitheatre Parkway, Mountain View, CA","10 Amphitheatre Parkway, Mountain View, CA","Google Bldg 41, 1600 Amphitheatre Pkwy, Mountain View, CA 94043, EUA","10 Amphitheatre Pkwy, Mountain View, CA 94043, EUA","00"
"15,6 km",15571,"14 minutos",813,"OK","1600 Amphitheatre Parkway, Mountain View, CA","200 Spring St, San Francisco, CA","Google Bldg 41, 1600 Amphitheatre Pkwy, Mountain View, CA 94043, EUA","200 Spring St, Redwood City, CA 94063, EUA","01"
"59,0 km",59028,"44 minutos",2665,"OK","100 Main St, San Franciso, CA","10 Amphitheatre Parkway, Mountain View, CA","100 Main St, San Francisco, CA 94105, EUA","10 Amphitheatre Pkwy, Mountain View, CA 94043, EUA","10"
"44,8 km",44795,"37 minutos",2193,"OK","100 Main St, San Franciso, CA","200 Spring St, San Francisco, CA","100 Main St, San Francisco, CA 94105, EUA","200 Spring St, Redwood City, CA 94063, EUA","11"
`
var originsCsv;
var destCsv;
var originsJson;
var destJson;
var originsKeys;
var destKeys;

function parseCsv() {
  originsCsv = $('#origins').val().trim();
  destCsv = $('#dest').val().trim();
  originsJson = Papa.parse(originsCsv, {
    header: true
  });
  destJson = Papa.parse(destCsv, {
    header: true
  });
  console.log(originsJson, destJson);
  if (originsJson.errors.length === 0 && destJson.errors.length === 0) {
    originsKeys = Object.keys(originsJson.data[0]);
    destKeys = Object.keys(destJson.data[0]);
    populateSelect('#originsColumns', originsKeys);
    populateSelect('#originsId', originsKeys);
    populateSelect('#destColumns', destKeys);
    populateSelect('#destId', destKeys);
  } else {
    alert('There was an error processing your CSV; Try again.');
    // FIXME: add actual error message from .errors
  }
}

function populateSelect(id, array) {
  var option = '';
  for (var i=0;i<array.length;i++){
     option += '<option value="'+ array[i] + '">' + array[i] + '</option>';
  }
  $(id).append(option);
}

function calculate() {
  var addressColOrigin = $('#originsColumns').val();
  var addressColDest = $('#destColumns').val();
  var idColOrigin = $('#originsId').val();
  var idColDest = $('#destId').val();
  var travelMode = $('#travelMode').val();
  var units = $('#units').val();
  var language = $('#language').val();
  var apiKey = $('#apiKey').val();
  var originAddressList = [];
  for (var i = 0; i < originsJson.data.length; i++) {
    originAddressList.push(originsJson.data[i][addressColOrigin]);
  }
  var destAddressList = [];
  for (var i = 0; i < destJson.data.length; i++) {
    destAddressList.push(destJson.data[i][addressColDest]);
  }
  var originIdList = [];
  for (var i = 0; i < originsJson.data.length; i++) {
    originIdList.push(originsJson.data[i][idColOrigin]);
  }
  var destIdList = [];
  for (var i = 0; i < destJson.data.length; i++) {
    destIdList.push(destJson.data[i][idColDest]);
  }
  var json = {
    originAddressList: originAddressList,
    destAddressList: destAddressList,
    originIdList: originIdList,
    destIdList: destIdList,
    travelMode: travelMode,
    units: units,
    language: language,
    apiKey: apiKey
  };
  console.log(json);
  postJson(json);
}

function postJson(json) {
  $('#calculate').addClass('disabled');
  $.ajax({
    type: "POST",
    url: "/distance-matrix",
    // The key needs to match your method's input parameter (case-sensitive).
    data: JSON.stringify(json),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function(data) {
      console.log(JSON.stringify(data));
      $('#result').val(data.result);
      $('#calculate').removeClass('disabled');

    },
    failure: function(errMsg) {
        alert(errMsg);
        $('#calculate').removeClass('disabled');
    }
});
}


function saveTextAsFile() {
  var textToWrite = $('#result').val().trim();
  var textFileAsBlob = new Blob([ textToWrite ], { type: 'text/plain' });
  var fileNameToSaveAs = "result.csv";

  var downloadLink = document.createElement("a");
  downloadLink.download = fileNameToSaveAs;
  downloadLink.innerHTML = "Download File";
  if (window.webkitURL != null) {
    // Chrome allows the link to be clicked without actually adding it to the DOM.
    downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
  } else {
    // Firefox requires the link to be added to the DOM before it can be clicked.
    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
    downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
  }

  downloadLink.click();
}

var button = document.getElementById('save');
button.addEventListener('click', saveTextAsFile);

function destroyClickedElement(event) {
  // remove the link from the DOM
  document.body.removeChild(event.target);
}
