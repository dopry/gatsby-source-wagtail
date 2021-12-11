import { createRemoteFileNode } from 'gatsby-source-filesystem'
import { queryBackend } from './lib/queryBackend'

export function createResolvers(
    { actions, getCache, createNodeId, createResolvers, store, reporter },
    options
) {
    const { createNode } = actions
    return queryBackend(
        `{
    imageType
  }`,
        options.url,
        options.headers
    ).then(({ data }) => {
        createResolvers({
            [data.imageType]: {
                imageFile: {
                    type: `File`,
                    resolve(source, args, context, info) {
                        return createRemoteFileNode({
                            url: source.src,
                            store,
                            getCache,
                            createNode,
                            createNodeId,
                        }).catch((err) => console.error(err))
                    },
                },
            },
        })
    })
}
