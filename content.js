window.addEventListener('load', () => {

	if (document.body.classList.contains('game_interface')) {
		const playersZone = document.querySelector('#player_boards');
		const gamesId = document.querySelector('.gamerank_no').id.replace('gamerank_no_', '');

		Array.from(playersZone.querySelectorAll('.player-name')).map((player) => {
			const id = player.id.replace('player_name_', '');
			fetch(`https://boardgamearena.com/gamestats/gamestats/getGames.html?player=${id}&game_id=${gamesId}&opponent_id=0&updateStats=1`).
				then((response) => response.json()).
				then((response) => makePlayerInfo(id, response)).
				catch((err) => console.log(err));
		});

		const makePlayerInfo = (playerId, playerInfo) => {
			const playerInfoToRender = {};
			playerInfoToRender.playerInfoBlock = document.querySelector(`#overall_player_board_${playerId}`);
			playerInfoToRender.gamesPlayed = playerInfo.data.stats.general.played ?? 0;
			playerInfoToRender.gamesWon = playerInfo.data.stats.general.victory ?? 0;
			playerInfoToRender.avaragePoints = playerInfo.data.stats.general.score ?? 0;

			renderPlayerInfo(playerInfoToRender);
		}

		const renderPlayerInfo = (playerInfoToRender) => {
			const infoBlock = document.createElement('div');
			const gamesPlayedBlock = document.createElement('span');
			const gamesWonBlock = document.createElement('span');
			const avaragePointsBlock = document.createElement('span');
			playerInfoToRender.playerInfoBlock.querySelector('.player_elo_wrap').style.cssText = 'visibility: visible;'

			infoBlock.style.cssText = 'font-size: 14px; margin-top: 10px;'
			gamesPlayedBlock.innerText = `Games played: ${playerInfoToRender.gamesPlayed}\n`;
			gamesWonBlock.innerText = `Games won: ${playerInfoToRender.gamesWon}\n`;
			avaragePointsBlock.innerText = `Average points: ${playerInfoToRender.avaragePoints}\n`;

			infoBlock.append(gamesPlayedBlock);
			infoBlock.append(gamesWonBlock);
			infoBlock.append(avaragePointsBlock);

			playerInfoToRender.playerInfoBlock.append(infoBlock);
		}
	}

	if (window.location.pathname.includes('sechsnimmt')) {
		let remainingCards = [];
		let handCards = [];
		let tableCards = [];
		let releasedCards = [];
		const gameZone = document.querySelector('#gamespace_wrap');

		const getCards = (cards, replaceString) => {
			return cards.map((card) => {
				if (!!card.id) {
					return card.id.replace(replaceString, '');
				}

				return 0;
			}).filter((card) => card !== 0);
		}

		const renderCards = (gameZone, handCards, tableCards, releasedCards, remainingCards) => {
			console.log(`REMAINING: ${remainingCards}`);
			console.log(`RELEASED : ${releasedCards}`);
			console.log(`TABLE : ${tableCards}`);
			console.log(`HAND : ${handCards}`);

			if (gameZone.classList.contains('info-added')) {
				const remainingBlock = gameZone.querySelector('.remaining');
				const releasedBlock = gameZone.querySelector('.released');
				remainingBlock.innerText = `Remaining cards: \n ${remainingCards}`;
				releasedBlock.innerText = `Released cards: \n ${releasedCards}`;

				if (document.querySelector('#overall-content').classList.value === 'gamestate_cardChoice') {
					remainingBlock.style.top = '0';
					releasedBlock.style.top = '0';
				}

				return;
			}

			const remainingCardsSpan = document.createElement('span');
			const releasedCardsSpan = document.createElement('span');
			remainingCardsSpan.classList.add('remaining');
			releasedCardsSpan.classList.add('released');
			remainingCardsSpan.innerText = `Remaining cards: \n ${remainingCards}`;
			releasedCardsSpan.innerText = `Released cards: \n ${releasedCards}`;
			remainingCardsSpan.style.cssText = 'color: #2ea83a; position: absolute; top: 0; left: 500px; z-index: 1; width: 105px; font-size: 16px; font-weight: bold; background-color: white;';
			releasedCardsSpan.style.cssText = 'color: #e52e3a; position: absolute; top: 0; left: 620px; z-index: 1; width: 105px; font-size: 16px; font-weight: bold; background-color: white;';

			gameZone.append(remainingCardsSpan);
			gameZone.append(releasedCardsSpan);
			gameZone.classList.add('info-added');
		}

		const makeCards = () => {
			let oldTableCards = [...tableCards];
			handCards = getCards(Array.from(document.querySelector('#player_hand').childNodes), 'player_hand_item_');
			tableCards = getCards(Array.from(document.querySelector('#cards_on_table').childNodes), 'card_');
			oldTableCards = oldTableCards.filter((card) => {
				return !tableCards.includes(card);
			});
			releasedCards = [...releasedCards, ...oldTableCards];

			remainingCards = [];
			for (let i = 1; i < 105; i++) {
				const num = `${i}`;
				if (tableCards.includes(String(num)) || releasedCards.includes(num) || handCards.includes(num)) {
					continue;
				}

				remainingCards.push(i);
			}

			renderCards(gameZone, handCards, tableCards, releasedCards.sort((a, b) => a - b).join(', '), remainingCards.join(', '));
		}

		const resetCards = () => {
			remainingCards = [];
			handCards = [];
			tableCards = [];
			releasedCards = [];
		};

		// Make initial cards after game is load
		makeCards();

		const gameStateObserver = new MutationObserver(() => {
			if (document.querySelector('#player_hand').childElementCount === 10) {
				resetCards();
			}
			else if (
				document.querySelector('#overall-content').classList.value === 'gamestate_cardPlace' ||
				document.querySelector('#overall-content').classList.value === 'gamestate_smallestCard'
			) {
				gameZone.querySelector('.remaining').style.top = '460px';
				gameZone.querySelector('.released').style.top = '460px';
			}
			else if (document.querySelector('#overall-content').classList.value === 'gamestate_cardChoice') {
				makeCards();
			}
			else if (document.querySelector('#overall-content').classList.value === 'gamestate_gameEnd') {
				gameStateObserver.disconnect();
				cardsChangedObserver.disconnect();
				console.log("KONEC");
			}
		});
		gameStateObserver.observe(document.querySelector('#overall-content'), {attributes: true});

		const cardsChangedObserver = new MutationObserver (() => {
			makeCards();
		});
		cardsChangedObserver.observe(document.querySelector('#cards_on_table'), {childList: true});
	}

});
