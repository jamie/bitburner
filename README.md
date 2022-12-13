# bitburner
Code for https://danielyxie.github.io/bitburner/

## BN-2

Adds a gang mechanic, I have one script to manage the gang:

- handles both hacking and combat gangs
- hires members when available
- assigns training for new/ascended characters, up to the point they can start working
- ascends members at a 2x stat multiple
- purchases equipment/augs as long as it's less than 10% of my cash on hand
- runs a tiny bit of thought into assigning tasks based on difficulty vs skill level
- accepts a `--focus money` flag to exclude tasks that generate rep but no money
- assigns members to reducing Wanted level based on the penalty percent
- respects manually-assigned Territory Warfare members
