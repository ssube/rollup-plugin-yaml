import YAML from 'js-yaml';
import toSource from 'tosource';
import { createFilter, makeLegalIdentifier } from 'rollup-pluginutils';

const ext = /\.ya?ml$/;

export default function yaml(options = {}) {
	const filter = createFilter(options.include, options.exclude);

	return {
		name: 'yaml',

		transform(yaml, id) {
			if (!ext.test(id)) return null;
			if (!filter(id)) return null;

			const decl = options.decl || 'const';

			const data = YAML.safeLoad(yaml, {
				schema: options.schema,
			});
			const keys = Object.keys(data).filter(
				key => key === makeLegalIdentifier(key)
			);

			const code = [
                                `${decl} data = ${toSource(data)};`,
				'export default data;',
			]
				.concat(keys.map(key => `export ${decl} ${key} = data.${key};`))
				.join('\n\n');

			return {
				code,
				map: { mappings: '' }
			};
		}
	};
}
