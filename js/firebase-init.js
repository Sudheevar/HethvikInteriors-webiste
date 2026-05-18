/* ═══════════════════════════════════════════════════════════════
   FIREBASE INIT  (compat SDK)

   NOTE: the apiKey below is NOT a secret. Firebase web API keys are
   public by design — they only identify the project. All security is
   enforced server-side by Firebase Auth + Firestore/Storage rules
   (see firestore.rules / storage.rules in the repo root).
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var firebaseConfig = {
    apiKey:            'AIzaSyDxUHDACAiVp_OZGef-IQSLOrB8-IZXN0g',
    authDomain:        'hethvik-interiors.firebaseapp.com',
    projectId:         'hethvik-interiors',
    storageBucket:     'hethvik-interiors.firebasestorage.app',
    messagingSenderId: '825259714611',
    appId:             '1:825259714611:web:642a35ab1cbf4df4de1b46'
  };

  if (typeof firebase === 'undefined') {
    console.error('Firebase SDK failed to load.');
    window.fb = null;
    return;
  }

  firebase.initializeApp(firebaseConfig);

  // Keep the admin signed in across reloads/devices.
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch(function (e) { console.warn('Auth persistence:', e); });

  window.fb = {
    auth: firebase.auth(),
    db:   firebase.firestore(),
    // storage added in Phase 3
  };
})();
