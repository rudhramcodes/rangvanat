const LEGACY_PAGES = [
        {slug:'terms',title:'Terms',body:'Contact the studio for order terms, custom sizing and cancellation assistance before confirming your request.'},
        {
          slug: "about",
          title: "Our story",
          body: "Rangvanaat brings considered silhouettes and handcrafted textiles together. Discover the people and processes behind each piece.",
        },
        {
          slug: "faq",
          title: "Frequently asked questions",
          body: "For sizing, custom measurements and order assistance, please contact our studio. Care instructions and making times are listed on each product.",
        },
        {
          slug: "shipping",
          title: "Shipping",
          body: "Delivery availability and estimates are shown at checkout. Making time varies by piece.",
        },
        {
          slug: "returns",
          title: "Returns & exchanges",
          body: "Please contact the studio for return and exchange assistance before sending an item back.",
        },
        {
          slug: "privacy",
          title: "Privacy",
          body: "We use your contact and delivery details to process your order and respond to enquiries. Contact the studio for questions about your data.",
        },
      ];

export const CONTENT_PAGES = [
  {slug:'about',title:'Our story',body:`Rangvanat is a clothing and textile studio rooted in Bardoli, Gujarat. Our work brings the character of Khadi and handcrafted textiles into pieces made for everyday life.
## Cloth comes first
Texture, colour and the way a fabric falls guide our collections. We work with the qualities of the cloth, allowing its character to shape the silhouette rather than hiding it behind unnecessary detail.
## A considered wardrobe
Explore designer fabrics, sarees, jackets, dresses and coordinated pieces. Each product page is the place to check the fabric, finish, available sizes and what is included with your purchase.
## The character of handmade textiles
Handcrafted cloth can carry small variations in weave, texture and colour. These details give each piece its individual character. Product-specific composition and care instructions matter: not every fabric or finish should be treated in the same way.
## Finding your piece
Choose something for the way you live and the way you like to dress. If you need help with fit, fabric or a custom-size option, contact the studio before ordering. We want you to understand your piece before it becomes part of your wardrobe.`},
  {slug:'faq',title:'Frequently asked questions',body:`A guide to choosing your piece, placing an order and following its progress. For questions specific to a product, contact the studio with its name or product code.
## How do I choose a size?
Check the measurements and fit information on the product page. Compare them with your own measurements, noting whether the chart describes the body or the finished garment. If a measurement is missing or you are between sizes, ask the studio before ordering.
## Can I request a custom size?
Where a product offers a Custom option, add your measurements and fitting notes before placing the order. Custom availability and making time depend on the piece. Confirm any special requirements with the studio first.
## What is included in a product?
Check the product description for the number of pieces, fabric details and selling unit. Styling accessories in photographs may not be included. For unstitched fabric, confirm the width and length before purchasing.
## Which payment methods are available?
Use the methods currently enabled at checkout. Online payment setup is still pending. Cash on Delivery orders remain unpaid until payment is collected; an order confirmation is not a payment receipt. When demo mode is enabled, orders cannot be placed.
## How can I track my order?
Open Track Order and use your order number with your private order access key, or sign into the account used for the purchase. Keep the access key private. Courier and tracking details appear once the studio records dispatch.
## Why did my checkout expire?
Unconfirmed checkout requests reserve stock for 30 minutes. After expiry, the reservation is released. Start a new checkout to check current availability. Confirmed Cash on Delivery orders do not expire under this rule.
## Can I change, cancel or return an order?
Contact the studio with your order number and the change you need. Confirm the applicable cancellation, return or exchange terms before ordering, especially for custom pieces. Do not send a parcel back without return instructions.
## How should I care for my piece?
Follow the care label and product-specific instructions. If they are unclear, ask before washing, ironing or dry cleaning. Different fibres, dyes, embroidery and finishes can require different care.`},
];

// Replace only the original starter copy; preserve client edits and publication settings.
export function resolveContentPages(pages) {
  return (pages || LEGACY_PAGES).map(page => {
    const replacement = CONTENT_PAGES.find(p => p.slug === page.slug);
    const original = LEGACY_PAGES.find(p => p.slug === page.slug);
    return replacement && page.body === original?.body ? {...page, body:replacement.body} : page;
  });
}