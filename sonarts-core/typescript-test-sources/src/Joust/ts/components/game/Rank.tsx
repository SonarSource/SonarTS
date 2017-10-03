import * as React from "react";
import {RankProps} from "../../interfaces"
import RankArt from "./visuals/RankArt"

export default class Rank extends React.Component<RankProps, void> {
    public render(): JSX.Element {
        if (this.props.rank > 0) {
            return (
                <div className="rank">
                    <RankArt rank={this.props.rank} assetDirectory={this.props.assetDirectory} cardArtDirectory={this.props.cardArtDirectory}/>
                    <div className="rank-text">
                        {this.props.rank}
                    </div>
                </div>
            );
        }
        if (this.props.legendRank > 0) {
            return (
                <div className="rank">
                    <RankArt legendRank={this.props.legendRank} assetDirectory={this.props.assetDirectory} cardArtDirectory={this.props.cardArtDirectory}/>
                    <div className="legend-text">
                        {this.props.legendRank}
                    </div>
                </div>
            );
        }
        return null;
    }
}
