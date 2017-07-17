console.log('\n-STARTING-\n');

// //////////////////////////////////////////////////////////////////////////////////////////////

const Auth = require('./Auth.js');

exports.FileSys = require('fs');
exports.DateFormat = require('dateformat');
exports.Request = require('request');
exports.Urban = require('urban');
const TrelloObj = require('node-trello');
exports.Ytdl = require('ytdl-core');
exports.Path = require('path');
exports.NodeOpus = require('node-opus');
exports.Exec = require('child_process').exec;
const YtInfoObj = require('youtube-node');
exports.Translate = require('google-translate-api');
exports.MySQL = require('mysql');

exports.YtInfo = new YtInfoObj();
exports.TrelloHandler = new TrelloObj(Auth.trelloKey, Auth.trelloToken);

exports.linkGuilds = [
    ['284746138995785729', '309785618932563968'],
];

exports.dbPass = Auth.dbPass;

// //////////////////////////////////////////////////////////////////////////////////////////////

global.index = module.exports;

global.has = Object.prototype.hasOwnProperty;
global.selfId = '224529399003742210';
global.vaebId = '107593015014486016';

global.Util = require('./Util.js');
global.Data = require('./data/ManageData.js');
global.Trello = require('./core/ManageTrello.js');
global.Mutes = require('./core/ManageMutesNew.js');
global.MutesOld = require('./core/ManageMutes.js'); // Will be replaced with MutesNew upon completion
global.Music = require('./core/ManageMusic.js');
global.Cmds = require('./core/ManageCommands.js');
global.Events = require('./core/ManageEvents.js');
global.Discord = require('discord.js');

exports.YtInfo.setKey(Auth.youtube);

Discord.GuildMember.prototype.getProp = function (p) {
    if (this[p] != null) return this[p];
    return this.user[p];
};

Discord.User.prototype.getProp = function (p) {
    return this[p];
};

global.client = new Discord.Client({
    disabledEvents: ['TYPING_START'],
    fetchAllMembers: true,
    disableEveryone: true,
});

// //////////////////////////////////////////////////////////////////////////////////////////////

exports.dailyMutes = [];
exports.dailyKicks = [];
exports.dailyBans = [];

exports.commandTypes = {
    locked: 'vaeb',
    staff: 'staff',
    public: 'null',
};

const briefHour = 2;
const msToHours = 1 / (1000 * 60 * 60);
const dayMS = 24 / msToHours;
let madeBriefing = false;

global.colAction = 0xF44336; // Log of action, e.g. action from within command
global.colUser = 0x4CAF50; // Log of member change
global.colMessage = 0xFFEB3B; // Log of message change
global.colCommand = 0x2196F3; // Log of command being executed

exports.blockedUsers = {};
exports.blockedWords = [];

exports.runFuncs = [];
exports.warnedImage = {};

// //////////////////////////////////////////////////////////////////////////////////////////////

function setBriefing() {
    setTimeout(() => {
        const time1 = new Date();
        const time2 = new Date();

        time2.setHours(briefHour);
        time2.setMinutes(0);
        time2.setSeconds(0);
        time2.setMilliseconds(0);

        const t1 = +time1;
        const t2 = +time2;
        let t3 = t2 - t1;
        if (t3 < 0) t3 += dayMS;

        const channel = client.channels.get('168744024931434498');
        // const guild = channel.guild;

        console.log(`\nSet daily briefing for ${t3 * msToHours} hours\n`);

        setTimeout(() => {
            // const upField = { name: '​', value: '​', inline: false };
            const muteField = { name: 'Mutes', value: 'No mutes today', inline: false };
            // var rightField = {name: "​", value: "​"}
            const kickField = { name: 'Kicks', value: 'No kicks today', inline: false };
            const banField = { name: 'Bans', value: 'No bans today', inline: false };

            const embFields = [muteField, kickField, banField];

            const embObj = {
                title: 'Daily Briefing',
                description: '​',
                fields: embFields,
                footer: { text: '>> More info in #vaebot-log <<' },
                thumbnail: { url: './resources/avatar.png' },
                color: 0x00E676,
            };

            if (exports.dailyMutes.length > 0) {
                const dataValues = [];

                for (let i = 0; i < exports.dailyMutes.length; i++) {
                    const nowData = exports.dailyMutes[i];
                    const userId = nowData[0];
                    // const userName = nowData[1];
                    const userReason = nowData[2];
                    // const userTime = nowData[3];
                    const targMention = `<@${userId}>`;
                    let reasonStr = '';
                    if (userReason != null && userReason.trim().length > 0) {
                        reasonStr = ` : ${userReason}`;
                    }
                    dataValues.push(targMention + reasonStr);
                }

                muteField.value = dataValues.join('\n\n');
            }

            muteField.value = `​\n${muteField.value}\n​`;

            if (exports.dailyKicks.length > 0) {
                const dataValues = [];

                for (let i = 0; i < exports.dailyKicks.length; i++) {
                    const nowData = exports.dailyKicks[i];
                    const userId = nowData[0];
                    // const userName = nowData[1];
                    const userReason = nowData[2];
                    const targMention = `<@${userId}>`;
                    let reasonStr = '';
                    if (userReason != null && userReason.trim().length > 0) {
                        reasonStr = ` : ${userReason}`;
                    }
                    dataValues.push(targMention + reasonStr);
                }

                kickField.value = dataValues.join('\n\n');
            }

            kickField.value = `​\n${kickField.value}\n​`;

            if (exports.dailyBans.length > 0) {
                const dataValues = [];

                for (let i = 0; i < exports.dailyBans.length; i++) {
                    const nowData = exports.dailyBans[i];
                    const userId = nowData[0];
                    // const userName = nowData[1];
                    const userReason = nowData[2];
                    const targMention = `<@${userId}>`;
                    let reasonStr = '';
                    if (userReason != null && userReason.trim().length > 0) {
                        reasonStr = ` : ${userReason}`;
                    }
                    dataValues.push(targMention + reasonStr);
                }

                banField.value = dataValues.join('\n\n');
            }

            banField.value = `​\n${banField.value}\n​`;

            if (exports.dailyMutes.length > 0
                || exports.dailyKicks.length > 0
                || exports.dailyBans.length > 0) {
                channel.send(undefined, { embed: embObj })
                .catch(error => console.log(`\n[E_SendBriefing] ${error}`));
            }

            exports.dailyMutes = []; // Reset
            exports.dailyKicks = [];
            exports.dailyBans = [];

            setBriefing();
        }, t3);
    }, 2000); // Let's wait 2 seconds before starting countdown, just in case of floating point errors triggering multiple countdowns
}

