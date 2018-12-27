# AppNehmen Calory Counter
The goal of this project is to create a calory counter that doesn't suck.

## Architecture
- The app is a PWA written in Angular. This means:
  - It can be used in a browser just like any other web site
  - It can be installed on mobile devices just like a native app (well, almost).
- Once installed, it works offline
- All data is stored locally on the device/browser (using IndexedDB)
- No login, no back-end, no collection of user data
- Free and open source, no ads, no BS.
- It provides an optional sync-to-dropbox functionality that allows users to replicate data across devices by logging in to the same dropbox account. Yes, I said no logins, but this is a login to dropbox and you have to do backup somehow. And it is optional.
- Potentially at some future point: 
  - Query 3rd party providers like MyFitnessPal for calory entries
  - Export data to CSV if you want a manual backup
  
## Hosting
- There is a CD instance at https://www.tkglaser.net/app-nehmen. Remember, this is pre-alpha software, please don't shout at me if your calory entries are lost. :)
- The plan is to provide a hosted instance at Github Pages but I'm not quite there yet.

Please report any issues you find here on github. Pull requests welcome. There is no unit test coverage yet but this is planned as well.
