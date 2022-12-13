/** @param {NS} ns */
const names = [
	"Alpha", "Bravo", "Charlie", "Delta",
	"Echo", "Foxtrot", "Golf", "Hotel",
	"India", "Juliet", "Kilo", "Lima"
]

let myGang

export async function main(ns) {
	if (!ns.gang.inGang()) {
		ns.tprint("Not in a gang, not joining automatically.")
		return
	}

	loadMyGang(ns)

	while (true) {
		hireGangMembers(ns)
		equipGangMembers(ns)
		ascend(ns)
		assignGangTasks(ns)
		await ns.sleep(5000)
	}
}

function loadMyGang(ns) {
	myGang = ns.gang.getGangInformation()

	if (myGang.isHacking) {
		// Hacking Gang
		myGang.skill = "hack"
		myGang.ascendRatio = 2
		myGang.taskThresholds = [
			{name: "Cyberterrorism", difficulty: 36, money: false},
			{name: "Money Laundering", difficulty: 25, money: true},
			{name: "Fraud & Counterfeiting", difficulty: 20, money: true},
			{name: "Plant Virus", difficulty: 12, money: false},
			{name: "DDoS Attacks", difficulty: 8, money: false},
			{name: "Identity Theft", difficulty: 5, money: true},
			{name: "Phishing", difficulty: 3.5, money: true},
			{name: "Ransomware", difficulty: 1, money: true},
		]
		myGang.reduceWantedTask = {name: "Ethical Hacking", difficulty: 1, money: true}
		myGang.trainingTask = {name: "Train Hacking", difficulty: 1, money: false}
	} else {
		// Combat Gang
		myGang.skill = "combat"
		myGang.ascendRatio = 8
		myGang.taskThresholds = [
			{name: "Terrorism", difficulty: 36, money: false},
			{name: "Human Trafficking", difficulty: 36, money: true},
			{name: "Threaten & Blackmail", difficulty: 28, money: true},
			{name: "Traffick Illegal Arms", difficulty: 32, money: true},
			{name: "Armed Robbery", difficulty: 20, money: true},
			{name: "Run a Con", difficulty: 14, money: true},
			{name: "Strongarm Civilians", difficulty: 5, money: true},
			{name: "Deal Drugs", difficulty: 3.5, money: true},
			{name: "Mug People", difficulty: 1, money: true},
		]
		myGang.reduceWantedTask = {name: "Vigilante Justice", difficulty: 1, money: false}
		myGang.trainingTask = {name: "Train Combat", difficulty: 1, money: false}
	}

	var flags = ns.flags([
		["focus", "rep"]
	])
	if (flags.focus == "money") {
		myGang.taskThresholds = myGang.taskThresholds.filter(task => task.money)
	}
}

function getGangMembers(ns) {
	return ns.gang.getMemberNames()
		.map(name => ns.gang.getMemberInformation(name))
		.map(member => {
			member.combat = member.str + member.def + member.dex + member.agi
			member.allScore = member.combat + member.hack + member.cha
			member.skill = member[myGang.skill]
			return member
		})
}


function hireGangMembers(ns) {
	if (ns.gang.canRecruitMember()) {
		let recruited = ns.gang.getMemberNames()
		let next = names.filter(name => !recruited.includes(name))[0]
		ns.tprint(`Recruiting ${next}`)
		ns.gang.recruitMember(next)
		makeLearner(ns, {"name": next})
	}
}

function equipGangMembers(ns) {
	let equipment = ns.gang.getEquipmentNames().sort((a,b) => ns.gang.getEquipmentCost(a) - ns.gang.getEquipmentCost(b))
	let members = ns.gang.getMemberNames().map(name => ns.gang.getMemberInformation(name))

	for (let item of equipment) {
		// Filter desired equipment/augments by useful stats
		let stats = ns.gang.getEquipmentStats(item)
		if (myGang.isHacking && !stats.hack) { continue }
		if (!myGang.isHacking && (!stats.str && !stats.def && !stats.dex && !stats.agi)) { continue }

		for (let member of members) {
			if (ns.gang.getEquipmentCost(item) > ns.getPlayer().money * 0.1) { continue }
			if (member.upgrades.includes(item)) { continue }
			// ns.tprint(`Considering ${member.name} buying ${item} for ${ns.nFormat(cost, "0.0a")}`)
			ns.gang.purchaseEquipment(member.name, item)
		}
	}
}

function ascend(ns) {
	getGangMembers(ns)
		.forEach(member => {
			// Ascension Result returns a multiplier based on the current multipliers.
			// eg, going from an ascension multiplier of 2.5 to 6.5 is a 2.6 return value.
			// It also returns undefined if ascension is not possible
			let ascended = ns.gang.getAscensionResult(member.name)

			if (ascended) {
				ascended.combat = ascended.str + ascended.def + ascended.dex + ascended.agi
				ascended.skill = ascended[myGang.skill]
				if (member.skill > 2 && ascended.skill > myGang.ascendRatio) {
					ns.tprint(`Ascending ${member.name}`)
					ns.gang.ascendMember(member.name)
				}
			}
		})
}



function makeLearner(ns, member) {
	let training = myGang.trainingTask.name

	if (member.task == "Territory Warfare") { return }
	if (member.task == training) { return }

	ns.tprint(`${member.name}: ${training}`)
	ns.gang.setMemberTask(member.name, training)
}

