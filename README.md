# MRS Residency Madurai

A responsive hotel website with a secure, GitHub-backed content management system.

## Website

The public website is built with HTML, CSS and JavaScript. Editable content lives in `content/site.json`, while the page keeps embedded fallback content for fast, reliable loading.

## Admin CMS

Visit `/admin` on the deployed website to manage:

- Hotel and contact details
- Hero and introduction sections
- Rooms, prices and featured-room selection
- Gallery images and captions
- Amenities
- Location details and nearby landmarks
- Final booking call to action

The CMS uses an HTTP-only signed session cookie. Credentials and repository access are read from deployment environment variables and are never stored in the browser or repository.

When an admin saves content, the serverless API updates `content/site.json` in GitHub. Image uploads are written to `assets/uploads/`. Each GitHub commit triggers a new Vercel deployment.

## Vercel environment variables

Copy the names in `.env.example` into the Vercel project's environment settings:

- `ADMIN_USERNAME`: the CMS login username
- `ADMIN_PASSWORD`: a long, unique CMS password
- `SESSION_SECRET`: at least 32 random characters used to sign sessions
- `GITHUB_TOKEN`: a fine-grained GitHub token with Contents read/write access to this repository
- `GITHUB_REPO`: `yugeshr/mrs-residency`
- `GITHUB_BRANCH`: `main`

Generate a session secret in PowerShell:

```powershell
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```

For the GitHub token, grant access only to `yugeshr/mrs-residency` and enable **Repository permissions → Contents → Read and write**.

## Development

The public site can be previewed with any static file server. The authentication, save and upload endpoints use Vercel Functions, so run `vercel dev` when testing the full CMS locally.

## SEO

The homepage includes a canonical URL for `https://www.mrsresidency.com/`, regional language annotations, Open Graph and Twitter metadata, Hotel/WebSite/FAQ structured data, descriptive image text, a visible FAQ section, and an image sitemap. SEO titles, descriptions, social images and FAQs can be updated in the CMS.

After deployment, add the `https://www.mrsresidency.com/` domain property to Google Search Console, submit `https://www.mrsresidency.com/sitemap.xml`, and request indexing for the homepage. Keep the Google Business Profile name, address, phone number and website URL identical to the website details.
