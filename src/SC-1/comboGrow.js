/** @param {NS} ns */
export async function main(ns) {
    let hostname = ns.args[0];
    let delay = ns.args[1] || 0;

    let time
    while (true) {
        time = Date.now()
        await ns.sleep(delay * 1000)
        let growth = await ns.grow(hostname)
        // ns.tprint(`Grew ${hostname} for ${ns.nFormat(growth, "0.0a")}. Took ${(Date.now() - time)/1000}s incl ${delay}s sleep.`)
    }
}