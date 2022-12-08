import * as network from "_network.js"
import * as terminal from "_terminal.js"

/** @param {NS} ns */
export async function main(ns) {
	terminal.runCommand(`home`)

	network.routeTo(ns, ns.args[0]).forEach(host => {
		terminal.runCommand(`connect ${host}`)
	})

	terminal.runCommand(`backdoor`)
}