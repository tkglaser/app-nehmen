# AppNehmen Calorie Counter
The goal of this project is to create a calorie counter that doesn't suck.

Go to https://www.tkglaser.net/app-nehmen to try it out.

[![Dependency Status](https://david-dm.org/tkglaser/app-nehmen.svg)](https://david-dm.org/tkglaser/app-nehmen)

[![GitHub forks](https://img.shields.io/github/forks/tkglaser/app-nehmen.svg?style=social&label=Fork)](https://github.com/tkglaser/app-nehmen/fork) [![GitHub stars](https://img.shields.io/github/stars/tkglaser/app-nehmen.svg?style=social&label=Star)](https://github.com/tkglaser/app-nehmen) 

## Design Goals
- All other calorie trackers I tried annoyed me in some way. Too slow, too many ads, suspicious use of my data.
  So I decided to try to create one that doesn't suck.
- I wanted to be able to use it as a mobile app and as a web site.
- It needs to work offline.
- All data is stored locally on your device. No sharing, selling or spying.
- No login-with-email, no reset password, no login-with-facebook or other dodgy stuff. 
  In fact if all data is stored locally, why not have no login at all?
- Free and open source.
- However I do want to be able to enter data on my laptop and see it appear on my phone. So the app can optionally sync
  to your Dropbox.
- Potentially, if it is technically and economically feasible, query 3rd party providers like MyFitnessPal for calorie entries
- Export data to CSV if you want a manual backup (I might drop this as it is somewhat redundant with the Dropbox option)
  
## Architecture
- The app is a PWA written in Angular. This means it runs in the browser but can be installed as an app on all Platforms that
  support PWAs which is Android, iOS and the Windows Store.
- All data is stored on the device using IndexedDB.
- If you chose to log in to Dropbox, your data is synced to your Dropbox. The app only has access to a specific folder in your
  Dropbox.
- It is hosted on Github pages and is continuously deployed by a Jenkins server that runs on a Raspberry Pi.
  
## Get involved
Please report any issues you find here on Github. Pull requests welcome. There is no unit test coverage yet but this is planned as well.