exports.globalBan = {
    '201740276472086528': true,
    '75736018761818112': true,
    '123146298504380416': true, // Oseday
    '263372398059847681': true,
    '238981466606927873': true, // Lindah
    '189687397951209472': true, // xCraySECx / Nico Nico
    '154255141317378050': true, // HighDefinition
    '157749388964265985': true, // Zetroxer
    '280419231181307906': true, // Solarical
};

function securityFunc(guild, member, sendRoleParam) {
    const guildName = guild.name;
    // const guildId = guild.id;

    const memberId = member.id;
    const memberName = Util.getFullName(member);

    let sendRole = sendRoleParam;
    if (sendRole == null) sendRole = Util.getRole('SendMessages', guild);

    if (has.call(exports.globalBan, memberId)) {
        member.kick()
        .catch(console.error);
        console.log(`Globally banned user ${memberName} had already joined ${guildName}`);
        return;
    }

    if (sendRole != null) {
        const isMuted = Mutes.checkMuted(guild, memberId);
        if (isMuted) {
            if (Util.hasRole(member, sendRole)) {
                member.removeRole(sendRole)
                .catch(console.error);
                console.log(`Muted user ${memberName} had already joined ${guildName}`);
            }
        } else if (!Util.hasRole(member, sendRole)) {
            member.addRole(sendRole)
            .catch(console.error);
            console.log(`Assigned SendMessages to old member ${memberName}`);
        }
    }
}

function setupSecurity(guild) {
    const sendRole = Util.getRole('SendMessages', guild);

    console.log(`Setting up security for ${guild.name} (${guild.members.size} members)`);

    guild.members.forEach((member) => {
        securityFunc(guild, member, sendRole);
    });
}

function setupSecurityVeil() {
    const veilGuild = client.guilds.get('284746138995785729');
    if (!veilGuild) return console.log('[ERROR_VP] Veil guild not found!');
    const guild = client.guilds.get('309785618932563968');
    if (!guild) return console.log('[ERROR_VP] New Veil guild not found!');
    const veilBuyer = veilGuild.roles.find('name', 'Buyer');
    if (!veilBuyer) return console.log('[ERROR_VP] Veil Buyer role not found!');
    const newBuyer = guild.roles.find('name', 'Buyer');
    if (!newBuyer) return console.log('[ERROR_VP] New Buyer role not found!');
    // const guildId = guild.id;
    // const guildName = guild.name;

    console.log(`Setting up auto-kick for ${guild.name} (${guild.members.size} members)`);

    guild.members.forEach((member) => {
        const memberId = member.id;

        if (memberId === vaebId || memberId === selfId) return;

        const memberName = Util.getFullName(member);
        const veilMember = Util.getMemberById(memberId, veilGuild);
        if (!veilMember) {
            console.log(`[Auto-Old-Kick 1] User not in Veil: ${memberName}`);
            member.kick()
            .catch(error => console.log(`\n[E_AutoOldKick1] ${memberName} | ${error}`));
            return;
        }
        if (!veilMember.roles.has(veilBuyer.id)) {
            console.log(`[Auto-Old-Kick 2] User does not have Buyer role: ${memberName}`);
            member.kick()
            .catch(error => console.log(`\n[E_AutoOldKick2] ${memberName} | ${error}`));
            return;
        }
        if (!member.roles.has(newBuyer.id)) {
            member.addRole(newBuyer)
            .catch(error => console.log(`\n[E_AutoOldAddRole1] ${memberName} | ${error}`));
            console.log(`Updated old member with Buyer role: ${memberName}`);
        }
    });

    return undefined;
}

