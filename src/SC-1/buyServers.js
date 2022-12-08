/** @param {NS} ns */

// Server price @ 64gb: $3.5m
// Server price @ 256gb: $14.1m
// Server price @ 1tb: $56.3m
// Server price @ 4tb: $225.3m
// Server price @ 16tb: $901.1m
// Server price @ 64tb: $3.6b
// Server price @ 256tb: $14.4b
// Server price @ 1024tb: $57.7b

// purchaseServer()
// getPurchasedServerCost()
// getPurchasedServerLimit()
// getServerMoneyAvailable()


export async function main(ns) {
	const maxServers = 22
	let funds = ns.getServerMoneyAvailable("home")
	let prices = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(n => {
		let power = n
		let size = 2**n
		let cost = ns.getPurchasedServerCost(size)
		let multiple = Math.min(Math.floor(funds/cost), maxServers)
		let total = cost * multiple
		return [power, size, cost, multiple, total]
	}).filter(([p,s,c,n,t]) => c < funds*2).slice(-5)

	let prompt = prices.map(([power, size, cost, n, total]) => {
		return `   [${power}] ${size}gb at ${ns.nFormat(cost, "$0.0a")} - ${n} for ${ns.nFormat(total, "$0.0a")}`
	}).join("\n")

	let choice = await ns.prompt(`Buy Servers!\n${prompt}`, {"type": "select", "choices": prices.map(([power, size, cost, n, total]) => power)})

	prices.forEach(([power, size, cost, n, total]) => {
		if (power == choice) {
			for(let i=0; i<n; i++) {
				ns.tprint(`Buying private-${power}`)
				ns.purchaseServer(`private-${power}-0`, size)
			}
		}
	})
}