(function () {
    'use strict';

    self.addEventListener('sync', (event) => {
    //   event.notification.close();
      console.log('sync', event);
    });
  }());
