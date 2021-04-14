'use strict';

const Discord = require('discord.js');
const fetch = require('node-fetch');
const bot = new Discord.Client();
const cfg = require('./config.json');

bot.on('ready', () => {
	console.clear();
	console.log(cfg.motd);
	bot.user.setActivity(cfg.status, { type: cfg.statusType });
	initCheckout(bot);
});

bot.login(cfg.token);

const initCheckout = (bot) => {
	bot.guilds.fetch(cfg.guildId)
		.then(guild => {
			doCheckout(bot, guild);
			setInterval(() => {
				doCheckout(bot, guild);
			}, cfg.checkTime*60000);
		});
};

const doCheckout = (bot, guild) => { // will do it better later
	const goods = cfg.goods;
	const data = cfg.data;
	for (var k in goods) {
		if (goods.hasOwnProperty(k)) {
			goods[k].forEach((v) => {
				guild.roles.fetch(data[k].role)
					.then(role => {
						bot.channels.fetch(data[k].channel)
							.then(ch => {
								checkStock(ch, role, k, v.name, v.url, v.delimiter, v.elm, v.text);
							});
					});
			});
		}
	}
};

const checkStock = (ch, role, good, name, url, delimiter, elm, text) => {
	fetch(url, {
		method: 'GET',
		follow: 10,
		headers: {
			'User-Agent': 'GoodsGirl/OwO'
		}
	})
		.then(res => res.text())
		.then(body => {
			if (body.indexOf(delimiter) != -1) {
				var check = `</${elm}`;
				check = (body.split(delimiter)[1]).split(check)[0];
				if (check.indexOf(text) != -1) {
					console.log(`A ${good} is unavailable at ${name}`);
				}
			} else {
				console.log(`A ${good} is available at ${name}`);
				ch.send(`${role} is available in store ${name}! Follow the link to buy it: ${url}`);
			}
		});
};	
