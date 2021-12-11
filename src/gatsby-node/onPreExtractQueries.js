import fs from 'fs-extra'
import { generateImageFragments } from './lib/generateImageFragments'
import { queryBackend } from './lib/queryBackend'

export async function onPreExtractQueries({ store, actions }, options) {
    const { createRedirect } = actions
    return queryBackend(
        `{
    imageType
    redirects {
      oldPath
      newUrl
      isPermanent
    }
    __schema {
      types {
        kind
        name
        fields {
          name
        }
        possibleTypes {
          name
        }
      }
    }
  }`,
        options.url,
        options.headers
    ).then(({ data }) => {
        // Check if fields added by wagtail-gatsby are visible
        const wagtailGatsbyInstalled = !!data.__schema.types
            .find((objectType) => objectType.name == data.imageType)
            .fields.find((field) => field.name == 'tracedSVG')

        // Build schema file for Apollo, here we're filtering out any type information unrelated to unions or interfaces
        const filteredData = data.__schema.types.filter(
            (type) => type.possibleTypes !== null
        )
        data.__schema.types = filteredData
        // TODO: Do not write to node_modules
        fs.writeFile(
            './node_modules/gatsby-source-wagtail/fragmentTypes.json',
            JSON.stringify(data),
            (err) => {
                if (err) {
                    console.error(
                        'Gatsby-source-wagtail: Error writing fragmentTypes file',
                        err
                    )
                }
            }
        )

        // Generate Image Fragments for the servers respective image model.
        const program = store.getState().program
        const fragments = wagtailGatsbyInstalled
            ? generateImageFragments(data.imageType)
            : ''
        fs.writeFile(
            `${program.directory}/.cache/fragments/gatsby-source-wagtail-fragments.js`,
            fragments,
            (err) => {
                if (err) console.error(err)
            }
        )

        // Copy the boilerplate file and replace the placeholder with actual modal name
        fs.readFile(
            './node_modules/gatsby-source-wagtail/preview.boilerplate.js',
            (err, fileData) => {
                if (err)
                    return console.error(
                        'Could not read preview boilerplate file',
                        err
                    )
                // Replace placeholder
                let jsFile = fileData
                    .toString()
                    .replace('CustomImage', data.imageType)
                // Rewrite file so it's accessible
                fs.writeFile(
                    `./node_modules/gatsby-source-wagtail/preview.js`,
                    jsFile,
                    (err) => {
                        if (err)
                            console.error('Could not write preview file', err)
                    }
                )
            }
        )

        // Generate redirects for Netlify, controlled by Wagtail Admin.
        data.redirects.map((redirect) =>
            createRedirect({
                fromPath: redirect.oldPath,
                toPath: redirect.newUrl,
                isPermanent: redirect.isPermanent,
                force: true,
            })
        )
    })
}
