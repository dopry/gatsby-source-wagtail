# Development

This is an open source project, your contributions are welcome.

## Using the /example

If you want to test your code as you develop you can `npm link` it into the /example.

```sh
# expose the project you're working on as a npm package on the local system.
npm link
# start the babel watcher to rebuild package code as you make changes.
npm run watch&
# switch to the example folder.
cd example
# ensure your local package is linked into the project. 
npm link gatsby-source-wagtail
# run gatsby build to see it all in action
gatsby build
```

