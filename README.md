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

Disallow SSH Keyring Caching
-------------

Most of the time you create an ssh key you don't bother adding a passphrase.
But for an application like this, it's important that you have a specific key
that uses a passphrase.

By default, most operating systems will only ask you to enter in your SSH passphrase
once and then cache it securely in memory.

If someone gets physical access to your machine, however, they can just open up a
terminal and log into any server that requires that passphrase without typing it
in (if you've accessed that machine since the last time the cache was cleared),
so we'll want to turn that off.

On OS X this is fairly straight forward:

```bash
# OS X
launchctl unload /System/Library/LaunchAgents/org.openbsd.ssh-agent.plist
```

On Ubuntu Desktops, surprisingly, you have to
[go into some GUI settings](http://blogs.bu.edu/mhirsch/2013/09/ubuntu-disable-gnome-keyring-ssh-agent-make-ubuntu-not-remember-ssh-private-key-passwords/)
and or
[edit a few config files](http://askubuntu.com/questions/162850/how-to-disable-the-keyring-for-ssh-and-gpg)

Create secure SSH key
-------------

For a project where security is this important I think it's not only important that the
ssh key be passphrase projected and key caching should be disabled, but also that the
key should be its own distinct key (otherwise I would get lazy and turn caching back on).

In this case, I'll create a key and call it 'waffles':

```bash
ssh-keygen
> Enter file in which to save the key (/Users/strongbad/.ssh/id_rsa): /Users/strongbad/.ssh/waffles
> Enter passphrase (empty for no passphrase):
> Enter same passphrase again:
> Your identification has been saved in /Users/strongbad/.ssh/waffles.
> Your public key has been saved in /Users/strongbad/.ssh/waffles.pub.
> The key fingerprint is:
> ff:9c:38:58:63:cc:f6:d4:fd:94:3e:68:7a:75:74:e0 strongbad@lappy486.local
> The key's randomart image is:
> +--[ RSA 2048]----+
> |                 |
> |              .  |
> |             . . |
> |              E o|
> |        So   . oo|
> |         .B . .o+|
> |         =.+  +.o|
> |        . .+.= o.|
> |          .oB   .|
> +-----------------+
```

It's important that the **passphrase should be long**.
You could use something like "Remember to take the trash out this Tuesday!"

If you don't want to forget it you could write it down and stick it in your
wallet with your grocery list or use a catchphrase from a favorite book or
TV show or something else creative that hides in plain sight.

What you **don't** want to do is ever put it in a file on your computer or
write it on a sticky note on your monitor.

Secure the Server
-----------------

After creating the server, update it and install `fail2ban`.

```bash
sudo apt-get update
sudo apt-get install -y fail2ban

sudo apt-get upgrade -y
```

Next create a user, add the secure key, then remove
remove root and password access.


```bash
# remote server
adduser strongbad
adduser strongbad sudo # or wheel if sudo doesn't exist
exit
```

```bash
# local laptop
brew install ssh-copy-id                            # needed on OS X
ssh-copy-id -i ~/.ssh/waffles "strongbad@example.com -p 22" # this will prompt for the password

ssh strongbad@example.com -i ~/.ssh/waffles -p 22
> Enter passphrase for key '/Users/coolaj86/.ssh/waffles':
```

```bash
# remote server
sudo vim /etc/ssh/sshd_config
> PermitRootLogin no
> PasswordAuthentication no
sudo service ssh restart
exit
```

You could also change Port to 4242 or something creative.

Okay, now the server is reasonably secure from the outside world.
Now test that you can still log in and that no extraneous services are running.

```bash
# Local Laptop
vim ~/.ssh/config
> Host example.com
> Port 4242
> User strongbad
> IdentityFile ~/.ssh/waffles

ssh example.com
```

I don't find basic firewalls to be very practical for servers for the average Joe.

If you don't want a remote system to have access to a local service,
don't expose the service. Simple. Done.

If you aren't a firewall guru then you'll probably do it wrong anyway.

So check to make sure that the only listening service running at this point is ssh:

```bash
# Remote Server
sudo netstat -peanut # an easy way to remember those 6 params
```

You should only see a few sshd instances listening on port 22 or 4242 or whatever.
If you see anything else, you should probably use a different OS or VPS service that isn't
setup by default with crap that you don't understand running on public ports.

Don't run WordPress or PHP
-----------------

Don't run any additional services other than what you need. Especially,
don't run WordPress or anything PHP-related. WordPress is the Internet Explorer of Servers.
It just attracts malware and rootkits.

Start the desired softwares
------------------

First you're going to create a secret **not on the server**.

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
