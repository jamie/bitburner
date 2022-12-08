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

	let innerSleep = 5
	let betweenSleep = 10

	let t = calculateCombo(ns, target)
	let totalTime = Math.max(t.timeToHack, t.timeToGrow, t.timeToWeaken)
	let hackDelay = totalTime - t.timeToHack
	let growDelay = totalTime - t.timeToGrow
	let weakenDelay = totalTime - t.timeToWeaken
	let concurrency = Math.min(
		Math.ceil(totalTime / (innerSleep+innerSleep+betweenSleep)), // avoid overlapping runs
		Math.floor(t.ramAvailable / t.totalRam) // scripts fitting in ram
	)

	if (t.threadsToHack < 1 || t.threadsToGrow < 1 || t.threadsToWeaken < 1 || concurrency < 1) { return }

	for (let sequence = 1; sequence <= concurrency; sequence++) {
		ns.tprint([
			`Comboing ${target} from ${t.host} [${sequence}/${concurrency}]`,
			`Hack x${t.threadsToHack} (${hackDelay.toFixed(1)}+${t.timeToHack.toFixed(1)})`,
			`Grow x${t.threadsToGrow} (${growDelay.toFixed(1)}+${t.timeToGrow.toFixed(1)})`,
			`Weaken x${t.threadsToWeaken} (${weakenDelay.toFixed(1)}+${t.timeToWeaken.toFixed(1)})`,
		].join(" - "))
		// ns.tprint(`  Using ${t.host} to hack ${target} with ${t.threadsToHack} threads, ${t.ramToHack} RAM, est. ${t.minToHack}m${String(t.secToHack).padStart(2, "0")}s.`)
		exec(ns, t.hackScript, t.host, Math.floor(t.threadsToHack), target, hackDelay, sequence)
		await ns.sleep(innerSleep * 1000)

		// ns.tprint(`  Using ${t.host} to grow ${target} with ${t.threadsToGrow} threads, ${t.ramToGrow} RAM, est. ${t.minToGrow}m${String(t.secToGrow).padStart(2, "0")}s.`)
		exec(ns, t.growScript, t.host, Math.floor(t.threadsToGrow), target, growDelay, sequence)
		await ns.sleep(innerSleep * 1000)

		// ns.tprint(`  Using ${t.host} to weaken ${target} with ${t.threadsToWeaken} threads, ${t.ramToWeaken} RAM, est. ${t.minToWeaken}m${String(t.secToWeaken).padStart(2, "0")}s.`)
		exec(ns, t.weakenScript, t.host, Math.floor(t.threadsToWeaken), target, weakenDelay, sequence)

		// sleep some seconds, then launch another cycle.
		await ns.sleep(betweenSleep * 1000)
		// return
	}
}

function exec(ns, script, host, threads, target, delay, sequence) {
	if (threads == 0) { return }
	if (host != "home") { ns.scp(script, host) }

	// ns.tprint([[script, host, threads, target, delay, sequence]])
	ns.exec(script, host, threads, target, delay, sequence)
}

function calculateCombo(ns, target) {
	let result = {
		// Constants
		"host": (ns.args[1] || "home"), // TODO: Dynamically find a private host with sufficient RAM, with a fallback to home?
		"hackRatio": 0.8,
		"growRatio": 5,
		"fudgeSecurity": 5,
		"hackScript": "comboHack.js",
		"growScript": "comboGrow.js",
		"weakenScript": "comboWeaken.js",
	}

	// General Analysis
	result.ramAvailable = ns.getServerMaxRam(result.host) - ns.getServerUsedRam(result.host)
	result.cpuCores = ns.getServer(result.host).cpuCores // TODO: can replace a bunch of more specific calls below

	// Hack Analysis
	result.hackAmount = ns.hackAnalyze(target)

	result.threadsToHack = Math.floor(result.hackRatio / result.hackAmount)
	result.ramToHack = ns.getScriptRam(result.hackScript) * result.threadsToHack
	result.timeToHack = ns.getHackTime(target) / 1000
	result.minToHack = Math.floor(result.timeToHack / 60)
	result.secToHack = result.timeToHack - result.minToHack * 60

	// Growth Analysis
	result.threadsToGrow = Math.ceil(ns.growthAnalyze(target, result.growRatio) * 1.1)
	result.ramToGrow = ns.getScriptRam(result.growScript) * result.threadsToGrow
	result.timeToGrow = ns.getGrowTime(target) / 1000
	result.minToGrow = Math.floor(result.timeToGrow / 60)
	result.secToGrow = result.timeToGrow - result.minToGrow * 60

	// Weaken Analysis
	result.security = ns.getServerSecurityLevel(target)
	result.securityMin = ns.getServerMinSecurityLevel(target)
	result.securityPerThread = ns.weakenAnalyze(1)

	result.excessSecurity = result.security - result.securityMin // Expected 0 at this point, eh?
	result.hackSecurity = ns.hackAnalyzeSecurity(result.threadsToHack, target)
	result.growSecurity = ns.growthAnalyzeSecurity(result.threadsToGrow, target, result.cpuCores)
	result.totalSecurity = Math.ceil(result.excessSecurity + result.hackSecurity + result.growSecurity) + result.fudgeSecurity

	result.threadsToWeaken = Math.ceil(result.totalSecurity / result.securityPerThread)
	result.ramToWeaken = ns.getScriptRam(result.weakenScript) * result.threadsToWeaken
	result.timeToWeaken = ns.getWeakenTime(target) / 1000
	result.minToWeaken = Math.floor(result.timeToWeaken / 60)
	result.secToWeaken = result.timeToWeaken - result.minToWeaken * 60

	// Summary
	result.totalRam = result.ramToHack + result.ramToGrow + result.ramToWeaken

	return result
}