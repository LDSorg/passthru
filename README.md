PassThru
========

This is a secure service for exchanging tokens for data

* The server runs in an undisclosed region on an undisclosed
* The server has key-only passphrase-protected non-root ssh access (with a separate sudo password)
* The https access is restricted to trusted peer certificates only
* The service stores credentials encrypted (AES256 cipher) in memory
* The ids are hashed
* No data is saved to disk (only in RAM)
* The only way to gain access to this server is my first comprimising another computer with similar security in place.
* The private key has never existed on the server itself, so even if the server is comprimised, there's no key

If the server is rebooted, all data is completely lost.

API
===

The API can only be accesses via https using trusted peer certificates.

### POST /api/init/ `{ "secret": "johndoe", "password }`

{ "success": true }

### POST /api/login/ `{ "username": "johndoe", "password": "secret" }`

```json
{ "token": "some-access-token"
, "jar": { }
}
```

### POST /api/passthru/ `{ "token": "some-token" }`

```json
{ "jar": { }
}
```

Also, an error may come back.

**That's it!**

All the service does is transpart a requestjs compatible cookie jar between hosts.

The receiving system should not store the user's username or password at all,
but should store received token in an encrypted.
