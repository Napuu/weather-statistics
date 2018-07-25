var XMLParser = require('react-xml-parser');

class Fetch {
    constructor() {
    }
    fetch() {
        fetch("http://data.fmi.fi/fmi-apikey/c032f648-f04d-48b7-95e5-af7541906622/wfs?request=getFeature&storedquery_id=fmi::observations::weather::sounding::multipointcoverage&latest=true")
        .then((resp) => resp.text())
        .then(data => {
            let xml = new XMLParser().parseFromString(data);

            //allPositions is "4-dimensional list"
            //[pos1lat, pos1lng, pos1altitude, pos1seconds, ...]
            //[degrees, degrees, meters, seconds since 1970...]
            //
            //readings is "4-dimensional list"
            //[wind speed, wind direction1, air temperature1, dev point1, ...]
            //[m/s, degrees, celcius, celcius]
            //
            //readings and allPositions share indexing. readings[0-3] is from position allPositions[0-3], 4-7, 8-11 etc..
            //
            //importantPositions is "3-dimensional list"
            //[pos1lat, pos1lng, pos1meters, pos2lat, pos2lng, pos2meter...]
            //[deg, deg, meters,...]
            
            let allPositionsJSON = xml.getElementsByTagName("gmlcov:positions");
            let allPositionsGrouped = [];
            let allReadingsJSON = xml.getElementsByTagName("gml:doubleOrNilReasonTupleList");
            let allReadingsGrouped = [];
            let importantPositionsJSON = xml.getElementsByTagName('gml:posList');
            let importantPositionsGrouped = [];

            let importantData = [];
            for (let locationIndex = 0; locationIndex < allPositionsJSON.length; locationIndex++) {
                let allPositionsCurrentLocation = allPositionsJSON[locationIndex].value.split(" ");
                allPositionsCurrentLocation.pop();
                allPositionsGrouped[locationIndex] = [];
                while (allPositionsCurrentLocation.length > 0) {
                    let entry = {};
                    entry["latitude"] = allPositionsCurrentLocation.shift();
                    entry["longitude"] = allPositionsCurrentLocation.shift();
                    entry["altitude"] = allPositionsCurrentLocation.shift();
                    entry["seconds"] = allPositionsCurrentLocation.shift(); 
                    allPositionsGrouped[locationIndex].push(entry);
                }
                
                let allReadingsCurrentLocation = allReadingsJSON[locationIndex].value.split(" ");
                allReadingsCurrentLocation.pop();
                allReadingsGrouped[locationIndex] = [];
                while (allReadingsCurrentLocation.length > 0) {
                    let entry = {};
                    entry["windSpeed"] = allReadingsCurrentLocation.shift();
                    entry["windDirection"] = allReadingsCurrentLocation.shift();
                    entry["airTemperature"] = allReadingsCurrentLocation.shift();
                    entry["devPoint"] = allReadingsCurrentLocation.shift();
                    allReadingsGrouped[locationIndex].push(entry);
                }

                let importantPositionsCurrentLocation = importantPositionsJSON[locationIndex].value.split(" ");
                importantPositionsCurrentLocation.pop();
                importantPositionsGrouped[locationIndex] = [];
                while (importantPositionsCurrentLocation.length > 0) {
                    let entry = {};
                    entry["latitude"] = importantPositionsCurrentLocation.shift();
                    entry["longitude"] = importantPositionsCurrentLocation.shift();
                    entry["altitude"] = importantPositionsCurrentLocation.shift();
                    importantPositionsGrouped[locationIndex].push(entry);
                }

                importantData[locationIndex] = [];
                while (importantPositionsGrouped[locationIndex].length) {
                    let currentImportantPosition = importantPositionsGrouped[locationIndex].shift();
                    while (1) {
                        let currentCandidatePosition = allPositionsGrouped[locationIndex].shift();
                        let currentCandidateReading = allReadingsGrouped[locationIndex].shift();
                        if (currentCandidatePosition["latitude"] == currentImportantPosition["latitude"]
                            && currentCandidatePosition["longitude"] == currentImportantPosition["longitude"]
                            && currentCandidatePosition["altitude"] == currentImportantPosition["altitude"]) {
                            let addable = Object.assign(currentCandidatePosition, currentCandidateReading);
                            importantData[locationIndex].push(addable);
                            break;
                        }
                    }
                }
            }
            console.log(importantData);


            return importantData;

        })
        .catch((err) => {
            console.log("ERR: " + err);
        });
    }

}

export {Fetch}
//sounding request
//http://data.fmi.fi/fmi-apikey/c032f648-f04d-48b7-95e5-af7541906622/wfs?request=getFeature&storedquery_id=fmi::observations::weather::sounding::multipointcoverage&latest=true