const veilGuilds = {
    '284746138995785729': true,
    '309785618932563968': true,
};

exports.secure = async function () {
    console.log('\n> Securing guilds...\n');

    let securityNum = 0;
    const veilGuildsNum = Object.keys(veilGuilds).length;

    await Promise.all(client.guilds.map(async (guild) => {
        const newGuild = await guild.fetchMembers();
        if (newGuild == null) {
            console.log(newGuild);
            console.log('Found null guild');
            return;
        }

        if (has.call(veilGuilds, newGuild.id)) {
            securityNum++;
            if (securityNum === veilGuildsNum) setupSecurityVeil();
        }

        setupSecurity(newGuild);

        Trello.setupCache(newGuild);
    }));

    console.log('\n> Security setup complete\n');
};

// //////////////////////////////////////////////////////////////////////////////////////////////

Cmds.initCommands();

// Index_Ready -> Data_SQL -> Mutes_Initialize -> Index_Secure

client.on('ready', async () => {
    console.log(`\n> Connected as ${client.user.username}!\n`);

    if (madeBriefing === false) {
        madeBriefing = true;
        setBriefing();
    }

    const dbGuilds = [];

    await Promise.all(client.guilds.map(async (guild) => {
        const newGuild = await guild.fetchMembers();

        dbGuilds.push(newGuild);
    }));

    console.log('> Cached all guild members!\n');
    Data.connectInitial(dbGuilds)
    .catch(err => console.log(`[E_DataConnect] ${err}`));
});

client.on('disconnect', (closeEvent) => {
    console.log('DISCONNECTED');
    console.log(closeEvent);
    console.log(`Code: ${closeEvent.code}`);
    console.log(`Reason: ${closeEvent.reason}`);
    console.log(`Clean: ${closeEvent.wasClean}`);
});

client.on('guildMemberRemove', (member) => {
    const guild = member.guild;

    Events.emit(guild, 'UserLeave', member);

    const sendLogData = [
        'User Left',
        guild,
        member,
        { name: 'Username', value: member.toString() },
        { name: 'Highest Role', value: member.highestRole.name },
    ];

    Util.sendLog(sendLogData, colUser);
});

client.on('guildMemberAdd', (member) => {
    const guild = member.guild;

    const guildId = guild.id;
    const guildName = guild.name;
    const memberId = member.id;
    const memberName = Util.getFullName(member);

    console.log(`User joined: ${memberName} (${memberId}) @ ${guildName}`);

    // test

    if (guildId === '309785618932563968') {
        const veilGuild = client.guilds.get('284746138995785729');
        const veilBuyer = veilGuild.roles.find('name', 'Buyer');
        const newBuyer = guild.roles.find('name', 'Buyer');
        if (!veilGuild) {
            console.log('[ERROR_VP] Veil guild not found!');
        } else if (!veilBuyer) {
            console.log('[ERROR_VP] Veil Buyer role not found!');
        } else if (!newBuyer) {
            console.log('[ERROR_VP] New Buyer role not found!');
        } else {
            const veilMember = Util.getMemberById(memberId, veilGuild);
            if (!veilMember) {
                console.log(`[Auto-Kick 1] User not in Veil: ${memberName}`);
                member.kick()
                .catch(error => console.log(`\n[E_AutoKick1] ${error}`));
                return;
            }
            if (!veilMember.roles.has(veilBuyer.id)) {
                console.log(`[Auto-Kick 2] User does not have Buyer role: ${memberName}`);
                member.kick()
                .catch(error => console.log(`\n[E_AutoKick2] ${error}`));
                return;
            }
            member.addRole(newBuyer)
            .catch(error => console.log(`\n[E_AutoAddRole1] ${error}`));
            console.log('Awarded new member with Buyer role');
        }
    }

    if (has.call(exports.globalBan, memberId)) {
        member.kick()
        .catch(console.error);
        console.log(`Globally banned user ${memberName} joined ${guildName}`);
        return;
    }

    const isMuted = Mutes.checkMuted(guild, memberId);
    if (isMuted) {
        console.log(`Muted user ${memberName} joined ${guildName}`);
    } else {
        const sendRole = Util.getRole('SendMessages', guild);

        if (sendRole) {
            member.addRole(sendRole)
            .catch(console.error);
            console.log(`Assigned SendMessages to new member ${memberName}`);
        }
    }

    if (memberId === '280579952263430145') member.setNickname('<- mentally challenged');

    Events.emit(guild, 'UserJoin', member);

    const sendLogData = [
        'User Joined',
        guild,
        member,
        { name: 'Username', value: member.toString() },
    ];

    Util.sendLog(sendLogData, colUser);
});

