
(function () {

is_in_production = false

function c (t,s="") {
    if (is_in_production) {
        return true
    }
    else {
        if (s != "") {
            console.log(s)
        }
        console.log(t)
    }
}

function updateUIStateSettings (filtersExist) {
    c(filtersExist,"*********** filtersExist ***********")
    if (filtersExist) {
      $('#settingsTable').removeClass('hidden').addClass('show');
      $('#noSettingsWarning').removeClass('show').addClass('hidden');
    } else {
      $('#noSettingsWarning').removeClass('hidden').addClass('show');
      $('#settingsTable').removeClass('show').addClass('hidden');
    }

    $('#closeSettings').click(function () {
          $("#main").empty()
    })
    $('#save').click(function () {
        console.log("should save")
        saveSetting()
    })
}

function buildSettingsTable (settings) {
    // Clear the table first.
    c(settings,"*********** settings ***********")
    $('#settingsTable > tbody tr').remove();
    const settingsTable = $('#settingsTable > tbody')[0];
    c(settingsTable,"*********** settingsTable ***********")

    // Add an entry to the settings table for each setting.
    for (const settingKey in settings) {
      const newRow = settingsTable.insertRow(settingsTable.rows.length);
      const keyCell = newRow.insertCell(0);
      const valueCell = newRow.insertCell(1);
      const eraseCell = newRow.insertCell(2);

      const eraseSpan = document.createElement('span');
      eraseSpan.className = 'glyphicon glyphicon-trash';
      eraseSpan.addEventListener('click', function () { eraseSetting(settingKey, newRow); });

      keyCell.innerHTML = settingKey;
      valueCell.innerHTML = settings[settingKey];
      eraseCell.appendChild(eraseSpan);
    }
    updateUIStateSettings(Object.keys(settings).length > 0);
}

function eraseSetting (key, row) {

    tableau.extensions.settings.erase(key);

    // Remove the setting from the UI immediately.
    row.remove();

    // Save in the background, saveAsync results don't need to be handled immediately.
    tableau.extensions.settings.saveAsync();

    updateUIStateSettings(Object.keys(tableau.extensions.settings.getAll()).length > 0);
}
function showSettingDialog () {
    $("#main").loadTemplate($("#settings-template"), {})
    buildSettingsTable(tableau.extensions.settings.getAll())
}
function saveSetting () {
    c("saveSetting")
    const settingKey = $('#keyInput').val();
    const settingValue = $('#valueInput').val();

    if(settingValue == "" || settingKey == "") {
        alert("Please fill out both fields")
        return false
    }
    else {
        tableau.extensions.settings.set(settingKey, settingValue);
        // Save the newest settings via the settings API.
        tableau.extensions.settings.saveAsync().then((currentSettings) => {
            // This promise resolves to a list of the current settings.
            // Rebuild the UI with that new list of settings.
            buildSettingsTable(currentSettings);
            $('#settingForm').get(0).reset();
        })
    }
}

function clearAllFilters () {
    // Get all of the worksheets and clear out filters.
    const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets
    c(worksheets,"*********** Worksheets ***********")

    worksheets.forEach(function (worksheet) {
      worksheet.getFiltersAsync().then(function (filtersForWorksheet) {
        filtersForWorksheet.forEach(function (filter) {
          worksheet.clearFilterAsync(filter.fieldName)
          c(filter.fieldName,"*********** filter.fieldName ***********")
        })
      })
      worksheet.clearSelectedMarksAsync()
    })
}

function filterChangedHandler (filterEvent) {
    // Just reconstruct the filters table whenever a filter changes.
    // This could be optimized to add/remove only the different filters.
    showFiltersAndMarks();
}
// This returns a string representation of the values a filter is set to.
// Depending on the type of filter, this string will take a different form.
function getFilterValues (filter) {
    let filterValues = '';
    c(filter.filterType,"###################### filter.filterType ######################      ")
    switch (filter.filterType) {
      case 'categorical':
        filter.appliedValues.forEach(function (value) {
          filterValues += value.formattedValue + ', ';
        });
        break;
      case 'range':
        // A range filter can have a min and/or a max.
        if (filter.minValue) {
          filterValues += 'min: ' + filter.minValue.formattedValue + ', ';
        }

        if (filter.maxValue) {
          filterValues += 'max: ' + filter.maxValue.formattedValue + ', ';
        }
        break;
      case 'relative-date':
        filterValues += 'Period: ' + filter.periodType + ', ';
        filterValues += 'RangeN: ' + filter.rangeN + ', ';
        filterValues += 'Range Type: ' + filter.rangeType + ', ';
        break;
      default:
    }

    // Cut off the trailing ", "
    return filterValues.slice(0, -2);
}
function updateUIState (filtersExist) {
    c(filtersExist,"*********** filtersExist ***********")
    $('#loading').addClass('hidden');
    if (filtersExist) {
      $('#filtersTable').removeClass('hidden').addClass('show');
      $('#noFiltersWarning').removeClass('show').addClass('hidden');
    } else {
      $('#noFiltersWarning').removeClass('hidden').addClass('show');
      $('#filtersTable').removeClass('show').addClass('hidden');
    }
}

 function buildFiltersTable (filters) {
    const aIsShown = []
    c(filters,"*********** filters ***********")
    // Clear the table first.
    $('#filtersTable > tbody tr').remove();

    const filtersTable = $('#filtersTable > tbody')[0];
    filters.forEach(function (filter) {
        c(filter.fieldName,"*********** filter.fieldName ***********")
        c(filter)
        if (!aIsShown.includes(filter.fieldName)) {
            if (filter.appliedValues !== undefined) {
                if (0 < filter.appliedValues.length) {
                  aIsShown.push(filter.fieldName)
                  const newRow = filtersTable.insertRow(filtersTable.rows.length);
                  const nameCell = newRow.insertCell(0);
                  const valuesCell = newRow.insertCell(1);
                  const valueStr = getFilterValues(filter);
                  nameCell.innerHTML = filter.fieldName;
                  valuesCell.innerHTML = valueStr;
                }
            }
            if (filter.minValue !== undefined) {
              aIsShown.push(filter.fieldName)
              const newRow = filtersTable.insertRow(filtersTable.rows.length);
              const nameCell = newRow.insertCell(0);
              const valuesCell = newRow.insertCell(1);
              const valueStr = getFilterValues(filter);
              nameCell.innerHTML = filter.fieldName;
              valuesCell.innerHTML = valueStr;
            }

        }
    });

    updateUIState(Object.keys(filters).length > 0);
  }



function showFiltersAndMarks() {
    c("showFiltersAndMarks")
    unregisterHandlerFunctions.forEach(function (unregisterHandlerFunction) {
      unregisterHandlerFunction();
    })
    const dashboardfilters = []
    const dashboardMarks = []
    // To get filter info, first get the dashboard.
    const dashboard = tableau.extensions.dashboardContent.dashboard;
    const filterFetchPromises = []
    const marksFetchPromises = []
    dashboard.worksheets.forEach(function (worksheet) {
      filterFetchPromises.push(worksheet.getFiltersAsync())
      marksFetchPromises.push(worksheet.getSelectedMarksAsync())

      // Add filter event to each worksheet.  AddEventListener returns a function that will
      // remove the event listener when called.
      const unregisterHandlerFunction = worksheet.addEventListener(tableau.TableauEventType.FilterChanged, filterChangedHandler);

      unregisterHandlerFunctions.push(unregisterHandlerFunction);
    })


    Promise.all(filterFetchPromises).then(function (fetchResults) {
      fetchResults.forEach(function (filtersForWorksheet) {
        filtersForWorksheet.forEach(function (filter) {
          dashboardfilters.push(filter)
        })
      })
      buildFiltersTable(dashboardfilters)
    })

    const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets
    worksheets.forEach(function (worksheet) {


    })

}



function initialize() {
    $('#loading').addClass('hidden')
    c("initialize")
    let config = {'configure': showSettingDialog}
    tableau.extensions.initializeAsync(config).then(function () {
      const config_data = tableau.extensions.settings.getAll()

      if(config_data["bShowFilters"] == "true") {
          c("showfilters")
          showFiltersAndMarks()
      }
      else {
          $("#titleExtension").hide()
          $("#tableFilters").hide()
      }

      if("bgColor" in config_data)  {
        c(config_data["bgColor"], "*********** bgColor ***********")
        $("body").css("background-color",config_data["bgColor"])
      }


      if ("textButton" in config_data)  {
        $("#deleteFilters").text(config_data["textButton"])
      }

      if ("buttonColor" in config_data) {
        $("#deleteFilters").css("background-color",config_data["buttonColor"])
      }
      if ("buttonTextColor" in config_data) {
        $("#deleteFilters").css("color",config_data["buttonTextColor"])
      }

      // Add button handlers for clearing filters.
      $('#deleteFilters').click(clearAllFilters)
    }, function (err) {
      // Something went wrong in initialization.
      c('Error while Initializing: ' + err.toString())
    })
}

  const unregisterHandlerFunctions = []
  $(document).ready(function () {
    initialize()
  })
})()