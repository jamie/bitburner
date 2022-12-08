/** @param {NS} ns */
export async function main(ns) {
	// {
	// 	"location":{
	// 		"city":"Volhaven",
	// 		"costMult":0,
	// 		"expMult":0,
	// 		"name":"CompuTek",
	// 		"types":[0,6],
	// 		"techVendorMaxRam":256,
	// 		"techVendorMinRam":8,
	// 		"infiltrationData":{
	// 			"maxClearanceLevel":15,
	// 			"startingSecurityLevel":3.59
	// 		}
	// 	},
	// 	"reward":{
	// 		"tradeRep":2421.8456374149023,
	// 		"sellCash":2417221.5991828935,
	// 		"SoARep":1609.7827878965923
	// 	},
	// 	"difficulty":2.156303282051013
	// }
	ns.tprint("Dif | Lv | Rep  | Gain | Location")
	ns.infiltration
		.getPossibleLocations()
		.map(entry => ns.infiltration.getInfiltration(entry.name))
		.sort((a, b) => a.difficulty - b.difficulty)
		.map(entry => {
			entry.gains = entry.reward.SoARep / entry.location.infiltrationData.maxClearanceLevel
			return entry
		})
		.forEach(entry => {
			ns.tprint(
				[
					ns.nFormat(entry.difficulty, "0.0"),
					ns.nFormat(entry.location.infiltrationData.maxClearanceLevel, "0").padStart(2),
					ns.nFormat(entry.reward.SoARep, "0.0a"),
					ns.nFormat(entry.gains, "0").padStart(4),
					(entry.location.name + ", " + entry.location.city),
				].join(" | ")
			)
			// ns.tprint(entry)
		})

}