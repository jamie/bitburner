# Current

## Shared Libraries
_network.js -- shared library to scan servers
_terminal.js -- shared library to execute raw terminal commands (connect, backdoor, etc)

## Game Bootstrap
autoexec.js -- Initial setup script - auto-nukes servers, kicks off autoPrepare
prep.js -- runs an initial grow+weaken run to set server to baseline
combo.js -- runs a series of hack+grow+weaken scripts targeting one server, with many instances to fill RAM. Stays running and kills children on quit.

## Core parallel scripts
prepGrow.js -- optional delay + grow
prepWeaken.js -- optional delay + weaken
comboHack.js -- delay + hack, on repeat
comboGrow.js -- delay + grow, on repeat
comboWeaken.js -- delay + weaken, on repeat

## Tooling
status.js -- prints a table of known & relevant servers with hardware, money, and ps stats

connect.js -- uses raw terminal to deep connect from home
backdoor.js -- uses raw terminal to deep connects to a server, and backdoors it

contracts.js -- crawls servers and solves open coding contracts

buyServers.js -- dialog box to purchase private servers
sellServers.js -- sells servers from a given memory tier

launch.js -- Uploads and executes a script on target server with max threading

inf.js -- Difficulty analysis for infiltrations, optimizing for faction rep per challenge.
