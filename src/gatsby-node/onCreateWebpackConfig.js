export function onCreateWebpackConfig({ stage, actions, getConfig }) {
    const config = getConfig()
    if (stage.indexOf('html') >= 0) {
        return
    }

    const replaceRule = (ruleUse) => {
        if (
            ruleUse.loader &&
            ruleUse.loader.indexOf(`gatsby/dist/utils/babel-loader.js`) >= 0
        ) {
            ruleUse.loader = require.resolve(
                `gatsby-source-wagtail/babel-loader.js`
            )
        }
    }

    const traverseRule = (rule) => {
        if (rule.oneOf && Array.isArray(rule.oneOf)) {
            rule.oneOf.forEach(traverseRule)
        }

        if (rule.use) {
            if (Array.isArray(rule.use)) {
                rule.use.forEach(replaceRule)
            } else {
                replaceRule(rule.use)
            }
        }
    }
    config.module.rules.forEach(traverseRule)
    actions.replaceWebpackConfig(config)
}
