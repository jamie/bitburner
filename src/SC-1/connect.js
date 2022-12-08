/** @param {NS} ns */

import * as network from "_network.js"
import * as terminal from "_terminal.js"

export async function main(ns) {
	for (let hop of network.routeTo(ns, ns.args[0])) {
		terminal.runCommand(`connect ${hop}`)
	}
}