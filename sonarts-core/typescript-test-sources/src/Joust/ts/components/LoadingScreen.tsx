import * as React from "react";
import MessagePicker from "./MessagePicker";

interface LoadingScreenProps extends React.ClassAttributes<LoadingScreen> {
	players?: string[];
}

export default class LoadingScreen extends React.Component<LoadingScreenProps, void> {
	private messages = [
		// Cardgames
		"Sorting decks...",
		"Summoning heroes...",
		"Nerfing cards...",
		"Buffing cards...",
		"Painting cards...",
		"Tossing coin...",
		"Calculating lethal...",
		"Dusting collection...",
		"Deploying anti-cheats...",
		"Writing new spinner text...",

		// Innkeeper
		"Warming frozen boots...",
		"Finding room for another...",

		// Classic
		"Watching your back...",
		"Overloading...",
		"Unlocking Overload...",
		"Armoring up...",
		"Enraging Worgen...",
		"Feeding Hungry Crab...",
		"Rolling Need...",
		"Disguising Toast...",
		//"Shadowstepping Coldlights...",
		//"Requiring assistance...",

		// Goblins vs Gnomes
		"Spinning up...",
		"Summoning Boom Bots...",
		"Piloting Shredder...",

		// Naxxramas
		"Poisoning seeds...",

		// Blackrock Mountain
		"Hatching Dragon Eggs...",
		"Getting everyone in here...",

		// Grand Tournament
		"Funneling Cakes...",
		"Managing Coliseum...",

		// League
		"Excavating Evil...",
		"Finding Golden Monkey...",
		"Stealing Artifacts...",

		// Old Gods
		"Spreading Madness...",
		"Spreading C'Thun's word...",

		// Karazhan
		"Guarding the Menagerie...",
		"Clawing Spirits...",
		"Purifying...",

		// Mean Streets
		"Loading Cannon...",
		"Patching Patches...",

		// Goroes
		"Rerolling Quests...",
		"Hunting for Dinosaurs...",

		// Greetings
		'"Well met!"',
		'"Taz\'dingo!"',

		// Meme
		"Trading for value...",
		"Prep-Coin-Conceding...",
		"Befriending recent opponent...",
		"Going face...",
		"Stream-sniping...",
		"Curving perfectly...",
		"Milling Reno...",
		"Creeping power...",
		/*"Going full Northshire...",
		 "Dropping a 4 mana 7/7...",
		 "Removing Sorry emote...",
		 "Restoring Sorry emote...",
		 "Unlocking more deck slots...",
		 "Pressing the button...",
		 "Executing own Sylvanas...",
		 "Searching for Unicorn Priest",
		 */

		// other games
		"Massing Void Rays...",
		"Assembling Exodia pieces...",
		//'"Ryuu ga waga teki oh wrong game."',
	];

	public render() {
		let players = String.fromCharCode(160); // &nbsp;

		if (this.props.players && this.props.players.length) {
			switch (this.props.players.length) {
				case 1:
					players = this.props.players[0];
					break;
				case 2:
					players = this.props.players[0] + " vs. " + this.props.players[1];
					break;
			}
		}

		return <div className="joust-loading-screen">
			{this.props.children ? this.props.children :
				<p><MessagePicker interval={2} messages={this.messages} /></p>}
			<p className="participants">{players}</p>
		</div>;
	}
}
