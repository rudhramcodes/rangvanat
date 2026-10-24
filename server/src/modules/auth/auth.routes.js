import { Router } from "express";
import {randomBytes,createHash} from "node:crypto";
import {Resend} from "resend";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Customer } from "./customer.model.js";
import { Order } from "../orders/order.model.js";
import { env } from "../../config/env.js";
import { requireCustomer } from "../../middlewares/auth.js";
import { asyncRoute, fail, text, email, ok } from "../../utils/validate.js";
const router = Router();
const profile = (c) => ({
  id: c._id,
  name: c.name,
  email: c.email,
  phone: c.phone,
  addresses: c.addresses,
  wishlist: c.wishlist,
  emailVerified: Boolean(c.emailVerifiedAt),
});
const session = (c) => ({
  token: jwt.sign({ id: c._id, role: "customer", version:c.tokenVersion||0 }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  }),
  customer: profile(c),
});
router.post(
  "/register",
  asyncRoute(async (req, res) => {
    const name = text(req.body.name, 120),
      mail = text(req.body.email, 254).toLowerCase(),
      password = req.body.password;
    if (
      !name ||
      !email(mail) ||
      typeof password !== "string" ||
      password.length < 12 ||
      password.length > 72
    )
      fail("Enter a name, valid email and password of 12–72 characters");
    const c = await Customer.create({
      name,
      email: mail,
      phone: text(req.body.phone, 30),
      passwordHash: await bcrypt.hash(password, 12),
    });
    ok(res, session(c), 201);
  }),
);
router.post(
  "/login",
  asyncRoute(async (req, res) => {
    const c = await Customer.findOne({
      email: text(req.body.email, 254).toLowerCase(),
      isActive: true,
    });
    if (
      !c ||
      typeof req.body.password !== "string" ||
      !(await c.comparePassword(req.body.password))
    )
      fail("Invalid email or password", 401);
    ok(res, session(c));
  }),
);
router.get(
  "/me",
  requireCustomer,
  asyncRoute(async (req, res) => {
    const orders = await Order.find({ customerId: req.customer._id })
      .select("orderNumber financials fulfillment payment createdAt items")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    ok(res, { ...profile(req.customer), orders });
  }),
);
router.put(
  "/profile",
  requireCustomer,
  asyncRoute(async (req, res) => {
    if (text(req.body.name, 120)) req.customer.name = text(req.body.name, 120);
    if (typeof req.body.phone === "string")
      req.customer.phone = text(req.body.phone, 30);
    if('addresses' in req.body && (!Array.isArray(req.body.addresses)||req.body.addresses.length>10||req.body.addresses.some(a=>!a||!text(a.addressLine1,200)||!text(a.city,100)||!text(a.state,100)||! /^[1-9]\d{5}$/.test(a.pincode))))fail('Enter complete addresses with valid six-digit PIN codes (maximum 10)');
    if (Array.isArray(req.body.addresses) && req.body.addresses.length <= 10)
      req.customer.addresses = req.body.addresses.map((a) => ({
        name: text(a.name, 120),
        phone: text(a.phone, 30),
        addressLine1: text(a.addressLine1, 200),
        addressLine2: text(a.addressLine2, 200),
        city: text(a.city, 100),
        state: text(a.state, 100),
        pincode: text(a.pincode, 6),
        country: "India",
        isDefault: a.isDefault === true,
      }));
    if(Array.isArray(req.body.wishlist)) {
      if(req.body.wishlist.length>200 || req.body.wishlist.some(v=>typeof v!=='string'||v.length>150)) fail('Invalid wishlist');
      req.customer.wishlist=[...new Set(req.body.wishlist)];
    }
    await req.customer.save();
    ok(res, profile(req.customer));
  }),
);
const digest=value=>createHash('sha256').update(value).digest('hex');
async function sendAccountLink(c,kind) {
  if(!env.RESEND_API_KEY || !env.STORE_EMAIL) fail('Email service is not configured. Contact the studio.',503);
  const token=randomBytes(32).toString('hex');
  const prefix=kind==='reset'?'reset':'verification';
  c[prefix+'Hash']=digest(token);c[prefix+'Expires']=new Date(Date.now()+60*60*1000);await c.save();
  const link=`${env.FRONTEND_URL.split(',')[0]}/?page=security&action=${kind}#${token}`;
  const result=await new Resend(env.RESEND_API_KEY).emails.send({from:env.STORE_EMAIL,to:c.email,subject:kind==='reset'?'Reset your Rangvanaat password':'Verify your Rangvanaat email',text:`Open this private link within one hour: ${link}`});
  if(result.error)fail('Unable to send email. Please try again.',503);
}
router.post('/password/reset-request',asyncRoute(async(req,res)=>{
  if(!env.RESEND_API_KEY || !env.STORE_EMAIL)fail('Email service is not configured. Contact the studio.',503);
  const c=await Customer.findOne({email:text(req.body.email,254).toLowerCase(),isActive:true});if(c)await sendAccountLink(c,'reset');ok(res,{message:'If this account exists, a reset email has been sent.'});
}));
router.post('/password/reset',asyncRoute(async(req,res)=>{
  const password=req.body.password,token=text(req.body.token,100);
  if(!/^[a-f0-9]{64}$/.test(token)||typeof password!=='string'||password.length<12||password.length>72)fail('Use a valid reset link and a password of 12–72 characters');
  const c=await Customer.findOneAndUpdate({resetHash:digest(token),resetExpires:{$gt:new Date()},isActive:true},{$set:{passwordHash:await bcrypt.hash(password,12)},$inc:{tokenVersion:1},$unset:{resetHash:1,resetExpires:1}},{new:true});
  if(!c)fail('Reset link is invalid or expired',400);ok(res,{message:'Password reset. You can sign in now.'});
}));
router.post('/password/change',requireCustomer,asyncRoute(async(req,res)=>{
 const c=await Customer.findById(req.customer._id);const p=req.body.password;
 if(typeof req.body.currentPassword!=='string'||!await c.comparePassword(req.body.currentPassword))fail('Current password is incorrect',400);
 if(typeof p!=='string'||p.length<12||p.length>72)fail('Use 12–72 characters');c.passwordHash=await bcrypt.hash(p,12);c.tokenVersion=(c.tokenVersion||0)+1;c.resetHash=undefined;c.resetExpires=undefined;await c.save();ok(res,{message:'Password changed'});
}));
router.post('/email/request',requireCustomer,asyncRoute(async(req,res)=>{await sendAccountLink(req.customer,'verify');ok(res,{message:'Verification email sent'});}));
router.post('/email/verify',asyncRoute(async(req,res)=>{
 const token=text(req.body.token,100);if(!/^[a-f0-9]{64}$/.test(token))fail('Invalid verification link');
 const c=await Customer.findOneAndUpdate({verificationHash:digest(token),verificationExpires:{$gt:new Date()},isActive:true},{$set:{emailVerifiedAt:new Date()},$unset:{verificationHash:1,verificationExpires:1}},{new:true});if(!c)fail('Verification link is invalid or expired');ok(res,{message:'Email verified'});
}));
export default router;