client.on('guildMemberUpdate', (oldMember, member) => {
    const guild = member.guild;
    const previousNick = oldMember.nickname;
    const nowNick = member.nickname;
    const oldRoles = oldMember.roles;
    const nowRoles = member.roles;

    const rolesAdded = nowRoles.filter(role => (!oldRoles.has(role.id)));

    const rolesRemoved = oldRoles.filter(role => (!nowRoles.has(role.id)));

    if (rolesAdded.size > 0) {
        rolesAdded.forEach((nowRole) => {
            if ((member.id === '214047714059616257' || member.id === '148931616452902912') && (nowRole.id === '293458258042159104' || nowRole.id === '284761589155102720')) {
                member.removeRole(nowRole);
            }

            if (nowRole.name === 'Buyer' && guild.id === '284746138995785729') {
                const message = 'Please join the Veil Buyers Discord:\n\nhttps://discord.gg/PRq6fcg\n\nThis is very important, thank you.';
                const title = 'Congratulations on your purchase of Veil';
                const footer = Util.makeEmbedFooter('AutoMessage');

                Util.sendDescEmbed(member, title, message, footer, null, 0x00BCD4);
            }

            const isMuted = Mutes.checkMuted(guild, member.id);
            if (nowRole.name === 'SendMessages' && isMuted) {
                member.removeRole(nowRole);
                console.log(`Force re-muted ${Util.getName(member)} (${member.id})`);
            } else {
                const sendLogData = [
                    'Role Added',
                    guild,
                    member,
                    { name: 'Username', value: member.toString() },
                    { name: 'Role Name', value: nowRole.name },
                ];
                Util.sendLog(sendLogData, colUser);
            }

            Events.emit(guild, 'UserRoleAdd', member, nowRole);
        });
    }

    if (rolesRemoved.size > 0) {
        rolesRemoved.forEach((nowRole) => {
            const isMuted = Mutes.checkMuted(guild, member.id);
            if (nowRole.name === 'SendMessages' && !isMuted) {
                member.addRole(nowRole)
                .catch(console.error);
                console.log(`Force re-unmuted ${Util.getName(member)} (${member.id})`);
            } else {
                const sendLogData = [
                    'Role Removed',
                    guild,
                    member,
                    { name: 'Username', value: member.toString() },
                    { name: 'Role Name', value: nowRole.name },
                ];
                Util.sendLog(sendLogData, colUser);
            }

            Events.emit(guild, 'UserRoleRemove', member, nowRole);
        });
    }

    if (previousNick !== nowNick) {
        if (member.id === '280579952263430145' && nowNick !== '<- mentally challenged') member.setNickname('<- mentally challenged');
        Events.emit(guild, 'UserNicknameUpdate', member, previousNick, nowNick);

        const sendLogData = [
            'Nickname Updated',
            guild,
            member,
            { name: 'Username', value: member.toString() },
            { name: 'Old Nickname', value: previousNick },
            { name: 'New Nickname', value: nowNick },
        ];
        Util.sendLog(sendLogData, colUser);
    }
});

/*client.on('userUpdate', (oldUser, user) => {
    const oldUsername = oldUser.username;
    const newUsername = user.username;

    if (oldUsername !== newUsername) {
        Events.emit(guild, 'UserNicknameUpdate', member, previousNick, nowNick);

        const sendLogData = [
            'Username Updated',
            guild,
            member,
            { name: 'Username', value: member.toString() },
            { name: 'Old Nickname', value: previousNick },
            { name: 'New Nickname', value: nowNick },
        ];
        Util.sendLog(sendLogData, colUser);
    }
});*/

client.on('messageUpdate', (oldMsgObj, newMsgObj) => {
    if (newMsgObj == null) return;
    const channel = newMsgObj.channel;
    if (channel.name === 'vaebot-log') return;
    const guild = newMsgObj.guild;
    const member = newMsgObj.member;
    const author = newMsgObj.author;
    const content = newMsgObj.content;
    const contentLower = content.toLowerCase();
    // const isStaff = author.id == vaebId;
    // const msgId = newMsgObj.id;

    const oldContent = oldMsgObj.content;

    for (let i = 0; i < exports.blockedWords.length; i++) {
        if (contentLower.includes(exports.blockedWords[i].toLowerCase())) {
            newMsgObj.delete();
            return;
        }
    }

    if (exports.runFuncs.length > 0) {
        for (let i = 0; i < exports.runFuncs.length; i++) {
            exports.runFuncs[i](newMsgObj, member, channel, guild, true);
        }
    }

    Events.emit(guild, 'MessageUpdate', member, channel, oldContent, content);

    if (oldContent !== content) {
        const sendLogData = [
            'Message Updated',
            guild,
            author,
            { name: 'Username', value: author.toString() },
            { name: 'Channel Name', value: channel.toString() },
            { name: 'Old Message', value: oldContent },
            { name: 'New Message', value: content },
        ];
        Util.sendLog(sendLogData, colMessage);
    }
});

