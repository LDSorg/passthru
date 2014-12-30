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

Setup
=====

Prerequisites (with ScreenCasts)
-----------

* [Creating your VPS (ScreenCast)](http://youtu.be/ypjzi1axH2A)
* [Securing Access to VPS (ScreenCast)](http://youtu.be/YZzhIIJmlE0) • [Securing Access to VPS (Article)](https://gist.github.com/coolaj86/8edaa9f5cb913cf442f1))

Install & Explanation
---------------------

In practice this requires 3 computers, but for simplicities sake we're going to run the setup on just 2.

First you're going to create a *secret* **not on the server**.

```bash
# Local Laptop
git clone https://github.com/LDSorg/passthru.git
pushd passthru

node gen-secret.js
node gen-shadow.js 35acc236-50ea-42c2-b47b-3682419b9b86
```

Now you're going to save the shadow on the server
(never put the local secret on the server!!!)
and create a secret for the server
(never put the server secret on the local!!!).

```bash
# Remote Server
curl -fsSL bit.ly/easy-install-node | bash
git clone https://github.com/LDSorg/passthru.git
pushd passthru
npm install

node gen-secret.js
vim config.js
> 'use strict';
>
> module.exports = {
>   "salt": "server-generated secret goes here"
> , "shadow": "locally-generated shadow goes here"
> };
```

**NOTE:** You **must** use a real domain name or the ip address.

```bash
# on the remote
git submodule init

pushd ssl-cert-gen/
bash make-root-ca-and-certificates.sh 'example.net'
popd

mkdir -p certs/server
mkdir -p certs/ca

rsync -a ssl-cert-gen/certs/server/my-server.key.pem certs/server/
rsync -a ssl-cert-gen/certs/server/my-server.crt.pem certs/server/
rsync -a ssl-cert-gen/certs/ca/my-root-ca.crt.pem certs/ca/

node bin/server-runner.js
```

```bash
# local
rsync -avhHPz example.com:~/passthru/ssl-cert-gen/certs/client/ ./certs/client/

curl https://example.net:8043 --cert certs/client/my-app-client.p12:secret --cacert certs/client/my-root-ca.crt.pem
> Cannot GET /

node tests/init.js
> { success: true }

node tests/fails-without-cert.js 2>/dev/null
> SUCCESS: Could not connect without valid certificate

node tests/get-profile.js
> {"individualId":3600476369,"newOption2Member":false}

node tests/restart.js
> {"success":true}
```

P.S. Remember that when you're making a screencast that a discerning user
can tell whether you're using Qwerty or Dvorak just by the rhythm of the keys
and a discerning computer can tell what your passwords are.
