import { v4 as uuidv4 } from 'uuid'

function createSchemaNode({ id, typeName, fieldName, createContentDigest }) {
    const nodeContent = uuidv4()
    const nodeContentDigest = createContentDigest(nodeContent)
    return {
        id,
        typeName: typeName,
        fieldName: fieldName,
        parent: null,
        children: [],
        internal: {
            type: `GraphQLSource`,
            contentDigest: nodeContentDigest,
            ignoreType: true,
        },
    }
}

export async function sourceNodes(
    { actions, createNodeId, createContentDigest },
    options
) {
    const { createNode } = actions
    const { typeName, fieldName, refetchInterval } = options

    // Create a point in the schema that can be used to access Wagtail
    const nodeId = createNodeId(`gatsby-source-wagtail-${typeName}`)
    const node = createSchemaNode({
        id: nodeId,
        typeName,
        fieldName,
        createContentDigest,
    })
    createNode(node)

    // Allow refreshing of the remote data in DEV mode only
    if (process.env.NODE_ENV !== `production`) {
        if (refetchInterval) {
            const msRefetchInterval = refetchInterval * 1000
            const refetcher = () => {
                createNode(
                    createSchemaNode({
                        id: nodeId,
                        typeName,
                        fieldName,
                        createContentDigest,
                    })
                )
                setTimeout(refetcher, msRefetchInterval)
            }
            setTimeout(refetcher, msRefetchInterval)
        }
    }
}
