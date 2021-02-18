var Discord = require('discord.js');
var fs = require('fs');

var mybot;

var config;
var trackerMaster = {};
var rpconfig = {};
var macros = {};
var backMaster = {};
var forwardMaster = {};
var outputMaster = {};
var currentActorsMaster = {};
var activeChannels = '';
var boldOnes = '';
var regen = '';
var shadowChannels = '';
var fateMasterDeck = [-4,-3,-2,-3,-2,-1,-2,-1,0,-3,-2,-1,-2,-1,0,-1,0,1,-2,-1,0,-1,0,1,0,1,2,-3,-2,-1,-2,-1,0,-1,0,1,-2,-1,0,-1,0,1,0,1,2,-1,0,1,0,1,2,1,2,3,-2,-1,0,-1,0,1,0,1,2,-1,0,1,0,1,2,1,2,3,0,1,2,1,2,3,2,3,4];
var fateDeck = {};
var latestSpeaker = {};

var log = function(message, isError) {
    if (isError) {
        fs.appendFileSync('./error.log',message+'\n');
    }
};

try {
    var shuffle = function (array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    };

    var exaltedDice = function (message) {
        var dice = message.match(/([0-9]+)e/);
        var double = message.match(/[ed]([0-9]+)/);
        var reroll = message.match(/r([0-9]+)/);
        var target = message.match(/t([0-9]+)/);
        var auto = message.match(/(\+|-)([0-9]+)/);
        var count = message.match(/c([0-9]+)/);
        var cascade = message.match(/!/);
        var result;
        var builder = '';
        var successes = 0;
        var sucDice = 0;
        if (dice) {
            dice = parseInt(dice[1], 10);
        } else {
            dice = 0;
        }
        if (double) {
            double = parseInt(double[1], 10);
        } else {
            double = 10;
        }
        if (reroll) {
            reroll = reroll[1];
        } else {
            reroll = '';
        }
        if (target) {
            target = parseInt(target[1], 10);
        } else {
            target = 7;
        }
        if (auto) {
            auto = parseInt(auto[0], 10);
        } else {
            auto = 0;
        }
        if (count) {
            count = parseInt(count[1], 10);
        } else {
            count = 0;
        }
        while (dice > 0) {
            result = Math.floor(Math.random() * 10);
            while (reroll.indexOf(result) > -1) {
                result = Math.floor(Math.random() * 10);
            }
            if (result === 0) {
                result = 10;
            }
            if (result >= target) {
                if (cascade) {
                    dice += 1;
                }
                successes += 1;
            }
            if (count) {
                if (result === count) {
                    sucDice += 1;
                }
            } else {
                if (result >= target) {
                    sucDice += 1;
                }
            }
            if (result >= double) {
                successes += 1;
            }
            if (result === 1) {
                builder += boldOnes + result + boldOnes;
            } else if (result >= double) {
                builder += '**' + result + '**';
            } else if (result >= target) {
                builder += '*' + result + '*';
            } else {
                builder += result;
            }
            dice -= 1;
            if (dice > 0) {
                builder += ',';
            }
        }
        successes += auto;
        return builder + '\n' + '**SUCCESSES: ' + successes + '(' + sucDice + ')**';
    };

    var wodDice = function (message) {
        var dice = message.match(/([0-9]+)w/);
        var again = message.match(/w([0-9]+)/);
        var auto = message.match(/(\+|-)([0-9]+)/);
        var result;
        var builder = '';
        var successes = 0;
        var sucDice = 0;
        if (dice) {
            dice = parseInt(dice[1], 10);
        } else {
            dice = 0;
        }
        if (again) {
            again = parseInt(again[1], 10);
        } else {
            again = 10;
        }
        if (auto) {
            auto = parseInt(auto[0], 10);
        } else {
            auto = 0;
        }
        while (dice > 0) {
            result = Math.floor(Math.random() * 10);
            if (result === 0) {
                result = 10;
            }
            if (result >= 8) {
                successes += 1;
            }
            if (result >= again) {
                dice += 1;
                sucDice += 1;
            }
            if (result === 1) {
                builder += boldOnes + result + boldOnes;
            } else if (result >= again) {
                builder += '**' + result + '**';
            } else  if (result >= 8) {
                builder += '*' + result + '*';
            } else {
                builder += result;
            }
            dice -= 1;
            if (dice > 0) {
                builder += ',';
            }
        }
        successes += auto;
        return builder + '\n' + '**SUCCESSES: ' + successes + '(' + sucDice + ')**';
    };

    var dxDice = function (message) {
        var dice = message.match(/([0-9]+)x/);
        var critical = message.match(/x([0-9]+)/);
        var auto = message.match(/(\+|-)([0-9]+)/);
        var result;
        var builder = '';
        var total = 0;
        var sucDice = 0;
		var maxResult = 0;
		var critDice = 0;		
        if (dice) {
            dice = parseInt(dice[1], 10);
        } else {
            dice = 0;
        }
        if (critical) {
            critical = parseInt(critical[1], 10);
        } else {
            critical = 10;
        }
	if (critical < 2) {
	    critical = 10;
        }
        if (auto) {
            auto = parseInt(auto[0], 10);
        } else {
            auto = 0;
        }
        while (dice > 0) {
            result = Math.floor(Math.random() * 10);
            if (result === 0) {
                result = 10;
            }
			if (result >= critical) {
				builder += '**' + result + '**';
				critDice++;
				result = 10;
			} else {
				builder += result;
			}
			if (result > maxResult) {
				maxResult = result;
			}
			dice--;
			if (dice > 0) {
				builder += ',';
			} else {
				total += maxResult;
				maxResult = 0;
				if (critDice > 0) {
					builder += '|';
					dice = critDice;
					critDice = 0;
				}
			}
        }
        total += auto;
        return builder + '\n' + '**Total: ' + total + '**';
    };

    var owodDice = function (message) {
        var dice = message.match(/([0-9]+)o/);
        var diff = message.match(/o([0-9]+)/);
        var auto = message.match(/(\+|-)([0-9]+)/);
        var result;
        var builder = '';
        var successes = 0;
        var sucDice = 0;
        if (dice) {
            dice = parseInt(dice[1], 10);
        } else {
            dice = 0;
        }
        if (diff) {
            diff = parseInt(diff[1], 10);
        } else {
            diff = 6;
        }
        if (auto) {
            auto = parseInt(auto[0], 10);
        } else {
            auto = 0;
        }
        while (dice > 0) {
            result = Math.floor(Math.random() * 10);
            if (result === 0) {
                result = 10;
            }
            if (result >= diff) {
                successes += 1;
            }
            if (result === 1) {
                successes -= 1;
                builder += boldOnes + result + boldOnes;
            } else  if (result >= diff) {
                builder += '*' + result + '*';
            } else {
                builder += result;
            }
            dice -= 1;
            if (dice > 0) {
                builder += ',';
            }
        }
        successes += auto;
        return builder + '\n' + '**SUCCESSES: ' + successes + '**';
    };

    var baseDice = function (message) {
        var dice;
        var diceSize;
        var total = 0;
        var builder = '';
        var result;
        var parts = message.split('+');
        parts.forEach(function(part, index){
            var checkneg = part.split('-');
            part = checkneg[0];
            if (checkneg.length > 1) {
                total -= parseInt(checkneg[1]);
            }
            dice = part.match(/([0-9]+)d([0-9]+)/);
            if (dice) {
                diceSize = parseInt(dice[2], 10);
                dice = parseInt(dice[1], 10);
            } else {
                dice = 0;
                total += parseInt(part);
            }
            while (dice > 0) {
                result = Math.floor(Math.random() * diceSize);
                if (result === 0) {
                    result = diceSize;
                }
                if (result === 1) {
                    builder += boldOnes + result + boldOnes;
                } else if (result === diceSize) {
                    builder += '**' + result + '**';
                } else {
                    builder += result;
                }
                total += result;
                dice -= 1;
                if (dice > 0 || index < parts.length - 1) {
                    builder += ',';
                }
            }
        });

        return builder + '\n' + '**TOTAL: ' + total + '**';
    };

    var stressDice = function (message) {
        var parts = message.split('+');
        var bonus = 0;
        if (parts.length > 1) {
            bonus = parseInt(parts[1]);
        } else {
            parts = message.split('-');
            if (parts.length > 1) {
                bonus = -1 * parseInt(parts[1]);
            }
        }
        var builder = '';
        var roll = Math.floor(Math.random() * 10);
        var current = roll;
        var final = current;
        var multiplier = 1;
        builder+=current + ',';
        while (roll === 1) {
            multiplier = multiplier * 2;
            roll = (Math.floor(Math.random() * 10) + 1);
            builder += roll + ',';
            current = roll * multiplier;
            final = Math.max(final, current);
        }
        builder += '**RESULT: ' + (final + bonus);
        if (final === 0) {
            builder += ' which is a potential BOTCH';
        }
        builder +=  '**';
        return builder;
    };

    var dowsing = function (message) {
        var shards = ['Red','Orange','Yellow','Green','Blue','Violet'];
        var parts = message.split(' ');
        var num = 1;
        var output = {};
        if (parts.length > 1) {
            num = parseInt(parts[1]);
        }
        if (isNaN(num)) {
            num = 1;
        }
        while (num) {
            num--;
            var rolled = Math.floor(Math.random() * 6) + 1;
            if (rolled >= 4) {
                var type = shards[Math.floor(Math.random() * shards.length)];
                if (output[type] === undefined) {
                    output[type] = 0;
                }
                output[type]++;
            }
            if (rolled === 6) {
                num++;
            }
        }
        var builder = '\nFOUND:';
        Object.keys(output).forEach(function(key){
            builder+='\n' + key.toUpperCase() + ': ' + output[key];
        });
        return builder;
    };

    var makeBooks = function (message) {
        var subjects = [
            'Animal Handling',
            '(Area) Lore',
            'Athletics',
            'Awareness',
            'Bargain',
            'Brawl',
            'Carouse',
            'Charm',
            'Chirurgy',
            'Concentration',
            'Craft (Type)',
            'Etiquette',
            'Folk Ken',
            'Guile',
            'Hunt',
            'Intrigue',
            'Leadership',
            'Legerdemain',
            '(Living Language)',
            'Music',
            '(Organization) Lore',
            'Profession (Type)',
            'Ride',
            'Stealth',
            'Survival',
            'Swim',
            'Teaching',
            'Artes Liberales',
            'Civil and Canon Law',
            'Common Law',
            '(Dead Language)',
            'Medicine',
            'Philosophiae',
            'Theology',
            'Artes Liberales',
            'Civil and Canon Law',
            'Common Law',
            '(Dead Language)',
            'Medicine',
            'Philosophiae',
            'Theology'
        ];
        var magicSubjects = [
            'Creo',
            'Muto',
            'Rego',
            'Intellego',
            'Perdo',
            'Animal',
            'Auram',
            'Aquam',
            'Corpus',
            'Herbam',
            'Terram',
            'Ignem',
            'Imaginem',
            'Vim',
            'Mentem',
            'Creo',
            'Muto',
            'Rego',
            'Intellego',
            'Perdo',
            'Animal',
            'Auram',
            'Aquam',
            'Corpus',
            'Herbam',
            'Terram',
            'Ignem',
            'Imaginem',
            'Vim',
            'Mentem',
            'Code of Hermes',
            'Magic Lore',
            'Dominion Lore',
            'Faerie Lore',
            'Infernal Lore',
            'Penetration',
            'Finesse',
            'Magic Theory',
            'Magic Theory',
            'Parma Magica'
        ];

        var die = function (max) {
            if (!max) {
                max = 10;
            }
            return Math.floor(Math.random() * max)+1;
        };

        var randomSubject = function(isMagic) {
            if (isMagic) {
                return magicSubjects[die(magicSubjects.length - 1)];
            } else {
                return subjects[die(subjects.length - 1)];
            }
        };

        var summae = [];
        var tractatus = [];


        var makeBook = function(magic, boost) {
            //Communication +1
            var quality = 7;
            var price = 1;
            var crafted = 1;
            var isMagic = die(100) <= magic;
            var subject = randomSubject(isMagic);
            var currency = ' pounds';

            if (isMagic && magicSubjects.indexOf(subject) < 30){
                price+=2;
                currency = ' pawns';
            } else {
				quality += 3;
			}
			
			var boostDie = function(sides) {
				return die(sides)+boost;
			}

            if (boostDie() >= 5) {
                //Communication +2
                quality++;
            }
            if (boostDie() >= 6) {
                //Communication +3
                quality++;
            }
            if (boostDie() >= 7) {
                //Communication +4
                quality++;
            }
            if (boostDie() >= 9) {
                //Communication +5
                quality++;
            }
            if (isMagic) {
                //Resonant Construction
                quality++;
            }
			if (isMagic && boostDie() >= 7) {
				// Resonant Throughout
				quality++;
			}
			if (isMagic && boostDie() >= 9) {
				// Clarified
				quality++;
			}
            if (boostDie() >= 7) {
                //Great Teacher
                quality += 3;
            }

            if (boostDie() >= 4) {
                //Summae
				var getXpNeeded = function () {
					var xpNeeded = (level * (level + 1)) / 2;
					if (currency !== ' pawns') {
						xpNeeded = xpNeeded * 5;
					}
					return xpNeeded;
				}
				var getLevelFromXp = function(xp, ability) {
					var level = 0;
					var mult = ability ? 5 : 1;
					while (xp-((level+1)*mult) >= 0) {
						level++;
						xp-=level*mult;
					}
					return level;
				};
				
				var xp = 75 + (boostDie() * 10);
				while (boostDie() >= 6) {
					xp += boostDie() * 5;
				}
				
				
				var level = getLevelFromXp(xp, currency!==' pawns');
                var potential = Math.min(quality, level-1);
				var dieroll = boostDie(100);
                var levelReduction = Math.ceil((dieroll * potential)/100);
				if (levelReduction > potential) {
					levelReduction = potential;
				}
				level -= levelReduction;
				quality += levelReduction;
				
				while (quality > getXpNeeded()) {
					level++;
				}
				var state = level + quality;
				if (state >= 28) {
					price++;
				}
				if (state >= 35) {
					price++;
					if (isMagic && magicSubjects.indexOf(subject) < 30){
						price++;
					}
				}
				if (state >= 41) {
					price ++;
					if (isMagic && magicSubjects.indexOf(subject) < 30){
						price++;
					}
				}
				if (state <= 18) {
					price--;
				}
				price = Math.max(1, price);
                summae.push(subject + ' level: ' + level + ' quality: ' + quality + ', for ' + price + currency);
            } else {
                //Tractatus
				if (quality >= 15) {
					price++;
				}
                tractatus.push(subject + ' quality: ' + quality + ', for ' + price + currency);
            }
        };
        tractatus.forEach(function(tract) {console.log(tract);});
        var parts = message.split(' ');
        var numBooks = 1;
        var magicChance = 0;
		var boost = 0;
        if (parts.length >= 2) {
            numBooks = parseInt(parts[1]);
        }
        if (parts.length >= 3) {
            magicChance = parseInt(parts[2]);
        }
		if (parts.length >= 4) {
			boost = parseInt(parts[3]);
		}

        for (var i = 0; i < numBooks; i++) {
            makeBook(magicChance, boost);
        }

        var builder = '\nSUMMAE';
        summae.forEach(function(summa) {builder+='\n' + summa;});
        builder+='\n\nTRACTATUS';
        tractatus.forEach(function(tract) {builder+='\n' + tract;});
        return builder;
    };


    var fudgeDice = function () {
        var dice = 4;
        var diceSize = 3;
        var total = 0;
        var builder = '';
        var result;

        while (dice > 0) {
            result = Math.floor(Math.random() * diceSize);
            switch (result) {
                case 0:
                    builder+='-';
                    break;
                case 1:
                    builder+=' ';
                    break;
                case 2:
                    builder+='+';
                    break;
            }
            total += (result-1);
            dice -= 1;
            if (dice > 0) {
                builder += ',';
            }
        }
        return builder + '\n' + '**TOTAL: ' + total + '**';
    };

    var fateCards = function (message) {
        if (fateDeck.length === 0) {
            fateDeck = fateMasterDeck.slice(0);
            shuffle(fateDeck);
            mybot.reply(message, 'Fate Deck Shuffled');
        }
        return fateDeck.pop() + ', ' + fateDeck.length + ' cards remaining';
    };

    var fateCount = function () {
        var counts = {
            '-4':0,
            '-3':0,
            '-2':0,
            '-1':0,
            '0':0,
            '1':0,
            '2':0,
            '3':0,
            '4':0
        },
            avg = 0,
            count = 0;
        fateDeck.forEach(function(result) {
            counts[result]+=1;
            avg+=result;
            count++;
        });
        counts.average=(avg/count);
        return JSON.stringify(counts);
    };

    var shadowrunDice = function (message) {
        var dice = message.match(/([0-9]+)s/);
        var edge = message.match(/e/);
        var auto = message.match(/(\+|-)([0-9]+)/);
        var result;
        var builder = '';
        var successes = 0;
        var sucDice = 0;
        if (dice) {
            dice = parseInt(dice[1], 10);
        } else {
            dice = 0;
        }
        if (auto) {
            auto = parseInt(auto[0], 10);
        } else {
            auto = 0;
        }
        while (dice > 0) {
            result = Math.floor(Math.random() * 6);
            if (result === 0) {
                result = 6;
            }
            if (result >= 5) {
                successes += 1;
            }
            if (result === 6 && !!edge) {
                dice += 1;
                sucDice += 1;
            }
            if (result === 1) {
                builder += boldOnes + result + boldOnes;
            } else if (result >= 6) {
                builder += '**' + result + '**';
            } else  if (result >= 5) {
                builder += '*' + result + '*';
            } else {
                builder += result;
            }
            dice -= 1;
            if (dice > 0) {
                builder += ',';
            }
        }
        successes += auto;
        return builder + '\n' + '**SUCCESSES: ' + successes + '(' + sucDice + ')**';
    };

    var oneRingDice = function (message, client) {
        var dice = message.match(/([0-9]+)r/);
        var shadow = message.match(/s/);
        var weary = message.match(/w/);
        var auto = message.match(/(\+|-)([0-9]+)/);
        var eos = client.emojis.find('name','eos') || 'EYE';
        var gandalf = client.emojis.find('name','gandalf') || 'GANDALF';
        var result;
        var builder = '';
        var total = 0;
        var success = false;
        if (dice) {
            dice = parseInt(dice[1], 10);
        }
        if (auto) {
            auto = parseInt(auto[0], 10);
        } else {
            auto = 0;
        }
        result = Math.floor(Math.random() * 12);
        if (result === 0) {
            builder += eos;
            if (shadow) {
                total += 12;
                success = true;
            }
        } else if (result === 11) {
            builder += gandalf;
            if (!shadow) {
                total += 12;
                success = true;
            }
        } else {
            total += result;
            builder += result.toString();
        }
        while (dice > 0) {
            builder += ',';
            result = Math.floor(Math.random() * 6) + 1;

            if (result > 3 || !weary) {
                total += result;
            }
            if (result <= 3) {
                builder += '*' + result + '*';
            } else if (result === 6) {
                builder += '**' + result + '**';
            } else {
                builder += result.toString();
            }
            dice -= 1;
        }
        total += auto;
        return builder + '\n' + '**TOTAL: ' + (function () {if (success) { return ' AUTOMATIC SUCCESS';} else return total;})() + '**';
    };

    var newfiverDice = function (message, client) {
        var rings = message.match(/^([0-9]+)l/);
        var skill = message.match(/l([0-9]+)$/);
        var builder = '\n';
        var success = client.emojis.find('name','success') || 'success';
        var explosion = client.emojis.find('name','explosion') || 'explosion';
        var opportunity = client.emojis.find('name','opportunity') || 'opportunity';
        var strife = client.emojis.find('name','strife') || 'strife';
        var dieTypes = {
            ring: ['',success,success + ' ' + strife,explosion + ' ' + strife,opportunity,opportunity + ' ' + strife],
            skill: ['','',success,success,success + ' ' + opportunity,success + ' ' + strife,success + ' ' + strife,explosion,explosion + ' ' + strife,opportunity,opportunity,opportunity]
        };
        if (rings) {
            rings = parseInt(rings[1], 10);
        } else {
            rings = 0
        }
        if (skill) {
            skill = parseInt(skill[1], 10);
        } else {
            skill = 0
        }
        while (rings > 0) {
            builder += 'RING: ' + dieTypes.ring[Math.floor(Math.random() * dieTypes.ring.length)] + '\n';
            rings--;
        }
        while (skill > 0) {
            builder += 'SKILL: ' + dieTypes.skill[Math.floor(Math.random() * dieTypes.skill.length)] + '\n';
            skill--;
        }
        return builder;
    };

    var starWarsDice = function (message) {
        var dice = message.match(/sw([a-zA-Z]+)/);
        var result;
        var results = {};
        var builder = '';
        var dieTypes = {
            b: ['','','s','sa','aa','a'],
            s: ['','','f','f','t','t'],
            a: ['','s','s','ss','a','a','as','aa'],
            d: ['','f','ff','t','t','t','tt','ft'],
            p: ['','s','s','ss','ss','a','as','as','as','aa','aa','r'],
            c: ['','f','f','ff','ff','t','t','ft','ft','tt','tt','e'],
            f: ['d','d','d','d','d','d','dd','l','l','ll','ll','ll']
        };

        if (dice) {
            dice = dice[1].split('');
        }
        while (dice.length > 0) {
            result = Math.floor(Math.random() * dieTypes[dice[0]].length);
            result = dieTypes[dice[0]][result].split('');

            result.forEach(function(r){
                switch (r) {
                    case 's':
                        if (!results.successes) {
                            results.successes = 1;
                        } else {
                            results.successes += 1;
                        }
                        break;
                    case 'a':
                        if (!results.advantages) {
                            results.advantages = 1;
                        } else {
                            results.advantages += 1;
                        }
                        break;
                    case 'r':
                        if (!results.triumphs) {
                            results.triumphs = 1;
                        } else {
                            results.triumphs += 1;
                        }
                        break;
                    case 'f':
                        if (!results.failures) {
                            results.failures = 1;
                        } else {
                            results.failures += 1;
                        }
                        break;
                    case 't':
                        if (!results.threats) {
                            results.threats = 1;
                        } else {
                            results.threats += 1;
                        }
                        break;
                    case 'e':
                        if (!results.despirs) {
                            results.despairs = 1;
                        } else {
                            results.despairs += 1;
                        }
                        break;
                    case 'l':
                        if (!results.light) {
                            results.light = 1;
                        } else {
                            results.light += 1;
                        }
                        break;
                    case 'd':
                        if (!results.light) {
                            results.dark = 1;
                        } else {
                            results.dark += 1;
                        }
                        break;
                }
            });

            dice.shift();
        }
        return JSON.stringify(results, null, 4).replace('{','').replace('\n}','').replace(/"/g,'');
    };

    var l5rDice = function (message) {
        var dice = message.match(/([0-9]+)k/);
        var keep = message.match(/k([0-9]+)/);
        var explode = message.match(/e([0-9]+)/);
        var reroll = message.match(/r([0-9]+)/);
        var auto = message.match(/(\+|-)([0-9]+)/);
        var results = [];
        var total = 0;
        var final = 0;
        var highest = 0;
        var highIndex = 0;
        var result;
        var builder = '';
        if (dice) {
            dice = parseInt(dice[1], 10);
        } else {
            dice = 0;
        }
        if (keep) {
            keep = parseInt(keep[1], 10);
        } else {
            keep = 1;
        }
        if (explode) {
            explode = parseInt(explode[1], 10);
        } else {
            explode = 10;
        }
        if (reroll) {
            reroll = reroll[1];
        } else {
            reroll = '';
        }
        if (auto) {
            auto = parseInt(auto[0], 10);
        } else {
            auto = 0;
        }
        while (dice > 0) {
            total = 0;
            do {
                result = Math.floor(Math.random() * 10);
                if (reroll.indexOf(result.toString()) > -1) {
                    result = Math.floor(Math.random() * 10);
                }
                if (result === 0) {
                    result = 10;
                }
                total += result;
            } while (result >= explode);
            results.push(total);
            dice -= 1;
            if (dice > 0) {
                builder += ',';
            }
        }
        while (keep > 0) {
            highest = 0;
            highIndex = 0;
            results.forEach(function (res, index) {
                if (res > highest) {
                    highest = res;
                    highIndex = index;
                }
            });
            final += highest;
            if (highest >= explode) {
                results[highIndex] = '**' + results[highIndex] + '**';
            }
            results[highIndex] = '*' + results[highIndex] + '*';
            keep -= 1;
        }
        final += auto;
        builder = results.join(',');
        return builder + '\n' + '**TOTAL: ' + final + '**';
    };

    var initiativeHandler = function (message, user, mess) {
        var username = mess.guild.member(user).nickname || user.username;
        var raw = message.substr(1).toLowerCase();
        var parts = raw.split(' ');
        var command = parts[0];
        var highest = -9999999;
        var channelId = mess.channel.id;
        if (trackerMaster[channelId] === undefined) {
            trackerMaster[channelId] = {};
        }
        if (backMaster[channelId] === undefined) {
            backMaster[channelId] = [];
        }
        if (forwardMaster[channelId] === undefined) {
            forwardMaster[channelId] = [];
        }
        if (outputMaster[channelId] === undefined) {
            outputMaster[channelId] = '';
        }
        if (currentActorsMaster[channelId] === undefined) {
            currentActorsMaster[channelId] = [];
        }
        var tracker = trackerMaster[channelId];
        var back = backMaster[channelId];
        var forward = forwardMaster[channelId];
        var output = outputMaster[channelId];
        var currentActors = currentActorsMaster[channelId];

        if (parts[1]) {
            if (parts[1].toLowerCase() === 'me' || parts[1].toLowerCase() === 'my') {
                parts[1] = username.replace(/ /g,'').toLowerCase();
            }
        }
        if (parts[2]) {
            if (parts[2].toLowerCase() === 'me' || parts[2].toLowerCase() === 'my') {
                parts[2] = username.replace(/ /g,'').toLowerCase();
            }
        }
		if ((parts[1] && parts[1].toLowerCase() === 'all') || (parts[2] && parts[2].toLowerCase() === 'all')) {
			Object.keys(tracker).forEach(function (actor) {
				actor = tracker[actor];
				initiativeHandler(message.replace(/all/g,actor.name),user,mess);
			});
			return;
		}
        var sendMessage = function (msg, opt) {
            mess.channel.send(msg, opt)
            .then(function(){})
            .catch(console.error);
        };
        var decodeInitiative = function (str) {
            if (parseInt(str,10).toString() !== 'NaN') {
                return parseInt(str,10);
            } else {
                str = str.replace(/\**/g,'').replace(/\*/g,'');
                return parseInt(str,10);
            }
        };
        var reset = function () {
            var oldTracker = JSON.parse(JSON.stringify(tracker));
            trackerMaster[channelId] = {};
            back.push(function (un) {
                if (un==='undo') {
                    tracker = oldTracker;
                    sendMessage('Undoing reset');
                } else {
                    tracker = {};
                    sendMessage('Redoing reset');
                }
            });
        };
        var next = function () {
            var active = [];
            var oldActors = [];
            Object.keys(tracker).forEach(function (actor) {
                actor = tracker[actor];
                if (!actor.acted) {
                    if (actor.initiative > highest) {
                        highest = actor.initiative;
                        active = [actor];
                    } else if (actor.initiative === highest) {
                        active.push(actor);
                    }
                }
            });
            if (active.length > 0) {
                currentActors = active;
                output = highest + ':';
                active.forEach(function (actor) {
                    actor.acted = true;
                    output += ' ' + actor.name;
                    if (actor.maxmotes > 0) {
						if (actor.motes > -1) {
							output += '('  + actor.motes + '/' + actor.maxmotes + ')';
						} else {
							output += '(' + actor.maxmotes + ')';
						}
                    }
					if (actor.willpower > 0) {
						output += ' wp:' + actor.willpower;
					}
                    if (actor.damage > 0) {
                        output += ' damage:' + actor.damage;
                    }
                    if (actor.flags.length > 0) {
                        output += ' [' + actor.flags.join(',') + ']';
                    }
                    output += ',';
                });
                output = output.replace(/,$/, '');
                sendMessage(output);
                back.push(function (un) {
                    if (un === 'undo') {
                        active.forEach(function (actor) {
                            actor.acted = false;
                        });
                        sendMessage('Undoing next turn');
                    } else {
                        active.forEach(function (actor) {
                            actor.acted = true;
                        });
                        sendMessage('Redoing next turn');
                    }
                });
            } else {
                sendMessage('NEW TURN');
                currentActors = [];
                Object.keys(tracker).forEach(function (actorId) {
                    var actor = tracker[actorId];
                    actor.acted = false;
                    oldActors.push(JSON.parse(JSON.stringify(actor)));
					if (actor.motes > -1 && regen.indexOf(channelId) > -1) {
						actor.motes = Math.min(actor.motes+5,actor.maxmotes);
					}
                });
                list();
                back.push(function (un) {
                    if (un === 'undo') {
                        Object.keys(tracker).forEach(function (actorId, index) {
                            var actor = tracker[actorId];
                            actor.motes = oldActors[index].motes;
                            actor.acted = true;
                        });
                        sendMessage('Undoing New Turn');
                    } else {
                        Object.keys(tracker).forEach(function (actorId) {
                            var actor = tracker[actorId];
                            actor.acted = false;
                            oldActors.push(actor);
							if (actor.motes > -1) {
								actor.motes = Math.min(actor.motes+5,actor.maxmotes);
							}
                        });
                        sendMessage('NEW TURN');
                        list();
                        sendMessage('Redoing New Turn');
                    }
                });
            }
        };
        var add = function () {
            var name = parts[1];
            var actor = {
                name: name,
                initiative: parseInt(parts[2], 10) || 0,
                motes: shadowChannels.indexOf(channelId) === -1 ? parseInt(parts[3], 10) : -1 || -1,
                maxmotes: parseInt(parts[3], 10) || 0,
                damage: 0,
                flags: [],
				willpower: 0,
                acted: false
            };
            tracker[name] = actor;
            back.push(function (un) {
                if (un === 'undo') {
                    delete tracker[name];
                    sendMessage('Deleting ' + name);
                } else {
                    tracker[name] = actor;
                    sendMessage('Readding ' + name);
                }
            });
        };
        var remove = function () {
            var actor = tracker[parts[1]];
            var name = actor.name;
            if (!!actor) {
                delete tracker[name];
                back.push(function (un) {
                    if (un === 'undo') {
                        tracker[name] = actor;
                        sendMessage('Re-adding ' + name);
                    } else {
                        delete tracker[name];
                        sendMessage('Re-deleting ' + name);
                    }
                });
            }
        };
        var list = function () {
            var output = [],
                toPrint = 'Initiative:\n';
            Object.keys(tracker).forEach(function (name) {
                var actor = tracker[name];
                var data = '';
                var isActive = false;
                currentActors.forEach(function(act){
                    if (act.name === actor.name) {
                        isActive = true;
                    }
                });
                if (isActive) {
                    data += '**';
                } else if (actor.acted) {
                    data += '*';
                }
                data += actor.initiative + ' ' + name;
                if (actor.maxmotes > 0) {
                    if (actor.motes > -1) {
						data += '('  + actor.motes + '/' + actor.maxmotes + ')';
					} else {
						data += '(' + actor.maxmotes + ')';
					}
                }
				if (actor.willpower > 0) {
					data += ' wp:' + actor.willpower;
				}
                if (actor.damage > 0) {
                    data += ' damage:' + actor.damage;
                }
                if (actor.flags.length > 0) {
                    data += ' [' + actor.flags.join(',') + ']';
                }
                if (isActive) {
                    data += '**';
                } else if (actor.acted) {
                    data += '*';
                }
                output.push(data);
            });
            output.sort(function (a, b) { return decodeInitiative(b.split(' ')[0]) - decodeInitiative(a.split(' ')[0]) });
            output.forEach(function (val) {
                toPrint += val + '\n';
            });
            sendMessage('\n' + toPrint.replace(/\n$/, ''));
        };
        var addFlag = function () {
            var name = parts[1];
            var flag = parts[2].toLowerCase();
            if (tracker[name].flags.indexOf(flag) === -1) {
                tracker[name].flags.push(flag);
                back.push(function (un) {
                    if (un==='undo') {
                        tracker[name].flags.pop();
                        sendMessage('Removing flag ' + flag + ' from ' + name);
                    } else {
                        tracker[name].flags.push(flag);
                        sendMessage('Re-adding flag ' + flag + ' to ' + name);
                    }
                });
            }
        };
        var removeFlag = function () {
            var name = parts[1];
            var flag = parts[2].toLowerCase();
            var index = tracker[name].flags.indexOf(flag);
            if (index > -1) {
                tracker[name].flags.splice(index,1);
                back.push(function (un) {
                    if (un==='undo') {
                        tracker[name].flags.push(flag);
                        sendMessage('Re-adding flag ' + flag + ' to ' + name);
                    } else {
                        index = tracker[name].flags.indexOf(flag);
                        if (index > -1) {
                            tracker[name].flags.splice(index, 1);
                        }
                        sendMessage('Removing flag ' + flag + ' from ' + name);
                    }
                });
            }
        };
        var damage = function () {
            parts[3] = parts[2];
            parts[2] = 'damage';
            modify();
        };
        var set = function () {
			var trait = parts[2].toLowerCase();
			if (trait === 'init') {
				trait = 'initiative';
			} else if (trait === 'shadow') {
				trait = 'maxmotes';
			} else if (trait === 'vitae') {
				trait = 'motes';
			} else if (trait === 'maxvitae') {
				trait = 'maxmotes';
			} else if (trait === 'wp') {
				trait = 'willpower';
			}
            var oldValue = tracker[parts[1]][trait];
            var newValue = parseInt(parts[3], 10);
            var name = parts[1];
            tracker[name][trait] = newValue;
            back.push(function (un) {
                if (un==='undo') {
                    tracker[name][trait] = oldValue;
                    sendMessage('Reset ' + name + '\'s ' + parts[2].toLowerCase() + ' to ' + oldValue);
                } else {
                    tracker[name][trait] = newValue;
                    sendMessage('Re-set ' + name + '\'s ' + parts[2].toLowerCase() + ' to ' + newValue);
                }
            });
        };
        var modify = function () {
			var trait = parts[2].toLowerCase();
			if (trait === 'init') {
				trait = 'initiative';
			} else if (trait === 'shadow') {
				trait = 'maxmotes';
			} else if (trait === 'vitae') {
				trait = 'motes';
			} else if (trait === 'maxvitae') {
				trait = 'maxmotes';
			} else if (trait === 'wp') {
				trait = 'willpower';
			}
            var oldValue = tracker[parts[1]][trait];
            var newValue = oldValue + parseInt(parts[3], 10);
            var name = parts[1];
            tracker[name][trait] = newValue;
            back.push(function (un) {
                if (un==='undo') {
                    tracker[name][trait] = oldValue;
                    sendMessage('Reset ' + name + '\'s ' + parts[2].toLowerCase() + ' to ' + oldValue);
                } else {
                    tracker[name][trait] = newValue;
                    sendMessage('Re-set ' + name + '\'s ' + parts[2].toLowerCase() + ' to ' + newValue);
                }
            });
        };
        var withering = function () {
            var aName = parts[1];
            var dName = parts[2];
            var attackerOldValue = tracker[aName].initiative;
            var attackerNewValue = attackerOldValue + parseInt(parts[3], 10) + 1;
            var defenderOldValue = tracker[dName].initiative;
            var defenderNewValue = defenderOldValue - parseInt(parts[3], 10);
            if (defenderNewValue <= 0 && defenderOldValue > 0) {
                attackerNewValue += 5;
                sendMessage(dName + ' is CRASHED');
            }
            tracker[aName].initiative = attackerNewValue;
            tracker[dName].initiative = defenderNewValue;
            back.push(function (un) {
                if (un==='undo') {
                    tracker[aName].initiative = attackerOldValue;
                    tracker[dName].initiative = defenderOldValue;
                    sendMessage('Undoing withering attack');
                } else {
                    tracker[aName].initiative = attackerNewValue;
                    tracker[dName].initiative = defenderNewValue;
                    sendMessage('Redoing withering attack');
                }
            });
        };
        var undo = function() {
            var func;
            if (back.length > 0) {
                func = back.pop();
                func('undo');
                forward.push(func);
            } else {
                sendMessage('Nothing to Undo');
            }
        };
        var redo = function() {
            var func;
            if (forward.length > 0) {
                func = forward.pop();
                func('redo');
                back.push(func);
            } else {
                sendMessage('Nothing to Redo');
            }
        };
        var check = function () {
            var name = parts[1];
			var actor = tracker[name];
            var output = actor.initiative + ' ' + name;
			if (actor.maxmotes > 0) {
				if (actor.motes > -1) {
					output += '('  + actor.motes + '/' + actor.maxmotes + ')';
				} else {
					output += '(' + actor.maxmotes + ')';
				}
			}
			if (actor.willpower > 0) {
				output += ' wp:' + actor.willpower;
			}
			if (actor.damage > 0) {
				output += ' damage:' + actor.damage;
			}
			if (actor.flags.length > 0) {
				output += ' [' + actor.flags.join(',') + ']';
			}
            sendMessage(output);
        };
        var help = function () {
            var output = '\nreset\nnext\nadd NAME [INITIATIVE] [MAXMOTES]\nlist\ncheck NAME\nset NAME TRAIT VALUE\nmodify NAME TRAIT AMOUNT\nwithering ATTACKER DEFENDER AMOUNT\ndelete NAME\nundo\nredo\nhelp';
            sendMessage(output);
        };
        try {
            switch (command.toLowerCase()) {
                case 'reset':
                    reset();
                    break;
                case 'next':
                    next();
                    break;
                case 'add':
                    add();
                    break;
                case 'list':
                    list();
                    break;
                case 'check':
                    check();
                    break;
                case 'set':
                    set();
                    break;
                case 'modify':
                    modify();
                    break;
                case 'withering':
                    withering();
                    break;
                case 'damage':
                    damage();
                    break;
                case 'addflag':
                    addFlag();
                    break;
                case 'removeflag':
                    removeFlag();
                    break;
                case 'delete':
                case 'remove':
                    remove();
                    break;
                case 'undo':
                    undo();
                    break;
                case 'redo':
                    redo();
                    break;
                case 'help':
                    help();
                    break;
                case 'duel':
                    //duel();
                    break;
                case 'default':
                    sendMessage('Not Recognized Command');
            }
			saveInit();
        } catch (e) {
            sendMessage('INPUT ERROR');
        }
    };

	var saveInit = function () {
		fs.writeFileSync('./init.json', JSON.stringify(trackerMaster));
	};

    var mainProcess = function () {


     mybot = new Discord.Client();
     mybot.login(config.token);

     mybot.on('message', function(mess) {
        var user, channelID, message, server;
        var result;
        message = mess.content;
        channelID = mess.channel.id;
        user = mess.author;
		server = mess.channel.guild;
        var msg = message.match(/\((.+)\)/) || message.match(/\/roll (.+)/);
        if (message === '!startDice') {
            if (activeChannels.indexOf(channelID) === -1) {
                activeChannels+=channelID;
                fs.writeFileSync('./config.json', JSON.stringify({discord:config, activeChannels:activeChannels, shadow:shadowChannels, regen:regen}).replace(/\r?\n|\r/g,''));
            } else {
				mess.reply('Dice already started');
			}
        } else if (message === '!stopDice') {
            activeChannels = activeChannels.replace(channelID,'');
            fs.writeFileSync('./config.json', JSON.stringify({discord:config, activeChannels:activeChannels, shadow:shadowChannels, regen:regen}).replace(/\r?\n|\r/g,''));
        } else if (message === '!boldOnes') {
            if (boldOnes === '') {
                boldOnes = '***';
            } else {
                boldOnes = '';
            }
        } else if (message === '!shadow') {			
            if (shadowChannels.indexOf(channelID) === -1) {
                shadowChannels+=channelID;
                fs.writeFileSync('./config.json', JSON.stringify({discord:config, activeChannels:activeChannels, shadow:shadowChannels, regen:regen}).replace(/\r?\n|\r/g,''));
            } else {
				shadowChannels = shadowChannels.replace(channelID,'');
				fs.writeFileSync('./config.json', JSON.stringify({discord:config, activeChannels:activeChannels, shadow:shadowChannels, regen:regen}).replace(/\r?\n|\r/g,''));
			}
		} else if (message === '!regen') {
			if (regen.indexOf(channelID) === -1) {
				regen+=channelID;
				fs.writeFileSync('./config.json', JSON.stringify({discord:config, activeChannels:activeChannels, shadow:shadowChannels, regen:regen}).replace(/\r?\n|\r/g,''));
			} else {
				regen = regen.replace(channelID,'');
				fs.writeFileSync('./config.json', JSON.stringify({discord:config, activeChannels:activeChannels, shadow:shadowChannels, regen:regen}).replace(/\r?\n|\r/g,''));
			}
		} else if (message === '!config') {
			mess.reply(activeChannels);
			mess.reply(shadowChannels);
			mess.replay(regen);
			mess.reply(channelID);
		} else if (message.toLowerCase() === '!startrp') {
			if (rpconfig[server] === undefined) {
				rpconfig[server] = {};
			}
			if (rpconfig[server][user] === undefined) {
				rpconfig[server][user] = { enabled: true, avatar: '' };
				fs.writeFileSync('./rp.json', JSON.stringify(rpconfig));
			}
		} else if (message.toLowerCase().indexOf('!setavatar ') === 0) {
			var avPath = message.split(' ')[1];
			if (avPath.length > 0) {
				if (rpconfig[server] !== undefined && rpconfig[server][user] !== undefined) {
					rpconfig[server][user].avatar = avPath;
					fs.writeFileSync('./rp.json', JSON.stringify(rpconfig));
				}
			}
		} else if (message.toLowerCase() === '!clearavatar') {
			if (rpconfig[server] !== undefined && rpconfig[server][user] !== undefined) {
				rpconfig[server][user].avatar = '';
				fs.writeFileSync('./rp.json', JSON.stringify(rpconfig));
			}
		} else if (message.indexOf('"') === 0) {
			if (user !== latestSpeaker[server] && rpconfig[server] !== undefined 
				&& rpconfig[server][user] !== undefined && rpconfig[server][user].avatar !== '') {
				latestSpeaker[server] = user;
				mess.channel.send('',{
					embed: {
						thumbnail: {
							url: rpconfig[server][user].avatar
						}
					}
				});
			}
		} else if (message === '!clearlatest') {
			latestSpeaker[server] = '';
		} else if (message.toLowerCase().indexOf('!define ') === 0) {
			if (macros[server] === undefined) {
				macros[server] = {};
			}
			if (macros[server][user] === undefined) {
				macros[server][user] = {};
			}
			var macroParts = message.toLowerCase().split(' ');
			if (macroParts[1].match(/[a-zA-Z]+/)) {
				macros[server][user][macroParts[1]] = macroParts[2];
				fs.writeFileSync('./macros.json', JSON.stringify(macros));
			} else {
				mess.reply('ERROR: Name must be letters only');
			}
		} else if(message === '!macros') {
			var userMacros = {};
			if (macros[server] && macros[server][user]) {
				userMacros = macros[server][user];
			}
			mess.reply('Current Macros: ' + JSON.stringify(userMacros,null,4));
		} else if (message.indexOf('$') === 0) {
			var macroName = message.match(/\$([a-zA-Z]+)/);
			var macroModifier = message.match(/([\-\+][0-9]+)/);
			if (macroName) {
				macroName = macroName[1];
			}
			if (macroModifier) {
				macroModifier = parseInt(macroModifier[1]);
			} else {
				macroModifier = 0;
			}
			if (macros[server] && macros[server][user] && macros[server][user][macroName]) {
				var macro = macros[server][user][macroName];
				var numDice = macro.match(/([0-9]+)[a-z]/);
				if (numDice) {
					numDice = numDice[1];
					macro = macro.replace(numDice, Math.max(parseInt(numDice) + macroModifier, 1));
				}
				result = diceChecker(macro, mess.client);
				mess.reply(result);
			}
		} else {
            if (msg) {
                log(msg[1]);
                result = diceChecker(msg[1], mess.client);
                if (result) {
                    mess.reply(result);
                    }
                } else if (message.match(/^!/)) {
                	initiativeHandler(message, user, mess);
                }
            }
        });
    };
	
	var diceChecker = function (msg, client) {
		var result;
		if (msg.match(/^[0-9]+?e/)) {
			result = exaltedDice(msg)
		} else if (msg.match(/^[0-9]+?w/)) {
			result = wodDice(msg);
		} else if (msg.match(/^[0-9]+?o/)) {
			result = owodDice(msg);
		} else if (msg.match(/^[0-9]+?d/)) {
			result = baseDice(msg);
		} else if (msg.match(/^[0-9]+?s/)) {
			result = shadowrunDice(msg);
		} else if (msg.match(/^[0-9]+?k/)) {
			result = l5rDice(msg);
		} else if (msg.match(/^[0-9]+?l/)) {
			result = newfiverDice(msg, client);
		} else if (msg.match(/^[0-9]+?r/)) {
			result = oneRingDice(msg, client);
		} else if (msg.match(/^[0-9]+?x/)) {
			result = dxDice(msg, client);
		} else if (msg.match(/^sw[bsadpcfBSADPCF]+?/)) {
			result = starWarsDice(msg);
		} else if (msg === 'fudge') {
			result = fudgeDice();
		} else if (msg.match(/^stress+?/)) {
			result = stressDice(msg);
		} else if (msg.match(/^make[Bb]ooks/)) {
			result = makeBooks(msg);
		} else if (msg.match(/^dowsing/)) {
			result = dowsing(msg);
		}
		return result;
	};

    if (!fs.existsSync('./config.json')) {
        fs.writeFileSync('./config.json', JSON.stringify({discord:{token:'YOUR TOKEN'}}).replace(/\r?\n|\r/g,''));
    }
	
	if (!fs.existsSync('./rp.json')) {
		fs.writeFileSync('./rp.json', '{}');
	}

	var configFile = require('./config.json');
    config = configFile.discord;
    activeChannels = configFile.activeChannels || '';
	shadowChannels = configFile.shadow || '';
	regen = configFile.regen || '';
	rpconfig = require('./rp.json') || {};
	macros = require('./macros.json') || {};
	trackerMaster = require('./init.json') || {};
	

    if (config.token === 'YOUR TOKEN') {
        var pw=true;
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        console.log('Enter your Discord Bot Token: ');
        process.stdin.on('data', function (token) {
            config.token = token.replace(/\r?\n|\r/g,'');
            fs.writeFileSync('./config.json', JSON.stringify({discord:config}).replace(/\r?\n|\r/g,''));
            mainProcess();
        });
    } else {
        mainProcess();
    }
} catch (e) {log(e,true);}



