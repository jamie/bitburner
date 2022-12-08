import * as network from "_network.js"
import * as contracts from "contracts.js"

const hackTools = [
	["BruteSSH.exe", "brutessh"],
	["FtpCrack.exe", "ftpcrack"],
	["relaySMTP.exe", "relaysmtp"],
	["HTTPWorm.exe", "httpworm"],
	["SQLInject.exe", "sqlinject"],
]

/** @param {NS} ns */
export async function main(ns) {
	while (true) {
		nukeAndPrepServers(ns)
		// selfHackIdle(ns)
		downloadUnknownFiles(ns)
		completeContracts(ns)

		await ns.sleep(5000)
	}
}

function nukeAndPrepServers(ns) {
	let hacking = ns.getHackingLevel()
	let ports = hackTools.filter(tool => ns.fileExists(tool[0])).length
	network.getServers(ns)
		.filter(server => !server.hasAdminRights)
		.filter(server => !server.purchasedByPlayer)
		.filter(server => server.requiredHackingSkill <= hacking)
		.filter(server => server.numOpenPortsRequired <= ports)
		.forEach(server => {
			let host = server.hostname
			for (let tool of hackTools) {
				if (ns.fileExists(tool[0])) { ns[tool[1]](host) }
			}
			ns.tprint(`Nuking ${host}`)
			ns.nuke(host)
			ns.run("prep.js", 1, host)
		})
}

function downloadUnknownFiles(ns) {
	let localFiles = ns.ls("home")
	network.getServers(ns)
		.forEach(server => {
			let host = server.hostname
			let files = ns.ls(host)
				.filter(file => file.endsWith(".lit") || file.endsWith(".txt"))
				.filter(file => !localFiles.includes(file))
			for (let file of files) {
				ns.tprint(`Downloading ${file} from ${host}`)
				ns.scp(file, "home", host)
				localFiles.push(file)
			}
		})
}

function selfHackIdle(ns) {
	network.getServers(ns)
		.filter(server => server.hasAdminRights)
		.filter(server => server.moneyMax > 0)
		.filter(server => server.ramUsed == 0 && server.maxRam > 0)
		.forEach(server => ns.run("autoHack.js", 1, server.hostname))
}

function completeContracts(ns) {
	network.getServers(ns)
		.forEach(server => {
			let host = server.hostname
			ns.ls(host)
				.filter(file => file.endsWith(".cct"))
				.forEach(file => contracts.solve(ns, file, host))
		})
}