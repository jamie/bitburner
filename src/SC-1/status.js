/** @param {NS} ns */

import * as network from "_network.js"

export async function main(ns) {
	tprintTable(ns, ["", "hack", "root", "RAM", "Money", "Security", "Goal", "PS"])
	let maxHackableCash = 1000000
	let servers = network
		.getServers(ns)
		.sort((a, b) => a.purchasedByPlayer == b.purchasedByPlayer ? 0 : a.purchasedByPlayer ? -1 : 1)
		.sort((a, b) => a.requiredHackingSkill - b.requiredHackingSkill)
		.sort((a, b) => a.moneyMax - b.moneyMax)
	servers
		.filter(a => a.requiredHackingSkill < ns.getHackingLevel() + 100)
		.map(server => {
			// JS Interpreter has problems with chained forEach, so using map + return args in the middle here.
			if (server.hasAdminRights) { maxHackableCash = Math.max(maxHackableCash, server.moneyMax) }
			return server
		})
		.filter(server => (
			server.purchasedByPlayer ||
			server.moneyMax == 0 ||
			server.moneyMax > server.moneyAvailable ||
			server.moneyMax > maxHackableCash / 20 ||
			server.hackDifficulty > server.minDifficulty ||
			ns.args[0] == "all"
		))
		.forEach(server => {
			tprintTable(ns, [
				server["hostname"],
				String(server["requiredHackingSkill"]).padStart(4),
				String(server["backdoorInstalled"] ? '💀' : server["hasAdminRights"] ? '✔️' : server["numOpenPortsRequired"]),
				String(server["maxRam"]).padStart(7),
				(server["moneyMax"] > 0) ? `${ns.nFormat(server["moneyAvailable"] / (server["moneyMax"] + 1), "0%").padStart(4)} / ${ns.nFormat(server["moneyMax"], "0.0a").padStart(6)}` : "",
				(server["moneyMax"] > 0) ? `${String(server["minDifficulty"]).padStart(2)} + ${String((server["hackDifficulty"] - server["minDifficulty"]).toFixed(2)).padStart(5)}` : "",
				goal(server),
				running(ns.ps(server.hostname)),
			])
		})
	tprintTable(ns, ["", "hack", "root", "RAM", "Money", "Security", "Goal", "PS"])
}

function tprintTable(ns, data) {
	let sep = " : "
	ns.tprint(
		data[0].padEnd(18) + sep +
		data[1].padEnd(4) + sep +
		data[2].padStart(3).padEnd(4) + sep +
		data[3].padEnd(7) + sep +
		data[4].padEnd(13) + sep +
		data[5].padEnd(10) + sep +
		// data[6].padEnd(10) + sep +
		data[7] +
		""
	)
}

function goal(server) {
	if (!server["hasAdminRights"]) { return "" }
	if (server["moneyMax"] == 0) { return "" }
	if (server["hackDifficulty"] > server["minDifficulty"] + 0.2) { return "weaken" }
	if (server["moneyAvailable"] < server["moneyMax"] * 0.9) { return "grow" }
	return "hack"
}

function running(tasks) {
	// [{"filename":"growHack.js","threads":124,"args":["silver-helix"],"pid":31}]
	return tasks
		.map(task => `[${task.pid}] ${task.filename} (${task.args.join(", ")}) x${String(task.threads).padStart(3)}`)
		.join("\n".padEnd(86))
}

// Full getServer struct

// let serverResults = {
// 	"contracts": [],
// 	"cpuCores": 1,
// 	"ftpPortOpen": false,
// 	"hasAdminRights": true,
// 	"hostname": "foodnstuff",
// 	"httpPortOpen": false,
// 	"ip": "0.5.7.7",
// 	"isConnectedTo": false,
// 	"maxRam": 16,
// 	"messages": [],
// 	"organizationName": "FoodNStuff",
// 	"programs": [],
// 	"ramUsed": 14.4,
// 	"runningScripts": [],
// 	"scripts": [],
// 	"serversOnNetwork": [],
// 	"smtpPortOpen": false,
// 	"sqlPortOpen": false,
// 	"sshPortOpen": false,
// 	"textFiles": [],
// 	"purchasedByPlayer": false,
// 	"backdoorInstalled": true,
// 	"baseDifficulty": 10,
// 	"hackDifficulty": 3.7200000000000006,
// 	"minDifficulty": 3,
// 	"moneyAvailable": 55065.76232315645,
// 	"moneyMax": 50000000,
// 	"numOpenPortsRequired": 0,
// 	"openPortCount": 0,
// 	"requiredHackingSkill": 1,
// 	"serverGrowth": 5
// }