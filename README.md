# Project Title
uio-tableau-extension-filters

## Description
This Tableau extension is designed to enhance user interaction with data filters within Tableau dashboards. The key functionality of this extension includes:

**Filter overview**: Users see what filters are been active in the views.

**Delete Functionality**: Reset filters buttom that deletes all active filters and "resets"  the views

This extension is particularly useful for complex dashboards with multiple filters, as it simplifies the process of understanding and managing the data being viewed. It's designed with user experience in mind, offering a seamless integration with Tableau's existing functionalities.

## Installation

Follow these steps to install the extension in Tableau:

### Prerequisites
- Ensure you have Tableau Desktop or Tableau Server with a version that supports extensions (Tableau 2018.2 or later).
- Verify that you have the necessary permissions to install extensions in Tableau.

### Downloading the Extension
1. Download the extension file DeleteFilters.trex from the provided link or repository.
2. Save the `.trex` file to a known location on your system.

### Installing in Tableau Desktop
1. Open your Tableau dashboard.
2. Navigate to the dashboard tab where you want to add the extension.
3. Drag and drop the "Extension" object from the lower part of the "Objects" pane onto your dashboard.
4. In the dialog box that appears, navigate to and select the downloaded `.trex` file.
5. Click "Open" to add the extension to your dashboard.

### Installing on Tableau Server
1. As an administrator, go to the Tableau Server settings and enable the use of extensions.
2. Upload the `.trex` file to a web server that your Tableau Server instance can access.
3. Follow the same steps as in Tableau Desktop to add the extension to a dashboard, but select the `.trex` file from the server location.

### Post-Installation Setup
- After installation, you might need to configure the extension by connecting it to your data sources or setting specific parameters based on your dashboard needs.

### Troubleshooting
- If you encounter any issues during installation, please refer send mail to the developper: daniel.gracia@admin.uio.no


## Usage
#### Use configuration in the extension menu for setting up parameters

Add key/value
**bShowFilters: true** this will show/hide the list of filters, with true will the extension just show the "reset" button.
**textButton:** Text for de reset button, default is "Delete filters"
**buttonColor:** Color for the button
**buttonTextColor:** Button text color
**bgColor:** Background color for extension view

## Contributing
todo

## License
todo

## Contact
daniel.gracia@admin.uio.no

## Acknowledgments
todo


