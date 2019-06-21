const _ = require("lodash");

let splitByELO = class {
    balance(teamCollection) {
        let teamA = [];
        let teamB = [];

        teamCollection = _.orderBy(teamCollection, "score", ["desc"]);

        while (teamCollection.length > 0) {
            if (this.getTeamAverage(teamA) >= this.getTeamAverage(teamB)) {
                this.setTwoCaptains(teamCollection, teamB, teamA);
            } else {
                this.setTwoCaptains(teamCollection, teamB, teamA);
            }
        }

        teamA = _.orderBy(teamA, "score", ["desc"]);
        teamB = _.orderBy(teamB, "score", ["desc"]);

        return teamA.concat(teamB);
    }

    getTeamAverage(teamCollection) {
        return teamCollection.length ? parseInt(_.sumBy(teamCollection, 'score') / teamCollection.length) : 0;
    }

    setTwoCaptains(playersCollection, team1, team2) {
        team1.push(playersCollection.shift());
        team2.push(playersCollection.shift());
    }
}

module.exports = splitByELO;