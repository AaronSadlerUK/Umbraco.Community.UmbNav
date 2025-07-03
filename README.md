# Umbraco UmbNav

![Umbraco Cloud Badge](https://img.shields.io/badge/Works%20on-Umbraco%20Cloud-3544b1)


UmbNav adds a drag and drop menu builder to the Umbraco Belissima V16+ backoffice.

## Getting started

UmbNav V4.X only supports Umbraco 16+

For Umbraco versions 13 and below please see the repository linked below:
https://github.com/AaronSadlerUK/Our.Umbraco.UmbNav

### Features

- Set maximum child levels
- Hide menu items where `umbracoNaviHide` is true
- Auto expand the backoffice menu tree on hover
- Set the delay of the auto expand on hover (in ms)
- Add `noopener` to external links by clicking a checkbox
- Add `noreferrer` to external links by clicking a checkbox
- Auto add child nodes when rendering on the front end
- Allow menu items to be shown / hidden depending on member authentication status
- Add custom CSS classes to each menu item in the backoffice
- Display the property editor as full width in the back office (Hide the label)
- Add an image to a menu item
- TagHelper
- GetLinkHtml extension for Umbraco V8 and V9
- Add label items

### Installation

UmbNav is available from [NuGet](https://www.nuget.org/packages/Umbraco.Community.UmbNav), or as a manual download directly from GitHub.

#### NuGet package repository
To [install UI from NuGet](https://www.nuget.org/packages/Umbraco.Community.UmbNav), run the following command in your instance of Visual Studio.

    PM> Install-Package Umbraco.Community.UmbNav
	
To [install Core from NuGet](https://www.nuget.org/packages/Umbraco.Community.UmbNav.Core), run the following command in your instance of Visual Studio.

    PM> Install-Package Umbraco.Community.UmbNav.Core

## Umbraco Cloud Supported

UmbNav fully supports Umbraco Cloud including the content synchroniser, it has been fully tested transferring and restoring between environments.

### Documentation

After installing the package, you will have a new property editor called UmbNav in the Umbraco backoffice, typically this would get added to your sites "Site Settings" or "Home" node.

Check out the [documentation](https://umbnavdocs.aaronsadler.dev/) to learn how to embed the package in your site.

### Contribution guidelines

To raise a new bug, create an issue on the GitHub repository. To fix a bug or add new features, fork the repository and send a pull request with your changes. Feel free to add ideas to the repository's issues list if you would to discuss anything related to the package.

### Who do I talk to?
This project is maintained by [Aaron Sadler](https://aaronsadler.uk) and contributors.

## License

Copyright &copy; 2025 [UmbHost Limited](https://umbhost.net), and other contributors

Licensed under the MIT License.

As per the spirit of the MIT Licence, feel free to fork and do what you wish with the source code, all I ask is that if you find a bug or add a feature please create a to PR this repository.
