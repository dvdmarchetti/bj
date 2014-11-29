/*
 * Author: Davide Marchetti
 * GitHub Source: https://github.com/abc33/bj
 *
 * This work is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-sa/4.0/ or send a letter to
 * Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.
 */
///////////////////////////////////////////
// Array Extension
///////////////////////////////////////////
Array.prototype.shuffle = function() {
	for(var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
};

///////////////////////////////////////////
// Enums
///////////////////////////////////////////
// Player Type
var Player = {
	USER: 0,
	PC: 1
};

// Browser Type
var Browser = {
	CHROME: 0,
	FIREFOX: 1,
	SAFARI: 2,
	OPERA: 3,
	IE: 4,
	ANDROID: 5
};

// Season
var Season = {
	WINTER: 0,
	FALL: 1,
	SPRING: 2,
	SUMMER: 3
};

///////////////////////////////////////////
// Utils
///////////////////////////////////////////
function $(elem) {
	return document.querySelector(elem);
}

function getType(type) {
	var ua = navigator.userAgent.toLowerCase();

	if (ua.indexOf('chrome') != -1) {
		return Browser.CHROME;
	} else if (ua.indexOf('firefox') != -1) {
		return Browser.FIREFOX;
	} else if (ua.indexOf('opera') != -1) {
		return Browser.OPERA;
	} else if (ua.indexOf('safari') != -1) {
		return Browser.SAFARI;
	} else if (ua.indexOf('android') != -1) {
		return Browser.ANDROID;
	} else {
		return Browser.IE;
	}
}

///////////////////////////////////////////
// Objects
///////////////////////////////////////////
var Game = function(sels) {
	// Class reference
	var self = this;

	// Selectors
	this.selectors = null;

	// Store deck, player and pc cards
	var cards = {
		pc: [],
		deck: [],
		player: []
	};

	// Store pc and player points
	var points = {
		pc: 0,
		player: 0
	};

	var classes = ["red", "black"];
	var values  = [1, 2, 3, 4, 5, 6, 7, 0.5, 0.5, 0.5];
	var seeds   = ["Cuori", "Picche", "Quadri", "Fiori"]; // Alternate red and black cards
	var symbols = ["&hearts;", "&spades;", "&diams;", "&clubs;"];
	var texts   = ["A", "2", "3", "4", "5", "6", "7", "J", "Q", "K"];

	///////////////////////////////////////////
	// Constructor
	///////////////////////////////////////////

	// Generate deck with 40 cards
	generate(40);

	// Shuffle deck
	shuffle();

	// Save selectors
	this.selectors = sels;

	///////////////////////////////////////////
	// Private Functions
	///////////////////////////////////////////

	/**
	 * Generate cards of all seeds
	 *
	 * @param maxCards - Number of cards in deck
	 */
	function generate(maxCards) {
		for (var i = 0; i < 4; i++) {
			var seed = seeds[i];
			var cls  = classes[i % 2];

			for (var v = 0; v < maxCards / 4; v++) {
				cards.deck.push({
					seed: seed,
					className: cls,
					text: texts[v],
					value: values[v],
					symbol: symbols[i],
				});
			}
		}
	};

	/**
	 * Shuffle deck
	 */
	function shuffle() {
		cards.deck.shuffle();
	};

	///////////////////////////////////////////
	// Public Methods
	///////////////////////////////////////////

	/**
	 * Pick the first card of the deck
	 *
	 * @return First card of the deck
	 */
	this.pick = function() {
		return cards.deck.pop();
	};

	/**
	 * Add card to player's cards and sun value to total
	 *
	 * @param card - card object which will be pushed into players cards
	 */
	this.addPlayerCard = function(card) {
		cards.player.push(card);
		points.player += card.value;
	};

	/**
	 * Add card to pc's cards and sum value to total
	 *
	 * @param card - card object which will be pushed into pc cards
	 */
	this.addPcCard = function(card) {
		cards.pc.push(card);
		points.pc += card.value;
	};


	/**
	 * Check sum
	 *
	 * @return - true if (players point > 7.5)
	 */
	this.checkPlayer = function() {
		if (points.player > 7.5) {
			points.player = 0;
			return -1;
		}
		return 0;
	};

	this.checkPc = function() {
		if (points.pc > 7.5) {
			points.pc = 0;
			return -1;
		}
		return 0;
	};

	/**
	 * Display points
	 */
	this.syncPoints = function(type) {
		if (type == Player.PC) {
			selectors.pcPoints.innerHTML = points.pc;
			return;
		}
		selectors.playerPoints.innerHTML = points.player;
	};

	/**
	 * Sync cards and points to user
	 *
	 * @param selector - element which holds cards
	 * @param type - player or pc
	 */
	this.sync = function(selector, type) {
		this.syncPoints(type);

		var elements = '';
		var template = "<div class=\"card {class}\"><div class=\"card-top-number\">{value}<span class=\"symbol\">{seed}</span></div><div class=\"card-big-number\">{value}<span class=\"symbol\">{seed}</span></div><div class=\"card-bottom-number\">{value}<span class=\"symbol\">{seed}</span></div></div>";
		var currDeck = cards.player;

		if (type == Player.PC) {
			currDeck = cards.pc;
		}

		for (var i = 0; i < currDeck.length; i++) {
			var c = template.replace(/\{value\}/g, currDeck[i].text);
			var c = c.replace(/\{seed\}/g, currDeck[i].symbol);
			var c = c.replace(/\{class\}/g, currDeck[i].className);
			elements += c;
		}

		selector.innerHTML = elements;
	};

	///////////////////////////////////////////
	// PC Handler
	///////////////////////////////////////////

	/**
	 * Start pc turn
	 */
	this.pcPlay = function() {
		// Start pick function repeated each second
		self.timing = setInterval(
			function() {
				if (points.pc < 6.5) {
					if (points.pc <= points.player) {
						var card = self.pick();
						self.addPcCard(card);
						self.sync(self.selectors.pcZone, Player.PC);
						if (self.checkPc() != -1) {
							return;
						}
					}
				}

				clearInterval(self.timing);

				// If pc points is greater than 7.5
				if (points.pc > 7.5) {
					selectors.pcMessages.innerHTML = strings.busted;
					self.sync(self.selectors.pcZone, Player.PC);
				}

				// Declare winner
				self.winner();
			},
			1000
		);
	};

	///////////////////////////////////////////
	// Winner Check
	///////////////////////////////////////////

	/**
	 * Compare points, number of cards and declare winner
	 */
	this.winner = function() {
		if (points.pc > points.player) {
			this.pcWin();
		} else if (points.pc < points.player) {
			this.playerWin();
		} else if (points.pc == points.player) {
			if (cards.pc.length < cards.player.length) {
				this.pcWin();
			} else if (cards.pc.length > cards.player.length) {
				this.playerWin();
			} else {
				this.draw();
			}
		}
	};

	/**
	 * Declare PC as winner
	 */
	this.pcWin = function() {
		selectors.infoMessages.innerHTML = strings.lose;
		selectors.infoMessages.className = 'title lose';
	};

	/**
	 * Declare Player as winner
	 */
	this.playerWin = function() {
		selectors.infoMessages.innerHTML = strings.win;
		selectors.infoMessages.className = 'title win';
	};

	/**
	 * No winner
	 */
	this.draw = function() {
		selectors.infoMessages.innerHTML = strings.draw;
		selectors.infoMessages.className = 'title draw';
	};

	///////////////////////////////////////////
}

///////////////////////////////////////////
// Events
///////////////////////////////////////////
var lost = false;
function pickCard() {
	g.addPlayerCard(g.pick());
	lost = g.checkPlayer() == -1;

	// If player score > 7.5
	if (lost) {
		selectors.infoMessages.innerHTML = strings.busted;
		selectors.infoMessages.className = 'title busted';

		stopPicking();
	};

	g.sync(selectors.playerZone);
}

function stopPicking() {
	selectors.pickBtn.removeEventListener('click', pickCard, false);
	selectors.stopBtn.removeEventListener('click', stopPicking, false);

	selectors.pickBtn.setAttribute('disabled', 'disabled');
	selectors.stopBtn.setAttribute('disabled', 'disabled');

	if (lost) {
		setTimeout(function() {
			selectors.infoMessages.innerHTML = 'PC Turn';
			selectors.infoMessages.className = 'title draw';
		}, 2000);
	} else {
		selectors.infoMessages.innerHTML = 'PC Turn';
		selectors.infoMessages.className = 'title draw';
	}

	var start = setTimeout(function() {
		selectors.infoMessages.innerHTML = '';
		selectors.infoMessages.className = 'title';

		// Start pc turn
		g.pcPlay();
	}, 4000);
}

///////////////////////////////////////////
// Main Functions
///////////////////////////////////////////

var _init = function() {
	// Initialize texts of buttons
	selectors.pickBtn.innerHTML = strings.pick;
	selectors.stopBtn.innerHTML = strings.stand;

	if (g == null) {
		g = new Game(selectors);

		// Slide zones in
		selectors.pc.className += ' show';
		selectors.player.className += ' show';
		selectors.deckBack.className = 'show';

		// Register events
		selectors.pickBtn.addEventListener('click', pickCard, false);    // Pick card button
		selectors.stopBtn.addEventListener('click', stopPicking, false); // Stop player picking button

		// Remove play button event
		selectors.startBtn.removeEventListener('click', _init, false);

		// Hide button
		selectors.startBtn.style.display = 'none';

		// Destroy __init function
		_init = null;

		// Give first card to player
		pickCard();
	}
};

function getBrowserName(callback) {
	callback(browser = getType());
}

function getSeason(callback) {
	var d = new Date();
	var s;

	switch(d.getMonth()) {
		case 12:
		case 1:
		case 2:
			s = Season.WINTER;
		break;
		case 3:
		case 4:
		case 5:
			s = Season.SPRING;
		break;
		case 6:
		case 7:
		case 8:
			s = Season.SUMMER;
		break;
		case 9:
		case 10: 
		case 11:
			s = Season.FALL;
		break;
	}
	
	callback(s);	
}

///////////////////////////////////////////
// Global Vars
///////////////////////////////////////////

// Objects
var g = null;

// Elements
var selectors = {
	// Containers
	pc: $('#pc'),
	player: $('#player'),
	deckBack: $('#deck-back'),

	// Buttons
	stopBtn: $('#btn-stop'),
	pickBtn: $('#btn-pick'),
	startBtn: $('#btn-start'),

	// Info Selectors
	infoMessages: $('#info-message'),

	// PC selectors
	pcZone: $('#pc-cards'),
	pcPoints: $('#pc-points .value'),
	pcMessages: $('#pc-message'),

	// Player selectors
	playerZone: $('#player-cards'),
	playerPoints: $('#player-points .value'),
	playerMessages: $('#player-message')
};

// Options
var options = {
	imagePath: 'images/',
	cardBackFilename: 'card-back',
	cardBackExt: 'png',
	patternPath: 'assets/patterns/',
	patternFilename: 'bg',
	patternExt: 'jpg'
};

// Strings
var strings = {
	win: 'You win',
	stop: 'Stand',
	pick: 'Pick Card',
	draw: 'Draw',
	lose: 'You lose',
	stand: 'Stand',
	busted: 'Busted',
	pcStart: 'Pc turn'
};

///////////////////////////////////////////
// Entry Point
///////////////////////////////////////////
window.onload = function() {
	// Check Browser
	getBrowserName(function(browser) {
		selectors.deckBack.src = options.imagePath + options.cardBackFilename + browser + '.' + options.cardBackExt;
	});

	// Get Season
	getSeason(function(season) {
		document.body.style.background = 'url(' + options.patternPath + options.patternFilename + season + '.' + options.patternExt + ')'; 
	});

	// Start game button event
	selectors.startBtn.addEventListener('click', _init, false);
};