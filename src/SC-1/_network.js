/** @param {NS} ns */
export function getServers(ns, host, servers) {
	if (host) {
		ns.scan(host).forEach(nextHost => {
			if (!servers.map(s => s.hostname).includes(nextHost)) {
				let server = ns.getServer(nextHost)
				server.parent = host
				servers.push(server)
				servers = getServers(ns, nextHost, servers)
			}
		})
		return servers
	} else {
		return getServers(ns, "home", [ns.getServer("home")])
	}
}

export function routeTo(ns, host) {
	let route = []
	let servers = getServers(ns)
	let current = host
	while (current != "home") {
		route.unshift(current)
		current = servers.find(s => s.hostname == current).parent
	}
	return route
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