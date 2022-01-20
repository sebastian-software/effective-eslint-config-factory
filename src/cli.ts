import meow from 'meow';
import { main } from '.';

const cli = meow(`
	Usage
	  $ foo <input>

	Options
	  --rainbow, -r  Include a rainbow

	Examples
	  $ foo unicorns --rainbow
	  🌈 unicorns 🌈
`, {
	flags: {
		rainbow: {
			type: 'boolean',
			alias: 'r'
		}
	}
});
/*
{
	input: ['unicorns'],
	flags: {rainbow: true},
	...
}
*/

main(cli.input[0], cli.flags);
