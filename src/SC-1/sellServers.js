/** @param {NS} ns */
export async function main(ns) {
	ns.getPurchasedServers()
		.filter(server => server.includes(`-${ns.args[0]}-`))
		.forEach(server => ns.deleteServer(server))
}