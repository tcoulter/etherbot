#!/usr/bin/env ./node_modules/.bin/babel-node
var nodemailer = require("nodemailer");
var fs = require("fs");
var web3 = require("web3");
var BigNumber = require ("bignumber.js")
var _ = require("lodash");

var config;

try {
  config = JSON.parse(fs.readFileSync("./config.json", {encoding: "utf8"}));
} catch(e) {
  console.log("Couldn't read config file! Please check your syntax.");
  console.log(e.stack);
  process.exit(1);
}

var transporter = nodemailer.createTransport(config.mailer.transporter);
var template = _.template(fs.readFileSync("./mail.txt.ejs", {encoding: "utf8"}));

var pretty_amount = function(wei) {
  wei = new BigNumber(wei.toString());

  if (wei.toString(10) === "0") {
    return "0 wei";
  }

  var denominations = ["wei", "Kwei", "Mwei", "Gwei", "szabo", "finney", "Ether", "Kether", "Mether", "Gether", "Tether"];
  var denomination = 0;
  var factor = 1;

  while (wei >= factor && denomination < denominations.length) {
    denomination += 1;
    factor *= 1000;
  }

  denomination = denominations[denomination - 1];
  factor = factor / 1000;

  var value = wei.dividedBy(factor).toFixed(2) + "";

  if (value.indexOf(".00") === value.length - 3) {
    value = value.substring(0, value.length - 3);
  }

  return `${value} ${denomination}`;
};

var notify = function(miner, block) {
  var mail_options = {
    from: config.from,
    to: miner.email,
    subject: `You just mined block #${block.number}!`
  };

  web3.eth.getBalance(miner.address, function(error, result) {
    var balance = result.toString();

    if (error != null) {
      balance = "Whoops! Error getting your balance. Sorry!";
    } else {
      balance = pretty_amount(balance);
    }

    mail_options.text = template({
      miner: miner,
      block: block,
      balance: balance,
      tip_address: config.tip_address || "0xf6e1652a0397e078f434d6dda181b218cfd42e09"
    });

    transporter.sendMail(mail_options, function(error, info) {
      if (error != null) {
        console.log("Couldn't send email!");
        console.log(error);
      } else {
        console.log(`Winner found! Notified ${miner.email}`);
      }
    });
  });
};

var check = function(block_number) {
  console.log(`Checking block #${block_number}.`);
  // Get the block and see if we're a winner!
  web3.eth.getBlock(block_number, function(error, block) {
    // Ignore errors.
    if (error != null) return;

    for (var miner of config.addresses) {
      if (block.miner == miner.address) {
        notify(miner, block);
        return;
      }
    }
  });
};

// Set the provider and kickoff the script.
web3.setProvider(new web3.providers.HttpProvider(`http://${config.rpc.host}:${config.rpc.port}`));

// Do a quick check of the coinbase just to make sure we can
// connect to the rpc client.
web3.eth.getCoinbase(function(error, result) {
  if (error != null) {
    console.log("Couldn't connect to RPC client! Check your settings.");
    console.log(error.stack);
    process.exit(1);
  }
  console.log("Successfully connected to RPC client.");
});

// Watch for new blocks as they come in.
web3.eth.filter("latest", function(error, block_hash) {
  // Ignore errors.
  if (error != null) return;

  // Get the block number, because the hash might change if there's a reorg?
  // Let's do it just to be safe.
  web3.eth.getBlock(block_hash, function(error, block) {
    check(block.number - 6);
  });
});

console.log("Started!");
