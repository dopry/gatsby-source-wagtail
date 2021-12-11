module.exports = {
    siteMetadata: {
        siteUrl: 'https://www.yourdomain.tld',
        title: 'example',
    },
    plugins: [
        // { 
        //     resolve: 'gatsby-source-wagtail',
        //     options: {
        //         url: 'http://localhost:8080/graphql/'
        //     }
        // },
        { 
            resolve: 'gatsby-source-graphql',
            options: {
                // url: 'http://localhost:8080/graphql/',
                url: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
                typeName: 'Wagtail',
                fieldName: 'wagtail'
            }
        },
        // {
        //     resolve: 'gatsby-plugin-google-analytics',
        //     options: {
        //         trackingId: '',
        //     },
        // },
        'gatsby-plugin-image',
        'gatsby-plugin-react-helmet',
        'gatsby-plugin-sitemap',
        {
            resolve: 'gatsby-plugin-manifest',
            options: {
                icon: 'src/images/icon.png',
            },
        },
        'gatsby-plugin-mdx',
        'gatsby-transformer-remark',
        'gatsby-plugin-sharp',
        'gatsby-transformer-sharp',
        {
            resolve: 'gatsby-source-filesystem',
            options: {
                name: 'images',
                path: './src/images/',
            },
            __key: 'images',
        },
        {
            resolve: 'gatsby-source-filesystem',
            options: {
                name: 'pages',
                path: './src/pages/',
            },
            __key: 'pages',
        },
    ],
}
