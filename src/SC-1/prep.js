/** @param {NS} ns */

export async function main(ns) {
	// TODO: Future, dynamically figure out the current hacked server with best ROI, and use that as our target.
	//	   - Will likely need to ensure we weakenToMinimum in our bootstrapping script
	//	   - If this server is checked every loop, we should be fine to just let it roll over to
	//		 new servers as they come online (threads permitting)?
	//	   - Perhaps monitor available RAM/thread capacity from home + private servers, and fan out to the
	//		 top N servers we can support with available RAM (keeping in mind that we're going to multiplex, so
	//		 need to reserve RAM * DurationMinutes * 4 per server)
	let target = ns.args[0]

	// Guard, only attack targets with money
	if (ns.getServerMaxMoney(target) == 0) { return }

	// Initial setup: staged runs of Grow + Weaken,
	// where weaken takes into account the security penalty for growth.
	// Both scripts are staggered to finish grow before weaken.
	let t = calculateBootstrap(ns, target)
	// ns.tprint(t)
	let scale = 1.0
	while (!checkRam(ns, t, "ramToGrowAndWeaken", scale)) {
		scale *= 0.9
	}

	let totalTime = Math.max(t.timeToWeaken, t.timeToGrow)
	let growDelay = totalTime - t.timeToGrow
	let weakenDelay = totalTime - t.timeToWeaken

	if (scale < 1) { ns.tprint(`Not enough RAM, scaling back operations to ${ns.nFormat(scale, "0.00")} to fit on server`)}

	// ns.tprint(`Using ${t.host} to grow ${target} with ${t.threadsToGrow * scale} threads, ${t.ramToGrow * scale} RAM, est. ${t.minToGrow}m${String(t.secToGrow).padStart(2, "0")}s.`)
	exec(ns, t.growScript, t.host, Math.floor(t.threadsToGrow * scale), target, growDelay)

	await ns.sleep(2000)
	// ns.tprint(`Using ${t.host} to weaken ${target} with ${t.threadsToWeaken * scale} threads, ${t.ramToWeaken * scale} RAM, est. ${t.minToWeaken}m${String(t.secToWeaken).padStart(2, "0")}s.`)
	exec(ns, t.weakenScript, t.host, Math.floor(t.threadsToWeaken * scale), target, weakenDelay)

	ns.tprint(`Preparing ${target}`)
	await ns.sleep(totalTime * 1000)
	ns.tprint(`${target} prepared`)
}

function exec(ns, script, host, threads, target, delay) {
	if (threads == 0) { return 0 }
	if (host != "home") { ns.scp(script, host) }

	ns.exec(script, host, threads, target, delay)
	// ns.tprint([[script, host, threads, target, delay]])
}

function calculateBootstrap(ns, target) {
	let result = {
		// Constants
		"host": (ns.args[1] || "home"), // TODO: Dynamically find a private host with sufficient RAM, with a fallback to home?
		"growScript": "prepGrow.js",
		"weakenScript": "prepWeaken.js",
	}

	// General Analysis
	result.ramAvailable = ns.getServerMaxRam(result.host) - ns.getServerUsedRam(result.host)
	result.cpuCores = ns.getServer(result.host).cpuCores // TODO: can replace a bunch of more specific calls below

	// Growth Analysis
	result.money = ns.getServerMoneyAvailable(target)
	result.moneyMax = ns.getServerMaxMoney(target)
	result.growRatio = result.moneyMax / result.money

	result.threadsToGrow = Math.ceil(ns.growthAnalyze(target, result.growRatio))
	result.ramToGrow = ns.getScriptRam(result.growScript) * result.threadsToGrow
	result.timeToGrow = Math.ceil(ns.getGrowTime(target) / 1000)
	result.minToGrow = Math.floor(result.timeToGrow / 60)
	result.secToGrow = result.timeToGrow - result.minToGrow * 60

	// Weaken Analysis
	result.security = ns.getServerSecurityLevel(target)
	result.securityMin = ns.getServerMinSecurityLevel(target)
	result.securityPerThread = ns.weakenAnalyze(1)

	result.excessSecurity = result.security - result.securityMin
	result.growSecurity = ns.growthAnalyzeSecurity(result.threadsToGrow, target, result.cpuCores)
	result.totalSecurity = result.excessSecurity + result.growSecurity

	result.threadsToWeaken = Math.ceil(result.totalSecurity / result.securityPerThread)

	result.ramToWeaken = ns.getScriptRam(result.weakenScript) * result.threadsToWeaken
	result.timeToWeaken = Math.ceil(ns.getWeakenTime(target) / 1000)
	result.minToWeaken = Math.floor(result.timeToWeaken / 60)
	result.secToWeaken = result.timeToWeaken - result.minToWeaken * 60

	return result
}

function checkRam(ns, t, ramField, scale) {
	if (t[ramField] * scale > t.ramAvailable) {
		// ns.tprint(`Insufficient RAM! Need ${t[ramField] * scale} (${ramField}, scale ${scale}) on ${t.host}, have ${t.ramAvailable} available.`)
		return false
	} else {
		return true
	}
}