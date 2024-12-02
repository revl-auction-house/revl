/** @type {import('houdini').ConfigFile} */
const config = {
	watchSchema: {
		url: 'http://localhost:8080/graphql' // process.env.NEXT_PUBLIC_PROTOKIT_GRAPHQL_URL TODO check why env does not work
	},
	plugins: {
		'houdini-svelte': {}
	}
};

export default config;