exports.lockChannel = null;

exports.calmSpeed = 7000;
exports.slowChat = {};
exports.slowInterval = {};
exports.chatQueue = {};
exports.chatNext = {};

client.on('voiceStateUpdate', (oldMember, member) => {
    const oldChannel = oldMember.voiceChannel; // May be null
    const newChannel = member.voiceChannel; // May be null

    const oldChannelId = oldChannel ? oldChannel.id : null;
    const newChannelId = newChannel ? newChannel.id : null;

    // const guild = member.guild;

    if (member.id === selfId) {
        if (member.serverMute) {
            member.setMute(false);
            console.log('Force removed server-mute from bot');
        }

        if (exports.lockChannel != null && oldChannelId === exports.lockChannel && newChannelId !== exports.lockChannel) {
            console.log('Force re-joined locked channel');
            oldChannel.join();
        }
    }
});

/*

Audit log types

const Actions = {
  GUILD_UPDATE: 1,
  CHANNEL_CREATE: 10,
  CHANNEL_UPDATE: 11,
  CHANNEL_DELETE: 12,
  CHANNEL_OVERWRITE_CREATE: 13,
  CHANNEL_OVERWRITE_UPDATE: 14,
  CHANNEL_OVERWRITE_DELETE: 15,
  MEMBER_KICK: 20,
  MEMBER_PRUNE: 21,
  MEMBER_BAN_ADD: 22,
  MEMBER_BAN_REMOVE: 23,
  MEMBER_UPDATE: 24,
  MEMBER_ROLE_UPDATE: 25,
  ROLE_CREATE: 30,
  ROLE_UPDATE: 31,
  ROLE_DELETE: 32,
  INVITE_CREATE: 40,
  INVITE_UPDATE: 41,
  INVITE_DELETE: 42,
  WEBHOOK_CREATE: 50,
  WEBHOOK_UPDATE: 51,
  WEBHOOK_DELETE: 52,
  EMOJI_CREATE: 60,
  EMOJI_UPDATE: 61,
  EMOJI_DELETE: 62,
  MESSAGE_DELETE: 72,
};

*/

/* function chooseRelevantEntry(entries, options) {
    if (options.action == null || options.time == null) {
        console.log(options);
        console.log('Options did not contain necessary properties');
        return undefined;
    }

    const strongest = [null, null];

    entries.forEach((entry) => {
        if (entry.action !== options.action || (options.target != null && entry.target.id !== options.target.id)) return;

        const timeScore = -Math.abs(options.time - entry.createdTimestamp);

        if (strongest[0] == null || timeScore > strongest[0]) {
            strongest[0] = timeScore;
            strongest[1] = entry;
        }
    });

    return strongest[1];
} */

client.on('messageDelete', (msgObj) => {
    if (msgObj == null) return;
    const channel = msgObj.channel;
    const guild = msgObj.guild;
    const member = msgObj.member;
    const author = msgObj.author;
    const content = msgObj.content;

    // const evTime = +new Date();

    // const contentLower = content.toLowerCase();
    // const isStaff = author.id == vaebId;
    // const msgId = msgObj.id;

    // if (author.id === vaebId) return;

    Events.emit(guild, 'MessageDelete', member, channel, content);

    if (guild != null) {
        const attachmentLinks = [];
        msgObj.attachments.forEach(obj => attachmentLinks.push(obj.url));

        const sendLogData = [
            'Message Deleted',
            guild,
            author,
            { name: 'Username', value: author.toString() },
            // { name: 'Moderator', value: entry.executor.toString() },
            { name: 'Channel Name', value: channel.toString() },
            { name: 'Message', value: content },
            { name: 'Attachments', value: attachmentLinks.join('\n') },
        ];
        Util.sendLog(sendLogData, colMessage);

        /* setTimeout(() => {
            guild.fetchAuditLogs({
                // user: member,
                type: 72,
            })
            .then((logs) => {
                console.log('[MD] Got audit log data');
                const entries = logs.entries;

                const entry = chooseRelevantEntry(entries, {
                    time: evTime,
                    target: author,
                    action: 'MESSAGE_DELETE',
                });

                console.log(entry);

                console.log(entry.executor.toString());
                console.log(entry.target.toString());

                const sendLogData = [
                    'Message Deleted',
                    guild,
                    author,
                    { name: 'Username', value: author.toString() },
                    { name: 'Moderator', value: entry.executor.toString() },
                    { name: 'Channel Name', value: channel.toString() },
                    { name: 'Message', value: content },
                ];
                Util.sendLog(sendLogData, colMessage);
            })
            .catch((error) => {
                console.log(error);
                console.log('[MD] Failed to get audit log data');
            });
        }, 5000); */
    }
});

