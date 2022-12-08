/** @param {NS} ns */

import * as network from "_network.js"

const contracts = {
	"Find Largest Prime Factor": primeFactor,
	"Subarray with Maximum Sum": maximumSubarray,
	// "Total Ways to Sum": total_ways_to_sum,
	// "Total Ways to Sum II": total_ways_to_sum_2,
	// "Spiralize Matrix": spiralize_matrix,
	// "Array Jumping Game": array_jumping_game,
	// "Array Jumping Game II": array_jumping_game_2,
	"Merge Overlapping Intervals": intervals,
	// "Generate IP Addresses": generate_ip_addresses,
	// "Algorithmic Stock Trader I": stocks1,
	// "Algorithmic Stock Trader II": stocks2,
	// "Algorithmic Stock Trader III": algorithmic_stock_trader_3,
	// "Algorithmic Stock Trader IV": algorithmic_stock_trader_4,
	// "Minimum Path Sum in a Triangle": minimum_sum_path_in_a_triangle,
	// "Unique Paths in a Grid I": unique_paths_in_a_grid_1,
	// "Unique Paths in a Grid II": unique_paths_in_a_grid_2,
	// "Shortest Path in a Grid": shortest_path_in_a_grid,
	// "Sanitize Parentheses in Expression": sanitize_parentheses_in_expression,
	// "Find All Valid Math Expressions": find_all_valid_math_expressions,
	// "HammingCodes: Encoded Binary to Integer": hamming_b2i,
	"HammingCodes: Integer to Encoded Binary": hamming_i2b,
	// "Proper 2-Coloring of a Graph": two_color,
	// "Compression I: RLE Compression": rle_c,
	// "Compression II: LZ Decompression": lz_d,
	// "Compression III: LZ Compression": lz_c,
	// "Encryption I: Caesar Cipher": caesar,
	// "Encryption II: Vigenère Cipher": vigenere,
}

export async function main(ns) {
	let jobs = []
	network.getServers(ns)
		.forEach(server => {
			let host = server.hostname
			ns.ls(host)
				.filter(file => file.endsWith(".cct"))
				.forEach(file => jobs.push([file, host]))
		})
	let file, host
	for ([file, host] of jobs) {
		let type = ns.codingcontract.getContractType(file, host)
		if (contracts[type]) {
			let reward = solve(ns, file, host)
			if (reward) {
				ns.tprint(`Solving ${type} on ${host}: ${reward ? reward : "Failure!"}`)
			} else {
				ns.tprint(ns.codingcontract.getDescription(file, host))
			}
		} else {
			ns.tprint(`Unsolved contract ${type} on ${host}: ${file}`)
		}
	}
}

export function solve(ns, file, host) {
	let type = ns.codingcontract.getContractType(file, host)
	if (contracts[type]) {
		let data = ns.codingcontract.getData(file, host)
		let answer = contracts[type](ns, data)
		let reward = answer ? ns.codingcontract.attempt(answer, file, host, { "returnReward": true }) : null

		return reward
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////

function hamming_b2i(ns, data) {
	let hamming = data.split("").map(b => Number(b))

	if (hamming.filter(v => v == 1).length % 2 == 1) {
		let errorIndex = 0
		let parity = 1
		while (hamming[parity] !== undefined) {
			if (hamming.filter((e, i) => i & parity).filter(e => e == 1).length % 2 == 1) {
				errorIndex = errorIndex | parity
			}
			parity *= 2
		}
		hamming[errorIndex] = 1 - hamming[errorIndex]
	}

	let bits = []
	let i = 3
	let parity = 4
	while (hamming[i] !== undefined) {
		bits.push(hamming[i])
		i += 1
		if (i == parity) {
			parity *= 2
			i += 1
		}
	}
	let out = 0
	for (let i in bits) {
		if (bits[i] == 1) {
			out = out | 2 ** i
		}
	}

	return out
}

function hamming_i2b(ns, data) {
	let bits = data.toString(2).split("").map(b => Number(b))
	let hamming = []

	let j = 3
	let parity = 4
	// Fill array
	for (let i in bits) {
		hamming[j] = bits[i]
		j += 1
		if (j == parity) {
			parity *= 2
			j += 1
		}
	}
	// Calc parity
	while (parity >= 1) {
		parity /= 2
		hamming[parity] = hamming.filter((e, i) => i & parity).filter(e => e == 1).length % 2
	}
	hamming[0] = hamming.filter(v => v == 1).length % 2

	return hamming.join("")
}

function intervals(ns, data) {
	data = data.sort((a, b) => a[0] - b[0])

	let i = 0
	while (data[i + 1]) {
		if (data[i][1] >= data[i + 1][0]) {
			let slice = data[i].concat(data[i + 1])
			let minmax = [Math.min(...slice), Math.max(...slice)]
			data.splice(i, 2, minmax)
		} else {
			i += 1
		}
	}

	return data
}

function maximumSubarray(ns, data) {
	let max = Number.MIN_SAFE_INTEGER

	for (let i in data) {
		for (let j in data) {
			i = Number(i) // Javascript, you are
			j = Number(j) // dumb as rocks, omg.
			if (i <= j) {
				let slice = data.slice(i, j + 1)
				let sum = slice.reduce((a, b) => a + b, 0)
				max = Math.max(sum, max)
			}
		}
	}

	return max
}

// function isPrime(x) {
// 	if (x <= 1) { return false }
//     if (x % 2 == 0) { return true }
// 	for (let i = 3; i <= x / 2; i += 2) {
// 		if (x % i == 0) { return false }
// 	}
// 	return true
// }
function primeFactor(ns, data) {
	if (data % 2 == 0) { data /= 2 }

	for (let i = 3; i < data; i += 2) {
		while (data % i == 0) { data /= i }
	}
	return data
}

function stocks1(ns, data) {
	let max = 0
	for (let i in data) {
		for (let j in data) {
			i = Number(i)
			j = Number(j)
			if (i < j) {
				max = Math.max(max, data[j] - data[i])
			}
		}
	}
	return max
}

function stocks2(ns, data) {
	ns.tprint(data)
}