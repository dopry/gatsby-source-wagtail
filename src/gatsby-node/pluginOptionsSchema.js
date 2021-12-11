// see: https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-source-graphql/src/gatsby-node.js#L18
export function pluginOptionsSchema({ Joi }) {
    const url = Joi.string()
    const typeName = Joi.string().default('wagtail')
    const fieldName = Joi.string().default('wagtail')
    const createLink = Joi.function()
    const refetchInterval = Joi.number()
    const options = Joi.object({
        url,
        typeName,
        fieldName,
        createLink,
        refetchInterval,
    }).or('url', 'createLink')
    return options
}
