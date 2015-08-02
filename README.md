# Etherbot

Etherbot will watch the Ethereum blockchain and notify you when your address mines a block!

### Requirements

A working Ethereum client, that you can connect to via the RPC interface.

### Install

```
$ git clone https://github.com/tcoulter/etherbot.git
$ cd etherbot
$ npm install
```

### Configure

You'll want to configure Etherbot before running it. The file `config.example.json` provides an example configuration. Use this file to create your own `config.json`:

```
$ cp ./config.example.json ./config.json
$ nano config.json
```

Here's a quick list of the items you need to specify within `config.json`:

* `addresses`: Array of objects that each contain an `address` and `email` keyword. If a block is mined by any addresses in the array, the email specified will be notified. e.g., `[ {address: "0x...", email: "some@email.com"}, ... ]`
* `mailer`: Object with two keys:
  * `transporter`: The transporter object passed directly to [nodemailer](http://www.nodemailer.com/). This tells nodemailer how you want to send your email.
  * `from`: The email address that emails will be sent from.
* `rpc`: Object with two keys:
  * `host`: Host your Ethereum client is running on (defaults to `localhost`)
  * `port`: Port your Ethereum client's RPC interface is running on (defaults to `8545`)
* `tip_address`: The address you'd like shown in the footer of the email. Defaults to the author's address.

### Running

After properly configuring Etherbot, you can either run `npm start`, or calling the file directly:

```
$ ./etherbot.es6
```

### Author

[@tcoulter](https://github.com/tcoulter) - Tim Coulter

### License

MIT
 


