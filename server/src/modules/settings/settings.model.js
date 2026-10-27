import mongoose from "mongoose";
const page = new mongoose.Schema(
  {
    slug: String,
    title: String,
    body: String,
    published: { type: Boolean, default: true },
  },
  { _id: false },
);
const section = new mongoose.Schema(
  {
    title: String,
    body: String,
    image: String,
    href: String,
    enabled: { type: Boolean, default: true },
  },
  { _id: false },
);
const schema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "store" },
    demoMode: { type: Boolean, default: false },
    name: { type: String, default: "Rangvanaat" },
    description: {
      type: String,
      default: "Handcrafted khadi. Made to be lived in.",
    },
    logo: { type: String, default: "/images/logo-only.svg" },
    favicon: { type: String, default: "/images/logo-only.svg" },
    announcement: {
      type: String,
      default: "Thoughtfully made. Worn your way.",
    },
    heroTitle: { type: String, default: "A quieter kind of statement." },
    heroText: {
      type: String,
      default:
        "Discover handwoven textures, considered silhouettes and the artistry of Rangvanaat.",
    },
    heroVideo: {type:String,default:"https://res.cloudinary.com/dvsrgdyi7/video/upload/rangvanat-hero.mp4"},
    heroImage: {
      type: String,
      default: "/images/rangvanat-campaign-cutout.png",
    },
    contactEmail: { type: String, default: "" },
    phone: { type: String, default: "" },
    instagram: { type: String, default: "" },
    address: { type: String, default: "" },
    shippingFee: { type: Number, default: 500, min: 0 },
    freeShippingThreshold: { type: Number, default: 15000, min: 0 },
    deliveryDays: { type: Number, default: 7, min: 1 },
    serviceablePrefixes: { type: [String], default: [] },
    lowStockThreshold: { type: Number, default: 3, min: 0 },
    navigation: {
      type: [
        new mongoose.Schema({ label: String, href: String }, { _id: false }),
      ],
      default: [
        { label: "Shop all", href: "/products" },
        { label: "Our story", href: "/pages/about" },
        { label: "FAQ", href: "/pages/faq" },
        { label: "Contact", href: "/contact" },
      ],
    },
    sections: { type: [section], default: [] },
    pages: {
      type: [page],
      default: [
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
      ],
    },
  },
  { timestamps: true },
);
export const Settings = mongoose.model("Settings", schema);
export const getSettings = async () => ({
  ...new Settings().toObject(),
  ...(await Settings.findOne({ key: "store" }).lean()),
});
