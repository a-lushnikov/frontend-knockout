# Neighbourhood map task
Knockout JS task for udacity nanodegree. The task was to create somewhat responsive application with the knowledge of MVC and ajax.

App is build with knockout.js (that is to deepen understanding of MVC pattern). It was also required to use some 3rd party APIs to play with ajax requests.

Eventually application uses: bootstrap, knockout.js
3rd party APIs used: Google Maps, Google Places, Geocoding, Forsquare


# Build

Built files are included, so app can simply be launched from build/index.html

Otherwise you can use gulp to build app from dev files with:

npm install
gulp clean
gulp build

This will create build folder with minified files and properly change references.


# Using application
* Use mouse or double tap to place a marker on the map
* Click list item on the left or marker to open modal with top picks for the place
* You can filter places using form in nav bar. Filtering option is "contains". You can filter places using form in nav bar. Filtering option is "contains". To remove from the selection places which do not have "test" in the street name type "test" in Street textbox and click "Filter" button.
* Remove markers with "Reset" button


# Additional
During the development discovered the bug (most probably in chrome) that mouseover event not fired correctly when element has padding or border. Check style.css for more information.
