### conversion of .js app to React
# reformat/rename script.js to index.js and change to support React
## Changed name to Perry ParcelRunner


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started


```bash
npm install
npm run dev
```

This will install all dependencies and start the Perry ParcelRunner development server.
- Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.
- Make sure you have Node.js and npm installed on your system.
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Install
   npm install node-fetch
   npm install axios
   npm config set strict-ssl false
   npm install react-toastify
   ## CSS tool
   npm install @windmill/react-ui

   Updates - starting 1/26/25

   1/26 - Updates to _app.js to fix UseEffect issue
   -- added condition
   -- Fixes - 
   2/3 - install middleware
   -- npm install http-proxy-middleware --save
   -- Update webpack
   -- export function webpack(config) {
    config.resolve.fallback = { fs: false, net: false, ...config.resolve.fallback };
    return config;
}
2/6 - add Mocha
- npm install --save-dev mocha
-- For unit testing
- Add babel for jsx support
-- npm install --save-dev @babel/core @babel/preset-env @babel/preset-react @babel/register
-- npm install --save-dev chai
2/12 - GET functioning
-- After extensive changes to framework and processes
example api urls
-- https://demoqa.com/BookStore/v1/Books
-- https://api.printful.com/