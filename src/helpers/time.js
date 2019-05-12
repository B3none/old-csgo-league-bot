module.exports = {
    // Returns the time in human-readable form, e.g. "x hours, y minutes, z seconds"
    prettifySeconds: seconds => {
        let hours = Math.floor(seconds / 3600);
        seconds = seconds % 3600;

        let minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;

        const times = [
            ['hour', hours],
            ['minute', minutes],
            ['second', seconds]
        ];

        let prettyTime = '';
        times.map(time => {
            if (time[1] <= 0) {
                return;
            }

            if (prettyTime !== '') {
                prettyTime += ', ';
            }

            prettyTime += `${time[1]} ${time[0]}`;

            if (time[1] > 1) {
                prettyTime += 's';
            }
        });

        return prettyTime;
    }
};