const messageStamps = {};
const userStatus = {};
const lastWarn = {};
const checkMessages = 5; // (n)
const warnGrad = 13.5; // Higher = More Spam (Messages per Second) | 10 = 1 message per second
const sameGrad = 4;
const muteGrad = 9;
const waitTime = 5.5;
const endAlert = 40;

/* const replaceAll = function (str, search, replacement) {
    return str.split(search).join(replacement);
};
let contentLower = 'lol <qe23> tege <> <e321z> dz';
contentLower = contentLower.replace(/<[^ ]*?[:#@][^ ]*?>/gm, '');
// contentLower = replaceAll(contentLower, ' ', '');
console.log(contentLower); */

/* exports.runFuncs.push((msgObj, speaker, channel, guild) => { // More sensitive
    if (guild == null || msgObj == null || speaker == null || speaker.user.bot === true || speaker.id === vaebId) return;

    let contentLower = msgObj.content.toLowerCase();
    contentLower = contentLower.replace(/<[^ ]*?[:#@][^ ]*?>/gm, '');
    contentLower = Util.replaceAll(contentLower, ' ', '');
    contentLower = Util.replaceAll(contentLower, 'one', '1');
    contentLower = Util.replaceAll(contentLower, 'won', '1');
    contentLower = Util.replaceAll(contentLower, 'uno', '1');
    contentLower = Util.replaceAll(contentLower, 'una', '1');
    contentLower = Util.replaceAll(contentLower, 'two', '2');
    contentLower = Util.replaceAll(contentLower, 'dose', '2');
    contentLower = Util.replaceAll(contentLower, 'dos', '2');
    contentLower = Util.replaceAll(contentLower, 'too', '2');
    contentLower = Util.replaceAll(contentLower, 'to', '2');
    contentLower = Util.replaceAll(contentLower, 'three', '3');
    contentLower = Util.replaceAll(contentLower, 'tres', '3');
    contentLower = Util.replaceAll(contentLower, 'free', '3');

    let triggered = false;

    if (contentLower === '3') {
        triggered = true;
    } else {
        // const trigger = [/11./g, /12[^8]/g, /13./g, /21./g, /22./g, /23./g, /31./g, /32[^h]/g, /33./g, /muteme/g, /onet.?o/g, /threet.?o/g];
        // const trigger = [/[123][123][123]/g, /muteme/g];
        const trigger = [/[123][^\d]?[^\d]?[123][^\d]?[^\d]?[123]/g, /[123][123]\d/g, /muteme/g];
        for (let i = 0; i < trigger.length; i++) {
            if (trigger[i].test(contentLower)) {
                triggered = true;
                break;
            }
        }
    }

    if (triggered) {
        Mutes.addMute(guild, channel, speaker, 'System', { 'reason': 'Muted Themself' });
    }
}); */

exports.runFuncs.push((msgObj, speaker, channel, guild) => {
    if (guild == null || msgObj == null || speaker == null || speaker.user.bot === true) return;

    let contentLower = msgObj.content.toLowerCase();
    contentLower = contentLower.replace(/\s/g, '');
    contentLower = contentLower.replace(/which/g, 'what');
    contentLower = contentLower.replace(/great/g, 'best');
    contentLower = contentLower.replace(/finest/g, 'best');
    contentLower = contentLower.replace(/perfect/g, 'best');
    contentLower = contentLower.replace(/top/g, 'best');
    contentLower = contentLower.replace(/hack/g, 'exploit');
    contentLower = contentLower.replace(/h\Sx/g, 'exploit');
    contentLower = contentLower.replace(/le?v\S?l(?:\d|s|f)/g, 'exploit');

    let triggered = 0;

    const trigger = [/wh?[au]t/g, /b\S?st/g, /explo\S?t/g];
    for (let i = 0; i < trigger.length; i++) {
        if (trigger[i].test(contentLower)) triggered++;
    }

    if (triggered == trigger.length) {
        Mutes.addMute(guild, channel, speaker, 'System', { 'time': 1800000, 'reason': '[Auto-Mute] Asking stupid questions' });
    }
});

