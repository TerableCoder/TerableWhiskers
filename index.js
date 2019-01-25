module.exports = function TerableLogin(mod) {	
	const command = mod.command || mod.require.command;
	const RODS = [206700, 206701, 206702, 206703, 206704, 206705, 206706, 206707, 206708, 206709, 206710, 206711, 206712, 206713, 206714, 206715, 206716, 206717, 206718, 206719, 206720, 206721, 206722, 206723, 206724, 206725, 206726, 206727, 206728];
	const WHISKERS = [206100, 206101, 206102, 206103, 206104, 206105, 206106, 206107, 206108, 206109];
	const OTHERMASK = [48056, 48057, 48058, // alliance mask
	88631, 88632, 88633, 88634, 88635, 88636, 88637, 88638, // onset/infinity
	88735, 88736, // guardian 
	88784, 88785, 88786, 88787]; // transcendent 

	let enabled = true,
		gameId = 0n,
		whiskersLocations = [], // slot
		timeEquip = new Date().getTime(),
		timeUnequip = new Date().getTime(),
		timeElapsed = -1,
		items1 = [],
		items2 = [],
		items1First = true,
		whiskersAreEquipped = false;
	
	command.add(['teraw', 'twhiskers', 'terawhiskers', 'terablewhiskers'], {
		$default() {
			enabled = !enabled; // idk why you're turning it off tbh
        	command.message(`TerableWhiskers is now ${enabled ? "enabled." : "disabled."}`);
    	}
	});
	
	mod.hook('S_LOGIN', 12, event => {
        gameId = event.gameId;
    });
	
	mod.hook('S_RETURN_TO_LOBBY', 1, event => {
		whiskersAreEquipped = false;
		items1 = [];
		items2 = [];
		items1First = true;
    });
	
	mod.hook('C_USE_ITEM', 3, event => {
		if(!enabled) return;
		
    	if(RODS.includes(event.id)) {
			if(!whiskersAreEquipped){
				mod.toClient('S_CHAT', 2, { channel: 21, authorName: 'TerableWhiskers', message: "You're fishing without whiskers!!!"});
				command.message(`You're fishing without whiskers!!!`);
			}
		}
	});
	
	mod.hook('S_INVEN', 17, event => {
		if(items1First){ items1 = event.items; } // tera usually sends 2 s_inven packets, so store both
		else { items2 = event.items; }
		items1First = !items1First;
		
		for (let item of event.items) {
			if (item.slot == 13 && WHISKERS.includes(item.id)){ // whiskers equipped
				whiskersAreEquipped = true;
			} else if(WHISKERS.includes(item.id)){ // whiskers in inventory
				if(whiskersLocations.indexOf(item.id) == -1) whiskersLocations.push(item.slot);
			}
		}
    });
	
	mod.hook('C_EQUIP_ITEM', 2, event => {
		if(gameId != event.gameId) return;
		
		if(items1.length > 0){
			for (let item of items1) { // parse inventory 1
				if(item.slot == event.slot){ // if we found the item getting equipped 
					if(OTHERMASK.includes(item.id)){ // and non-whisker
						whiskersAreEquipped = false;
					} else if(WHISKERS.includes(item.id)){ // or whisker
						whiskersAreEquipped = true;
					}
					break;
				}
			}
		}
		if(items2.length > 0){
			for (let item of items2) { // parse inventory 2
				if(item.slot == event.slot){ // if we found the item getting equipped 
					if(OTHERMASK.includes(item.id)){ // and non-whisker
						whiskersAreEquipped = false;
					} else if(WHISKERS.includes(item.id)){ // or whisker
						whiskersAreEquipped = true;
					}
					break;
				}
			}
		}
    });
	
	mod.hook('C_UNEQUIP_ITEM', 1, event => {
		if(gameId != event.cid || event.slot != 13) return; // not me or not mask
		
		if(WHISKERS.includes(event.item)){
			timeUnequip = new Date().getTime();
			mod.hookOnce('S_INVEN_CHANGEDSLOT', 1, event => { // if your whiskers get unequipped within 1 second, they got unequipped
				timeElapsed = new Date().getTime() - timeUnequip;
				if(timeElapsed < 1000) whiskersAreEquipped = false;
			});
		}
    });
}
