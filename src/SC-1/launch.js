/** @param {NS} ns */

// Runs a script on another host.
// Args:
// - host: string, hostname to run on
// - script: string, name of script to run
// - *args: any, args to pass to the script
export async function main(ns) {
	let host = ns.args[0]
	let ramAvailable = ns.getServerMaxRam(host)

	let script = ns.args[1]
	let ramUse = ns.getScriptRam(script)
	let threads = Math.floor(ramAvailable / ramUse)

	ns.scp(script, host)
	ns.killall(host)

	let args = ns.args.slice(2)
	ns.tprint([script, host, threads, ...args])
	ns.exec(script, host, threads, ...args)
}