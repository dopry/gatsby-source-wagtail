import traverse from 'traverse';

export class WagtailRequestTransformer {
    transformSchema = schema => schema;
    transformRequest = request => {
        for (let node of traverse(request.document.definitions).nodes()) {
            if (node?.kind == 'Field' &&
                node?.selectionSet?.selections?.find(
                    selection => selection?.name?.value == 'imageFile'
                )) {
                // Add field to AST
                const createSelection = name => ({
                    kind: 'Field',
                    name: {
                        kind: 'Name',
                        value: name
                    },
                    arguments: [],
                    directives: []
                });
                // Make sure we have src, height & width details
                node.selectionSet.selections.push(createSelection('id'));
                node.selectionSet.selections.push(createSelection('src'));
                // Break as we don't need to visit any other nodes
                break;
            }
        }

        return request;
    };
    transformResult = result => result;
}
