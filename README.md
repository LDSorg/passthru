PassThru
========

This is a secure service for exchanging tokens for data

API
===

The API can only be accesses via https using trusted peer certificates.

#### POST /api/init/ `{ "secret": "cipher-passphrase" }`

```json
{ "success": true }
```

#### POST /api/login/ `{ "username": "johndoe", "password": "secret" }`

```json
{ "token": "some-access-token"
, "jar": { }
}
```

#### POST /api/passthru/ `{ "token": "some-token" }`

```json
{ "jar": { }
}
```

Also, an error may come back.

**That's it!**

All the service does is transpart a requestjs compatible cookie jar between hosts.

The receiving system should not store the user's username or password at all,
but should store received token in an encrypted.

Security
===

* The server runs in an undisclosed region on an undisclosed service
* The server has key-only passphrase-protected non-root ssh access (with a separate sudo password)
* The https access is restricted to trusted peer certificates only
* No data is saved to disk (only in RAM)
* Even the data in RAM is encrypted (AES256 cipher)
* The master cipher key has never existed on the server itself, so even with physical access it could not be recovered
* Each set of credentials is independently encrypted with a unique key (which is not stored on the server)
* The server's IP address can only be discovered by first compromising another server with similar security in place.
* In the event of a power failure, all of the data would be lost.

It's pretty safe.
