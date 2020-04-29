# WordPress to NDJSON formatter

Simple NodeJS CLI-Application that fetch and format data from WordPress, and create NDJSON output to import it in Sanity.io CMS.


## Getting started
Download and install the repository locally

```bash
git clone wordpress-to-ndjson https://github.com/Junscuzzy/wordpress-to-ndjson
cd wordpress-to-ndjson
npm install
```

Then run

```bash
npm run dev --url https://your-wordpress-site.com
```

## Output format

This script makes a *.ndjson files for the following schema:

```js
// studio/schemas/documents/post.js

export default {
    name: 'post',
    type: 'document',
    title: 'Blog posts',
    fields: [
        {
            name: 'title',
            type: 'string',
            title: 'Title',
        },
        {
            name: 'slug',
            type: 'slug',
            title: 'Slug',
            options: {
            source: 'title',
                maxLength: 96
            }
        },
        {
            name: 'mainImage',
            type: 'mainImage',
            title: 'Main image'
        },
        {
            name: 'excerpt',
            type: 'text',
            rows: 4,
            title: 'Excerpt',
        },
        {
            name: 'categories',
            type: 'array',
            title: 'Categories',
            of: [
                {
                    type: 'reference',
                    to: {
                        type: 'category'
                    }
                }
            ]
        },
        {
            name: 'body',
            type: 'bodyPortableText',
            title: 'Body text'
        }
    ]
}

// studio/schemas/documents/category.js

export default {
    name: 'category',
    type: 'document',
    title: 'Categories',
    fields: [
        {
            name: 'title',
            type: 'string',
            title: 'Title'
        },
        {
            name: 'slug',
            type: 'slug',
            title: 'Slug',
            options: {
                source: 'title',
                maxLength: 96
            }
        },
        {
            name: 'description',
            type: 'text',
            title: 'Description'
        }
    ]
}
```


## Evolution
Actually, your can only fetch posts and post categories. If you want edit the formatting schema or add entities:
1. Update the Typescript interface model in `src/interfaces/{post-type}.ts`
1. Update the formatter following typescript support in `src/models/{post-type}.ts`
1. If necessary, edit the index file named `src/bin/cli.ts`.

You can copy this repository and adapt this following your business logic or submit a PR ;).

> You can also edit data formatting in `src/posts.js` or `src/categories.js`.

## To-do

- CPT support
- ACF support
- HTML parser to [Portable Text](https://github.com/portabletext/portabletext)
- Custom sanity.io output format
- Use `wp-api` instead REST API
- Authenticated connection to wordPress
- CLI loader
- Add unit tests

## License

Un-licensed, you can use, copy, edit, share (...) as you want without credit or permission.