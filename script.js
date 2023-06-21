var spreadsheetId = '13VTJcjzjY6e4bPMtG9O8rHWgOLbzVgROYSm_I3x-vLw';
var apiKey = 'AIzaSyCyDHl4lRzG7Gk_iiNHeABsO4_riUrVzcY';
var sheetName = ''; // Initialize the sheet name variable

// Fetch kecamatans
function fetchKecamatans() {
  fetchData('Dashboard!C11:C18', 'kecamatan');
}

// Fetch names based on the selected kecamatan
function fetchNames() {
  var kecamatan = document.getElementById('kecamatan').value;
  var selectedName = document.getElementById('name').value;
  sheetName = `${kecamatan}!N2:N`; // Update the sheet name variable

  fetchData(sheetName, 'name')
    .then(selectedName => {
      fetchDataForName(selectedName);
    });
}

// Clear dropdown options
function clearDropdown(dropdownId) {
  var dropdown = document.getElementById(dropdownId);

  if (dropdown) {
    while (dropdown.firstChild) {
      dropdown.removeChild(dropdown.firstChild);
    }
  } else {
    console.log("Dropdown element not found.");
  }
}
// Fetch data from Google Spreadsheet and populate the dropdown
function fetchData(range, dropdownId) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;

  return fetch(url)
    .then(response => response.json())
    .then(data => {
      var values = data.values;

      var dropdown = document.getElementById(dropdownId);

      if (values && values.length > 0) {
        var uniqueNames = new Set(); // Use a Set to store unique names

        values.forEach(function (value) {
          var name = value[0];

          // Exclude undefined, null, and empty cells
          if (name && name.trim().length > 0 && !uniqueNames.has(name.trim())) {
            uniqueNames.add(name.trim()); // Add name to the Set
            var option = document.createElement('option');
            option.value = name.trim();
            option.textContent = name.trim();
            dropdown.appendChild(option);
          }
        });
      } else {
        console.log(`No data found for range ${range}.`);
      }

      return values; // Return the values for further processing if needed
    })
    .catch(error => {
      console.log(`Error fetching data from range ${range}:`, error);
    });
}



// Fetch data for the selected name
function fetchDataForName(selectedName) {
  var range = `${selectedName}!N2:N`; // Modify the column range accordingly

  fetchData(range, 'data')
    .then(data => {
      displayDataInCards(selectedName, data);
    });
}

// Display data in cards
function displayDataInCards(selectedName, data) {
  var cardsContainer = document.getElementById('cardsContainer');
  cardsContainer.innerHTML = ''; // Clear existing cards

  data.forEach(function (row) {
    var card = createCard(row);
    cardsContainer.appendChild(card);
  });
}

// Create a card element
function createCard(rowData) {
  var card = document.createElement('div');
  card.className = 'card';

  // Create card content
  var content = document.createElement('div');
  content.className = 'card-content';
  card.appendChild(content);

  // Populate card content with values from the row
  Object.keys(rowData).forEach(function (column, index) {
    var value = rowData[column];
    var label = document.createElement('div');
    label.textContent = `${column}: ${value}`;
    content.appendChild(label);
  });

  // Create edit button
  var editButton = document.createElement('button');
  editButton.textContent = 'Edit';
  editButton.addEventListener('click', function () {
    editData(rowData);
  });
  card.appendChild(editButton);

  return card;
}

// Edit the corresponding data in Google Spreadsheet
function editData(rowData) {
  var kecamatan = document.getElementById('kecamatan').value;
  var sheetName = `${kecamatan}!R:X`; // Update the sheet name variable
  var rowNumber = rowData.rowNumber; // Replace with the column that stores the row number in your data

  var editUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${sheetName}&range=R${rowNumber}:X${rowNumber}`;
  window.open(editUrl, '_blank');
}




// Function to handle the submit button click event
function submitSelection() {
  var selectedName = document.getElementById('name').value;
  var selectedKecamatan = document.getElementById('kecamatan').value;

  fetchDataForSelectedName(selectedName, selectedKecamatan);
}

// Fetch data for the selected name and kecamatan
function fetchDataForSelectedName(selectedName, selectedKecamatan) {
  var sheetName = selectedKecamatan
  var range = `${selectedKecamatan}!R:X`;

  var request = gapi.client.sheets.spreadsheets.values.batchGet({
    spreadsheetId: spreadsheetId,
    ranges: [sheetName, range],
  });

  request.then(function (response) {
    var valueRanges = response.result.valueRanges;
    var names = valueRanges[0].values;
    var data = valueRanges[1].values;

    var rowsToShow = [];

    for (var i = 0; i < names.length; i++) {
      if (names[i][0] === selectedName) {
        rowsToShow.push(data[i]);
      }
    }

    displaySelectedData(selectedName, rowsToShow);
  }).catch(function (error) {
    console.log('Error fetching data:', error);
  });
}

// Display the selected data in cards
function displaySelectedData(selectedName, data) {
  var cardsContainer = document.getElementById('cardsContainer');
  cardsContainer.innerHTML = ''; // Clear previous cards

  data.forEach(function (row) {
    var card = createCard(row);
    cardsContainer.appendChild(card);
  });
}

// Add event listener to kecamatan dropdown
document.getElementById('kecamatan').addEventListener('change', fetchNames);

// Fetch data when the page loads
fetchKecamatans();
