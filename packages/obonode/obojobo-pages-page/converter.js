import Component from 'obojobo-document-engine/src/scripts/oboeditor/components/node/editor'

const slateToObo = node => {
	const json = {
		id: node.key,
		type: node.type,
		children: node.nodes.map(child => Component.helpers.slateToObo(child))
	}

	if (node.data) json.content = node.data.get('content') || {}

	return json
}

const oboToSlate = node => ({
	object: 'block',
	key: node.id,
	type: node.type,
	data: { content: node.content },
	nodes: node.children.map(child => Component.helpers.oboToSlate(child))
})

export default { slateToObo, oboToSlate }