exports.runFuncs.push((msgObj, speaker, channel, guild, isEdit) => {
    if (isEdit || guild == null || guild.id != '284746138995785729' || msgObj == null || speaker == null || speaker.user.bot === true) return;

    let contentLower = msgObj.content.toLowerCase().trim();

    if (contentLower == '!buy') return;

    // contentLower = contentLower.replace(/\s/g, '');
    contentLower = contentLower.replace(/\bthe /g, '');
    contentLower = contentLower.replace(/\bit\b/g, 'veil');
    contentLower = contentLower.replace(/\bthis\b/g, 'veil');
    contentLower = contentLower.replace(/\bvel\b/g, 'veil');
    contentLower = contentLower.replace(/\bveli/g, 'veil');
    contentLower = contentLower.replace(/\bv[ie][ie]l/g, 'veil');
    contentLower = contentLower.replace(/hack\b/g, 'veil');
    contentLower = contentLower.replace(/\bh\Sx\b/g, 'veil');
    contentLower = contentLower.replace(/le?v\S?l.?(?:\d|s|f)/g, 'veil');
    contentLower = contentLower.replace(/explo\S?t\b/g, 'veil');
    contentLower = contentLower.replace(/\bpay\b/g, 'buy');
    // contentLower = contentLower.replace(/get/g, 'buy');
    contentLower = contentLower.replace(/get veil/g, 'buy');
    contentLower = contentLower.replace(/purchas.?/g, 'buy');

    let triggered = false;

    if (contentLower.substr(contentLower.length - 3, 3) == 'buy') {
        triggered = true;
    }

    if (!triggered) {
        let triggeredNum = 0;

        const trigger = [/buy\b/g, /veil/g];
        for (let i = 0; i < trigger.length; i++) {
            if (trigger[i].test(contentLower)) triggeredNum++;
        }

        if (triggeredNum == trigger.length) {
            triggered = true;
        }
    }

    if (triggered) {
        Util.sendDescEmbed(channel, 'How To Buy', 'To buy veil send a message saying !buy', null, null, 0x00E676);
    }
});

