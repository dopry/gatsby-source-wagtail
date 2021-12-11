import { linkToExecutor } from '@graphql-tools/links'
import {
    mapSchema,
    MapperKind,
} from '@graphql-tools/utils';
import { introspectSchema, RenameTypes, wrapSchema } from '@graphql-tools/wrap'
import { createHttpLink } from 'apollo-link-http'
import { buildSchema, printSchema } from 'graphql'
import {
    NamespaceUnderFieldTransform,
    StripNonQueryTransform,
} from 'gatsby-source-graphql/transforms'
import fetch from 'node-fetch'
import { WagtailRequestTransformer } from './lib/WagtailRequestTransformer'

class StripRootQueryTransform {
    transformSchema(schema) {
        // console.log('StripRootQueryTransform.transformSchema', schema)
        const schemaMapper =  {
            [MapperKind.MUTATION]() {
              return null;
            },
      
            [MapperKind.SUBSCRIPTION]() {
              return null;
            },
          }
      return mapSchema(schema, schemaMapper);
    }
  
  }

export async function createSchemaCustomization({ actions, cache }, options) {
    const { addThirdPartySchema } = actions
    const {
        url,
        typeName,
        fieldName,
        headers = {},
        fetchOptions = {},
        createLink,
        createSchema,
        transformSchema,
    } = options

    let link
    if (createLink) {
        link = await createLink(options)
    } else {
        const options = {
            uri: url,
            fetch,
            headers,
            fetchOptions,
        }
        link = createHttpLink(options)
    }

    let introspectionSchema
    if (createSchema) {
        introspectionSchema = await createSchema(options)
    } else {
        const cacheKey = `gatsby-source-wagtail-${typeName}-${fieldName}`
        let sdl = await cache.get(cacheKey)
        // Cache the remote schema for performance benefit
        if (!sdl) {
            introspectionSchema = await introspectSchema(linkToExecutor(link))
            sdl = printSchema(introspectionSchema)
        } else {
            introspectionSchema = buildSchema(sdl)
        }
        await cache.set(cacheKey, sdl)
    }


    // console.log('introspectionSchema', introspectionSchema)

    const resolver = (parent, args, context) => {
        context.nodeModel.createPageDependency({
            path: context.path,
            nodeId: nodeId,
        })
        return {}
    }

    // Add some customization of the remote schema
    let defaultTransforms
    if (options.prefixTypename) {
        defaultTransforms = [
            new StripRootQueryTransform(),
            new StripNonQueryTransform(),
            new RenameTypes((name) => `${typeName}_${name}`),
            new NamespaceUnderFieldTransform({
                typeName,
                fieldName,
                resolver,
            }),
            new WagtailRequestTransformer(),
        ]
    } else {
        defaultTransforms = [
            new StripRootQueryTransform(),
            new StripNonQueryTransform(),
            new NamespaceUnderFieldTransform({
                typeName,
                fieldName,
                resolver,
            }),
            new WagtailRequestTransformer(),
        ]
    }

    const schema = transformSchema
        ? transformSchema({
              schema: introspectionSchema,
              link,
              resolver,
              defaultTransforms,
              options,
          })
        : wrapSchema({
              schema: introspectionSchema,
              executor: linkToExecutor(link),
              transforms: defaultTransforms,
          })

    console.log('3rdPartySchema', schema)

    addThirdPartySchema({ schema })
}
