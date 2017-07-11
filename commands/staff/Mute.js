module.exports = Cmds.addCommand({
    cmds: [';mute ', ';mutehammer '],

    requires: {
        guild: true,
        loud: false,
    },

    desc: 'Mute a user (in all guild channels) and add the mute to their record',

    args: '([@user] | [id] | [name]) (OPT: [mute_length]) (OPT: [mute_length_format]) (OPT: [reason])',

    example: 'vae 2 minutes being weird',

    // /////////////////////////////////////////////////////////////////////////////////////////

    func: (cmd, args, msgObj, speaker, channel, guild) => {
        args = args.trim();

        /* const data = Util.getDataFromString2(args,
            [
                {
                    func(str) {
                        return Util.getMemberByMixed(str, guild) || Util.isId(str);
                    },
                },
                {
                    func(str) {
                        return Util.matchWholeNumber(str);
                    },
                    optional: true,
                },
                {
                    func(str) {
                        let mult;
                        str = str.toLowerCase();
                        if (str.substr(str.length - 1, 1) == 's' && str.length > 2) str = str.substr(0, str.length - 1);
                        if (str == 'millisecond' || str == 'ms') mult = 1 / 60 / 60 / 1000;
                        if (str == 'second' || str == 's' || str == 'sec') mult = 1 / 60 / 60;
                        if (str == 'minute' || str == 'm' || str == 'min') mult = 1 / 60;
                        if (str == 'hour' || str == 'h') mult = 1;
                        if (str == 'day' || str == 'd') mult = 24;
                        if (str == 'week' || str == 'w') mult = 24 * 7;
                        if (str == 'month' || str == 'mo') mult = 24 * 30.42;
                        if (str == 'year' || str == 'y') mult = 24 * 365.2422;
                        return mult;
                    },
                    optional: true,
                    requires: 1,
                    prefix: / ?/,
                },
            ]
        , true);

        console.log(`Mute Arg Data: ${data}`);

        if (!data.success) {
            return Util.sendEmbed(channel, 'Mute Failed', 'User not found', Util.makeEmbedFooter(speaker), null, 0x00E676, null);
        }

        const member = data[0];
        const mult = data[2] || 1;
        const time = data[1] ? data[1] * 1000 * 60 * 60 * mult : null;
        const reason = data.extra && data.extra.trim(); */

        const data = Util.getDataFromString(args,
            [
                [
                    function (str) {
                        return Util.getMemberByMixed(str, guild) || Util.isId(str);
                    },
                ],
                [
                    function (str) {
                        return Util.matchWholeNumber(str);
                    },
                ],
                [
                    function (str) {
                        let mult;
                        str = str.toLowerCase();
                        if (str.substr(str.length - 1, 1) == 's' && str.length > 2) str = str.substr(0, str.length - 1);
                        if (str == 'millisecond' || str == 'ms') mult = 1 / 60 / 60 / 1000;
                        if (str == 'second' || str == 's' || str == 'sec') mult = 1 / 60 / 60;
                        if (str == 'minute' || str == 'm' || str == 'min') mult = 1 / 60;
                        if (str == 'hour' || str == 'h') mult = 1;
                        if (str == 'day' || str == 'd') mult = 24;
                        if (str == 'week' || str == 'w') mult = 24 * 7;
                        if (str == 'month' || str == 'mo') mult = 24 * 30.42;
                        if (str == 'year' || str == 'y') mult = 24 * 365.2422;
                        return mult;
                    },
                ],
            ]
        , true);

        if (!data) {
            return Util.sendEmbed(channel, 'Mute Failed', 'User not found', Util.makeEmbedFooter(speaker), null, 0x00E676, null);
        }

        console.log(`Change Arg Data: ${data}`);

        const member = data[0];
        const mult = data[2] || 1;
        const time = data[1] ? data[1] * 1000 * 60 * 60 * mult : null;
        const reason = data[3];

        Mutes.addMute(guild, channel, member, speaker, { 'time': time, 'reason': reason });

        return true;
    },
});