client.on('message', (msgObj) => {
    const channel = msgObj.channel;
    if (channel.name === 'vaebot-log') return;
    const guild = msgObj.guild;
    let speaker = msgObj.member;
    let author = msgObj.author;
    let content = msgObj.content;
    const authorId = author.id;

    // if (guild.id !== '166601083584643072') return;

    if (content.substring(content.length - 5) === ' -del' && authorId === vaebId) {
        msgObj.delete();
        content = content.substring(0, content.length - 5);
    }

    let contentLower = content.toLowerCase();

    const isStaff = (guild && speaker) ? Util.checkStaff(guild, speaker) : authorId === vaebId;

    if (exports.blockedUsers[authorId]) {
        msgObj.delete();
        return;
    }

    if (!isStaff) {
        for (let i = 0; i < exports.blockedWords.length; i++) {
            if (contentLower.includes(exports.blockedWords[i].toLowerCase())) {
                msgObj.delete();
                return;
            }
        }
    }

    if (guild != null && contentLower.substr(0, 5) === 'sudo ' && authorId === vaebId) {
        author = Util.getUserById(selfId);
        speaker = Util.getMemberById(selfId, guild);
        content = content.substring(5);
        contentLower = content.toLowerCase();
    }

    if (exports.runFuncs.length > 0) {
        for (let i = 0; i < exports.runFuncs.length; i++) {
            exports.runFuncs[i](msgObj, speaker, channel, guild, false);
        }
    }

    if (guild != null && author.bot === false && content.length > 0 && author.id !== guild.owner.id && !Mutes.checkMuted(guild, author.id)) {
        if (!has.call(userStatus, authorId)) userStatus[authorId] = 0;
        if (!has.call(messageStamps, authorId)) messageStamps[authorId] = [];
        const nowStamps = messageStamps[authorId];
        const stamp = (+new Date());
        nowStamps.unshift({ stamp, message: contentLower });
        if (Util.isSpam(content)) {
            if (userStatus[authorId] == 0) {
                console.log(`[4] ${Util.getName(speaker)} warned`);
                Util.print(channel, speaker.toString(), 'Warning: If you continue to spam you will be auto-muted');
                lastWarn[authorId] = stamp;
                userStatus[authorId] = 2;
            } else {
                console.log(`[4] ${Util.getName(speaker)} muted`);
                Mutes.addMute(guild, channel, speaker, 'System', { 'reason': '[Auto-Mute] Spamming' });
                userStatus[authorId] = 0;
            }
        }
        if (!Mutes.checkMuted(guild, author.id) && userStatus[authorId] !== 1) {
            if (nowStamps.length > checkMessages) {
                nowStamps.splice(checkMessages, nowStamps.length - checkMessages);
            }
            if (nowStamps.length >= checkMessages) {
                const oldStamp = nowStamps[checkMessages - 1].stamp;
                const elapsed = (stamp - oldStamp) / 1000;
                const grad1 = (checkMessages / elapsed) * 10;
                let checkGrad1 = sameGrad;
                const latestMsg = nowStamps[0].message;
                for (let i = 0; i < checkMessages; i++) {
                    if (nowStamps[i].message !== latestMsg) {
                        checkGrad1 = warnGrad;
                        break;
                    }
                }
                // console.log("User: " + Util.getName(speaker) + " | Elapsed Since " + checkMessages + " Messages: " + elapsed + " | Gradient1: " + grad1);
                if (grad1 >= checkGrad1) {
                    if (userStatus[authorId] === 0) {
                        console.log(`${Util.getName(speaker)} warned, gradient ${grad1} larger than ${checkGrad1}`);
                        userStatus[authorId] = 1;
                        Util.print(channel, speaker.toString(), 'Warning: If you continue to spam you will be auto-muted');
                        setTimeout(() => {
                            const lastStamp = nowStamps[0].stamp;
                            setTimeout(() => {
                                if (Mutes.checkMuted(guild, author.id)) {
                                    console.log(`[2] ${Util.getName(speaker)} is already muted`);
                                    userStatus[authorId] = 0;
                                    return;
                                }
                                let numNew = 0;
                                let checkGrad2 = sameGrad;
                                const newStamp = (+new Date());
                                const latestMsg2 = nowStamps[0].message;
                                // var origStamp2;
                                for (let i = 0; i < nowStamps.length; i++) {
                                    const curStamp = nowStamps[i];
                                    const isFinal = curStamp.stamp === lastStamp;
                                    if (isFinal && stamp === lastStamp) break;
                                    numNew++;
                                    // origStamp2 = curStamp.stamp;
                                    if (curStamp.message !== latestMsg2) checkGrad2 = muteGrad;
                                    if (isFinal) break;
                                }
                                if (numNew <= 1) {
                                    console.log(`[2_] ${Util.getName(speaker)} was put on alert`);
                                    lastWarn[authorId] = newStamp;
                                    userStatus[authorId] = 2;
                                    return;
                                }
                                let numNew2 = 0;
                                let elapsed2 = 0;
                                let grad2 = 0;
                                // var elapsed2 = (newStamp-origStamp2)/1000;
                                // var grad2 = (numNew/elapsed2)*10;
                                for (let i = 2; i < numNew; i++) {
                                    const curStamp = nowStamps[i].stamp;
                                    const nowElapsed = (newStamp - curStamp) / 1000;
                                    const nowGradient = ((i + 1) / nowElapsed) * 10;
                                    if (nowGradient > grad2) {
                                        grad2 = nowGradient;
                                        elapsed2 = nowElapsed;
                                        numNew2 = i + 1;
                                    }
                                }
                                console.log(`[2] User: ${Util.getName(speaker)} | Messages Since ${elapsed2} Seconds: ${numNew2} | Gradient2: ${grad2}`);
                                if (grad2 >= checkGrad2) {
                                    console.log(`[2] ${Util.getName(speaker)} muted, gradient ${grad2} larger than ${checkGrad2}`);
                                    Mutes.addMute(guild, channel, speaker, 'System', { 'reason': '[Auto-Mute] Spamming' });
                                    userStatus[authorId] = 0;
                                } else {
                                    console.log(`[2] ${Util.getName(speaker)} was put on alert`);
                                    lastWarn[authorId] = newStamp;
                                    userStatus[authorId] = 2;
                                }
                            }, waitTime * 1000);
                        }, 350);
                    } else if (userStatus[authorId] === 2) {
                        console.log(`[3] ${Util.getName(speaker)} muted, repeated warns`);
                        Mutes.addMute(guild, channel, speaker, 'System', { 'reason': '[Auto-Mute] Spamming' });
                        userStatus[authorId] = 0;
                    }
                } else if (userStatus[authorId] === 2 && (stamp - lastWarn[authorId]) > (endAlert * 1000)) {
                    console.log(`${Util.getName(speaker)} ended their alert`);
                    userStatus[authorId] = 0;
                }
            }
        }
    }

    if (guild != null) {
        if (Music.guildQueue[guild.id] == null) Music.guildQueue[guild.id] = [];

        if (Music.guildMusicInfo[guild.id] == null) {
            Music.guildMusicInfo[guild.id] = {
                activeSong: null,
                activeAuthor: null,
                voteSkips: [],
                isAuto: false,
            };
        }
    }

    if (guild && exports.slowChat[guild.id] && author.bot === false && !isStaff) {
        const nowTime = +new Date();
        if (nowTime > exports.chatNext[guild.id]) {
            exports.chatNext[guild.id] = nowTime + exports.calmSpeed;
        } else {
            msgObj.delete()
            .catch(console.error);
            const intervalNum = exports.calmSpeed / 1000;
            // var timeUntilSend = (exports.chatNext[guild.id] - nowTime) / 1000;
            author.send(`Your message has been deleted. ${guild.name} is temporarily in slow mode, meaning everyone must wait ${intervalNum} seconds 
            after the previous message before they can send one.`)
            .catch(console.error);
        }
        // exports.chatQueue[guild.id].push(msgObj);
    }

    Cmds.checkMessage(msgObj, speaker || author, channel, guild, content, contentLower, authorId, isStaff);

    if (author.bot === true) { // RETURN IF BOT
        return;
    }

    Events.emit(guild, 'MessageCreate', speaker, channel, msgObj, content);

    if (contentLower.includes(('👀').toLowerCase())) Util.print(channel, '👀');
});

// //////////////////////////////////////////////////////////////////////////////////////////////

console.log('-CONNECTING-\n');

client.login(Auth.discordToken);

process.on('unhandledRejection', (err) => {
    console.error(`Uncaught Promise Error: \n${err.stack}`);
});
