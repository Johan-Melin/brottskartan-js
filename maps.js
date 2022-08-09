let map;
const iconBase =
"http://maps.google.com/mapfiles/kml/shapes/";
const icons = {
    cabs: {
        icon: iconBase + "cabs.png",
    },
    police: {
        icon: iconBase + "police.png",
    },
    firedept: {
        icon: iconBase + "firedept.png",
    },
    info: {
        icon: iconBase + "info-i_maps.png",
    },
};
const sammanfattning = ["sammanfattning dag", "sammanfattning dygn", "sammanfattning eftermiddag", "sammanfattning förmiddag", "sammanfattning helg", "sammanfattning kväll", "sammanfattning kväll och natt", "sammanfattning natt", "sammanfattning vecka"];
const trafik = ["trafikbrott", "trafikhinder", "trafikkontroll", "trafikolycka", "trafikolycka, personskada", "trafikolycka, singel", "trafikolycka, smitning från", "trafikolycka, vilt"];
const brand = ["brand"];

let loc = { lat: 59.334591, lng: 18.063240 }
let typeSet = {};

const control = document.getElementById("control");

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: loc,
    zoom: 12,
  });
}

function getCrimes(){
    axios.get('https://polisen.se/api/events')
  .then(function (response) {
	displayCrimeMarkers(response)
  })
  .catch(function (error) {
    console.log(error);
  })
  .then(function () {
    // always executed
  });
}

function displayCrimeMarkers(received){
    received['data'].map(item => {
        const contentString = 
        `<h3>${item.name}</h3>` +
        `<a href="https://polisen.se${item.url}" target=_blank>${item.summary}</a>`
        ;
        const infowindow = new google.maps.InfoWindow({
            content: contentString,
          });         
        const marker = new google.maps.Marker({
            position: getLatLong(item.location.gps),
            map,
            icon: {
                url: getMarker(item.type),
                scaledSize: new google.maps.Size(24, 24),
            },
            title: item.type,
            optimized: true 
          });
          marker.addListener("click", () => {
            infowindow.open({
              anchor: marker,
              map,
              shouldFocus: false,
            });
          });        
    })
    printCrimes()
    console.log(typeSet);
}

function printCrimes(){
    const sortable = [];
    for(item in typeSet){
        sortable.push([item, typeSet[item]]);
    }
    sortable.sort(function(a, b) {
        return b[1] - a[1];
    });
    control.innerHTML = '<h3>'+sortable.length+'</h3>'+ '<br />';
    sortable.map(item => {
        control.innerHTML += item+ '<br />';
    });
}

function getLatLong(gpsCoord){
    let latLng = gpsCoord.split(",");
    return {lat: +latLng[0], lng: +latLng[1]};
}

function getMarker(type){
    typeSet[type] = typeSet[type] || 0;
    typeSet[type]++;
    if(trafik.includes(type.toLowerCase())){
        return icons["cabs"].icon
    }
    else if(sammanfattning.includes(type.toLowerCase())){
        return icons["info"].icon
    }
    else if(brand.includes(type.toLowerCase())){
        return icons["firedept"].icon
    }
    else{
         return icons["police"].icon
    }
}

getCrimes();