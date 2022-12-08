/** @param {NS} ns */
export function runCommand(cmd) {
    const terminalInput = document.getElementById("terminal-input")
    const handler = Object.keys(terminalInput)[1]
    terminalInput.value = cmd
    terminalInput[handler].onChange({ target: terminalInput })
    terminalInput[handler].onKeyDown({ key: "Enter", keyCode: 13, preventDefault: () => null })
}