function makeVigilante(ns, member) {
	let vigilante = myGang.reduceWantedTask.name

	if (member.task == "Territory Warfare") { return }
	if (member.task == vigilante) { return }

	ns.tprint(`${member.name}: ${vigilante}`)
	ns.gang.setMemberTask(member.name, vigilante)
}

function makeWorker(ns, member) {
	let threshold = 30

	let vigilante = myGang.reduceWantedTask.name
	let training = myGang.trainingTask.name

	// Don't reassign if manually assigned to fighting
	if (member.task == "Territory Warfare") { return }
	// Only reassign away from vigilante/training, leave manual task assignments alone
	// if (member.task != vigilante && member.task != training) { return }

	for (let task of myGang.taskThresholds) {
		// if (!task.money) { continue } // Restrict progression to prefer money to XP/Reputation
		if (member.skill > task.difficulty * threshold) {
			if (member.task != task.name) {
				ns.tprint(`${member.name}: ${task.name}`)
				ns.gang.setMemberTask(member.name, task.name)
			}
			return
		}
	}
}

let taskGoal = "default"

function assignGangTasks(ns) {
	let gang = getGangMembers(ns)
		.sort((a, b) => a.skill - b.skill)
	let maxSkill = Math.max(...gang.map(member => member.skill))
	// gang = gang.filter(member => member.skill < maxSkill) // Retain full control over (typically) first gang member

	// ns.tprint(`----- wantedLevel ${ns.gang.getGangInformation().wantedLevel} -- wantedPenalty ${ns.gang.getGangInformation().wantedPenalty}`)

	// Training
	let nonTrainees = []
	for (let member of gang) {
		if (member.skill < maxSkill * 0.25 && member.skill < 200) {
			makeLearner(ns, member)
		}
		else { nonTrainees.push(member) }
	}

	// Working
	if (nonTrainees.length > 0) {
		let wantedPenalty = ns.gang.getGangInformation().wantedPenalty * 100

		if (wantedPenalty < 95) { taskGoal = "allVigilante" }
		if (wantedPenalty > 98) { taskGoal = "default" }

		let vigilanteCount = Math.floor(100 - wantedPenalty)
		if (taskGoal == "allVigilante") { vigilanteCount = nonTrainees.length }
		// Short-circuit for a new instance, or after a mass ascension
		if (ns.gang.getGangInformation().wantedLevel < 10) { vigilanteCount = 0 }

		let workers = nonTrainees.slice(0, nonTrainees.length - vigilanteCount)
		let vigilantes = nonTrainees.slice(nonTrainees.length - vigilanteCount)
		for (let member of vigilantes) { makeVigilante(ns, member) }
		for (let member of workers) { makeWorker(ns, member) }
	}
}

////// Struct Data Reference

////// gang
// {"faction":"Slum Snakes",
// "isHacking":false,
// "moneyGainRate":2543.375769239022,
// "power":1,
// "respect":8083.056416706421,
// "respectGainRate":0.11572509232842527,
// "territory":0.1428571428571449,
// "territoryClashChance":0,
// "territoryWarfareEngaged":false,
// "wantedLevel":214.88716529153723,
// "wantedLevelGainRate":0.05325063749571848,
// "wantedPenalty":0.974103563953155}

////// member
// {"name":"Alice",
// "task":"Mug People",
// "earnedRespect":1135.5423407343617,
// "hack":13,
// "str":79,
// "def":68,
// "dex":72,
// "agi":58,
// "cha":42,
// "hack_exp":211.81190839338308,
// "str_exp":2683.707037636564,
// "def_exp":2594.6224838968997,
// "dex_exp":2632.7150842365972,
// "agi_exp":1239.881290303824,
// "cha_exp":1394.5596363603884,
// "hack_mult":1.15,
// "str_mult":1.352,
// "def_mult":1.196,
// "dex_mult":1.25,
// "agi_mult":1.4949999999999999,
// "cha_mult":1,
// "hack_asc_mult":1,
// "str_asc_mult":1,
// "def_asc_mult":1,
// "dex_asc_mult":1,
// "agi_asc_mult":1,
// "cha_asc_mult":1,
// "hack_asc_points":0,
// "str_asc_points":0,
// "def_asc_points":0,
// "dex_asc_points":0,
// "agi_asc_points":0,
// "cha_asc_points":0,
// "upgrades":["AWM Sniper Rifle","Liquid Body Armor","Demon Rootkit","Baseball Bat"],
// "augmentations":[],
// "respectGain":0.012269568670774127,
// "wantedLevelGain":0.00002494894451711618,
// "moneyGain":68.28196626180915}



// ns.gang.getTaskNames().map(name => {
// 	let task = ns.gang.getTaskStats(name)
// 	ns.tprint(`${task.name.padStart(20)}: ${task.difficulty} difficulty, ${task.baseRespect} respect, ${task.baseWanted} wanted, ${task.baseMoney} money (territory ${task.territory})`)
// })

////// task
// {"name":"Mug People",
// "desc":"Assign this gang member to mug random people on the streets<br><br>Earns money - Slightly increases respect - Very slightly increases wanted level",
// "isHacking":false,
// "isCombat":true,
// "baseRespect":0.00005,
// "baseWanted":0.00005,
// "baseMoney":3.6,
// "hackWeight":0,
// "strWeight":25,
// "defWeight":25,
// "dexWeight":25,
// "agiWeight":10,
// "chaWeight":15,
// "difficulty":1,
// "territory":{"money":1,"respect":1,"wanted":1}}