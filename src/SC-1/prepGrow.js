/** @param {NS} ns */
export async function main(ns) {
    let hostname = ns.args[0];
    let delay = ns.args[1] || 0;

    await ns.sleep(delay * 1000)
    await ns.grow(hostname)
    // ns.tprint(`Growth complete on ${hostname}`)
}