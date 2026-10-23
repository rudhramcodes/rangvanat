# Storefront conversion — first reference

The main homepage (`/`) now uses the supplied screenshots for its header, hero and second section. The remaining homepage sections, catalogue and product details retain their existing content until their screen references are supplied.

## Second section

`StorefrontIntroduction.jsx` sits immediately after the hero. It follows the reference's left-hand heading, supporting copy and underlined catalogue link, with two coordinated editorial views on the right. Mobile stacks the copy above the imagery. Copy: “Our pieces and collections”, “Handwoven khadi. Made for the everyday.”, “Discover Products”. The link opens the existing catalogue. A one-time scroll reveal staggers the copy and gently settles the image; reduced motion leaves the section static.

`public/images/khadi-editorial-diptych.png` was generated with the built-in image tool. Prompt brief: a 3:2 editorial diptych, Indian woman wearing an ivory handwoven khadi jacket viewed from behind on the left, matching front-view garment still life on the right, oxblood botanical embroidery, wooden buttons, espresso trousers and pale studio ground, no text or logos. This is campaign concept imagery rather than a verified purchasable product. Build, ESLint and taste source lint passed; browser verification remains skipped at the user's request.

## Design

Reference-led direction: left-aligned three-line collection heading, small upper-right introduction, underlined collection link, central fashion lineup and oversized background wordmark. No random taste-skill direction was drawn because the supplied screenshot fixes the composition. Its three-line heading takes precedence over the skill's default two-line rule.

Rangvanat's espresso and oxblood are retained with a quieter neutral ground. Arial/Helvetica approximates the reference's plain grotesk typography; the source font cannot be identified precisely from the screenshot. The idea is to bring Rangvanat's khadi silhouettes forward against its name. The collection link opens the existing catalogue. Navigation and the empty-cart drawer work with native dialogs, including Escape, focus trapping and focus return.

Motion follows the supplied screen recording: the lineup fades and settles from a slight enlargement, heading lines enter in sequence, the background wordmark slides from the right, then the collection link appears. One GSAP timeline waits for the hero image to decode before playing. It is reverted on unmount and disabled under reduced motion. Small scroll-linked image drift and link feedback remain. No browser or screenshot verification was run, as requested.

## Campaign asset

`public/images/rangvanat-campaign-cutout.png` is the active transparent campaign asset; the original `rangvanat-campaign.png` remains available. The built-in image tool removed the background with this prompt: preserve the seven models, outfits, shoes, scale and positioning; make every background pixel and gap transparent while keeping white clothing opaque. The extracted alpha mask was inspected to verify transparent surroundings and solid silhouettes. The wordmark stays underneath the image and now shows around and between the models.

This is AI-generated editorial concept artwork, not verified product photography. Replace with approved campaign photography before publication. Original generation brief: seven full-length Indian models in a compact editorial lineup, authentic-textured ivory, beige, espresso and oxblood khadi silhouettes, a central woman in embroidered waistcoat and trousers, no text.

## Backend findings

The continuation also includes a two-column Selected Pieces grid with six actual catalogue records: two bottoms, two jackets, a co-ord and a dress. Cards link to the existing product route, use original catalogue images, and reveal independently on scroll. “Selected” avoids an unsupported sales-popularity claim. Prices read “Price on enquiry” because the frontend catalogue has no prices and the backend has no live product endpoint; seeder defaults are not treated as confirmed retail prices. No new images were generated for these product cards.

The second section continues with a Flora Edit row on the same grid, separated from the diptych by a narrow gutter. Its piece count is derived from the existing `PRODUCTS` catalogue rather than a fixed sample count. Two keyboard-accessible native disclosure hotspots expose collection information and working catalogue links. Each row reveals independently on scroll.

`public/images/flora-editorial.png` is generated campaign artwork, not an exact purchasable outfit. Built-in image generation prompt: continue the diptych's ivory khadi jacket, botanical oxblood embroidery and wooden buttons, worn by a single Indian woman with espresso trousers, full-length three-quarter pose on a pale studio ground, 4:5 portrait composition, no text or dots. The clickable dots are actual HTML controls.

`server/src/app.js` exposes only `/api/health`; all other routes return 404. Models exist for products, collections, orders, coupons and administrators. The seeder imports the frontend lookbook and assigns example category prices and variant stocks.

The frontend therefore continues to use the existing catalogue and enquiry flow. Cart is an explicitly empty preview; checkout is not enabled. No prices, stock, payments or successful orders are fabricated. Required next integrations are published product/collection reads, server-side price/stock/coupon validation, order creation and verified payment handling. Product options must follow `variants.size`, `priceDelta` and stock; orders also support custom measurements and shipping details.
